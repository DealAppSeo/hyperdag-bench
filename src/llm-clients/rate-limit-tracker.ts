export class RateLimitTracker {
    private providerTimeouts: Map<string, number> = new Map();

    public markRateLimited(provider: string, retryAfterSeconds: number = 60) {
        this.providerTimeouts.set(provider, Date.now() + (retryAfterSeconds * 1000));
        console.warn(`[RateLimitTracker] ${provider} is rate-limited. Skipping for ${retryAfterSeconds}s.`);
    }

    public isAvailable(provider: string): boolean {
        if (!this.providerTimeouts.has(provider)) return true;
        const availableAt = this.providerTimeouts.get(provider)!;
        if (Date.now() >= availableAt) {
            this.providerTimeouts.delete(provider);
            return true;
        }
        return false;
    }
}
