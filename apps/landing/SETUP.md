# 🚀 Setup Landing Page - Langkah Terakhir

Landing page sudah 95% jadi! Tinggal tambahkan gambar Terra & logo.

## ✅ Yang Sudah Selesai

- 15 sections lengkap (Hero → Footer)
- i18n Indonesia + English
- Build sukses (34 files)
- Dev server running di http://localhost:3002

## 📋 Yang Perlu Anda Lakukan

### 1. Tambahkan Gambar Terra (6 ekspresi)

Copy file PNG Terra ke folder ini:
```
packages/assets/public/mascot/
```

Nama file harus persis seperti ini:
- `terra-biasa.png` - Ekspresi normal
- `terra-cemas.png` - Ekspresi khawatir
- `terra-hallo.png` - Melambaikan tangan ← Anda sudah kirim ini!
- `terra-hore.png` - Senang/celebrate
- `terra-mikir.png` - Berpikir
- `terra-tidur.png` - Tidur/relax

**Tips:** Gambar kedua yang Anda kirim (Terra melambaikan) → save sebagai `terra-hallo.png`

### 2. Tambahkan Logo Voltess

Copy logo ke:
```
packages/assets/public/logo/
```

Nama file:
- `voltess-logo.png` - Logo icon saja
- `voltess-wordmark.png` - Logo + text "Voltess"

**Kalau belum punya:** Pakai placeholder dulu, ganti nanti.

### 3. Copy Assets ke Landing

Setelah file ada di packages/assets/, copy juga ke landing:
```bash
# Di terminal
cp -r packages/assets/public/* apps/landing/public/assets/
```

### 4. Test

```bash
# Refresh browser
http://localhost:3002
```

Seharusnya Terra muncul di Hero dan sections lain!

## 🎯 Shortcut Kalau Mau Cepat

Kalau gambar belum ada, landing page tetap bisa jalan (gambar broken aja). Nanti tinggal isi folder `packages/assets/public/` kapan-kapan.

## 📝 Catatan

- Form "Gabung Daftar Tunggu" sekarang cuma mock (tidak kirim data)
- Nanti kalau mau aktif, perlu backend endpoint atau pakai Google Forms
- Konten i18n (teks ID/EN) bisa diubah di `apps/landing/src/i18n/locales/`

---

**Pertanyaan?** Tanya aja! 🙂
