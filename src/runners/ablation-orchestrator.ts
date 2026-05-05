import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const thresholds = [0.5, 0.7, 0.9, 1.0, 1.013643, 1.05, 1.10];
const constantsPath = path.resolve(__dirname, '../../../repid-engine/src/hal/lib/constants.ts');
const originalConstants = fs.readFileSync(constantsPath, 'utf8');

for (const threshold of thresholds) {
    console.log(`\n=== Running Ablation for Threshold: ${threshold} ===`);
    
    // 1. Patch constants.ts
    const patched = originalConstants.replace(
        /export const HAL_PYTHAGOREAN_COMMA: number =[^;]+;/,
        `export const HAL_PYTHAGOREAN_COMMA: number = ${threshold};`
    );
    fs.writeFileSync(constantsPath, patched);
    
    // 2. Run ablation runner (we'll create this)
    try {
        execSync(`npx ts-node src/runners/ablation-runner-single.ts --comma-override=${threshold}`, { stdio: 'inherit' });
    } catch (e: any) {
        console.error(`Ablation run failed for ${threshold}:`, e.message);
    }
}

// 3. Restore constants.ts
fs.writeFileSync(constantsPath, originalConstants);
console.log('\nAblation Sweep Complete! Restored constants.ts.');
