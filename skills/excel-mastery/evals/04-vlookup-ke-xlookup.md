## Task

Formula VLOOKUP berikut berbahaya (tanpa argumen ke-4) dan ketinggalan zaman. Modernkan ke XLOOKUP.

```
=VLOOKUP(F2; Master!A2:B501; 2)
```

Konteks: F2 = kode produk, sheet "Master" kolom A = kode, kolom B = nama produk. File dibuka di Excel modern (XLOOKUP tersedia).

Perintah: "Ganti VLOOKUP ini dengan XLOOKUP yang benar: cocok persis, tangani kode yang tidak terdaftar, dan amankan range agar tidak bergeser saat di-fill down."

Aturan dari SKILL.md: XLOOKUP selalu diutamakan; `if_not_found` diisi agar tidak muncul `#N/A` mentah; kunci `$` WAJIB pada `lookup_array` dan `return_array`; `lookup_value` dibiarkan relatif.

## Verifier

Lolos jika SEMUA kondisi terpenuhi (cek string deterministik):

1. Output memakai fungsi `XLOOKUP` — tidak ada lagi `VLOOKUP`.
2. `lookup_array` dan `return_array` memakai referensi terkunci `$` (mis. `Master!$A$2:$A$501` dan `Master!$B$2:$B$501`) ATAU referensi tabel terstruktur (mis. `TabelMaster[Kode]`).
3. Argumen `if_not_found` terisi (teks apa pun yang jelas, mis. `"Kode tidak terdaftar"`).
4. `lookup_value` tetap relatif (`F2`, tanpa `$`) agar aman di-fill down.

## Baseline

Tanpa skill, agen hanya menambahkan `FALSE` menjadi `=VLOOKUP(F2; Master!A2:B501; 2; FALSE)` — pencocokan kira-kira hilang tapi formula tetap rapuh (tanpa `$`, tanpa penanganan `#N/A`).
