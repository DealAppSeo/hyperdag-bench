import { LLMClient } from './types';
import { RateLimitTracker } from './rate-limit-tracker';
import pLimit from 'p-limit';

export interface RotationClientOptions {
    isDryRun?: boolean;
    concurrency?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RotationClient implements LLMClient {
    private providers: LLMClient[];
    private tracker: RateLimitTracker;
    private isDryRun: boolean;
    private limit: ReturnType<typeof pLimit>;

    constructor(providers: LLMClient[], options: RotationClientOptions | boolean = false) {
        this.providers = providers;
        this.tracker = new RateLimitTracker();
        
        // Backward compatibility for old boolean signature
        if (typeof options === 'boolean') {
            this.isDryRun = options;
            this.limit = pLimit(3);
        } else {
            this.isDryRun = options.isDryRun || false;
            this.limit = pLimit(options.concurrency || 3);
        }
    }

    async chat(args: Parameters<LLMClient['chat']>[0]): ReturnType<LLMClient['chat']> {
        return this.limit(async () => {
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
                const maxAttempts = 4; // 1 initial + 3 retries
                const delays = [1000, 2000, 4000];

                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    if (!this.tracker.isAvailable(providerName)) {
                        break; // Move to next provider
                    }

                    try {
                        const response = await provider.chat(args);
                        console.log(`[RotationClient] Served by ${response.provider} (${response.model}) in ${response.latency_ms}ms.`);
                        return response;
                    } catch (error: any) {
                        const isTransient = error.status === 429 || error.status >= 500 || 
                                            error.message?.includes('429') || error.message?.includes('rate');
                        
                        if (isTransient) {
                            if (attempt < maxAttempts) {
                                const delayMs = delays[attempt - 1];
                                console.warn(`[RotationClient] ${providerName} transient error: ${error.message}. Retry attempt ${attempt} in ${delayMs}ms`);
                                await sleep(delayMs);
                                continue;
                            } else {
                                this.tracker.markRateLimited(providerName, 60);
                                break; // Exhausted retries, move to next provider
                            }
                        } else {
                            console.warn(`[RotationClient] ${providerName} failed with non-transient error: ${error.message}`);
                            break; // Move to next provider
                        }
                    }
                }
            }

            throw new Error("All LLM providers are exhausted or rate-limited.");
        });
    }
}
