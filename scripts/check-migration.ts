import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });
import { getSupabaseClient } from '../src/persistence/supabase-client';

async function run() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('hal_runner_results').select('*').limit(1);
    
    if (error) {
        console.error(`[MIGRATION CHECK FAILED] ${error.message}`);
        process.exit(1);
    } else {
        console.log(`[MIGRATION CHECK PASSED] hal_runner_results exists. Row count returned: ${data.length}`);
    }
}

run().catch(console.error);
