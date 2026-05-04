# Methodology

This benchmark suite measures the effectiveness of HAL (Hallucination Assessment Layer) at detecting hallucinations.

## Runners
- **TruthfulQA Baseline Runner:** Generates answers for TruthfulQA questions using base LLMs, then runs them through HAL to measure refusal rates (precision, recall, F1).
- **Pythagorean Comma Ablation:** Evaluates HAL using various fixed thresholds compared to the dynamic Pythagorean Comma threshold (`1.013643`) to find the optimal mathematical sweet spot.
- **Cross-LLM Consensus:** Tests HAL's scaling performance across 1, 2, and 3 LLMs (BFT consensus) measuring detection rates vs cost.

## Statistical Rigor and Threats to Validity
- **Sample Size:** Smaller samples (N=100) are used for quick methodology validation. Full datasets should be used for official numbers.
- **Model Version Drift:** Base LLMs update frequently, so historical generated answers are saved in `results/` to ensure HAL's evaluation logic is decoupled from generation changes.
- **Free-Tier Limits:** Rate limits may cause fallbacks to different providers, introducing variance.

## Nightly Recurrence (Sprint D Setup)
The runners are designed to be executed via cron using `--sample-size` and provider priority lists to generate delta reports automatically.
