# @voltess/assets

Paket aset bersama untuk Voltess: logo, maskot Terra, dan aset visual lainnya.

## Struktur

```
packages/assets/
├── mascot/           # Maskot Terra (6 ekspresi, format PNG)
│   ├── terra-biasa.png
│   ├── terra-cemas.png
│   ├── terra-hallo.png
│   ├── terra-hore.png
│   ├── terra-mikir.png
│   └── terra-tidur.png
├── logo/             # Logo Voltess
│   ├── voltess-logo.png
│   └── voltess-wordmark.png
└── index.ts          # Export paths untuk TypeScript
```

## Cara Pakai

```typescript
import { MASCOT_PATHS, LOGO_PATHS } from '@voltess/assets';

// Di Next.js apps/landing atau apps/web:
<Image src={MASCOT_PATHS.hallo} alt="Terra menyapa" />
<Image src={LOGO_PATHS.logo} alt="Logo Voltess" />
```

## TODO: Ganti Placeholder

**PENTING:** File maskot dan logo saat ini adalah **PLACEHOLDER**.

### Cara mengganti maskot Terra:

1. Siapkan 6 file PNG dengan nama persis:
   - `terra-biasa.png` — Ekspresi netral/default
   - `terra-cemas.png` — Khawatir melihat tagihan
   - `terra-hallo.png` — Menyapa/melambai
   - `terra-hore.png` — Gembira/bintang-bintang
   - `terra-mikir.png` — Berpikir/memegang kaca pembesar
   - `terra-tidur.png` — Tidur/tenang

2. Copy ke `packages/assets/mascot/`

3. Ukuran disarankan: lebar 400-600px, tinggi proporsional, background transparan

### Cara mengganti logo:

1. Copy `voltess-logo.png` (logo + icon) dan `voltess-wordmark.png` (teks brand) ke `packages/assets/logo/`

2. Ukuran disarankan:
   - Logo: 200x200px atau lebih (square/transparan)
   - Wordmark: tinggi 60-80px, lebar proporsional

### Tidak perlu mengubah kode

Setelah file diganti, semua referensi di `apps/landing` dan `apps/web` otomatis menggunakan aset baru.
