# Vercel Environment Variables Configuration

This document lists all environment variables needed for Vercel deployment of the Voltess web app.

## Required Environment Variables

### App Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (Vercel deployment of NestJS API) | `https://voltess-api.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Backend API (if deploying API to Vercel too)
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SESSION_SECRET` | JWT signing secret (min 32 chars) | `super-secret-random-string-32-chars-min` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port (Vercel handles this) | `3001` |

### AI Service Keys (for backend API)
| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key | `aa-...` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |

### Storage (S3-compatible)
| Variable | Description | Example |
|----------|-------------|---------|
| `S3_BUCKET` | Bucket name | `voltess-captures` |
| `S3_REGION` | S3 region | `us-east-1` |
| `S3_ENDPOINT` | S3 endpoint (for non-AWS) | `https://s3.amazonaws.com` |

### Redis/Queue
| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | `password` |

## Setting Up in Vercel

### Option 1: Vercel Dashboard
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable with the appropriate value
3. Set Environment: Production, Preview, Development as needed

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# ... repeat for all variables

# Pull to local for development
vercel env pull .env.local
```

### Option 3: Bulk Import
Create a `.env.vercel` file:
```bash
NEXT_PUBLIC_API_URL=https://voltess-api.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then import:
```bash
vercel env pull --environment=production < .env.vercel
```

## Vercel-Specific Notes

### Build Configuration
The `vercel.json` configures:
- Build command: `pnpm build:packages && pnpm --filter @voltess/web build`
- Output directory: `.next` (default for Next.js)
- Function max duration: 30 seconds for API routes
- Region: `sin1` (Singapore) for lower latency in Indonesia
- CORS headers for API routes

### API Routes
The Next.js app includes API proxy routes at `/api/admin/monitoring/*` that forward to the backend API. These are deployed as Vercel Serverless Functions.

### Environment Variable Prefixes
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-only
- Never put secrets in `NEXT_PUBLIC_*` variables

## Staging vs Production

### Staging Environment
Create a separate Vercel project for staging:
- Project name: `voltess-staging`
- Environment variables prefixed with `STAGING_` or use separate values
- Connect to staging Supabase project
- Use test API keys with limited quotas

### Production Environment
- Project name: `voltess`
- Use production Supabase project
- Use production API keys
- Enable Vercel Analytics and Speed Insights

## Supabase Configuration for Vercel

### Connection Pooling
For serverless functions, enable Supabase Connection Pooling:
1. Go to Supabase Dashboard → Settings → Database
2. Enable "Connection Pooling"
3. Use the pooled connection URL in `SUPABASE_URL`
4. Pool mode: Transaction (recommended for serverless)

### Auth Configuration
1. Go to Supabase Dashboard → Authentication → Settings
2. Add Vercel deployment URL to "Site URL"
3. Add Vercel deployment URL to "Redirect URLs"
4. Enable email/phone providers as needed

## Troubleshooting

### Build Failures
- Ensure all `NEXT_PUBLIC_*` variables are set in Vercel
- Check build logs for missing dependencies
- Verify `pnpm-lock.yaml` is committed

### Runtime Errors
- Check Vercel Function Logs in Dashboard
- Verify API URL is accessible from Vercel
- Check Supabase connection pooling is enabled

### CORS Issues
- Verify `vercel.json` headers configuration
- Check backend API CORS settings allow Vercel domain
- Ensure `ALLOWED_ORIGINS` includes Vercel deployment URL

## Monitoring Setup

After deployment:
1. Enable Vercel Analytics in Dashboard
2. Enable Vercel Speed Insights
3. Configure monitoring alerts (see `apps/api/src/monitoring/`)
4. Set up uptime monitoring (e.g., UptimeRobot, BetterStack)