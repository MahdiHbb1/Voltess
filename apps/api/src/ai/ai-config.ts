import type { AiMode } from '@voltess/contracts';

export const AI_SCENARIOS = [
  'success',
  'low_confidence',
  'insufficient_data',
  'provider_error',
] as const;

export type AiScenario = (typeof AI_SCENARIOS)[number];

export const AI_CONFIG = 'VOLTESS_AI_CONFIG';

export interface AiConfig {
  mode: AiMode;
  defaultScenario: AiScenario;
  allowScenarioOverride: boolean;
  geminiApiKey?: string;
  assemblyaiApiKey?: string;
}

export function isAiScenario(value: string): value is AiScenario {
  return (AI_SCENARIOS as readonly string[]).includes(value);
}

function parseMode(value: string): AiMode {
  if (value === 'mock' || value === 'hybrid' || value === 'live') {
    return value;
  }
  throw new Error(`AI_MODE tidak valid: "${value}". Gunakan mock, hybrid, atau live.`);
}

function parseScenario(value: string): AiScenario {
  if (isAiScenario(value)) {
    return value;
  }
  throw new Error(
    `AI_SCENARIO tidak valid: "${value}". Gunakan success, low_confidence, insufficient_data, atau provider_error.`,
  );
}

/**
 * Mock adalah mode default untuk pengembangan. Mock ditolak di pilot/produksi
 * agar demo tidak pernah memakai angka contoh pada data pengguna.
 */
export function resolveAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  const mode = parseMode((env.AI_MODE ?? 'mock').toLowerCase());
  const appEnv = (env.APP_ENV ?? env.NODE_ENV ?? 'development').toLowerCase();
  const isProtectedEnvironment = appEnv === 'pilot' || appEnv === 'production';
  const defaultScenario = parseScenario((env.AI_SCENARIO ?? 'success').toLowerCase());

  if (mode === 'mock' && isProtectedEnvironment) {
    throw new Error(
      `AI_MODE=mock tidak diizinkan saat APP_ENV=${appEnv}. Set AI_MODE=live atau hybrid untuk pilot/produksi.`,
    );
  }

  // Validate API keys when live mode is enabled
  const geminiApiKey = env.GEMINI_API_KEY;
  const assemblyaiApiKey = env.ASSEMBLYAI_API_KEY;

  if (mode === 'live') {
    const missingKeys: string[] = [];
    
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      missingKeys.push('GEMINI_API_KEY');
    }
    
    if (!assemblyaiApiKey || assemblyaiApiKey.trim() === '') {
      missingKeys.push('ASSEMBLYAI_API_KEY');
    }

    if (missingKeys.length > 0) {
      throw new Error(
        `AI_MODE=live membutuhkan API keys. Keys yang hilang: ${missingKeys.join(', ')}.\n` +
        `Dapatkan keys dari:\n` +
        `  - Gemini: https://aistudio.google.com/app/apikey\n` +
        `  - AssemblyAI: https://www.assemblyai.com/dashboard\n` +
        `Tambahkan ke .env atau environment variables.`
      );
    }
  }

  return {
    mode,
    defaultScenario,
    allowScenarioOverride: mode === 'mock' && !isProtectedEnvironment,
    geminiApiKey,
    assemblyaiApiKey,
  };
}
