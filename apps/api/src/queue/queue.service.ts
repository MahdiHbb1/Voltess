import { randomUUID } from 'node:crypto';

/** Job status */
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/** Job data */
export interface Job<T = unknown> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Mock queue - in-memory job tracking */
export class QueueService {
  private readonly jobs = new Map<string, Job>();
  private readonly queues = new Map<string, string[]>(); // queueName -> jobIds

  /** Add job to queue */
  async add<T>(queueName: string, jobName: string, data: T, opts?: { jobId?: string }): Promise<Job<T>> {
    const jobId = opts?.jobId || randomUUID();
    
    const job: Job<T> = {
      id: jobId,
      name: jobName,
      data,
      status: 'queued',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, job);
    
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    this.queues.get(queueName)!.push(jobId);

    return job;
  }

  /** Get job by ID */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /** Update job status */
  updateJob(jobId: string, updates: Partial<Job>): Job | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    Object.assign(job, { ...updates, updatedAt: new Date() });
    return job;
  }

  /** Get all jobs in queue */
  getQueueJobs(queueName: string): Job[] {
    const jobIds = this.queues.get(queueName) || [];
    return jobIds.map(id => this.jobs.get(id)).filter(Boolean) as Job[];
  }

  /** Process next job - for worker simulation */
  async processNext(queueName: string, processor: (job: Job) => Promise<unknown>): Promise<Job | null> {
    const jobIds = this.queues.get(queueName) || [];
    const queuedJobId = jobIds.find(id => {
      const job = this.jobs.get(id);
      return job?.status === 'queued';
    });

    if (!queuedJobId) return null;

    const job = this.jobs.get(queuedJobId)!;
    this.updateJob(job.id, { status: 'processing', attempts: job.attempts + 1 });

    try {
      const result = await processor(job);
      this.updateJob(job.id, { status: 'completed', result });
      return this.jobs.get(job.id)!;
    } catch (error) {
      const shouldRetry = job.attempts < job.maxAttempts;
      this.updateJob(job.id, {
        status: shouldRetry ? 'queued' : 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      return this.jobs.get(job.id)!;
    }
  }

  /** Clear all - for tests */
  clearAll(): void {
    this.jobs.clear();
    this.queues.clear();
  }
}
