import * as dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/Cash4/repos/repid-engine/.env' });
import { RunnerResultsWriter } from '../../src/persistence/runner-results-writer';
import { getSupabaseClient } from '../../src/persistence/supabase-client';
import { RunnerResult } from '../../src/persistence/types';

async function run() {
    const writer = new RunnerResultsWriter();
    const supabase = getSupabaseClient();
    
    const fakeResult: RunnerResult = {
        run_id: 'test-run-id-12345',
        prompt_id: 'HAL-T1-001',
        benchmark_source: 'gemini-test-2026-05-04',
        hyperdag_bench_commit: 'test-commit',
        repid_engine_commit: 'test-commit',
        manifest_dataset_id: 'test-dataset',
        gen_provider: 'test-provider',
        gen_model: 'test-model',
        gen_latency_ms: 100,
        generated_answer: 'test answer',
        hal_mode: 'test-mode',
        hal_threshold: 0.5,
        hal_score: 0.8,
        hal_vetoed: true,
        comma_gap: 0.3,
        signals: {},
        hal_diagnostics: {},
        hal_latency_ms: 200,
        hal_providers_used: ['test-provider'],
        estimated_cost_usd: 0.001,
        ground_truth_is_hallucination: true,
        was_caught: true,
        false_positive: false
    };

    console.log('Writing fake result...');
    await writer.write(fakeResult);
    
    console.log('Querying fake result...');
    const { data, error: qError } = await supabase
        .from('hal_runner_results')
        .select('*')
        .eq('run_id', 'test-run-id-12345')
        .eq('benchmark_source', 'gemini-test-2026-05-04');
        
    if (qError) throw qError;
    
    if (data && data.length > 0) {
        console.log(`Found ${data.length} records, verifying benchmark_source... ${data[0].benchmark_source}`);
    } else {
        console.error('Failed to query record.');
        process.exit(1);
    }
    
    console.log('Deleting fake result...');
    const { error: dError } = await supabase
        .from('hal_runner_results')
        .delete()
        .eq('run_id', 'test-run-id-12345');
        
    if (dError) throw dError;
    
    console.log('Verifying count returns to 0...');
    const { count, error: cError } = await supabase
        .from('hal_runner_results')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', 'test-run-id-12345');
        
    if (cError) throw cError;
    
    if (count === 0) {
        console.log('Success! Count is 0.');
    } else {
        console.error(`Error: Count is ${count}, expected 0.`);
        process.exit(1);
    }
}

run().catch(console.error);
