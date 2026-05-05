import { getSupabaseClient } from './supabase-client';

export interface BenchmarkRecord {
    run_id: string;
    prompt_id: string;
    benchmark_source: string;
    generated_answer: string;
    provider: string;
    model: string;
    latency_ms: number;
    hal_vetoed: boolean;
    comma_gap: number;
    hal_diagnostics: any;
    created_at?: string;
}

export class BenchmarkResultsWriter {
    private client = getSupabaseClient();
    private tableName = 'hal_benchmark_results';

    async write(record: BenchmarkRecord) {
        if (!record.created_at) record.created_at = new Date().toISOString();
        const { error } = await this.client.from(this.tableName).insert(record);
        if (error) {
            console.error(`[BenchmarkResultsWriter] Failed to write: ${error.message}`);
            throw error;
        }
        console.log(`[BenchmarkResultsWriter] Wrote 1 record.`);
    }

    async writeMany(records: BenchmarkRecord[]) {
        if (records.length === 0) return;
        records.forEach(r => { if (!r.created_at) r.created_at = new Date().toISOString(); });
        
        const { error } = await this.client.from(this.tableName).insert(records);
        if (error) {
            console.error(`[BenchmarkResultsWriter] Failed to write batch: ${error.message}`);
            throw error;
        }
        console.log(`[BenchmarkResultsWriter] Wrote ${records.length} records.`);
    }
}
