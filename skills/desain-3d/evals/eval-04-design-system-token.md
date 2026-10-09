## Task

Rancang struktur token design system untuk aplikasi dashboard internal: definisikan primitive warna primer (10 stop, nilai HEX) dan 5 alias semantik utama (bg, teks primer/sekunder, action primer, status). Sertakan aturan verifikasi palet.

## Verifier

Output dinyatakan LOLOS bila memuat SEMUA kriteria berikut:

- [ ] **Primitive dengan nilai HEX**: skala numerik (mis. primer 50–900) dan setiap token punya nilai HEX — tidak ada placeholder tanpa nilai.
- [ ] **Alias semantik menunjuk ke primitive**: komponen hanya boleh memakai alias, tidak menunjuk primitive langsung.
- [ ] **Verifikasi kontras wajib**: setiap pasangan teks-background dari alias diuji dengan aturan 4.5:1 (body) / 3:1 (teks besar & komponen interaktif); pasangan gagal = revisi stop warnanya.
- [ ] **Aturan jangan-hanya-warna**: status selalu dipasangkan ikon/teks, bukan warna saja.
- [ ] **Versioning disebut**: semantic versioning (major/minor/patch) untuk perubahan token/komponen.

Output dinyatakan GAGAL bila token warna tanpa nilai HEX atau tidak ada aturan uji kontras.

## Baseline

Output tanpa skill: "Warna utama biru, background putih, teks hitam, tombol biru." — tidak ada token, tidak ada HEX, tidak ada uji kontras, tidak ada versioning.
