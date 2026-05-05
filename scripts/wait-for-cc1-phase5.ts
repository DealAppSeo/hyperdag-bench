import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const timeoutMs = 30 * 60 * 1000;
const pollIntervalMs = 60 * 1000;
const startTime = Date.now();
const repidPath = 'C:/Users/Cash4/repos/repid-engine';
const smokeTestPath = path.join(repidPath, 'scripts/external-caller-smoke-test.ts');
const stateDir = path.join(__dirname, '../state');

if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
}

function checkCC1State() {
    if (!fs.existsSync(smokeTestPath)) {
        return { success: false, reason: 'Smoke test script not found' };
    }

    try {
        const commitHash = execSync('git rev-parse HEAD', { cwd: repidPath, encoding: 'utf-8' }).trim();
        if (commitHash === 'b5865c7') {
            return { success: false, reason: 'Still on broken commit b5865c7' };
        }

        let smokeOutput = '';
        try {
            smokeOutput = execSync(`npx ts-node ${smokeTestPath}`, { cwd: repidPath, encoding: 'utf-8' });
        } catch (e: any) {
            smokeOutput = e.stdout || e.message;
        }
        
        // Ensure HAL-T1-003 is correctly vetoed in the output
        if (smokeOutput.includes('HAL-T1-003') && (smokeOutput.includes('vetoed:       TRUE') || smokeOutput.includes('vetoed: true'))) {
            return { success: true, commit: commitHash };
        } else {
            return { success: false, reason: 'HAL-T1-003 not vetoing or missing from output. Output: ' + smokeOutput.slice(0, 100) };
        }
    } catch (e: any) {
        return { success: false, reason: `Smoke test execution failed: ${e.message}` };
    }
}

async function watch() {
    console.log('Starting CC1 Library Watch (up to 30 mins)...');
    while (Date.now() - startTime < timeoutMs) {
        console.log('Polling CC1 state...');
        const result = checkCC1State();
        if (result.success) {
            console.log(`[DETECTED] CC1 Phase 5-A fix detected at commit ${result.commit}. HAL-T1-003 correctly vetoed!`);
            const statePath = path.join(stateDir, 'cc1-phase5-detected.json');
            fs.writeFileSync(statePath, JSON.stringify({
                timestamp: new Date().toISOString(),
                commit: result.commit,
                library_path: path.join(repidPath, 'src/hal/lib')
            }, null, 2));
            process.exit(0);
        } else {
            console.log(`[WAITING] CC1 not ready: ${result.reason}`);
        }
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    console.warn('[TIMEOUT] CC1 Phase 5-A fix did not land within 30 minutes.');
    const timeoutPath = path.join(stateDir, 'cc1-phase5-timeout.json');
    fs.writeFileSync(timeoutPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        reason: '30 minute timeout exceeded'
    }, null, 2));
    process.exit(1);
}

watch().catch(console.error);
