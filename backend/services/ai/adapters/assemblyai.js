// AssemblyAI adapter - Speech-to-Text
// Free tier: 185 hours total

const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

// P6: Voice note → Text
async function transcribe(payload) {
  // SSRF protection: validate audioUrl
  if (payload.audioUrl) {
    try {
      const url = new URL(payload.audioUrl);
      if (url.protocol !== 'https:') {
        throw new Error('Hanya HTTPS yang diperbolehkan untuk audio URL');
      }
      if (url.hostname === 'localhost' || url.hostname.startsWith('127.') || 
          url.hostname.startsWith('169.254.') || url.hostname.startsWith('10.') ||
          url.hostname.startsWith('192.168.') || url.hostname.startsWith('172.')) {
        throw new Error('URL audio tidak valid');
      }
    } catch (e) {
      throw new Error('URL audio tidak valid: ' + e.message);
    }
  }

  const transcript = await client.transcripts.transcribe({
    audio: payload.audioUrl || payload.audioBase64,
    language_code: 'id', // Indonesian
    punctuate: true,
    format_text: true
  });

  if (transcript.status === 'error') {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  return {
    text: transcript.text,
    duration: transcript.audio_duration,
    confidence: transcript.confidence,
    words: transcript.words?.map(w => ({
      text: w.text,
      start: w.start,
      end: w.end,
      confidence: w.confidence
    }))
  };
}

// P7: Voice command → Action
async function voiceCommand(payload) {
  const result = await transcribe(payload);
  
  // Simple command extraction (ponytail: add NLU when patterns grow)
  const text = result.text.toLowerCase();
  const commands = {
    'tambah': { action: 'create', entity: null },
    'catat': { action: 'create', entity: 'note' },
    'hitung': { action: 'calculate', entity: null },
    'lihat': { action: 'read', entity: null },
    'cari': { action: 'search', entity: null }
  };

  for (const [keyword, cmd] of Object.entries(commands)) {
    if (text.includes(keyword)) {
      return { ...cmd, transcript: result.text, raw: result };
    }
  }

  return { action: 'unknown', transcript: result.text, raw: result };
}

// P8: Meeting → Summary
async function meeting(payload) {
  const result = await transcribe(payload);
  
  // ponytail: pass to Gemini for summarization when meeting format stabilizes
  // For now: return transcript with basic formatting
  return {
    transcript: result.text,
    duration: result.duration,
    wordCount: result.words?.length || 0,
    speakers: 1 // ponytail: add speaker diarization if multi-speaker meetings become common
  };
}

module.exports = { 
  transcribe,     // P6
  voiceCommand,   // P7
  meeting         // P8
};
