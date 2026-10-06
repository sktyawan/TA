---
name: personal-branding
description: Personal branding & portfolio untuk developer di GitHub, LinkedIn, dan X — dipakai saat Seti meminta optimasi profil, README portfolio, kalender konten LinkedIn, atau strategi pertumbuhan X.
---

# personal-branding

Skill operasional untuk membangun dan merawat personal brand Seti sebagai developer di GitHub, LinkedIn, dan X (Twitter). Output-nya selalu konkret: teks profil siap salin, kalender konten siap jalankan, atau checklist optimasi siap dieksekusi — bukan saran umum.

## 1. Apa yang dilakukan skill ini

- Menyusun **positioning statement**: satu kalimat identitas profesional yang dipakai konsisten di semua platform.
- Mendesain **README profil GitHub** yang menjual: struktur heading, badge, daftar skill, pinned repositories, statistik kontribusi.
- Merekomendasikan **pinned repositories**: repo mana yang dipajang (6 slot GitHub), repo mana disembunyikan/dipoles dulu.
- Menjaga **konsistensi identitas lintas platform**: nama tampilan, username, foto, bio, link yang selaras GitHub ↔ LinkedIn ↔ X.
- Menyusun **kalender konten LinkedIn**: pilar konten, frekuensi posting, format (teks, carousel, polling), jam posting, template mingguan siap pakai.
- Merancang **strategi pertumbuhan X**: optimasi bio & pinned tweet, reply strategy, struktur thread, engagement loop.

## 2. Kapan dipakai

- Seti meminta "optimasi profil GitHub / LinkedIn / X saya".
- Seti meminta "buatkan README profil", "rapikan repo yang dipin", atau "portfolio saya kurang menjual".
- Seti meminta "jadwal konten LinkedIn", "ide postingan minggu ini", atau "konten apa yang cocok untuk saya".
- Seti meminta "naikkan followers X", "bikin thread", atau "strategi engagement".
- Setelah ada pencapaian nyata (rilis proyek, sertifikasi, project freelance selesai) — tawarkan update profil + 1 postingan pengumuman.
- JANGAN dipakai untuk menulis konten yang tidak berhubungan dengan karir/teknologi Seti, dan JANGAN dipakai untuk membuat akun palsu atau memalsukan pengalaman.

## 3. Playbook / prosedur inti

### 3.1 Positioning statement

1. Kumpulkan fakta dari profil Seti yang ada: role utama, stack dominan, niche yang membedakan (misal: AI automation, HR tech, tooling open source).
2. Tulis dengan format: `[Role] yang membantu [audiens] [hasil konkret] lewat [cara/stack khas]`.
   - Benar: "Full-stack developer yang membantu UMKM otomatisasi operasional lewat AI agents & integrasi API."
   - Salah: "Passionate developer yang suka coding dan belajar hal baru."
3. Panjang maksimal 15 kata. Harus bisa ditempel mentah ke headline LinkedIn dan bio X tanpa diedit.
4. Kriteria lolos: orang asing paham dalam 5 detik Seti itu siapa dan kenapa relevan. Kalau masih butuh penjelasan, tulis ulang.
5. Varian bila formula utama tidak pas:
   - Padat (gaya headline): `[Role] | [niche] | [bukti]` — contoh: "AI Automation Developer | AI Agents & API Integration | Open Source Tooling".
   - Naratif: `Saya membangun [jenis solusi] untuk [audiens] yang [masalah]` — contoh: "Saya membangun AI agents untuk tim operasional yang tenggelam di kerja repetitif."
6. Bahasa: default Bahasa Indonesia. Jika target freelance/klien internasional, buat juga versi Inggris 1 baris yang maknanya setia dengan versi Indonesia (bukan positioning yang berbeda). Contoh EN: "AI automation developer helping Indonesian businesses cut ops costs with AI agents & API integrations."
7. Checklist validasi sebelum dipakai: (a) maksimal 15 kata; (b) memuat ketiganya — audiens, hasil konkret, cara/stack khas; (c) lolos uji 5 detik oleh orang asing; (d) total bio X (positioning + bukti + CTA/link) tidak melebihi 160 karakter.

### 3.2 README profil GitHub

Struktur baku (urutan wajib):

1. **Sapaan + positioning** (2-3 baris): nama, positioning statement, lokasi/timezone bila relevan.
2. **Badge stack** (maksimal 10 badge): hanya teknologi yang benar-benar dipakai di repo publik Seti. Jangan pasang badge teknologi yang tidak ada buktinya di repo.
3. **Proyek unggulan** (3-6 repo, dengan 1 kalimat deskripsi hasil per repo — fokus ke *hasil*, bukan fitur):
   - Format: `**[nama-repo](link)** — [hasil/impact dalam 1 kalimat]. Stack: ...`
