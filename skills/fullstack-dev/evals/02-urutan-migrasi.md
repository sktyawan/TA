## Task

Tiga file migrasi diberikan dalam urutan yang SALAH. Tugas: urutkan dengan benar, beri nomor ulang, dan tulis hasil review checklist skema.

File migrasi (isi disingkat, baca yang penting):

**`003_add_fk_attendances.sql`** (diberi nomor 003):
```sql
ALTER TABLE attendances
  ADD CONSTRAINT fk_attendances_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT;
CREATE INDEX idx_attendances_employee_id ON attendances(employee_id);
```

**`001_create_attendances.sql`** (diberi nomor 001):
```sql
CREATE TABLE attendances (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  date DATE NOT NULL,
  check_in_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**`002_create_employees.sql`** (diberi nomor 002):
```sql
CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Perintah: "Review dan betulkan urutan tiga migrasi ini. Tulis ulang dengan penomoran yang benar, lalu laporkan hasil checklist review skema (bagian 3.8 SKILL.md): apa yang sudah benar dan apa yang masih kurang."

Catatan: pakai prosedur migrasi LOW-FREEDOM di SKILL.md — urutan parent-sebelum-child, FK eksplisit, dan jangan mengarang nama tabel/kolom baru.

## Verifier

Lolos jika SEMUA kondisi terpenuhi:

1. Urutan akhir: `001_create_employees.sql` → `002_create_attendances.sql` → `003_add_fk_attendances.sql` (tabel parent `employees` dibuat SEBELUM tabel child `attendances` yang merujuknya; FK ditambah setelah kedua tabel ada).
2. Laporan checklist menyebut minimal 3 poin ini: (a) `ON DELETE RESTRICT` sudah eksplisit — benar; (b) index di `employee_id` sudah ada — benar; (c) temuan kurang: tidak ada `UNIQUE (employee_id, date)` untuk mencegah absensi ganda + tidak ada `deleted_at` (soft delete) untuk data bisnis.
3. Tidak ada nama tabel/kolom baru yang dikarang di luar tiga file yang diberikan.

## Baseline

Tanpa skill, agen menjalankan migrasi apa adanya sesuai nomor file dan gagal di tengah jalan karena `attendances` dibuat sebelum tabel `employees` yang dirujuknya ada.
