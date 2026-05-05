import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const runId = 'test-checkpointing-' + Date.now();
const outDir = path.join(__dirname, `../results/${runId}`);
fs.mkdirSync(outDir, { recursive: true });

const jsonlPath = path.join(outDir, 'internal-prompts-results.jsonl');

// Write 10 dummy records to the jsonl to simulate 10 completed prompts.
const dummyPrompts = [
    'HAL-T1-003', // This is always 1st or ensured 1st
    'HAL-T1-001',
    'HAL-T1-002',
    'HAL-T1-004',
    'HAL-T1-005',
    'HAL-T1-006',
    'HAL-T1-007',
    'HAL-T1-008',
    'HAL-T1-009',
    'HAL-T1-010'
];

for (const pid of dummyPrompts) {
    fs.appendFileSync(jsonlPath, JSON.stringify({ prompt_id: pid }) + '\n');
}

console.log(`Prepared run ${runId} with 10 completed prompts.`);

try {
    const output = execSync(`npx ts-node src/runners/internal-prompts-runner.ts --run-id=${runId}`, { encoding: 'utf-8' });
    console.log(output);
    if (output.includes('Checkpointing: 10 already completed.')) {
        console.log('[SUCCESS] correctly detected 10 already completed.');
    } else {
        console.error('[FAILED] did not correctly detect 10 already completed.');
    }
} catch (e: any) {
    console.error(e.stdout);
    console.error(e.stderr);
}
