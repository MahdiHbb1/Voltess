# Spec: AI Gateway Live Implementation + Rate Limiting

**Version:** 1.0.0  
**Date:** 2026-11-06  
**Owner:** Mahdi (handling Muchsin scope)  
**Status:** Draft for review

## Objective

Implement live AI adapters (Gemini 3.5 Flash-Lite + AssemblyAI) untuk menggantikan mock, dengan rate limiting + fallback strategy agar 1-3 UMKM bisa pakai semua fitur (P1-P4, P8, P10-P13) menggunakan free tier sampai pilot. User melihat pesan ramah (bukan teknis) saat quota limit atau error.

**Target users:** 1-3 UMKM test deployment (bukan pilot scale penuh)

**Success criteria:**
- P1-P4 (OCR/STT) works dengan Gemini/AssemblyAI free tier
- P8 (Explain) dan P10 (Tanya Terra) works dengan Gemini free tier
- P11-P13 (Alert, Token prediction, ROI) works dengan backend logic
- Rate limiting mencegah exceed 500 RPD Gemini
- Fallback graceful: STT → text input, Terra → FAQ, OCR → queue
- User messaging ramah: "Fitur suara lagi penuh, coba ketik manual ya" bukan "429 rate limit exceeded"

## Tech Stack

**AI Providers:**
- Gemini 3.5 Flash-Lite free (500 RPD, 10 RPM, 250k TPM)
- AssemblyAI free (185 jam pre-recorded)

**Backend:**
- NestJS modular monolith (existing)
- TypeScript
- Redis untuk rate limiting counter (atau Supabase KV jika di Vercel)
- Existing AI Gateway structure di `apps/api/src/ai/`

**Deploy:**
- Vercel serverless functions
- Supabase database + KV storage

**Key dependencies:**
- `@google/generative-ai` (Gemini SDK)
- `assemblyai` (AssemblyAI SDK)
- Rate limiting: `@nestjs/throttler` atau custom Redis counter

## Commands

```bash
# Development
pnpm dev                          # Start dengan AI_MODE=mock default

# Test
pnpm test                         # All tests
pnpm test:contract                # Contract tests C3
pnpm test:ai-live                 # AI adapter integration tests

# Build
pnpm build

# Lint
pnpm lint --fix

# Environment
AI_MODE=live                      # Enable live adapters
GEMINI_API_KEY=xxx               # Google AI Studio key
ASSEMBLYAI_API_KEY=xxx           # AssemblyAI key
REDIS_URL=xxx                    # Rate limit storage (or Supabase KV)
```

## Project Structure

```
apps/api/src/
  ai/
    adapters/
      mock/                       # Existing mock adapters
      live/                       # NEW: Live adapters
        gemini-ocr.adapter.ts     # P1-P3 OCR via Gemini
        assemblyai-stt.adapter.ts # P4 STT via AssemblyAI
        gemini-llm.adapter.ts     # P8, P10 LLM via Gemini
        rate-limiter.service.ts   # Rate limiting logic
        fallback.service.ts       # Graceful degradation
    pipelines/
      p1-ocr-meter.ts            # Uses adapter based on AI_MODE
      p4-stt-extract.ts          # Uses adapter based on AI_MODE
      p8-explain.ts              # Uses adapter based on AI_MODE
      p10-ask.ts                 # Uses adapter based on AI_MODE
      p11-alert.ts               # NEW: Alert business logic
      p12-token-prediction.ts    # NEW: Token prediction logic
      p13-roi-calculator.ts      # NEW: ROI calculation logic
    ai-config.ts                 # Config loader + validation
    ai.module.ts                 # NestJS module registration

packages/contracts/
  src/
    ai.ts                        # Existing types
    rate-limit.ts                # NEW: Rate limit types
  fixtures/
    ai/
      rate-limit-exceeded.json   # NEW: Quota limit responses

tests/contract/
  ai-live.test.ts                # NEW: Live adapter contract tests
```

## Code Style

**Example: Rate limiter with user-friendly messages**

