export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface ConversionJob {
    id: string;
    fileId: string;
    inputPath: string;
    outputPath: string;
    inputFormat: string;
    outputFormat: string;
    status: JobStatus;
    progress: number;
    error?: string;
    token: string;
    createdAt: number;
    completedAt?: number;
}

type JobProcessor = (job: ConversionJob) => Promise<void>;

class ConversionQueue {
    private jobs: Map<string, ConversionJob> = new Map();
    private queue: string[] = [];
    private activeCount = 0;
    private maxConcurrent: number;
    private processor: JobProcessor | null = null;

    constructor() {
        this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_JOBS || "3", 10);
    }

    setProcessor(processor: JobProcessor) {
        this.processor = processor;
    }

    addJob(job: ConversionJob): void {
        this.jobs.set(job.id, job);
        this.queue.push(job.id);
        this.processNext();
    }

    getJob(id: string): ConversionJob | undefined {
        return this.jobs.get(id);
    }

    updateJob(id: string, updates: Partial<ConversionJob>): void {
        const job = this.jobs.get(id);
        if (job) {
            Object.assign(job, updates);
        }
    }

    private async processNext(): Promise<void> {
        if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const jobId = this.queue.shift();
        if (!jobId) return;

        const job = this.jobs.get(jobId);
        if (!job || !this.processor) return;

        this.activeCount++;
        job.status = "processing";
        job.progress = 0;

        try {
            await this.processor(job);
            job.status = "completed";
            job.progress = 100;
            job.completedAt = Date.now();
        } catch (error) {
            job.status = "failed";
            job.error = error instanceof Error ? error.message : "Conversion failed";
        } finally {
            this.activeCount--;
            this.processNext();
        }
    }

    getStats() {
        return {
            total: this.jobs.size,
            queued: this.queue.length,
            active: this.activeCount,
            maxConcurrent: this.maxConcurrent,
        };
    }

    cleanup(maxAgeMs: number = 30 * 60 * 1000): void {
        const now = Date.now();
        for (const [id, job] of this.jobs) {
            if (now - job.createdAt > maxAgeMs) {
                this.jobs.delete(id);
            }
        }
    }
}

// Singleton
const globalQueue = globalThis as unknown as { __conversionQueue?: ConversionQueue };
if (!globalQueue.__conversionQueue) {
    globalQueue.__conversionQueue = new ConversionQueue();
}

export const conversionQueue: ConversionQueue = globalQueue.__conversionQueue;
