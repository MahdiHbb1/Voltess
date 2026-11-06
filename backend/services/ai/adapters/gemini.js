// Gemini adapter - OCR + Text LLM
// Free tier: Gemini 3.5 Flash-Lite (500 RPD, no billing needed)
// Trade-off: simpler quality vs 3.8, but accessible

const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// P1: Struk → JSON
async function ocr(payload) {
  const model = client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const prompt = `Extract data dari struk belanja. Output JSON:
{
  "tanggal": "YYYY-MM-DD",
  "toko": "nama",
  "items": [{"nama": "", "qty": 0, "harga": 0}],
  "total": 0
}

Tanggal sekarang: ${new Date().toISOString().split('T')[0]}`;

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType: payload.mimeType, data: payload.imageBase64 } }
  ]);
  
  const text = result.response.text();
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
}

// P2: Catatan → Tags
async function tagNote(payload) {
  const model = client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const prompt = `Buat tags dari catatan bisnis. Max 5 tags, bahasa Indonesia, lowercase, format: ["tag1", "tag2"].

Catatan: ${payload.text}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
}

// P3: Buku → Ringkasan
async function summarizeBook(payload) {
  const model = client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const prompt = `Buat ringkasan halaman buku bisnis. 2-3 kalimat, fokus poin penting.

${payload.imageBase64 ? 'Foto halaman terlampir.' : `Teks: ${payload.text}`}`;

  const parts = payload.imageBase64 
    ? [
        { text: prompt },
        { inlineData: { mimeType: payload.mimeType, data: payload.imageBase64 } }
      ]
    : [{ text: prompt }];

  const result = await model.generateContent(parts);
  return result.response.text();
}

// P4: Explain keuangan
async function explain(payload) {
  const model = client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const prompt = `Jelaskan data keuangan ini dalam bahasa Indonesia sederhana untuk pemilik UMKM:

${JSON.stringify(payload.data, null, 2)}

Maksimal 3 paragraf, fokus insight actionable.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// P5: Chat/Ask
async function ask(payload) {
  const model = client.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const systemPrompt = `Kamu asisten bisnis UMKM Indonesia. Jawab singkat, praktis, bahasa Indonesia.

Context bisnis user:
- Omzet: ${payload.context?.revenue || 'tidak diketahui'}
- Kategori: ${payload.context?.category || 'umum'}`;

  const result = await model.generateContent(`${systemPrompt}\n\nPertanyaan: ${payload.question}`);
  return result.response.text();
}

module.exports = { 
  ocr,           // P1
  text: ask,     // P4-P5 generic text
  tagNote,       // P2
  summarizeBook, // P3
  explain,       // P4
  ask            // P5
};
