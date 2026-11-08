# Cara Tambah Background Image di Hero

## Option 1: Pakai Foto Real (Recommended)

1. **Siapkan foto** - Foto team/workspace/orang pakai app
   - Size: 1920x1080px atau lebih
   - Format: JPG/PNG
   - Compress dulu pakai TinyPNG

2. **Taruh di folder:**
   ```
   apps/landing/public/images/hero-bg.jpg
   ```

3. **Uncomment baris 23-29** di `Hero.tsx`:
   ```tsx
   <div 
     className="absolute inset-0 opacity-10"
     style={{
       backgroundImage: 'url(/images/hero-bg.jpg)',
       backgroundSize: 'cover',
       backgroundPosition: 'center',
     }}
   />
   ```

4. **Adjust opacity** sesuai kebutuhan (0.1 = 10%, 0.2 = 20%, dll)

## Option 2: Pakai Pattern/Illustration

Download free patterns dari:
- **Unsplash** - https://unsplash.com/backgrounds
- **Pexels** - https://pexels.com
- **Hero Patterns** - https://heropatterns.com
- **Cool Backgrounds** - https://coolbackgrounds.io

Keywords: "workspace", "office", "technology", "abstract gradient"

## Option 3: Screenshot App Sendiri

1. Screenshot Voltra app (dashboard full page)
2. Blur di Photoshop/Figma
3. Save sebagai hero-bg.jpg
4. Pakai dengan opacity rendah (0.05-0.1)

## Current Design

Sekarang pakai:
- ✅ Gradient mesh (blue-green)
- ✅ Decorative blurred circles (lebih visible)
- ✅ Grid + dot pattern overlay
- ✅ Siap diganti dengan foto real

---

**Mau pakai foto apa?** Kasih tau konsepnya atau kirim file-nya!
