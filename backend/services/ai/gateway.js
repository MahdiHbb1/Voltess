// AI Gateway - Priority-based routing
// P1-P3: OCR → Gemini Vision
// P4-P5: Text → Gemini Text
// P6-P8: STT → AssemblyAI

const gemini = require('./adapters/gemini-mock'); // ponytail: switch to ./gemini when key works
const assemblyai = require('./adapters/assemblyai');
const tts = require('./adapters/tts-mock');
const wati = require('./adapters/wati-mock');

// Rate limits (per day) - ponytail: remove manual tracking, rely on API errors
const limits = {
  gemini: { max: null, used: 0, note: 'Free tier rate-limited by API' },
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
  // Gemini: free tier, let API handle rate limits (will return 429)
  if (service === 'gemini') {
    limits.gemini.used += cost;
    return;
  }
  
  // AssemblyAI: track 185 hours total
  resetIfNeeded(service);
  if (limits[service].used + cost > limits[service].max) {
    throw new Error(`${service} daily limit exceeded`);
  }
  limits[service].used += cost;
}

async function route(priority, payload) {
  // P1-P5: Gemini, P6-P8: AssemblyAI, P9: TTS, P10: Wati
  if (priority <= 5) {
    checkLimit('gemini');
    if (priority === 1) return gemini.ocr(payload);
    if (priority === 2) return gemini.tagNote(payload);
    if (priority === 3) return gemini.summarizeBook(payload);
    if (priority === 4) return gemini.explain(payload);
    if (priority === 5) return gemini.ask(payload);
  }
  
  if (priority <= 8) {
    const duration = payload.duration || 60; // seconds
    checkLimit('assemblyai', duration);
    if (priority === 6) return assemblyai.transcribe(payload);
    if (priority === 7) return assemblyai.voiceCommand(payload);
    if (priority === 8) return assemblyai.meeting(payload);
  }
  
  if (priority === 9) {
    return tts.synthesize(payload); // Mock: silent fallback
  }
  
  if (priority === 10) {
    return wati.chat(payload); // FAQ rules → Gemini fallback
  }
  
  throw new Error(`Invalid priority: ${priority}`);
}

module.exports = { route, limits };
