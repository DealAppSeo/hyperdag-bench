# Reproducibility Manifest

Every benchmark run requires a `manifest.json` file in its results directory. This manifest provides the cryptographic and architectural metadata required to reproduce the numbers perfectly. 

## Structure
- `run_id`: The unique ID tying the manifest to its JSONL result data.
- `sprint_commit`: The exact code of the runner used.
- `hal_library_commit`: The exact commit in the `repid-engine` repo defining the HAL logic evaluated.
- `dataset_id`: Identifies the dataset snapshot.
- `dataset_sha256`: The SHA-256 hash of the dataset used.

## Cryptographic Chain of Custody for Patent Defense
The `dataset_sha256` field in the manifest serves as a cryptographic chain of custody. By computing a SHA-256 hash of the JSON-serialized prompts exactly as they were evaluated during the run, we create an immutable fingerprint of the benchmark inputs. This hash acts as cryptographically secure proof that a specific, untampered set of prompts was used to achieve the recorded benchmark metrics. In patent defense scenarios, this proves that results were not cherry-picked or manipulated post-hoc, validating the strict integrity of the experimental setup.

## How to Re-Run
To challenge or replicate a finding:
1. `git checkout <sprint_commit>` in `hyperdag-bench`.
2. `git checkout <hal_library_commit>` in `repid-engine`.
3. Verify the `dataset_id` matches the local fixture.
4. Verify the `dataset_sha256` hash matches the newly computed hash of the fixture.
5. Run the benchmark using the exact same LLM models and versions.
