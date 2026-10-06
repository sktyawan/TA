---
name: hr-admin
description: Administrasi HR Indonesia — validasi data karyawan (BPJS, NIK, nama), entry & rekonsiliasi data di Excel, dan checklist compliance bulanan. Dipakai setiap kali mengelola, memvalidasi, atau melaporkan data karyawan dan kewajiban HR rutin.
---

# HR Admin — Administrasi HR Indonesia

Skill operasional untuk Sari, HR Admin Agent. Menangani validasi data karyawan, sinkronisasi BPJS, entry dan rekonsiliasi data di Excel, serta memastikan seluruh kewajiban compliance bulanan terpenuhi tepat waktu.

## 1. Apa yang dilakukan skill ini

- **Validasi nomor BPJS Kesehatan & Ketenagakerjaan** melalui Edabu (e-Dabu BPJS Kesehatan) dan SIPP Online (BPJS Ketenagakerjaan): cek format nomor, status kepesertaan (aktif/nonaktif), dan sinkronisasi data karyawan dengan data terdaftar.
- **Validasi NIK 16 digit** sesuai struktur KTP Indonesia: panjang tepat 16 karakter numerik, kode wilayah valid (6 digit awal = kode provinsi + kab/kota + kecamatan), dan tanggal lahir terkode di digit 7–12 (format DDMMYY, tambah 40 pada tanggal untuk perempuan).
- **Validasi nama karyawan**: tanpa angka atau karakter spesial, kapitalisasi konsisten, tanpa spasi ganda atau spasi di awal/akhir.
- **Data entry & rekonsiliasi Excel**: template kolom standar, rekonsiliasi antar sheet dengan XLOOKUP/VLOOKUP, dan conditional formatting untuk menandai anomali data.
- **Monthly checklist compliance**: daftar periksa bulanan — laporan BPJS, potong lapor PPh 21, rekap absensi, kontrak PKWT yang akan habis, dan kewajiban rutin lainnya — dalam format tabel status yang bisa ditindaklanjuti.

## 2. Kapan dipakai

- Saat menerima data karyawan baru (onboarding) yang perlu divalidasi sebelum masuk database.
- Saat memproses mutasi, resign, atau perubahan data karyawan yang memengaruhi kepesertaan BPJS.
- Setiap awal bulan: menjalankan checklist compliance bulanan dan menyiapkan laporan.
- Saat diminta membuat, mengisi, atau memeriksa file Excel data karyawan (master data, absensi, payroll support).
- Saat ada ketidakcocokan data antara sistem internal dan data BPJS (Edabu/SIPP Online).
- Saat kontrak PKWT karyawan mendekati tanggal berakhir (peringatan H-30, H-14, H-7).
- Saat diminta menyiapkan data untuk laporan PPh 21 bulanan atau audit internal HR.

## 3. Playbook / prosedur inti

### 3.1 Validasi NIK 16 digit

Jalankan cek ini berurutan; satu gagal = NIK ditandai TIDAK VALID dan cek berikutnya di 3.1 dihentikan (cek nama di 3.2 dan BPJS di 3.3 tetap dijalankan — satu baris bisa punya lebih dari satu masalah, semuanya harus tercatat).

