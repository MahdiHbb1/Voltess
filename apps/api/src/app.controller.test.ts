import { describe, expect, it } from 'vitest';
import { CONTRACT_VERSION } from '@voltess/contracts';
import { ENGINE_VERSION } from '@voltess/energy-calc';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns health metadata from shared packages', () => {
    const result = new AppController().health();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('voltess-api');
    expect(result.contractVersion).toBe(CONTRACT_VERSION);
    expect(result.engineVersion).toBe(ENGINE_VERSION);
  });
});
