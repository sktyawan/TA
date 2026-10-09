# Template Master Data Karyawan (Excel)

## Urutan kolom standar (tetap, jangan diubah)

`No | NIK (16 digit, format Text) | Nama Lengkap | Jenis Kelamin (L/P) | Tanggal Lahir (DD-MM-YYYY) | No. BPJS Kesehatan (13 digit, Text) | No. KPJ (11 digit, Text) | Tanggal Mulai Kerja | Status Kontrak (PKWTT/PKWT) | Tanggal Akhir Kontrak | Jabatan | Departemen | Status Karyawan (Aktif/Resign/Cuti)`

## Aturan entry

- Kolom NIK, No. BPJS, dan No. KPJ selalu diformat sebagai **Text** sebelum diisi agar angka 0 di depan tidak hilang.
- Tanggal selalu format `DD-MM-YYYY`, bukan format teks bebas.
- Tidak ada baris kosong di tengah data; tidak ada merge cell di area data.

## Rekonsiliasi antar sheet

1. Kolom kunci: NIK (prioritas utama). Jika NIK kosong/tidak valid, pakai kombinasi Nama + Tanggal Lahir sebagai kunci cadangan dan tandai barisnya.
2. Gunakan `XLOOKUP` (atau `VLOOKUP` bila versi Excel lama) untuk menarik data pembanding dari sheet referensi ke sheet kerja.
3. Bandingkan field kritis: nama, status karyawan, tanggal mulai/akhir kontrak, nomor BPJS.
4. Baris yang tidak ketemu pasangannya di sheet referensi → `TIDAK ADA DI REFERENSI`; perbedaan nilai → `MISMATCH: <nama kolom>`.

## Conditional formatting anomali (aturan tetap di file master)

- NIK dengan panjang ≠ 16 atau mengandung non-digit → sel merah muda.
- Tanggal Akhir Kontrak ≤ 30 hari dari hari ini dan Status = PKWT → sel kuning (peringatan).
- Tanggal Akhir Kontrak sudah lewat dan Status masih Aktif → sel merah (wajib tindak lanjut).
- Duplikat NIK dalam satu kolom → sel oranye.
- Sel kosong pada kolom wajib (NIK, Nama, Tanggal Mulai Kerja) → sel abu-abu bergaris.
