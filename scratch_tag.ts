import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    console.log('Fetching contaminated rows...');
    const { data, error } = await supabase
        .from('hal_runner_results')
        .select('run_id, prompt_id, benchmark_source')
        .like('benchmark_source', 'internal-prompts-strictness-%')
        .gte('created_at', '2026-05-05 05:55:00+00')
        .lte('created_at', '2026-05-05 05:59:59+00');

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log(`Found ${data.length} contaminated rows. Updating...`);
    let count = 0;
    for (const row of data) {
        if (!row.benchmark_source.startsWith('CONTAMINATED')) {
            const { error: updErr } = await supabase
                .from('hal_runner_results')
                .update({ benchmark_source: `CONTAMINATED-pre-wave5-${row.benchmark_source}` })
                .eq('run_id', row.run_id)
                .eq('prompt_id', row.prompt_id);
            if (updErr) console.error(updErr);
            else count++;
        }
    }
    console.log(`Updated ${count} rows successfully.`);
}

run().catch(console.error);
