# Cara Tambahkan Screenshot Dashboard

## 1. Save Screenshot Voltra

Dari gambar yang Anda kirim, save sebagai:
```
apps/landing/public/screenshots/dashboard-home.png
```

## 2. Update PhoneMockup.tsx

Uncomment baris di `apps/landing/src/components/PhoneMockup.tsx`:

```tsx
// Hapus placeholder div, uncomment ini:
<Image 
  src="/screenshots/dashboard-home.png" 
  alt="Voltra Dashboard"
  fill
  className="object-cover"
/>
```

## 3. Refresh Browser

Screenshot akan muncul di dalam phone frame!

---

**Untuk sekarang:** Phone mockup pakai placeholder icon dulu.
**Nanti:** Ganti dengan screenshot asli setelah file ada.
