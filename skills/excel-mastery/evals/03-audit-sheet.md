## Task

Audit file `fixtures/audit_fixture.xlsx` (sheet "Data") memakai prosedur audit di SKILL.md bagian 3.3. Script `scripts/validate.py` boleh dipakai sebagai pemindai awal, tetapi laporan akhir harus mengikuti format laporan audit baku skill.

Isi sheet "Data" (dibuat untuk eval ini): kolom A = Kode Transaksi (kunci), B = Cabang, C = Nominal, D = Tanggal. Data mengandung error yang disengaja: duplikat kunci, blank di kolom kunci, angka tersimpan sebagai teks, varian ejaan cabang.

Perintah: "Audit sheet ini dan tulis laporan hasil audit sesuai format baku: RINGKASAN (jumlah temuan + klasifikasi kritis/sedang/ringan), TEMUAN (lokasi, detail, dampak, perbaikan), dan REKOMENDASI PENCEGAHAN."

## Verifier

Lolos jika SEMUA kondisi terpenuhi:

1. Laporan memuat bagian RINGKASAN, TEMUAN, dan REKOMENDASI PENCEGAHAN.
2. Laporan menemukan minimal 4 jenis temuan yang benar: (a) duplikat kode transaksi — jumlahnya tepat (cek dengan `=COUNTIFS` / validate.py); (b) blank di kolom kunci A — jumlahnya tepat; (c) nominal bertipe teks — jumlahnya tepat; (d) varian ejaan cabang ("Bandung " dengan spasi, "bandung" huruf kecil) — disebut eksplisit.
3. Setiap temuan diklasifikasikan (Kritis/Sedang/Ringan) dengan benar: blank di kolom kunci = Kritis, duplikat kunci = Kritis, nominal teks = Kritis (mengubah hasil hitungan), varian ejaan = Sedang.
4. Rekomendasi pencegahan menyebut Data Validation untuk kolom Cabang.

## Baseline

Tanpa skill, agen hanya melihat sekilas isi sheet dan bilang "datanya kelihatan oke" — tidak ada satu pun error yang ditemukan.
