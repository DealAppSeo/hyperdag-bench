import { execSync } from 'child_process';

const thresholds = [0.5, 0.7, 0.9, 1.0, 1.013643, 1.05, 1.10];

for (const threshold of thresholds) {
    console.log(`\n=== Running Ablation for Threshold: ${threshold} ===`);
    try {
        execSync(`npx ts-node src/runners/ablation-runner-single.ts --comma-override=${threshold}`, { stdio: 'inherit' });
    } catch (e: any) {
        console.error(`Ablation run failed for ${threshold}:`, e.message);
    }
}

console.log('\nAblation Sweep Complete!');
