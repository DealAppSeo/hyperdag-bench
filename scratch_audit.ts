import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    const { data, error } = await supabase
        .from('hal_training_cases')
        .select('*')
        .limit(10);

    if (error) {
        if (error.code === '42P01') {
            console.log('hal_training_cases table does not exist yet. No active learning signals available.');
        } else {
            console.error('Error querying hal_training_cases:', error);
        }
        return;
    }

    console.log(`Found ${data.length} active learning cases.`);
    if (data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
    }
}

run().catch(console.error);
