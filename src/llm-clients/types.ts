export interface LLMClient {
  chat(args: {
    messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>,
    model?: string,
    temperature?: number,
    max_tokens?: number,
  }): Promise<{
    content: string, 
    usage: {input_tokens: number, output_tokens: number}, 
    provider: string, 
    model: string, 
    latency_ms: number
  }>
}