4. **Statistik** (opsional): GitHub stats card / streak card. Pakai hanya jika kontribusi 3 bulan terakhir tidak kosong.
5. **Sedang dikerjakan / belajar**: 1-2 baris, konkret (misal: "Membangun dashboard multi-agent dengan Express + AI routing").
6. **Kontak**: LinkedIn, X, email — hanya yang aktif.

**Aturan penulisan:** tanpa emoji berlebihan (maksimal 1 per baris section), tanpa GIF animasi, tanpa kalimat klise ("Welcome to my profile", "Passionate about..."). Bahasa README: pilih satu — Inggris bila target freelance/klien internasional, Indonesia bila target lokal; boleh bilingual dengan pola konsisten (satu bahasa per section, jangan campur acak dalam satu section).

**Contoh isi per section** (ganti semua dengan data nyata Seti — contoh di bawah hanya menunjukkan pola dan sintaks yang benar):

```markdown
# Halo, saya Seti 👋
**AI automation developer** yang membantu bisnis Indonesia pangkas biaya operasional lewat AI agents & integrasi API.
📍 Indonesia (WIB, UTC+7)

## 🛠️ Stack
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
```

Pola badge: `https://img.shields.io/badge/<Nama>-<HexWarna>?logo=<logo>&logoColor=white` (maksimal 10 badge, hanya stack yang terbukti dipakai di repo publik).

```markdown
## 🚀 Proyek Unggulan
- **[hermes-agent-dashboard](https://github.com/sktyawan/hermes-agent-dashboard)** — Dashboard orkestrasi 10 AI agent dengan routing model otomatis; memangkas eksekusi task operasional berulang dari hitungan jam menjadi menit. Stack: Node.js, Express, REST API.
- **[jarwo-relay](https://github.com/sktyawan/jarwo-relay)** — Relay Telegram dua arah berjadwal tiap 5 menit untuk bot pribadi; pesan penting tersampaikan tanpa spam. Stack: Python, Telegram Bot API.

## 📊 Statistik
![Statistik GitHub Seti](https://github-readme-stats.vercel.app/api?username=sktyawan&show_icons=true)

## 🔭 Sedang Dikerjakan
Membangun pipeline auto-retry deploy workload AI di Oracle Cloud (Ampere 4 OCPU/24GB).

## 📫 Kontak
[LinkedIn](https://linkedin.com/in/USERNAME) · [X](https://x.com/USERNAME) · [email@aktif.com](mailto:email@aktif.com)
```

**Aturan data (wajib):** jangan mengarang nama repo, angka, atau link. Bila daftar repo Seti belum diketahui saat mengerjakan task, tulis slot proyek sebagai `- **[nama-repo]** — [TBD — isi setelah cek repo Seti]` dan minta daftar repo ke Seti sebelum final. Username/link contoh di atas wajib diganti data asli di output final — jangan biarkan placeholder lolos.

### 3.3 Pinned repositories

1. GitHub hanya memberi 6 slot — perlakukan sebagai etalase, bukan arsip.
2. Kriteria pemilihan (skor 1-5 tiap kriteria, pilih 6 skor tertinggi):
   - **Relevansi positioning** (apakah repo membuktikan positioning statement?)
   - **Kualitas README repo** (ada deskripsi, cara jalan, screenshot/demo?)
   - **Keaktifan** (commit dalam 6 bulan terakhir lebih baik)
   - **Bukti skill yang dicari pasar** (API, AI integration, deployment, testing)
3. Repo yang skornya rendah tapi penting: poles dulu (tulis README minimal: apa ini, cara jalan, 1 screenshot) baru pin. Jangan pin repo kosong/tanpa README.
4. Review ulang tiap 3 bulan atau tiap ada proyek baru yang selesai.
5. Seri skor: menangkan yang paling relevan dengan positioning, lalu yang commit-nya paling baru.
6. Jangan pin fork kecuali Seti kontributor aktif di fork itu (commit-nya terlihat di contribution graph fork tersebut).

### 3.4 Konsistensi identitas lintas platform

Checklist yang harus selaras:

| Elemen | GitHub | LinkedIn | X |
|---|---|---|---|
| Nama tampilan | sama | sama (nama asli) | boleh handle, tapi nama asli tercantum |
| Foto profil | foto yang sama / gaya yang sama | sama | sama |
| Positioning 1 kalimat | di README | di headline | di bio |
| Link silang | link ke LinkedIn & X | link ke GitHub & X | link ke GitHub & LinkedIn |
| Username/handle | usahakan pola sama (misal: setiawan-dev) | URL custom linkedin.com/in/setiawan-dev | @setiawan_dev bila tersedia |

