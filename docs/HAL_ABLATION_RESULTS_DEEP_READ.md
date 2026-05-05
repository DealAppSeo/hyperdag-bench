# Deep Schema Read: `hal_ablation_results`

**Date:** 2026-05-04
**Objective:** Analyze the 55-column production schema for `hal_ablation_results` to determine how the current `threshold_value` ablation architecture can fit into this research-grade tracking table.

Most columns in this table appear to be `Nullable` (YES) with the exception of primary keys and fields with hardcoded defaults.

## 1. Run Identification
* **Columns:** `id` (uuid, PK), `run_id` (text), `snapshot_id` (text, FK), `config_id` (integer), `config_name` (text), `active_layers` (jsonb), `layer_order` (jsonb).
* **Semantics:** This block tracks the exact configuration of HAL used. The original P-023 studies likely mutated `active_layers` (e.g., turning off SBFA or BFT) to see the isolated effect of each layer. 
* **Threshold-Ablation Fit:** Our current runner evaluates a single floating-point threshold (e.g., `1.013643`). We could cleanly map this by setting `config_name = 'threshold_1.013643'` or storing the threshold inside the `active_layers` JSON. However, a dedicated `threshold_value` numeric column (as proposed) remains cleaner if we run threshold sweeps.

## 2. Model & Prompt Metadata
* **Columns:** `provider`, `model_name`, `model_size_category`, `temperature`, `prompt_id` (FK), `prompt_category`, `certainty_level`.
* **Semantics:** Metadata about the LLM generation and the specific `hal_test_prompts` row evaluated.
* **Threshold-Ablation Fit:** Naturally populated. The runner already knows the `provider`, `model_name`, and `prompt_id`.

## 3. Layer Trigger Flags
* **Columns:** `sbfa_triggered`, `bft_triggered`, `slt_triggered`, `repid_triggered`, `wsce_triggered`, `gnnsr_triggered`, `anfis_triggered`, `pcv_triggered`.
* **Semantics:** Boolean flags indicating if a specific mathematical layer within HAL actively fired or engaged during the evaluation of a prompt.
* **Threshold-Ablation Fit:** If our mock/real HAL adapter exposes the inner layer flags (in `hal_diagnostics`), we could populate these. Otherwise, they would be left `NULL`.

## 4. Per-Layer Metrics
* **Columns:** `sbfa_score`, `bft_consensus_pct`, `slt_uncertainty`, `repid_weight`, `wsce_coherence`, `gnnsr_contradictions`, `anfis_adjustment`, `pcv_dissonance`.
* **Latency tracking:** `sbfa_latency_ms`, `bft_latency_ms`, `slt_latency_ms`, `repid_latency_ms`, `wsce_latency_ms`, `gnnsr_latency_ms`, `anfis_latency_ms`, `pcv_latency_ms`, `total_latency_ms`.
* **Semantics:** The raw scoring outputs and timing for each respective constitutional layer.
* **Threshold-Ablation Fit:** `pcv_dissonance` maps perfectly to our `comma_gap`. The runner can directly populate `pcv_dissonance`. The other layer scores would likely remain `NULL` in a strict Pythagorean Comma threshold sweep, unless the real HAL library naturally emits them all in the `evaluate()` response.

## 5. Outcome
* **Columns:** `hal_verdict`, `hal_mode`, `hal_compliance_score`, `pcv_vetoed`, `is_hallucination`, `was_caught`, `false_positive`, `hallucination_type`, `hallucination_severity`, `evaluator_id`, `evaluator_blind_score`, `evaluation_notes`.
* **Semantics:** The definitive ground-truth tracking block. It calculates whether HAL correctly stopped a known hallucination (`was_caught`) or incorrectly stopped truth (`false_positive`). 
* **Threshold-Ablation Fit:** Extremely valuable. Our `hal_vetoed` variable maps directly to `pcv_vetoed` (or `hal_verdict`). Our runner could dynamically calculate `was_caught` and `false_positive` by comparing the `hal_vetoed` result against the `ground_truth` defined in the internal prompt!

## 6. Study Tags
* **Columns:** `study_a` (default true), `study_b` (default false), `study_c` (default false).
* **Semantics:** Hardcoded booleans to partition rows into different research epochs (e.g. for specific patent diagrams). 
* **Threshold-Ablation Fit:** We would likely leave these as default, or we could negotiate with Sean to allocate `study_b = true` for our current nightly threshold sweep.

---

### Conclusion for Architectural Decision
The production table is highly granular. Instead of altering the table to fit our lean writer, we should strongly consider **updating our writer** to map its outputs into this existing framework. 
- `comma_gap` maps to `pcv_dissonance`.
- `hal_vetoed` maps to `pcv_vetoed`.
- We can auto-calculate `was_caught` and `false_positive` using `hal_test_prompts` data.
- The threshold value could be embedded in `config_name` or we can still safely add `threshold_value` as a new numeric column.
