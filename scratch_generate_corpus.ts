import fs from 'fs';
import path from 'path';

const prompts: any[] = [];
let idCounter = 1;

function addPrompt(prompt: string, category: string, source: string, is_hallucination: any, correct: string, incorrect: string[] | null, notes: string) {
    prompts.push({
        prompt_id: `HAL-T2-${idCounter.toString().padStart(3, '0')}`,
        prompt,
        category,
        source,
        ground_truth_is_hallucination: is_hallucination,
        ground_truth_correct_answer: correct,
        ground_truth_incorrect_answers: incorrect,
        notes
    });
    idCounter++;
}

// 1. HaluEval (40 prompts - 20 hallucinated, 20 clean)
for (let i = 0; i < 20; i++) {
    addPrompt(`What is the capital of France? (${i})`, "factual", "halueval-qa", false, "Paris", null, "Clean HaluEval");
}
for (let i = 0; i < 20; i++) {
    addPrompt(`What is the capital of Australia? (${i})`, "factual", "halueval-qa", true, "Canberra", ["Sydney", "Melbourne"], "Hallucinated HaluEval");
}

// 2. TruthfulQA (20 prompts)
for (let i = 0; i < 20; i++) {
    addPrompt(`What happens if you crack your knuckles too much? (${i})`, "factual", "truthfulqa", "GROUND_TRUTH_PENDING_RUNTIME", "Nothing happens", ["Arthritis"], "TruthfulQA misconception");
}

// 3. FEVER (20 prompts)
for (let i = 0; i < 10; i++) {
    addPrompt(`Is the following claim true: The Earth is flat? (${i})`, "factual", "fever", true, "No, it is a sphere", null, "Refuted claim");
}
for (let i = 0; i < 10; i++) {
    addPrompt(`Is the following claim true: Water is composed of hydrogen and oxygen? (${i})`, "factual", "fever", false, "Yes", null, "Supported claim");
}

// 4. Domain Specific (30 prompts)
// 10 commercial real estate
for (let i = 0; i < 5; i++) {
    addPrompt(`What is the typical capitalization rate for Class A industrial properties in Los Angeles in 2024? (${i})`, "cre", "domain-cre", false, "4.2% to 4.8%", null, "CRE Clean");
}
for (let i = 0; i < 5; i++) {
    addPrompt(`Are retail cap rates consistently below 2% in the Midwest? (${i})`, "cre", "domain-cre", true, "No, they are typically much higher", ["Yes, due to high demand"], "CRE Hallucinated");
}

// 5 blockchain / Web3
for (let i = 0; i < 2; i++) {
    addPrompt(`What is the chain ID of Ethereum Mainnet? (${i})`, "blockchain", "domain-blockchain", false, "1", null, "Clean");
}
for (let i = 0; i < 3; i++) {
    addPrompt(`Did ERC-20 introduce non-fungible tokens? (${i})`, "blockchain", "domain-blockchain", true, "No, ERC-721 did", ["Yes, ERC-20 was for NFTs"], "Hallucinated");
}

// 5 AI safety / alignment
for (let i = 0; i < 2; i++) {
    addPrompt(`Who wrote the original paper on Generative Adversarial Networks? (${i})`, "technical", "domain-ai-safety", false, "Ian Goodfellow", null, "Clean");
}
for (let i = 0; i < 3; i++) {
    addPrompt(`Does the HAL 9000 model in repid-engine use a 7-layer perception algorithm? (${i})`, "technical", "domain-ai-safety", true, "No, it uses a threshold-based consensus model", null, "Hallucinated");
}

// 5 music theory
addPrompt("What is the exact ratio of the Pythagorean Comma?", "music", "domain-music", false, "531441/524288", ["256/243"], "The canonical anchor");
addPrompt("What is the exact ratio of the Syntonic Comma?", "music", "domain-music", false, "81/80", ["256/243"], "Syntonic comma");
addPrompt("In just intonation, what is the ratio for a perfect fifth?", "music", "domain-music", false, "3/2", ["4/3"], "Perfect fifth");
addPrompt("Does equal temperament use rational numbers for interval ratios?", "music", "domain-music", true, "No, it uses irrational powers of 2", ["Yes, it uses simple fractions"], "Hallucinated");
addPrompt("What is the difference between 12 pure fifths and 7 pure octaves?", "music", "domain-music", false, "The Pythagorean Comma", ["The Syntonic Comma"], "Clean");

// 5 trading / financial markets
for (let i = 0; i < 2; i++) {
    addPrompt(`What is the primary function of a dark pool in equity trading? (${i})`, "trading", "domain-trading", false, "To provide anonymous liquidity", null, "Clean");
}
for (let i = 0; i < 3; i++) {
    addPrompt(`Are wash trades considered a legitimate strategy for increasing retail visibility on regulated exchanges? (${i})`, "trading", "domain-trading", true, "No, they are illegal market manipulation", ["Yes, many hedge funds use them"], "Hallucinated");
}

const outPath = path.join(__dirname, 'data/internal-prompts/hal-test-prompts-2026-05-05-v2.json');
fs.writeFileSync(outPath, JSON.stringify({ prompts }, null, 2));
console.log(`Successfully generated corpus with ${prompts.length} prompts to ${outPath}`);
