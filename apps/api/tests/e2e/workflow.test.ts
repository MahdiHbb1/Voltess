/**
 * E2E Workflow Test
 * Prerequisites: API server running on localhost:3001
 *
 * Two modes:
 *
 * 1. Contract mode (default, AI_MODE=mock):
 *    `pnpm --filter @voltess/api test:e2e`
 *    Exercises the real HTTP server with deterministic mock responses and
 *    validates every response against the official C2/C3 JSON schemas.
 *
 * 2. Live OCR mode (AI_MODE=hybrid):
 *    `$env:E2E_EXPECT_LIVE_OCR='1'; pnpm --filter @voltess/api test:e2e`
 *    Sends real files from tests/datasets/d-ocr through the Gemini adapter and
 *    asserts the values against manually verified ground truth in
 *    tests/datasets/d-ocr/metadata.json. Also validates C3 envelopes.
 *
 * See LIVE-E2E.md for provider status and the accuracy report.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const EXPECT_LIVE_OCR = process.env.E2E_EXPECT_LIVE_OCR === '1';
const EXPECT_LIVE_AI = process.env.E2E_EXPECT_LIVE_AI === '1';

const schemaDirCandidates = [
  join(process.cwd(), 'packages', 'contracts', 'schemas'),
  join(process.cwd(), '..', '..', 'packages', 'contracts', 'schemas'),
];
const schemasDir = schemaDirCandidates.find(existsSync);
if (!schemasDir) {
  throw new Error('Folder packages/contracts/schemas tidak ditemukan.');
}

const datasetCandidates = [
  join(process.cwd(), 'tests', 'datasets', 'd-ocr'),
  join(process.cwd(), '..', '..', 'tests', 'datasets', 'd-ocr'),
];
const datasetDir = datasetCandidates.find(existsSync);
if (!datasetDir) {
  throw new Error('Folder tests/datasets/d-ocr tidak ditemukan.');
}

const sttDatasetCandidates = [
  join(process.cwd(), 'tests', 'datasets', 'd-stt'),
  join(process.cwd(), '..', '..', 'tests', 'datasets', 'd-stt'),
];
const sttDatasetDir = sttDatasetCandidates.find(existsSync);
if (!sttDatasetDir) {
  throw new Error('Folder tests/datasets/d-stt tidak ditemukan.');
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const file of readdirSync(schemasDir)) {
  if (file.endsWith('.schema.json')) {
    ajv.addSchema(JSON.parse(readFileSync(join(schemasDir, file), 'utf8')) as object);
  }
}

function validateContract(schemaFile: string, data: unknown): void {
  const validator = ajv.getSchema(`https://voltess.local/schemas/${schemaFile}`);
  if (!validator) throw new Error(`Schema not registered: ${schemaFile}`);
  if (!validator(data)) {
    throw new Error(`Kontrak ${schemaFile} gagal:\n${ajv.errorsText(validator.errors)}`);
  }
}

interface RawResponse {
  status: number;
  body: unknown;
  headers: Headers;
}

async function requestRaw(path: string, options: RequestInit = {}): Promise<RawResponse> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const text = await res.text();
  let body: unknown = undefined;
  try {
    body = text.length > 0 ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}

async function uploadFile(
  path: string,
  file: Blob,
  filename: string,
  fields: Record<string, string> = {},
  headers: Record<string, string> = {},
) {
  const form = new FormData();
  form.append('file', file, filename);
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: form,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}

function imageBlob(relativePath: string): Blob {
  const full = join(datasetDir, relativePath);
  if (!existsSync(full)) {
    throw new Error(`Fixture tidak ditemukan: ${full}`);
  }
  const bytes = readFileSync(full);
  const type = relativePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  return new Blob([bytes], { type });
}

function audioBlob(relativePath: string): Blob {
  const full = join(sttDatasetDir, relativePath);
  if (!existsSync(full)) {
    throw new Error(`Audio fixture tidak ditemukan: ${full}`);
  }
  const bytes = readFileSync(full);
  return new Blob([bytes], { type: 'audio/mpeg' });
}

function audioDataUrl(relativePath: string): string {
  const full = join(sttDatasetDir, relativePath);
  if (!existsSync(full)) {
    throw new Error(`Audio fixture tidak ditemukan: ${full}`);
  }
  const bytes = readFileSync(full);
  return `data:audio/mp3;base64,${bytes.toString('base64')}`;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

interface MeterCase {
  file: string;
  expected: number;
}

async function runLiveOcr(): Promise<number> {
  console.log('🔴 LIVE OCR MODE: file dataset asli + Gemini\n');

  // --- P1: label OCR on a synthetic fixture with known content ---
  console.log('2️⃣ P1: OCR Label (live, synthetic fixture)');
  const label = await uploadFile(
    '/ai/ocr-label',
    imageBlob('fixtures/synthetic-label-ac-pk.png'),
    'synthetic-label-ac-pk.png',
    { appliance_hint: 'AC' },
    { 'x-request-id': 'e2e-live-label-001' },
  );
  validateContract('c3-ai-envelope.schema.json', label);
  assert(label.mode === 'live', `Expected live mode, got ${label.mode}`);
  assert(typeof label.name === 'string' && label.name.length > 0, 'No label name returned');
  assert(typeof label.power_w === 'number' && label.power_w > 0, 'No label power returned');
  assert(label.power_w === 900, `Expected 900 W, got ${label.power_w}`);
  assert(label.needs_retake === false, 'Label should not need a retake');
  console.log(`✅ Label: ${label.name} (${label.power_w} W), confidence ${label.confidence}\n`);

  // --- P2: meter OCR against manually verified ground truth ---
  console.log('3️⃣ P2: OCR Meter (live, ground truth)');
  // Only images whose display can be verified unambiguously are scored.
  // images(65) and images(66) are excluded (decimal point / glare ambiguity).
  const meterCases: MeterCase[] = [
    { file: 'images/images(64).jpg', expected: 45844 },
    { file: 'images/meteran-listrik-dery-ridwansah-2-2.jpg', expected: 5969 },
  ];

  let correct = 0;
  let liveMeter: { kwh: number } | undefined;
  for (const [index, testCase] of meterCases.entries()) {
    const requestId = `e2e-live-meter-${index}`;
    const response = await uploadFile(
      '/ai/ocr-meter',
      imageBlob(testCase.file),
      basename(testCase.file),
      { meter_type: 'prabayar' },
      { 'x-request-id': requestId },
    );
    validateContract('c3-ai-envelope.schema.json', response);
    assert(response.request_id === requestId, 'Request ID was not propagated');
    assert(response.mode === 'live', `Expected live mode, got ${response.mode}`);
    assert(typeof response.kwh === 'number', `No kWh returned for ${testCase.file}`);
    assert(response.unit === 'kWh', `Unexpected unit for ${testCase.file}`);

    const match = Math.abs(response.kwh - testCase.expected) < 1.0;
    if (match) correct += 1;
    if (!liveMeter) liveMeter = response;

    console.log(
      `   ${match ? '✅' : '❌'} ${basename(testCase.file)}: expected ${testCase.expected}, got ${response.kwh} (${response.confidence})`,
    );
  }

  const accuracy = correct / meterCases.length;
  console.log(
    `✅ Meter accuracy: ${correct}/${meterCases.length} (${(accuracy * 100).toFixed(1)}%) on verified ground truth`,
  );
  console.log(
    '   ℹ️  images(65).jpeg and images(66).jpg are excluded: ground truth is ambiguous.\n',
  );
  assert(accuracy === 1, `Live meter accuracy ${accuracy} is below 1.0`);

  // Informational only: show what the adapter returns on the ambiguous image
  // without scoring it. This keeps the limitation visible instead of hidden.
  const ambiguous = await uploadFile(
    '/ai/ocr-meter',
    imageBlob('images/images(65).jpeg'),
    'images(65).jpeg',
    { meter_type: 'prabayar' },
    { 'x-request-id': 'e2e-live-meter-ambiguous' },
  );
  validateContract('c3-ai-envelope.schema.json', ambiguous);
  console.log(
    `   ℹ️  Ambiguous images(65).jpeg: adapter read ${ambiguous.kwh} (${ambiguous.confidence}), not scored\n`,
  );

  // --- P3: token OCR on a synthetic fixture with known content ---
  console.log('4️⃣ P3: OCR Token (live, synthetic fixture)');
  const token = await uploadFile(
    '/ai/ocr-token',
    imageBlob('fixtures/synthetic-token-pln.png'),
    'synthetic-token-pln.png',
    {},
    { 'x-request-id': 'e2e-live-token-001' },
  );
  validateContract('c3-ai-envelope.schema.json', token);
  assert(token.mode === 'live', `Expected live mode, got ${token.mode}`);
  assert(token.amount_rp === 100000, `Expected Rp 100.000, got ${token.amount_rp}`);
  assert(token.kwh === 68.9, `Expected 68.9 kWh, got ${token.kwh}`);
  assert(token.remaining_kwh === 12.4, `Expected 12.4 kWh, got ${token.remaining_kwh}`);
  assert(
    typeof token.date === 'string' && token.date.startsWith('2026-11-07'),
    `Unexpected token date: ${token.date}`,
  );
  console.log(
    `✅ Token: ${token.kwh} kWh / Rp ${token.amount_rp.toLocaleString()}, remaining ${token.remaining_kwh} kWh\n`,
  );

  return liveMeter?.kwh ?? 0;
}

async function runLiveStt(): Promise<void> {
  console.log('🔴 LIVE STT MODE: audio dataset asli + AssemblyAI\n');

  const metadata = JSON.parse(
    readFileSync(join(sttDatasetDir, 'metadata.json'), 'utf8'),
  ) as {
    samples: Array<{
      filename: string;
      ground_truth_transcript: string;
      expected_appliances: string[];
      expected_duration_hours: number;
    }>;
  };

  console.log('5️⃣ P4: STT Extract (live, ground truth)');

  for (const [index, sample] of metadata.samples.entries()) {
    const requestId = `e2e-live-stt-${index}`;
    const payload = {
      audio_ref: audioDataUrl(`audio/${sample.filename}`),
      appliances: sample.expected_appliances.map((name) => ({
        id: `app_${name.toLowerCase()}`,
        name,
      })),
      language: 'id',
    };

    const response = await request('/ai/stt-extract', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'x-request-id': requestId },
    });

    validateContract('c3-ai-envelope.schema.json', response);
    assert(response.request_id === requestId, 'Request ID was not propagated');
    assert(response.mode === 'live', `Expected live mode, got ${response.mode}`);
    assert(typeof response.transcript === 'string', 'No transcript returned');
    assert(Array.isArray(response.entries), 'No entries returned');

    const transcriptMatch = response.transcript.toLowerCase().includes(
      sample.ground_truth_transcript.toLowerCase().slice(0, 10),
    );
    const applianceMatch = response.entries.some((e: { appliance_id: string }) =>
      sample.expected_appliances.some((name) =>
        e.appliance_id.toLowerCase().includes(name.toLowerCase()),
      ),
    );

    console.log(
      `   ${transcriptMatch && applianceMatch ? '✅' : '❌'} ${sample.filename}: transcript="${response.transcript}", entries=${response.entries.length}`,
    );
    assert(transcriptMatch, `Transcript mismatch for ${sample.filename}`);
    assert(applianceMatch, `Appliance extraction failed for ${sample.filename}`);
  }

  console.log(`✅ STT: ${metadata.samples.length}/${metadata.samples.length} passed\n`);
}

async function runLiveLlm(meterKwh: number): Promise<void> {
  console.log('🔴 LIVE LLM MODE: real requests + Groq\n');

  console.log('6️⃣ P5: Explain (live)');
  const explainPayload = {
    business_id: 'biz_e2e',
    kind: 'estimate' as const,
    result: {
      meter_delta_kwh: meterKwh,
      appliances: [
        { name: 'AC', hours: 8, kwh: 6.4 },
        { name: 'Kulkas', hours: 24, kwh: 4.8 },
      ],
    },
  };
  const explain = await request('/ai/explain', {
    method: 'POST',
    body: JSON.stringify(explainPayload),
  });
  validateContract('c3-ai-envelope.schema.json', explain);
  assert(explain.mode === 'live', `Expected live mode, got ${explain.mode}`);
  assert(typeof explain.text === 'string' && explain.text.length > 10, 'No explanation text');
  console.log(`✅ Explain: "${explain.text.slice(0, 80)}..."\n`);

  console.log('7️⃣ P7: Recommend (live)');
  const recommendPayload = {
    business_id: 'biz_e2e',
    estimate: {
      meter_delta_kwh: meterKwh,
      per_appliance: [
        { appliance_id: 'ac', name: 'AC', kwh: 6.4 },
        { appliance_id: 'kulkas', name: 'Kulkas', kwh: 4.8 },
      ],
    },
    template_id: 'default',
    unit_label: 'kWh',
  };
  const recommend = await request('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify(recommendPayload),
  });
  validateContract('c3-ai-envelope.schema.json', recommend);
  assert(recommend.mode === 'live', `Expected live mode, got ${recommend.mode}`);
  assert(
    Array.isArray(recommend.recommendations) && recommend.recommendations.length > 0,
    'No recommendations',
  );
  console.log(`✅ Recommend: ${recommend.recommendations.length} recommendations\n`);

  console.log('8️⃣ P8: Ask (live)');
  const askPayload = {
    business_id: 'biz_e2e',
    question: 'Berapa biaya listrik AC per hari kalau nyala 8 jam?',
  };
  const ask = await request('/ai/ask', {
    method: 'POST',
    body: JSON.stringify(askPayload),
  });
  validateContract('c3-ai-envelope.schema.json', ask);
  assert(ask.mode === 'live', `Expected live mode, got ${ask.mode}`);
  assert(typeof ask.answer === 'string' && ask.answer.length > 10, 'No answer text');
  console.log(`✅ Ask: "${ask.answer.slice(0, 80)}..."\n`);
}

async function main() {
  console.log(
    EXPECT_LIVE_AI
      ? '🧪 E2E Workflow Test (LIVE AI mode: OCR + STT + LLM, contract-validated)\n'
      : EXPECT_LIVE_OCR
        ? '🧪 E2E Workflow Test (LIVE OCR mode, contract-validated)\n'
        : '🧪 E2E Workflow Test (mock mode, contract-validated)\n',
  );

  // 1. Health check
  console.log('1️⃣ Health check...');
  const health = await request('/health');
  assert(health.status === 'ok', 'Health check failed');
  assert(typeof health.contractVersion === 'string', 'No contract version');
  console.log(`✅ Health OK (contract ${health.contractVersion})\n`);

  const dummyImage = new Blob(['fake-image-data'], { type: 'image/jpeg' });

  // 2-4. OCR pipelines: live with dataset files, or mock with a dummy upload.
  let meterKwh: number;
  if (EXPECT_LIVE_OCR || EXPECT_LIVE_AI) {
    meterKwh = await runLiveOcr();
  } else {
    console.log('2️⃣ P1: OCR Label...');
    const requestId = 'e2e-label-001';
    const label = await uploadFile('/ai/ocr-label', dummyImage, 'test.jpg', {}, {
      'x-request-id': requestId,
    });
    validateContract('c3-ai-envelope.schema.json', label);
    assert(label.request_id === requestId, 'Request ID was not propagated');
    assert(typeof label.name === 'string' && label.name.length > 0, 'No label name returned');
    assert(typeof label.power_w === 'number' && label.power_w > 0, 'No label power returned');
    assert(label.mode === 'mock', 'Unexpected AI mode');
    console.log(`✅ Label: ${label.name} (${label.power_w} W), request_id echoed\n`);

    console.log('3️⃣ P2: OCR Meter...');
    const meter = await uploadFile('/ai/ocr-meter', dummyImage, 'test.jpg', {
      meter_type: 'prabayar',
    });
    validateContract('c3-ai-envelope.schema.json', meter);
    assert(meter.mode === 'mock', 'Unexpected AI mode');
    assert(typeof meter.kwh === 'number' && meter.kwh > 0, 'No kWh returned');
    assert(meter.unit === 'kWh', 'Unexpected meter unit');
    console.log(`✅ Meter: ${meter.kwh} ${meter.unit}\n`);
    meterKwh = meter.kwh;

    console.log('4️⃣ P3: OCR Token...');
    const token = await uploadFile('/ai/ocr-token', dummyImage, 'test.jpg');
    validateContract('c3-ai-envelope.schema.json', token);
    assert(token.mode === 'mock', 'Unexpected AI mode');
    assert(typeof token.kwh === 'number' && token.kwh > 0, 'No token kWh returned');
    assert(typeof token.amount_rp === 'number' && token.amount_rp > 0, 'No token amount returned');
    console.log(`✅ Token: ${token.kwh} kWh / Rp ${token.amount_rp.toLocaleString()}\n`);
  }

  // 5. P6: Estimate v0 (includes cross-validation of meter delta vs appliance usage)
  console.log('5️⃣ P6: Estimate v0 + cross-validation...');
  const estimatePayload = {
    business_id: 'biz_e2e',
    window: {
      from: '2026-12-01T06:00:00+07:00',
      to: '2026-12-02T06:00:00+07:00',
    },
    appliances: [{ appliance_id: 'dryer', power_kw: 3, hours: 5, load_factor: 0.7 }],
    meter_delta_kwh: meterKwh,
    data_days: 7,
  };
  const estimate = await request('/ai/estimate', {
    method: 'POST',
    body: JSON.stringify(estimatePayload),
  });
  validateContract('c3-ai-envelope.schema.json', estimate);
  validateContract('c2-estimate.schema.json', estimate);
  assert(typeof estimate.meter_delta_kwh === 'number', 'No meter delta returned');
  assert(
    Array.isArray(estimate.per_appliance) && estimate.per_appliance.length > 0,
    'No appliance estimate',
  );
  assert(typeof estimate.explained_kwh === 'number', 'No explained kWh');
  assert(typeof estimate.unexplained_kwh === 'number', 'No unexplained kWh');
  assert(typeof estimate.gap_ratio === 'number', 'No gap ratio');
  assert(estimate.display_level === 'appliance', 'Unexpected display level');
  console.log(
    `✅ Estimate: ${estimate.explained_kwh} kWh explained, ${estimate.unexplained_kwh} kWh unexplained (${estimate.mode})\n`,
  );

  // 6. Cross-validation consistency
  console.log('6️⃣ Cross-validation consistency...');
  const explained = estimate.explained_kwh;
  const unexplained = estimate.unexplained_kwh;
  const delta = estimate.meter_delta_kwh;
  assert(
    Math.abs(explained + unexplained - delta) < 0.01,
    `Explained (${explained}) + unexplained (${unexplained}) != meter delta (${delta})`,
  );
  assert(
    Math.abs(unexplained / delta - estimate.gap_ratio) < 0.01,
    `Gap ratio ${estimate.gap_ratio} != unexplained/delta (${unexplained / delta})`,
  );
  assert(
    ['low', 'medium', 'high'].includes(estimate.overall_confidence),
    'Invalid overall confidence',
  );
  console.log(
    `✅ Validation: gap ${(estimate.gap_ratio * 100).toFixed(1)}% (${estimate.overall_confidence} confidence)\n`,
  );

  // 7-9. STT and LLM pipelines: live with dataset files, or skip in mock mode
  if (EXPECT_LIVE_AI) {
    await runLiveStt();
    await runLiveLlm(meterKwh);
  }

  // 10. Error paths must be real contract errors, not blanket 500s
  console.log(`${EXPECT_LIVE_AI ? '🔟' : '7️⃣'} Error handling...`);
  const missingFile = await requestRaw('/ai/ocr-label', { method: 'POST' });
  assert(missingFile.status === 400, `Expected 400, got ${missingFile.status}`);
  validateContract('c3-error.schema.json', missingFile.body);
  assert(
    (missingFile.body as { error: { code: string } }).error.code === 'VALIDATION_ERROR',
    'Missing file did not return VALIDATION_ERROR',
  );

  const missingMeterType = await requestRaw('/ai/ocr-meter', {
    method: 'POST',
    body: (() => {
      const form = new FormData();
      form.append('file', dummyImage, 'test.jpg');
      return form;
    })(),
  });
  assert(missingMeterType.status === 400, `Expected 400, got ${missingMeterType.status}`);
  validateContract('c3-error.schema.json', missingMeterType.body);

  const providerError = await requestRaw('/ai/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-ai-scenario': 'provider_error' },
    body: JSON.stringify(estimatePayload),
  });
  assert(providerError.status === 502, `Expected 502, got ${providerError.status}`);
  validateContract('c3-error.schema.json', providerError.body);
  assert(
    (providerError.body as { error: { code: string } }).error.code === 'PROVIDER_ERROR',
    'Provider scenario did not return PROVIDER_ERROR',
  );
  console.log('✅ Validation, upload errors, and provider errors follow C3\n');

  console.log(
    EXPECT_LIVE_AI
      ? '🎉 All tests passed (live OCR + STT + LLM + contract checks)!\n'
      : EXPECT_LIVE_OCR
        ? '🎉 All tests passed (live OCR + contract checks)!\n'
        : '🎉 All tests passed (mock mode)!\n',
  );
}

main().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exitCode = 1;
});
