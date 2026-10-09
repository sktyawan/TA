# Eval 01 — Validasi batch data karyawan baru

## Task

HR menyerahkan 4 data karyawan baru untuk divalidasi sebelum didaftarkan ke BPJS (tanggal validasi: 08-10-2026). Terapkan playbook validasi skill ini (NIK 16 digit → nama → BPJS), lalu susun laporan batch dengan format yang ditentukan skill.

Data:

1. Andi Pratama | NIK 3273011505900001 | lahir 15-05-1990 | BPJS Kes 0001234567890 | KPJ 12345678901 | mulai kerja 01-10-2026
2. Siti Rahayu | NIK 3273025508920002 | lahir 15-08-1992 | BPJS Kes 000123456789 | KPJ 12345678902 | mulai kerja 01-10-2026
3. Budi Hartono@ | NIK 3273031203850001 | lahir 12-03-1985 | BPJS Kes 0001234567893 | KPJ 12345678903 | mulai kerja 01-10-2026
4. Dewi Anggraini | NIK 3273011505900001 | lahir 15-05-1990 | BPJS Kes 0001234567894 | KPJ 12345678904 | mulai kerja 01-10-2026

## Verifier

LOLOS jika SEMUA terpenuhi, GAGAL jika satu saja gagal:

1. Baris 1 = VALID di ketiga cek (NIK/nama/BPJS); jenis kelamin terdeteksi L; tanggal lahir terdeteksi 15-05-1990 (cocok dengan data).
2. Baris 2 = TIDAK VALID: nama setelah trim valid, NIK valid (P, 15-08-1992 terdeteksi cocok), TAPI BPJS Kes TIDAK VALID karena 12 digit — ditulis eksplisit "panjang 12 digit (kurang 1)" atau setara. Kesimpulan baris TIDAK VALID.
3. Baris 3 = TIDAK VALID: nama TIDAK VALID karena mengandung simbol `@` ("kemungkinan salah ketik") — dan agen TIDAK menghapus simbolnya sendiri (tidak menulis nama "Budi Hartono" tanpa @ sebagai hasil perbaikan).
4. Baris 4 = TIDAK VALID karena duplikat NIK baris 1 — ditulis eksplisit "duplikat NIK baris 1", dan agen TIDAK memilih salah satunya sendiri (tidak menyatakan baris 1 atau 4 yang benar).
5. Tidak ada digit NIK yang ditebak/ditambahkan di baris manapun.
6. Laporan ditutup dengan blok REKAP: 4 baris diproses — 1 VALID, 3 TIDAK VALID, plus daftar tindak lanjut berprioritas dengan PIC dan tenggat.

## Baseline

Tanpa skill: output biasanya daftar "semua data OK" yang dangkal, atau malah "memperbaiki" NIK 15 digit dengan menebak digit yang hilang, tanpa format laporan baku.
