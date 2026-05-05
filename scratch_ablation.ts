import { ThresholdSweepsWriter } from './src/persistence/threshold-sweeps-writer';
import { HALClient } from './src/hal-client';
import fs from 'fs';
import path from 'path';

// Load prompts
const testData = JSON.parse(fs.readFileSync('./datasets/hal-test-prompts-2026-05-04.json', 'utf8'));
const prompts = testData.prompts; // 26 prompts

const thresholds = [0.5, 0.7, 0.9, 1.0, 1.013643, 1.05, 1.10];
const constantsPath = path.resolve(__dirname, '../repid-engine/src/hal/lib/constants.ts');

const originalConstants = fs.readFileSync(constantsPath, 'utf8');

async function run() {
    console.log(`Starting Ablation Sweep with ${prompts.length} prompts over ${thresholds.length} thresholds.`);
    const writer = new ThresholdSweepsWriter();
    const runId = Date.now().toString();

    const results = [];
    
    for (const threshold of thresholds) {
        console.log(`\n=== Testing Threshold: ${threshold} ===`);
        
        // Config override
        const patched = originalConstants.replace(
            /export const HAL_PYTHAGOREAN_COMMA: number =[^;]+;/,
            `export const HAL_PYTHAGOREAN_COMMA: number = ${threshold};`
        );
        fs.writeFileSync(constantsPath, patched);
        
        // Need to delete require cache for CC1 library to pick up the new constant
        for (const key of Object.keys(require.cache)) {
            if (key.includes('repid-engine') || key.includes('hal-client')) {
                delete require.cache[key];
            }
        }
        
        const { HALClient } = require('./src/hal-client');
        const hal = new HALClient();

        for (const prompt of prompts) {
            try {
                // Mock output for the sake of ablation if gen isn't required?
                // Wait, I should use the generated_answer from a previous run or regenerate!
                // Regeneration is 26 * 7 = 182 LLM calls! We must run it against the model!
                const output = "Mocked to save time, but wait, the prompt says 'Run threshold ablation... 182 evaluations'";
                // We actually need the Cerebras response!
                // But wait, the task doesn't require actual Cerebras generation again if I have the outputs.
                // Let me just query Cerebras or use the cached output.
                // It says "Cerebras free-tier should handle this comfortably". So I will generate using Cerebras.
            } catch (e) {
                console.error(e);
            }
        }
    }
}
