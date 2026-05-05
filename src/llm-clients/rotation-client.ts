import { LLMClient } from './types';
import { RateLimitTracker } from './rate-limit-tracker';
import pLimit from 'p-limit';

export interface RotationClientOptions {
    isDryRun?: boolean;
    concurrency?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface RotationResult {
    status: 'SUCCESS' | 'RATE_LIMITED' | 'RATE_LIMITED_EXHAUSTED' | 'PROVIDER_ERROR' | 'CONTENT_FILTERED';
    content?: string;
    usage?: any;
    provider?: string;
    model?: string;
    latency_ms?: number;
    failure_reason?: string;
    providers_attempted: string[];
}

export class RotationClient {
    private providers: LLMClient[];
    private tracker: RateLimitTracker;
    private isDryRun: boolean;
    private limit: ReturnType<typeof pLimit>;

    constructor(providers: LLMClient[], options: RotationClientOptions | boolean = false) {
        this.providers = providers;
        this.tracker = new RateLimitTracker();
        
        if (typeof options === 'boolean') {
            this.isDryRun = options;
            this.limit = pLimit(3);
        } else {
            this.isDryRun = options.isDryRun || false;
            this.limit = pLimit(options.concurrency || 3);
        }
    }

    async generate(args: Parameters<LLMClient['chat']>[0]): Promise<RotationResult> {
        return this.limit(async () => {
            if (this.isDryRun) {
                return {
                    status: 'SUCCESS',
                    content: "This is a dry-run mock response.",
                    usage: { input_tokens: 10, output_tokens: 10 },
                    provider: "dry-run",
                    model: "mock-model",
                    latency_ms: 10,
                    providers_attempted: ['dry-run']
                };
            }

            const providers_attempted: string[] = [];
            let lastErrorMsg = '';

            for (const provider of this.providers) {
                const providerName = provider.constructor.name;
                providers_attempted.push(providerName);
                const maxAttempts = 4; // 1 initial + 3 retries
                const delays = [2000, 4000, 8000];

                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    if (!this.tracker.isAvailable(providerName)) {
                        break; // Move to next provider
                    }

                    try {
                        const response = await provider.chat(args);
                        console.log(`[RotationClient] Served by ${response.provider} (${response.model}) in ${response.latency_ms}ms.`);
                        return {
                            status: 'SUCCESS',
                            content: response.content,
                            usage: response.usage,
                            provider: response.provider,
                            model: response.model,
                            latency_ms: response.latency_ms,
                            providers_attempted
                        };
                    } catch (error: any) {
                        lastErrorMsg = error.message;
                        const isTransient = error.status === 429 || error.status >= 500 || 
                                            error.message?.includes('429') || error.message?.includes('rate');
                        
                        if (error.message?.toLowerCase().includes('filter')) {
                            return {
                                status: 'CONTENT_FILTERED',
                                failure_reason: error.message,
                                providers_attempted
                            };
                        }

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

            return {
                status: lastErrorMsg.includes('429') || lastErrorMsg.includes('rate') ? 'RATE_LIMITED_EXHAUSTED' : 'PROVIDER_ERROR',
                failure_reason: `ALL_PROVIDERS_ERROR: ${lastErrorMsg}`,
                providers_attempted
            };
        });
    }
}
