// Google Vision adapter - OCR for P1-P3
// Free tier: 1000 units/month
// Features: Text Detection

const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  keyFilename: undefined,
  apiKey: process.env.GOOGLE_VISION_API_KEY
});

// P1: Struk → JSON (using OCR + parsing)
async function ocr(payload) {
  const [result] = await client.textDetection({
    image: { content: payload.imageBase64 }
  });
  
  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) {
    throw new Error('Tidak ada text terdeteksi. Coba foto ulang dengan pencahayaan lebih baik.');
  }
  
  const fullText = detections[0].description;
  
  // Simple parsing
  const lines = fullText.split('\n');
  const dateMatch = fullText.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  const totalMatch = fullText.match(/total[:\s]*rp?\.?\s*([\d.,]+)/i);
  
  return {
    tanggal: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
    toko: lines[0] || 'Unknown Store',
    items: [{ nama: 'Item dari struk', qty: 1, harga: 0 }],
    total: totalMatch ? parseInt(totalMatch[1].replace(/[.,]/g, '')) : 0,
    raw_text: fullText
  };
}

// P2: Tag catatan (OCR text → Groq for tags)
async function tagNote(payload) {
  if (payload.text) {
    const Groq = require('groq-sdk');
    const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groqClient.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ 
        role: 'user', 
        content: `Extract 3-5 relevant tags (lowercase, bahasa Indonesia) from: "${payload.text}". Return JSON array only.` 
      }],
      temperature: 0.5,
      max_tokens: 100
    });
    
    const response = completion.choices[0].message.content;
    const tags = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    return tags;
  }
  
  const [result] = await client.textDetection({
    image: { content: payload.imageBase64 }
  });
  
  const text = result.textAnnotations?.[0]?.description || '';
  return tagNote({ text });
}

// P3: Ringkas buku (OCR + summarize)
async function summarizeBook(payload) {
  let text = payload.text;
  
  if (payload.imageBase64) {
    const [result] = await client.textDetection({
      image: { content: payload.imageBase64 }
    });
    text = result.textAnnotations?.[0]?.description || '';
  }
  
  if (!text) {
    throw new Error('Tidak ada text untuk diringkas.');
  }
  
  const Groq = require('groq-sdk');
  const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const completion = await groqClient.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [{ 
      role: 'user', 
      content: `Ringkas halaman buku bisnis ini dalam 2-3 kalimat:\n\n${text.substring(0, 2000)}` 
    }],
    temperature: 0.7,
    max_tokens: 200
  });
  
  return completion.choices[0].message.content;
}

module.exports = { ocr, tagNote, summarizeBook };
