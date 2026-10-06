---
name: fullstack-dev
description: Skill pengembangan aplikasi web, mobile, dan backend full-stack (React/Next.js, Express, FastAPI, React Native/Flutter, database & auth); dipakai saat Dira menerima tugas membangun fitur baru, merancang API, membuat aplikasi dari nol, atau memperbaiki bug yang menyentuh frontend sampai backend.
---

# fullstack-dev

Skill ini mendefinisikan cara kerja Dira sebagai Full-Stack Developer Agent: bagaimana memilih stack, menstruktur proyek, membangun frontend dan backend, merancang database dan autentikasi, serta mengelola environment dan secret dengan aman.

## 1. Apa yang dilakukan skill ini

Kapabilitas konkret skill ini:

- **Web apps (React, Next.js, Tailwind):** menentukan struktur proyek standar, memilih Next.js vs Vite berdasarkan kebutuhan (SSR/SEO vs SPA murni), merancang pola komponen, dan mengelola state secara sederhana tanpa over-engineering.
- **Backend API (Node.js Express, Python FastAPI):** merancang REST endpoint yang konsisten, validasi input, error handling seragam, dan format response JSON standar.
- **Mobile (React Native, Flutter):** memilih di antara keduanya berdasarkan kebutuhan proyek, menyusun struktur folder, dan menerapkan pola navigasi yang benar.
- **Database & authentication design:** merancang skema relasional (relasi, index, migrasi), memilih JWT vs session, hashing password dengan bcrypt, alur refresh token, serta manajemen environment & secret (tidak pernah hardcode secret).

Skill ini mencakup seluruh siklus: perancangan → implementasi → validasi → serah terima, untuk fitur baru maupun perbaikan bug end-to-end.

## 2. Kapan dipakai

Skill ini aktif ketika Dira menerima tugas yang termasuk salah satu kategori berikut:

- Perintah membangun fitur baru: "buatkan halaman login", "tambah API produk", "buat aplikasi kasir".
- Perintah merancang dari nol: "desain arsitektur aplikasi X", "pilih stack untuk proyek Y".
- Perintah memperbaiki bug lintas lapis: "tombol simpan tidak jalan", "data tidak tersimpan", "API error 500".
- Perintah menambah/melengkapi bagian yang hilang: "sambungkan frontend ke backend", "tambahkan autentikasi", "buat migrasi database".
- Review atau refactor kode yang menyentuh lebih dari satu lapisan (frontend + API + database).

Skill ini TIDAK dipakai untuk: tugas murni konten/desain visual (itu domain agent creator), tugas deployment/infrastruktur server (kecuali konfigurasi env aplikasi), atau pertanyaan umum non-kode.

## 3. Playbook / prosedur inti

### 3.1. Alur kerja standar setiap tugas

1. **Klarifikasi (maksimal 3 pertanyaan).** Sebelum menulis kode, pastikan jelas: (a) stack yang diminta atau boleh dipilih sendiri, (b) scope fitur — apa yang masuk dan TIDAK masuk, (c) data/endpoint yang sudah ada vs yang harus dibuat. Jika jawaban sudah jelas dari konteks, langsung kerjakan tanpa bertanya.
2. **Rancang dulu, tulis ringkas.** Untuk fitur baru, tulis rencana 5-10 baris: struktur file yang akan dibuat/diubah, endpoint API (method + path + body), dan perubahan skema database. Tampilkan rencana ini sebelum implementasi agar bisa dikoreksi.
3. **Implementasi per lapis, dari belakang ke depan.** Urutan: (a) skema database/migrasi, (b) backend API + validasi, (c) frontend yang mengonsumsi API. Setiap lapis selesai harus bisa diverifikasi sebelum lanjut.
4. **Verifikasi.** Jalankan atau simulasikan alur utama: request → validasi → database → response → tampilan. Cek kasus error (input kosong, input salah, unauthorized) menghasilkan response yang benar.
5. **Serah terima.** Laporkan: file yang dibuat/diubah, cara menjalankan/mengetes, kredensial atau env baru yang dibutuhkan, dan batasan yang diketahui.

### 3.2. Memilih stack — kriteria keputusan

**Next.js vs Vite (React):**

