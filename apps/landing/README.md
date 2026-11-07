# Voltess Landing Page

Landing page company profile untuk **Voltess** — AI energy copilot untuk UMKM Indonesia.

## 🚀 Quick Start

```bash
# Install dependencies (dari root monorepo)
pnpm install

# Development
pnpm --filter landing dev

# Build
pnpm --filter landing build

# Preview production build
pnpm --filter landing start
```

Landing page akan berjalan di **http://localhost:3002**

## 📁 Struktur Folder

```
apps/landing/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── page.tsx            # Landing page utama
│   │   └── globals.css         # Global styles + design tokens
│   ├── components/
│   │   ├── sections/           # 17 sections landing page
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProblemStrip.tsx
│   │   │   ├── Problems.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── KiosVirtual.tsx
│   │   │   ├── AIEngine.tsx
│   │   │   ├── FeaturesPlus.tsx
│   │   │   ├── TargetUsers.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Privacy.tsx
│   │   │   ├── Roadmap.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTAWaitlist.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                 # Komponen UI dasar
│   │   │   └── index.tsx       # Button, Card, Chip, Badge, Section
│   │   ├── Mascot.tsx          # Komponen maskot Terra
│   │   └── PhoneMockup.tsx     # Mockup phone dengan UI app
│   └── content/
│       ├── landing.ts          # Konten teks semua sections
│       └── placeholders.ts     # Placeholder yang perlu diisi
├── tailwind.config.ts          # Tailwind + design tokens
├── next.config.ts              # Next.js config (static export)
└── package.json
```

## 🎨 Cara Mengganti Konten

### 1. Teks dan Copy

Semua teks landing page ada di **`src/content/landing.ts`**. Edit file ini untuk mengubah:
- Tagline dan headline
- Deskripsi fitur
- FAQ
- Harga
- Roadmap
- dll

```typescript
// Contoh:
export const HERO = {
  title: 'Ke mana uang listrik usaha Anda pergi?',
  subtitle: '...',
  // ...
};
```

### 2. Placeholder yang Perlu Diisi

File **`src/content/placeholders.ts`** berisi data yang masih placeholder:
- Nama dan peran anggota tim
- Email, WhatsApp, social media
- Link kebijakan privasi
- URL app/demo

Cari semua placeholder dengan:
```bash
grep -r "data-placeholder" apps/landing/
```

### 3. Maskot Terra

**PENTING:** Maskot saat ini adalah placeholder SVG sederhana.

**Cara mengganti dengan aset asli:**

1. Siapkan 6 file PNG dengan nama:
   - `terra-biasa.png`
   - `terra-cemas.png`
   - `terra-hallo.png`
   - `terra-hore.png`
   - `terra-mikir.png`
   - `terra-tidur.png`

2. Copy ke folder: **`packages/assets/mascot/`**

3. Tidak perlu ubah kode — otomatis terpakai!

Detail mapping ekspresi:
- **Hero:** terra-hallo (menyapa)
- **Problem:** terra-cemas (khawatir)
- **How It Works:** terra-hallo (semangat)
- **AI Engine:** terra-mikir (berpikir)
- **Features/Results:** terra-hore (gembira)
- **Privacy:** terra-tidur (tenang)
- **FAQ:** terra-biasa (default)
- **CTA:** terra-hallo (mengundang)

Lihat: `packages/assets/README.md` untuk detail lengkap.

### 4. Logo Voltess

Copy logo Voltess (PNG) ke:
- **`packages/assets/logo/voltess-logo.png`** (logo + icon)
- **`packages/assets/logo/voltess-wordmark.png`** (teks brand)

Ukuran disarankan:
- Logo: 200×200px (square, background transparan)
- Wordmark: tinggi 60-80px

## 🎯 Design Tokens

Warna brand didefinisikan di `src/app/globals.css`:

```css
:root {
  --color-brand-dark: #1A2945;    /* Biru gelap utama */
  --color-brand-blue: #2563EB;    /* Biru terang */
  --color-brand-green: #10B981;   /* Hijau hemat */
  --color-brand-sky: #38BDF8;     /* Biru langit */
  --color-brand-amber: #F59E0B;   /* Kuning peringatan */
}
```

Tailwind config ada di `tailwind.config.ts` dengan alias:
```tsx
<div className="bg-brand-dark text-white">
```

## 📱 Responsif

Landing page dioptimalkan untuk:
- **360px** (mobile kecil)
- **768px** (tablet)
- **1024px** (desktop kecil)
- **1440px+** (desktop besar)

Test responsif:
```bash
# Chrome DevTools atau resize browser
```

## ♿ Aksesibilitas

- Semantic HTML (`<section>`, `<nav>`, `<main>`, `<footer>`)
- ARIA labels dan roles
- Focus visible untuk keyboard navigation
- Kontras warna WCAG AA
- `prefers-reduced-motion` support
- Alt text untuk semua gambar

## 🚢 Deployment

### Static Export (Vercel/Netlify)

Landing page sudah dikonfigurasi untuk static export (`output: 'export'` di `next.config.ts`).

**Deploy ke Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy dari root monorepo
cd apps/landing
vercel --prod
```

**Deploy ke Netlify:**
```bash
# Build command:
pnpm --filter landing build

# Publish directory:
apps/landing/out
```

### Environment Variables

Tidak ada environment variables untuk landing page (static site).

Form daftar tunggu belum terhubung ke backend — lihat TODO di `CTAWaitlist.tsx`.

## ✅ Checklist Sebelum Launch

- [ ] Ganti maskot placeholder dengan aset Terra asli (6 ekspresi PNG)
- [ ] Ganti logo placeholder dengan logo Voltess asli
- [ ] Isi semua placeholder di `src/content/placeholders.ts`
  - [ ] Nama & peran tim
  - [ ] Email & WhatsApp kontak
  - [ ] Link social media
  - [ ] Link kebijakan privasi
- [ ] Screenshot UI apps/web untuk PhoneMockup (opsional, mockup CSS sudah bagus)
- [ ] Test responsif di 360px, 768px, 1024px
- [ ] Test navigasi keyboard (Tab, Enter)
- [ ] Test form validasi (nama kosong, WhatsApp invalid)
- [ ] Sambungkan form daftar tunggu ke backend/Google Sheets/Typeform
- [ ] Add favicon (`public/favicon.ico`)
- [ ] Add Open Graph image (`public/og-image.png`, 1200×630px)
- [ ] Update metadata di `src/app/layout.tsx`
- [ ] Run Lighthouse audit (target: ≥90 semua kategori)

## 🐛 Troubleshooting

**Maskot tidak muncul:**
- Cek path di `packages/assets/index.ts` cocok dengan nama file
- Pastikan file PNG/SVG ada di `packages/assets/mascot/`

**Styling tidak muncul:**
- Pastikan Tailwind content paths benar di `tailwind.config.ts`
- Clear `.next` cache: `rm -rf apps/landing/.next`

**Build error:**
- Run `pnpm install` dari root monorepo
- Cek TypeScript errors: `pnpm --filter landing typecheck`

## 📝 TODO Backend Integration

File yang perlu diubah saat menambahkan backend:

1. **`CTAWaitlist.tsx`** (line ~40):
   ```typescript
   // TODO: sambungkan ke backend
   const response = await fetch('/api/waitlist', {
     method: 'POST',
     body: JSON.stringify(formData),
   });
   ```

2. **Update `next.config.ts`**:
   ```typescript
   // Hapus jika perlu server-side
   // output: 'export',
   ```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🙋 Support

Pertanyaan? Hubungi tim development atau buka issue di GitHub repo.

---

**Dibuat oleh Tim d1306, Universitas Negeri Semarang**
