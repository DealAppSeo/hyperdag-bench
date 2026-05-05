import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    const { data, error } = await supabase
        .from('hal_runner_results')
        .select('*')
        .like('benchmark_source', 'wave5-smoke2-2026-05-04%');

    if (error) throw error;

    const summary: Record<string, any> = {};
    for (const row of data) {
        if (!summary[row.benchmark_source]) {
            summary[row.benchmark_source] = { evals: 0, vetoed: 0, prompts: new Set(), cross_llm_fired: 0, t1_003_vetoed: false };
        }
        const s = summary[row.benchmark_source];
        s.evals++;
        if (row.hal_vetoed) s.vetoed++;
        s.prompts.add(row.prompt_id);
        if (row.signals && row.signals.cross_llm) s.cross_llm_fired++;
        if (row.prompt_id === 'HAL-T1-003' && row.hal_vetoed) s.t1_003_vetoed = true;
    }

    for (const key in summary) {
        const s = summary[key];
        console.log(`${key}: evals=${s.evals}, vetoed=${s.vetoed}, unique_prompts=${s.prompts.size}, cross_llm_fired=${s.cross_llm_fired}, HAL-T1-003_vetoed=${s.t1_003_vetoed}`);
    }
}

run().catch(console.error);
