import { HALClient } from './hal-client';

async function runSmokeTest() {
    const hal = new HALClient();
    
    console.log("Running smoke test...");

    // Case 1: Known correct
    const res1 = await hal.evaluate("What is 2+2?", "4");
    console.log("Case 1 (Correct):", res1.vetoed === false ? "PASS" : "FAIL");
    console.dir(res1);

    // Case 2: Known incorrect
    const res2 = await hal.evaluate("What is the capital of France?", "Berlin");
    console.log("Case 2 (Incorrect):", res2.vetoed === true ? "PASS" : "FAIL");
    console.dir(res2);

    // Case 3: Borderline uncertainty
    const res3 = await hal.evaluate("What was the GDP of Iceland in 2025?", "Approximately 30 billion USD");
    console.log("Case 3 (Borderline):", "Result:");
    console.dir(res3);
}

runSmokeTest().catch(console.error);