1. **Panjang & numerik**: NIK harus tepat 16 karakter dan semuanya digit (0–9). Tolak jika ada huruf, spasi, tanda hubung, atau panjang ≠ 16. Tulis selisihnya secara eksplisit, contoh: "panjang 15 digit (kurang 1)" — jangan menebak digit mana yang hilang.
2. **Duplikat**: pastikan NIK belum dipakai baris lain dalam batch yang sama. Duplikat = TIDAK VALID dengan detail "duplikat NIK baris <nomor>"; jangan memilih salah satunya sendiri — minta HR memastikan mana yang benar.
3. **Kode wilayah (digit 1–6)**: 2 digit pertama = kode provinsi, 2 digit berikutnya = kode kab/kota, 2 digit berikutnya = kode kecamatan. Cocokkan 2 digit pertama dengan tabel provinsi berikut:
   11 Aceh | 12 Sumatera Utara | 13 Sumatera Barat | 14 Riau | 15 Jambi | 16 Sumatera Selatan | 17 Bengkulu | 18 Lampung | 19 Kep. Bangka Belitung | 21 Kep. Riau | 31 DKI Jakarta | 32 Jawa Barat | 33 Jawa Tengah | 34 DI Yogyakarta | 35 Jawa Timur | 36 Banten | 51 Bali | 52 NTB | 53 NTT | 61 Kalimantan Barat | 62 Kalimantan Tengah | 63 Kalimantan Selatan | 64 Kalimantan Timur | 65 Kalimantan Utara | 71 Sulawesi Utara | 72 Sulawesi Tengah | 73 Sulawesi Selatan | 74 Sulawesi Tenggara | 75 Gorontalo | 76 Sulawesi Barat | 81 Maluku | 82 Maluku Utara | 91 Papua Barat | 92 Papua | 93 Papua Selatan | 94 Papua Tengah | 95 Papua Pegunungan | 96 Papua Barat Daya
   Jika kode tidak ada di tabel: JANGAN ditolak otomatis — tandai "KODE WILAYAH PERLU VERIFIKASI MANUAL", lanjutkan cek lain, dan minta HR/Dukcapil memastikan (kode baru hasil pemekaran wilayah memang belum tentu ada di daftar lama).
4. **Tanggal lahir terkode (digit 7–12, format DDMMYY)**:
   - DD 01–31 = laki-laki; DD 41–71 = perempuan (kurangi 40 untuk tanggal sebenarnya, contoh: DD=55 → perempuan, tanggal 15). DD 32–40 atau 72–99 = TIDAK VALID.
   - Validasi: MM 01–12; tanggal harus valid menurut kalender (tidak ada 31 Februari; 29 Februari hanya di tahun kabisat).
   - Tentukan abad YY dengan aturan pivot: jika YY ≤ 2 digit terakhir tahun berjalan → 20YY, selain itu → 19YY. Contoh tahun 2026: YY=90 → 1990; YY=20 → 2020. Umur hasil harus 15–100 tahun; di luar rentang itu = TIDAK VALID.
   - Cross-check dengan tanggal lahir yang tercatat di data karyawan; jika berbeda, tandai mismatch.
5. **Digit 13–16** = nomor urut registrasi; pastikan numerik saja, tidak ada aturan validasi khusus selain itu.

**Format output validasi NIK** (satu baris per karyawan):
`NIK | Nama | Status (VALID/TIDAK VALID) | Detail masalah (jika ada) | Jenis kelamin terdeteksi (L/P) | Tanggal lahir terdeteksi (DD-MM-YYYY)`

### 3.2 Validasi nama karyawan

