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
    const res1 = await client1.generate({ messages: [] } as any);
    const timeTaken1 = Date.now() - start1;
    
    if (provider1.attempts !== 3) {
        throw new Error(`Test 1 Failed: Expected 3 attempts on provider1, got ${provider1.attempts}`);
    }
    if (fallback1.called) {
        throw new Error(`Test 1 Failed: Fallback should not have been called`);
    }
    if (res1.status !== 'SUCCESS') {
        throw new Error(`Test 1 Failed: Expected SUCCESS, got ${res1.status}`);
    }
    // Should have backed off ~2s + ~4s = ~6s
    if (timeTaken1 < 5500) {
        throw new Error(`Test 1 Failed: Expected to wait at least ~6000ms, took ${timeTaken1}ms`);
    }
    console.log("Test 1 passed!");

    console.log("\nRunning test 2: Failover after 4 attempts (exhausted retries)");
    const provider2 = new MockFailingProvider(5); // Fails 5 times, which is > maxAttempts (4)
    const fallback2 = new MockFallbackProvider();
    
    const client2 = new RotationClient([provider2, fallback2], { concurrency: 1 });
    const start2 = Date.now();
    const res2 = await client2.generate({ messages: [] } as any);
    const timeTaken2 = Date.now() - start2;
    
    if (provider2.attempts !== 4) {
        throw new Error(`Test 2 Failed: Expected exactly 4 attempts on provider2, got ${provider2.attempts}`);
    }
    if (!fallback2.called) {
        throw new Error(`Test 2 Failed: Fallback should have been called`);
    }
    if (res2.status !== 'SUCCESS') {
        throw new Error(`Test 2 Failed: Expected SUCCESS, got ${res2.status}`);
    }
    if (res2.providers_attempted.length !== 2) {
        throw new Error(`Test 2 Failed: Expected 2 providers attempted`);
    }
    // Should have backed off ~2s + ~4s + ~8s = ~14s
    if (timeTaken2 < 13000) {
        throw new Error(`Test 2 Failed: Expected to wait at least ~14000ms, took ${timeTaken2}ms`);
    }
    console.log("Test 2 passed!");

    console.log("\nRunning test 3: All fail");
    const provider3 = new MockFailingProvider(5);
    const fallback3 = new MockFailingProvider(5);
    const client3 = new RotationClient([provider3, fallback3], { concurrency: 1 });
    const res3 = await client3.generate({ messages: [] } as any);
    if (res3.status !== 'RATE_LIMITED_EXHAUSTED') {
        throw new Error(`Test 3 Failed: Expected RATE_LIMITED_EXHAUSTED, got ${res3.status}`);
    }
    console.log("Test 3 passed!");
    
    console.log("\nAll tests passed!");
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
