# @voltess/assets

Shared assets untuk semua apps Voltess.

## Struktur

```
public/
  logo/
    voltess-logo.png          # Logo icon
    voltess-wordmark.png      # Logo + text
  mascot/
    terra-biasa.png           # Ekspresi normal
    terra-cemas.png           # Ekspresi khawatir
    terra-hallo.png           # Melambaikan tangan
    terra-hore.png            # Senang/celebrate
    terra-mikir.png           # Berpikir
    terra-tidur.png           # Tidur/relax
```

## Usage

```tsx
import { MASCOT_PATHS, LOGO_PATHS } from '@voltess/assets';

<Image src={MASCOT_PATHS.hallo} alt="Terra" />
<Image src={LOGO_PATHS.logo} alt="Voltess" />
```

## TODO

- [ ] Tambahkan file gambar Terra dari Figma/design
- [ ] Tambahkan logo Voltess final
- [ ] Optimize images (compress PNG)
