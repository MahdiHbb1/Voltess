# Implementation Plan: AI Gateway Live + Rate Limiting

**Based on:** `docs/SPEC-ai-live.md`  
**Date:** 2026-11-06  
**Owner:** Mahdi  

## Overview

Implement live AI adapters (Gemini 3.5 Flash-Lite + AssemblyAI) menggantikan mock, dengan rate limiting dan fallback strategy untuk deployment 1-3 UMKM menggunakan free tier. Includes backend logic P11-P13 (Alert, Token prediction, ROI calculator).

## Architecture Decisions

### 1. Adapter Pattern
- Keep existing AI Gateway structure (`apps/api/src/ai/`)
- Add `adapters/live/` parallel to `adapters/mock/`
- Pipelines select adapter based on `AI_MODE` environment variable
- Contract compatibility enforced via tests

### 2. Rate Limiting Storage
- **Decision:** Supabase KV (integrated with existing Supabase setup)
- **Rationale:** Simpler than separate Redis service, latency acceptable for 1-3 users
- **Migration path:** Can move to Upstash Redis if bottleneck (same interface)

### 3. Priority Allocation
- OCR (P1-P3): 40% quota (200 calls/day) - core value
- Explain (P8): 20% quota (100 calls/day)
- STT (P4): 20% quota (100 calls/day) - fallback text input
- Wati (P10): 20% quota (100 calls/day) - fallback FAQ
- Per-user cap: 150 calls/day total

### 4. Fallback Strategy
- Client-side: Show fallback UI (text input form, FAQ list)
- Server-side: Return `RATE_LIMIT_EXCEEDED` with `userMessage` and `fallbackAvailable: true`
- No silent degradation - user always knows what happened

### 5. AssemblyAI Integration
- Use async mode (upload → poll status → get transcript)
- Webhook callback for real-time updates (optional Phase 6)
- Track audio duration, not request count

### 6. P11-P13 Implementation
- P11 Alert: Statistical anomaly detection (median ± MAD threshold)
- P12 Token: Simple linear projection from daily average
- P13 ROI: Wrapper around `@voltra/energy-calc` with presentation logic

## Task List

### Phase 1: Foundation & Config

- [ ] **Task 1.1:** Setup environment variables and config validation
  - Add `GEMINI_API_KEY`, `ASSEMBLYAI_API_KEY` to `.env.example`
  - Validate keys at startup in `ai-config.ts`
  - Fail fast with clear error if keys missing in live mode
  - **Files:** `apps/api/src/ai/ai-config.ts`, `.env.example`

- [ ] **Task 1.2:** Install AI provider SDKs
  - Add `@google/generative-ai` for Gemini
  - Add `assemblyai` for AssemblyAI
  - Lock versions in `package.json`
  - **Files:** `package.json`, `pnpm-lock.yaml`

- [ ] **Task 1.3:** Create rate limiter service interface
  - Define `RateLimitResult` type
  - Define `RateLimiterService` interface
  - Define priority levels and quota allocation constants
  - **Files:** `apps/api/src/ai/adapters/live/rate-limiter.interface.ts`

### Checkpoint 1: Foundation
- [ ] Environment validation works (`pnpm dev` fails gracefully without keys)
- [ ] Dependencies installed (`pnpm install` succeeds)
- [ ] Rate limiter types compile

---

### Phase 2: Gemini OCR Adapter (P1-P3)

- [ ] **Task 2.1:** Implement Gemini OCR Meter adapter (P1)
  - Create `GeminiOcrAdapter` class
  - Implement `ocrMeter(file, meterType)` method
  - Map Gemini Vision API response to C3 schema
  - Handle provider errors with user-friendly messages
  - **Files:** `apps/api/src/ai/adapters/live/gemini-ocr.adapter.ts`

- [ ] **Task 2.2:** Implement Gemini OCR Label adapter (P2)
  - Implement `ocrLabel(file, applianceHint?)` method
  - Extract appliance name and power (W) from label
  - Return confidence score
  - **Files:** `apps/api/src/ai/adapters/live/gemini-ocr.adapter.ts`

- [ ] **Task 2.3:** Implement Gemini OCR Token adapter (P3)
  - Implement `ocrToken(file)` method
  - Extract date, Rupiah, kWh, remaining kWh from token screen
  - Handle various token formats (struk, layar)
  - **Files:** `apps/api/src/ai/adapters/live/gemini-ocr.adapter.ts`

