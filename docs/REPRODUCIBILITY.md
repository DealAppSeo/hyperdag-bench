# Reproducibility Manifest

Every benchmark run requires a `manifest.json` file in its results directory. This manifest provides the cryptographic and architectural metadata required to reproduce the numbers perfectly. 

## Structure
- `run_id`: The unique ID tying the manifest to its JSONL result data.
- `sprint_commit`: The exact code of the runner used.
- `hal_library_commit`: The exact commit in the `repid-engine` repo defining the HAL logic evaluated.
- `dataset_id`: Identifies the dataset snapshot.

## How to Re-Run
To challenge or replicate a finding:
1. `git checkout <sprint_commit>` in `hyperdag-bench`.
2. `git checkout <hal_library_commit>` in `repid-engine`.
3. Verify the `dataset_id` matches the local fixture.
4. Run the benchmark using the exact same LLM models and versions.
