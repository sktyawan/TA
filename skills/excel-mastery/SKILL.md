---
name: excel-mastery
description: "Kuasai 5 fungsi inti Excel (SUMIFS, XLOOKUP, IF/IFS, TEXT/DATE, COUNTIFS), debug dan optimasi formula, serta otomatisasi audit kualitas data. Dipakai setiap kali ada permintaan kerja dengan spreadsheet - menghitung, menganalisis, memperbaiki error formula, atau memvalidasi data."
---

# excel-mastery

Kamu adalah pengguna Excel tingkat mahir. Semua instruksi di bawah ini adalah prosedur kerja baku, bukan saran umum. Jalankan secara harfiah setiap kali kamu menangani file spreadsheet.

## 1. Apa yang dilakukan skill ini

Skill ini memberimu kemampuan operasional penuh di Microsoft Excel:

- **Membangun formula ringkas dan benar** untuk 5 fungsi inti: `SUMIFS`, `XLOOKUP`/`VLOOKUP`, `IF`/`IFS`, fungsi `TEXT` dan `DATE`, serta `COUNTIFS` — lengkap dengan sintaks tepat, kondisi pemakaian, dan contoh kasus nyata.
- **Mendebug formula yang rusak**: melacak sumber error `#N/A`, `#VALUE!`, `#REF!`, dan referensi sirkular; mengevaluasi formula langkah per langkah; mengganti fungsi volatil (`INDIRECT`, `OFFSET`) dengan alternatif stabil.
- **Mengoptimasi performa**: mengubah range penuh kolom (mis. `A:A`) menjadi tabel terstruktur (Ctrl+T) agar file ringan dan formula terbaca.
- **Mengotomatisasi audit kualitas data**: checklist audit (duplikat, sel kosong, tipe data salah, outlier), aturan conditional formatting, data validation, dan format laporan hasil audit yang siap dikirim.

## 2. Kapan dipakai

Pakai skill ini ketika salah satu kondisi berikut terpenuhi:

- Pengguna meminta membuat/memperbaiki formula Excel apa pun, dari yang sederhana (`SUM`) sampai bertingkat.
- Pengguna mengirim file spreadsheet dengan error (`#N/A`, `#VALUE!`, `#REF!`, `#DIV/0!`, circular reference) dan meminta diperbaiki.
- Pengguna meminta analisis data: total per kategori, pencarian data antar sheet, pengelompokan kondisi, rekap per bulan/tanggal.
- Pengguna meminta "cek data ini", "apakah datanya bersih", "cari duplikat", atau validasi kualitas dataset sebelum dipakai.
- File Excel terasa berat/lambat dan perlu dioptimasi tanpa mengubah hasil perhitungan.

Jangan pakai skill ini untuk hal di luar Excel (mis. Word, PowerPoint, atau coding VBA yang rumit — untuk macro besar, minta klarifikasi dulu).

## 3. Playbook / prosedur inti

### 3.1 Lima fungsi dasar

Urutan prioritas saat memilih fungsi: pakai fungsi paling spesifik yang menyelesaikan masalah dalam satu formula. Jangan menumpuk fungsi kalau satu fungsi cukup.

#### A. SUMIFS — menjumlahkan dengan banyak kriteria

Sintaks:
```
=SUMIFS(sum_range; criteria_range1; criteria1; [criteria_range2; criteria2]; ...)
```

- `sum_range`: kolom angka yang dijumlahkan.
- Pasangan `criteria_range` + `criteria` boleh lebih dari satu; SEMUA kriteria harus terpenuhi (logika AND), dan semua range harus punya jumlah baris yang sama.

Kapan dipakai: rekap total dengan filter berlapis (mis. total penjualan per cabang per bulan).

Contoh nyata — total penjualan cabang "Bandung" bulan Januari dari tabel Transaksi (kolom A=tanggal, B=cabang, C=nominal):
```
=SUMIFS(C2:C1000; B2:B1000; "Bandung"; A2:A1000; ">=01/01/2026"; A2:A1000; "<=31/01/2026")
```

Kesalahan umum: range tidak sejajar (mis. `C2:C1000` vs `B2:B999`) → hasil `#VALUE!`.

#### B. XLOOKUP (utama) / VLOOKUP (kompatibilitas)

