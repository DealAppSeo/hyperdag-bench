import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\Cash4\\repos\\repid-engine\\.env' });

async function run() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    console.log("Fetching OpenAPI spec to determine table schema precisely...");
    const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const spec = await res.json();

    const benchSchema = spec.definitions?.hal_benchmark_results?.properties;
    const ablationSchema = spec.definitions?.hal_ablation_results?.properties;

    console.log("\nhal_benchmark_results columns:");
    if (benchSchema) {
        for (const [col, info] of Object.entries(benchSchema)) {
            console.log(`- ${col}: ${(info as any).type} (format: ${(info as any).format})`);
        }
    } else {
        console.log("Table not found in OpenAPI definitions.");
    }

    console.log("\nhal_ablation_results columns:");
    if (ablationSchema) {
        for (const [col, info] of Object.entries(ablationSchema)) {
            console.log(`- ${col}: ${(info as any).type} (format: ${(info as any).format})`);
        }
    } else {
        console.log("Table not found in OpenAPI definitions.");
    }

    // Bonus: Check hal_veto_test_results and hallucination_test_log
    console.log("\nhal_veto_test_results columns:");
    const vetoSchema = spec.definitions?.hal_veto_test_results?.properties;
    if (vetoSchema) {
        for (const [col, info] of Object.entries(vetoSchema)) {
            console.log(`- ${col}: ${(info as any).type} (format: ${(info as any).format})`);
        }
    } else {
        console.log("Table not found.");
    }

    console.log("\nhallucination_test_log columns:");
    const logSchema = spec.definitions?.hallucination_test_log?.properties;
    if (logSchema) {
        for (const [col, info] of Object.entries(logSchema)) {
            console.log(`- ${col}: ${(info as any).type} (format: ${(info as any).format})`);
        }
    } else {
        console.log("Table not found.");
    }
}

run().catch(console.error);
