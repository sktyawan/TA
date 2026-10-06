---
name: desain-3d
description: Merancang dan merender visual 3D, mendesain UI/UX, membuat identitas brand, serta membangun design system — dipakai saat ada permintaan desain visual, render produk 3D, mockup antarmuka, atau kebutuhan aset grafis.
---

# desain-3d

Skill ini memberi Fitri kemampuan penuh mengerjakan semua pekerjaan desain 3D dan grafis: render produk 3D, desain UI/UX, identitas brand, dan design system — dari brief sampai deliverable siap pakai.

## 1. Apa yang Dilakukan Skill Ini

- **3D visualization & product rendering**: Mengerjakan alur modeling → material → lighting → render untuk visualisasi produk, scene arsitektural sederhana, dan mockup 3D. Menghasilkan render fotorealistik atau stylized sesuai brief, lengkap dengan sudut kamera, pencahayaan, dan komposisi yang direncanakan.
- **UI/UX design**: Mengerjakan alur wireframe → hi-fi mockup dengan struktur file Figma/XD yang rapi (pages, components, variants, auto-layout), siap handoff ke developer.
- **Graphic design & brand identity**: Membuat dan menjaga identitas brand — logo, palet warna, tipografi, elemen grafis — dengan aturan konsistensi, serta menyiapkan deliverable dalam format yang benar untuk cetak maupun digital.
- **Design system creation**: Membangun design system terstruktur berisi design tokens, komponen reusable, dokumentasi penggunaan, naming convention, dan versioning.
- **Review & QA kualitas visual**: Mengecek hasil render/desain terhadap kriteria kualitas sebelum diserahkan — komposisi, keterbacaan, konsistensi, dan spesifikasi teknis (resolusi, format, color space).

## 2. Kapan Dipakai

Pakai skill ini setiap kali menerima salah satu pemicu berikut:

- Permintaan render produk 3D, mockup 3D, atau visualisasi objek/scene ("tolong render", "buat visualisasi 3D", "mockup produk").
- Permintaan desain tampilan aplikasi atau website ("desain halaman login", "buat UI dashboard", "redesign landing page").
- Permintaan pembuatan atau perbaikan identitas brand ("bikin logo", "tentukan warna brand", "brand guideline").
- Permintaan design system atau komponen UI yang bisa dipakai ulang ("bikin design system", "standardisasi komponen").
- Permintaan aset grafis: banner, poster, thumbnail, kartu nama, brosur, feed media sosial.
- Permintaan review kualitas visual dari hasil desain/render yang sudah ada.
- Permintaan format ulang aset untuk kebutuhan berbeda (cetak vs digital, ukuran media sosial).

Jangan dipakai untuk: menulis konten/copywriting (itu pekerjaan agent lain), coding implementasi frontend, atau editing video.

## 3. Playbook Inti

### 3.1. Terima dan Klarifikasi Brief

Sebelum mengerjakan apa pun, pastikan brief mencakup poin-poin ini. Kalau ada yang hilang, TANYA dulu, jangan menebak:

1. **Tujuan**: untuk apa hasil akhirnya dipakai (presentasi klien, media sosial, cetak, mockup developer)?
2. **Audiens**: siapa yang melihat (klien korporat, konsumen umum, developer)?
3. **Gaya/mood**: fotorealistik, minimalis, playful, premium, dark mode — minta 1–3 referensi visual kalau bisa.
4. **Spesifikasi teknis**: resolusi/ukuran, format file, orientasi (portrait/landscape), color space (RGB untuk digital, CMYK untuk cetak).
5. **Batasan**: warna brand yang wajib dipakai, elemen yang tidak boleh diubah, deadline.

**Kriteria keputusan**: kalau brief tidak menyebut ukuran/format output, default-nya:
- Media sosial: 1080×1080 (feed) atau 1080×1920 (story/reels), PNG/JPG, RGB.
- Render produk: 2048×2048 minimum, PNG dengan background transparan atau scene, RGB.
- Cetak: 300 DPI, format PDF/X atau TIFF, CMYK.

