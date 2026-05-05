# Nightly Recurrence

To fulfill HAL's "always be learning" (ABL) commitment, benchmarks will execute nightly using free-tier LLM providers.

## The Script
`scripts/nightly-run.ts` acts as the orchestrator. It:
1. Loads limits and samples from `config/nightly.json`.
2. Evaluates the hand-crafted `internal-prompts`.
3. Evaluates TruthfulQA samples.
4. Performs Pythagorean Comma ablation over 7 canonical thresholds.
5. Performs Cross-LLM consensus checks.
6. Generates a reproducible manifest.
7. Writes structural data back to Supabase.
8. Outputs a markdown summary.

## Dry-Run Testing
To verify configuration without burning API quota:
```bash
npx ts-node scripts/nightly-run.ts --dry-run
```

## Scheduling (Sprint D)
The script is scaffolded. During Sprint D, Sean or an agent must wire this execution to a scheduler:
- **Vercel Cron:** Lightweight, but limited to 10-second serverless execution limits (may timeout).
- **GitHub Actions:** Recommended. Can run for up to 6 hours on Ubuntu runners. Easily triggers off a `.github/workflows/nightly.yml` scheduling expression (`30 23 * * *`).
- **Railway Worker:** Recommended if persistence needs strict network isolation.

We propose **GitHub Actions** because the resulting artifacts (markdown reports) can be automatically committed back to the repository for public accountability.
