# Design System — Panduan Lengkap

Dipindah dari SKILL.md agar ringkas. Buka file ini saat membangun atau memelihara design system.

## Lapis 1 — Primitive (nilai mentah, WAJIB ada nilai HEX di setiap token)

- Warna: `color.primary.500` `#2563EB` — pakai skala numerik 50–900, dan `500` adalah warna base/acuan. Minimal: 1 primer (10 stop), 1 netral (10 stop), status: success/warning/danger/info (masing-masing 100/500/700).
- Spacing: `space.1` = 4px, `space.2` = 8px, dst (kelipatan 4).
- Tipografi: `font.heading.lg` (family + size + weight + line-height).
- Radius, shadow, border width dengan nama semantik (`radius.md`, `shadow.lg`).

## Lapis 2 — Semantic alias (yang dipakai komponen; inilah "API" design system)

| Alias | Menunjuk ke | Contoh pakai |
|---|---|---|
| `color.bg.page` / `color.bg.surface` | `neutral.50` / `#FFFFFF` | background halaman / kartu |
| `color.text.primary` / `.secondary` / `.muted` | `neutral.900` / `600` / `400` | hierarki teks |
| `color.text.inverse` | `#FFFFFF` | teks di atas warna gelap |
| `color.border.default` / `.strong` | `neutral.200` / `300` | garis pembatas |
| `color.action.primary.default` / `.hover` / `.active` | `primary.600` / `700` / `800` | tombol primer |
| `color.action.on-primary` | `#FFFFFF` | teks di atas tombol primer |
| `color.status.success/warning/danger/info` | `*.500` masing-masing | badge, alert, dot status |
| `color.focus.ring` | `primary.300` | outline fokus keyboard |

Aturan: komponen HANYA boleh memakai alias, tidak boleh menunjuk primitive langsung. Ganti brand = ganti mapping alias, bukan ubah 20 komponen.

## Verifikasi palet (wajib sebelum lanjut)

Uji setiap pasangan teks-background dari tabel alias dengan aturan kontras: **4.5:1** untuk body text, **3:1** untuk teks besar (≥18px atau ≥14px bold) dan komponen interaktif. Pasangan yang gagal = ganti stop warnanya (mis. `text.secondary` dari `neutral.500` naik ke `neutral.600`), bukan "nanti saja".

## Kriteria pemilihan font UI (jangan asal pilih yang "bagus")

1. Mendukung Latin Extended (karakter Bahasa Indonesia) — cek di Google Fonts/specimen.
2. Punya angka tabular (`font-feature-settings: "tnum"`) untuk tabel data (NIP, gaji, tanggal) agar kolom rata kanan.
3. Minimal tersedia weight 400/500/600/700.
4. Fallback stack sistem selalu dicatat: `system-ui, -apple-system, "Segoe UI", sans-serif`.
5. Maksimal 2 keluarga (1 teks, 1 opsional monospace untuk data/kode).

## Skala tipografi — pakai rasio modular

- Base body 14px (dashboard desktop) atau 16px (publik/mobile); rasio 1.125 (rapat) atau 1.25 (lega).
- Contoh (base 14, rasio 1.25): caption 11 → body-sm 12 → body 14 → h4 18 → h3 20 → h2 24 → h1 28 → display 32.
- Line-height: body 1.5–1.6, heading 1.2–1.3. Catat sebagai token: `font.body.md` = Inter 14/22 (1.57), 400.

## Spec card komponen (format baku — setiap komponen WAJIB punya ini)

1. **Nama + deskripsi 1 kalimat** + kapan dipakai / kapan TIDAK dipakai.
2. **Anatomi ukuran**: tinggi, padding, radius, tipografi — ditulis sebagai TOKEN (`space.4`, `radius.md`), bukan angka mentah.
3. **Variants & states**: daftar varian; state wajib = default, hover, active, focus-visible, disabled (+ loading dan error bila relevan).
4. **Perilaku**: apa yang terjadi saat hover/klik/loading/error/empty.
5. **Aksesibilitas**: bisa dioperasikan keyboard (urutan tab logis), peran ARIA bila bukan elemen native, `focus-visible` selalu terlihat (ring 2px `color.focus.ring`, offset 2px).
6. **Do / Don't**: 1 contoh benar + 1 contoh salah bergambar.

## Komponen data-dense (wajib untuk dashboard/admin seperti HR)

Table (tinggi baris 44/56 untuk density normal/nyaman, header 12/600, sort/filter ikon, sticky header, pagination, empty state), Search + Filter bar, Pagination, Badge status (selalu ikon+teks, bukan warna saja), Empty state, Skeleton loading.

## Struktur file Figma khusus design system (terpisah dari file mockup)

- Pages: `01 - Cover & Changelog`, `02 - Tokens` (primitive + alias, tampilkan HEX), `03 - Foundations` (tipografi, spacing, radius, shadow, ikonografi), `04 - Components` (satu section per komponen berisi spec card + variants + do/don't), `05 - Patterns` (contoh rakitan: form, tabel + filter, kartu stat), `99 - Archive`.

## Handoff token ke developer — serahkan SELALU dalam dua bentuk

1. **CSS variables** (sumber kebenaran untuk web):

```css
:root {
  --color-action-primary-default: #1D4ED8;
  --color-action-primary-hover: #1E40AF;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-border-default: #E2E8F0;
  --space-4: 16px;
  --radius-md: 8px;
  --font-body-md: 400 14px/22px "Inter", system-ui, sans-serif;
}
```

2. **JSON tokens** (untuk Tailwind config / style dictionary / mobile): struktur `{ "color": { "action": { "primary": { "default": { "value": "#1D4ED8" } } } } }`.

## Versioning

Semantic versioning (major.minor.patch):
- Patch: perbaikan visual kecil tanpa mengubah API/props.
- Minor: komponen baru atau variant baru, backward compatible.
- Major: perubahan breaking (rename token, hapus komponen).
- Catat changelog setiap rilis: apa berubah, kenapa, dan panduan migrasi bila breaking.
