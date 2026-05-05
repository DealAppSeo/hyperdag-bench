import { RunManifest } from './types';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

export class ManifestGenerator {
    private manifest: Partial<RunManifest> = {};

    constructor(run_id: string) {
        this.manifest.run_id = run_id;
        this.manifest.started_at = new Date().toISOString();
        this.manifest.host_environment = {
            node_version: process.version,
            os: `${os.type()} ${os.release()}`
        };

        try {
            this.manifest.sprint_branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            this.manifest.sprint_commit = execSync('git rev-parse HEAD').toString().trim();
        } catch {
            this.manifest.sprint_branch = 'unknown';
            this.manifest.sprint_commit = 'unknown';
        }

        try {
            const halPath = path.resolve(__dirname, '../../../../repid-engine');
            this.manifest.hal_library_path = halPath;
            this.manifest.hal_library_commit = execSync('git rev-parse HEAD', { cwd: halPath }).toString().trim();
        } catch {
            this.manifest.hal_library_commit = 'unknown';
            this.manifest.hal_library_path = 'unknown';
        }

        this.manifest.models_used = [];
        this.manifest.cost_estimate_usd = 0;
        this.manifest.comma_threshold_default = 531441 / 524288;
    }

    setDataset(datasetId: string, sampleSize: number) {
        this.manifest.dataset_id = datasetId;
        this.manifest.sample_size = sampleSize;
    }

    setDatasetWithHash(datasetId: string, prompts: any[]) {
        this.manifest.dataset_id = datasetId;
        this.manifest.sample_size = prompts.length;
        this.manifest.dataset_sha256 = crypto.createHash('sha256').update(JSON.stringify(prompts)).digest('hex');
    }

    addModelUsage(provider: string, model: string) {
        if (!this.manifest.models_used!.some(m => m.provider === provider && m.model === model)) {
            this.manifest.models_used!.push({ provider, model });
        }
    }

    finalize(): RunManifest {
        this.manifest.completed_at = new Date().toISOString();
        this.validate();
        return this.manifest as RunManifest;
    }

    private validate() {
        const required = ['run_id', 'sprint_branch', 'dataset_id', 'sample_size', 'completed_at'];
        for (const req of required) {
            if ((this.manifest as any)[req] === undefined) {
                throw new Error(`Manifest is invalid: missing required field ${req}`);
            }
        }
    }
}
