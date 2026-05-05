import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });
import { GroqAdapter, AnthropicAdapter } from '../src/llm-clients';

async function run() {
    const providers = [
        { name: 'Groq', adapter: new GroqAdapter() },
        { name: 'Anthropic', adapter: new AnthropicAdapter() }
    ];

    for (const {name, adapter} of providers) {
        try {
            const start = Date.now();
            const res = await (adapter as any).chat({ 
                messages: [{ role: 'user', content: 'Say OK' }], 
                max_tokens: 10 
            });
            console.log(`[SUCCESS] ${name}: ${res.model} in ${res.latency_ms}ms. Response: ${res.content}`);
        } catch (e: any) {
            console.log(`[FAILURE] ${name}: ${e.message}`);
        }
    }
}
run().catch(console.error);
