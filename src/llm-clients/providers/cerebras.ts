import { LLMClient } from '../types';

export class CerebrasAdapter implements LLMClient {
    async chat(args: any) {
        if (!process.env.CEREBRAS_API_KEY) throw new Error("CEREBRAS_API_KEY missing");
        const start = Date.now();
        const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: args.model || 'llama3.1-8b',
                messages: args.messages,
                max_tokens: args.max_tokens,
                temperature: args.temperature
            })
        });
        if (!res.ok) {
            const err = new Error(`Cerebras error ${res.status}`);
            (err as any).status = res.status;
            throw err;
        }
        const data = await res.json();
        return {
            content: data.choices[0].message.content,
            usage: { input_tokens: data.usage.prompt_tokens, output_tokens: data.usage.completion_tokens },
            provider: 'cerebras',
            model: data.model,
            latency_ms: Date.now() - start
        };
    }
}
