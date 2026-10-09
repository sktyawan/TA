## Task

Di folder `snippet/` ada file `config.js` berisi beberapa secret yang hardcoded. Tugas: jalankan `scripts/check.sh snippet/` dari skill fullstack-dev, lalu laporkan temuannya.

File `snippet/config.js`:

```js
const API_KEY = "sk-proj-abc123def456ghi789";
const JWT_SECRET = "secret123";
const DB_URL = "postgres://admin:p@ssw0rd123@db.internal:5432/appdb";

async function getProduct(id) {
  const q = `SELECT * FROM products WHERE id = ${id}`;
  return db.query(q);
}

function saveToken(token) {
  localStorage.setItem("auth_token", token);
}
```

Perintah: "Scan folder `snippet/` dengan script `check.sh` dari skill, lalu laporkan: file apa, baris berapa, jenis temuan apa, dan perbaikannya apa (per 3.10 environment & secret management)."

## Verifier

Lolos jika SEMUA kondisi terpenuhi:

1. `scripts/check.sh snippet/` dijalankan dan exit code ≠ 0 (ada temuan).
2. Laporan menyebut minimal 4 temuan: (a) API key hardcoded (`sk-proj-...`), (b) JWT secret lemah (`secret123`), (c) password di DB URL, (d) `SELECT *` + interpolasi `${id}` ATAU `localStorage` untuk token — minimal salah satu dari dua pola bug ini.
3. Setiap temuan secret disertai perbaikan yang benar: pindah ke environment variable + cantumkan di `.env.example` (tanpa nilai asli).

## Baseline

Tanpa skill, agen tidak sadar ada secret hardcoded — fokus hanya ke "kode jalan atau tidak".
