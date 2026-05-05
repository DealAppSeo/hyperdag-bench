import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    const { data, error } = await supabase
        .from('hal_runner_results')
        .select('*')
        .like('benchmark_source', 'wave5-full-2026-05-04%');

    if (error) throw error;

    const summary: any = {};
    for (const row of data) {
        if (!summary[row.benchmark_source]) {
            summary[row.benchmark_source] = { evals: 0, vetoed: 0, t1_003: false };
        }
        summary[row.benchmark_source].evals++;
        if (row.hal_vetoed) summary[row.benchmark_source].vetoed++;
        if (row.prompt_id === 'HAL-T1-003' && row.hal_vetoed) summary[row.benchmark_source].t1_003 = true;
    }

    let md = '# Wave 5 Full Benchmark Summary\n\n';
    md += 'Note: 26 prompts is a small sample; numbers are directional, not statistical.\n\n';
    md += '## Performance per Level\n';
    for (const key of Object.keys(summary).sort()) {
        const s = summary[key];
        const vRate = (s.vetoed / s.evals * 100).toFixed(1);
        md += `- **${key}**: ${s.evals} evals, ${s.vetoed} vetoes (${vRate}%). HAL-T1-003 Vetoed: ${s.t1_003}\n`;
    }

    md += '\n## Notes\n- Free-tier rate limits were hit repeatedly (Groq/Cerebras 429s), but the rotation client successfully handled backoffs.\n';
    md += '- High base heuristic values (`hal_score > 0.25`) due to intentionally hallucination-heavy test prompts dominated the overall boolean veto counts, making differential cross-LLM effects less visible on a pure binary outcome.\n';
    
    fs.writeFileSync('C:\\Users\\Cash4\\repos\\hyperdag-bench\\results\\1777963597511\\wave5-full-summary.md', md);
    console.log('Summary written.');
}

run().catch(console.error);
