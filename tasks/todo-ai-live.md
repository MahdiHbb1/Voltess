# AI Gateway Live Implementation - Task List

**Based on:** `tasks/plan-ai-live.md`  
**Spec:** `docs/SPEC-ai-live.md`  
**Date:** 2026-11-06  
**Owner:** Mahdi

---

## Phase 1: Foundation & Config

### Task 1.1: Setup environment variables and config validation
**Description:** Add AI provider API keys to environment config and validate at startup.

**Acceptance criteria:**
- [ ] `GEMINI_API_KEY` added to `.env.example`
- [ ] `ASSEMBLYAI_API_KEY` added to `.env.example`
- [ ] `AI_MODE` validation in `ai-config.ts` (mock/live)
- [ ] Startup fails gracefully with clear error if keys missing in live mode
- [ ] Config type definitions updated

**Verification:**
- [ ] `pnpm dev` without keys shows friendly error message
- [ ] `pnpm dev` with keys starts successfully
- [ ] TypeScript compiles without errors

**Dependencies:** None

**Files:**
- `apps/api/src/ai/ai-config.ts`
- `.env.example`
- `apps/api/src/ai/ai-config.interface.ts`

---

### Task 1.2: Install AI provider SDKs
**Description:** Add Gemini and AssemblyAI SDKs to dependencies.

**Acceptance criteria:**
- [ ] `@google/generative-ai` added to `package.json`
- [ ] `assemblyai` added to `package.json`
- [ ] Versions locked (no `^` or `~`)
- [ ] `pnpm-lock.yaml` updated

**Verification:**
- [ ] `pnpm install` succeeds
- [ ] TypeScript can import both SDKs
- [ ] `pnpm build` succeeds

**Dependencies:** None

**Files:**
- `package.json`
- `pnpm-lock.yaml`

---

### Task 1.3: Create rate limiter service interface
**Description:** Define types and interfaces for rate limiting system.

**Acceptance criteria:**
- [ ] `RateLimitResult` type defined (allowed, remaining, resetAt, userMessage)
- [ ] `RateLimiterService` interface defined
- [ ] Priority levels enum: high, medium, low
- [ ] Quota allocation constants defined
- [ ] Supabase KV key format documented: `rl:{date}:{userId}:{pipeline}`

**Verification:**
- [ ] TypeScript compiles
- [ ] Types exported from module
- [ ] JSDoc comments complete

**Dependencies:** None

**Files:**
- `apps/api/src/ai/adapters/live/rate-limiter.interface.ts`
- `apps/api/src/ai/adapters/live/rate-limiter.constants.ts`

---

## Checkpoint 1: Foundation
- [ ] Environment validation works
- [ ] Dependencies installed
- [ ] Rate limiter types compile
- [ ] `pnpm test` passes (existing tests)

---

## Phase 2: Gemini OCR Adapter (P1-P3)

### Task 2.1: Implement Gemini OCR Meter adapter (P1)
**Description:** Create adapter to extract kWh reading from meter photo using Gemini Vision API.

**Acceptance criteria:**
- [ ] `GeminiOcrAdapter` class created
- [ ] `ocrMeter(file: Buffer, meterType: string)` method implemented
- [ ] Gemini Vision API called with proper prompt
- [ ] Response mapped to C3 P1 schema (kwh, confidence, bbox, etc)
- [ ] Provider errors mapped to user-friendly messages
- [ ] Returns `needs_retake: true` on low confidence

**Verification:**
- [ ] Unit test with mock Gemini response passes
- [ ] Integration test with real Gemini API (dev key, 1 image) passes
- [ ] Contract test validates response shape
- [ ] Error handling tested (API down, invalid image)

**Dependencies:** Task 1.1, 1.2

**Files:**
- `apps/api/src/ai/adapters/live/gemini-ocr.adapter.ts`
- `apps/api/src/ai/adapters/live/gemini-ocr.adapter.spec.ts`
- `tests/integration/gemini-ocr.test.ts`

---

### Task 2.2: Implement Gemini OCR Label adapter (P2)
**Description:** Extract appliance name and power (W) from label photo.

**Acceptance criteria:**
- [ ] `ocrLabel(file: Buffer, applianceHint?: string)` method implemented
- [ ] Extracts appliance name and power_w
- [ ] Returns confidence score
- [ ] Handles missing/unclear labels gracefully
- [ ] Response mapped to C3 P2 schema

**Verification:**
- [ ] Unit test passes
- [ ] Integration test with real label image passes
- [ ] Contract test validates response shape
- [ ] Edge cases tested (no label, damaged label)

**Dependencies:** Task 2.1 (shares adapter class)