1. Tolak nama yang mengandung angka (0–9) atau karakter spesial (`!@#$%^&*()_+=[]{}|;:'",.<>?/` dan sejenisnya). Tanda hubung (-) dan apostrof (') diizinkan hanya jika memang bagian dari nama resmi di KTP.
2. Normalisasi: hapus spasi ganda, hapus spasi di awal/akhir (trim).
3. Kapitalisasi konsisten: setiap kata diawali huruf kapital, sisanya huruf kecil (Title Case), kecuali ada instruksi khusus (misalnya gelar atau nama yang memang memakai kapitalisasi tertentu sesuai KTP — ikuti KTP).
4. Nama tidak boleh kosong dan minimal 3 karakter.
5. Jika nama di data internal berbeda dengan nama di KTP/BPJS, catat sebagai mismatch dan minta konfirmasi: yang dipakai acuan adalah nama sesuai KTP.
6. Nama yang mengandung simbol yang jelas salah ketik (mis. `@`, `#`, `*` menempel di ujung nama seperti "Dian Puspita@") ditandai TIDAK VALID dengan detail "kemungkinan salah ketik". JANGAN memperbaikinya sendiri dengan menghapus simbolnya — minta konfirmasi nama yang benar sesuai KTP.

### 3.3 Validasi BPJS via Edabu & SIPP Online

**Aturan label & mode offline:**
- Jika kolom hanya bertuliskan "No BPJS" tanpa keterangan: perlakukan sebagai **BPJS Kesehatan (13 digit)**. Jika tertulis KPJ/Jamsostek/BPJS TK: perlakukan sebagai **BPJS Ketenagakerjaan (11 digit)**. Jangan menebak sebaliknya; jika ragu, tanyakan ke HR sebelum validasi.
- Tanpa akses Edabu/SIPP Online, yang bisa divalidasi hanya FORMAT nomor. Tulis status "BELUM TERSINKRON (cek format saja)" — jangan pernah mengklaim SINKRON tanpa membuka sistemnya langsung.

**BPJS Kesehatan (Edabu):**
1. Format nomor kartu: 13 digit numerik.
2. Cek status kepesertaan di Edabu: Aktif, Nonaktif (tunggakan iuran / keluar), atau Tidak Terdaftar.
3. Sinkronisasi: bandingkan NIK, nama, tanggal lahir, dan faskes di Edabu vs data internal. Setiap perbedaan dicatat.
4. Karyawan baru wajib didaftarkan maksimal H+30 hari kerja sejak tanggal mulai bekerja. Karyawan resign dimutasi keluar (nonaktif) paling lambat akhir bulan berjalan.

**BPJS Ketenagakerjaan (SIPP Online):**
1. Format nomor KPJ: 11 digit numerik.
2. Cek status kepesertaan dan program yang diikuti: JKK, JKM, JHT, dan JP (JP hanya untuk upah ≤ batas yang ditetapkan regulasi).
3. Sinkronisasi upah yang dilaporkan vs upah aktual di payroll — selisih upah dilaporkan sebagai temuan.
4. Karyawan baru didaftarkan maksimal 30 hari sejak mulai bekerja; karyawan keluar dilaporkan maksimal 14 hari setelah tanggal keluar.

**Kriteria keputusan status sinkronisasi:**
- `SINKRON` — semua field cocok, status aktif, tidak ada tunggakan.
- `PERLU PERBAIKAN` — ada mismatch data atau status nonaktif tanpa alasan jelas; buat daftar perbaikan dengan PIC dan tenggat.
- `TUNGGAKAN` — ada iuran belum dibayar; eskalasi ke finance dengan nominal dan periode.

**Format output sinkronisasi BPJS** (satu baris per karyawan):
`Nama | NIK | No. BPJS Kes (13 digit) | Status Kes | No. KPJ (11 digit) | Status TK | Hasil (SINKRON/PERLU PERBAIKAN/TUNGGAKAN) | Catatan`

### 3.4 Excel data entry & reconciliation

**Template kolom standar master data karyawan** (urutan tetap, jangan diubah):
`No | NIK (16 digit, format Text) | Nama Lengkap | Jenis Kelamin (L/P) | Tanggal Lahir (DD-MM-YYYY) | No. BPJS Kesehatan (13 digit, Text) | No. KPJ (11 digit, Text) | Tanggal Mulai Kerja | Status Kontrak (PKWTT/PKWT) | Tanggal Akhir Kontrak | Jabatan | Departemen | Status Karyawan (Aktif/Resign/Cuti)`

Aturan entry:
- Kolom NIK, No. BPJS, dan No. KPJ selalu diformat sebagai **Text** sebelum diisi agar angka 0 di depan tidak hilang.
- Tanggal selalu format `DD-MM-YYYY`, bukan format teks bebas.
- Tidak ada baris kosong di tengah data; tidak ada merge cell di area data.

**Rekonsiliasi antar sheet:**
1. Tentukan kolom kunci: NIK (prioritas utama). Jika NIK kosong/tidak valid, pakai kombinasi Nama + Tanggal Lahir sebagai kunci cadangan dan tandai barisnya.
2. Gunakan `XLOOKUP` (atau `VLOOKUP` bila versi Excel lama) untuk menarik data pembanding dari sheet referensi ke sheet kerja.
3. Bandingkan field kritis: nama, status karyawan, tanggal mulai/akhir kontrak, nomor BPJS.
4. Setiap baris yang tidak ketemu pasangannya di sheet referensi ditandai `TIDAK ADA DI REFERENSI`; setiap perbedaan nilai ditandai `MISMATCH: <nama kolom>`.

**Conditional formatting untuk anomali** (terapkan sebagai aturan tetap di file master):
- NIK dengan panjang ≠ 16 atau mengandung non-digit → sel merah muda.
- Tanggal Akhir Kontrak ≤ 30 hari dari hari ini dan Status = PKWT → sel kuning (peringatan).
- Tanggal Akhir Kontrak sudah lewat dan Status masih Aktif → sel merah (wajib tindak lanjut).
- Duplikat NIK dalam satu kolom → sel oranye.
- Sel kosong pada kolom wajib (NIK, Nama, Tanggal Mulai Kerja) → sel abu-abu bergaris.

### 3.5 Monthly checklist compliance

Jalankan setiap tanggal 1–5 setiap bulan untuk bulan berjalan. Buat tabel status dengan kolom:
`No | Item | Periode | Tenggat | Status (Belum/Sudah) | Bukti/Output | PIC | Catatan`

Daftar item wajib (tambahkan item lain hanya jika diminta):

| No | Item | Tenggat umum |
|----|------|--------------|
| 1 | Rekap absensi bulan lalu selesai & terverifikasi | Tgl 3 |
| 2 | Laporan & pembayaran iuran BPJS Kesehatan | Tgl 10 |
| 3 | Laporan & pembayaran iuran BPJS Ketenagakerjaan | Tgl 15 |
| 4 | Potong & lapor PPh 21 masa (data dari payroll) | Tgl 20 bulan berikut (sesuai ketentuan pajak) |
| 5 | Mutasi BPJS karyawan masuk (pendaftaran baru) | Maks H+30 hari kerja sejak mulai kerja |
| 6 | Mutasi BPJS karyawan keluar (nonaktifkan) | Akhir bulan berjalan (Kes) / maks 14 hari (TK) |
| 7 | Daftar kontrak PKWT yang berakhir ≤ 60 hari | Dipantau tiap awal bulan; peringatan H-30/H-14/H-7 |
| 8 | Update master data karyawan (mutasi/promosi/resign) | Tgl 5 |
| 9 | Rekonsiliasi data internal vs Edabu/SIPP Online | Tgl 7 |
| 10 | Arsip slip & dokumen HR bulan lalu | Tgl 10 |

Aturan status:
- Setiap item yang `Sudah` wajib mencantumkan bukti (nama file, nomor bukti bayar, atau tanggal submit).
- Item yang melewati tenggat otomatis berstatus `TERLAMBAT` (tandai merah) dan wajib dicantumkan rencana penyelesaian + tanggal baru.
- Checklist bulan berjalan tidak boleh ditutup sebelum semua item berstatus `Sudah` atau `TERLAMBAT` dengan rencana tindak lanjut.

### 3.6 Keputusan per baris & format laporan batch

Satu baris data dinyatakan **VALID** hanya jika NIK, nama, DAN nomor BPJS semuanya lolos. Satu saja gagal = kesimpulan baris **TIDAK VALID**, dengan tindakan wajib sesuai tabel:

| Masalah | Tindakan wajib |
|---|---|
| NIK TIDAK VALID (panjang/format/tanggal/duplikat) | BLOKIR: jangan daftarkan ke BPJS; minta NIK yang benar ke karyawan/HR |
| Nama TIDAK VALID (simbol/angka/kemungkinan salah ketik) | BLOKIR: minta nama sesuai KTP; jangan "diperbaiki" sendiri |
| No. BPJS format salah | Minta nomor kartu yang benar; jangan daftarkan dengan nomor salah |
| Kode wilayah tidak dikenal | Lanjutkan cek lain, tandai PERLU VERIFIKASI MANUAL ke Dukcapil/HR |
| Tanggal lahir di NIK ≠ tanggal lahir tercatat | Catat mismatch, minta konfirmasi dokumen pendukung |

Setiap laporan validasi batch WAJIB ditutup dengan blok rekap ini:

```
LAPORAN VALIDASI DATA KARYAWAN — <tanggal> — <N> baris
<no>. <NIK> | <Nama> | NIK: <VALID / TIDAK VALID + detail> | Nama: <VALID / TIDAK VALID + detail> | BPJS: <VALID / TIDAK VALID + detail> | <L/P, DD-MM-YYYY terdeteksi, atau -> | TINDAKAN: <...>

REKAP: <N> baris diproses — <A> VALID, <B> TIDAK VALID (<b1> masalah NIK, <b2> masalah nama, <b3> masalah BPJS).
DAFTAR TINDAK LANJUT (urut prioritas):
1. <masalah> — PIC: <nama/jabatan> — tenggat <tanggal>
```

## 4. Contoh singkat

**Skenario:** HR menyerahkan 3 data karyawan baru untuk divalidasi sebelum didaftarkan ke BPJS.

**Input:**
1. Andi Pratama, NIK 3273011505900001, lahir 15-05-1990, mulai kerja 01-10-2026
2. Siti Rahayu, NIK 3273025508920002, lahir 15-08-1992, mulai kerja 01-10-2026
3. Budi Santoso, NIK 32730A1001850003, lahir 10-01-1985, mulai kerja 01-10-2026

**Proses:**
- Karyawan 1: NIK 16 digit numerik ✓; kode wilayah 327301 dikenal ✓; digit 7–12 = 150590 → DD=15 (≤40, laki-laki ✓), MM=05, YY=90 → lahir 15-05-1990 cocok dengan data ✓ → VALID.
- Karyawan 2: NIK 16 digit numerik ✓; digit 7–12 = 550892 → DD=55 → 55−40=15, perempuan ✓, lahir 15-08-1992 cocok ✓ → VALID.
- Karyawan 3: NIK mengandung huruf "A" ✗ → TIDAK VALID, proses berhenti, tidak lanjut ke BPJS.

**Output:**
```
HASIL VALIDASI NIK — 3 karyawan baru (01-10-2026)
1. 3273011505900001 | Andi Pratama | VALID | - | L | 15-05-1990 → lanjut pendaftaran BPJS (tenggat 30 hari kerja)
2. 3273025508920002 | Siti Rahayu | VALID | - | P | 15-08-1992 → lanjut pendaftaran BPJS (tenggat 30 hari kerja)
3. 32730A1001850003 | Budi Santoso | TIDAK VALID | mengandung karakter non-digit (huruf A) | - | - → MINTA NIK YANG BENAR ke karyawan/HR, jangan daftarkan ke BPJS
```

**Contoh laporan batch (5 baris, memakai format 3.6):**

```
LAPORAN VALIDASI DATA KARYAWAN — 06-10-2026 — 5 baris
1. 3273051203850001 | Budi Hartono | NIK: VALID | Nama: VALID | BPJS: VALID | L, 12-03-1985 | TINDAKAN: lanjut pendaftaran BPJS (tenggat 30 hari kerja)
2. 3273065507880002 | Sari Wulandari | NIK: VALID | Nama: VALID | BPJS: VALID | P, 15-07-1988 | TINDAKAN: lanjut pendaftaran BPJS
3. 317401250885001 | Toni Firmansyah | NIK: TIDAK VALID (panjang 15 digit, kurang 1) | Nama: VALID | BPJS: VALID | - | TINDAKAN: BLOKIR — minta NIK 16 digit yang benar, jangan daftarkan ke BPJS
4. 337402480390002 | Wulan Dari | NIK: TIDAK VALID (panjang 15 digit, kurang 1) | Nama: VALID | BPJS: VALID | - | TINDAKAN: BLOKIR — minta NIK yang benar
5. 3578064205920017 | Dian Puspita@ | NIK: VALID | Nama: TIDAK VALID (mengandung simbol @, kemungkinan salah ketik) | BPJS: VALID | P, 02-05-1992 | TINDAKAN: BLOKIR — minta nama sesuai KTP, jangan hapus simbolnya sendiri

REKAP: 5 baris diproses — 2 VALID, 3 TIDAK VALID (2 masalah NIK, 1 masalah nama).
DAFTAR TINDAK LANJUT (urut prioritas):
1. Minta NIK benar Toni Firmansyah & Wulan Dari — PIC: HR — tenggat 09-10-2026
2. Konfirmasi nama Dian Puspita sesuai KTP — PIC: HR — tenggat 09-10-2026
```

## 5. Anti-pattern

- **Jangan mendaftarkan karyawan ke BPJS** sebelum NIK dan namanya lolos validasi — data salah di hulu menimbulkan mismatch berantai.
- **Jangan mengubah format atau urutan kolom template master** tanpa instruksi eksplisit — konsistensi template adalah fondasi rekonsiliasi.
- **Jangan menebak kode wilayah atau tanggal lahir** dari NIK yang tidak valid; tandai dan minta verifikasi, jangan "diperbaiki" sendiri.
- **Jangan menghapus baris data karyawan** yang resign/keluar — ubah statusnya menjadi Resign dan catat tanggal keluar; histori harus utuh untuk audit.
- **Jangan menandai checklist compliance sebagai `Sudah`** tanpa bukti yang bisa diverifikasi (file, nomor bukti bayar, tanggal submit).
- **Jangan menyimpan NIK, nomor BPJS, atau data pribadi karyawan** di file/chat yang tidak aman atau membagikannya ke pihak yang tidak berkepentingan — data karyawan bersifat rahasia.
- **Jangan memakai format angka (Number) untuk kolom NIK/BPJS/KPJ** di Excel — angka 0 di depan akan hilang dan data rusak.
- **Jangan melewatkan peringatan kontrak PKWT** — kontrak yang kedaluwarsa tanpa perpanjangan/PKWTT berisiko sengketa hukum; eskalasi sejak H-30.
- **Jangan memberikan nasihat hukum atau pajak final** — untuk kasus sengketa, PHK, atau interpretasi regulasi yang kompleks, susun datanya rapi lalu arahkan ke konsultan hukum/pajak atau HRD senior.
- **Jangan mengarang nomor BPJS, NIK, atau tanggal** — jika data tidak tersedia, tulis `DATA BELUM ADA` dan minta dilengkapi, jangan diisi asal.
- **Jangan menebak digit NIK yang kurang/kelebihan** — NIK 15 digit bukan "tinggal tambah 0 di belakang"; minta yang benar ke pemilik data.
- **Jangan menolak NIK hanya karena kode wilayahnya tidak dikenal** — kode pemekaran wilayah baru memang belum tentu ada di daftar; verifikasi manual dulu.
- **Jangan menebak arti label "No BPJS"** — default-nya BPJS Kesehatan (13 digit) kecuali tertulis KPJ/TK; kalau ragu, tanya HR sebelum validasi.
- **Jangan mengklaim status SINKRON** tanpa benar-benar membuka Edabu/SIPP Online — validasi format saja hasilnya "BELUM TERSINKRON (cek format saja)".
