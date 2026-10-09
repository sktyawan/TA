## Task

Dua formula XLOOKUP di bawah SALAH memakai `match_mode`/`search_mode` (tertukar — ini koreksi yang pernah diminta Seti). Perbaiki keduanya.

**Kasus 1 — maksud: ambil harga TERAKHIR untuk tiap kode** (sheet "Mutasi" mencatat perubahan harga dari waktu ke waktu, satu kode bisa muncul berkali-kali, baris bawah = data terbaru). Formula yang ditulis:

```
=XLOOKUP(A2; Mutasi!$A$2:$A$501; Mutasi!$C$2:$C$501; "Tidak ada"; -1)
```

**Kasus 2 — binary search di data acak** (sheet "Master", kolom A tidak terurut). Formula yang ditulis:

```
=XLOOKUP(A2; Master!$A$2:$A$501; Master!$C$2:$C$501; "Tidak ada"; 0; 2)
```

Perintah: "Betulkan argumen `match_mode`/`search_mode` pada kedua formula sesuai maksudnya. Jelaskan satu kalimat per formula: kenapa versi lama salah diam-diam."

Aturan dari SKILL.md: `match_mode` mengatur JENIS pencocokan (bukan arah); `search_mode` -1 = cari dari bawah; binary search (2/-2) WAJIB data terurut; kalau ragu, kosongkan keduanya.

## Verifier

Lolos jika SEMUA kondisi terpenuhi (cek string deterministik):

1. Formula kasus 1 menjadi `=XLOOKUP(A2; Mutasi!$A$2:$A$501; Mutasi!$C$2:$C$501; "Tidak ada"; 0; -1)` — `search_mode` = -1 (cari dari bawah = ambil baris terakhir), `match_mode` = 0.
2. Formula kasus 1 memiliki 6 argumen dengan argumen ke-5 = `0` — TIDAK lagi memakai `-1` sebagai `match_mode` (argumen ke-5). Cek deterministik: pecah argumen level-teratas → jumlah 6, argumen ke-5 `0`, argumen ke-6 `-1`.
3. Formula kasus 2 TIDAK lagi memakai `search_mode` 2 — menjadi `=XLOOKUP(A2; Master!$A$2:$A$501; Master!$C$2:$C$501; "Tidak ada")` (default cocok persis dari atas, tidak butuh sortir) ATAU tetap binary search hanya jika disertai bukti data sudah diurutkan.
4. Penjelasan menyebut bahwa kedua versi lama menghasilkan jawaban salah TANPA error (bug diam-diam).

## Baseline

Tanpa skill, agen mengira `match_mode` -1 = "cari dari bawah" dan membiarkan binary search di data acak — hasilnya salah tanpa peringatan.