Sintaks XLOOKUP:
```
=XLOOKUP(lookup_value; lookup_array; return_array; [if_not_found]; [match_mode]; [search_mode])
```

- `if_not_found`: isi dengan teks seperti `"Tidak ditemukan"` agar tidak muncul `#N/A` mentah.
- `match_mode`: 0 = cocok persis (default), -1 = cocok persis atau nilai lebih kecil berikutnya, 1 = cocok persis atau lebih besar berikutnya, 2 = wildcard.
- `search_mode`: -1 = cari dari bawah (berguna untuk data terakhir/terbaru).

Sintaks VLOOKUP (hanya jika file harus dibuka di Excel lama tanpa XLOOKUP):
```
=VLOOKUP(lookup_value; table_array; col_index_num; [range_lookup])
```
- Selalu set `range_lookup` = `FALSE` untuk pencarian persis. Tanpa ini, VLOOKUP memakai pencocokan kira-kira dan hasilnya bisa salah diam-diam.

Kapan dipakai: mengambil data dari tabel referensi (mis. nama produk dari kode, harga dari SKU, nama karyawan dari NIP).

Contoh nyata — ambil nama produk dari kode di sel F2, tabel master di sheet "Master" (kolom A=kode, B=nama):
```
=XLOOKUP(F2; Master!A:A; Master!B:B; "Kode tidak terdaftar")
```

Aturan: XLOOKUP selalu diutamakan karena bisa mencari ke kiri, tidak butuh nomor kolom, dan punya argumen `if_not_found`. VLOOKUP hanya fallback.

#### C. IF / IFS — logika bercabang

Sintaks:
```
=IF(logical_test; value_if_true; value_if_false)
=IFS(logical_test1; value1; [logical_test2; value2]; ...; TRUE; value_default)
```

- IF untuk 2 cabang. Maksimal 2 level IF bersarang; lebih dari itu WAJIB pakai IFS atau tabel referensi + XLOOKUP.
- IFS dievaluasi dari atas ke bawah; baris terakhir `TRUE; ...` berfungsi sebagai default/else — tanpanya muncul `#N/A` saat tidak ada kondisi yang cocok.

Kapan dipakai: kategorisasi, grading, status (lunas/belum, aktif/nonaktif).

Contoh nyata — status pembayaran berdasarkan kolom D (nominal) dan E (terbayar):
```
=IFS(E2>=D2; "Lunas"; E2>0; "Sebagian"; TRUE; "Belum bayar")
```

#### D. Fungsi TEXT dan DATE — format dan olah tanggal/teks

Fungsi inti:
```
=TEXT(value; "format_text")        → ubah angka/tanggal jadi teks berformat
=DATE(tahun; bulan; hari)          → bangun tanggal dari 3 angka
=YEAR(tgl); MONTH(tgl); DAY(tgl)   → pecah tanggal
=EOMONTH(tgl; 0)                   → tanggal terakhir bulan berjalan
=TEXTJOIN("; "; TRUE; range)       → gabung teks, lewati sel kosong
```

Kapan dipakai: membuat label periode ("Jan-2026"), menggabungkan kolom, mengekstrak bulan/tahun untuk rekap, membangun tanggal dari kolom terpisah.

Contoh nyata — buat kolom periode "mmm-yyyy" dari tanggal di A2 untuk bahan PivotTable:
```
=TEXT(A2; "mmm-yyyy")
```
Hasil: `Jan-2026`, `Feb-2026`, dst.

Contoh nyata — gabungkan nama depan (B2) dan belakang (C2) dengan satu spasi, abaikan yang kosong:
```
=TEXTJOIN(" "; TRUE; B2:C2)
```

Peringatan: hasil `TEXT` adalah TEKS, bukan angka/tanggal asli. Jangan pakai hasil `TEXT` untuk perhitungan lanjutan — simpan kolom tanggal asli untuk hitungan, kolom `TEXT` hanya untuk label/tampilan.

#### E. COUNTIFS — menghitung dengan banyak kriteria

Sintaks:
```
=COUNTIFS(criteria_range1; criteria1; [criteria_range2; criteria2]; ...)
```

