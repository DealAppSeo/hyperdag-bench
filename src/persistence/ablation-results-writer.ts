import { getSupabaseClient } from './supabase-client';

export interface AblationRecord {
    run_id: string;
    prompt_id: string;
    threshold_value: number;
    hal_vetoed: boolean;
    created_at?: string;
}

export class AblationResultsWriter {
    private client = getSupabaseClient();
    private tableName = 'hal_ablation_results';

    async write(record: AblationRecord) {
        if (!record.created_at) record.created_at = new Date().toISOString();
        const { error } = await this.client.from(this.tableName).insert(record);
        if (error) {
            console.error(`[AblationResultsWriter] Failed to write: ${error.message}`);
            throw error;
        }
        console.log(`[AblationResultsWriter] Wrote 1 record.`);
    }

    async writeMany(records: AblationRecord[]) {
        if (records.length === 0) return;
        records.forEach(r => { if (!r.created_at) r.created_at = new Date().toISOString(); });
        
        const { error } = await this.client.from(this.tableName).insert(records);
        if (error) {
            console.error(`[AblationResultsWriter] Failed to write batch: ${error.message}`);
            throw error;
        }
        console.log(`[AblationResultsWriter] Wrote ${records.length} records.`);
    }
}