Jika ada yang tidak selaras, laporkan sebagai daftar perbaikan konkret ("ganti X menjadi Y di platform Z"), bukan saran umum.

### 3.5 Kalender konten LinkedIn

**Pilar konten** (proporsi mingguan, total 3-5 posting/minggu):

1. **Build in public** (40%): progres proyek nyata Seti — masalah yang dihadapi, keputusan teknis, hasil. Selalu sertakan detail konkret (angka, error, solusi).
2. **Insight teknis** (30%): pelajaran dari pekerjaan — 1 insight = 1 posting. Format: masalah → apa yang dicoba → apa yang berhasil.
3. **Opini / sudut pandang** (20%): pendapat soal tren teknologi, tools, cara kerja. Harus punya pendirian, bukan netral-netral saja.
4. **Personal / milestone** (10%): pencapaian, refleksi, behind-the-scenes. Maksimal 1 per 2 minggu agar tidak jadi diary.

**Format yang dipakai bergantian:**

- **Teks pendek** (150-300 kata): untuk insight dan opini. Hook di 2 baris pertama — 2 baris pertama menentukan apakah orang klik "see more".
- **Carousel** (5-10 slide): untuk tutorial mini, breakdown arsitektur, checklist. 1 ide per slide, maksimal 25 kata per slide.
- **Polling**: maksimal 1 per 2 minggu, selalu dengan topik yang mengundang pendapat (bukan pertanyaan yang jawabannya jelas).

**Jam posting** (WIB, untuk audiens Indonesia): Selasa–Kamis, 07:30–09:00 atau 12:00–13:00 atau 19:00–21:00. Hindari Senin pagi dan Jumat sore. Posting 1x per hari maksimal — kualitas mengalahkan kuantitas.

**Template kalender mingguan** (output berupa tabel siap jalankan — kolom Hook dan CTA wajib terisi kalimat jadi; dilarang mengeluarkan sel "..." kosong):

| Hari | Pilar | Format | Topik spesifik | Hook draf (1 kalimat) | CTA |
|---|---|---|---|---|---|
| Selasa | Build in public | Teks | Relay Telegram 5 menit untuk bot pribadi: kenapa pindah dari polling ke webhook | "Bot Telegram saya delay 5 menit. Ternyata masalahnya bukan di kode." | "Kalian pakai polling atau webhook untuk bot? Kenapa?" |
| Rabu | Insight teknis | Carousel | Checklist audit security: 6 pola celah yang saya temukan di repo sendiri | "Saya audit repo sendiri dan nemu 6 lubang kritis. Ini checklist-nya:" | "Pernah nemu yang mana di codebase kalian?" |
| Kamis | Opini | Teks | Agent AI harus nurut, bukan kreatif | "AI agent saya ngerusak kerjaan karena terlalu kreatif. Solusinya: kontrak kerja yang ketat." | "Setuju agent dibatasi ketat, atau dibiarkan eksplor?" |

Topik contoh di atas ilustratif — ganti dengan proyek/pengalaman nyata Seti yang sedang berjalan (misal: dashboard multi-agent, relay Telegram, setup VPS). Setiap baris kalender wajib berisi: topik spesifik (bukan "tentang AI"), hook draf 1 kalimat, dan CTA berupa pertanyaan penutup yang mengundang komentar. Baris Sabtu (personal/milestone) opsional, maksimal 1 per 2 minggu.

**Aturan konten LinkedIn:**

- Setiap posting harus punya 1 hook kuat (kalimat pertama), 1 isi bernilai (insight/actionable), 1 CTA (pertanyaan).
- Jangan posting konten generik yang bisa ditulis siapa saja — selalu kaitkan dengan pengalaman nyata Seti.
- Panjang teks: 150-300 kata ideal. Lebih dari 500 kata → pecah jadi carousel atau thread.
- Balas setiap komentar dalam 24 jam pertama — algoritma menghargai percakapan awal.

### 3.6 Strategi pertumbuhan X

**Optimasi bio & pinned tweet:**

1. Bio = positioning statement + 1 bukti kredibilitas + 1 CTA/link. Maksimal 160 karakter. Contoh pola: "[Positioning]. Membangun [proyek]. ↓ [link]".
2. Pinned tweet: tweet terbaik/terpenting — thread paling viral, pengumuman proyek terbesar, atau manifesto 1 tweet. Ganti tiap ada pencapaian yang lebih besar.

**Reply strategy (mesin pertumbuhan utama):**

