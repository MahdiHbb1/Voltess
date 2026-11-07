// AI usage tracker - log to Supabase
const db = require('./db');

async function logUsage(userId, priority, status, metadata = {}) {
  // Skip logging if no userId (anonymous) or DB not ready
  if (!userId) return;
  
  try {
    const { error } = await db.from('ai_usage').insert({
      user_id: userId,
      priority,
      status,
      metadata
    });
    
    if (error) {
      // Silent fail: RLS policy may block, don't crash API
      console.error('Usage log failed:', error.message);
    }
  } catch (e) {
    console.error('Usage log exception:', e.message);
  }
}

module.exports = { logUsage };
