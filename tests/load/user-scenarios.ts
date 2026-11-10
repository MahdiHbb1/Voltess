/**
 * User scenarios for load testing
 * Simulates typical UMKM usage patterns
 */

export interface UserScenario {
  name: string;
  weight: number; // relative probability
  actions: ScenarioAction[];
}

export interface ScenarioAction {
  type: 'ocr-meter' | 'ocr-label' | 'ocr-token' | 'stt-extract' | 'estimate' | 'recommend' | 'explain' | 'ask';
  payload: Record<string, unknown>;
  delayMs?: number; // delay after this action
}

export interface DailyUsagePattern {
  // Typical usage per UMKM per day
  ocrMeterPerWeek: number;     // 2 OCR meter reads per week
  ocrLabelPerWeek: number;     // 1 OCR label read per week
  ocrTokenPerWeek: number;     // 2 OCR token reads per week
  sttExtractPerDay: number;    // 3 STT extracts per day
  estimatePerDay: number;      // 5 estimates per day
  recommendPerDay: number;     // 2 recommendations per day
  explainPerDay: number;       // 5 explains per day
  askPerDay: number;           // 3 asks per day
}

/**
 * Default daily usage pattern for one UMKM
 * Based on todo requirements:
 * - 2 OCR/week
 * - 5 Explain/day
 * - 3 STT/day
 * - 2 Terra/day (recommend)
 */
export const DEFAULT_USAGE_PATTERN: DailyUsagePattern = {
  ocrMeterPerWeek: 2,
  ocrLabelPerWeek: 1,
  ocrTokenPerWeek: 2,
  sttExtractPerDay: 3,
  estimatePerDay: 5,
  recommendPerDay: 2,
  explainPerDay: 5,
  askPerDay: 3,
};

/**
 * Convert weekly rates to daily rates
 */
export function getDailyRates(pattern: DailyUsagePattern) {
  return {
    ocrMeterPerDay: pattern.ocrMeterPerWeek / 7,
    ocrLabelPerDay: pattern.ocrLabelPerWeek / 7,
    ocrTokenPerDay: pattern.ocrTokenPerWeek / 7,
    sttExtractPerDay: pattern.sttExtractPerDay,
    estimatePerDay: pattern.estimatePerDay,
    recommendPerDay: pattern.recommendPerDay,
    explainPerDay: pattern.explainPerDay,
    askPerDay: pattern.askPerDay,
  };
}

/**
 * Calculate total daily requests per user
 */
export function getTotalDailyRequests(pattern: DailyUsagePattern): number {
  const rates = getDailyRates(pattern);
  return Object.values(rates).reduce((sum, val) => sum + val, 0);
}

/**
 * User personas for load testing
 */
export const USER_PERSONAS: UserScenario[] = [
  {
    name: 'light-user',
    weight: 0.4,
    actions: [
      { type: 'ocr-meter', payload: { meter_type: 'prabayar' }, delayMs: 1000 },
      { type: 'estimate', payload: { business_id: 'test-biz', window: { from: '2026-01-01', to: '2026-01-31' }, appliances: [] }, delayMs: 500 },
      { type: 'explain', payload: { business_id: 'test-biz', kind: 'estimate', result: {} }, delayMs: 500 },
    ],
  },
  {
    name: 'medium-user',
    weight: 0.4,
    actions: [
      { type: 'ocr-meter', payload: { meter_type: 'prabayar' }, delayMs: 1000 },
      { type: 'ocr-label', payload: { appliance_hint: 'AC' }, delayMs: 1000 },
      { type: 'estimate', payload: { business_id: 'test-biz', window: { from: '2026-01-01', to: '2026-01-31' }, appliances: [] }, delayMs: 500 },
      { type: 'recommend', payload: { business_id: 'test-biz', estimate: {}, template_id: 'default', unit_label: 'kWh' }, delayMs: 500 },
      { type: 'explain', payload: { business_id: 'test-biz', kind: 'recommendation', result: {} }, delayMs: 500 },
      { type: 'ask', payload: { business_id: 'test-biz', question: 'How to save energy?' }, delayMs: 500 },
    ],
  },
  {
    name: 'heavy-user',
    weight: 0.2,
    actions: [
      { type: 'ocr-meter', payload: { meter_type: 'pascabayar' }, delayMs: 1000 },
      { type: 'ocr-token', payload: {}, delayMs: 1000 },
      { type: 'stt-extract', payload: { audio_ref: 'data:audio/mp3;base64,dummy', appliances: [] }, delayMs: 2000 },
      { type: 'estimate', payload: { business_id: 'test-biz', window: { from: '2026-01-01', to: '2026-01-31' }, appliances: [] }, delayMs: 500 },
      { type: 'recommend', payload: { business_id: 'test-biz', estimate: {}, template_id: 'default', unit_label: 'kWh' }, delayMs: 500 },
      { type: 'explain', payload: { business_id: 'test-biz', kind: 'estimate', result: {} }, delayMs: 500 },
      { type: 'ask', payload: { business_id: 'test-biz', question: 'What is my usage?' }, delayMs: 500 },
      { type: 'ask', payload: { business_id: 'test-biz', question: 'How to optimize?' }, delayMs: 500 },
    ],
  },
];

