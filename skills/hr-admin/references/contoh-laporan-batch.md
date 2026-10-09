# Contoh Laporan Batch Validasi (5 baris)

Memakai format keputusan per baris dari SKILL.md §3 (NIK | Nama | Status | Detail | L/P + tanggal lahir terdeteksi | TINDAKAN), ditutup blok REKAP.

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
