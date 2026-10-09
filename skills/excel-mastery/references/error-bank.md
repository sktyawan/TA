# Bank Contoh Error Nyata — referensi excel-mastery

Dipakai dari SKILL.md. Kumpulan contoh benar-vs-salah dan kasus debug nyata; SKILL.md hanya memuat aturan ringkasnya.

## Daftar isi

1. [XLOOKUP: benar vs salah](#xlookup-benar-vs-salah)
2. [Kasus nyata: file penjualan_2026.xlsx](#kasus-nyata-file-penjualan_2026xlsx)
3. [Kasus debug per kode error](#kasus-debug-per-kode-error)

## XLOOKUP: benar vs salah

Cari harga, kunci di A2:A501 sheet Order, master di sheet "Master" A2:C501.

BENAR — range dikunci, fill down aman:
```
=XLOOKUP(A2; Master!$A$2:$A$501; Master!$C$2:$C$501; "Tidak ada")
```

SALAH — tanpa `$`, di-drag ke B3 range menjadi `Master!A3:A502`, ke B500 menjadi `Master!A500:A999` → hasil salah diam-diam:
```
=XLOOKUP(A2; Master!A2:A501; Master!C2:C501; "Tidak ada")
```

SALAH — range penuh kolom di file 500+ baris (melanggar aturan optimasi, Excel memindai 1 juta baris):
```
=XLOOKUP(A2; Master!A:A; Master!C:C; "Tidak ada")
```

SALAH — maksud "ambil data terakhir", tapi memakai match_mode bukan search_mode (`-1` di sini artinya "cocok persis atau nilai lebih kecil", bukan "cari dari bawah"):
```
=XLOOKUP(A2; Mutasi!$A$2:$A$501; Mutasi!$C$2:$C$501; "Tidak ada"; -1)
```
BENAR:
```
=XLOOKUP(A2; Mutasi!$A$2:$A$501; Mutasi!$C$2:$C$501; "Tidak ada"; 0; -1)
```

SALAH — binary search di data yang tidak terurut (hasil ngawur tanpa peringatan):
```
=XLOOKUP(A2; Master!$A$2:$A$501; Master!$C$2:$C$501; "Tidak ada"; 0; 2)
```
BENAR (data acak → kosongkan keduanya):
```
=XLOOKUP(A2; Master!$A$2:$A$501; Master!$C$2:$C$501; "Tidak ada")
```

## Kasus nyata: file penjualan_2026.xlsx

**Input:** file `penjualan_2026.xlsx`, sheet "Data" (A=tanggal, B=cabang, C=produk, D=qty, E=harga), 4.800 baris, tanpa tabel terstruktur, ada `#N/A` di kolom F. Permintaan: "Total penjualan per cabang bulan September, plus cek apakah datanya bersih."

**Proses:**
1. Audit cepat: `=COUNTBLANK(B2:B4801)` → 0 blank di cabang. `=COUNT(E2:E4801)` vs `=COUNTA(E2:E4801)` → 37 sel harga berisi teks (tipe data salah) → perbaiki via Text to Columns. `=UNIQUE(B2:B4801)` → ditemukan "Bandung " (dengan spasi) → `TRIM` massal.
2. Debug kolom F: `#N/A` dari `VLOOKUP` tanpa `if_not_found` — 12 kode produk tidak ada di sheet Master → ganti ke `=XLOOKUP(C2; TabelMaster[Kode]; TabelMaster[Nama]; "Kode tidak terdaftar")` (sheet Master sudah dijadikan tabel `TabelMaster` via Ctrl+T).
3. Optimasi: Ctrl+T jadikan `TabelJual`; kolom helper "Omzet" `=D2*E2` (qty × harga satuan); formula rekap September per cabang (sheet "Rekap", A2=nama cabang):
   ```
   =SUMIFS(TabelJual[Omzet]; TabelJual[Cabang]; A2; TabelJual[Tanggal]; ">="&DATE(2026;9;1); TabelJual[Tanggal]; "<"&DATE(2026;10;1))
   ```
4. Pasang Data Validation List di kolom B (daftar cabang baku) agar varian ejaan tidak muncul lagi.

**Output:** sheet "Rekap" berisi total omzet September per cabang + laporan audit (3 temuan: 37 harga bertipe teks — diperbaiki; 1 varian ejaan cabang — diperbaiki; 12 kode produk tak terdaftar — butuh keputusan pengguna) + rekomendasi Data Validation.

## Kasus debug per kode error

**`#N/A` dari VLOOKUP tanpa argumen ke-4.** Gejala: sebagian baris `#N/A` padahal kodenya ada di master. Akar: `=VLOOKUP(F2; Master!A2:B500; 2)` tanpa `FALSE` → pencocokan kira-kira di data tidak terurut. Perbaikan: `=XLOOKUP(F2; Master!$A$2:$A$500; Master!$B$2:$B$500; "Kode tidak terdaftar")`.

**`#VALUE!` dari SUMIFS tidak sejajar.** Gejala: `=SUMIFS(C2:C1000; B2:B999; "Bandung")` → `#VALUE!`. Akar: `C2:C1000` (999 baris) vs `B2:B999` (998 baris). Perbaikan: samakan menjadi `B2:B1000`.

**Total 0 diam-diam dari kriteria tanggal teks.** Gejala: `=SUMIFS(C2:C1000; A2:A1000; ">=01/09/2026")` menghasilkan 0 padahal data ada. Akar: teks tanggal dibaca sesuai format region sistem; di sistem MM/DD/YYYY, "01/09/2026" dibaca 9 Januari, bukan 1 September. Perbaikan: `">="&DATE(2026;9;1)`.

**File lambat dari INDIRECT.** Gejala: file 20 ribu baris butuh 10 detik tiap edit. Akar: 3 kolom memakai `=INDIRECT("'"&A2&"'!B5")`. Perbaikan: ganti dengan XLOOKUP ke tabel pemetaan sheet, atau `CHOOSE` + referensi langsung.

**Circular reference tersembunyi.** Gejala: Excel menampilkan peringatan circular di status bar, total tidak update. Akar: sel total `=SUM(C2:C101)` ditulis di C102... tidak — ditulis di C50 di tengah range (`=SUM(C2:C100)` di sel C50). Telusuri dengan Trace Precedents, pindahkan formula total ke luar range.
