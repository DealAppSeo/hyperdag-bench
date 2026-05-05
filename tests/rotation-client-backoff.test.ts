import { RotationClient } from '../src/llm-clients/rotation-client';
import { LLMClient } from '../src/llm-clients/types';

class MockFailingProvider implements LLMClient {
    public attempts = 0;
    private maxFailures: number;
    
    constructor(maxFailures: number) {
        this.maxFailures = maxFailures;
    }

    async chat(args: any) {
        this.attempts++;
        if (this.attempts <= this.maxFailures) {
            const error: any = new Error("Mock 429 rate limit");
            error.status = 429;
            throw error;
        }
        return {
            content: "Success after failures",
            usage: { input_tokens: 10, output_tokens: 10 },
            provider: "MockFailingProvider",
            model: "mock-model",
            latency_ms: 100
        };
    }
}

class MockFallbackProvider implements LLMClient {
    public called = false;
    async chat(args: any) {
        this.called = true;
        return {
            content: "Fallback success",
            usage: { input_tokens: 10, output_tokens: 10 },
            provider: "MockFallbackProvider",
            model: "mock-model-fallback",
            latency_ms: 50
        };
    }
}

async function runTests() {
    console.log("Running test 1: Success after 2 transient failures (no failover)");
    const provider1 = new MockFailingProvider(2);
    const fallback1 = new MockFallbackProvider();
    
    const client1 = new RotationClient([provider1, fallback1], { concurrency: 1 });
    const start1 = Date.now();
    await client1.chat({ messages: [] } as any);
    const timeTaken1 = Date.now() - start1;
    
    if (provider1.attempts !== 3) {
        throw new Error(`Test 1 Failed: Expected 3 attempts on provider1, got ${provider1.attempts}`);
    }
    if (fallback1.called) {
        throw new Error(`Test 1 Failed: Fallback should not have been called`);
    }
    // Should have backed off ~1s + ~2s = ~3s
    if (timeTaken1 < 2500) {
        throw new Error(`Test 1 Failed: Expected to wait at least ~3000ms, took ${timeTaken1}ms`);
    }
    console.log("Test 1 passed!");

    console.log("\nRunning test 2: Failover after 4 attempts (exhausted retries)");
    const provider2 = new MockFailingProvider(5); // Fails 5 times, which is > maxAttempts (4)
    const fallback2 = new MockFallbackProvider();
    
    const client2 = new RotationClient([provider2, fallback2], { concurrency: 1 });
    const start2 = Date.now();
    await client2.chat({ messages: [] } as any);
    const timeTaken2 = Date.now() - start2;
    
    if (provider2.attempts !== 4) {
        throw new Error(`Test 2 Failed: Expected exactly 4 attempts on provider2, got ${provider2.attempts}`);
    }
    if (!fallback2.called) {
        throw new Error(`Test 2 Failed: Fallback should have been called`);
    }
    // Should have backed off ~1s + ~2s + ~4s = ~7s
    if (timeTaken2 < 6500) {
        throw new Error(`Test 2 Failed: Expected to wait at least ~7000ms, took ${timeTaken2}ms`);
    }
    console.log("Test 2 passed!");
    
    console.log("\nAll tests passed!");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
