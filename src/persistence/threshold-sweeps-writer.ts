import { getSupabaseClient } from './supabase-client';
import { ThresholdSweepResult } from './types';

export class ThresholdSweepsWriter {
    private client = getSupabaseClient();
    private tableName = 'hal_threshold_sweeps';

    async write(record: ThresholdSweepResult) {
        const { error } = await this.client.from(this.tableName).insert(record);
        if (error) {
            console.error(`[ThresholdSweepsWriter] Failed to write: ${error.message}`);
            throw error;
        }
        console.log(`[ThresholdSweepsWriter] Wrote 1 record.`);
    }

    async writeMany(records: ThresholdSweepResult[]) {
        if (records.length === 0) return;

        const { error } = await this.client.from(this.tableName).insert(records);
        if (error) {
            console.error(`[ThresholdSweepsWriter] Failed to write batch: ${error.message}`);
            throw error;
        }
        console.log(`[ThresholdSweepsWriter] Wrote ${records.length} records.`);
    }
}
