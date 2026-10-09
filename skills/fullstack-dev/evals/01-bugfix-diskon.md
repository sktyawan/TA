## Task

Di repo ada file `cart.js` berisi fungsi yang salah hitung. Perbaiki dan simpan sebagai `cart-fixed.js`, lalu jalankan verifier-nya.

File `cart.js` (buggy):

```js
// cart.js — fungsi salah hitung
function hitungTotal(items, diskonPersen) {
  const subtotal = items.reduce((s, it) => s + it.harga * it.qty, 0);
  const diskon = subtotal * diskonPersen; // BUG: diskonPersen=10 berarti 10%, bukan 1000%
  const total = subtotal - diskon;
  return total;
}
module.exports = { hitungTotal };
```

Perintah: "Perbaiki fungsi `hitungTotal` supaya diskon persen dihitung dengan benar, dan tambahkan validasi input sesuai aturan skill (tolak input tidak valid, jangan diam-diam menghasilkan angka salah)."

Aturan yang harus dipakai dari SKILL.md: validasi SEMUA input (3.7), logika bisnis di service/function yang bisa di-test tanpa HTTP (anti-pattern 5), kasus error ditangani eksplisit.

File `verifier.js` (jalankan dengan `node verifier.js`):

```js
const { hitungTotal } = require('./cart-fixed.js');
let ok = true;
const cek = (nama, fn, expected) => {
  try {
    const got = fn();
    if (expected === 'throw') { console.log(`GAGAL [${nama}]: seharusnya menolak input`); ok = false; }
    else if (got !== expected) { console.log(`GAGAL [${nama}]: dapat ${got}, harus ${expected}`); ok = false; }
    else console.log(`OK [${nama}]: ${got}`);
  } catch (e) {
    if (expected === 'throw') console.log(`OK [${nama}]: ditolak (${e.message})`);
    else { console.log(`GAGAL [${nama}]: throw tak terduga: ${e.message}`); ok = false; }
  }
};
cek('diskon 10%', () => hitungTotal([{ harga: 10000, qty: 2 }], 10), 18000);
cek('diskon 0%', () => hitungTotal([{ harga: 5000, qty: 1 }, { harga: 15000, qty: 3 }], 0), 50000);
cek('diskon 100%', () => hitungTotal([{ harga: 20000, qty: 1 }], 100), 0);
cek('diskon 150% ditolak', () => hitungTotal([{ harga: 1000, qty: 1 }], 150), 'throw');
cek('diskon negatif ditolak', () => hitungTotal([{ harga: 1000, qty: 1 }], -5), 'throw');
cek('harga negatif ditolak', () => hitungTotal([{ harga: -1000, qty: 1 }], 10), 'throw');
console.log(ok ? 'HASIL: LOLOS' : 'HASIL: GAGAL');
process.exit(ok ? 0 : 1);
```

## Verifier

Lolos jika SEMUA kondisi terpenuhi (deterministik, dijalankan mesin):

1. `node verifier.js` exit code 0 dan mencetak `HASIL: LOLOS`.
2. `cart-fixed.js` tidak mengubah signature fungsi (`hitungTotal(items, diskonPersen)`).
3. Tidak ada `console.log` debugging yang tertinggal di `cart-fixed.js`.

## Baseline

Tanpa skill, agen menebak-nebak arti `diskonPersen`, memperbaiki hitungannya tapi tidak menambahkan validasi input — diskon 150% lolos diam-diam menghasilkan total negatif.
