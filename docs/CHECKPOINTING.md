# Checkpointing

The benchmark runners (e.g., `internal-prompts-runner.ts`) utilize cursor-based checkpointing for crash-resilience. 

## How it works:
1. When a run starts with a specified `--run-id=<id>`, it checks for `results/<run_id>/internal-prompts-results.jsonl`.
2. It reads the JSONL, extracts the `prompt_id` of all already completed records, and adds them to a `Set`.
3. It iterates over the prompts, and immediately skips any prompt whose `prompt_id` is in the completed set.
4. Each successful completion is appended to the JSONL, and the `manifest.json` is incrementally updated.

## Usage
- **Resume a run**: `npx ts-node src/runners/internal-prompts-runner.ts --run-id=my-existing-run`
- **Restart a fresh run** (destroying prior checkpoints): `npx ts-node src/runners/internal-prompts-runner.ts --run-id=my-existing-run --fresh`
