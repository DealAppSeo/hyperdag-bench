export interface RunManifest {
    run_id: string;
    sprint_branch: string;
    sprint_commit: string;
    hal_library_path: string;
    hal_library_commit: string;
    dataset_id: string;
    models_used: Array<{ provider: string, model: string, version?: string }>;
    comma_threshold_default: number;
    sample_size: number;
    started_at: string;
    completed_at: string;
    cost_estimate_usd: number;
    host_environment: {
        node_version: string;
        os: string;
    };
}