### 3.2. Alur Kerja 3D Render (Modeling → Material → Lighting → Render)

1. **Modeling**: Bangun atau pilih model dasar. Utamakan proporsi yang benar — ukur terhadap referensi nyata (misal botol 20 cm, bukan "kira-kira"). Topology bersih: hindari ngon berlebih, cek normal menghadap keluar.
2. **Material**: Terapkan PBR material (base color, roughness, metallic, normal). Aturan cepat:
   - Plastik matte: roughness 0.6–0.9, metallic 0.
   - Logam: metallic 1.0, roughness 0.1–0.4.
   - Kaca: transmission 1.0, roughness < 0.05, IOR 1.5.
   - Selalu cek material di bawah lighting netral sebelum lanjut.
3. **Lighting**: Gunakan skema tiga titik (key light, fill light, rim/back light) sebagai dasar.
   - Key light: sumber utama, intensitas paling tinggi, tentukan arah bayangan.
   - Fill light: 30–50% intensitas key, untuk melembutkan bayangan.
   - Rim light: dari belakang objek untuk memisahkan objek dari background.
   - Tambahkan environment/HDRI untuk refleksi realistis pada material metal/kaca.
4. **Kamera & komposisi**: Pilih angle sesuai tujuan — eye-level untuk produk netral, low angle untuk kesan premium/powerful, top-down untuk flat-lay. Terapkan rule of thirds; beri ruang napas (negative space) di sekitar objek utama.
5. **Render**: Set sample cukup untuk menghilangkan noise (minimal 128 sample untuk preview, 512+ untuk final). Aktifkan denoiser. Render dalam resolusi final, bukan upscale.
6. **Post-processing**: Koreksi kecil saja — exposure, contrast, white balance. Jangan mengubah bentuk/warna produk sampai tidak dikenali.

**Kriteria kualitas render** (cek sebelum serahkan):
- [ ] Tidak ada noise/grain yang terlihat pada area datar.
- [ ] Tidak ada artefak: fireflies, edge bergerigi, texture stretching.
- [ ] Bayangan masuk akal dan konsisten dengan arah cahaya.
- [ ] Warna produk sesuai brief/brand (bandingkan dengan referensi).
- [ ] Resolusi dan format sesuai spesifikasi brief.
- [ ] Komposisi seimbang, objek utama jelas, tidak terpotong.

**Format output render**: serahkan file final (PNG/JPG resolusi penuh) + file sumber/scene bila diminta + catatan singkat setting (angle kamera, lighting setup) agar bisa direvisi.

### 3.3. Alur Kerja UI/UX (Wireframe → Hi-Fi → Handoff)

1. **Wireframe**: Buat struktur kasar dulu (low-fi, grayscale). Fokus pada hierarki informasi dan alur pengguna, bukan estetika. Satu wireframe per screen/state penting (normal, loading, error, empty).
2. **Struktur file Figma/XD** (wajib rapi dari awal):
   - Pages: `01 - Cover`, `02 - Wireframes`, `03 - UI Kit`, `04 - Hi-Fi`, `05 - Prototype`, `99 - Archive`.
   - Components: semua elemen berulang (button, input, card) jadi component dengan variants (default/hover/disabled, size S/M/L).
   - Auto-layout: pakai di semua frame dan component agar responsif.
   - Naming: `Button/Primary/Large`, `Input/Text/Default` — format `Kategori/Nama/Variant`.
3. **Hi-fi mockup**: Terapkan warna, tipografi, dan spacing dari brand/design system. Spacing pakai kelipatan 4 atau 8 (4, 8, 16, 24, 32). Kontras teks minimal 4.5:1 untuk body text.
4. **Prototype**: Hubungkan screen dengan interaksi dasar (tap, hover) untuk alur utama saja — cukup untuk demo, bukan semua edge case.
5. **Handoff ke developer**: Siapkan:
   - Link file dengan akses view, halaman `04 - Hi-Fi` sebagai sumber kebenaran.
   - Spesifikasi: warna dalam HEX/RGB, font (nama + weight + size), spacing, border radius.
   - Export aset: ikon/logo dalam SVG, ilustrasi dalam PNG @2x/@3x.
   - Catatan perilaku: apa yang terjadi saat hover, loading, error, dan empty state.

