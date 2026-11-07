// AI Gateway - Priority-based routing
// P1-P3: OCR → Google Vision + Groq
// P4-P5: LLM → Groq
// P6-P8: STT → AssemblyAI

require('dotenv').config();

const vision = require('./adapters/vision-groq');
const groq = require('./adapters/groq');
const assemblyai = require('./adapters/assemblyai');
const tts = require('./adapters/tts-mock');
const terra = require('./adapters/terra-mock');
const { logUsage } = require('../usage-tracker');
const { checkQuota } = require('../rate-limiter');

// Rate limits (per day)
const limits = {
  groq: { max: 14400, used: 0, resetAt: null, note: 'Groq 14.4K RPD' },
  vision: { max: 1000, used: 0, resetAt: null, note: 'Vision 1K/month' },
  assemblyai: { max: 185 * 3600, used: 0, resetAt: null }
};

function resetIfNeeded(service) {
  const now = Date.now();
  if (!limits[service].resetAt || now >= limits[service].resetAt) {
    limits[service].used = 0;
    limits[service].resetAt = now + 86400000; // +24h
  }
}

function checkLimit(service, cost = 1) {
  resetIfNeeded(service);
  if (limits[service].used + cost > limits[service].max) {
    throw new Error(`${service} daily limit exceeded`);
  }
  limits[service].used += cost;
}

async function route(priority, payload, userId = null) {
  const start = Date.now();
  let result, error;
  
  try {
    // Skip DB quota check for test (ponytail: enable when Supabase ready)
    // await checkQuota(userId, priority);
    
    // P1-P5: Vision+Groq, P6-P8: AssemblyAI, P9: TTS, P10: Terra
    if (priority <= 5) {
      if (priority <= 3) {
        checkLimit('vision');
        if (priority === 1) result = await vision.ocr(payload);
        else if (priority === 2) result = await vision.tagNote(payload);
        else if (priority === 3) result = await vision.summarizeBook(payload);
      } else {
        checkLimit('groq');
        if (priority === 4) result = await groq.explain(payload);
        else if (priority === 5) result = await groq.ask(payload);
      }
    } else if (priority <= 8) {
      const duration = payload.duration || 60;
      checkLimit('assemblyai', duration);
      if (priority === 6) result = await assemblyai.transcribe(payload);
      else if (priority === 7) result = await assemblyai.voiceCommand(payload);
      else if (priority === 8) result = await assemblyai.meeting(payload);
    } else if (priority === 9) {
      result = await tts.synthesize(payload);
    } else if (priority === 10) {
      result = await terra.chat(payload);
    } else {
      throw new Error(`Invalid priority: ${priority}`);
    }
    
    await logUsage(userId, priority, 'success', { latency_ms: Date.now() - start });
    return result;
  } catch (e) {
    error = e;
    await logUsage(userId, priority, 'error', { error: e.message, latency_ms: Date.now() - start });
    throw e;
  }
}

module.exports = { route, limits };
