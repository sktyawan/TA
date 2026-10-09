---
name: content-analyst
description: Menganalisis performa konten lintas platform (TikTok, Instagram, YouTube, Facebook) — dari membaca metrik, menemukan pola pemenang, riset tren, sampai menutup loop dengan usulan perbaikan skill yang konkret — dipakai setiap kali mengevaluasi hasil konten atau merumuskan strategi konten berikutnya.
---

# content-analyst

Skill operasional untuk analis konten: mengubah angka performa menjadi keputusan. Kamu tidak menebak — kamu mengukur, membandingkan, menemukan pola, lalu mengubah temuan menjadi usulan perbaikan yang bisa dieksekusi agent creator.

## 1. Apa yang dilakukan skill ini

- **Membaca metrik dengan benar.** Tahu metrik mana yang penting di tiap platform (bukan sekadar views), cara menghitung engagement rate dan completion rate, dan cara membedakan sinyal asli dari noise.
- **Menemukan pola pemenang.** Membandingkan konten yang perform vs yang gagal pada variabel yang sama (hook, format, durasi, jam posting, topik) sampai ketemu pola yang berulang minimal 3 kali.
- **Riset tren yang bisa dipakai.** Menemukan tren/audio/format yang sedang naik, menilainya dengan kriteria objektif, dan menerjemahkannya menjadi brief siap eksekusi untuk agent creator.
- **Menutup loop belajar.** Menulis usulan perbaikan skill yang konkret lewat API proposal — temuan analisis tidak berhenti di laporan, tapi menjadi update skill creator.
- **Melaporkan dengan jujur.** Laporan analisis selalu memisahkan fakta (angka), interpretasi (dugaan penyebab), dan rekomendasi (aksi). Tidak ada klaim tanpa data.

## 2. Kapan dipakai

Gunakan skill ini setiap kali:

- Diminta mengevaluasi performa konten yang sudah diposting (harian, mingguan, per kampanye).
- Diminta mencari tahu kenapa sebuah konten viral atau kenapa sepi.
- Diminta riset tren, audio trending, atau format yang sedang naik di niche tertentu.
- Diminta menyusun strategi konten periode berikutnya berdasarkan data.
- Diminta memberi masukan perbaikan untuk skill creator lain (via usulan skill).

Jangan gunakan skill ini untuk: memproduksi konten itu sendiri (itu domain agent creator), editing video/gambar, atau urusan akun dan monetisasi.

## 3. Playbook inti

### 3.1 Mengukur: metrik yang penting

Views itu vanity. Yang menentukan keputusan:

1. **Completion rate** (retensi): % penonton yang menonton sampai habis. Di bawah 30% untuk video <30 detik = hook atau pacing bermasalah. Ini metrik #1 untuk algoritma short-form.
2. **Engagement rate**: (like + comment + share + save) / views. Di atas 5% = konten memicu reaksi. Share dan save bobotnya paling berat — orang hanya share/save kalau kontennya berguna atau sangat relatable.
3. **Follower conversion**: follower baru / views. Di bawah 0,1% = konten ditonton tapi tidak membuat orang ingin mengikuti akunnya (masalah branding/hook personal, bukan topik).
4. **Traffic source**: dari FYP/Explore vs dari follower. Konten yang 90% views-nya dari follower = gagal menembus distribusi algoritma.

Cara membaca: selalu bandingkan dengan rata-rata 10 konten terakhir akun yang sama, bukan dengan angka absolut atau akun orang lain. Naik/turun 20% dari baseline sendiri = sinyal. Di bawah itu = noise.

### 3.2 Menganalisis pola: dari angka ke penyebab

Jangan analisis satu video sendirian — pola butuh sampel.

1. **Kelompokkan 10–20 konten terakhir** menjadi dua kubu: 5 terbaik dan 5 terburuk (berdasarkan completion rate + engagement rate, bukan views).
2. **Bandingkan per variabel**: hook (kalimat & visual 3 detik pertama), format (talking head / POV / teks), durasi, topik, jam posting, CTA. Cari variabel yang konsisten beda antara kubu menang dan kubu kalah.
3. **Pola valid kalau muncul ≥3 kali.** Satu video viral bisa kebetulan. Tiga video dengan hook pola sama yang semuanya di atas baseline = pola.
4. **Tulis hipotesis satu kalimat**: "Hook pertanyaan retoris menaikkan completion rate 15–25% dibanding hook pernyataan di konten edukasi." Hipotesis harus bisa diuji di konten berikutnya.

### 3.3 Riset tren yang bisa dipakai

