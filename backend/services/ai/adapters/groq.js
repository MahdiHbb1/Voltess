// Groq adapter - LLM for P4-P5
// Free tier: 14,400 RPD, 200K tokens/day
// Model: GPT-OSS 20B (OpenAI open-weight)

const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// P4: Explain keuangan
async function explain(payload) {
  const prompt = `Jelaskan data keuangan ini dalam bahasa Indonesia sederhana untuk pemilik UMKM:

${JSON.stringify(payload.data, null, 2)}

Maksimal 3 paragraf, fokus insight actionable.`;

  const completion = await client.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  });

  return completion.choices[0].message.content;
}

// P5: Chat/Ask
async function ask(payload) {
  const systemPrompt = `Kamu asisten bisnis UMKM Indonesia. Jawab singkat, praktis, bahasa Indonesia.

Context bisnis user:
- Omzet: ${payload.context?.revenue || 'tidak diketahui'}
- Kategori: ${payload.context?.category || 'umum'}`;

  const completion = await client.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: payload.question }
    ],
    temperature: 0.8,
    max_tokens: 300
  });

  return completion.choices[0].message.content;
}

module.exports = { explain, ask };
