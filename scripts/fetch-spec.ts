import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

async function run() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    console.log("Fetching OpenAPI spec...");
    const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const spec = await res.json();
    fs.writeFileSync('openapi-spec.json', JSON.stringify(spec, null, 2));
    console.log("Saved to openapi-spec.json");
}

run().catch(console.error);