**Kriteria keputusan desain UI**:
- Kalau tidak ada design system: buat mini UI kit dulu (warna, tipografi, 5–10 komponen dasar) sebelum menggambar screen — jangan desain screen satu per satu tanpa fondasi.
- Kalau brief minta "mirip aplikasi X": tiru pola interaksinya, jangan tiru aset visualnya (warna, logo, ikon khas).
- Mobile-first bila audiens utama pengguna HP; desktop-first bila dashboard/admin internal.

### 3.4. Alur Kerja Brand Identity

1. **Logo**: Buat 3 konsep arah berbeda (bukan 3 variasi kecil dari satu ide). Tiap konsep: versi primer, versi monokrom (hitam & putih), dan minimum size (cetak 15 mm, digital 32 px) — logo harus tetap terbaca di ukuran minimum.
2. **Warna**: Tentukan 1 warna primer, 1–2 sekunder, 1 aksen, plus netral (hitam/putih/abu). Catat dalam HEX, RGB, dan CMYK. Uji: logo monokrom harus tetap dikenali tanpa warna.
3. **Tipografi**: Pilih maksimal 2 keluarga font (1 display, 1 body). Catat nama, weight yang dipakai, dan fallback (misal untuk dokumen Word: pakai font sistem yang mirip).
4. **Aturan konsistensi** (tulis dalam brand guideline singkat):
   - Clear space: jarak aman di sekeliling logo = tinggi huruf "x" logo di semua sisi.
   - Larangan: jangan stretch logo, jangan ganti warna di luar palet, jangan taruh di background yang bertabrakan, jangan tambah efek (bayangan, outline, gradien) yang tidak disetujui.
5. **Deliverable per kebutuhan**:
   - Digital: SVG (logo/ikon), PNG transparan (beberapa ukuran), JPG.
   - Cetak: PDF/X atau AI/EPS vektor, CMYK, 300 DPI untuk elemen raster.
   - Serahkan juga file sumber yang bisa diedit.

### 3.5. Membangun Design System

1. **Design tokens** (fondasi, dalam format yang bisa dibaca developer):
   - Warna: `color.primary.500`, `color.neutral.100` — pakai skala numerik (50–900).
   - Spacing: `space.1` = 4px, `space.2` = 8px, dst.
   - Tipografi: `font.heading.lg` (family + size + weight + line-height).
   - Radius, shadow, border width dengan nama semantik.
2. **Komponen**: Bangun dari token, bukan nilai hardcode. Tiap komponen punya: variants, states (default/hover/focus/disabled), dokumentasi kapan dipakai dan kapan TIDAK dipakai, serta contoh do/don't.
3. **Dokumentasi**: Satu halaman per komponen: nama, deskripsi 1 kalimat, anatomi (bagian-bagiannya), variants, aturan pakai, contoh benar/salah.
4. **Naming convention**: `kategori/nama/variant/state` — konsisten di semua file. Contoh: `color/primary/500`, `button/primary/large/disabled`.
5. **Versioning**: Pakai semantic versioning (major.minor.patch).
   - Patch: perbaikan visual kecil tanpa mengubah API/props.
   - Minor: komponen baru atau variant baru, backward compatible.
   - Major: perubahan breaking (rename token, hapus komponen).
   - Catat changelog setiap rilis: apa berubah, kenapa, dan panduan migrasi bila breaking.

### 3.6. Format Output Standar

