import { 
    RotationClient, 
    CerebrasAdapter, 
    GroqAdapter, 
    GoogleAIAdapter, 
    MistralAdapter, 
    SambaNovaAdapter, 
    AnthropicAdapter 
} from '../src/llm-clients';

import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

async function run() {
    console.log("Testing Rotation Client...");

    // Create adapters. We try free-tier ones first.
    const providers = [
        new CerebrasAdapter(),
        new GroqAdapter(),
        new GoogleAIAdapter(),
        new MistralAdapter(),
        new SambaNovaAdapter(),
        new AnthropicAdapter()
    ];

    const rotator = new RotationClient(providers, false);

    console.log("Sending 5 requests to verify rotation logic...");
    for (let i = 0; i < 5; i++) {
        try {
            const res = await rotator.chat({
                messages: [{ role: 'user', content: `Test request ${i + 1}. Reply 'OK' if you get this.` }],
                max_tokens: 10
            });
            console.log(`Req ${i+1} succeeded via ${res.provider}. Usage:`, res.usage);
        } catch (err: any) {
            console.error(`Req ${i+1} failed completely. None of the providers succeeded.`, err.message);
        }
    }
}

run().catch(console.error);