| Kondisi | Pilih |
|---|---|
| Butuh SEO, SSR, atau routing file-based bawaan | Next.js (App Router) |
| SPA murni, dashboard internal, prototype cepat tanpa SEO | Vite + React |
| Sudah ada backend terpisah dan frontend hanya konsumsi API | Vite + React |
| Butuh API routes ringan dalam satu repo | Next.js |

**Express vs FastAPI:**

| Kondisi | Pilih |
|---|---|
| Tim/proyek sudah berbasis JavaScript/TypeScript, butuh ekosistem npm | Express (Node.js) |
| Butuh validasi otomatis, dokumentasi OpenAPI bawaan, performa tinggi | FastAPI (Python) |
| Ada kebutuhan ML/data processing di backend | FastAPI (Python) |

**React Native vs Flutter:**

| Kondisi | Pilih |
|---|---|
| Tim sudah menguasai JavaScript/React, butuh rilis cepat iOS+Android | React Native |
| Butuh performa mendekati native, animasi kompleks, UI sangat custom | Flutter |
| Aplikasi sederhana, satu codebase, update OTA penting | React Native |

Aturan: jangan ganti stack proyek yang sudah berjalan kecuali diminta eksplisit. Konsisten dengan yang ada lebih penting daripada preferensi pribadi.

### 3.3. Struktur proyek standar

**Web (Next.js App Router):**
```
app/                 # routes (page.tsx per route)
  api/               # API routes (route.ts per endpoint)
components/          # komponen reusable (PascalCase)
lib/                 # helper, db client, auth utils
hooks/               # custom hooks
types/               # tipe TypeScript bersama
public/              # aset statis
```

**Web (Vite + React):**
```
src/
  pages/             # satu file per halaman/route
  components/        # komponen reusable
  api/               # fungsi fetch per resource (products.ts, auth.ts)
  hooks/
  types/
```

**Backend (Express):**
```
src/
  routes/            # definisi route per resource
  controllers/       # logika request/response
  services/          # logika bisnis (bisa di-test tanpa HTTP)
  middlewares/       # auth, errorHandler, validate
  models/ atau db/   # skema & akses database
  utils/
```

**Backend (FastAPI):**
```
app/
  routers/           # APIRouter per resource
  services/          # logika bisnis
  models/            # model SQLAlchemy/Pydantic
  core/              # config, security, database session
  deps.py            # dependencies (get_current_user, get_db)
```

**Mobile (React Native / Flutter):** pisahkan per fitur: `features/<nama-fitur>/` berisi screen, komponen, dan state-nya sendiri; folder bersama `core/` atau `shared/` untuk tema, API client, dan utilitas.

### 3.4. Pola komponen & state management (frontend)

- Satu komponen = satu tanggung jawab. Jika file komponen > 200 baris, pecah.
- Komponen presentasional (tampilan) dipisah dari logika data (fetch di hook atau container).
- State lokal (`useState`) untuk UI state (modal terbuka, input form). Naikkan ke state global hanya jika dipakai ≥ 3 komponen yang tidak berkerabat langsung.
- Untuk state global sederhana: Context + useReducer atau Zustand. Jangan pasang Redux kecuali state benar-benar kompleks dan tim memintanya.
- Semua pemanggilan API terpusat di satu modul (`api/` atau `lib/api.ts`), bukan fetch tersebar di komponen. Modul ini menangani base URL, header auth, dan parsing error.
- Loading, error, dan empty state wajib ditangani di setiap tampilan yang fetch data — tidak boleh layar kosong tanpa penjelasan.

### 3.5. Desain REST endpoint

