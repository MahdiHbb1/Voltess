// Rate limiter - check against DB quotas
const db = require('./db');

async function checkQuota(userId, priority) {
  if (!userId) return; // Anonymous OK for now
  
  // Get user subscription + usage
  const { data: sub } = await db
    .from('subscriptions')
    .select('tier_id, valid_until')
    .eq('user_id', userId)
    .single();
  
  if (!sub || new Date(sub.valid_until) < new Date()) {
    throw new Error('No active subscription');
  }
  
  // Get tier limits
  const { data: tier } = await db
    .from('subscription_tiers')
    .select('monthly_quota')
    .eq('id', sub.tier_id)
    .single();
  
  // Count usage this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const { count } = await db
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', monthStart.toISOString());
  
  if (count >= tier.monthly_quota) {
    throw new Error('Monthly quota exceeded');
  }
}

module.exports = { checkQuota };
