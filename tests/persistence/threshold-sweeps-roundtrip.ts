import * as dotenv from 'dotenv';
dotenv.config({ path: 'C:/Users/Cash4/repos/repid-engine/.env' });
import { ThresholdSweepsWriter } from '../../src/persistence/threshold-sweeps-writer';
import { getSupabaseClient } from '../../src/persistence/supabase-client';
import { ThresholdSweepResult } from '../../src/persistence/types';

async function run() {
    const writer = new ThresholdSweepsWriter();
    const supabase = getSupabaseClient();
    
    const fakeResult: ThresholdSweepResult = {
        run_id: 'gemini-test-2026-05-04',
        prompt_id: 'HAL-T1-001',
        threshold_value: 1.013643,
        hal_vetoed: true,
        comma_gap: 1.05,
        hal_score: 0.95,
        signals: { reason: 'test' },
        is_hallucination: true,
        was_caught: true,
        false_positive: false,
        gen_provider: 'test-provider',
        gen_model: 'test-model',
        latency_ms: 100
    };

    console.log('Writing fake ThresholdSweepResult...');
    await writer.write(fakeResult);
    
    console.log('Querying fake result...');
    const { data, error: qError } = await supabase
        .from('hal_threshold_sweeps')
        .select('*')
        .eq('run_id', 'gemini-test-2026-05-04')
        .eq('prompt_id', 'HAL-T1-001');
        
    if (qError) throw qError;
    
    if (data && data.length > 0) {
        console.log(`Found ${data.length} records, verifying threshold_value... ${data[0].threshold_value}`);
    } else {
        console.error('Failed to query record.');
        process.exit(1);
    }
    
    console.log('Deleting fake result...');
    const { error: dError } = await supabase
        .from('hal_threshold_sweeps')
        .delete()
        .eq('run_id', 'gemini-test-2026-05-04');
        
    if (dError) throw dError;
    
    console.log('Verifying count returns to 0...');
    const { count, error: cError } = await supabase
        .from('hal_threshold_sweeps')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', 'gemini-test-2026-05-04');
        
    if (cError) throw cError;
    
    if (count === 0) {
        console.log('Success! Count is 0.');
    } else {
        console.error(`Error: Count is ${count}, expected 0.`);
        process.exit(1);
    }
}

run().catch(console.error);