**Files:**
- `apps/api/src/ai/adapters/live/gemini-ocr.adapter.ts` (add method)
- `apps/api/src/ai/adapters/live/gemini-ocr.adapter.spec.ts` (add tests)

---

### Task 2.3: Implement Gemini OCR Token adapter (P3)
**Description:** Extract PLN token data (date, Rupiah, kWh, remaining) from screenshot.

**Acceptance criteria:**
- [ ] `ocrToken(file: Buffer)` method implemented
- [ ] Extracts: date, amount_rp, kwh, remaining_kwh
- [ ] Handles struk (receipt) and layar (screen) formats
- [ ] Response mapped to C3 P3 schema
- [ ] Confidence scoring for each field

**Verification:**
- [ ] Unit test passes
- [ ] Integration test with token screenshot passes
- [ ] Contract test validates response shape
- [ ] Both struk and layar formats tested

**Dependencies:** Task 2.1

**Files:**
- `apps/api/src/ai/adapters/live/gemini-ocr.adapter.ts` (add method)
- `apps/api/src/ai/adapters/live/gemini-ocr.adapter.spec.ts` (add tests)

---

### Task 2.4: Wire P1-P3 pipelines to use live adapter
**Description:** Update pipeline files to select adapter based on AI_MODE.

**Acceptance criteria:**
- [ ] `p1-ocr-meter.ts` uses mock or live adapter based on `AI_MODE`
- [ ] `p2-ocr-label.ts` uses mock or live adapter based on `AI_MODE`
- [ ] `p3-ocr-token.ts` uses mock or live adapter based on `AI_MODE`
- [ ] Adapter factory pattern implemented
- [ ] Live mode rejected in pilot/production without proper env setup

**Verification:**
- [ ] `AI_MODE=mock pnpm test` uses mock adapter
- [ ] `AI_MODE=live pnpm test` uses live adapter (with real keys)
- [ ] Pipeline tests pass in both modes
- [ ] Startup fails if `AI_MODE=mock` in production

**Dependencies:** Task 2.1, 2.2, 2.3

**Files:**
- `apps/api/src/ai/pipelines/p1-ocr-meter.ts`
- `apps/api/src/ai/pipelines/p2-ocr-label.ts`
- `apps/api/src/ai/pipelines/p3-ocr-token.ts`
- `apps/api/src/ai/adapter-factory.ts` (new)

---

## Checkpoint 2: OCR Works
- [ ] P1 OCR meter returns valid response with Gemini
- [ ] P2 OCR label extracts appliance info
- [ ] P3 OCR token extracts token data
- [ ] Contract tests pass for P1-P3 live
- [ ] Integration tests with real API pass

---

## Phase 3: AssemblyAI STT Adapter (P4)

### Task 3.1: Implement AssemblyAI STT adapter with webhook
**Description:** Create adapter to transcribe Indonesian voice notes using AssemblyAI with webhook for long audio.

**Acceptance criteria:**
- [ ] `AssemblyAiSttAdapter` class created
- [ ] `transcribeAudio(audioFile: Buffer)` async method implemented
- [ ] Upload audio to AssemblyAI with webhook URL
- [ ] Webhook endpoint created: `POST /webhooks/assemblyai-callback`
- [ ] Job status stored in Supabase (pending/completed/failed)
- [ ] Returns job_id immediately for client polling
- [ ] Handles webhook callback and updates job status
- [ ] Maps completed response to C3 P4 schema

**Verification:**
- [ ] Unit test with mock AssemblyAI response passes
- [ ] Integration test with real audio (<5 sec) passes
- [ ] Integration test with long audio (>10 sec) uses webhook
- [ ] Webhook signature validation works
- [ ] Job status polling endpoint works

**Dependencies:** Task 1.1, 1.2

**Files:**
- `apps/api/src/ai/adapters/live/assemblyai-stt.adapter.ts`
- `apps/api/src/ai/adapters/live/assemblyai-stt.adapter.spec.ts`
- `apps/api/src/webhooks/assemblyai.controller.ts`
- `apps/api/src/ai/services/stt-job-tracker.service.ts`
- `tests/integration/assemblyai-stt.test.ts`

---

### Task 3.2: Implement STT extraction logic (P4)
**Description:** Parse transcript and extract structured appliance entries.

**Acceptance criteria:**
- [ ] `SttExtractorService` created
- [ ] Parses transcript for appliance names, hours, volumes
- [ ] Matches against provided appliance list
- [ ] Returns structured entries array (appliance_id, hours, volume, confidence)
- [ ] Generates confirmation text for user
- [ ] Handles ambiguous/unclear transcripts

**Verification:**
- [ ] Unit test with sample transcripts passes
- [ ] Edge cases tested (no match, multiple appliances, unclear numbers)
- [ ] Confirmation text is user-friendly
- [ ] Extraction accuracy ≥80% on test dataset

