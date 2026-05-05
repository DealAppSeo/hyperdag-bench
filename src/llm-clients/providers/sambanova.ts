import { LLMClient } from '../types';

export class SambaNovaAdapter implements LLMClient {
    async chat(args: any) {
        if (!process.env.SAMBANOVA_API_KEY) throw new Error("SAMBANOVA_API_KEY missing");
        const start = Date.now();
        const res = await fetch('https://api.sambanova.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: args.model || 'Meta-Llama-3-8B-Instruct',
                messages: args.messages,
                max_tokens: args.max_tokens,
                temperature: args.temperature
            })
        });
        if (!res.ok) {
            const err = new Error(`SambaNova error ${res.status}`);
            (err as any).status = res.status;
            throw err;
        }
        const data = await res.json();
        return {
            content: data.choices[0].message.content,
            usage: { input_tokens: data.usage?.prompt_tokens || 0, output_tokens: data.usage?.completion_tokens || 0 },
            provider: 'sambanova',
            model: data.model,
            latency_ms: Date.now() - start
        };
    }
}
