/** Storage config - S3-compatible */
export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  signedUrlExpiry: number; // seconds
}

export const storageConfig: StorageConfig = {
  bucket: process.env.S3_BUCKET || 'voltra-captures',
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  signedUrlExpiry: 3600, // 1 hour
};

/** Queue config - BullMQ */
export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export const queueConfig: QueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
};