- [ ] **Task 2.4:** Wire P1-P3 pipelines to use live adapter
  - Update `p1-ocr-meter.ts` to select adapter by `AI_MODE`
  - Update `p2-ocr-label.ts` to select adapter by `AI_MODE`
  - Update `p3-ocr-token.ts` to select adapter by `AI_MODE`
  - **Files:** `apps/api/src/ai/pipelines/p1-*.ts`, `p2-*.ts`, `p3-*.ts`

### Checkpoint 2: OCR Works
- [ ] P1 OCR meter returns valid response with real Gemini API
- [ ] P2 OCR label extracts appliance info
- [ ] P3 OCR token extracts token data
- [ ] Contract tests pass for P1-P3 live responses

---

### Phase 3: AssemblyAI STT Adapter (P4)

- [ ] **Task 3.1:** Implement AssemblyAI STT adapter
  - Create `AssemblyAiSttAdapter` class
  - Implement `transcribeAudio(audioFile)` async method
  - Upload audio → poll status → return transcript
  - Map response to C3 schema (P4)
  - **Files:** `apps/api/src/ai/adapters/live/assemblyai-stt.adapter.ts`

- [ ] **Task 3.2:** Implement STT extraction logic (P4)
  - Parse transcript for appliance names, hours, volumes
  - Match against provided appliance list
  - Return structured entries array
  - Generate confirmation text for user
  - **Files:** `apps/api/src/ai/adapters/live/stt-extractor.service.ts`

- [ ] **Task 3.3:** Wire P4 pipeline to use live adapter
  - Update `p4-stt-extract.ts` to use AssemblyAI adapter
  - Handle audio reference (URL or base64)
  - **Files:** `apps/api/src/ai/pipelines/p4-stt-extract.ts`

### Checkpoint 3: STT Works
- [ ] P4 STT transcribes Indonesian voice notes
- [ ] Extraction returns structured entries
- [ ] Contract tests pass for P4 live responses

---

### Phase 4: Gemini LLM Adapter (P8, P10)

- [ ] **Task 4.1:** Implement Gemini LLM Explain adapter (P8)
  - Create `GeminiLlmAdapter` class
  - Implement `explain(kind, result)` method
  - Generate 1-2 sentence explanation without new numbers
  - Validate no new numbers in output (numbers_used: [])
  - **Files:** `apps/api/src/ai/adapters/live/gemini-llm.adapter.ts`

- [ ] **Task 4.2:** Implement Gemini LLM Ask adapter (P10)
  - Implement `ask(businessId, question, conversationId?)` method
  - Tool use: fetch estimasi, riwayat, rekomendasi from DB
  - Return answer with sources
  - Handle low confidence → suggest missions
  - **Files:** `apps/api/src/ai/adapters/live/gemini-llm.adapter.ts`

- [ ] **Task 4.3:** Wire P8, P10 pipelines to use live adapter
  - Update `p8-explain.ts` to use Gemini LLM adapter
  - Update `p10-ask.ts` to use Gemini LLM adapter with tools
  - **Files:** `apps/api/src/ai/pipelines/p8-explain.ts`, `p10-ask.ts`

### Checkpoint 4: LLM Works
- [ ] P8 Explain generates explanations without new numbers
- [ ] P10 Wati answers questions with DB context
- [ ] Contract tests pass for P8, P10 live responses

---

### Phase 5: Rate Limiting Implementation

- [ ] **Task 5.1:** Implement Supabase KV rate limiter service
  - Create `SupabaseRateLimiterService` class
  - Implement `checkQuota(pipeline, userId, priority)` method
  - Track usage per pipeline per day in Supabase KV
  - Reset counter at midnight Pacific time
  - **Files:** `apps/api/src/ai/adapters/live/supabase-rate-limiter.service.ts`

- [ ] **Task 5.2:** Implement user-friendly message generation
  - Create `getFriendlyMessage(pipeline, resetAt)` method
  - Messages in Bahasa Indonesia, ramah, clear
  - Include retry time in WIB
  - **Files:** `apps/api/src/ai/adapters/live/rate-limiter-messages.ts`

