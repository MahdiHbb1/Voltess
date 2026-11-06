// Express server - AI Gateway API
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 images

// Routes
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', async (req, res) => {
  const db = require('./services/db');
  try {
    const { error } = await db.from('users').select('count', { count: 'exact', head: true });
    res.json({ 
      status: 'ok', 
      db: error ? 'error' : 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (e) {
    res.json({ status: 'ok', db: 'error', timestamp: new Date().toISOString() });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AI Gateway running on port ${PORT}`);
});

module.exports = app;
