// AI usage tracker - log to Supabase
const db = require('./db');

async function logUsage(userId, priority, status, metadata = {}) {
  const { error } = await db.from('ai_usage').insert({
    user_id: userId,
    priority,
    status,
    metadata
  });
  
  if (error) console.error('Usage log failed:', error.message);
  // ponytail: silent fail, don't break API calls
}

module.exports = { logUsage };