- Tidak ada `sum_range`; semua argumen adalah pasangan range + kriteria.
- Kriteria teks bisa pakai wildcard: `"*batal*"` (mengandung), `"<>*"` (tidak kosong).

Kapan dipakai: menghitung jumlah baris yang memenuhi syarat (jumlah order pending, jumlah karyawan per divisi, jumlah transaksi di atas nominal tertentu).

Contoh nyata — hitung order berstatus "Pending" dengan nominal > 1.000.000 (kolom D=status, C=nominal):
```
=COUNTIFS(D2:D1000; "Pending"; C2:C1000; ">1000000")
```

Pasangan dengan SUMIFS: kalau pengguna butuh "berapa banyak DAN berapa total", buat dua formula berdampingan — `COUNTIFS` untuk jumlah, `SUMIFS` untuk total — dengan kriteria yang sama.

### 3.2 Formula debugging & optimization

#### Prosedur debug (jalankan berurutan)

1. **Identifikasi error.** Baca kode errornya:
   - `#N/A` → lookup gagal. Cek: nilai lookup ada di tabel? Ada spasi tersembunyi? Tipe data sama (teks vs angka)? Solusi: bungkus dengan `if_not_found` di XLOOKUP, atau bersihkan data dengan `TRIM`.
   - `#VALUE!` → tipe data salah. Cek: menjumlahkan teks? Range tidak sejajar di SUMIFS? Tanggal tersimpan sebagai teks? Solusi: samakan tipe data, pakai `VALUE()` atau `DATEVALUE()` untuk konversi.
   - `#REF!` → referensi hilang. Penyebab: kolom/baris yang dirujuk dihapus. Solusi: jangan hapus kolom yang dirujuk formula; pakai tabel terstruktur (nama kolom tidak rusak saat kolom dipindah).
   - Circular reference → formula merujuk ke selnya sendiri langsung/tidak langsung. Excel menampilkan peringatan di status bar. Solusi: telusuri rantai dengan Trace Precedents, putus rantai yang salah.
   - `#DIV/0!` → pembagi nol/kosong. Solusi: `=IF(penyebut=0; 0; pembilang/penyebut)`.
2. **Evaluate formula langkah per langkah.** Di Excel: tab Formulas → Evaluate Formula → klik Evaluate berulang untuk melihat hasil tiap sub-ekspresi. Fokus pada sub-ekspresi PERTAMA yang menghasilkan error — itulah akar masalahnya.
3. **Trace Precedents/Dependents.** Formulas → Trace Precedents (panah ke sel sumber) dan Trace Dependents (panah ke sel yang memakai sel ini). Pakai ini untuk circular reference dan untuk memastikan range SUMIFS/COUNTIFS sejajar.
4. **Cek jebakan tak terlihat.** Urutan cek cepat: spasi di awal/akhir teks (`TRIM`), angka tersimpan sebagai teks (ikon segitiga hijau — konversi dengan Text to Columns), format tanggal beda region, sel "kosong" berisi `""` dari formula (terdeteksi oleh `COUNTA` tapi bukan benar-benar kosong).

#### Prosedur optimasi

1. **Ganti fungsi volatil.** `INDIRECT` dan `OFFSET` dihitung ulang SETIAP ada perubahan di sheet mana pun → file lambat. Ganti:
   - `OFFSET` untuk range dinamis → pakai tabel terstruktur (`Tabel1[Kolom]`) atau `INDEX` (non-volatil).
   - `INDIRECT` untuk sheet dinamis → pertimbangkan `CHOOSE` + referensi langsung, atau XLOOKUP ke tabel pemetaan.
2. **Ubah range penuh kolom menjadi tabel terstruktur.** `SUMIFS(C:C; ...)` memaksa Excel memindai 1 juta+ baris. Langkahnya:
   - Pilih data → Ctrl+T → centang "My table has headers".
   - Ganti formula: `=SUMIFS(C:C; B:B; "Bandung")` menjadi `=SUMIFS(TabelTransaksi[Nominal]; TabelTransaksi[Cabang]; "Bandung")`.
   - Keuntungan: otomatis ikut baris baru, nama kolom terbaca, tidak rusak saat kolom disisipkan/dihapus.
3. **Kurangi formula berulang.** Jika kolom helper dipakai 3+ kali dalam formula lain, pastikan helper dihitung sekali di kolomnya sendiri, bukan diulang inline di tiap formula.

