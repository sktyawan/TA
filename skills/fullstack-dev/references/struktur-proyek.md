# Struktur Proyek Standar — referensi fullstack-dev

Dipakai dari SKILL.md bagian 3.3. Ikuti struktur yang sudah ada di repo; ini dipakai saat mulai proyek baru.

## Web (Next.js App Router)

```
app/                 # routes (page.tsx per route)
  api/               # API routes (route.ts per endpoint)
components/          # komponen reusable (PascalCase)
lib/                 # helper, db client, auth utils
hooks/               # custom hooks
types/               # tipe TypeScript bersama
public/              # aset statis
```

## Web (Vite + React)

```
src/
  pages/             # satu file per halaman/route
  components/        # komponen reusable
  api/               # fungsi fetch per resource (products.ts, auth.ts)
  hooks/
  types/
```

## Backend (Express)

```
src/
  routes/            # definisi route per resource
  controllers/       # logika request/response
  services/          # logika bisnis (bisa di-test tanpa HTTP)
  middlewares/       # auth, errorHandler, validate
  models/ atau db/   # skema & akses database
  utils/
```

## Backend (FastAPI)

```
app/
  routers/           # APIRouter per resource
  services/          # logika bisnis
  models/           # model SQLAlchemy/Pydantic
  core/              # config, security, database session
  deps.py            # dependencies (get_current_user, get_db)
```

## Mobile (React Native / Flutter)

Pisahkan per fitur: `features/<nama-fitur>/` berisi screen, komponen, dan state-nya sendiri; folder bersama `core/` atau `shared/` untuk tema, API client, dan utilitas.
