## Setup Summary untuk Tim

**Problem:**
Gemini API butuh billing ($5-10/month). Key gratis format baru gagal authenticate.

**Solution: Hybrid Groq + Google Vision (100% Free)**

**Stack:**
- P1-P3 OCR → Google Vision API (1000 calls/month free)
- P4-P5 AI Chat/Explain → Groq Llama 3.1 (14,400 calls/day free)
- P6-P8 STT → AssemblyAI (185 hours free)
- P9 TTS → Mock (silent fallback)
- P10 Terra → FAQ rules

**Cost pilot 3 UMKM:**
- Vision: 900 images/month < 1K limit = $0
- Groq: ~300 calls/day < 14K limit = $0
- Total: **$0**

**Setup needed:**
1. Groq API key (daftar groq.com)
2. Google Vision API enable + key
3. Code update (2 adapters)

**Timeline:** ~2 jam setup + test

Proceed?