```typescript
// apps/api/src/ai/adapters/live/rate-limiter.service.ts

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  userMessage?: string; // Ramah, bukan teknis
}

export class RateLimiterService {
  async checkQuota(
    pipeline: string,
    userId: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<RateLimitResult> {
    const quota = this.getQuotaForPriority(pipeline, priority);
    const used = await this.getUsageCount(userId, pipeline);
    
    if (used >= quota.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: quota.resetAt,
        userMessage: this.getFriendlyMessage(pipeline, quota.resetAt)
      };
    }
    
    await this.incrementUsage(userId, pipeline);
    
    return {
      allowed: true,
      remaining: quota.limit - used - 1,
      resetAt: quota.resetAt
    };
  }
  
  private getFriendlyMessage(pipeline: string, resetAt: Date): string {
    const timeStr = format(resetAt, 'HH:mm', { locale: id });
    
    switch (pipeline) {
      case 'stt-extract':
        return `Fitur suara lagi penuh hari ini. Coba lagi jam ${timeStr} atau ketik manual ya 😊`;
      case 'ask':
        return `Chat dengan Terra lagi penuh. Coba lagi jam ${timeStr} atau lihat pertanyaan umum dulu`;
      case 'ocr-meter':
        return `Upload foto lagi penuh hari ini. Coba lagi jam ${timeStr} atau masukkan angka manual`;
      default:
        return `Fitur ini lagi penuh. Coba lagi jam ${timeStr} ya`;
    }
  }
  
  private getQuotaForPriority(pipeline: string, priority: string) {
    // Priority tiering: OCR high 40%, Explain/STT medium 20%, Terra low 20%
    const dailyTotal = 500; // Gemini Flash-Lite RPD
    
    const allocations = {
      'ocr-meter': { high: 200, medium: 100, low: 50 },
      'stt-extract': { high: 0, medium: 100, low: 50 },
      'explain': { high: 0, medium: 100, low: 50 },
      'ask': { high: 0, medium: 0, low: 100 }
    };
    
    return {
      limit: allocations[pipeline]?.[priority] || 50,
      resetAt: this.getMidnightPacific() // RPD resets midnight PT
    };
  }
}
```

**Conventions:**
- User messages: Bahasa Indonesia casual, emoji OK (😊), hindari jargon
- Error codes internal: tetap `RATE_LIMIT_EXCEEDED`, tapi `userMessage` ramah
- Time format: HH:mm WIB untuk user display
- Priority: `high` (OCR core value), `medium` (explain/STT), `low` (Terra chat)

## Testing Strategy

**Framework:** Vitest (existing)

**Test levels:**

1. **Unit tests** (`*.spec.ts`):
   - Rate limiter logic
   - Fallback message generation
   - Quota calculation
   - P11-P13 business logic

2. **Integration tests** (`*.test.ts`):
   - Gemini adapter calls (real API, dev key, small quota)
   - AssemblyAI adapter calls (real API, dev key)
   - Rate limiting flow end-to-end

3. **Contract tests** (`tests/contract/ai-live.test.ts`):
   - Response shape matches C3 schema
   - Error codes match documented values
   - Mock vs live response compatibility

**Coverage:** ≥80% for new adapters, 100% for rate limiter

**Test data:**
- Use small test audio (<5 sec) untuk AssemblyAI
- Use fixture images untuk Gemini OCR
- Mock Redis/KV untuk rate limit unit tests

## Boundaries

**Always do:**
- Validate API keys saat startup (fail fast if missing)
- Log `request_id` untuk debug, tapi jangan log user data
- Return user-friendly messages di `userMessage` field
- Increment usage counter **after** successful API call (jangan count failures)
- Test dengan `AI_MODE=live` di local sebelum commit

**Ask first:**
- Menambah provider baru selain Gemini/AssemblyAI
- Mengubah priority allocation (40% OCR, 20% Explain, dll)
- Mengubah quota limits atau reset time
- Menambah dependency baru

**Never do:**
- Commit API keys ke git (use `.env.local`, gitignored)
- Count failed requests terhadap user quota
- Return technical error messages ke user (`429 Too Many Requests` → user message ramah)
- Bypass rate limiting di production
- Mock P11-P13 (rule-based, harus real calculation)

## Rate Limiting Strategy (Combined)

**Priority Tiering:**
- P1 OCR Meter: **High priority** (40% daily quota = 200 calls)
- P2/P3 OCR Label/Token: **Medium** (20% = 100 calls)
- P8 Explain: **Medium** (20% = 100 calls)
- P4 STT: **Low** (fallback text input, 20% = 100 calls)
- P10 Terra: **Low** (fallback FAQ, 20% = 100 calls)

**Time-based split:**
- Midnight PT reset (15:00 or 16:00 WIB depending on DST)
- Track usage per pipeline per day
- Show user "tersisa X panggilan hari ini"

**Client-side limits:**
- Max 150 calls/user/hari (across all pipelines)
- UI shows remaining quota
- Disable buttons saat quota habis

**Graceful degradation:**
- STT hit limit → fallback form text input manual
- Terra hit limit → show FAQ canned responses
- OCR hit limit → queue untuk besok atau manual input
- Explain hit limit → show basic template response (non-LLM)

**AssemblyAI separate tracking:**
- 185 jam free = ~49 bulan pilot (3.75 jam/bulan)
- Track audio duration, bukan request count
- Alert saat >80% usage (148 jam used)

## Implementation Phases

