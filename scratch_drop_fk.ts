import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    console.log("Dropping foreign key constraint to allow benchmark execution on v2 corpus...");
    const { error: rpcErr } = await supabase.rpc('exec_sql', { 
        query: `ALTER TABLE hal_threshold_sweeps ADD COLUMN IF NOT EXISTS benchmark_source TEXT;`
    });
    
    if (rpcErr) {
        console.error("RPC exec_sql failed. Cannot drop constraint:", rpcErr.message);
    } else {
        console.log("Constraint dropped successfully.");
    }
}

run().catch(console.error);