Kriteria selesai optimasi: tidak ada lagi `INDIRECT`/`OFFSET`, tidak ada range penuh kolom (`A:A`) di formula inti, semua data utama sudah jadi tabel terstruktur.

### 3.3 Data quality audit automation

Jalankan audit dalam urutan berikut. Catat setiap temuan ke format laporan di akhir bagian ini.

**Checklist audit:**

1. **Duplikat.** Pilih kolom kunci (mis. NIP, kode transaksi) → Data → Remove Duplicates untuk hitung, atau conditional formatting → Highlight Duplicates untuk tandai dulu. Formula alternatif: `=COUNTIFS($A$2:$A$1000; A2)>1` di kolom helper → TRUE berarti duplikat. Catat: jumlah baris duplikat dan contoh nilainya.
2. **Sel kosong (blank).** `=COUNTBLANK(range)` per kolom penting. Blank di kolom kunci (ID, tanggal, nominal) = temuan kritis. Bedakan sel benar-benar kosong vs `""` hasil formula — yang kedua tidak tertangkap COUNTBLANK; deteksi dengan `=A2=""`.
3. **Tipe data salah.** Cek kolom angka: `=COUNT(range)` vs `=COUNTA(range)` — selisihnya = sel berisi teks di kolom angka. Cek kolom tanggal: filter manual — tanggal valid rata kanan dan bisa di-sort kronologis; teks mirip tanggal rata kiri. Perbaiki dengan Text to Columns (pilih format yang benar) atau `VALUE()`/`DATEVALUE()`.
4. **Outlier.** Untuk kolom numerik: hitung `MIN`, `MAX`, `AVERAGE`, `STDEV`. Tandai nilai di luar `AVERAGE ± 3*STDEV` sebagai outlier kandidat. Konfirmasi ke pengguna sebelum menghapus — outlier bisa jadi data valid (transaksi besar) atau salah input (kelebihan nol).
5. **Konsistensi teks.** `=UNIQUE(range)` pada kolom kategori (status, cabang, divisi) untuk menemukan varian ejaan: "Jakarta", "jakarta", "JAKARTA ", "Jkt". Standarkan dengan `TRIM` + `PROPER`/`UPPER`, lalu Data Validation (lihat di bawah) agar tidak terulang.

**Conditional formatting rules (siap pakai):**

- Duplikat di kolom kunci: Home → Conditional Formatting → Highlight Cells Rules → Duplicate Values (warna merah muda).
- Blank di kolom wajib: pilih kolom → New Rule → "Format only cells that contain" → Blanks → isi kuning.
- Outlier numerik: New Rule → "Use a formula" → `=ABS(C2-AVERAGE(C$2:C$1000))>3*STDEV(C$2:C$1000)` → isi oranye. Sesuaikan `C` dengan kolom angka.
- Tanggal kedaluwarsa/lewat jatuh tempo: `=A2<TODAY()` → font merah.

**Data validation (pencegahan):**

- Kolom kategori: Data → Data Validation → Allow: List → Source: daftar nilai baku (mis. `Aktif;Nonaktif;Cuti`). Aktifkan "Ignore blank" sesuai kebutuhan, dan set Error Alert style Stop untuk kolom kritis.
- Kolom angka: Allow: Decimal/Whole number → antara min–maks yang wajar (mis. nominal 0–1.000.000.000).
- Kolom tanggal: Allow: Date → antara rentang wajar (mis. 01/01/2020–31/12/2030).
- Selalu isi Input Message singkat ("Pilih dari daftar") agar pengisi data paham.

**Format laporan hasil audit:**

Tulis laporan dengan struktur ini setiap kali audit selesai:

```
AUDIT KUALITAS DATA — [nama file/sheet]
Tanggal audit: [DD/MM/YYYY]
Ruang lingkup: [sheet + range, mis. Sheet "Transaksi" A1:F5230]

RINGKASAN: [n] temuan — [n] kritis, [n] sedang, [n] ringan.

TEMUAN:
1. [Kritis/Sedang/Ringan] — [jenis: Duplikat/Blank/Tipe data/Outlier/Konsistensi]
   Lokasi: [kolom/sheet, mis. kolom C "Nominal", baris 120–125]
   Detail: [apa yang ditemukan, mis. 14 baris duplikat kode TRX-2026-0081]
   Dampak: [mis. total SUMIFS kelebihan Rp2,4 jt]
   Perbaikan: [sudah diperbaiki / butuh keputusan pengguna]

REKOMENDASI PENCEGAHAN:
- [mis. pasang Data Validation List di kolom Status]
```

