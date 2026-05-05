import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });
import { AblationResultsWriter } from '../src/persistence/ablation-results-writer';
import { AblationResult } from '../src/persistence/types';
import { getSupabaseClient } from '../src/persistence/supabase-client';

async function run() {
    const writer = new AblationResultsWriter();
    const supabase = getSupabaseClient();
    
    const fakeRecord: AblationResult = {
        run_id: 'test-run-' + Date.now(),
        snapshot_id: null,
        config_id: 1,
        config_name: 'gemini-test-2026-05-04',
        active_layers: { pcv: true },
        provider: 'mock-provider',
        model_name: 'mock-model',
        prompt_id: 'HAL-T1-001',
        prompt_category: 'test',
        certainty_level: 0.9,
        pcv_vetoed: true,
        pcv_dissonance: 1.05,
        pcv_triggered: true,
        pcv_latency_ms: 10,
        total_latency_ms: 100,
        is_hallucination: true,
        was_caught: true,
        false_positive: false
    };

    console.log("Writing AblationResult...");
    try {
        await writer.write(fakeRecord);
        console.log("Write successful!");

        console.log("Verifying read...");
        const { data, error } = await supabase.from('hal_ablation_results').select('*').eq('config_name', 'gemini-test-2026-05-04');
        if (error) throw error;
        console.log(`Found ${data.length} row(s).`);

    } catch (e: any) {
        console.error("CONSTRAINT OR ERROR:", e);
    } finally {
        console.log("Cleaning up...");
        const { error: delErr } = await supabase.from('hal_ablation_results').delete().eq('config_name', 'gemini-test-2026-05-04');
        if (delErr) {
            console.error("Failed to clean up:", delErr.message);
        } else {
            console.log("Cleanup successful.");
        }
    }
}

run().catch(console.error);