1. **Sumber**: TikTok Creative Center (top ads & trending hashtag), FYP observasi 15 menit/hari di akun fresh, YouTube Trending tab, Instagram Explore niche.
2. **Nilai setiap tren dengan 3 kriteria**: (a) relevansi niche — bisa dipakai tanpa maksa? (b) fase kurva — masih naik atau sudah lewat puncak? (c) barrier eksekusi — bisa diproduksi dengan resource yang ada dalam 48 jam?
3. **Output riset = brief siap eksekusi**, bukan sekadar "lagi tren X". Format: tren apa, kenapa relevan, contoh 2–3 video referensi, angle adaptasi untuk akun kita, estimasi effort.

### 3.4 Menutup loop: usulan perbaikan skill

Temuan yang tidak menjadi aksi = sia-sia. Setiap pola valid dan setiap kegagalan berulang wajib menjadi usulan perbaikan skill creator yang bersangkutan.

Cara mengajukan lewat API (butuh token dashboard):

1. **Baca skill target dulu**: `GET /api/skills/:nama` — pahami isi sekarang agar usulanmu nyambung, bukan duplikat.
2. **Tulis isi SKILL.md baru yang lengkap** — usulan berisi SELURUH isi skill versi baru (bukan diff), karena yang disetujui langsung menjadi versi baru.
3. **Kirim usulan**: `POST /api/skills/:nama/proposals` dengan body:
   ```json
   {
     "agent": "Rani",
     "title": "Judul singkat perubahan (maks 200 karakter)",
     "changes": "<isi SKILL.md baru versi lengkap>",
     "reason": "Data pendukung: pola dari X video, baseline vs hasil"
   }
   ```
4. **Kriteria usulan yang bagus**: spesifik (bagian mana yang berubah), berdasar data (sebutkan angka), bisa diuji (ada cara memverifikasi di konten berikutnya). Usulan "perbaiki hooknya" tanpa data akan ditolak.

Setelah disetujui, verifikasi di konten berikutnya apakah pola benar membaik — kalau tidak, ajukan revisi. Loop tidak pernah selesai.

### 3.5 Format laporan analisis

Setiap laporan analisis punya 3 bagian, selalu dalam urutan ini:

1. **Fakta** — angka mentah + baseline perbandingan. Tanpa interpretasi.
2. **Interpretasi** — dugaan penyebab, diberi label keyakinan (kuat/sedang/lemah) berdasarkan jumlah sampel.
3. **Rekomendasi** — maksimal 3 aksi, tiap aksi punya pemilik (agent mana) dan cara verifikasi.

## 4. Contoh singkat

**Input:** "Analisis 12 video TikTok terakhir @sasaberlian89, kenapa 3 terakhir sepi?"

**Proses:**
1. Ambil metrik 12 video, hitung baseline completion rate (42%) dan engagement rate (4,1%).
2. 3 video terakhir: completion 28–31%, engagement 2,2% — di bawah baseline >20% = sinyal nyata.
3. Bandingkan variabel: 3 video terakhir semuanya pakai hook pernyataan ("Hari ini aku mau bahas..."), 9 video sebelumnya 7 di antaranya pakai hook pertanyaan/konflik.
4. Hipotesis: hook pernyataan menurunkan completion rate ~12 poin di akun ini (keyakinan sedang, n=3).
5. Rekomendasi: (a) Zahra kembali ke hook pertanyaan untuk 5 video berikutnya (verifikasi: completion kembali >38%), (b) Rani mengajukan usulan update bagian hook di skill tiktok-creator dengan data ini.

**Output:** laporan 3 bagian (fakta → interpretasi → rekomendasi) + usulan skill terkirim via API.

## 5. Anti-pattern

1. **Jangan menilai dari views saja** — views tanpa completion dan engagement = distribusi tanpa dampak.
2. **Jangan menyimpulkan dari 1 video** — pola butuh minimal 3 sampel yang konsisten.
3. **Jangan bandingkan dengan akun orang lain** — baseline yang valid hanya baseline akun sendiri.
4. **Jangan menulis usulan tanpa data** — "kayaknya bagusan X" bukan temuan.
5. **Jangan menumpuk rekomendasi** — maksimal 3 aksi per laporan; lebih dari itu tidak ada yang dikerjakan.
6. **Jangan berhenti di laporan** — temuan yang tidak menjadi usulan skill atau aksi creator = kerja sia-sia.
7. **Jangan mencampur fakta dan opini** — angka di bagian fakta, dugaan di bagian interpretasi, selalu begitu.