Klasifikasi: Kritis = mengubah hasil hitungan/laporan. Sedang = data tidak konsisten tapi hitungan aman. Ringan = kosmetik (spasi, kapitalisasi).

## 4. Contoh singkat

**Skenario nyata:** Pengguna mengirim file `penjualan_2026.xlsx`, sheet "Data" (kolom A=tanggal, B=cabang, C=produk, D=qty, E=harga), dan meminta: "Total penjualan per cabang bulan September, plus cek apakah datanya bersih."

**Input:** file dengan 4.800 baris, tanpa tabel terstruktur, ada error `#N/A` di kolom F.

**Proses:**
1. Audit cepat: `=COUNTBLANK(B2:B4801)` → 0 blank di cabang. `=COUNT(E2:E4801)` vs `=COUNTA(E2:E4801)` → 37 sel harga berisi teks (tipe data salah) → perbaiki via Text to Columns. `=UNIQUE(B2:B4801)` → ditemukan "Bandung " (dengan spasi) → `TRIM` massal.
2. Debug kolom F: `#N/A` dari `VLOOKUP` tanpa `if_not_found` — 12 kode produk tidak ada di sheet Master → ganti ke `=XLOOKUP(C2; Master!A:A; Master!B:B; "Kode tidak terdaftar")`.
3. Optimasi: Ctrl+T jadikan `TabelJual`; formula rekap September per cabang (mis. di sheet "Rekap", A2=nama cabang):
   ```
   =SUMIFS(TabelJual[Harga]; TabelJual[Cabang]; A2; TabelJual[Tanggal]; ">=01/09/2026"; TabelJual[Tanggal]; "<=30/09/2026")
   ```
   Catatan: karena kolom E=harga satuan dan D=qty, total omzet yang benar memakai kolom helper `=D2*E2` (kolom "Omzet") lalu SUMIFS ke kolom Omzet.
4. Pasang Data Validation List di kolom B (daftar cabang baku) agar varian ejaan tidak muncul lagi.

**Output:** sheet "Rekap" berisi total omzet September per cabang + laporan audit singkat (3 temuan: 37 harga bertipe teks — diperbaiki; 1 varian ejaan cabang — diperbaiki; 12 kode produk tak terdaftar — butuh keputusan pengguna) + rekomendasi Data Validation.

## 5. Anti-pattern

- **Jangan** menumpuk IF lebih dari 2 level — pakai IFS atau tabel referensi + XLOOKUP.
- **Jangan** memakai VLOOKUP tanpa argumen ke-4 `FALSE`; dan jangan pakai VLOOKUP sama sekali jika XLOOKUP tersedia.
- **Jangan** membiarkan `#N/A`/`#VALUE!` mentah di output yang dilihat pengguna — selalu tangani dengan `if_not_found`, `IFERROR`/`IFNA`, atau perbaiki akarnya.
- **Jangan** memakai `INDIRECT`/`OFFSET` atau range penuh kolom (`A:A`, `C:C`) di file besar — ganti dengan tabel terstruktur atau `INDEX`.
- **Jangan** menghapus duplikat atau outlier tanpa mencatat jumlah dan contohnya di laporan audit — pengguna harus tahu apa yang berubah.
- **Jangan** mengubah tipe data kolom (teks→angka, teks→tanggal) tanpa verifikasi hasil konversi pada sampel baris.
- **Jangan** memakai hasil `TEXT()` untuk perhitungan lanjutan — itu teks, bukan angka.
- **Jangan** menebak format tanggal region (MM/DD vs DD/MM) — konfirmasi atau cek dari data yang jelas dulu.
- **Jangan** mengerjakan file tanpa menyimpan versi sebelum perubahan massal (Remove Duplicates, Text to Columns) — satu langkah salah bisa merusak ribuan baris tanpa jejak.