1. Identifikasi 10-20 akun target: developer/tech founder Indonesia + internasional di niche Seti, dengan 1K-100K followers (cukup besar untuk jangkauan, cukup kecil untuk dibaca).
2. Setiap hari: 5-10 reply berkualitas ke tweet mereka — tambah insight, pengalaman, atau data, BUKAN "setuju" atau "keren bang".
3. Kriteria reply yang bagus: bisa berdiri sendiri sebagai tweet (orang yang tidak baca tweet aslinya tetap dapat nilai), 1-3 kalimat, ada sudut pandang sendiri.
4. Jangan reply ke akun yang jauh di atas jangkauan (>500K followers) sebagai strategi utama — tenggelam.

**Struktur thread:**

1. Tweet 1 = hook: klaim berani / angka / pertanyaan — harus membuat orang berhenti scroll.
2. Tweet 2-6 = isi: 1 poin per tweet, urutan logis (masalah → proses → hasil).
3. Tweet terakhir = ringkasan + CTA (follow untuk konten sejenis / reply dengan pengalaman).
4. Panjang ideal: 5-8 tweet. Setiap tweet maksimal 240 karakter agar tidak terpotong.
5. Topik thread yang bekerja: breakdown proyek nyata, "yang saya pelajari dari X", perbandingan tools berdasarkan pengalaman pakai, kesalahan mahal.

**Contoh hook tweet 1** (pola siap pakai — ganti isi dengan pengalaman nyata Seti, jangan mengarang angka):
- "Saya nemu 6 lubang security kritis pas audit repo sendiri. Ini yang paling sering kelewat 🧵"
- "Bot Telegram saya delay 5 menit. Ternyata masalahnya bukan di kode — ini yang saya ubah 🧵"
- "Unpopular opinion: AI agent yang bagus itu yang nurut, bukan yang kreatif."

**Engagement loop mingguan:**

- Posting: 1 thread/minggu + 3-5 tweet pendek/minggu (insight 1 kalimat, opini, progres).
- Reply: 5-10/hari ke akun target.
- Quote tweet: 1-2/minggu untuk topik yang Seti punya pendirian kuat.
- Ukur tiap minggu: impressions, profile visits, follower baru. Yang tidak tumbuh setelah 3 minggu → ganti topik/format, bukan menambah volume.

## 4. Contoh singkat

**Input:** Seti: "Rapikan profil GitHub saya, mau kelihatan siap freelance."

**Proses:**

1. Cek repo publik Seti, catat stack dominan dan repo paling aktif.
2. Susun positioning statement: "Full-stack developer (Node.js/Python) yang membangun AI agents & automation tools untuk operasional bisnis."
3. Skor 6 repo untuk pin memakai kriteria 3.3 — pilih yang README-nya lengkap dan relevan dengan positioning.
4. Tulis README profil mengikuti struktur 3.2, badge hanya untuk stack yang terbukti di repo.
5. Cek konsistensi: samakan foto, nama, dan link LinkedIn/X di profil GitHub.

**Output:** file README.md siap salin-tempel ke repo profil, daftar 6 repo yang di-pin (dengan alasan 1 kalimat per repo), dan checklist 3 perbaikan konsistensi lintas platform.

## 5. Anti-pattern

- Jangan menulis positioning/bio generik ("passionate developer", "tech enthusiast", "lifelong learner") — selalu spesifik dengan hasil dan stack.
- Jangan memalsukan pengalaman, skill, atau statistik — hanya klaim yang bisa dibuktikan dari repo/proyek nyata Seti.
- Jangan memasang badge teknologi yang tidak ada buktinya di repo publik.
- Jangan mem-pin repo kosong, tanpa README, atau yang tidak relevan dengan positioning.
- Jangan membuat kalender konten dengan topik generik ("tips AI") — setiap topik harus dikaitkan ke pengalaman/proyek nyata Seti.
- Jangan menyarankan beli followers, engagement pod, atau reply spam "keren bang" — pertumbuhan hanya lewat konten dan reply bernilai.
- Jangan mengubah gaya bahasa Seti menjadi kaku/formal korporat — pertahankan nada santai, to-the-point, Bahasa Indonesia campur istilah teknis Inggris bila natural.
- Jangan membuat akun palsu, memalsukan testimoni, atau mengklaim proyek orang lain sebagai milik Seti.
- Jangan menjanjikan hasil pertumbuhan ("dijamin 10K followers sebulan") — berikan mekanisme dan metrik ukur, bukan janji angka.
- Jangan mengarang nama repo, angka statistik, link, atau testimoni — data yang belum diketahui ditulis `[TBD]` dan ditanyakan ke Seti; jangan biarkan placeholder lolos ke output final.
- Jangan pin fork tanpa kontribusi nyata Seti di fork tersebut.
- Jangan campur Bahasa Indonesia dan Inggris secara acak dalam satu section README — pilih satu bahasa per section dengan pola yang konsisten.