**Dependencies:** Task 3.1

**Files:**
- `apps/api/src/ai/adapters/live/stt-extractor.service.ts`
- `apps/api/src/ai/adapters/live/stt-extractor.service.spec.ts`

---

### Task 3.3: Wire P4 pipeline to use live adapter
**Description:** Update P4 pipeline to use AssemblyAI adapter based on AI_MODE.

**Acceptance criteria:**
- [ ] `p4-stt-extract.ts` uses mock or live adapter
- [ ] Handles audio reference (URL or base64)
- [ ] Job polling endpoint created for async transcription
- [ ] Response includes job_id when async
- [ ] Adapter factory supports STT adapters

**Verification:**
- [ ] `AI_MODE=mock` returns mock transcript immediately
- [ ] `AI_MODE=live` with short audio returns transcript
- [ ] `AI_MODE=live` with long audio returns job_id
- [ ] Client can poll job status
- [ ] Contract tests pass

**Dependencies:** Task 3.1, 3.2

**Files:**
- `apps/api/src/ai/pipelines/p4-stt-extract.ts`
- `apps/api/src/ai/adapter-factory.ts` (update)
- `apps/api/src/ai/ai.controller.ts` (add polling endpoint)

---

## Checkpoint 3: STT Works
- [ ] P4 STT transcribes Indonesian voice notes
- [ ] Extraction returns structured entries
- [ ] Webhook flow works for long audio
- [ ] Contract tests pass for P4 live
- [ ] Integration tests pass

---

## Phase 4: Gemini LLM Adapter (P8, P10)

### Task 4.1: Implement Gemini LLM Explain adapter (P8)
**Description:** Generate 1-2 sentence explanations without creating new numbers.

**Acceptance criteria:**
- [ ] `GeminiLlmAdapter` class created
- [ ] `explain(kind: string, result: object)` method implemented
- [ ] Generates 1-2 sentence explanation in Bahasa Indonesia
- [ ] Validates no new numbers in output (numbers_used: [])
- [ ] Response mapped to C3 P8 schema
- [ ] Handles different kinds: estimate, recommendation, report

**Verification:**
- [ ] Unit test validates no new numbers created
- [ ] Integration test with real Gemini generates valid explanation
- [ ] Output is 1-2 sentences max
- [ ] Tone is ramah, not technical
- [ ] Contract test passes

**Dependencies:** Task 1.1, 1.2

**Files:**
- `apps/api/src/ai/adapters/live/gemini-llm.adapter.ts`
- `apps/api/src/ai/adapters/live/gemini-llm.adapter.spec.ts`
- `tests/integration/gemini-llm.test.ts`

---

### Task 4.2: Implement Gemini LLM Ask adapter (P10) with tools
**Description:** Answer user questions with DB context using Gemini function calling.

**Acceptance criteria:**
- [ ] `ask(businessId: string, question: string, conversationId?: string)` method
- [ ] Tools defined: `getEstimate`, `getHistory`, `getRecommendations`, `getPrediction`
- [ ] `TerraToolsService` created for DB queries
- [ ] Permission check: user can only query own business_id
- [ ] Tool execution fetches from DB (estimates, history, recommendations tables)
- [ ] Returns answer with sources (which tools called)
- [ ] Handles low confidence → suggests missions
- [ ] Conversation history maintained (conversationId)

**Verification:**
- [ ] Unit test with mock tools passes
- [ ] Integration test with real DB and Gemini passes
- [ ] Permission check prevents cross-user data access
- [ ] Tool calls logged for debugging
- [ ] Sources returned in response
- [ ] Contract test passes

**Dependencies:** Task 4.1

**Files:**
- `apps/api/src/ai/adapters/live/gemini-llm.adapter.ts` (add method)
- `apps/api/src/ai/tools/terra-tools.service.ts`
- `apps/api/src/ai/tools/terra-tools.service.spec.ts`
- `apps/api/src/ai/tools/tool-definitions.ts`

---

### Task 4.3: Wire P8, P10 pipelines to use live adapter
**Description:** Update P8 and P10 pipelines to use Gemini LLM adapter.

**Acceptance criteria:**
- [ ] `p8-explain.ts` uses mock or live adapter
- [ ] `p10-ask.ts` uses mock or live adapter with tools
- [ ] Adapter factory updated for LLM adapters
- [ ] Conversation storage (conversationId persistence)

**Verification:**
- [ ] Both modes (mock/live) work
- [ ] P8 generates explanations
- [ ] P10 answers questions with DB context
- [ ] Pipeline tests pass
- [ ] Contract tests pass

**Dependencies:** Task 4.1, 4.2