- [ ] **Task 5.3:** Implement priority allocation logic
  - OCR: 200 calls/day (high priority)
  - Explain/STT/Wati: 100 calls/day each (medium/low)
  - Per-user cap: 150 calls/day total
  - **Files:** `apps/api/src/ai/adapters/live/rate-limiter.service.ts`

- [ ] **Task 5.4:** Integrate rate limiter into pipelines
  - Check quota before calling AI adapter
  - Return `RATE_LIMIT_EXCEEDED` error with userMessage
  - Increment counter after successful call
  - **Files:** All pipeline files (`p1-*.ts` through `p10-*.ts`)

### Checkpoint 5: Rate Limiting Works
- [ ] Quota check prevents exceeding 500 RPD
- [ ] User sees friendly message when limit hit
- [ ] Per-user cap enforced (150 calls/day)
- [ ] Quota resets at midnight Pacific

---

### Phase 6: Fallback Logic

- [ ] **Task 6.1:** Implement STT fallback service
  - Return `fallbackAvailable: true` when STT quota exceeded
  - Provide text input form data in response
  - **Files:** `apps/api/src/ai/pipelines/p4-stt-extract.ts`

- [ ] **Task 6.2:** Implement Wati fallback service
  - Return FAQ list when Wati quota exceeded
  - Pre-defined common questions and answers
  - **Files:** `apps/api/src/ai/pipelines/p10-ask.ts`, `apps/api/src/ai/fallback/faq.data.ts`

- [ ] **Task 6.3:** Implement OCR fallback service
  - Return manual input form when OCR quota exceeded
  - Option to queue for next day
  - **Files:** `apps/api/src/ai/pipelines/p1-ocr-meter.ts`

- [ ] **Task 6.4:** Implement Explain fallback service
  - Return basic template response (non-LLM) when quota exceeded
  - Simple category-based explanation
  - **Files:** `apps/api/src/ai/pipelines/p8-explain.ts`, `apps/api/src/ai/fallback/explain-templates.ts`

### Checkpoint 6: Fallbacks Work
- [ ] STT fallback shows text input option
- [ ] Wati fallback shows FAQ
- [ ] OCR fallback shows manual input
- [ ] Explain fallback shows template

---

### Phase 7: Backend Logic (P11-P13)

- [ ] **Task 7.1:** Implement Alert service (P11)
  - Statistical anomaly detection (median ± MAD)
  - Compare daily usage against normal pattern
  - Return notification with deviation percentage
  - **Files:** `apps/api/src/ai/pipelines/p11-alert.ts`, `apps/api/src/ai/services/anomaly-detection.service.ts`

- [ ] **Task 7.2:** Implement Token Prediction service (P12)
  - Linear projection from daily average usage
  - Calculate days until kWh exhausted
  - Return date range estimate
  - **Files:** `apps/api/src/ai/pipelines/p12-token-prediction.ts`

- [ ] **Task 7.3:** Implement ROI Calculator service (P13)
  - Use `@voltra/energy-calc` for calculations
  - Compare old vs new appliance cost over time
  - Return payback period range (min/max)
  - **Files:** `apps/api/src/ai/pipelines/p13-roi-calculator.ts`

- [ ] **Task 7.4:** Create endpoints for P11-P13
  - POST `/ai/alert` (P11)
  - POST `/ai/predict-token` (P12)
  - POST `/ai/calculate-roi` (P13)
  - Wire to pipelines
  - **Files:** `apps/api/src/ai/ai.controller.ts`

### Checkpoint 7: Backend Logic Works
- [ ] P11 Alert detects anomalies
- [ ] P12 Token prediction returns date range
- [ ] P13 ROI calculator returns payback period
- [ ] All use real calculation (no mock)

---

### Phase 8: Testing & Documentation

- [ ] **Task 8.1:** Write contract tests for live adapters
  - Test P1-P10 live responses match C3 schema
  - Test error responses (provider error, rate limit)
  - Test mock/live response shape compatibility
  - **Files:** `tests/contract/ai-live.test.ts`

- [ ] **Task 8.2:** Write integration tests for rate limiter
  - Test quota enforcement
  - Test priority allocation
  - Test reset at midnight Pacific
  - Test per-user caps
  - **Files:** `tests/integration/rate-limiter.test.ts`

- [ ] **Task 8.3:** Write integration tests for AI adapters
  - Test Gemini OCR with real API (small quota)
  - Test AssemblyAI with real API (small audio)
  - Test Gemini LLM with real API
  - **Files:** `tests/integration/ai-adapters.test.ts`

