import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    console.log("Fetching Phase 4 stats...");
    const { data: p4, error: e4 } = await supabase.from('hal_runner_results')
        .select('benchmark_source, gen_failed, hal_vetoed, hal_score, hal_latency_ms')
        .like('benchmark_source', 'wave7-multiprovider-%');
    
    if (e4) {
        console.error("Error fetching P4:", e4.message);
    } else {
        const stats: Record<string, any> = {};
        for (const row of p4) {
            if (!stats[row.benchmark_source]) {
                stats[row.benchmark_source] = { total: 0, failed: 0, vetoed: 0, scoreSum: 0, latencySum: 0 };
            }
            stats[row.benchmark_source].total++;
            if (row.gen_failed) stats[row.benchmark_source].failed++;
            if (row.hal_vetoed) stats[row.benchmark_source].vetoed++;
            stats[row.benchmark_source].scoreSum += (row.hal_score || 0);
            stats[row.benchmark_source].latencySum += (row.hal_latency_ms || 0);
        }
        
        for (const [source, stat] of Object.entries(stats)) {
            const avgScore = stat.total > stat.failed ? stat.scoreSum / (stat.total - stat.failed) : 0;
            const avgLat = stat.total > stat.failed ? stat.latencySum / (stat.total - stat.failed) : 0;
            console.log(`Source: ${source} | Total: ${stat.total} | Failed: ${stat.failed} | Vetoed: ${stat.vetoed} | AvgScore: ${avgScore.toFixed(3)}`);
        }
    }

    console.log("\nFetching Phase 5 stats...");
    const { data: p5, error: e5 } = await supabase.from('hal_threshold_sweeps')
        .select('threshold_value, hal_vetoed, prompt_id')
        .eq('benchmark_source', 'wave7-comma-ablation-2026-05-05');
        
    if (e5) {
        console.error("Error fetching P5:", e5.message);
    } else {
        const tStats: Record<string, { total: number, vetoed: number }> = {};
        const pStats: Record<string, Set<boolean>> = {};
        for (const row of p5) {
            const tStr = row.threshold_value.toString();
            if (!tStats[tStr]) tStats[tStr] = { total: 0, vetoed: 0 };
            tStats[tStr].total++;
            if (row.hal_vetoed) tStats[tStr].vetoed++;
            
            if (!pStats[row.prompt_id]) pStats[row.prompt_id] = new Set();
            pStats[row.prompt_id].add(row.hal_vetoed);
        }
        
        console.log("Threshold | Total | Vetoed | Veto Rate");
        for (const [t, stat] of Object.entries(tStats)) {
            console.log(`${t} | ${stat.total} | ${stat.vetoed} | ${((stat.vetoed/stat.total)*100).toFixed(1)}%`);
        }
        
        let sensitiveCount = 0;
        for (const [pId, verdicts] of Object.entries(pStats)) {
            if (verdicts.size > 1) {
                sensitiveCount++;
            }
        }
        console.log(`Comma-sensitive prompts: ${sensitiveCount}`);
    }
}

run().catch(console.error);
