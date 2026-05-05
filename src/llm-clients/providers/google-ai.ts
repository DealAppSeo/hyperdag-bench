import { LLMClient } from '../types';

export class GoogleAIAdapter implements LLMClient {
    async chat(args: any) {
        if (!process.env.GOOGLE_AI_API_KEY) throw new Error("GOOGLE_AI_API_KEY missing");
        const start = Date.now();
        // Uses the Gemini API REST endpoint as a compatible shim, or use Google's specific REST
        // The prompt says "Google AI Studio adapter". Using gemini-1.5-flash.
        const model = args.model || 'gemini-1.5-flash';
        
        // Convert messages to Gemini format
        const contents = args.messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    maxOutputTokens: args.max_tokens,
                    temperature: args.temperature
                }
            })
        });
        if (!res.ok) {
            const err = new Error(`Google AI error ${res.status}`);
            (err as any).status = res.status;
            throw err;
        }
        const data = await res.json();
        return {
            content: data.candidates[0].content.parts[0].text,
            usage: { input_tokens: data.usageMetadata?.promptTokenCount || 0, output_tokens: data.usageMetadata?.candidatesTokenCount || 0 },
            provider: 'google-ai',
            model: model,
            latency_ms: Date.now() - start
        };
    }
}