- [ ] **Task 8.4:** Update AI Gateway documentation
  - Document live mode setup (API keys)
  - Document rate limiting behavior
  - Document fallback mechanisms
  - Document P11-P13 endpoints
  - **Files:** `docs/AI-GATEWAY.md`

### Checkpoint 8: Testing Complete
- [ ] All contract tests pass
- [ ] All integration tests pass
- [ ] Coverage ≥80% for new code
- [ ] Documentation updated

---

### Phase 9: Deployment & Monitoring

- [ ] **Task 9.1:** Setup environment variables in Vercel
  - Add `GEMINI_API_KEY` to Vercel env
  - Add `ASSEMBLYAI_API_KEY` to Vercel env
  - Add `AI_MODE=live` to production env
  - Configure Supabase KV connection
  - **Platform:** Vercel dashboard

- [ ] **Task 9.2:** Deploy to Vercel staging
  - Deploy branch to staging environment
  - Test all endpoints with live APIs
  - Verify rate limiting works
  - **Platform:** Vercel

- [ ] **Task 9.3:** Create monitoring dashboard
  - Track daily usage per pipeline
  - Alert at 80% quota (400/500 RPD Gemini)
  - Alert at 80% AssemblyAI usage (148/185 hours)
  - **Files:** `apps/api/src/monitoring/usage-tracker.service.ts`

- [ ] **Task 9.4:** Load test with 1-3 simulated users
  - Simulate typical usage pattern
  - Verify quota doesn't exceed 500 RPD
  - Verify fallbacks trigger correctly
  - **Files:** `tests/load/simulate-users.test.ts`

### Checkpoint 9: Deployment Ready
- [ ] Staging deployment works
- [ ] Monitoring dashboard live
- [ ] Load tests pass
- [ ] Ready for 1-3 UMKM deployment

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Gemini free tier exhausted quickly | Medium | High | Priority tiering + per-user caps + monitoring dashboard |
| AssemblyAI transcription accuracy low | Medium | Medium | User can edit transcript, fallback text input always available |
| Supabase KV latency too high | Low | Medium | Monitor latency, migrate to Upstash Redis if >200ms p95 |
| API keys leaked in commit | Low | High | Pre-commit hook checks for keys, `.env*` in `.gitignore` |
| Vercel function timeout (10s) | Medium | Medium | AssemblyAI async mode (webhook), increase timeout to 30s if needed |
| User confusion with fallback UI | Medium | Low | Clear messaging, test with real users, iterate on copy |

## Open Questions

1. **Supabase KV schema?**
   - Key format: `rate_limit:{userId}:{pipeline}:{date}`
   - Value: `{ count: number, resetAt: string }`
   - **Decision needed:** Confirm schema before Task 5.1

2. **AssemblyAI webhook setup?**
   - For async transcription completion
   - Required for long audio (>10s)?
   - **Decision needed:** Implement in Phase 3 or defer to Phase 10?

3. **P10 Wati tools implementation?**
   - Which DB tables to query (estimasi, riwayat, rekomendasi)?
   - Permission check (user can only see their own data)?
   - **Decision needed:** Define tool signatures before Task 4.2

4. **Frontend integration?**
   - Who handles fallback UI (Dhifansa scope)?
   - API contract for fallback data (`fallbackAvailable`, `fallbackData`)?
   - **Decision needed:** Coordinate with Dhifansa before Phase 6

5. **Cost alerting threshold?**
   - Alert at 80%, 90%, or 95% usage?
   - Who receives alerts (email, Slack)?
   - **Decision needed:** Set up alerting before Task 9.3

## Success Metrics

- [ ] All P1-P13 pipelines functional with live APIs
- [ ] Daily Gemini usage stays <500 RPD (target: <450 with buffer)
- [ ] AssemblyAI usage <5 hours/month (target: <4 hours with buffer)
- [ ] Rate limiting prevents quota exceeded errors
- [ ] Users see friendly messages, not technical errors
- [ ] Fallbacks work for all pipelines
- [ ] 1-3 UMKM can use all features on free tier
- [ ] Zero API keys leaked in git history
- [ ] Test coverage ≥80% for new code
- [ ] Documentation complete and accurate
