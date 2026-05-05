import fs from 'fs';
import path from 'path';
import { HALClient } from '../hal-client';
import { CerebrasAdapter } from '../llm-clients/providers/cerebras';
import { ThresholdSweepsWriter } from '../persistence/threshold-sweeps-writer';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

async function run() {
    const args = process.argv.slice(2);
    const commaArg = args.find(a => a.startsWith('--comma-override='));
    const commaVal = commaArg ? parseFloat(commaArg.split('=')[1]) : 1.013643;

    const payload = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/internal-prompts/hal-test-prompts-2026-05-04.json'), 'utf8'));
    let prompts = payload.prompts;

    const llm = new CerebrasAdapter();
    const hal = new HALClient();
    const writer = new ThresholdSweepsWriter();

    const runId = Date.now().toString();

    console.log(`Starting Ablation Runner (Comma: ${commaVal}) for ${prompts.length} prompts.`);
    let qIdx = 0;
    
    for (const item of prompts) {
        qIdx++;
        console.log(`[${qIdx}/${prompts.length}] Q (${item.prompt_id}) @ threshold ${commaVal}`);
        let answer = '';
        try {
            const llmStart = Date.now();
            const llmRes = await llm.chat({ messages: [{ role: 'user', content: item.prompt_text }], max_tokens: 50 });
            answer = llmRes.content;
            const llmLatency = Date.now() - llmStart;
            
            const halStart = Date.now();
            const halRes = await hal.evaluate(item.prompt_text, answer, { strictness: 3 });
            const halLatency = Date.now() - halStart;
            
            await writer.write({
                run_id: runId,
                prompt_id: item.prompt_id,
                threshold_value: commaVal,
                hal_vetoed: halRes.vetoed,
                comma_gap: halRes.comma_gap || null,
                hal_score: halRes.hal_score || null,
                signals: (halRes as any).signals || {},
                gen_provider: 'cerebras',
                gen_model: 'llama3.1-8b',
                latency_ms: llmLatency + halLatency,
            } as any);
        } catch (e: any) {
            console.error(`LLM failed: ${e.message}`);
            if (e.message.includes('429')) {
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
}

run().catch(console.error);
