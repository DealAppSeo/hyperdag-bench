import { BenchmarkResultsWriter, BenchmarkRecord } from '../src/persistence/benchmark-results-writer';
import { AblationResultsWriter, AblationRecord } from '../src/persistence/ablation-results-writer';
import { getSupabaseClient } from '../src/persistence/supabase-client';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

async function runTest() {
    const benchWriter = new BenchmarkResultsWriter();
    const ablationWriter = new AblationResultsWriter();
    const runId = "test-" + Date.now();

    const benchRecord: BenchmarkRecord = {
        run_id: runId,
        prompt_id: 'TEST-001',
        benchmark_source: 'gemini-prep-test-2026-05-04',
        generated_answer: 'Test Answer',
        provider: 'mock',
        model: 'mock-model',
        latency_ms: 100,
        hal_vetoed: true,
        comma_gap: 1.05,
        hal_diagnostics: { test: true }
    };

    const ablationRecord: AblationRecord = {
        run_id: runId,
        prompt_id: 'TEST-001',
        threshold_value: 1.05,
        hal_vetoed: true
    };

    console.log("Writing test bench record...");
    await benchWriter.write(benchRecord);

    console.log("Writing test ablation record...");
    await ablationWriter.write(ablationRecord);

    const client = getSupabaseClient();
    
    console.log("Reading back bench record...");
    const { data: bData } = await client.from('hal_benchmark_results').select('*').eq('run_id', runId);
    console.log(bData);

    console.log("Reading back ablation record...");
    const { data: aData } = await client.from('hal_ablation_results').select('*').eq('run_id', runId);
    console.log(aData);

    console.log("Cleaning up test records...");
    await client.from('hal_benchmark_results').delete().eq('run_id', runId);
    await client.from('hal_ablation_results').delete().eq('run_id', runId);
    console.log("Cleaned up.");
}

runTest().catch(console.error);
