# HERMES Control Center

Dashboard kendali + API gateway untuk **11 AI agent Hermes** — orkestrasi multi-agent, bank skill yang bisa belajar, dan gateway OpenAI-compatible ke banyak provider AI.

## Agent

| # | Agent | Peran | Skill |
|---|-------|-------|-------|
| 1 | Sari | HR Admin | `hr-admin` |
| 2 | Dinda | Upwork / Freelance | `upwork-freelance` |
| 3 | Rina | Personal Branding | `personal-branding` |
| 4 | Siti | Excel Mastery | `excel-mastery` |
| 5 | Citra | Instagram Creator | `instagram-creator` |
| 6 | Maya | YouTube Creator | `youtube-creator` |
| 7 | Zahra | TikTok Creator | `tiktok-creator` |
| 8 | Dewi | Facebook Creator | `facebook-creator` |
| 9 | Dira | Full-Stack Developer | `fullstack-dev` |
| 10 | Fitri | 3D & Design | `desain-3d` |
| 11 | Rani | Content Analyst | `content-analyst` |

## Cara menjalankan

```bash
npm install
cp .env.example .env   # isi DASH_TOKEN (wajib), GEMINI_API_KEY (opsional, untuk otak AI)
node server.js
```

Buka `http://localhost:3000` → login dengan `DASH_TOKEN` → dashboard.

## Environment variables

| Variabel | Wajib | Fungsi |
|----------|-------|--------|
| `DASH_TOKEN` | Ya | Token login dashboard |
| `GEMINI_API_KEY` | Tidak | Mengaktifkan otak AI di orkestrasi, evals, dan analis otomatis |
| `PORT` | Tidak | Port server (default 3000) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Tidak | Notifikasi Telegram (cron, usulan, error) |
| `OAUTH_REDIRECT_BASE` + `OAUTH_<PLATFORM>_CLIENT_ID/SECRET` | Tidak | OAuth2 akun sosial |

## Fitur utama

- **Dashboard KPI** (`kpi-dashboard/`) — aktivitas live, mesh antar-agent, orkestrasi, analis, semua di satu halaman. Login via `DASH_TOKEN`.
- **Inter-Agent Mesh** — `POST /api/room/message` dengan validasi pengirim/penerima; polling tiap 5 detik di dashboard.
- **Orkestrasi** — `POST /api/orchestration/execute`. Bila `GEMINI_API_KEY` diset, tiap step ditulis AI (konteks: peran + skill + hasil step sebelumnya); bila tidak, fallback template. Response menyertakan `brainMode: ai/template`.
- **Cron scheduler** — parser cron 5-field beneran, eksekusi terjadwal, riwayat 50 eksekusi. API: `GET/POST /api/scheduler/cron`, `PUT/DELETE /api/scheduler/cron/:id`.
- **Bank skill + loop belajar** — `GET /api/skills` (daftar), `GET /api/skills/:nama` (baca, anti path-traversal), `POST /api/skills/:nama/proposals` (agent mengusulkan), `PUT /api/proposals/:id` (setujui → langsung jadi versi baru + versi lama diarsipkan di `skills/<nama>/history/`).
- **Evals** — AI judge menilai tiap hasil orkestrasi (relevansi/konkret/kejelasan 1–10); skor rata-rata per agent di `/api/agents/scores`.
- **Rani otomatis** — analisis terjadwal tiap Senin 07:00 + trigger manual `POST /api/analyst/run`; otomatis mengajukan usulan perbaikan skill.
- **9Router gateway** (`/v1/*`, OpenAI-compatible) — teruskan ke provider asli (OpenAI/DeepSeek/Groq langsung; Anthropic/Gemini via translasi format), failover antar provider berdasar prioritas, streaming SSE, rate limit + budget per key. Tanpa API key provider → 503 jujur (bukan mock).
- **OAuth2 akun sosial** — Google, YouTube, Facebook, Instagram, TikTok, Upwork, GitHub. Token tersimpan di `data/` (selamat dari restart).
- **Persistensi** — sesi login, pesan mesh, jadwal cron, router keys, konfigurasi provider, proposal, evals tersimpan di `data/` (di-gitignore).

## Struktur

```
server.js              # backend Express (ESM)
kpi-dashboard/         # dashboard (kpi.html + login.html)
skills/<nama>/         # SKILL.md + evals/ + references/ (+ scripts/ bila ada)
skills/references/     # referensi bersama antar skill
scripts/check.sh       # pemindai bug (secret, SQL, token) — dipakai CI juga
data/                  # state runtime (di-gitignore, jangan di-commit)
```

## Bug scan

```bash
./scripts/check.sh .
```

Berjalan otomatis tiap push/PR via GitHub Actions (`.github/workflows/scan.yml`). Nol temuan = lolos.

## Batasan yang diketahui

- Orkestrasi AI butuh `GEMINI_API_KEY`; tanpa itu semua berjalan mode template.
- OAuth butuh kredensial tiap platform dan belum diuji end-to-end.
- State `data/` bersifat file-lokal (single instance); untuk multi-instance butuh database.
