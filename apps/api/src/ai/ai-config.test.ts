import { describe, expect, it } from 'vitest';
import { resolveAiConfig } from './ai-config';

describe('resolveAiConfig', () => {
  it('defaults to mock and success in development', () => {
    const config = resolveAiConfig({});

    expect(config).toEqual({
      mode: 'mock',
      defaultScenario: 'success',
      allowScenarioOverride: true,
      geminiApiKey: undefined,
      assemblyaiApiKey: undefined,
    });
  });

  it('rejects mock in pilot', () => {
    expect(() => resolveAiConfig({ APP_ENV: 'pilot', AI_MODE: 'mock' })).toThrow(
      /tidak diizinkan/,
    );
  });

  it('rejects mock in production via NODE_ENV', () => {
    expect(() => resolveAiConfig({ NODE_ENV: 'production', AI_MODE: 'mock' })).toThrow(
      /tidak diizinkan/,
    );
  });

  it('allows live in production with valid API keys', () => {
    const config = resolveAiConfig({
      NODE_ENV: 'production',
      AI_MODE: 'live',
      GEMINI_API_KEY: 'test-gemini-key',
      ASSEMBLYAI_API_KEY: 'test-assemblyai-key',
      GROQ_API_KEY: 'test-groq-key',
    });

    expect(config.mode).toBe('live');
    expect(config.allowScenarioOverride).toBe(false);
    expect(config.geminiApiKey).toBe('test-gemini-key');
    expect(config.assemblyaiApiKey).toBe('test-assemblyai-key');
  });

  it('rejects live mode without GEMINI_API_KEY', () => {
    expect(() =>
      resolveAiConfig({
        AI_MODE: 'live',
        ASSEMBLYAI_API_KEY: 'test-key',
      }),
    ).toThrow(/GEMINI_API_KEY/);
  });

  it('rejects live mode without ASSEMBLYAI_API_KEY', () => {
    expect(() =>
      resolveAiConfig({
        AI_MODE: 'live',
        GEMINI_API_KEY: 'test-key',
      }),
    ).toThrow(/ASSEMBLYAI_API_KEY/);
  });

  it('rejects live mode without any API keys', () => {
    expect(() =>
      resolveAiConfig({
        AI_MODE: 'live',
      }),
    ).toThrow(/GEMINI_API_KEY, ASSEMBLYAI_API_KEY/);
  });

  it('rejects live mode with empty API keys', () => {
    expect(() =>
      resolveAiConfig({
        AI_MODE: 'live',
        GEMINI_API_KEY: '  ',
        ASSEMBLYAI_API_KEY: '',
      }),
    ).toThrow(/GEMINI_API_KEY, ASSEMBLYAI_API_KEY/);
  });

  it('allows hybrid with only a Gemini key', () => {
    const config = resolveAiConfig({
      AI_MODE: 'hybrid',
      GEMINI_API_KEY: 'test-gemini-key',
    });

    expect(config.mode).toBe('hybrid');
    expect(config.allowScenarioOverride).toBe(true);
    expect(config.geminiApiKey).toBe('test-gemini-key');
    expect(config.assemblyaiApiKey).toBeUndefined();
  });

  it('rejects hybrid without GEMINI_API_KEY', () => {
    expect(() => resolveAiConfig({ AI_MODE: 'hybrid' })).toThrow(/GEMINI_API_KEY/);
  });

  it('rejects unknown modes and scenarios', () => {
    expect(() => resolveAiConfig({ AI_MODE: 'magic' })).toThrow(/AI_MODE/);
    expect(() => resolveAiConfig({ AI_SCENARIO: 'perfect' })).toThrow(/AI_SCENARIO/);
  });
});
