// AI Routes - expose gateway via REST
const express = require('express');
const router = express.Router();
const gateway = require('../services/ai/gateway');

// P1: OCR Struk → JSON
router.post('/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType, userId } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });
    
    const result = await gateway.route(1, { imageBase64, mimeType: mimeType || 'image/jpeg' }, userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P2: Tag Catatan
router.post('/tag', async (req, res) => {
  try {
    const { text, userId } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    const tags = await gateway.route(2, { text }, userId);
    res.json({ tags });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P3: Ringkas Buku
router.post('/summarize', async (req, res) => {
  try {
    const { text, imageBase64, mimeType, userId } = req.body;
    if (!text && !imageBase64) return res.status(400).json({ error: 'text or image required' });
    
    const summary = await gateway.route(3, { text, imageBase64, mimeType }, userId);
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P4: Explain Keuangan
router.post('/explain', async (req, res) => {
  try {
    const { data, userId } = req.body;
    if (!data) return res.status(400).json({ error: 'data required' });
    
    const explanation = await gateway.route(4, { data }, userId);
    res.json({ explanation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P5: Ask/Chat
router.post('/ask', async (req, res) => {
  try {
    const { question, context, userId } = req.body;
    if (!question) return res.status(400).json({ error: 'question required' });
    
    const answer = await gateway.route(5, { question, context }, userId);
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P6: STT Voice Note
router.post('/transcribe', async (req, res) => {
  try {
    const { audioUrl, audioBase64, duration, userId } = req.body;
    if (!audioUrl && !audioBase64) return res.status(400).json({ error: 'audio required' });
    
    const result = await gateway.route(6, { audioUrl, audioBase64, duration }, userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P7: Voice Command
router.post('/voice-command', async (req, res) => {
  try {
    const { audioUrl, audioBase64, duration, userId } = req.body;
    if (!audioUrl && !audioBase64) return res.status(400).json({ error: 'audio required' });
    
    const result = await gateway.route(7, { audioUrl, audioBase64, duration }, userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P8: Meeting Transcribe
router.post('/meeting', async (req, res) => {
  try {
    const { audioUrl, audioBase64, duration, userId } = req.body;
    if (!audioUrl && !audioBase64) return res.status(400).json({ error: 'audio required' });
    
    const result = await gateway.route(8, { audioUrl, audioBase64, duration }, userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P9: TTS (mock)
router.post('/synthesize', async (req, res) => {
  try {
    const { text, userId } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    
    const result = await gateway.route(9, { text }, userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// P10: Terra Chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context, userId } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    
    const result = await gateway.route(10, { message, context }, userId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Rate limit status
router.get('/limits', (req, res) => {
  res.json(gateway.limits);
});

module.exports = router;
