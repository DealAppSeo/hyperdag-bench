export interface RunnerResult {
    run_id: string;
    prompt_id: string;
    benchmark_source: string;
    hyperdag_bench_commit: string;
    repid_engine_commit: string;
    manifest_dataset_id: string;
    gen_provider: string;
    gen_model: string;
    gen_latency_ms: number;
    generated_answer: string;
    hal_mode: string;
    hal_threshold: number;
    hal_score: number;
    hal_vetoed: boolean;
    comma_gap: number;
    signals: any;
    hal_diagnostics: any;
    hal_latency_ms: number;
    hal_providers_used: string[];
    estimated_cost_usd: number;
    ground_truth_is_hallucination: boolean;
    was_caught: boolean;
    false_positive: boolean;
}

export interface AblationResult {
    run_id: string;
    snapshot_id: string | null;
    config_id: number;
    config_name: string;
    active_layers: any;
    provider: string;
    model_name: string;
    prompt_id: string;
    prompt_category: string;
    certainty_level: number;
    pcv_vetoed: boolean;
    pcv_dissonance: number;
    pcv_triggered: boolean;
    pcv_latency_ms: number;
    total_latency_ms: number;
    is_hallucination: boolean;
    was_caught: boolean;
    false_positive: boolean;
    // other layer triggers are null
    sbfa_triggered?: boolean | null;
    bft_triggered?: boolean | null;
    slt_triggered?: boolean | null;
    repid_triggered?: boolean | null;
    wsce_triggered?: boolean | null;
    gnnsr_triggered?: boolean | null;
    anfis_triggered?: boolean | null;
    study_a?: boolean | null;
    study_b?: boolean | null;
    study_c?: boolean | null;
}

export interface ThresholdSweepResult {
    run_id: string;
    prompt_id: string;
    threshold_value: number;
    hal_vetoed: boolean;
    comma_gap?: number | null;
    hal_score?: number | null;
    signals?: any | null;
    is_hallucination?: boolean | null;
    was_caught?: boolean | null;
    false_positive?: boolean | null;
    gen_provider: string;
    gen_model: string;
    latency_ms?: number | null;
}
