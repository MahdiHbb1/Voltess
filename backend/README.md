# AI Gateway API

Backend REST API untuk Majuon AI features.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: tambahkan GEMINI_API_KEY dan ASSEMBLYAI_API_KEY
npm start
```

Server run di `http://localhost:3000`

## Endpoints

Base URL: `/api/ai`

### P1: OCR Struk → JSON
```bash
POST /api/ai/ocr
Body: { "imageBase64": "...", "mimeType": "image/jpeg" }
Response: { "tanggal": "2026-11-06", "toko": "...", "items": [...], "total": 0 }
```

### P2: Tag Catatan
```bash
POST /api/ai/tag
Body: { "text": "Beli bahan baku 500rb..." }
Response: { "tags": ["bahan-baku", "pembelian", ...] }
```

### P3: Ringkas Buku
```bash
POST /api/ai/summarize
Body: { "text": "..." } atau { "imageBase64": "...", "mimeType": "image/jpeg" }
Response: { "summary": "..." }
```

### P4: Explain Keuangan
```bash
POST /api/ai/explain
Body: { "data": { "revenue": 50000000, "profit": 10000000 } }
Response: { "explanation": "..." }
```

### P5: Ask/Chat
```bash
POST /api/ai/ask
Body: { "question": "Bagaimana cara...", "context": { "revenue": 50000000 } }
Response: { "answer": "..." }
```

### P6: STT Voice Note
```bash
POST /api/ai/transcribe
Body: { "audioUrl": "https://..." } atau { "audioBase64": "...", "duration": 60 }
Response: { "text": "...", "duration": 60, "confidence": 0.95, "words": [...] }
```

### P7: Voice Command
```bash
POST /api/ai/voice-command
Body: { "audioUrl": "https://..." }
Response: { "action": "create", "entity": "note", "transcript": "..." }
```

### P8: Meeting Transcribe
```bash
POST /api/ai/meeting
Body: { "audioUrl": "https://..." }
Response: { "transcript": "...", "duration": 1800, "wordCount": 3000 }
```

### P9: TTS (mock - silent fallback)
```bash
POST /api/ai/synthesize
Body: { "text": "Test audio" }
Response: { "audioUrl": null, "text": "Test audio", "mock": true }
```

### P10: Terra Chat
```bash
POST /api/ai/chat
Body: { "message": "Apa itu omzet?", "context": {...} }
Response: { "reply": "...", "matched": true, "source": "faq" }
```

### Rate Limits
```bash
GET /api/ai/limits
Response: { "gemini": { "max": 500, "used": 12, "resetAt": 1730890000000 }, ... }
```

## Health Check
```bash
GET /health
Response: { "status": "ok", "timestamp": "2026-11-06T10:30:00.000Z" }
```

## Rate Limits

- Gemini: 500 requests/day (auto-reset daily)
- AssemblyAI: 185 hours total (free tier)

Request over limit → 500 error: `"gemini daily limit exceeded"`
