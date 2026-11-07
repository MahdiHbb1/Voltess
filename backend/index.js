// Express server - AI Gateway API
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter: 100 req/min per IP
const limiter = rateLimit({
  windowMs: 60000,
  max: 100,
  message: { error: 'Terlalu banyak permintaan, coba lagi nanti' }
});

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({ 
  origin: allowedOrigins.length > 0 ? allowedOrigins : false 
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', limiter);

// Request timeout: 2 minutes
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Routes
app.use('/api/ai', aiRoutes);

// Health check (minimal info)
app.get('/health', async (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString() 
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (no stack leaks)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Terjadi kesalahan sistem' });
});

app.listen(PORT, () => {
  console.log(`AI Gateway running on port ${PORT}`);
});

// Catch unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