**Files:**
- `apps/api/src/ai/pipelines/p8-explain.ts`
- `apps/api/src/ai/pipelines/p10-ask.ts`
- `apps/api/src/ai/adapter-factory.ts` (update)
- `apps/api/src/ai/services/conversation-store.service.ts`

---

## Checkpoint 4: LLM Works
- [ ] P8 Explain generates explanations without new numbers
- [ ] P10 Terra answers questions with DB context
- [ ] Tools execute correctly with permission checks
- [ ] Contract tests pass for P8, P10 live

---

## Phase 5: Rate Limiting Implementation

### Task 5.1: Implement Supabase KV rate limiter service
**Description:** Track API usage per pipeline per user per day in Supabase KV.

**Acceptance criteria:**
- [ ] `SupabaseRateLimiterService` class created
- [ ] `checkQuota(pipeline, userId, priority)` method implemented
- [ ] Key format: `rl:{date}:{userId}:{pipeline}`
- [ ] Value: `{ count: number, resetAt: ISO8601, firstUsedAt: ISO8601 }`
- [ ] Tracks usage per pipeline per day
- [ ] Resets counter at midnight Pacific time
- [ ] Returns `RateLimitResult` with allowed/remaining/resetAt/userMessage
- [ ] Cleanup expired keys (>7 days old)

**Verification:**
- [ ] Unit test with mock Supabase KV passes
- [ ] Integration test with real Supabase KV passes
- [ ] Counter increments correctly
- [ ] Reset at midnight PT works
- [ ] Expired key cleanup works

**Dependencies:** Task 1.3

**Files:**
- `apps/api/src/ai/adapters/live/supabase-rate-limiter.service.ts`
- `apps/api/src/ai/adapters/live/supabase-rate-limiter.service.spec.ts`
- `tests/integration/rate-limiter.test.ts`

---

### Task 5.2: Implement user-friendly message generation
**Description:** Generate Bahasa Indonesia messages when quota exceeded.

**Acceptance criteria:**
- [ ] `getFriendlyMessage(pipeline, resetAt)` function created
- [ ] Messages in Bahasa Indonesia, ramah, clear
- [ ] Includes retry time in WIB (format: "jam 15:00")
- [ ] Different messages per pipeline (STT, Terra, OCR, Explain)
- [ ] Example: "Fitur suara lagi penuh hari ini. Coba lagi jam 15:00 atau ketik manual ya 😊"

**Verification:**
- [ ] Unit test validates message format
- [ ] All pipelines have messages
- [ ] Time conversion to WIB correct
- [ ] Messages reviewed by human (not AI slop)

**Dependencies:** Task 5.1

**Files:**
- `apps/api/src/ai/adapters/live/rate-limiter-messages.ts`
- `apps/api/src/ai/adapters/live/rate-limiter-messages.spec.ts`

---

### Task 5.3: Implement priority allocation logic
**Description:** Allocate daily quota by priority (high/medium/low).

**Acceptance criteria:**
- [ ] Priority allocation constants defined
  - OCR (P1-P3): 200 calls/day (high priority, 40% of 500)
  - Explain (P8): 100 calls/day (medium, 20%)
  - STT (P4): 100 calls/day (medium, 20%)
  - Terra (P10): 100 calls/day (low, 20%)
- [ ] Per-user cap: 150 calls/day total across all pipelines
- [ ] `getQuotaForPriority(pipeline, priority)` function
- [ ] Total quota validation (sum = 500 RPD max)

**Verification:**
- [ ] Unit test validates allocation sums to 500
- [ ] Per-user cap enforced across pipelines
- [ ] Priority tiers work as expected

**Dependencies:** Task 5.1

**Files:**
- `apps/api/src/ai/adapters/live/rate-limiter.constants.ts`
- `apps/api/src/ai/adapters/live/rate-limiter.service.ts` (add logic)

---

### Task 5.4: Integrate rate limiter into pipelines
**Description:** Add rate limiting to all AI pipelines (P1-P4, P8, P10).

