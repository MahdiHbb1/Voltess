import { describe, it, expect, beforeEach } from 'vitest';
import { QueueService } from './queue.service';
import type { Job } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(() => {
    service = new QueueService();
    service.clearAll();
  });

  describe('add', () => {
    it('adds job to queue with queued status', async () => {
      const job = await service.add('ocr', 'ocr-label', { captureId: 'cap_1' });

      expect(job.id).toBeTruthy();
      expect(job.name).toBe('ocr-label');
      expect(job.status).toBe('queued');
      expect(job.attempts).toBe(0);
    });

    it('uses custom jobId when provided', async () => {
      const job = await service.add('ocr', 'ocr-label', {}, { jobId: 'custom_id' });
      expect(job.id).toBe('custom_id');
    });
  });

  describe('getJob', () => {
    it('retrieves job by ID', async () => {
      const created = await service.add('ocr', 'ocr-label', { captureId: 'cap_1' });
      const retrieved = service.getJob(created.id);
      expect(retrieved).toEqual(created);
    });

    it('returns undefined for unknown ID', () => {
      expect(service.getJob('unknown')).toBeUndefined();
    });
  });

  describe('updateJob', () => {
    it('updates job status', async () => {
      const job = await service.add('ocr', 'ocr-label', {});
      const updated = service.updateJob(job.id, { status: 'processing' });
      expect(updated?.status).toBe('processing');
    });

    it('returns undefined for unknown ID', () => {
      expect(service.updateJob('unknown', { status: 'completed' })).toBeUndefined();
    });
  });

  describe('processNext', () => {
    it('processes queued job and marks completed', async () => {
      await service.add('ocr', 'ocr-label', { captureId: 'cap_1' });

      const processor = async (job: Job) => {
        return { result: 'success' };
      };

      const processed = await service.processNext('ocr', processor);
      expect(processed?.status).toBe('completed');
      expect(processed?.result).toEqual({ result: 'success' });
      expect(processed?.attempts).toBe(1);
    });

    it('retries failed job up to maxAttempts', async () => {
      await service.add('ocr', 'ocr-label', {});

      let callCount = 0;
      const processor = async () => {
        callCount++;
        throw new Error('Processing failed');
      };

      // Attempt 1
      let result = await service.processNext('ocr', processor);
      expect(result?.status).toBe('queued');
      expect(result?.attempts).toBe(1);

      // Attempt 2
      result = await service.processNext('ocr', processor);
      expect(result?.status).toBe('queued');
      expect(result?.attempts).toBe(2);

      // Attempt 3 - final, should fail
      result = await service.processNext('ocr', processor);
      expect(result?.status).toBe('failed');
      expect(result?.attempts).toBe(3);
      expect(result?.error).toBe('Processing failed');
      expect(callCount).toBe(3);
    });

    it('returns null when no queued jobs', async () => {
      const result = await service.processNext('ocr', async () => ({}));
      expect(result).toBeNull();
    });
  });

  describe('getQueueJobs', () => {
    it('returns all jobs in queue', async () => {
      await service.add('ocr', 'job1', {});
      await service.add('ocr', 'job2', {});
      await service.add('other', 'job3', {});

      const jobs = service.getQueueJobs('ocr');
      expect(jobs).toHaveLength(2);
    });

    it('returns empty array for empty queue', () => {
      expect(service.getQueueJobs('empty')).toEqual([]);
    });
  });
});
