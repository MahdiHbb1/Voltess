# Live AI E2E status

Dokumen ini memisahkan dua jenis bukti yang sering tercampur:

1. **Contract E2E (mode mock)** — `pnpm --filter @voltess/api test:e2e`.
   Menguji HTTP server nyata, validasi JSON Schema C2/C3, propagasi
   `x-request-id`, dan error path. **Bukan** bukti akurasi OCR live.
2. **Live OCR E2E (mode hybrid)** — `E2E_EXPECT_LIVE_OCR=1` +
   `pnpm --filter @voltess/api test:e2e`. Mengirim file dataset nyata ke
   Gemini lewat HTTP API, lalu membandingkan hasilnya dengan ground truth
   yang diverifikasi manual.

## Status provider (2026-11-07)

| Provider | Dipakai untuk | Status | Bukti |
|---|---|---|---|
| Google Cloud Vision | OCR | **BLOCKED** | `403 PERMISSION_DENIED`, `BILLING_DISABLED`, project `#947141807269` |
| Gemini (`generativelanguage.googleapis.com`) | OCR live | **LIVE OK** | Auth key `AQ.Ab8...`; `ListModels` HTTP 200; model `gemini-3.5-flash-lite` |
| Groq | LLM | **LIVE OK** | `openai/gpt-oss-20b` menjawab pertanyaan bahasa Indonesia |
| AssemblyAI | STT | **LIVE OK** | audio `id-ID` → `"AC nyala 8 jam hari ini."`, confidence `0.828` |

Error Vision berasal dari adapter yang benar-benar dipakai repo
(`backend/services/ai/adapters/vision-groq.js`), bukan hanya percobaan REST:

```
7 PERMISSION_DENIED: This API method requires billing to be enabled.
Please enable billing on project #947141807269 ...
```

Key standar (Cloud Vision) tidak bisa digabung dengan Gemini. Solusinya adalah
**auth key terpisah** dari AI Studio / service account, yang sekarang tersedia
sebagai `GEMINI_API_KEY` di `backend/.env` (tidak di-commit).

## Hasil E2E live terakhir

Perintah:

```powershell
# terminal 1 — API dengan OCR live
$env:AI_MODE='hybrid'
$env:GEMINI_API_KEY='<auth key>'
pnpm --filter @voltess/api dev

# terminal 2 — E2E live
$env:E2E_EXPECT_LIVE_OCR='1'
pnpm --filter @voltess/api test:e2e
```

Hasil:

```
🧪 E2E Workflow Test (LIVE OCR mode, contract-validated)

1️⃣ Health check... ✅
2️⃣ P1: OCR Label (live, synthetic fixture)
   ✅ AC SPLIT 1 PK (900 W), confidence high
3️⃣ P2: OCR Meter (live, ground truth)
   ✅ images(64).jpg: expected 45844, got 45844 (high)
   ✅ meteran-listrik-dery-ridwansah-2-2.jpg: expected 5969, got 5969 (high)
   ✅ Meter accuracy: 2/2 (100.0%) on verified ground truth
4️⃣ P3: OCR Token (live, synthetic fixture)
   ✅ 68.9 kWh / Rp 100.000, remaining 12.4 kWh
5️⃣ P6: Estimate v0 + cross-validation... ✅
6️⃣ Cross-validation consistency... ✅
7️⃣ Error handling... ✅

🎉 All tests passed (live OCR + contract checks)!
```

Mode mock tetap lulus 7/7 (`pnpm --filter @voltess/api test:e2e` terhadap
server `AI_MODE=mock`).

## Ground truth OCR

`tests/datasets/d-ocr/metadata.json` sekarang berisi 4 gambar berlabel:

| Gambar | Ground truth | Status |
|---|---|---|
| `images(64).jpg` | `45844` | **verified** — display jelas |
| `meteran-listrik-dery-ridwansah-2-2.jpg` | `5969` | **verified** — display jelas |
| `images(65).jpeg` | tidak dipastikan | **ambiguous** — titik desimal `203.7` vs `20.37` tidak dapat dipastikan dari foto |
| `images(66).jpg` | tidak dipastikan | **ambiguous** — glare + rotasi |

Akurasi **2/2 (100%)** hanya berlaku untuk subset 2 gambar yang ground
truth-nya terverifikasi. Ini **bukan** klaim akurasi umum untuk 63 gambar
dataset. Dua gambar ambigu sengaja dikecualikan, bukan dipaksa cocok dengan
prediksi model.

`images(65).jpeg` tetap dipanggil di E2E sebagai informasi (tidak dinilai).
Pada run terakhir adapter membaca `20.37` dengan confidence `high`; posisi
titik desimal pada foto memang tidak dapat dipastikan, sehingga hasil ini tidak
dihitung benar maupun salah.

## Fixture sintetis

`tests/datasets/d-ocr/fixtures/` berisi dua gambar sintetis untuk menguji
pipeline label dan token:

- `synthetic-label-ac-pk.png` → nama mengandung `AC SPLIT 1 PK`, daya `900 W`.
- `synthetic-token-pln.png` → tanggal `2026-11-07`, nominal `Rp 100.000`,
  `68.9 kWh`, sisa `12.4 kWh`.

Keduanya dibuat khusus untuk tes, bukan data pilot, dan diberi label
"synthetic fixture" di dalam gambar.

## Keterbatasan yang masih terbuka

- **Billing Vision** masih mati; OCR production memakai Gemini.
- **Dataset STT kosong** (`tests/datasets/d-stt/audio/` hanya `.gitkeep`).
  Bukti STT live memakai voice note sintetis `edge-tts` (`id-ID`), bukan sampel
  pilot.
- **Pipeline non-OCR di API masih mock** saat `AI_MODE=hybrid` (STT, estimate,
  recommend, explain, ask). Groq dan AssemblyAI sudah diverifikasi live secara
  terpisah, tetapi belum disambungkan ke controller.
- **`AI_MODE=live`** menolak pipeline non-OCR dengan `PROVIDER_ERROR` agar
  tidak diam-diam mengembalikan data contoh. Gunakan `hybrid` untuk OCR live.

## Cara mengaktifkan Vision (opsional)

Aktifkan billing pada project `947141807269`, lalu jalankan ulang adapter
Vision. Gemini free tier tidak memerlukan billing.
