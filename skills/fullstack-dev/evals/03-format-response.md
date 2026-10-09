## Task

Perbaiki Express handler berikut agar ikut standar skill. Simpan sebagai `products-fixed.js`.

File `products-buggy.js`:

```js
app.get('/api/products/:id', async (req, res) => {
  try {
    const p = await db.query(`SELECT * FROM products WHERE id = ${req.params.id}`);
    res.json(p.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.stack });
  }
});
```

Perintah: "Perbaiki handler ini: pakai format response JSON standar (3.6), query parameterized (3.9b), jangan bocorkan detail teknis ke client (anti-pattern 3), dan tangani kasus produk tidak ditemukan (404)."

## Verifier

Lolos jika SEMUA kondisi terpenuhi (cek dengan `grep`, deterministik):

1. Tidak ada `e.stack`, `err.stack`, atau `.stack` di file hasil.
2. Tidak ada `SELECT *` (case-insensitive) di file hasil — kolom disebut eksplisit.
3. Tidak ada interpolasi `${...}` di dalam string query SQL (query parameterized, mis. `$1`).
4. File hasil memuat pola `success` bernilai `true` untuk kasus sukses (key boleh dikutip atau tidak, mis. `"success": true` atau `success: true`) dan `NOT_FOUND` untuk kasus 404.
5. Ada penanganan `id` tidak valid (400 `VALIDATION_ERROR`) atau minimal komentar bahwa validasi ditangani middleware — salah satu harus ada.

## Baseline

Tanpa skill, agen hanya membetulkan error syntax tanpa menstandarkan format response — stack trace tetap bocor ke client dan query tetap rentan SQL injection.