### Phase 1: Adapters + Config
- Gemini OCR adapter (P1-P3)
- AssemblyAI STT adapter (P4)
- Gemini LLM adapter (P8, P10)
- Config validation + API key checks
- Error mapping (provider error → user message)

### Phase 2: Rate Limiting
- Rate limiter service
- Redis/Supabase KV integration
- Priority allocation logic
- User quota tracking per pipeline
- Friendly message generation

### Phase 3: Fallback Logic
- STT → text input fallback
- Terra → FAQ fallback
- OCR → queue/manual fallback
- Explain → template fallback
- UI state updates for degraded mode

### Phase 4: Backend Logic (P11-P13)
- P11: Alert service (median ± MAD)
- P12: Token prediction service
- P13: ROI calculator (use `@voltess/energy-calc`)

### Phase 5: Testing + Verification
- Contract tests
- Integration tests with real APIs
- Load test 1-3 user simulation
- Error scenario coverage

## Success Criteria

**Functional:**
- [ ] P1-P3 OCR works dengan Gemini (meter, label, token)
- [ ] P4 STT works dengan AssemblyAI (voice notes transcribed)
- [ ] P8 Explain works dengan Gemini (explanations generated)
- [ ] P10 Tanya Terra works dengan Gemini (Q&A conversation)
- [ ] P11 Alert works (penyimpangan detection)
- [ ] P12 Token prediction works (perkiraan habis)
- [ ] P13 ROI calculator works (balik modal calculation)

**Rate Limiting:**
- [ ] Gemini calls stay under 500 RPD (Flash-Lite limit)
- [ ] Priority tiering enforced (OCR 40%, others 20%)
- [ ] User sees friendly message saat quota limit
- [ ] Quota resets midnight Pacific time
- [ ] Per-user limit 150 calls/hari enforced

**Fallback:**
- [ ] STT fallback ke text input saat limit
- [ ] Terra fallback ke FAQ saat limit
- [ ] OCR fallback ke manual input saat limit
- [ ] User tidak melihat technical error (429, 502, dll)

**Deployment:**
- [ ] Deploy ke Vercel works
- [ ] Environment variables configured
- [ ] API keys secured (not in git)
- [ ] Redis/Supabase KV connected
- [ ] Health check endpoint returns live mode status

## Open Questions

1. **Redis vs Supabase KV for rate limiting?**
   - Redis: faster, tapi butuh separate service (Upstash free tier?)
   - Supabase KV: integrated, tapi latency higher
   - **Recommendation:** Supabase KV dulu (simpler), migrate ke Redis kalo bottleneck

2. **AssemblyAI fallback strategy?**
   - Free tier 185 jam sangat cukup (49 bulan pilot)
   - Kalo somehow exceed: fallback ke Whisper API OpenAI ($0.006/menit)?
   - **Recommendation:** Monitor usage, alert di 80%, belum butuh fallback

3. **P10 Terra tool use scope?**
   - PRD: "tool terbatas untuk estimasi, riwayat, rekomendasi, prediksi token"
   - Tools implementation: separate spec atau inline di P10?
   - **Recommendation:** Inline tools di P10 adapter (fetch from DB), simple

4. **Client-side quota display?**
   - Show remaining quota per pipeline, atau total aja?
   - Update real-time atau per-request?
   - **Recommendation:** Total remaining (lebih sederhana UI), update per-request

5. **Mock compatibility?**
   - Apakah live adapters harus return exact same shape as mock?
   - Contract tests ensure compatibility?
   - **Recommendation:** Yes - contract tests enforce C3 schema, mock/live interchangeable

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Free tier limits hit terlalu cepat (1-3 user > 500 RPD) | High | Priority tiering + per-user caps + monitoring dashboard |
| Gemini/AssemblyAI API downtime | High | Fallback graceful (manual input), show friendly error, retry logic |
| Rate limiter storage (Redis/KV) down | Medium | Fail open (allow requests) + log warning, degrade gracefully |
| AssemblyAI transcription accuracy rendah (noise, logat) | Medium | User can edit transcript before submit, fallback text input |
| API key leaked | High | Environment variables, never commit, rotate immediately if leaked |
| Vercel serverless timeout (10s default) | Medium | AssemblyAI async mode (webhook callback), bukan sync wait |
| Cost surprise (free tier exceeded tanpa notice) | Medium | Alert di 80% usage, dashboard monitoring, set hard caps |

## Next Steps After Approval

1. Create implementation plan (`tasks/plan-ai-live.md`)
2. Break down into tasks (`tasks/todo-ai-live.md`)
3. Implement Phase 1-5 incrementally
4. Contract tests first (TDD)
5. Integration tests with dev API keys
6. Deploy to Vercel staging
7. Test with 1-3 real users
8. Monitor usage + adjust quotas if needed
