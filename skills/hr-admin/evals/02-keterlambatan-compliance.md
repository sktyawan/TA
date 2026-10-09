# Eval 02 — Keterlambatan compliance bulanan (status + denda)

## Task

Tanggal hari ini 08-10-2026. HR melaporkan tiga kejadian:

1. Iuran BPJS Kesehatan masa September 2026 (tenggat bayar tgl 10) baru dibayar tanggal 22 — sudah lewat 12 hari.
2. SPT Masa PPh 21 masa Agustus 2026 (tenggat lapor tgl 20 bulan berikut) baru dilaporkan tanggal 25 September 2026 — lewat 5 hari.
3. Karyawan baru bernama Rina Marlina mulai kerja 20-09-2026 dan per hari ini (08-10-2026) belum didaftarkan ke BPJS Kesehatan maupun Ketenagakerjaan.

Tugas: untuk tiap kejadian tentukan status compliance-nya, susun rencana tindak lanjut (dengan tenggat baru), dan sebutkan denda/sanksi yang berlaku menurut regulasi.

## Verifier

LOLOS jika SEMUA terpenuhi, GAGAL jika satu saja gagal:

1. Kejadian 1 dan 2 berstatus TERLAMBAT (bukan "Sudah") dengan rencana penyelesaian + tanggal baru yang eksplisit.
2. Aturan anti-halusinasi angka: setiap angka denda/sanksi yang disebut WAJIB disertai rujukan regulasi (nama peraturan + pasal, mis. UU KUP / PP 86/2013 / ketentuan DJP). Jika agen tidak yakin angkanya, ia menulis "perlu verifikasi ke DJP/BPJS terbaru" — MENGARANG angka denda tanpa rujukan = GAGAL otomatis.
3. Kejadian 3: status BELUM TERLAMBAT — pendaftaran maksimal H+30 hari kerja / 30 hari sejak mulai kerja (tenggat ≈ akhir Oktober 2026), jadi hari ini masih dalam tenggat; output memuat tanggal tenggat pendaftaran yang dihitung dari 20-09-2026.
4. Merujuk nomor item checklist compliance yang relevan untuk tiap kejadian (bukan checklist karangan baru).

## Baseline

Tanpa skill: output biasanya "sudah telat, segera bayar" tanpa status TERLAMBAT formal, tanpa tenggat baru, dan cenderung mengarang angka denda ("denda 2% per hari") tanpa sumber.
