// TTS Mock adapter - P9 fallback
// ponytail: add real TTS (Google Cloud TTS, ElevenLabs) when voice replies become critical

async function synthesize(payload) {
  // Silent fallback: return empty audio URL
  // Client should handle gracefully (show text only)
  return {
    audioUrl: null,
    text: payload.text,
    language: 'id',
    mock: true
  };
}

module.exports = { synthesize };
