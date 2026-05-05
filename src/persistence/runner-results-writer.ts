import { getSupabaseClient } from './supabase-client';
import { RunnerResult } from './types';

export class RunnerResultsWriter {
    private client = getSupabaseClient();
    private tableName = 'hal_runner_results';

    async write(record: RunnerResult) {
        const { error } = await this.client.from(this.tableName).insert(record);
        if (error) {
            console.error(`[RunnerResultsWriter] Failed to write: ${error.message}`);
            throw error;
        }
        console.log(`[RunnerResultsWriter] Wrote 1 record.`);
    }

    async writeMany(records: RunnerResult[]) {
        if (records.length === 0) return;

        const { error } = await this.client.from(this.tableName).insert(records);
        if (error) {
            console.error(`[RunnerResultsWriter] Failed to write batch: ${error.message}`);
            throw error;
        }
        console.log(`[RunnerResultsWriter] Wrote ${records.length} records.`);
    }
}
