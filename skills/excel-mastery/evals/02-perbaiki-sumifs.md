## Task

Formula berikut punya DUA bug: range tidak sejajar dan kriteria tanggal ditulis sebagai teks. Perbaiki.

```
=SUMIFS(C2:C1000; B2:B999; "Bandung"; A2:A1000; ">=01/01/2026")
```

Konteks: kolom A = tanggal, B = cabang, C = nominal. Maksud: total nominal cabang "Bandung" untuk bulan Januari 2026.

Perintah: "Betulkan formula ini supaya range sejajar dan kriteria tanggal tidak bergantung format tanggal sistem."

Aturan dari SKILL.md: semua range SUMIFS harus punya jumlah baris yang sama; tanggal jangan ditulis sebagai teks — pakai `">="&DATE(tahun;bulan;hari)` dan batas atas `"<"&` tanggal awal bulan berikutnya.

## Verifier

Lolos jika SEMUA kondisi terpenuhi (cek string deterministik):

1. Ketiga range berakhir di baris yang sama: `C2:C1000`, `B2:B1000`, `A2:A1000` (tidak ada lagi `B2:B999`).
2. Kriteria tanggal memakai `DATE(2026;1;1)` — tidak ada teks tanggal seperti `">=01/01/2026"` atau `">=1/1/2026"`.
3. Ada batas atas bulan: `"<"&DATE(2026;2;1)` (atau pola ekuivalen yang benar, mis. `"<= "&` akhir bulan via EOMONTH — tetapi pola baku skill adalah `"<"&DATE(2026;2;1)`).
4. Kriteria cabang `"Bandung"` tetap ada dan tidak berubah.

## Baseline

Tanpa skill, agen hanya membetulkan ejaan "Bandung" dan tidak melihat range yang tidak sejajar — hasil `#VALUE!` atau total yang salah tetap terjadi.
