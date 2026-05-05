import { LLMClient } from './types';
import { RateLimitTracker } from './rate-limit-tracker';

export class RotationClient implements LLMClient {
    private providers: LLMClient[];
    private tracker: RateLimitTracker;
    private isDryRun: boolean;

    constructor(providers: LLMClient[], isDryRun: boolean = false) {
        this.providers = providers;
        this.tracker = new RateLimitTracker();
        this.isDryRun = isDryRun;
    }

    async chat(args: Parameters<LLMClient['chat']>[0]): ReturnType<LLMClient['chat']> {
        if (this.isDryRun) {
            return {
                content: "This is a dry-run mock response.",
                usage: { input_tokens: 10, output_tokens: 10 },
                provider: "dry-run",
                model: "mock-model",
                latency_ms: 10
            };
        }

        for (const provider of this.providers) {
            const providerName = provider.constructor.name;
            if (!this.tracker.isAvailable(providerName)) {
                continue;
            }

            try {
                // Return on first success
                const response = await provider.chat(args);
                console.log(`[RotationClient] Served by ${response.provider} (${response.model}) in ${response.latency_ms}ms.`);
                return response;
            } catch (error: any) {
                // Check if it's a rate limit error (429 usually)
                if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate')) {
                    this.tracker.markRateLimited(providerName, 60); // 1 min cool off
                } else {
                    console.warn(`[RotationClient] ${providerName} failed with transient error: ${error.message}`);
                }
            }
        }

        throw new Error("All LLM providers are exhausted or rate-limited.");
    }
}
