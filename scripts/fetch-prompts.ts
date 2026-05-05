import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchPrompts() {
    console.log("Fetching schema info indirectly (fetching 1 row)...");
    const { data: sample, error: err1 } = await supabase.from('hal_test_prompts').select('*').limit(1);
    if (err1) {
        console.error("Error fetching hal_test_prompts:", err1.message);
        return;
    }
    
    if (sample && sample.length > 0) {
        console.log("hal_test_prompts schema columns:", Object.keys(sample[0]).join(', '));
    } else {
        console.log("hal_test_prompts is empty!");
    }

    console.log("Fetching all prompts...");
    const { data, error } = await supabase.from('hal_test_prompts').select('*').order('prompt_id');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Fetched ${data.length} prompts.`);

    const outDir = path.join(__dirname, '../data/internal-prompts');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const payload = {
        _metadata: {
            source_table: 'hal_test_prompts',
            snapshot_timestamp: new Date().toISOString(),
            row_count: data.length,
            columns: sample && sample.length > 0 ? Object.keys(sample[0]) : []
        },
        prompts: data
    };

    const outFile = path.join(outDir, 'hal-test-prompts-2026-05-04.json');
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
    console.log(`Saved to ${outFile}`);
}

async function checkResultsTables() {
    console.log("\nChecking hal_benchmark_results...");
    const { data: benchData, error: benchErr } = await supabase.from('hal_benchmark_results').select('*').limit(1);
    if (benchErr) {
        console.log("hal_benchmark_results error or doesn't exist:", benchErr.message);
    } else {
        console.log("hal_benchmark_results schema columns (if any data):", benchData && benchData.length > 0 ? Object.keys(benchData[0]).join(', ') : "Empty table, schema verified implicitly by no error.");
    }

    console.log("\nChecking hal_ablation_results...");
    const { data: ablationData, error: ablationErr } = await supabase.from('hal_ablation_results').select('*').limit(1);
    if (ablationErr) {
        console.log("hal_ablation_results error or doesn't exist:", ablationErr.message);
    } else {
        console.log("hal_ablation_results schema columns (if any data):", ablationData && ablationData.length > 0 ? Object.keys(ablationData[0]).join(', ') : "Empty table, schema verified implicitly by no error.");
    }
}

async function run() {
    await fetchPrompts();
    await checkResultsTables();
}

run();
