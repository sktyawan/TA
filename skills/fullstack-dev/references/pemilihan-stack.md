# Pemilihan Stack — referensi fullstack-dev

Dipakai dari SKILL.md bagian 3.2. Aturan utama: jangan ganti stack proyek yang sudah berjalan kecuali diminta eksplisit.

## Next.js vs Vite (React)

| Kondisi | Pilih |
|---|---|
| Butuh SEO, SSR, atau routing file-based bawaan | Next.js (App Router) |
| SPA murni, dashboard internal, prototype cepat tanpa SEO | Vite + React |
| Sudah ada backend terpisah dan frontend hanya konsumsi API | Vite + React |
| Butuh API routes ringan dalam satu repo | Next.js |

## Express vs FastAPI

| Kondisi | Pilih |
|---|---|
| Tim/proyek sudah berbasis JavaScript/TypeScript, butuh ekosistem npm | Express (Node.js) |
| Butuh validasi otomatis, dokumentasi OpenAPI bawaan, performa tinggi | FastAPI (Python) |
| Ada kebutuhan ML/data processing di backend | FastAPI (Python) |

## React Native vs Flutter

| Kondisi | Pilih |
|---|---|
| Tim sudah menguasai JavaScript/React, butuh rilis cepat iOS+Android | React Native |
| Butuh performa mendekati native, animasi kompleks, UI sangat custom | Flutter |
| Aplikasi sederhana, satu codebase, update OTA penting | React Native |
