import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import fs from 'fs';

export interface HALResult {
    harm_probability: number;
    epistemic_uncertainty: number;
    evidence_quality: number;
    scope_appropriateness: number;
    certainty_at_claim: number;
    agreement_score: number;
    hal_score: number;
    vetoed: boolean;
    comma_veto: boolean;
    comma_gap: number;
    formula: string;
}

export interface IHALClient {
    evaluate(prompt: string, output: string, context?: any): Promise<HALResult>;
}

// ---------------------------------------------------------
// 1. Mock HAL Implementation (from Phase 1)
// ---------------------------------------------------------
class MockHALClient implements IHALClient {
    private anthropic: Anthropic;
    private pythagoreanComma = 531441 / 524288; // 1.013643...

    constructor(anthropicKey?: string) {
        this.anthropic = new Anthropic({ apiKey: anthropicKey || process.env.ANTHROPIC_API_KEY || 'mock' });
    }

    async evaluate(prompt: string, output: string, context: any = {}): Promise<HALResult> {
        let evidence_quality = 0.8;
        let epistemic_uncertainty = 0.2;
        let certainty_at_claim = 0.9;
        
        const lowerOutput = output.toLowerCase();
        if (lowerOutput.includes('paris is the capital of germany') || lowerOutput.includes('berlin')) {
            evidence_quality = 0.2;
            epistemic_uncertainty = 0.9;
            certainty_at_claim = 0.9;
        } else if (lowerOutput.includes('approximately') || lowerOutput.includes('estimated')) {
            evidence_quality = 0.6;
            epistemic_uncertainty = 0.5;
            certainty_at_claim = 0.4;
        } else if (lowerOutput.includes('4') && prompt.includes('2+2')) {
            evidence_quality = 0.99;
            epistemic_uncertainty = 0.01;
            certainty_at_claim = 0.99;
        } else {
            evidence_quality = 0.5 + Math.random() * 0.4;
            epistemic_uncertainty = Math.random() * 0.5;
            certainty_at_claim = 0.6 + Math.random() * 0.4;
        }

        const agreement_score = context.n_llms && context.n_llms > 1 ? 
            (evidence_quality + 0.1 * context.n_llms) / (1 + 0.1 * context.n_llms) : evidence_quality;

        const comma_gap = (certainty_at_claim + epistemic_uncertainty) / (evidence_quality + 0.0001);
        const threshold = context.threshold || this.pythagoreanComma;
        const comma_veto = comma_gap > threshold;

        return {
            harm_probability: 0.05,
            epistemic_uncertainty,
            evidence_quality,
            scope_appropriateness: 0.9,
            certainty_at_claim,
            agreement_score,
            hal_score: agreement_score * 100,
            vetoed: comma_veto,
            comma_veto,
            comma_gap,
            formula: 'mock-heuristic-ratio'
        };
    }
}

// ---------------------------------------------------------
// 2. Real HAL Implementation (Adapter for CC1 Extraction)
// ---------------------------------------------------------
class RealHALClient implements IHALClient {
    private realHalModule: any = null;

    constructor() {
        const halPath = path.resolve(__dirname, '../../repid-engine/src/hal/lib/index.ts');
        if (fs.existsSync(halPath)) {
            try {
                this.realHalModule = require(halPath);
                console.log(`[HAL Adapter] Successfully loaded real HAL from ${halPath}`);
            } catch (e: any) {
                console.error(`[HAL Adapter] Failed to require real HAL: ${e.message}`);
            }
        } else {
            console.warn(`[HAL Adapter] Real HAL not found at ${halPath}. Ensure CC1 extraction is complete.`);
        }
    }

    async evaluate(prompt: string, output: string, context: any = {}): Promise<HALResult> {
        if (!this.realHalModule || typeof this.realHalModule.evaluate !== 'function') {
            throw new Error("Real HAL implementation is not available or does not export an evaluate() function.");
        }
        
        const fullContext = { prompt, ...context };
        
        if (!fullContext.providers) {
            fullContext.providers = [];
            if (process.env.GROQ_API_KEY) {
                fullContext.providers.push({ provider: 'groq', model: 'llama-3.3-70b-versatile', endpoint: 'https://api.groq.com/openai/v1/chat/completions', apiKey: process.env.GROQ_API_KEY, callType: 'openai-compat' });
            }
            if (process.env.CEREBRAS_API_KEY) {
                fullContext.providers.push({ provider: 'cerebras', model: 'llama3.1-8b', endpoint: 'https://api.cerebras.ai/v1/chat/completions', apiKey: process.env.CEREBRAS_API_KEY, callType: 'openai-compat' });
            }
            if (process.env.DEEPSEEK_API_KEY) {
                fullContext.providers.push({ provider: 'deepseek', model: 'deepseek-chat', endpoint: 'https://api.deepseek.com/v1/chat/completions', apiKey: process.env.DEEPSEEK_API_KEY, callType: 'openai-compat' });
            }
        }
        
        if (!fullContext.classifierProvider && process.env.GROQ_API_KEY) {
            fullContext.classifierProvider = { provider: 'groq', model: 'llama-3.1-8b-instant', endpoint: 'https://api.groq.com/openai/v1/chat/completions', apiKey: process.env.GROQ_API_KEY, callType: 'openai-compat' };
        }
        
        if (!fullContext.embeddingClient) {
            const { createDefaultEmbeddingClient } = require(path.resolve(__dirname, '../../repid-engine/src/hal/lib/cross-llm/embedding-client.ts'));
            fullContext.embeddingClient = createDefaultEmbeddingClient(process.env.VOYAGE_API_KEY, process.env.VOYAGE_API_KEY ? 'voyage' : undefined);
        }

        const result = await this.realHalModule.evaluate(prompt, output, fullContext);
        return result;
    }
}

// ---------------------------------------------------------
// 3. HAL Adapter Factory
// ---------------------------------------------------------
export class HALClient implements IHALClient {
    private client: IHALClient;
    public mode: string;

    constructor() {
        this.mode = process.env.HAL_MODE || 'mock';
        if (this.mode === 'real') {
            console.log("[HAL Client] Initializing REAL HAL Mode...");
            this.client = new RealHALClient();
        } else {
            console.log("[HAL Client] Initializing MOCK HAL Mode...");
            this.client = new MockHALClient();
        }
    }

    async evaluate(prompt: string, output: string, context: any = {}): Promise<HALResult> {
        return this.client.evaluate(prompt, output, context);
    }
}