Setiap pekerjaan selesai harus menyertakan:
1. **File deliverable** sesuai spesifikasi brief (format + resolusi benar).
2. **Ringkasan singkat**: apa yang dibuat, keputusan desain penting (kenapa pilih angle/warna/komponen ini), dan asumsi yang diambil saat brief tidak lengkap.
3. **File sumber** bila relevan (file .fig, scene 3D, file vektor) agar bisa direvisi.
4. **Catatan revisi**: bagian mana yang mudah diubah vs yang butuh kerja ulang (misal: ganti warna background mudah; ganti angle kamera butuh re-render).

## 4. Contoh Singkat

**Input**: "Render 3D botol parfum kaca untuk feed Instagram, kesan premium, background gelap."

**Proses**:
1. Klarifikasi singkat: ukuran feed 1080×1080, PNG, RGB — disetujui.
2. Modeling: botol silinder + tutup kubus, proporsi 1:3 (botol 15 cm).
3. Material: kaca (transmission 1.0, roughness 0.03, IOR 1.5), tutup metalik emas (metallic 1.0, roughness 0.25), label putih matte.
4. Lighting: key light hangat dari kiri atas, rim light dingin dari belakang kanan untuk outline emas di background gelap, HDRI studio untuk refleksi kaca.
5. Kamera: eye-level, sedikit low angle (+10°) untuk kesan premium, rule of thirds.
6. Render: 1024 sample + denoiser, 2048×2048, lalu downscale ke 1080.
7. QA: cek noise di area kaca, cek bayangan konsisten, cek warna emas tidak overexposed.

**Output**: `parfum-premium-feed-1080.png` + ringkasan ("angle low 10°, lighting hangat-dingin untuk kontras premium; ganti background mudah, ganti bentuk botol butuh remodel") + file scene bila diminta revisi.

## 5. Anti-Pattern

- **Jangan menebak brief yang kosong.** Kalau ukuran, format, mood, atau audiens tidak jelas — tanya dulu. Menebak lalu salah arah membuang waktu render/desain berjam-jam.
- **Jangan kirim hasil tanpa QA.** Render ber-noise, logo terpotong, teks tidak terbaca, atau warna meleset dari brand — semua harus ketahuan sebelum sampai ke peminta, bukan sesudah.
- **Jangan hardcode nilai visual.** Warna, spacing, dan font di UI/design system harus lewat token/variable — jangan tulis `#3B82F6` langsung di 20 tempat.
- **Jangan stretch atau distorsi aset.** Logo, foto produk, dan model 3D tidak boleh ditarik/diubah proporsinya. Butuh ukuran lain? Scale proporsional atau buat ulang.
- **Jangan pakai efek berlebihan.** Drop shadow tebal, gradien mencolok, outline, dan bevel pada logo/UI adalah tanda desain amatir — pakai seperlunya sesuai gaya yang disepakati.
- **Jangan campur gaya visual dalam satu deliverable.** Satu render/poster pakai satu bahasa visual: jangan gabungkan fotorealistik dengan kartun, atau minimalis dengan dekoratif ramai.
- **Jangan serahkan file tanpa nama yang jelas.** Dilarang nama seperti `final2-revisi-beneran.png`. Pakai pola `nama-proyek-jenis-ukuran-v1.png`.
- **Jangan abaikan color space.** RGB untuk digital, CMYK untuk cetak — tertukar berarti warna cetak meleset atau file digital terlihat kusam.
- **Jangan desain screen tanpa fondasi.** Dilarang menggambar hi-fi screen sebelum ada (mini) UI kit: warna, tipografi, dan komponen dasar harus ditetapkan dulu.
- **Jangan meniru aset visual kompetitor.** Boleh meniru pola interaksi/UX yang bagus, tapi warna, logo, ikon khas, dan ilustrasi harus orisinal atau berlisensi jelas.
- **Jangan mengubah identitas yang sudah ditetapkan tanpa persetujuan.** Warna brand, bentuk logo, dan font primer tidak boleh "diperbagus" atas inisiatif sendiri — itu keputusan pemilik brand.
- **Jangan render di resolusi final untuk preview.** Kirim preview kecil/ber-watermark dulu untuk persetujuan arah, baru render final resolusi penuh — menghemat waktu komputasi.
