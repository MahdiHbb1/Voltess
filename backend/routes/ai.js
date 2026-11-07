// AI Routes - expose gateway via REST
const express = require('express');
const router = express.Router();
const gateway = require('../services/ai/gateway');
const { verifyAuth } = require('../middleware/auth');

// Apply auth to all routes
router.use(verifyAuth);

// P1: OCR Struk → JSON
router.post('/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });
    
    const result = await gateway.route(1, { imageBase64, mimeType: mimeType || 'image/jpeg' }, req.userId);
    res.json(result);
  } catch (e) {
    console.error('OCR error:', e);
    res.status(500).json({ error: 'Gagal memproses gambar' });
  }
});

// P2: Tag Catatan
router.post('/tag', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    const tags = await gateway.route(2, { text }, req.userId);
    res.json({ tags });
  } catch (e) {
    console.error('Tag error:', e);
    res.status(500).json({ error: 'Gagal membuat tag' });
  }
});

// P3: Ringkas Buku
router.post('/summarize', async (req, res) => {
  try {
    const { text, imageBase64, mimeType } = req.body;
    if (!text && !imageBase64) return res.status(400).json({ error: 'text or image required' });
    
    const summary = await gateway.route(3, { text, imageBase64, mimeType }, req.userId);
    res.json({ summary });
  } catch (e) {
    console.error('Summarize error:', e);
    res.status(500).json({ error: 'Gagal meringkas teks' });
  }
});

// P4: Explain Keuangan
router.post('/explain', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'data required' });
    
    const explanation = await gateway.route(4, { data }, req.userId);
    res.json({ explanation });
  } catch (e) {
    console.error('Explain error:', e);
    res.status(500).json({ error: 'Gagal menjelaskan data' });
  }
});

// P5: Ask/Chat
router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });
    
    const answer = await gateway.route(5, { question, context }, req.userId);
    res.json({ answer });
  } catch (e) {
    console.error('Ask error:', e);
    res.status(500).json({ error: 'Gagal memproses pertanyaan' });
  }
});

// P6: STT Voice Note
router.post('/transcribe', async (req, res) => {
  try {
    const { audioUrl, audioBase64, duration } = req.body;
    if (!audioUrl && !audioBase64) return res.status(400).json({ error: 'audio required' });
    
    const result = await gateway.route(6, { audioUrl, audioBase64, duration }, req.userId);
    res.json(result);
  } catch (e) {
    console.error('Transcribe error:', e);
    res.status(500).json({ error: 'Gagal memproses audio' });
  }
});

// P7: Voice Command
router.post('/voice-command', async (req, res) => {
  try {
    const { audioUrl, audioBase64, duration } = req.body;
    if (!audioUrl && !audioBase64) return res.status(400).json({ error: 'audio required' });
    
    const result = await gateway.route(7, { audioUrl, audioBase64, duration }, req.userId);
    res.json(result);
  } catch (e) {
    console.error('Voice command error:', e);
    res.status(500).json({ error: 'Gagal memproses perintah suara' });
  }
});

// P8: Meeting Transcribe
router.post('/meeting', async (req, res) => {
  try {
    const { audioUrl, audioBase64, duration } = req.body;
    if (!audioUrl && !audioBase64) return res.status(400).json({ error: 'audio required' });
    
    const result = await gateway.route(8, { audioUrl, audioBase64, duration }, req.userId);
    res.json(result);
  } catch (e) {
    console.error('Meeting error:', e);
    res.status(500).json({ error: 'Gagal memproses rekaman meeting' });
  }
});

// P9: TTS (mock)
router.post('/synthesize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    const result = await gateway.route(9, { text }, req.userId);
    res.json(result);
  } catch (e) {
    console.error('Synthesize error:', e);
    res.status(500).json({ error: 'Gagal membuat audio' });
  }
});

// P10: Terra Chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    
    const result = await gateway.route(10, { message, context }, req.userId);
    res.json(result);
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ error: 'Gagal memproses chat' });
  }
});

// Rate limit status (authenticated)
router.get('/limits', (req, res) => {
  res.json(gateway.limits);
});

module.exports = router;
