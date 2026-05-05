# Result Persistence

The repository implements Supabase writers in `src/persistence/` for saving benchmark and ablation runs back to the Trinity ecosystem.

## Schemas Expected

**Table:** `hal_benchmark_results`
- `run_id` (string)
- `prompt_id` (string)
- `benchmark_source` (string)
- `generated_answer` (string)
- `provider` (string)
- `model` (string)
- `latency_ms` (number)
- `hal_vetoed` (boolean)
- `comma_gap` (number)
- `hal_diagnostics` (jsonb)
- `created_at` (timestamp)

**Table:** `hal_ablation_results`
- `run_id` (string)
- `prompt_id` (string)
- `threshold_value` (number)
- `hal_vetoed` (boolean)
- `created_at` (timestamp)

## Known Issues
During testing, inserting a record into `hal_benchmark_results` failed with `PGRST204: Could not find the 'benchmark_source' column`. This indicates that the production table schema has drifted from or lacks the expected columns. The writers are written to the expected schema above. Sean must update the production schema to match these columns before persistence can succeed.
