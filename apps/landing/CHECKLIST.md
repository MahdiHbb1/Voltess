# Landing Page Setup Checklist

## ✅ Sudah Selesai

- [x] Setup Next.js 16 + TypeScript + Tailwind CSS
- [x] Struktur 17 sections lengkap:
  1. Navbar (sticky, blur, mobile menu)
  2. Hero (tagline, CTA, trust signals, phone mockup)
  3. Problem Strip (3 pain points dari wawancara)
  4. Problems (4 kartu masalah → solusi)
  5. How It Works (4 langkah dengan timeline)
  6. Kios Virtual (ilustrasi SVG, fitur game)
  7. AI Engine (diagram alur, 4 prinsip kejujuran)
  8. Features Plus (5 fitur dengan ikon)
  9. Target Users (6 jenis usaha, 2 segera)
  10. Pricing (3 tier dengan disclaimer)
  11. Privacy (5 poin privasi UU PDP)
  12. Roadmap (4 fase dengan status)
  13. FAQ (9 pertanyaan accordion)
  14. CTA Waitlist (form dengan validasi)
  15. Footer (logo, links, kontak)
- [x] Design tokens (warna brand #1A2945, tipografi Plus Jakarta Sans)
- [x] Komponen reusable (Button, Card, Chip, Badge, Section)
- [x] Phone mockup CSS (3 screen: Beranda, Catat, Biaya)
- [x] Mascot component dengan 6 ekspresi (placeholder SVG)
- [x] Kios illustration SVG inline
- [x] Responsif 360px-1440px+
- [x] Aksesibilitas (semantic HTML, ARIA, keyboard nav, kontras WCAG AA)
- [x] SEO metadata (title, description, OG tags)
- [x] Smooth scroll, animasi, prefers-reduced-motion
- [x] Static export config untuk Vercel/Netlify
- [x] Konten terpisah dari UI (content/*.ts)
- [x] README lengkap dengan dokumentasi

## ⚠️ TODO: Ganti Placeholder

### 1. Aset Visual (HIGH PRIORITY)

**Maskot Terra (6 file PNG):**
- [ ] Copy `terra-biasa.png` ke `packages/assets/mascot/`
- [ ] Copy `terra-cemas.png` ke `packages/assets/mascot/`
- [ ] Copy `terra-hallo.png` ke `packages/assets/mascot/`
- [ ] Copy `terra-hore.png` ke `packages/assets/mascot/`
- [ ] Copy `terra-mikir.png` ke `packages/assets/mascot/`
- [ ] Copy `terra-tidur.png` ke `packages/assets/mascot/`

**Logo Voltess:**
- [ ] Copy `voltess-logo.png` ke `packages/assets/logo/`
- [ ] Copy `voltess-wordmark.png` ke `packages/assets/logo/`

### 2. Konten (MEDIUM PRIORITY)

Edit file: `apps/landing/src/content/placeholders.ts`

- [ ] Nama anggota tim (4 orang)
- [ ] Peran anggota tim
- [ ] Email kontak
- [ ] Nomor WhatsApp
- [ ] Handle Instagram
- [ ] Handle LinkedIn
- [ ] URL aplikasi

### 3. Backend Integration (BEFORE LAUNCH)

- [ ] Sambungkan form daftar tunggu ke backend/Google Sheets/Typeform
  - File: `apps/landing/src/components/sections/CTAWaitlist.tsx`
  - Line: ~40 (cari `// TODO: sambungkan ke backend`)

### 4. SEO & Branding (BEFORE LAUNCH)

- [ ] Buat Open Graph image (1200×630px)
  - Save as: `apps/landing/public/og-image.png`
  - Update metadata di `apps/landing/src/app/layout.tsx`
- [ ] Buat favicon proper (32×32px, 192×192px)
  - Ganti `apps/landing/public/favicon.svg`
- [ ] Buat kebijakan privasi (HTML page atau PDF)
  - Update link di Footer.tsx dan placeholders.ts

## 🧪 Testing Checklist

- [ ] Desktop Chrome (1440px)
- [ ] Mobile Chrome (360px)
- [ ] Tablet (768px)
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Screen reader (NVDA/JAWS sampel check)
- [ ] Form validasi:
  - [ ] Nama usaha kosong
  - [ ] Jenis usaha tidak dipilih
  - [ ] WhatsApp format salah
  - [ ] WhatsApp format benar (08xxx, +62xxx)
- [ ] Smooth scroll ke semua anchor
- [ ] Mobile menu buka/tutup
- [ ] FAQ accordion buka/tutup
- [ ] Animasi (float, fade-in, slide-up)
- [ ] Prefers-reduced-motion (disable animasi)

## 🚀 Deployment

### Vercel (Recommended)
```bash
cd apps/landing
vercel --prod
```

### Netlify
- Build command: `pnpm --filter landing build`
- Publish directory: `apps/landing/out`

### Custom Static Host
```bash
pnpm --filter landing build
# Upload folder: apps/landing/out
```

## 📊 Performance Target

Run Lighthouse audit sebelum deploy:
- [ ] Performance ≥90
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90

## 🎯 Launch Checklist

- [ ] Semua placeholder diganti
- [ ] Form daftar tunggu terhubung ke backend
- [ ] Lighthouse score ≥90 semua kategori
- [ ] Test di 3+ device fisik
- [ ] Kebijakan privasi tersedia
- [ ] Analytics/tracking setup (opsional)
- [ ] Domain custom disetup
- [ ] SSL certificate aktif

## 📝 Notes

**Nama produk:** VOLTESS (bukan Voltra)  
**Maskot:** TERRA (bukan Wati)  
**Domain landing:** voltess-comp (Vercel/Netlify subdomain)  
**Domain app:** voltess  
**Port dev:** 3002  
**Branch:** feat/landing-setup  

**Prinsip kejujuran (WAJIB):**
- ❌ Tidak boleh ada statistik palsu
- ❌ Tidak boleh ada testimoni/rating palsu
- ❌ Tidak boleh klaim "real-time" atau "24 jam"
- ❌ Tidak boleh logo klien/mitra palsu
- ✅ Semua mockup berlabel "Contoh"
- ✅ Harga berlabel "perkiraan"
- ✅ Fitur belum ada berlabel "Rencana" atau "Segera"

---

**Created:** 2026-11-07  
**Status:** Ready for asset replacement  
**Next step:** Copy aset Terra PNG dan logo Voltess PNG, lalu run `pnpm --filter landing dev`
