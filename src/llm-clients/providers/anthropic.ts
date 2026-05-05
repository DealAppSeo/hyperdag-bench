import { LLMClient } from '../types';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicAdapter implements LLMClient {
    private anthropic: Anthropic;
    constructor() {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    }
    
    async chat(args: any) {
        if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");
        const start = Date.now();
        // Convert 'system' role messages to top-level system parameter if needed,
        // For simplicity, handle basic user/assistant:
        const messages = args.messages.filter((m: any) => m.role !== 'system');
        const systemMsg = args.messages.find((m: any) => m.role === 'system')?.content;

        const res = await this.anthropic.messages.create({
            model: args.model || 'claude-haiku-4-5-20251001',
            messages: messages,
            max_tokens: args.max_tokens || 1024,
            temperature: args.temperature,
            system: systemMsg
        });

        return {
            content: res.content[0].type === 'text' ? res.content[0].text : '',
            usage: { input_tokens: res.usage.input_tokens, output_tokens: res.usage.output_tokens },
            provider: 'anthropic',
            model: res.model,
            latency_ms: Date.now() - start
        };
    }
}
