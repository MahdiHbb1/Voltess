# Voltess Landing Page

Company profile landing page untuk Voltess - AI energy copilot untuk UMKM Indonesia.

Built with Next.js 16 + TypeScript + Tailwind CSS.

Lihat [`apps/landing/README.md`](apps/landing/README.md) untuk dokumentasi lengkap.

## Development

```bash
pnpm --filter landing dev
```

## Struktur

- `apps/landing/` - Landing page (Next.js, port 3002)
- `apps/web/` - Main PWA app (Next.js, port 3000)
- `apps/api/` - Backend API (NestJS, port 3001)
- `packages/assets/` - Shared assets (logo, maskot Terra)
- `packages/contracts/` - API contracts
- `packages/energy-calc/` - Energy calculation engine

## TODO Sebelum Deploy

1. **Ganti aset placeholder:**
   - Copy 6 file PNG maskot Terra ke `packages/assets/mascot/`
   - Copy logo Voltess ke `packages/assets/logo/`
   - Lihat `packages/assets/README.md`

2. **Isi placeholder konten:**
   - Nama & peran tim
   - Kontak (email, WhatsApp, social media)
   - Link kebijakan privasi
   - Lihat `apps/landing/src/content/placeholders.ts`

3. **Integrasikan form daftar tunggu:**
   - Backend endpoint atau Google Sheets/Typeform
   - Edit `apps/landing/src/components/sections/CTAWaitlist.tsx`

4. **Add favicon & OG image:**
   - `apps/landing/public/favicon.ico`
   - `apps/landing/public/og-image.png` (1200×630px)
