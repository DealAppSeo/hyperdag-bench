import { LLMClient } from '../types';

export class GroqAdapter implements LLMClient {
    async chat(args: any) {
        if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
        const start = Date.now();
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: args.model || 'llama-3.3-70b-versatile',
                messages: args.messages,
                max_tokens: args.max_tokens,
                temperature: args.temperature
            })
        });
        if (!res.ok) {
            const err = new Error(`Groq error ${res.status}`);
            (err as any).status = res.status;
            throw err;
        }
        const data = await res.json();
        return {
            content: data.choices[0].message.content,
            usage: { input_tokens: data.usage?.prompt_tokens || 0, output_tokens: data.usage?.completion_tokens || 0 },
            provider: 'groq',
            model: data.model,
            latency_ms: Date.now() - start
        };
    }
}