/**
 * Generate a random user scenario based on weights
 */
export function pickRandomScenario(): UserScenario {
  const rand = Math.random();
  let cumulative = 0;
  for (const scenario of USER_PERSONAS) {
    cumulative += scenario.weight;
    if (rand <= cumulative) {
      return scenario;
    }
  }
  return USER_PERSONAS[USER_PERSONAS.length - 1];
}

/**
 * Generate actions for a simulated day for N users
 */
export function generateDailyActions(userCount: number, pattern: DailyUsagePattern = DEFAULT_USAGE_PATTERN): ScenarioAction[] {
  const actions: ScenarioAction[] = [];
  const rates = getDailyRates(pattern);

  for (let userId = 0; userId < userCount; userId++) {
    // OCR Meter
    for (let i = 0; i < rates.ocrMeterPerDay; i++) {
      actions.push({
        type: 'ocr-meter',
        payload: { meter_type: Math.random() > 0.5 ? 'prabayar' : 'pascabayar' },
      });
    }

    // OCR Label
    for (let i = 0; i < rates.ocrLabelPerDay; i++) {
      actions.push({
        type: 'ocr-label',
        payload: { appliance_hint: 'AC' },
      });
    }

    // OCR Token
    for (let i = 0; i < rates.ocrTokenPerDay; i++) {
      actions.push({
        type: 'ocr-token',
        payload: {},
      });
    }

    // STT Extract
    for (let i = 0; i < rates.sttExtractPerDay; i++) {
      actions.push({
        type: 'stt-extract',
        payload: { audio_ref: 'data:audio/mp3;base64,dummy', appliances: [] },
      });
    }

    // Estimate
    for (let i = 0; i < rates.estimatePerDay; i++) {
      actions.push({
        type: 'estimate',
        payload: { business_id: `test-biz-${userId}`, window: { from: '2026-01-01', to: '2026-01-31' }, appliances: [] },
      });
    }

    // Recommend
    for (let i = 0; i < rates.recommendPerDay; i++) {
      actions.push({
        type: 'recommend',
        payload: { business_id: `test-biz-${userId}`, estimate: {}, template_id: 'default', unit_label: 'kWh' },
      });
    }

    // Explain
    for (let i = 0; i < rates.explainPerDay; i++) {
      actions.push({
        type: 'explain',
        payload: { business_id: `test-biz-${userId}`, kind: 'estimate', result: {} },
      });
    }

    // Ask
    for (let i = 0; i < rates.askPerDay; i++) {
      actions.push({
        type: 'ask',
        payload: { business_id: `test-biz-${userId}`, question: 'How to save energy?' },
      });
    }
  }

  // Shuffle actions to simulate realistic interleaving
  return shuffleArray(actions);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate expected quota usage for given user count
 */
export function calculateExpectedQuotaUsage(userCount: number, pattern: DailyUsagePattern = DEFAULT_USAGE_PATTERN) {
  const rates = getDailyRates(pattern);
  
  // Gemini OCR requests (meter + label + token)
  const geminiOcrRequests = userCount * (rates.ocrMeterPerDay + rates.ocrLabelPerDay + rates.ocrTokenPerDay);
  
  // AssemblyAI STT requests
  const assemblyAiSttRequests = userCount * rates.sttExtractPerDay;
  
  // Groq LLM requests (recommend + explain + ask)
  const groqLlmRequests = userCount * (rates.recommendPerDay + rates.explainPerDay + rates.askPerDay);
  
  // Estimate is local (energy-calc), no external quota

  return {
    'gemini-ocr': {
      requests: Math.round(geminiOcrRequests),
      limit: 500,
      percentage: (geminiOcrRequests / 500) * 100,
    },
    'assemblyai-stt': {
      requests: Math.round(assemblyAiSttRequests),
      limit: 185,
      percentage: (assemblyAiSttRequests / 185) * 100,
    },
    'groq-llm': {
      requests: Math.round(groqLlmRequests),
      limit: 500,
      percentage: (groqLlmRequests / 500) * 100,
    },
  };
}