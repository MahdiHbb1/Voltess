# Supabase Setup untuk Team

## Setup Backend Lokal

1. **Copy credentials ke backend/.env:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit backend/.env, tambahkan:**
   ```
   SUPABASE_URL=https://cgcmxwaaypqmqxzklizi.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnY214d2FheXBxbXF4emtsaXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Njg4NzgsImV4cCI6MjEwOTU0NDg3OH0.ugasEA5Fo6BLsMK0uvm1Z0fxs8fCspRlheOI7hmc2M4
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start server:**
   ```bash
   npm start
   ```

5. **Test connection:**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected: `{"status":"ok","db":"connected",...}`

## Supabase Dashboard Access

Cek email invite dari Supabase, accept invitation sebagai Developer.

Dashboard: https://supabase.com/dashboard/project/cgcmxwaaypqmqxzklizi

## Database Schema

14 tables:
- users, business_profiles, captures, mission_events
- entitlements, entitlement_changes
- otp_codes, guest_consents, deletion_requests
- jobs
- **subscription_tiers** (Free, Plus)
- **subscriptions** (user subscriptions)
- **ai_usage** (AI request logs)

Migrations: `migrations/001_initial_schema.sql` + `002_ai_and_subscriptions.sql`
