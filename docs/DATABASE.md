# Database Setup - Supabase

## Quick Start

1. **Create Supabase project:** https://supabase.com/dashboard
2. **Run migration:** Copy `migrations/001_initial_schema.sql` → paste in Supabase SQL Editor → Run
3. **Get credentials:** Project Settings → API → Copy URL + service_role key
4. **Configure app:** Copy `.env.example` → `.env` → fill in credentials

## Environment Variables

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SESSION_SECRET=generate-with-openssl-rand-base64-32
```

## Tables Created

- `users` - Phone auth + profile
- `business_profiles` - Business data + appliances (JSONB)
- `captures` - Images + OCR results
- `mission_events` - Gamification progress
- `entitlements` - Trial/Plus status
- `entitlement_changes` - Audit log
- `otp_codes` - Temporary OTP (auto-cleanup)
- `guest_consents` - Merge consent (auto-cleanup)
- `deletion_requests` - Privacy/GDPR
- `jobs` - Queue (BullMQ replacement)

## Migration Status

**Current:** In-memory Map (all data lost on restart)  
**After setup:** Persistent Supabase PostgreSQL

Services using Map now (need DB integration later):
- AuthService → users, otp_codes, guest_consents
- BusinessService → business_profiles
- CaptureService → captures
- MissionService → mission_events
- EntitlementService → entitlements, entitlement_changes
- PrivacyService → deletion_requests
- QueueService → jobs

## Next Steps

1. Run migration in Supabase
2. Set env vars
3. Restart API: `pnpm -F @voltess/api dev`
4. Services auto-fallback to Map if Supabase not configured

## Cleanup (scheduled)

Run this via Supabase Edge Function or cron:
```sql
SELECT cleanup_expired_temp_data();
```

Removes expired OTP codes + merged guest consents.