**Acceptance criteria:**
- [ ] Check quota BEFORE calling AI adapter
- [ ] Return `RATE_LIMIT_EXCEEDED` error with userMessage on limit
- [ ] Increment counter AFTER successful API call (don't count failures)
- [ ] Include remaining quota in success response
- [ ] HTTP 429 status code for rate limit errors

**Verification:**
- [ ] Rate limit prevents exceeding 500 RPD
- [ ] User sees friendly message
- [ ] Failed API calls don't count against quota
- [ ] Integration test simulates limit scenario
- [ ] All pipelines protected

**Dependencies:** Task 5.1, 5.2, 5.3, Phase 2-4 complete

**Files:**
- `apps/api/src/ai/pipelines/p1-ocr-meter.ts` (add rate limiting)
- `apps/api/src/ai/pipelines/p2-ocr-label.ts`
- `apps/api/src/ai/pipelines/p3-ocr-token.ts`
- `apps/api/src/ai/pipelines/p4-stt-extract.ts`
- `apps/api/src/ai/pipelines/p8-explain.ts`
- `apps/api/src/ai/pipelines/p10-ask.ts`
- `apps/api/src/ai/exceptions/rate-limit.exception.ts`

---

## Checkpoint 5: Rate Limiting Works
- [ ] Quota check prevents exceeding 500 RPD
- [ ] User sees friendly message when limit hit
- [ ] Per-user cap enforced (150 calls/day)
- [ ] Quota resets at midnight Pacific
- [ ] Failed calls don't count against quota

---

## Phase 6: Fallback Logic & Frontend Contract

### Task 6.0: Define fallback contract with Dhifansa
**Description:** Create shared types and documentation for fallback UI.

**Acceptance criteria:**
- [ ] `packages/contracts/src/fallback.ts` created
- [ ] Type: `FallbackResponse = { fallbackAvailable: boolean, fallbackData, userMessage }`
- [ ] `fallbackData` typed per pipeline (TextInputFallback, FaqFallback, etc)
- [ ] `docs/FALLBACK-CONTRACT.md` documentation created
- [ ] Requirements shared with Dhifansa
- [ ] Implementation timeline coordinated

**Verification:**
- [ ] Types compile
- [ ] Documentation clear
- [ ] Dhifansa confirms understanding
- [ ] Contract test validates shape

**Dependencies:** Phase 5 complete

**Files:**
- `packages/contracts/src/fallback.ts`
- `packages/contracts/src/fallback.schema.json`
- `docs/FALLBACK-CONTRACT.md`

---

### Task 6.1: Implement STT fallback service
**Description:** Return text input form when STT quota exceeded.

**Acceptance criteria:**
- [ ] Returns `fallbackAvailable: true` when STT limit hit
- [ ] `fallbackData.type = 'text_input'`
- [ ] Includes appliance list for autocomplete
- [ ] Provides example format: "AC nyala 8 jam"
- [ ] User message guides to text input

**Verification:**
- [ ] Fallback triggers at quota limit
- [ ] Response shape matches contract
- [ ] Frontend can render fallback UI
- [ ] Integration test validates flow

**Dependencies:** Task 6.0

**Files:**
- `apps/api/src/ai/pipelines/p4-stt-extract.ts` (add fallback)
- `apps/api/src/ai/fallback/stt-fallback.service.ts`

---

### Task 6.2: Implement Terra fallback service
**Description:** Return FAQ list when Terra quota exceeded.

**Acceptance criteria:**
- [ ] Returns `fallbackAvailable: true` when Terra limit hit
- [ ] `fallbackData.type = 'faq'`
- [ ] Pre-defined FAQ list (10 common questions + answers)
- [ ] FAQs in Bahasa Indonesia, ramah
- [ ] User message suggests FAQ

**Verification:**
- [ ] Fallback triggers at quota limit
- [ ] FAQ list returned
- [ ] Response shape matches contract
- [ ] FAQ content reviewed (not AI slop)

**Dependencies:** Task 6.0

**Files:**
- `apps/api/src/ai/pipelines/p10-ask.ts` (add fallback)
- `apps/api/src/ai/fallback/faq.data.ts`
- `apps/api/src/ai/fallback/terra-fallback.service.ts`

---

### Task 6.3: Implement OCR fallback service
**Description:** Return manual input form when OCR quota exceeded.

**Acceptance criteria:**
- [ ] Returns `fallbackAvailable: true` when OCR limit hit
- [ ] `fallbackData.type = 'manual_input'`
- [ ] Includes form fields (kWh for meter, name+power for label)
- [ ] Option to queue for next day (store request in DB)
- [ ] User message guides to manual input

**Verification:**
- [ ] Fallback triggers at quota limit
- [ ] Manual input form data returned
- [ ] Queue option works
- [ ] Response shape matches contract

**Dependencies:** Task 6.0

**Files:**
- `apps/api/src/ai/pipelines/p1-ocr-meter.ts` (add fallback)
- `apps/api/src/ai/pipelines/p2-ocr-label.ts` (add fallback)
- `apps/api/src/ai/fallback/ocr-fallback.service.ts`
- `apps/api/src/ai/services/ocr-queue.service.ts`

---

### Task 6.4: Implement Explain fallback service
**Description:** Return template response when Explain quota exceeded.

**Acceptance criteria:**
- [ ] Returns `fallbackAvailable: true` when Explain limit hit
- [ ] `fallbackData.type = 'template'`
- [ ] Template response per category (AC high, kulkas medium, etc)
- [ ] Non-LLM generated, pre-written templates
- [ ] User message indicates simplified response

**Verification:**
- [ ] Fallback triggers at quota limit
- [ ] Template response returned
- [ ] Response shape matches contract
- [ ] Templates reviewed (clear, helpful)

**Dependencies:** Task 6.0

**Files:**
- `apps/api/src/ai/pipelines/p8-explain.ts` (add fallback)
- `apps/api/src/ai/fallback/explain-templates.ts`
- `apps/api/src/ai/fallback/explain-fallback.service.ts`

---

## Checkpoint 6: Fallbacks Work
- [ ] STT fallback shows text input option
- [ ] Terra fallback shows FAQ
- [ ] OCR fallback shows manual input
- [ ] Explain fallback shows template
- [ ] All responses match contract
- [ ] Dhifansa can render fallback UIs

---

## Phase 7: Backend Logic (P11-P13)

### Task 7.1: Implement Alert service (P11)
**Description:** Detect anomalies in daily energy usage patterns.

**Acceptance criteria:**
- [ ] `AnomalyDetectionService` created
- [ ] Statistical detection: median ± X × MAD (median absolute deviation)
- [ ] Compare daily usage against 7-day rolling window
- [ ] Return notification with deviation percentage
- [ ] Threshold configurable (default: 2 × MAD)
- [ ] User can mark alert "tidak relevan" (ignored)

**Verification:**
- [ ] Unit test with sample usage data passes
- [ ] Detects actual anomalies (spike, drop)
- [ ] Doesn't false-alarm on weekends/holidays
- [ ] Threshold tuning tested
- [ ] Response matches PRD P11 spec

**Dependencies:** None (backend logic)

**Files:**
- `apps/api/src/ai/pipelines/p11-alert.ts`
- `apps/api/src/ai/services/anomaly-detection.service.ts`
- `apps/api/src/ai/services/anomaly-detection.service.spec.ts`

---

### Task 7.2: Implement Token Prediction service (P12)
**Description:** Predict when prepaid kWh will run out.

**Acceptance criteria:**
- [ ] `TokenPredictionService` created
- [ ] Linear projection from daily average usage (7-day window)
- [ ] Calculate days until remaining_kwh exhausted
- [ ] Return date range estimate (min/max based on variance)
- [ ] Only for prabayar users (check meter type)
- [ ] Handles insufficient data gracefully

**Verification:**
- [ ] Unit test with sample data passes
- [ ] Prediction accuracy validated against test scenarios
- [ ] Edge cases tested (high variance, insufficient data)
- [ ] Response matches PRD P12 spec

**Dependencies:** None

**Files:**
- `apps/api/src/ai/pipelines/p12-token-prediction.ts`
- `apps/api/src/ai/services/token-prediction.service.ts`
- `apps/api/src/ai/services/token-prediction.service.spec.ts`

---

### Task 7.3: Implement ROI Calculator service (P13)
**Description:** Calculate payback period for new appliance purchase.

**Acceptance criteria:**
- [ ] `RoiCalculatorService` created
- [ ] Uses `@voltess/energy-calc` for kWh/Rupiah calculations
- [ ] Compare old vs new appliance (power, hours, cost)
- [ ] Calculate monthly savings
- [ ] Return payback period range (min/max months)
- [ ] All assumptions displayed to user (tariff, usage pattern)

**Verification:**
- [ ] Unit test with sample appliances passes
- [ ] Integration test with `@voltess/energy-calc` passes
- [ ] Payback calculation accurate
- [ ] Edge cases tested (negative savings, very long payback)
- [ ] Response matches PRD P13 spec

**Dependencies:** `@voltess/energy-calc` package exists

**Files:**
- `apps/api/src/ai/pipelines/p13-roi-calculator.ts`
- `apps/api/src/ai/services/roi-calculator.service.ts`
- `apps/api/src/ai/services/roi-calculator.service.spec.ts`

---

### Task 7.4: Create endpoints for P11-P13
**Description:** Wire backend logic to HTTP endpoints.

**Acceptance criteria:**
- [ ] `POST /ai/alert` endpoint created (P11)
- [ ] `POST /ai/predict-token` endpoint created (P12)
- [ ] `POST /ai/calculate-roi` endpoint created (P13)
- [ ] Request validation (Joi schemas or class-validator)
- [ ] OpenAPI spec updated in `packages/contracts/openapi.yaml`
- [ ] Error handling (400, 422, 500)

**Verification:**
- [ ] `curl` requests work
- [ ] Request validation rejects bad input
- [ ] Responses match OpenAPI spec
- [ ] Integration test hits endpoints

**Dependencies:** Task 7.1, 7.2, 7.3

**Files:**
- `apps/api/src/ai/ai.controller.ts` (add endpoints)
- `apps/api/src/ai/dto/alert.dto.ts`
- `apps/api/src/ai/dto/token-prediction.dto.ts`
- `apps/api/src/ai/dto/roi-calculator.dto.ts`
- `packages/contracts/openapi.yaml` (update)

---

## Checkpoint 7: Backend Logic Works
- [ ] P11 Alert detects anomalies
- [ ] P12 Token prediction returns date range
- [ ] P13 ROI calculator returns payback period
- [ ] All use real calculation (no mock)
- [ ] Endpoints accessible via HTTP
- [ ] OpenAPI spec updated

---

## Phase 8: Testing & Documentation

### Task 8.1: Write contract tests for live adapters
**Description:** Ensure live responses match C3 schema and mock compatibility.

**Acceptance criteria:**
- [ ] Test P1-P10 live responses match C3 schema
- [ ] Test error responses (provider error, rate limit, insufficient data)
- [ ] Test mock/live response shape compatibility (same fields)
- [ ] Test envelope fields (request_id, engine_version, mode, confidence)
- [ ] All scenarios covered (success, low_confidence, insufficient_data, provider_error)

**Verification:**
- [ ] `pnpm test:contract` passes
- [ ] Both mock and live modes tested
- [ ] JSON schema validation passes
- [ ] Contract tests in CI pipeline

**Dependencies:** All Phase 2-7 tasks complete

**Files:**
- `tests/contract/ai-live.test.ts`
- `tests/contract/ai-response-schema.test.ts`

---

### Task 8.2: Write integration tests for rate limiter
**Description:** Test quota enforcement end-to-end.

**Acceptance criteria:**
- [ ] Test quota enforcement (hit limit, get 429)
- [ ] Test priority allocation (OCR gets 200, others 100)
- [ ] Test per-user cap (150 calls/day total)
- [ ] Test reset at midnight Pacific
- [ ] Test counter doesn't increment on failed calls
- [ ] Test Supabase KV integration

**Verification:**
- [ ] Integration tests pass with real Supabase KV
- [ ] Edge cases covered (exactly at limit, just over limit)
- [ ] Timezone handling correct (midnight PT)
- [ ] Concurrent requests handled correctly

**Dependencies:** Phase 5 complete

**Files:**
- `tests/integration/rate-limiter.test.ts`
- `tests/integration/rate-limiter-edge-cases.test.ts`

---

### Task 8.3: Write integration tests for AI adapters
**Description:** Test adapters with real APIs (small quota).

**Acceptance criteria:**
- [ ] Test Gemini OCR with real image (1 call per test run)
- [ ] Test AssemblyAI with real audio (<5 sec, 1 call per run)
- [ ] Test Gemini LLM with real prompt (1 call per run)
- [ ] Test error handling (API down, invalid input)
- [ ] Rate limit these tests (don't exhaust quota)

**Verification:**
- [ ] Tests pass with real APIs
- [ ] Tests skip if API keys not set (CI without secrets)
- [ ] Total test quota usage <10 calls/day
- [ ] Mocked for unit tests, real for integration

**Dependencies:** All Phase 2-4 tasks complete

**Files:**
- `tests/integration/gemini-adapters.test.ts`
- `tests/integration/assemblyai-adapter.test.ts`
- `tests/integration/ai-error-handling.test.ts`

---

### Task 8.4: Update AI Gateway documentation
**Description:** Document live mode setup, rate limiting, and new features.

**Acceptance criteria:**
- [ ] Document live mode setup (API keys, environment variables)
- [ ] Document rate limiting behavior (quotas, reset time, fallbacks)
- [ ] Document P11-P13 endpoints and usage
- [ ] Update existing `docs/AI-GATEWAY.md`
- [ ] Add troubleshooting section (common errors, solutions)
- [ ] Add examples for all new endpoints

**Verification:**
- [ ] Documentation complete
- [ ] All examples tested (copy-paste works)
- [ ] Reviewed by human
- [ ] Links to contracts/schemas correct

**Dependencies:** All previous phases complete

**Files:**
- `docs/AI-GATEWAY.md` (update)
- `docs/RATE-LIMITING.md` (new)
- `docs/FALLBACK-CONTRACT.md` (already created in Task 6.0)

---

## Checkpoint 8: Testing Complete
- [ ] All contract tests pass
- [ ] All integration tests pass
- [ ] Test coverage ≥80% for new code
- [ ] Documentation updated and accurate
- [ ] CI pipeline green

---

## Phase 9: Deployment & Monitoring

### Task 9.1: Setup environment variables in Vercel
**Description:** Configure production environment for live mode.

**Acceptance criteria:**
- [ ] `GEMINI_API_KEY` added to Vercel env (production)
- [ ] `ASSEMBLYAI_API_KEY` added to Vercel env (production)
- [ ] `AI_MODE=live` set in production
- [ ] `SUPABASE_URL` and `SUPABASE_ANON_KEY` configured
- [ ] Webhook URL configured for AssemblyAI callbacks
- [ ] Environment variables encrypted

**Verification:**
- [ ] Vercel dashboard shows all vars
- [ ] Test deployment reads vars correctly
- [ ] No keys in git history
- [ ] Secrets scan passes

**Dependencies:** Phase 8 complete

**Platform:** Vercel dashboard

---

### Task 9.2: Deploy to Vercel staging
**Description:** Deploy to staging environment and test.

**Acceptance criteria:**
- [ ] Branch deployed to Vercel staging
- [ ] All endpoints accessible via staging URL
- [ ] Health check endpoint returns `{ mode: "live", status: "healthy" }`
- [ ] Test all P1-P13 endpoints with staging
- [ ] Rate limiting works in staging
- [ ] Webhook callbacks work

**Verification:**
- [ ] Staging deployment successful
- [ ] Manual testing passes
- [ ] No errors in Vercel logs
- [ ] Ready for production

**Dependencies:** Task 9.1

**Platform:** Vercel

---

### Task 9.3: Create monitoring dashboard
**Description:** Track usage and alert at 85% quota.

**Acceptance criteria:**
- [ ] Usage tracker service created
- [ ] Track daily usage per pipeline (stored in Supabase)
- [ ] Dashboard page created (`/admin/usage-dashboard`)
- [ ] Alert at 85% quota (425/500 Gemini, 157/185 AssemblyAI)
- [ ] Usage graph with 85% threshold line visualization
- [ ] Dashboard only (no email/Slack alerts)
- [ ] Shows: current usage, limit, percentage, reset time

**Verification:**
- [ ] Dashboard accessible (auth required)
- [ ] Real-time usage displayed
- [ ] Alert triggers at 85%
- [ ] Graph visualization clear
- [ ] Data persisted in Supabase

**Dependencies:** Phase 5 complete

**Files:**
- `apps/api/src/monitoring/usage-tracker.service.ts`
- `apps/web/src/app/admin/usage-dashboard.tsx`
- `apps/api/src/monitoring/usage-alert.service.ts`

---

### Task 9.4: Load test with 1-3 simulated users
**Description:** Simulate typical usage and verify quota handling.

**Acceptance criteria:**
- [ ] Load test script simulates 1-3 users
- [ ] Typical usage pattern: 2 OCR/week, 5 Explain/day, 3 STT/day, 2 Terra/day
- [ ] Run for 1 simulated day (compressed time)
- [ ] Verify total usage stays <500 RPD
- [ ] Verify fallbacks trigger correctly when quota approached
- [ ] Measure: success rate, error rate, fallback rate

**Verification:**
- [ ] Load test completes successfully
- [ ] Quota not exceeded
- [ ] Fallbacks work as expected
- [ ] Performance acceptable (p95 latency <2s)
- [ ] No crashes or errors

**Dependencies:** Task 9.2

**Files:**
- `tests/load/simulate-users.test.ts`
- `tests/load/user-scenarios.ts`

---

## Checkpoint 9: Deployment Ready
- [ ] Staging deployment works
- [ ] Monitoring dashboard live
- [ ] Load tests pass
- [ ] All environment vars configured
- [ ] Ready for 1-3 UMKM deployment
- [ ] Rollback plan documented

---

## Final Checklist

### Functional
- [ ] P1-P3 OCR works with Gemini
- [ ] P4 STT works with AssemblyAI (including webhook)
- [ ] P8 Explain works with Gemini
- [ ] P10 Tanya Terra works with Gemini + tools
- [ ] P11-P13 backend logic works

### Rate Limiting
- [ ] Gemini usage stays <500 RPD
- [ ] AssemblyAI usage tracked
- [ ] Priority tiering enforced
- [ ] Per-user caps enforced
- [ ] Friendly messages shown

### Fallbacks
- [ ] STT fallback → text input
- [ ] Terra fallback → FAQ
- [ ] OCR fallback → manual input
- [ ] Explain fallback → template

### Quality
- [ ] Test coverage ≥80%
- [ ] All contract tests pass
- [ ] All integration tests pass
- [ ] Documentation complete
- [ ] No API keys in git

### Deployment
- [ ] Staging verified
- [ ] Monitoring active
- [ ] Load test passed
- [ ] Production ready

---

**Total tasks:** 41  
**Estimated completion:** 2-3 weeks (with testing and review cycles)  
**Critical path:** Phase 1-2-3-4-5-9 (adapters → rate limiting → deployment)
