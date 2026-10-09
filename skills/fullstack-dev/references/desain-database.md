# Desain Database — referensi fullstack-dev

Dipakai dari SKILL.md bagian 3.8. Ringkasan aturan + checklist ada di SKILL.md; di sini detailnya.

## Daftar isi

1. [Relasi & perilaku hapus](#relasi--perilaku-hapus)
2. [Kolom wajib & audit](#kolom-wajib--audit)
3. [Waktu & zona waktu](#waktu--zona-waktu)
4. [Nilai terbatas: CHECK vs tabel lookup](#nilai-terbatas-check-vs-tabel-lookup)
5. [Constraint sebagai pertahanan lapis kedua](#constraint-sebagai-pertahanan-lapis-kedua)
6. [Index & data turunan](#index--data-turunan)
7. [Migrasi](#migrasi)

## Relasi & perilaku hapus

- Tentukan relasi dulu di atas kertas: one-to-many (`employees` → `attendances`), many-to-many (pakai tabel pivot), one-to-one (`users` → `profiles`).
- Setiap FK wajib tentukan `ON DELETE` secara eksplisit: default `RESTRICT` (tolak hapus parent yang masih punya child). `CASCADE` hanya untuk child yang tidak bermakna tanpa parent (contoh: `order_items` ikut terhapus bersama `orders`). `SET NULL` hanya untuk referensi opsional.
- Karena data bisnis memakai soft delete, parent praktis tidak pernah di-hard-delete — FK tetap melindungi dari penghapusan tak sengaja.

## Kolom wajib & audit

- Setiap tabel: `id`, `created_at`, `updated_at` (TIMESTAMPTZ, default `now()`).
- Data bisnis penting: tambah `deleted_at` (soft delete); untuk alur persetujuan tambah kolom audit `created_by` / `approved_by` (+ `approved_at`).

## Waktu & zona waktu

- Selalu simpan sebagai `TIMESTAMPTZ` — bukan `TIMESTAMP` naive, bukan string. Aplikasi membaca/menulis dalam satu zona waktu kanonis (untuk Indonesia: `Asia/Jakarta`); konversi ke zona lokal hanya di lapisan tampilan.
- Untuk data harian seperti absensi, simpan kolom `date` (DATE) terpisah dari `check_in_at`/`check_out_at` (TIMESTAMPTZ) agar query per hari tidak perlu casting.

## Nilai terbatas: CHECK vs tabel lookup

- Status/alur yang tetap dan pendek (mis. `pending`/`approved`/`rejected`) → `CHECK (status IN (...))` atau ENUM; tulis daftar nilai valid di migrasi dan dokumentasikan transisi yang diizinkan.
- Data yang bisa bertambah/diubah atau punya atribut sendiri (jenis cuti + kuota, kategori produk) → tabel lookup tersendiri (`leave_types`), bukan string bebas.

## Constraint sebagai pertahanan lapis kedua

Validasi backend (SKILL.md 3.7) tetap wajib; constraint database menutup celah race condition:

- `UNIQUE` untuk aturan "satu X per Y": `UNIQUE (employee_id, date)` di `attendances` mencegah absensi ganda karyawan di tanggal yang sama.
- `CHECK` untuk logika sederhana: `CHECK (end_date >= start_date)`, `CHECK (total_days > 0)`, `CHECK (price >= 0)`.
- Untuk rentang tanggal yang tidak boleh tumpang tindih (pengajuan cuti), validasi di service + pertimbangkan exclusion constraint Postgres bila database mendukung.

## Index & data turunan

- Index wajib: semua foreign key, kolom yang sering di-filter (`status`, `category`), kolom pencarian teks yang sering dipakai. Jangan index semua kolom — index memperlambat write.
- Jangan simpan data turunan murni yang bisa dihitung (total harga order → hitung saat query atau pakai view), KECUALI angka yang ditetapkan sebagai fakta bisnis saat approval (mis. `total_days` cuti yang disetujui setelah mengecualikan weekend/hari libur) — itu data resmi, bukan turunan.

## Migrasi

- Setiap perubahan skema = satu file migrasi berversi (`001_create_products.sql`, `002_add_price_to_products.sql`), reversible (tulis `down`-nya). Jangan ubah skema manual langsung di database produksi.
- Urutan: tabel parent dulu, child kemudian; constraint FK ditambah setelah kedua tabel ada.
