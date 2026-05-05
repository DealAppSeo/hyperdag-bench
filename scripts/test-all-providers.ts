import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

import { GroqAdapter, GoogleAIAdapter, MistralAdapter, SambaNovaAdapter, AnthropicAdapter } from '../src/llm-clients';

async function run() {
    const providers: any = {
        'Groq': new GroqAdapter(),
        'GoogleAI': new GoogleAIAdapter(),
        'Mistral': new MistralAdapter(),
        'SambaNova': new SambaNovaAdapter(),
        'Anthropic': new AnthropicAdapter()
    };

    console.log("Testing Free-Tier Providers Individually...\n");

    const messages = [{ role: 'user', content: 'In one short sentence, what is the capital of Japan?' }];

    for (const [name, adapter] of Object.entries(providers)) {
        console.log(`\n--- Testing ${name} ---`);
        try {
            const start = Date.now();
            const res = await (adapter as any).chat({ messages, max_tokens: 50 });
            console.log(`[SUCCESS] Provider: ${res.provider}, Model: ${res.model}`);
            console.log(`[LATENCY] ${res.latency_ms} ms`);
            console.log(`[RESPONSE] ${res.content}`);
            console.log(`[USAGE] Input: ${res.usage.input_tokens}, Output: ${res.usage.output_tokens}`);
        } catch (e: any) {
            console.log(`[FAILURE] ${e.message}`);
        }
    }
}

run().catch(console.error);