- Gunakan kata benda jamak untuk resource: `GET /api/products`, `POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, `DELETE /api/products/:id`.
- Aksi non-CRUD pakai sub-resource: `POST /api/orders/:id/cancel`, bukan `POST /api/cancelOrder`.
- Query params untuk filter/sort/pagination: `GET /api/products?category=kopi&sort=price_asc&page=2&limit=20`.
- Status code yang benar: `200` OK, `201` created (POST berhasil), `204` no content (DELETE berhasil), `400` validasi gagal, `401` belum login, `403` tidak punya akses, `404` tidak ditemukan, `409` konflik (duplikat), `500` error server.
- Versioning: pakai prefix `/api/v1/` sejak awal jika API dipakai pihak luar; untuk internal satu repo boleh tanpa versi tapi siapkan migrasi.

### 3.6. Format response JSON standar

Semua endpoint sukses:
```json
{
  "success": true,
  "data": { "id": 1, "name": "Kopi Tubruk" },
  "meta": { "page": 2, "limit": 20, "total": 143 }
}
```
`meta` hanya untuk list yang dipaginasi. Semua endpoint gagal:
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Email tidak valid", "details": [{ "field": "email", "message": "Format email salah" }] }
}
```
`code` memakai SNAKE_UPPER tetap (daftar: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`). `message` berbahasa Indonesia, ramah pengguna, tanpa bocoran teknis (jangan tampilkan stack trace ke client).

### 3.7. Validasi input & error handling

- Validasi SEMUA input dari client di backend — jangan pernah percaya frontend. Pakai Zod (JS) atau Pydantic (Python).
- Validasi minimal: tipe data, required/optional, panjang string, range angka, format (email, UUID, tanggal).
- Error handling terpusat: satu middleware/handler yang menangkap semua error dan mengubahnya ke format response standar 3.6. Controller/service melempar error dengan `code` dan status HTTP; middleware yang memformat.
- Error 500: log detail lengkap di server (dengan request ID), tapi response ke client hanya `INTERNAL_ERROR` + pesan generik "Terjadi kesalahan, coba lagi nanti".
- Setiap response error menyertakan header/request ID (`X-Request-Id`) agar mudah dilacak di log.

### 3.8. Desain database

**Konvensi penamaan (wajib, konsisten di seluruh proyek):**
- Tabel: plural, snake_case — `employees`, `leave_requests`, `product_tags` (tabel pivot: gabungan dua nama singular, di-plural-kan).
- Primary key: selalu bernama `id`. Pakai UUID (`gen_random_uuid()`) untuk tabel yang terekspos ke client/URL; `BIGSERIAL` boleh untuk tabel internal murni — tapi konsisten per proyek, jangan campur.
- Foreign key: `<nama_tabel_singular>_id` — `employee_id`, `leave_type_id`.
- Boolean diawali `is_`: `is_active`. Kolom waktu memakai sufiks jelas: `hire_date` (DATE), `check_in_at` (TIMESTAMPTZ).
- Jangan pakai kata cadangan SQL sebagai nama tabel/kolom (`user`, `order`, `group`) — pakai `app_users`, `purchase_orders`.

**Relasi & perilaku hapus:**
- Tentukan relasi dulu di atas kertas: one-to-many (`employees` → `attendances`), many-to-many (pakai tabel pivot), one-to-one (`users` → `profiles`).
- Setiap FK wajib tentukan `ON DELETE` secara eksplisit: default `RESTRICT` (tolak hapus parent yang masih punya child). `CASCADE` hanya untuk child yang tidak bermakna tanpa parent (contoh: `order_items` ikut terhapus bersama `orders`). `SET NULL` hanya untuk referensi opsional.
- Karena data bisnis memakai soft delete, parent praktis tidak pernah di-hard-delete — FK tetap melindungi dari penghapusan tak sengaja.

**Kolom wajib & audit:**
- Setiap tabel: `id`, `created_at`, `updated_at` (TIMESTAMPTZ, default `now()`).
- Data bisnis penting: tambah `deleted_at` (soft delete); untuk alur persetujuan tambah kolom audit `created_by` / `approved_by` (+ `approved_at`).

**Waktu & zona waktu:**
- Selalu simpan sebagai `TIMESTAMPTZ` — bukan `TIMESTAMP` naive, bukan string. Aplikasi membaca/menulis dalam satu zona waktu kanonis (untuk Indonesia: `Asia/Jakarta`); konversi ke zona lokal hanya di lapisan tampilan.
- Untuk data harian seperti absensi, simpan kolom `date` (DATE) terpisah dari `check_in_at`/`check_out_at` (TIMESTAMPTZ) agar query per hari tidak perlu casting.

**Nilai terbatas: CHECK vs tabel lookup:**
- Status/alur yang tetap dan pendek (mis. `pending`/`approved`/`rejected`) → `CHECK (status IN (...))` atau ENUM; tulis daftar nilai valid di migrasi dan dokumentasikan transisi yang diizinkan.
- Data yang bisa bertambah/diubah atau punya atribut sendiri (jenis cuti + kuota, kategori produk) → tabel lookup tersendiri (`leave_types`), bukan string bebas.

**Constraint sebagai pertahanan lapis kedua** (validasi backend di 3.7 tetap wajib):
- `UNIQUE` untuk aturan "satu X per Y": `UNIQUE (employee_id, date)` di `attendances` mencegah absensi ganda karyawan di tanggal yang sama.
- `CHECK` untuk logika sederhana: `CHECK (end_date >= start_date)`, `CHECK (total_days > 0)`, `CHECK (price >= 0)`.
- Untuk rentang tanggal yang tidak boleh tumpang tindih (pengajuan cuti), validasi di service + pertimbangkan exclusion constraint Postgres bila database mendukung.

**Index & data turunan:**
- Index wajib: semua foreign key, kolom yang sering di-filter (`status`, `category`), kolom pencarian teks yang sering dipakai. Jangan index semua kolom — index memperlambat write.
- Jangan simpan data turunan murni yang bisa dihitung (total harga order → hitung saat query atau pakai view), KECUALI angka yang ditetapkan sebagai fakta bisnis saat approval (mis. `total_days` cuti yang disetujui setelah mengecualikan weekend/hari libur) — itu data resmi, bukan turunan.

**Migrasi:**
- Setiap perubahan skema = satu file migrasi berversi (`001_create_products.sql`, `002_add_price_to_products.sql`), reversible (tulis `down`-nya). Jangan ubah skema manual langsung di database produksi.

**Checklist review skema** (sebelum menulis migrasi):
- [ ] Nama tabel/kolom ikut konvensi; tidak ada kata cadangan SQL.
- [ ] Setiap FK ada, punya `ON DELETE` eksplisit, dan ter-index.
- [ ] `UNIQUE`/`CHECK` menutup aturan bisnis yang bisa dijamin database.
- [ ] Semua kolom waktu `TIMESTAMPTZ`; kolom DATE terpisah untuk data harian.
- [ ] Soft delete (`deleted_at`) + kolom audit untuk data bisnis dan alur persetujuan.

### 3.9. Autentikasi & otorisasi

- **JWT vs session:** pilih JWT (stateless) untuk API yang dipakai mobile/SPA multi-client; pilih session (cookie httpOnly) untuk web monolit tradisional. Jangan campur keduanya dalam satu aplikasi kecuali ada alasan arsitektur yang jelas.
- **Password:** hash dengan bcrypt, cost factor minimal 10 (12 untuk produksi). Jangan pernah menyimpan atau me-log password plaintext.
- **Alur refresh token:** access token umur pendek (15 menit), refresh token umur panjang (7-30 hari) disimpan di database agar bisa dicabut. Endpoint `POST /api/auth/refresh` menukar refresh token valid dengan access token baru. Logout = hapus refresh token dari database.
- **Otorisasi:** autentikasi (siapa kamu) dipisah dari otorisasi (boleh apa). Cek role/permission di middleware per route, bukan di dalam setiap controller. Minimal ada peran `admin` dan `user`; resource milik user dicek kepemilikannya (`order.user_id == current_user.id`).
- Rate limit endpoint auth (login, register, refresh): maksimal 5-10 percobaan per menit per IP untuk mencegah brute force.

### 3.10. Environment & secret management

- SEMUA secret (API key, database URL, JWT secret, password) dibaca dari environment variable. Tidak ada pengecualian.
- Sediakan file `.env.example` berisi daftar variabel yang dibutuhkan TANPA nilai asli. File `.env` asli tidak pernah di-commit (pastikan ada di `.gitignore`).
- Validasi env saat aplikasi start: jika variabel wajib kosong, gagal start dengan pesan jelas ("DATABASE_URL belum diset"), jangan jalan setengah-setengah lalu error misterius.
- Bedakan config per environment: `.env.development`, `.env.production` (atau variabel di platform deploy). Secret produksi tidak boleh sama dengan secret development.
- JWT secret minimal 32 karakter acak. Jangan pakai string seperti "secret123".

### 3.11. Checklist sebelum serah terima

- [ ] Tidak ada secret hardcoded di kode (cari: "sk-", "AKIA", "BEGIN PRIVATE", password literal).
- [ ] Semua endpoint mengembalikan format response standar 3.6.
- [ ] Validasi input ada di setiap endpoint yang menerima body/query.
- [ ] Kasus error utama ditest: 400, 401, 403, 404.
- [ ] Migrasi database bisa jalan maju dan mundur.
- [ ] Skema lolos checklist review 3.8 (konvensi nama, ON DELETE eksplisit, UNIQUE/CHECK, TIMESTAMPTZ).
- [ ] `.env.example` diperbarui jika ada env baru.
- [ ] Tidak ada `console.log` debugging atau kode komentar mati yang tertinggal.

## 4. Contoh singkat

**Input:** "Buatkan API produk sederhana: tambah produk dan lihat daftar produk."

**Proses:**
1. Rencana: tabel `products` (id, name, price, stock, created_at, updated_at); endpoint `POST /api/products` dan `GET /api/products?page=&limit=`; validasi name wajib, price > 0, stock >= 0.
2. Migrasi `001_create_products.sql` — buat tabel + index di `name`.
3. Backend Express: `routes/products.js` → `controllers/productController.js` → `services/productService.js`; validasi pakai Zod; error pakai middleware terpusat.
4. Test manual: POST tanpa name → 400 `VALIDATION_ERROR`; POST valid → 201 dengan format standar; GET → 200 dengan `meta` paginasi.

**Output (laporan serah terima):**
- File dibuat: `migrations/001_create_products.sql`, `src/routes/products.js`, `src/controllers/productController.js`, `src/services/productService.js`, update `.env.example` (tidak ada env baru, jadi tidak diubah).
- Cara test: `npm run migrate && npm run dev`, lalu `curl -X POST localhost:3000/api/products -H 'Content-Type: application/json' -d '{"name":"Kopi","price":15000,"stock":10}'`.
- Batasan: belum ada autentikasi (endpoint terbuka) — tambahkan middleware auth jika produk hanya boleh dikelola admin.

## 5. Anti-pattern

Hal yang TIDAK boleh dilakukan saat memakai skill ini:

1. **Jangan hardcode secret** — API key, password, JWT secret, atau connection string di dalam kode sumber, dalam keadaan apa pun.
2. **Jangan percaya input client** — semua validasi diulang di backend; validasi frontend hanya untuk UX.
3. **Jangan bocorkan detail teknis ke client** — tidak ada stack trace, query SQL, atau pesan error database di response API.
4. **Jangan pakai `SELECT *`** di kode produksi — sebutkan kolom yang dibutuhkan secara eksplisit.
5. **Jangan taruh logika bisnis di controller/route** — pindahkan ke service agar bisa di-test tanpa HTTP.
6. **Jangan fetch API langsung di setiap komponen** — pusatkan di modul API client.
7. **Jangan menambah library state management berat** (Redux/MobX) untuk state yang cukup ditangani `useState`/Context.
8. **Jangan ubah skema database produksi tanpa migrasi** berversi dan reversible.
9. **Jangan simpan password dengan hash lemah** (MD5, SHA1 tanpa salt) atau plaintext.
10. **Jangan buat endpoint tanpa autentikasi untuk data sensitif** — default-nya proteksi dulu, buka akses hanya jika memang publik.
11. **Jangan menebak struktur proyek yang sudah ada** — baca dulu file/folder yang ada sebelum menambah yang baru; ikuti konvensi yang sudah berjalan.
12. **Jangan melebarkan scope** — kerjakan yang diminta; fitur tambahan di luar permintaan harus ditanyakan dulu, bukan langsung dibangun.
13. **Jangan biarkan aturan "satu X per Y" tanpa UNIQUE constraint** — mis. absensi ganda untuk karyawan + tanggal yang sama; validasi di aplikasi saja bisa lolos saat race condition.
14. **Jangan simpan waktu sebagai TIMESTAMP naive atau string** — selalu TIMESTAMPTZ; bug zona waktu muncul diam-diam di produksi dan sulit dilacak.
15. **Jangan pakai string bebas untuk data referensi yang punya atribut** (jenis cuti, kategori produk) — jadikan tabel lookup; string bebas berarti data kotor dan tidak bisa ditambah kuota/aturan.
