import { randomUUID } from 'node:crypto';

/** Mock S3 client - stub upload/signed URL */
export class StorageService {
  private readonly uploads = new Map<string, { key: string; size: number; contentType: string }>();

  /** Upload file - returns object key */
  async upload(
    file: Buffer,
    contentType: string,
    businessId: string,
    captureType: string,
  ): Promise<string> {
    const key = `${businessId}/${captureType}/${randomUUID()}`;
    this.uploads.set(key, {
      key,
      size: file.length,
      contentType,
    });
    // ponytail: S3 putObject when live, stub now
    return key;
  }

  /** Generate signed URL for private access */
  getSignedUrl(key: string, expiresIn: number = 3600): string {
    if (!this.uploads.has(key)) {
      throw new Error('Object not found');
    }
    // ponytail: S3 getSignedUrl when live, stub now
    return `https://stub-storage.voltess.local/${key}?expires=${Date.now() + expiresIn * 1000}`;
  }

  /** Check if object exists */
  exists(key: string): boolean {
    return this.uploads.has(key);
  }

  /** Clear all - for tests */
  clearAll(): void {
    this.uploads.clear();
  }
}
