import * as path from 'path';

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const basename = path.basename(filename);
  // Remove dangerous characters
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function sanitizeFilePath(filepath: string): string {
  const normalized = path.normalize(filepath);
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error('Invalid file path');
  }
  return normalized;
}
