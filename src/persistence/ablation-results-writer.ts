import { getSupabaseClient } from './supabase-client';
import { AblationResult } from './types';

export class AblationResultsWriter {
    private client = getSupabaseClient();
    private tableName = 'hal_ablation_results';

    async write(record: AblationResult) {
        // Fallback or explicit values for nulls
        const payload = {
            ...record,
            snapshot_id: record.snapshot_id ?? null,
            sbfa_triggered: null,
            bft_triggered: null,
            slt_triggered: null,
            repid_triggered: null,
            wsce_triggered: null,
            gnnsr_triggered: null,
            anfis_triggered: null,
            study_a: null,
            study_b: null,
            study_c: null
        };

        const { error } = await this.client.from(this.tableName).insert(payload);
        if (error) {
            console.error(`[AblationResultsWriter] Failed to write: ${error.message}`);
            throw error;
        }
        console.log(`[AblationResultsWriter] Wrote 1 record.`);
    }

    async writeMany(records: AblationResult[]) {
        if (records.length === 0) return;
        const payload = records.map(record => ({
            ...record,
            snapshot_id: record.snapshot_id ?? null,
            sbfa_triggered: null,
            bft_triggered: null,
            slt_triggered: null,
            repid_triggered: null,
            wsce_triggered: null,
            gnnsr_triggered: null,
            anfis_triggered: null,
            study_a: null,
            study_b: null,
            study_c: null
        }));

        const { error } = await this.client.from(this.tableName).insert(payload);
        if (error) {
            console.error(`[AblationResultsWriter] Failed to write batch: ${error.message}`);
            throw error;
        }
        console.log(`[AblationResultsWriter] Wrote ${records.length} records.`);
    }
}
