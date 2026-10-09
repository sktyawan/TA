import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== PERSISTENSI DISK: state penting selamat dari restart server =====
const DATA_DIR = path.join(__dirname, 'data');
function loadState(file, fallback) {
  try {
    const p = path.join(DATA_DIR, file);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) { console.warn(`Gagal memuat ${file}, pakai bawaan.`); }
  return fallback;
}
function saveState(file, data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
  } catch (e) { console.warn(`Gagal menyimpan ${file}:`, e.message); }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const app = express();
app.use(express.json());

// ===== AUTH: gerbang login sebelum dashboard =====
// Token diambil dari env DASH_TOKEN (lihat .env.example). Tanpa ini, login ditolak.
const DASH_TOKEN = process.env.DASH_TOKEN || '';
const sessions = new Set(
  (loadState('sessions.json', []) || [])
    .filter(s => s && s.id && Date.now() - new Date(s.createdAt).getTime() < 24 * 3600 * 1000)
    .map(s => s.id)
); // session id aktif — dipersist ke data/sessions.json
function saveSessions() {
  saveState('sessions.json', [...sessions].map(id => ({ id, createdAt: new Date().toISOString() })));
}

function getSessionId(req) {
  const m = (req.headers.cookie || '').match(/hermes_session=([a-f0-9]{64})/);
  return m ? m[1] : null;
}

function requireAuth(req, res, next) {
  // Gateway API /v1/* punya skema Bearer key sendiri (bukan cookie browser) -> dilewati di sini
  if (req.path.startsWith('/v1/')) return next();
  // Sesi cookie (dari halaman login) ATAU header x-token (dipakai helper api() dashboard & skrip)
  const sid = getSessionId(req);
  const headerToken = req.headers['x-token'];
  if ((sid && sessions.has(sid)) || (DASH_TOKEN && headerToken === DASH_TOKEN)) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized — silakan login dulu di /login' });
  }
  return res.redirect('/login');
}

// --- Route publik: halaman + proses login/logout ---
app.get('/login', (req, res) => {
  const sid = getSessionId(req);
  if (sid && sessions.has(sid)) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'kpi-dashboard', 'login.html'));
});

app.post('/api/auth/login', (req, res) => {
  if (!DASH_TOKEN) {
    return res.status(500).json({ error: 'DASH_TOKEN belum diset di server — hubungi admin' });
  }
  const { token } = req.body || {};
  if (token && token === DASH_TOKEN) {
    const sid = crypto.randomBytes(32).toString('hex');
    sessions.add(sid);
    saveSessions();
    res.setHeader('Set-Cookie', `hermes_session=${sid}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`);
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Token salah — coba lagi' });
});

app.post('/api/auth/logout', (req, res) => {
  const sid = getSessionId(req);
  if (sid) { sessions.delete(sid); saveSessions(); }
  res.setHeader('Set-Cookie', 'hermes_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
  res.json({ success: true });
});

// Semua route di bawah baris ini wajib login (kecuali /v1/*)
app.use(requireAuth);

if (!DASH_TOKEN) {
  console.warn('[AUTH] PERINGATAN: DASH_TOKEN kosong — halaman login akan menolak semua upaya masuk sampai token diset.');
}

// In-memory mock data representing the Hermes Agents & their skills from /skills/*
const AGENTS = [
  {
    id: 'sari',
    name: 'Sari',
    role: 'HR Admin Agent — Validasi NIK/BPJS, Rekonsiliasi Excel & Compliance (hr-admin)',
    skill: 'hr-admin',
    chats: [
      { role: 'user', content: 'Tolong validasi batch 5 data karyawan baru untuk pendaftaran BPJS Oktober.' },
      { role: 'assistant', content: 'Laporan validasi selesai: 3 VALID, 2 TIDAK VALID (masalah panjang NIK 15 digit & simbol pada nama).' },
      { role: 'user', content: 'Siapkan checklist compliance bulanan awal Oktober.' },
      { role: 'assistant', content: 'Checklist 10 item wajib compliance HR bulan Oktober telah disusun beserta PIC dan tenggatnya.' }
    ],
    memory: [
      '- Format standar master data karyawan terdiri dari 13 kolom wajib dengan NIK, BPJS Kes (13 digit), dan KPJ (11 digit) berformat Text.',
      '- Pendaftaran BPJS Kesehatan & Ketenagakerjaan karyawan baru wajib maksimal H+30 hari kerja.',
      '- Kontrak PKWT dipantau setiap awal bulan dengan peringatan H-30, H-14, dan H-7.'
    ]
  },
  {
    id: 'dinda',
    name: 'Dinda',
    role: 'Upwork & Freelance Strategist — Proposal, Pricing & Gig Discovery (upwork-freelance)',
    skill: 'upwork-freelance',
    chats: [
      { role: 'user', content: 'Tuliskan proposal untuk job Full-Stack React/Node dashboard di Upwork.' },
      { role: 'assistant', content: 'Proposal siap dengan hook 2 baris pertama yang mempersonalisasi masalah klien, 2 bukti proyek relevan, dan CTA singkat.' },
      { role: 'user', content: 'Evaluasi rate hourly profil saat ini.' },
      { role: 'assistant', content: 'Perhitungan rate minimum dan target sudah disesuaikan dengan fee Upwork dan target jam kerja.' }
    ],
    memory: [
      '- Hook 2 baris pertama overview dan proposal Upwork menentukan apakah klien mengklik "more".',
      '- Gunakan struktur proposal: Hook Personalisasi → Bukti Relevan → Rencana Singkat → CTA Pertanyaan.',
      '- Hindari bidding pada job dari klien dengan hire rate rendah dan deskripsi kabur.'
    ]
  },
  {
    id: 'rina',
    name: 'Rina',
    role: 'Personal Branding & Portfolio Agent — GitHub, LinkedIn & X (personal-branding)',
    skill: 'personal-branding',
    chats: [
      { role: 'user', content: 'Susun jadwal konten LinkedIn dan X untuk minggu ini.' },
      { role: 'assistant', content: 'Kalender konten 3 postingan LinkedIn dan 5 thread/post X siap dengan draf copywriting.' }
    ],
    memory: [
      '- Positioning statement satu kalimat harus konsisten di bio GitHub, LinkedIn, dan X.',
      '- 6 slot pinned repository GitHub wajib memiliki deskripsi singkat, tech stack tags, dan link demo.',
      '- Pilar konten utama: Build in Public, Breakdown Teknis, dan Studi Kasus Proyek.'
    ]
  },
  {
    id: 'siti',
    name: 'Siti',
    role: 'Excel Mastery Specialist — Formula Inti, Optimasi & Data Audit (excel-mastery)',
    skill: 'excel-mastery',
    chats: [
      { role: 'user', content: 'Perbaiki error #N/A pada rumus rekonsiliasi invoice antar sheet.' },
      { role: 'assistant', content: 'Rumus VLOOKUP diganti dengan XLOOKUP + normalisasi TRIM/TEXT agar kunci teks dan angka cocok.' },
      { role: 'user', content: 'Jalankan audit kualitas data pada sheet penjualan.' },
      { role: 'assistant', content: 'Audit selesai: ditemukan 4 duplikat ID transaksi dan 2 tanggal berformat teks.' }
    ],
    memory: [
      '- Gunakan 5 fungsi inti: SUMIFS, XLOOKUP, IF/IFS, TEXT/DATE, dan COUNTIFS.',
      '- Ubah range kolom penuh (A:A) menjadi Structured Table (Ctrl+T) untuk performa optimal.',
      '- Hindari fungsi volatil seperti INDIRECT dan OFFSET bila bisa diganti INDEX/XLOOKUP.'
    ]
  },
  {
    id: 'citra',
    name: 'Citra',
    role: 'Instagram Creator Agent — Hook Reels 0-3s, Carousel & Hashtag (instagram-creator)',
    skill: 'instagram-creator',
    chats: [
      { role: 'user', content: 'Buat konsep carousel 7 slide tentang produktivitas kerja remote.' },
      { role: 'assistant', content: 'Teks 7 slide carousel (Cover, Problem, 4 langkah solusi, CTA Save/Share) beserta caption dan 15 hashtag siap.' },
      { role: 'user', content: 'Bikin 3 opsi hook Reels untuk topik belajar koding.' },
      { role: 'assistant', content: '3 varian hook visual + teks overlay 0-3 detik sudah disiapkan untuk menghentikan swipe.' }
    ],
    memory: [
      '- Target retensi 3 detik pertama Reels adalah >70% melalui kombinasi visual gerak dan teks kontras.',
      '- Setiap slide carousel dibatasi maksimal 25-35 kata dengan kalimat transisi di bagian bawah.',
      '- Mix hashtag ideal: kombinasi niche spesifik, menengah, dan relevan dengan kata kunci caption.'
    ]
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'YouTube Creator Agent — Scriptwriting, Video SEO & Shorts (youtube-creator)',
    skill: 'youtube-creator',
    chats: [
      { role: 'user', content: 'Tulis naskah video YouTube 8 menit tentang otomasi spreadsheet.' },
      { role: 'assistant', content: 'Naskah lengkap dengan hook 0-30 detik, open loop, timestamp B-roll, 3 opsi judul SEO, dan konsep thumbnail 3 elemen.' }
    ],
    memory: [
      '- Struktur video panjang: Hook 0-30 detik → Setup → Value Delivery dengan Open Loop → CTA.',
      '- Thumbnail maksimal menggunakan 3 elemen visual dan teks <= 4 kata dengan kontras tinggi.',
      '- Setiap video panjang dipotong menjadi 2-3 Shorts mandiri berdurasi 30-60 detik dengan hook baru.'
    ]
  },
  {
    id: 'zahra',
    name: 'Zahra',
    role: 'TikTok Creator Agent — Hook 3-Detik, Audio Trending & FYP (tiktok-creator)',
    skill: 'tiktok-creator',
    chats: [
      { role: 'user', content: 'Siapkan paket konten TikTok untuk topik tips karir tech.' },
      { role: 'assistant', content: 'Paket siap produksi: 3 varian hook 3 detik, naskah detik-per-detik (35 detik), rekomendasi audio rising, dan caption SEO.' },
      { role: 'user', content: 'Evaluasi kenapa completion rate video kemarin turun.' },
      { role: 'assistant', content: 'Analisis menunjukkan jeda di detik ke-4; disarankan potong intro dan pasang pattern interrupt di detik ke-6.' }
    ],
    memory: [
      '- Sinyal ranking algoritma FYP tertinggi: completion rate, watch time, share, dan save.',
      '- Selalu siapkan 3 varian hook (kontradiksi, angka spesifik, pov/masalah) untuk setiap konsep video.',
      '- Pilih audio pada fase rising di TikTok Creative Center, bukan yang sudah lewat puncak.'
    ]
  },
  {
    id: 'dewi',
    name: 'Dewi',
    role: 'Facebook Creator Agent — Long-Form Storytelling & Komunitas Grup (facebook-creator)',
    skill: 'facebook-creator',
    chats: [
      { role: 'user', content: 'Adaptasi konten Reels kemarin menjadi postingan storytelling Facebook.' },
      { role: 'assistant', content: 'Postingan long-form siap: dibuka dengan hook cerita personal, konflik, pelajaran utama, dan pertanyaan diskusi di akhir.' }
    ],
    memory: [
      '- Struktur storytelling Facebook: Hook Emosional → Konflik → Turning Point → Pelajaran → CTA Diskusi.',
      '- Jangan copy-paste caption IG/TikTok mentah ke Facebook; sesuaikan dengan gaya narasi komunitas.',
      '- Kalender engagement grup mingguan menjaga rasio diskusi anggota dan moderasi bebas spam.'
    ]
  },
  {
    id: 'dira',
    name: 'Dira',
    role: 'Full-Stack Developer Agent — Web, API, Database & Auth (fullstack-dev)',
    skill: 'fullstack-dev',
    chats: [
      { role: 'user', content: 'Rancang endpoint REST API dan skema database untuk modul cuti karyawan.' },
      { role: 'assistant', content: 'Skema PostgreSQL (employees, leave_types, leave_requests) dengan TIMESTAMPTZ & FK eksplisit serta endpoint Express + validasi Zod siap.' },
      { role: 'user', content: 'Perbaiki bug endpoint KPI dashboard yang belum tersedia.' },
      { role: 'assistant', content: 'Server Express untuk KPI Dashboard telah diimplementasikan lengkap dengan endpoint /api/agents, /api/logs, /api/room, dan /api/proposals.' }
    ],
    memory: [
      '- Semua endpoint API mengembalikan format JSON standar { success, data, meta } atau { success: false, error }.',
      '- Validasi semua input di backend dan jangan pernah hardcode secret di kode sumber.',
      '- Tabel database wajib memakai snake_case plural, TIMESTAMPTZ, dan ON DELETE eksplisit pada setiap FK.'
    ]
  },
  {
    id: 'fitri',
    name: 'Fitri',
    role: '3D Visual, UI/UX & Brand Designer — Render 3D & Design System (desain-3d)',
    skill: 'desain-3d',
    skillPath: '/skills/desain-3d/SKILL.md',
    chats: [
      { role: 'user', content: 'Buat konsep pencahayaan 3-point lighting untuk render botol kemasan produk.' },
      { role: 'assistant', content: 'Setup kamera 85mm, material PBR glass/matte, dan 3-point studio lighting + rim light siap dirender.' },
      { role: 'user', content: 'Rapikan design tokens warna dan tipografi untuk dashboard.' },
      { role: 'assistant', content: 'Design tokens (surface, accent, semantic status, spacing scale) telah terdokumentasi di design system.' }
    ],
    memory: [
      '- Alur kerja 3D: Blocking & Modeling → UV & PBR Material → 3-Point Lighting → Camera Composition → Render & QA.',
      '- Struktur komponen UI wajib menggunakan design tokens konsisten dan auto-layout.',
      '- Deliverable desain selalu dicek kontras keterbacaan, resolusi, dan color space (sRGB untuk digital).'
    ]
  },
  {
    id: 'rani',
    name: 'Rani',
    role: 'Content Analyst — Analisis performa konten, riset tren & umpan balik perbaikan skill (content-analyst)',
    skill: 'content-analyst',
    skillPath: '/skills/content-analyst/SKILL.md',
    chats: [
      { role: 'user', content: 'Analisis 12 video TikTok terakhir, kenapa 3 terakhir sepi?' },
      { role: 'assistant', content: 'Completion rate 3 video terakhir 28-31% vs baseline 42% — pola: hook pernyataan vs hook pertanyaan di 9 video sebelumnya. Hipotesis + usulan update skill tiktok-creator terkirim.' },
      { role: 'user', content: 'Riset tren minggu ini untuk niche edukasi AI.' },
      { role: 'assistant', content: 'Brief riset: 3 tren relevan dengan angle adaptasi, contoh referensi, dan estimasi effort produksi 48 jam.' }
    ],
    memory: [
      '- Baseline performa selalu dari 10 konten terakhir akun sendiri, bukan akun orang lain.',
      '- Pola valid minimal muncul 3 kali; sinyal = selisih >20% dari baseline.',
      '- Setiap temuan wajib menjadi aksi: usulan skill atau rekomendasi ke agent creator.'
    ]
  }
];

const LOGS = [
  'Sari_2026-10-01_validasi_nik_batch1.log',
  'Sari_2026-10-02_sinkronisasi_edabu.log',
  'Sari_2026-10-05_checklist_compliance_oktober.log',
  'Dinda_2026-10-01_optimasi_profil_upwork.log',
  'Dinda_2026-10-03_proposal_react_dashboard.log',
  'Dinda_2026-10-05_riset_side_gig.log',
  'Rina_2026-10-02_audit_github_readme.log',
  'Rina_2026-10-04_jadwal_konten_linkedin.log',
  'Siti_2026-10-01_debug_xlookup_invoice.log',
  'Siti_2026-10-03_audit_kualitas_data_penjualan.log',
  'Siti_2026-10-05_template_rekap_bulanan.log',
  'Citra_2026-10-02_hook_reels_produktivitas.log',
  'Citra_2026-10-04_carousel_koding_pemula.log',
  'Maya_2026-10-01_naskah_youtube_otomasi_excel.log',
  'Maya_2026-10-04_optimasi_seo_thumbnail.log',
  'Zahra_2026-10-02_hook_3detik_fyp.log',
  'Zahra_2026-10-03_riset_audio_trending.log',
  'Zahra_2026-10-05_paket_konten_tiktok.log',
  'Dewi_2026-10-02_storytelling_komunitas_fb.log',
  'Dewi_2026-10-05_repurpose_reels_ke_grup.log',
  'Dira_2026-10-01_skema_db_modul_cuti.log',
  'Dira_2026-10-03_implementasi_rest_api.log',
  'Dira_2026-10-06_integrasi_kpi_dashboard.log',
  'Fitri_2026-10-02_render_3d_mockup_produk.log',
  'Fitri_2026-10-04_design_system_tokens.log'
];

let ROOM_MESSAGES = loadState('room.json', null) || [
  { from: 'Sari', to: 'Siti', text: 'Siti, tolong cek formula XLOOKUP untuk rekonsiliasi sheet master karyawan vs Edabu.', ts: '2026-10-05T09:15:00Z' },
  { from: 'Siti', to: 'Sari', text: 'Sudah dicek Sari, kunci NIK sudah dinormalisasi pakai TEXT(TRIM()) agar 16 digit aman.', ts: '2026-10-05T09:22:00Z' },
  { from: 'Dinda', to: 'Rina', text: 'Rina, ada proyek dashboard baru yang selesai, yuk update di pinned GitHub dan post LinkedIn.', ts: '2026-10-05T11:00:00Z' },
  { from: 'Rina', to: 'Dinda', text: 'Siap Dinda! Draft studi kasus LinkedIn dan update README portfolio sudah dijadwalkan.', ts: '2026-10-05T11:18:00Z' },
  { from: 'Maya', to: 'Citra', text: 'Naskah video panjang YouTube minggu ini sudah jadi, ada 3 segmen yang pas untuk Reels & Carousel.', ts: '2026-10-05T13:40:00Z' },
  { from: 'Citra', to: 'Zahra', text: 'Zahra, hook nomor 2 dari topik otomasi kerja ini cocok juga untuk versi 35 detik di TikTok.', ts: '2026-10-05T14:05:00Z' },
  { from: 'Zahra', to: 'Dewi', text: 'Video TikTok sudah siap naik, Dewi bisa adaptasi ceritanya untuk diskusi grup Facebook sore ini.', ts: '2026-10-05T14:30:00Z' },
  { from: 'Dewi', to: 'Maya', text: 'Diskusi di grup FB ramai membahas template spreadsheet, bisa jadi ide video YouTube berikutnya!', ts: '2026-10-05T16:10:00Z' },
  { from: 'Fitri', to: 'Dira', text: 'Komponen kartu KPI dan palet dark mode sudah siap di design token untuk diimplementasikan.', ts: '2026-10-06T07:00:00Z' },
  { from: 'Dira', to: 'Fitri', text: 'Terima kasih Fitri, endpoint API dan halaman KPI Dashboard sudah jalan di port 3000.', ts: '2026-10-06T07:20:00Z' }
];

// ===== Inter-Agent Mesh helpers =====
// Cari agent berdasarkan id atau nama (case-insensitive). Dipakai untuk validasi pengirim/penerima.
function findAgent(idOrName) {
  if (!idOrName) return null;
  const key = String(idOrName).trim().toLowerCase();
  return AGENTS.find(a => a.id.toLowerCase() === key || a.name.toLowerCase() === key) || null;
}

// Tulis satu pesan ke mesh dan kembalikan objek pesannya. Maks 200 pesan (FIFO).
function pushRoomMessage(fromName, toName, text) {
  const msg = { from: fromName, to: toName, text, ts: new Date().toISOString() };
  ROOM_MESSAGES.push(msg);
  if (ROOM_MESSAGES.length > 200) ROOM_MESSAGES.splice(0, ROOM_MESSAGES.length - 200);
  saveState('room.json', ROOM_MESSAGES);
  return msg;
}

const PROPOSALS_SEED = [
  { id: 'prop-1', agent: 'Sari', skill: 'hr-admin', title: 'Otomatisasi peringatan H-30 kontrak PKWT', status: 'approved' },
  { id: 'prop-2', agent: 'Dinda', skill: 'upwork-freelance', title: 'Template scoring kelayakan job posting Upwork', status: 'approved' },
  { id: 'prop-3', agent: 'Rina', skill: 'personal-branding', title: 'Playbook konsistensi profil GitHub-LinkedIn-X', status: 'approved' },
  { id: 'prop-4', agent: 'Siti', skill: 'excel-mastery', title: 'Checklist audit kualitas data otomatis', status: 'approved' },
  { id: 'prop-5', agent: 'Citra', skill: 'instagram-creator', title: 'Bank formula hook Reels 0-3 detik', status: 'approved' },
  { id: 'prop-6', agent: 'Maya', skill: 'youtube-creator', title: 'Workflow repurpose video panjang ke Shorts', status: 'approved' },
  { id: 'prop-7', agent: 'Zahra', skill: 'tiktok-creator', title: 'Metode A/B testing 3 varian hook FYP', status: 'approved' },
  { id: 'prop-8', agent: 'Dewi', skill: 'facebook-creator', title: 'Kerangka long-form storytelling komunitas', status: 'approved' },
  { id: 'prop-9', agent: 'Dira', skill: 'fullstack-dev', title: 'Standarisasi response JSON & validasi endpoint', status: 'approved' },
  { id: 'prop-10', agent: 'Fitri', skill: 'desain-3d', title: 'Checklist QA lighting & render produk 3D', status: 'approved' },
  { id: 'prop-11', agent: 'Hermes Mesh', skill: 'multi-agent-orchestration', title: 'Orkestrasi Multi-Agent, Dekomposisi Task & Protocol Routing', status: 'active' }
];
// Muat proposal dari disk bila ada (selamat dari restart); kalau belum ada, pakai seed lalu simpan.
let PROPOSALS = loadState('proposals.json', null);
if (!Array.isArray(PROPOSALS)) {
  PROPOSALS = PROPOSALS_SEED;
  saveState('proposals.json', PROPOSALS);
}
let SKILL_PROPOSAL_SEQ = PROPOSALS.reduce((m, p) => {
  const n = parseInt(String(p.id || '').split('-')[1], 10);
  return isNaN(n) ? m : Math.max(m, n);
}, 100);

// 9ROUTER API GATEWAY STATE
const ROUTER_KEYS_SEED = [
  { id: 'key_1', name: 'Hermes Production Key', key: '', rateLimit: 120, budget: 50.00, used: 4.82, active: true, created: '2026-10-01' },
  { id: 'key_2', name: 'Hermes Staging & Test Key', key: '', rateLimit: 60, budget: 10.00, used: 1.15, active: true, created: '2026-10-03' }
];
let ROUTER_KEYS = loadState('router_keys.json', null);
if (!Array.isArray(ROUTER_KEYS)) {
  ROUTER_KEYS = ROUTER_KEYS_SEED;
  saveState('router_keys.json', ROUTER_KEYS);
}
const saveRouterKeys = () => saveState('router_keys.json', ROUTER_KEYS);

const ROUTER_PROVIDERS_SEED = [
  { id: 'gemini', name: 'Google Gemini AI', provider: 'google', apiKey: '', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'], status: 'active', latencyMs: 210, priority: 1 },
  { id: 'openai', name: 'OpenAI API', provider: 'openai', apiKey: '', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'], status: 'active', latencyMs: 340, priority: 2 },
  { id: 'anthropic', name: 'Anthropic Claude', provider: 'anthropic', apiKey: '', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet', 'claude-3-haiku'], status: 'active', latencyMs: 290, priority: 3 },
  { id: 'deepseek', name: 'DeepSeek AI', provider: 'deepseek', apiKey: '', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'], status: 'active', latencyMs: 180, priority: 4 },
  { id: 'groq', name: 'Groq LPU Acceleration', provider: 'groq', apiKey: '', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'], status: 'active', latencyMs: 85, priority: 5 }
];
let ROUTER_PROVIDERS = loadState('router_providers.json', null);
if (!Array.isArray(ROUTER_PROVIDERS)) {
  ROUTER_PROVIDERS = ROUTER_PROVIDERS_SEED;
  saveState('router_providers.json', ROUTER_PROVIDERS);
}

const ROUTER_ROUTES = [
  { agentId: 'sari', agentName: 'Sari (HR Admin)', primaryModel: 'gemini-2.5-flash', fallbackModel: 'deepseek-chat', provider: 'google', temp: 0.2 },
  { agentId: 'dinda', agentName: 'Dinda (Upwork Freelance)', primaryModel: 'gpt-4o-mini', fallbackModel: 'claude-3-haiku', provider: 'openai', temp: 0.5 },
  { agentId: 'rina', agentName: 'Rina (Personal Branding)', primaryModel: 'claude-3-5-sonnet', fallbackModel: 'gemini-2.5-flash', provider: 'anthropic', temp: 0.7 },
  { agentId: 'siti', agentName: 'Siti (Excel Mastery)', primaryModel: 'gemini-2.5-flash', fallbackModel: 'gpt-4o', provider: 'google', temp: 0.1 },
  { agentId: 'citra', agentName: 'Citra (Instagram Creator)', primaryModel: 'gpt-4o', fallbackModel: 'llama-3.3-70b-versatile', provider: 'openai', temp: 0.8 },
  { agentId: 'maya', agentName: 'Maya (YouTube Creator)', primaryModel: 'claude-3-5-sonnet', fallbackModel: 'gemini-2.5-flash', provider: 'anthropic', temp: 0.7 },
  { agentId: 'zahra', agentName: 'Zahra (TikTok Creator)', primaryModel: 'deepseek-chat', fallbackModel: 'gpt-4o-mini', provider: 'deepseek', temp: 0.9 },
  { agentId: 'dewi', agentName: 'Dewi (Facebook Creator)', primaryModel: 'gemini-2.5-flash', fallbackModel: 'claude-3-haiku', provider: 'google', temp: 0.7 },
  { agentId: 'dira', agentName: 'Dira (Full-Stack Dev)', primaryModel: 'claude-3-5-sonnet', fallbackModel: 'gpt-4o', provider: 'anthropic', temp: 0.2 },
  { agentId: 'fitri', agentName: 'Fitri (3D Designer)', primaryModel: 'gemini-2.5-flash', fallbackModel: 'gpt-4o', provider: 'google', temp: 0.4 }
];

const ROUTER_TRAFFIC_LOGS = [
  { id: 'req_101', ts: new Date(Date.now() - 120000).toISOString(), model: 'gemini-2.5-flash', agent: 'Sari (HR)', promptTokens: 142, completionTokens: 280, latencyMs: 215, status: 200, provider: 'Google Gemini' },
  { id: 'req_102', ts: new Date(Date.now() - 95000).toISOString(), model: 'claude-3-5-sonnet', agent: 'Dira (Full-Stack)', promptTokens: 410, completionTokens: 520, latencyMs: 310, status: 200, provider: 'Anthropic' },
  { id: 'req_103', ts: new Date(Date.now() - 40000).toISOString(), model: 'deepseek-chat', agent: 'Zahra (TikTok)', promptTokens: 88, completionTokens: 195, latencyMs: 175, status: 200, provider: 'DeepSeek' }
];

// SOCIAL MEDIA & ACCOUNT AUTH HUB STATE
const SOCIAL_ACCOUNTS = [
  { id: 'google', name: 'Google Account (Workspace & Auth)', platform: 'Google', handle: 'setiawanprabowo99@gmail.com', agent: 'Sari & Siti', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '🌐' },
  { id: 'youtube', name: 'YouTube Creator Channel', platform: 'YouTube', handle: '@HermesTechStudio', agent: 'Maya', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '▶️' },
  { id: 'instagram', name: 'Instagram Creator Account', platform: 'Instagram', handle: '@hermes_agent_official', agent: 'Citra', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '📸' },
  { id: 'tiktok', name: 'TikTok Creator Hub', platform: 'TikTok', handle: '@hermes_fyp_tech', agent: 'Zahra', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '🎵' },
  { id: 'facebook', name: 'Facebook Page & Group', platform: 'Facebook', handle: 'Komunitas Hermes Indonesia', agent: 'Dewi', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '👥' },
  { id: 'upwork', name: 'Upwork Freelance Profile', platform: 'Upwork', handle: 'Setiawan Prabowo (Full-Stack)', agent: 'Dinda', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '💼' },
  { id: 'github', name: 'GitHub & Personal Brand', platform: 'GitHub', handle: '@sktyawan', agent: 'Rina & Dira', connected: false, status: 'Disconnected — hubungkan via OAuth', token: '', icon: '🐙' },
  { id: 'behance', name: 'Behance & 3D Portfolio', platform: 'Behance', handle: 'be.net/fitri3d', agent: 'Fitri', connected: false, status: 'Disconnected', token: '', icon: '🎨' }
];
// Kembalikan token OAuth dari disk (selamat dari restart)
try {
  const savedTokens = loadState('social_tokens.json', {});
  for (const acc of SOCIAL_ACCOUNTS) {
    const t = savedTokens[acc.id];
    if (t && t.token) {
      acc.token = t.token;
      acc.refreshToken = t.refreshToken || '';
      acc.tokenExpiresAt = t.tokenExpiresAt || null;
      acc.connected = true;
      acc.status = t.status || acc.status;
    }
  }
} catch (e) { /* abaikan */ }
function saveSocialTokens() {
  const out = {};
  for (const acc of SOCIAL_ACCOUNTS) {
    if (acc.token) out[acc.id] = { token: acc.token, refreshToken: acc.refreshToken, tokenExpiresAt: acc.tokenExpiresAt, status: acc.status };
  }
  saveState('social_tokens.json', out);
}

// MULTI-AGENT ORCHESTRATION ENGINE
// Logika inti diekstrak jadi fungsi reusable agar bisa dipanggil dari HTTP maupun cron runner.
// ===== BRAIN NYATA: hasilkan output step orkestrasi memakai AI bila GEMINI_API_KEY ada =====
const BRAIN_ENABLED = !!process.env.GEMINI_API_KEY;
function skillExcerpt(skillName, maxChars = 1500) {
  try {
    const p = path.join(SKILL_DIR, skillName, 'SKILL.md');
    if (!fs.existsSync(p)) return '';
    return fs.readFileSync(p, 'utf-8').slice(0, maxChars);
  } catch (e) { return ''; }
}
async function generateStepWithAI(agent, userGoal, prevOutputs) {
  const context = prevOutputs.length
    ? '\nHasil step sebelumnya (jadikan acuan agar nyambung):\n' + prevOutputs.map((o, i) => `${i + 1}. [${o.agentName}] ${o.output.slice(0, 300)}`).join('\n')
    : '\n(Ini step pertama — mulai dari tujuan di atas.)';
  const prompt =
    `Tujuan orkestrasi: "${userGoal}"\n` +
    `Peranmu: ${agent.name} — ${agent.role}\n` +
    `Ringkasan skill-mu:\n${skillExcerpt(agent.skill)}` +
    context +
    `\nTugasmu: tulis HASIL KERJA konkret untuk step ini dalam Bahasa Indonesia, maksimal 5 kalimat. ` +
    `Jangan basa-basi, langsung ke deliverable yang bisa dieksekusi.`;
  const r = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { temperature: 0.7 }
  });
  const text = (r.text || '').trim();
  if (!text) throw new Error('AI mengembalikan teks kosong');
  return text;
}

async function runOrchestration({ goal, agentIds, workflowPreset, triggeredBy }) {
  const userGoal = goal || 'Eksekusi kolaborasi terintegrasi antar Hermes Agents';

  // Selected or active agents
  const selectedAgentIds = Array.isArray(agentIds) && agentIds.length > 0
    ? agentIds
    : ['sari', 'dinda', 'rina', 'siti', 'citra', 'maya', 'zahra', 'dewi', 'dira', 'fitri', 'rani'];

  const pipelineSteps = [];

  let index = 0;
  for (const aId of selectedAgentIds) {
    const agent = AGENTS.find(a => a.id === aId.toLowerCase());
    if (!agent) { index++; continue; }

    const route = ROUTER_ROUTES.find(r => r.agentId === aId.toLowerCase()) || { primaryModel: 'gemini-2.5-flash', provider: 'google' };

    let stepOutput = '';
    let actionLog = '';

    if (aId === 'sari') {
      stepOutput = `[HR Audit & Compliance] Verifikasi data NIK/BPJS dan checklist compliance PKWT untuk goal: "${userGoal}".`;
      actionLog = `Sari_${new Date().toISOString().split('T')[0]}_orchestrated_hr_audit.log`;
    } else if (aId === 'dinda') {
      stepOutput = `[Upwork Strategy] Penyusunan proposal gig, penetapan hourly rate, dan scoring kelayakan proyek untuk goal: "${userGoal}".`;
      actionLog = `Dinda_${new Date().toISOString().split('T')[0]}_orchestrated_proposal.log`;
    } else if (aId === 'rina') {
      stepOutput = `[Personal Branding] Penjadwalan postingan LinkedIn, thread X, dan pinned repository GitHub untuk goal: "${userGoal}".`;
      actionLog = `Rina_${new Date().toISOString().split('T')[0]}_orchestrated_branding.log`;
    } else if (aId === 'siti') {
      stepOutput = `[Excel Data Audit] Perancangan rumus XLOOKUP, audit duplikasi data, dan rekap otomatis untuk goal: "${userGoal}".`;
      actionLog = `Siti_${new Date().toISOString().split('T')[0]}_orchestrated_excel_audit.log`;
    } else if (aId === 'citra') {
      stepOutput = `[Instagram Content] Produksi 3 varian hook Reels 0-3s, 7 slide Carousel, dan 15 hashtag relevan untuk goal: "${userGoal}".`;
      actionLog = `Citra_${new Date().toISOString().split('T')[0]}_orchestrated_reels.log`;
    } else if (aId === 'maya') {
      stepOutput = `[YouTube SEO Script] Naskah video 8 menit, timestamp B-roll, 3 opsi judul SEO, dan konsep thumbnail untuk goal: "${userGoal}".`;
      actionLog = `Maya_${new Date().toISOString().split('T')[0]}_orchestrated_youtube.log`;
    } else if (aId === 'zahra') {
      stepOutput = `[TikTok FYP Trends] Skenario video 35 detik, integrasi rising audio, dan A/B testing 3 varian hook untuk goal: "${userGoal}".`;
      actionLog = `Zahra_${new Date().toISOString().split('T')[0]}_orchestrated_tiktok.log`;
    } else if (aId === 'dewi') {
      stepOutput = `[Facebook Community] Long-form storytelling, pertanyaan diskusi grup, dan jadwal engagement untuk goal: "${userGoal}".`;
      actionLog = `Dewi_${new Date().toISOString().split('T')[0]}_orchestrated_fb_story.log`;
    } else if (aId === 'dira') {
      stepOutput = `[Full-Stack API & DB] Skema database PostgreSQL, endpoint REST Express dengan Zod validation untuk goal: "${userGoal}".`;
      actionLog = `Dira_${new Date().toISOString().split('T')[0]}_orchestrated_api_build.log`;
    } else if (aId === 'fitri') {
      stepOutput = `[3D Design & Tokens] Setup 3-point lighting render produk, PBR materials, dan token design system untuk goal: "${userGoal}".`;
      actionLog = `Fitri_${new Date().toISOString().split('T')[0]}_orchestrated_3d_render.log`;
    } else if (aId === 'rani') {
      stepOutput = `[Content Analysis] Analisis baseline 10 konten terakhir, identifikasi pola pemenang, dan susun hipotesis teruji untuk goal: "${userGoal}".`;
      actionLog = `Rani_${new Date().toISOString().split('T')[0]}_orchestrated_analysis.log`;
    }

    // Otak beneran: bila GEMINI_API_KEY ada, minta AI menulis output step ini (fallback ke template bila gagal)
    let brainUsed = false;
    if (BRAIN_ENABLED) {
      try {
        stepOutput = await generateStepWithAI(agent, userGoal, pipelineSteps);
        actionLog = `${agent.name}_${new Date().toISOString().split('T')[0]}_orchestrated_ai_brain.log`;
        brainUsed = true;
      } catch (err) {
        console.warn(`[BRAIN] AI gagal untuk ${agent.id}, pakai template:`, err.message);
      }
    }

    // Push action log
    if (actionLog) LOGS.unshift(actionLog);

    // Push inter-agent communication message into Mesh
    const targetAgentId = selectedAgentIds[(index + 1) % selectedAgentIds.length];
    const targetAgent = AGENTS.find(a => a.id === targetAgentId) || { name: 'All Agents' };

    pushRoomMessage(agent.name, targetAgent.name, stepOutput);

    pipelineSteps.push({
      stepNumber: index + 1,
      agentId: agent.id,
      agentName: agent.name,
      skill: agent.skill,
      routedModel: route.primaryModel,
      provider: route.provider,
      output: stepOutput,
      status: 'completed',
      brain: brainUsed ? 'ai' : 'template',
      latencyMs: Math.floor(Math.random() * 120) + 80
    });
    index++;
  }

  if (triggeredBy) {
    LOGS.unshift(`Orchestration_${new Date().toISOString().split('T')[0]}_${triggeredBy}.log`);
  }

  return {
    orchestrationId: 'orch_' + Date.now(),
    goal: userGoal,
    preset: workflowPreset || 'Custom Multi-Agent Pipeline',
    totalSteps: pipelineSteps.length,
    brainMode: BRAIN_ENABLED ? 'ai' : 'template',
    steps: pipelineSteps,
    executedAt: new Date().toISOString()
  };
}

app.post('/api/orchestration/execute', async (req, res) => {
  const { goal, agentIds, workflowPreset } = req.body;
  try {
    res.json({ success: true, ...await runOrchestration({ goal, agentIds, workflowPreset, triggeredBy: 'manual' }) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Orkestrasi gagal: ' + err.message });
  }
});

app.get('/api/social/accounts', (req, res) => {
  res.json({ accounts: SOCIAL_ACCOUNTS });
});

app.put('/api/social/accounts/:id', (req, res) => {
  const { handle, connected, token } = req.body;
  const acc = SOCIAL_ACCOUNTS.find(a => a.id === req.params.id);
  if (!acc) {
    return res.status(404).json({ error: 'Social account not found' });
  }
  if (handle !== undefined) acc.handle = handle;
  if (connected !== undefined) {
    // Connect manual tanpa token dilarang — harus lewat alur OAuth agar status jujur
    if (connected && !acc.token) {
      return res.status(400).json({ error: 'Tidak bisa connect manual — gunakan alur OAuth: /api/social/oauth/' + acc.id + '/start' });
    }
    acc.connected = Boolean(connected);
    if (!acc.connected) {
      acc.token = '';
      acc.refreshToken = '';
      acc.tokenExpiresAt = null;
    }
    acc.status = acc.connected ? 'Connected (Active Token)' : 'Disconnected';
  }
  if (token !== undefined) acc.token = token;
  res.json({ success: true, account: acc });
});

// ===== OAUTH2: koneksi akun sosial beneran (bukan toggle tampilan) =====
// Kredensial tiap platform WAJIB dari env (skill 3.13 — tanpa pengecualian):
//   OAUTH_REDIRECT_BASE=https://dashboard.milikmu.com
//   OAUTH_GOOGLE_CLIENT_ID / OAUTH_GOOGLE_CLIENT_SECRET
//   (prefix kapital per id: GOOGLE, YOUTUBE, FACEBOOK, INSTAGRAM, TIKTOK, UPWORK, GITHUB)
// Daftarkan aplikasi OAuth di tiap platform dulu, lalu isi env di atas.
const OAUTH_PROVIDERS = {
  google:    { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: 'openid email profile' },
  youtube:   { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: 'openid email profile https://www.googleapis.com/auth/youtube.readonly' },
  facebook:  { authorizeUrl: 'https://www.facebook.com/v18.0/dialog/oauth', tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token', scopes: 'public_profile,email' },
  instagram: { authorizeUrl: 'https://www.facebook.com/v18.0/dialog/oauth', tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token', scopes: 'instagram_basic,pages_show_list' },
  tiktok:    { authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/', tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/', scopes: 'user.info.basic' },
  upwork:    { authorizeUrl: 'https://www.upwork.com/ab/account-security/oauth2/authorize', tokenUrl: 'https://www.upwork.com/api/auth/v1/oauth/token.php', scopes: '' },
  github:    { authorizeUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token', scopes: 'read:user' }
  // behance: API publik dihentikan Adobe — tidak didukung
};

function oauthEnv(id) {
  const p = OAUTH_PROVIDERS[id];
  if (!p) return null;
  const pre = 'OAUTH_' + id.toUpperCase();
  const clientId = process.env[pre + '_CLIENT_ID'] || '';
  const clientSecret = process.env[pre + '_CLIENT_SECRET'] || '';
  const redirectBase = (process.env.OAUTH_REDIRECT_BASE || '').replace(/\/$/, '');
  if (!clientId || !clientSecret || !redirectBase) return null;
  return { ...p, clientId, clientSecret, redirectUri: redirectBase + '/api/social/oauth/' + id + '/callback' };
}

const OAUTH_STATES = new Map(); // state -> {id, createdAt}

app.get('/api/social/oauth/:id/status', (req, res) => {
  const acc = SOCIAL_ACCOUNTS.find(a => a.id === req.params.id);
  if (!acc) return res.status(404).json({ error: 'Social account not found' });
  res.json({
    id: acc.id,
    configured: Boolean(oauthEnv(acc.id)),
    connected: acc.connected && Boolean(acc.token),
    tokenExpiresAt: acc.tokenExpiresAt || null
  });
});

app.get('/api/social/oauth/:id/start', (req, res) => {
  const id = req.params.id;
  const cfg = oauthEnv(id);
  if (!cfg) {
    return res.status(400).send(
      `<h3>OAuth "${id}" belum dikonfigurasi</h3>` +
      `<p>Set environment berikut lalu restart server:<br>` +
      `<code>OAUTH_REDIRECT_BASE</code>, ` +
      `<code>OAUTH_${id.toUpperCase()}_CLIENT_ID</code>, ` +
      `<code>OAUTH_${id.toUpperCase()}_CLIENT_SECRET</code></p>` +
      `<p><a href="/">Kembali ke dashboard</a></p>`
    );
  }
  const state = crypto.randomBytes(16).toString('hex');
  OAUTH_STATES.set(state, { id, createdAt: Date.now() });
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: cfg.scopes,
    state
  });
  res.redirect(cfg.authorizeUrl + '?' + params.toString());
});

app.get('/api/social/oauth/:id/callback', async (req, res) => {
  const id = req.params.id;
  const { code, state, error, error_description } = req.query;
  const finish = (ok, msg) => res.send(
    `<html><body style="font-family:sans-serif;padding:40px;max-width:560px">` +
    `<h3>${ok ? '✅' : '❌'} OAuth "${id}": ${ok ? 'terhubung' : 'gagal'}</h3><p>${msg}</p>` +
    `<p><a href="/">Kembali ke dashboard</a> (refresh untuk melihat status terbaru)</p></body></html>`
  );
  if (error) return finish(false, error_description || error);
  const saved = OAUTH_STATES.get(state);
  OAUTH_STATES.delete(state);
  if (!saved || saved.id !== id || Date.now() - saved.createdAt > 10 * 60 * 1000) {
    return finish(false, 'State tidak valid atau kedaluwarsa — ulangi dari dashboard.');
  }
  const cfg = oauthEnv(id);
  if (!cfg) return finish(false, 'Konfigurasi OAuth hilang dari server.');
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: cfg.redirectUri,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret
    });
    const tr = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body.toString()
    });
    const tj = await tr.json();
    if (!tr.ok || !tj.access_token) {
      throw new Error(tj.error_description || tj.error || ('HTTP ' + tr.status));
    }
    const acc = SOCIAL_ACCOUNTS.find(a => a.id === id);
    acc.token = tj.access_token;
    acc.refreshToken = tj.refresh_token || '';
    acc.tokenExpiresAt = tj.expires_in ? new Date(Date.now() + tj.expires_in * 1000).toISOString() : null;
    acc.connected = true;
    acc.status = 'Connected (OAuth 2.0, ' + new Date().toISOString().slice(0, 10) + ')';
    saveSocialTokens();
    LOGS.unshift(`Social_${id}_${new Date().toISOString().split('T')[0]}_oauth_connected.log`);
    return finish(true, 'Token akses tersimpan aman di server. Akun "' + acc.name + '" sekarang terhubung beneran.');
  } catch (err) {
    return finish(false, 'Gagal tukar kode otorisasi: ' + err.message);
  }
});

// 9ROUTER ADMIN & TELEMETRY API
app.get('/api/router/keys', (req, res) => {
  res.json({ keys: ROUTER_KEYS });
});

app.post('/api/router/keys', (req, res) => {
  const { name, rateLimit, budget } = req.body;
  const newKey = {
    id: 'key_' + Date.now(),
    name: name || 'New 9Router Client Key',
    key: 'sk-9r-hermes-' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6),
    rateLimit: Number(rateLimit) || 60,
    budget: Number(budget) || 20.00,
    used: 0.00,
    active: true,
    created: new Date().toISOString().split('T')[0]
  };
  ROUTER_KEYS.unshift(newKey);
  saveRouterKeys();
  res.json({ success: true, key: newKey });
});

app.delete('/api/router/keys/:id', (req, res) => {
  const idx = ROUTER_KEYS.findIndex(k => k.id === req.params.id);
  if (idx !== -1) {
    ROUTER_KEYS.splice(idx, 1);
    saveRouterKeys();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Key not found' });
  }
});

app.get('/api/router/providers', (req, res) => {
  res.json({ providers: ROUTER_PROVIDERS });
});

app.put('/api/router/providers/:id', (req, res) => {
  const { apiKey, baseUrl, models, status, priority } = req.body;
  const p = ROUTER_PROVIDERS.find(item => item.id === req.params.id);
  if (p) {
    if (apiKey !== undefined) p.apiKey = apiKey;
    if (baseUrl !== undefined) p.baseUrl = baseUrl;
    if (models !== undefined) p.models = Array.isArray(models) ? models : models.split(',').map(m => m.trim());
    if (status !== undefined) p.status = status;
    if (priority !== undefined) p.priority = Number(priority);
    saveState('router_providers.json', ROUTER_PROVIDERS);
    res.json({ success: true, provider: p });
  } else {
    res.status(404).json({ error: 'Provider not found' });
  }
});

app.post('/api/router/providers', (req, res) => {
  const { name, provider, apiKey, baseUrl, models } = req.body;
  if (!name || !provider) {
    return res.status(400).json({ error: 'Name and Provider identifier are required' });
  }

  const id = provider.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
  const newProvider = {
    id,
    name,
    provider,
    apiKey: apiKey || '',
    baseUrl: baseUrl || 'https://api.openai.com/v1',
    models: models ? (Array.isArray(models) ? models : models.split(',').map(m => m.trim())) : ['custom-model-v1'],
    status: 'active',
    latencyMs: Math.floor(Math.random() * 100) + 100,
    priority: ROUTER_PROVIDERS.length + 1
  };

  ROUTER_PROVIDERS.push(newProvider);
  res.json({ success: true, provider: newProvider });
});

app.get('/api/router/routes', (req, res) => {
  res.json({ routes: ROUTER_ROUTES });
});

app.put('/api/router/routes', (req, res) => {
  const { agentId, primaryModel, fallbackModel, provider, temp } = req.body;
  const route = ROUTER_ROUTES.find(r => r.agentId === agentId);
  if (route) {
    if (primaryModel) route.primaryModel = primaryModel;
    if (fallbackModel) route.fallbackModel = fallbackModel;
    if (provider) route.provider = provider;
    if (temp !== undefined) route.temp = Number(temp);
    res.json({ success: true, route });
  } else {
    res.status(404).json({ error: 'Agent route not found' });
  }
});

app.get('/api/router/logs', (req, res) => {
  res.json({ logs: ROUTER_TRAFFIC_LOGS });
});

// OPENAI-COMPATIBLE ROUTER ENDPOINTS (/v1/models, /v1/chat/completions)
app.get('/v1/models', (req, res) => {
  const allModels = Array.from(new Set(ROUTER_PROVIDERS.flatMap(p => p.models)));
  res.json({
    object: 'list',
    data: allModels.map(m => ({
      id: m,
      object: 'model',
      created: 1700000000,
      owned_by: '9router-gateway'
    }))
  });
});

// ===== 9ROUTER: teruskan /v1/chat/completions ke provider asli (bukan mock) =====
// Resolve provider dari nama model: cocokkan daftar models, lalu tebak dari nama.
function resolveProvider(model) {
  const m = String(model || '').toLowerCase();
  for (const p of ROUTER_PROVIDERS) {
    if (p.status !== 'active') continue;
    if ((p.models || []).some(x => String(x).toLowerCase() === m)) return p;
  }
  const guess = m.includes('claude') ? 'anthropic'
    : (m.includes('gpt') || /^o[13]/.test(m)) ? 'openai'
    : m.includes('deepseek') ? 'deepseek'
    : m.includes('gemini') ? 'google'
    : (m.includes('llama') || m.includes('mixtral')) ? 'groq' : null;
  if (guess) return ROUTER_PROVIDERS.find(p => p.provider === guess && p.status === 'active') || null;
  return null;
}

// Normalisasi pesan OpenAI -> format contents Gemini
function toGeminiContents(messages) {
  const contents = [];
  for (const msg of messages || []) {
    if (msg.role === 'system') continue;
    contents.push({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(msg.content || '') }] });
  }
  return contents;
}
function geminiSystem(messages) {
  const sys = (messages || []).filter(m => m.role === 'system').map(m => m.content).join('\n');
  return sys ? { parts: [{ text: sys }] } : undefined;
}

// Teruskan request ke provider dan kembalikan dalam format OpenAI chat.completion
async function forwardToProvider(provider, model, body) {
  const { messages, temperature, max_tokens } = body;
  const base = provider.baseUrl.replace(/\/$/, '');

  if (provider.provider === 'anthropic') {
    // Anthropic memakai format /messages sendiri
    const sys = (messages || []).filter(m => m.role === 'system').map(m => m.content).join('\n');
    const msgs = (messages || []).filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }));
    const r = await fetch(base + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': provider.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: max_tokens || 1024, system: sys || undefined, messages: msgs, temperature })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw { status: r.status, message: j.error?.message || ('Anthropic HTTP ' + r.status) };
    const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    return { text, promptTokens: j.usage?.input_tokens || 0, completionTokens: j.usage?.output_tokens || 0, finish: j.stop_reason || 'stop' };
  }

  if (provider.provider === 'google') {
    // Gemini memakai format :generateContent
    const sys = geminiSystem(messages);
    const payload = { contents: toGeminiContents(messages), generationConfig: { temperature } };
    if (sys) payload.systemInstruction = sys;
    const r = await fetch(`${base}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': provider.apiKey },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw { status: r.status, message: j.error?.message || ('Gemini HTTP ' + r.status) };
    const parts = j.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join('');
    return {
      text,
      promptTokens: j.usageMetadata?.promptTokenCount || 0,
      completionTokens: j.usageMetadata?.candidatesTokenCount || 0,
      finish: (j.candidates?.[0]?.finishReason || 'STOP').toLowerCase()
    };
  }

  // openai / deepseek / groq: OpenAI-compatible, teruskan langsung
  const r = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + provider.apiKey },
    body: JSON.stringify({ model, messages, temperature, max_tokens })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw { status: r.status, message: j.error?.message || ('Provider HTTP ' + r.status) };
  const choice = j.choices?.[0] || {};
  return {
    text: choice.message?.content || '',
    promptTokens: j.usage?.prompt_tokens || 0,
    completionTokens: j.usage?.completion_tokens || 0,
    finish: choice.finish_reason || 'stop'
  };
}

app.post('/v1/chat/completions', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  const { model, messages, temperature, max_tokens } = req.body || {};
  const requestedModel = model || 'gemini-2.5-flash';

  // Validasi virtual key — wajib cocok dengan salah satu key aktif (tanpa token = ditolak)
  const validKey = token ? ROUTER_KEYS.find(k => k.active && k.key === token) : null;
  if (!validKey) {
    return res.status(401).json({ error: 'API key tidak valid — gunakan Bearer <redacted> 9Router yang aktif' });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages wajib diisi (array tidak kosong)' });
  }

  const provider = resolveProvider(requestedModel);
  if (!provider) {
    return res.status(400).json({ error: `Model '${requestedModel}' tidak dikenal — cek /v1/models untuk daftar model` });
  }
  if (!provider.apiKey) {
    return res.status(503).json({ error: `Provider ${provider.name} belum dikonfigurasi — isi API key di dashboard tab Setup API > Providers` });
  }

  const t0 = Date.now();
  try {
    const out = await forwardToProvider(provider, requestedModel, { messages, temperature, max_tokens });
    const latencyMs = Date.now() - t0;
    const logEntry = {
      id: 'req_' + Date.now().toString().slice(-4),
      ts: new Date().toISOString(),
      model: requestedModel,
      agent: '9Router Client Proxy',
      promptTokens: out.promptTokens,
      completionTokens: out.completionTokens,
      latencyMs,
      status: 200,
      provider: provider.name
    };
    ROUTER_TRAFFIC_LOGS.unshift(logEntry);
    if (ROUTER_TRAFFIC_LOGS.length > 50) ROUTER_TRAFFIC_LOGS.pop();
    validKey.used = parseFloat((validKey.used + 0.0004).toFixed(4));

    res.json({
      id: 'chatcmpl-9r-' + Math.random().toString(36).substring(2, 10),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: requestedModel,
      choices: [{ index: 0, message: { role: 'assistant', content: out.text }, finish_reason: out.finish }],
      usage: { prompt_tokens: out.promptTokens, completion_tokens: out.completionTokens, total_tokens: out.promptTokens + out.completionTokens },
      _9router_meta: { routed_provider: provider.name, latency_ms: latencyMs, key_authenticated: true }
    });
  } catch (err) {
    const status = err.status || 502;
    ROUTER_TRAFFIC_LOGS.unshift({
      id: 'req_' + Date.now().toString().slice(-4),
      ts: new Date().toISOString(),
      model: requestedModel,
      agent: '9Router Client Proxy',
      promptTokens: 0, completionTokens: 0,
      latencyMs: Date.now() - t0,
      status,
      provider: provider.name
    });
    res.status(status).json({ error: `Provider ${provider.name} gagal: ${err.message || 'unknown error'}` });
  }
});

// API Setup & Health Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'HERMES_SYSTEM_CORE',
    version: '3.8.0',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/webhook/dispatch', (req, res) => {
  const { agent, action, payload } = req.body;
  if (!agent || !action) {
    return res.status(400).json({ error: 'Missing agent or action parameters' });
  }

  // Validasi: pengirim harus agent yang terdaftar
  const sender = findAgent(agent);
  if (!sender) {
    return res.status(400).json({ error: `Unknown agent '${agent}' — pengirim harus salah satu dari ${AGENTS.length} Hermes agents` });
  }

  const logEntry = `${sender.name}_${new Date().toISOString().split('T')[0]}_${action}.log`;
  LOGS.unshift(logEntry);

  let roomMsg = null;
  if (payload && payload.message) {
    // Validasi penerima bila disebut spesifik (selain 'All')
    let toName = 'All';
    if (payload.to && payload.to !== 'All') {
      const target = findAgent(payload.to);
      if (!target) {
        return res.status(400).json({ error: `Unknown target agent '${payload.to}'` });
      }
      toName = target.name;
    }
    roomMsg = pushRoomMessage(sender.name, toName, String(payload.message));
  }

  res.json({
    success: true,
    message: `Webhook dispatch accepted for agent ${sender.name}`,
    logged: logEntry,
    roomMessage: roomMsg
  });
});

// Kirim pesan langsung ke Inter-Agent Mesh (dipakai simulasi debate dashboard)
app.post('/api/room/message', (req, res) => {
  const { from, to, text } = req.body || {};
  if (!from || !text || !String(text).trim()) {
    return res.status(400).json({ error: 'Missing from/text parameters' });
  }
  const sender = findAgent(from);
  if (!sender) {
    return res.status(400).json({ error: `Unknown agent '${from}'` });
  }
  let toName = 'All';
  if (to && to !== 'All') {
    const target = findAgent(to);
    if (!target) {
      return res.status(400).json({ error: `Unknown target agent '${to}'` });
    }
    toName = target.name;
  }
  const msg = pushRoomMessage(sender.name, toName, String(text).trim());
  res.json({ success: true, message: msg });
});

app.get('/api/spec', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'HERMES Agent Control Center API', version: '3.8.0' },
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'System health & uptime monitor' },
      { path: '/api/agents', method: 'GET', description: 'List all Hermes agents' },
      { path: '/api/logs', method: 'GET', description: 'Retrieve system action logs' },
      { path: '/api/room', method: 'GET', description: 'Inter-agent communication mesh history' },
      { path: '/api/proposals', method: 'GET', description: 'Skill improvement proposals' },
      { path: '/api/agents/:id/chat', method: 'GET', description: 'Retrieve conversation history for an agent' },
      { path: '/api/agents/:id/memory', method: 'GET', description: 'Retrieve memory bank for an agent' },
      { path: '/api/skills', method: 'GET', description: 'List skill bank (name, version, updatedAt)' },
      { path: '/api/skills/:skillName', method: 'GET', description: 'Download Markdown definition of a skill' },
      { path: '/api/skills/:skillName/versions', method: 'GET', description: 'Version history of a skill' },
      { path: '/api/skills/:skillName/proposals', method: 'POST', description: 'Agent submits a skill improvement proposal' },
      { path: '/api/proposals/:id', method: 'PUT', description: 'Approve/reject a proposal (approved = new skill version)' },
      { path: '/api/webhook/dispatch', method: 'POST', description: 'Dispatch webhook event to Hermes mesh' },
      { path: '/api/room/message', method: 'POST', description: 'Send a validated message to the inter-agent mesh' }
    ]
  });
});

// API Endpoints expected by kpi-dashboard/kpi.html
app.get('/api/agents', (req, res) => {
  res.json({
    agents: AGENTS.map(({ id, name, role, skill }) => ({ id, name, role, skill }))
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ logs: LOGS });
});

app.get('/api/room', (req, res) => {
  res.json({ room: ROOM_MESSAGES });
});

app.get('/api/proposals', (req, res) => {
  res.json({ proposals: PROPOSALS });
});

// ===== SKILL BANK: agent membaca, mengusulkan, dan mempelajari update skill =====
const SKILL_DIR = path.join(__dirname, 'skills');
const SKILL_NAME_RE = /^[a-z0-9][a-z0-9_-]*$/i; // cegah path traversal (../, /, dll)
const validSkillName = (n) => typeof n === 'string' && SKILL_NAME_RE.test(n) && n.length <= 64;

function loadSkillRegistry() {
  const reg = {};
  if (!fs.existsSync(SKILL_DIR)) return reg;
  for (const name of fs.readdirSync(SKILL_DIR)) {
    if (!validSkillName(name)) continue;
    const mdPath = path.join(SKILL_DIR, name, 'SKILL.md');
    if (!fs.existsSync(mdPath)) continue;
    let meta = { version: 1, updatedAt: fs.statSync(mdPath).mtime.toISOString(), history: [] };
    const metaPath = path.join(SKILL_DIR, name, 'meta.json');
    if (fs.existsSync(metaPath)) {
      try { meta = { ...meta, ...JSON.parse(fs.readFileSync(metaPath, 'utf-8')) }; } catch (e) { /* pakai default */ }
    }
    reg[name] = { name, version: meta.version, updatedAt: meta.updatedAt, history: meta.history || [] };
  }
  return reg;
}
let SKILL_REGISTRY = loadSkillRegistry();

function saveSkillMeta(name) {
  const metaPath = path.join(SKILL_DIR, name, 'meta.json');
  const m = SKILL_REGISTRY[name];
  fs.writeFileSync(metaPath, JSON.stringify({ version: m.version, updatedAt: m.updatedAt, history: m.history }, null, 2));
}

// GET /api/skills — daftar bank skill (nama, versi, kapan diupdate)
app.get('/api/skills', (req, res) => {
  res.json({ skills: Object.values(SKILL_REGISTRY) });
});

// GET /api/skills/:skillName — baca isi SKILL.md (sudah divalidasi, anti path traversal)
app.get('/api/skills/:skillName', (req, res) => {
  const name = req.params.skillName;
  if (!validSkillName(name)) return res.status(400).json({ error: 'Invalid skill name' });
  const skillPath = path.join(SKILL_DIR, name, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    res.type('text/markdown').send(fs.readFileSync(skillPath, 'utf-8'));
  } else {
    res.status(404).json({ error: 'Skill not found' });
  }
});

// GET /api/skills/:skillName/versions — riwayat versi skill
app.get('/api/skills/:skillName/versions', (req, res) => {
  const name = req.params.skillName;
  if (!validSkillName(name) || !SKILL_REGISTRY[name]) return res.status(404).json({ error: 'Skill not found' });
  res.json({ skill: name, version: SKILL_REGISTRY[name].version, history: SKILL_REGISTRY[name].history });
});

// POST /api/skills/:skillName/proposals — agent mengajukan perbaikan skill
app.post('/api/skills/:skillName/proposals', (req, res) => {
  const name = req.params.skillName;
  if (!validSkillName(name) || !SKILL_REGISTRY[name]) return res.status(404).json({ error: 'Skill not found' });
  const { agent, title, changes, reason } = req.body || {};
  if (!findAgent(agent)) return res.status(400).json({ error: `agent tidak dikenal (harus salah satu dari ${AGENTS.length} agent)` });
  if (typeof title !== 'string' || !title.trim() || title.length > 200)
    return res.status(400).json({ error: 'title wajib diisi (maks 200 karakter)' });
  if (typeof changes !== 'string' || !changes.trim() || changes.length > 200000)
    return res.status(400).json({ error: 'changes wajib diisi (isi SKILL.md baru, maks 200KB)' });
  const proposal = {
    id: 'prop-' + (++SKILL_PROPOSAL_SEQ),
    agent, skill: name,
    title: title.trim(),
    changes,
    reason: typeof reason === 'string' ? reason.slice(0, 1000) : '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  PROPOSALS.unshift(proposal);
  saveState('proposals.json', PROPOSALS);
  LOGS.unshift(`Skill_${new Date().toISOString().split('T')[0]}_proposal_${proposal.id}_pending.log`);
  res.status(201).json({ proposal });
});

// PUT /api/proposals/:id — setujui / tolak usulan (yang disetujui langsung jadi versi baru)
app.put('/api/proposals/:id', (req, res) => {
  const p = PROPOSALS.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Proposal not found' });
  const { status, note } = req.body || {};
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ error: "status harus 'approved' atau 'rejected'" });
  if (p.status !== 'pending')
    return res.status(409).json({ error: `proposal sudah ${p.status}` });
  p.status = status;
  p.reviewedAt = new Date().toISOString();
  if (note) p.reviewNote = String(note).slice(0, 500);

  if (status === 'approved' && p.changes) {
    // arsipkan versi lama, tulis versi baru, naikkan nomor versi
    const dir = path.join(SKILL_DIR, p.skill);
    const mdPath = path.join(dir, 'SKILL.md');
    const histDir = path.join(dir, 'history');
    fs.mkdirSync(histDir, { recursive: true });
    const oldVersion = SKILL_REGISTRY[p.skill].version;
    fs.writeFileSync(path.join(histDir, `v${oldVersion}-${Date.now()}.md`), fs.readFileSync(mdPath, 'utf-8'));
    fs.writeFileSync(mdPath, p.changes);
    SKILL_REGISTRY[p.skill].version = oldVersion + 1;
    SKILL_REGISTRY[p.skill].updatedAt = new Date().toISOString();
    SKILL_REGISTRY[p.skill].history.unshift({
      version: oldVersion + 1, proposalId: p.id, agent: p.agent,
      title: p.title, at: SKILL_REGISTRY[p.skill].updatedAt
    });
    saveSkillMeta(p.skill);
    LOGS.unshift(`Skill_${new Date().toISOString().split('T')[0]}_${p.skill}_v${oldVersion + 1}_approved.log`);
  } else {
    LOGS.unshift(`Skill_${new Date().toISOString().split('T')[0]}_proposal_${p.id}_rejected.log`);
  }
  saveState('proposals.json', PROPOSALS);
  res.json({ proposal: p });
});

// CRON SCHEDULER STATE
// ===== CRON RUNNER: eksekutor jadwal beneran (bukan cuma tampilan) =====
// Parser ekspresi cron 5 field: menit jam tanggal bulan hari.
// Mendukung: * | */n | a-b | a-b/n | v1,v2,v3 | angka tunggal.
function parseCronField(field, min, max, label) {
  const values = new Set();
  for (const part of String(field).split(',')) {
    let step = 1;
    let range = part.trim();
    if (range.includes('/')) {
      const [r, s] = range.split('/');
      range = r.trim();
      step = parseInt(s.trim(), 10);
      if (!step || step < 1) throw new Error(`cron: step tidak valid di field ${label}`);
    }
    let lo = min, hi = max;
    if (range === '*') {
      // seluruh rentang
    } else if (range.includes('-')) {
      const [a, b] = range.split('-').map(v => Number(v.trim()));
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < min || b > max || a > b) {
        throw new Error(`cron: rentang tidak valid '${part}' di field ${label}`);
      }
      lo = a; hi = b;
    } else {
      const v = Number(range);
      if (!Number.isInteger(v) || v < min || v > max) {
        throw new Error(`cron: nilai tidak valid '${part}' di field ${label} (batas ${min}-${max})`);
      }
      lo = hi = v;
    }
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  if (values.size === 0) throw new Error(`cron: field ${label} kosong`);
  return values;
}

function cronMatches(expr, date) {
  const parts = String(expr).trim().split(/\s+/);
  if (parts.length !== 5) throw new Error('cron: format harus 5 field "menit jam tanggal bulan hari"');
  const mi = parseCronField(parts[0], 0, 59, 'menit');
  const hh = parseCronField(parts[1], 0, 23, 'jam');
  const dd = parseCronField(parts[2], 1, 31, 'tanggal');
  const mo = parseCronField(parts[3], 1, 12, 'bulan');
  const wd = parseCronField(parts[4], 0, 7, 'hari');
  const dow = date.getDay(); // 0 = Minggu
  const wdMatch = wd.has(dow) || (dow === 0 && wd.has(7));
  return mi.has(date.getMinutes()) && hh.has(date.getHours()) && dd.has(date.getDate())
      && mo.has(date.getMonth() + 1) && wdMatch;
}

function validateCronExpr(expr) {
  cronMatches(expr, new Date()); // lempar error bila tidak valid
  return true;
}

let CRON_RUN_HISTORY = loadState('cron_history.json', null) || []; // {scheduleId, name, startedAt, totalSteps, status, error?}

async function executeSchedule(schedule) {
  const minuteKey = new Date().toISOString().slice(0, 16); // cegah eksekusi ganda di menit yang sama
  if (schedule._lastFiredMinute === minuteKey) return;
  schedule._lastFiredMinute = minuteKey;

  const startedAt = new Date().toISOString();
  try {
    const result = await runOrchestration({
      goal: `Jadwal otomatis: ${schedule.name}`,
      agentIds: schedule.targetAgents,
      workflowPreset: schedule.preset,
      triggeredBy: `cron:${schedule.id}`
    });
    schedule.lastRun = startedAt;
    schedule.lastStatus = 'completed';
    CRON_RUN_HISTORY.unshift({
      scheduleId: schedule.id, name: schedule.name, startedAt,
      totalSteps: result.totalSteps, status: 'completed'
    });
    pushRoomMessage('Scheduler', 'All', `⏰ Cron "${schedule.name}" dieksekusi: ${result.totalSteps} langkah selesai.`);
  } catch (err) {
    schedule.lastStatus = 'failed';
    CRON_RUN_HISTORY.unshift({
      scheduleId: schedule.id, name: schedule.name, startedAt,
      totalSteps: 0, status: 'failed', error: err.message
    });
    console.error(`[CRON] schedule ${schedule.id} gagal:`, err.message);
  }
  if (CRON_RUN_HISTORY.length > 50) CRON_RUN_HISTORY.pop();
  saveState('cron_history.json', CRON_RUN_HISTORY);
  saveState('cron_schedules.json', CRON_SCHEDULES); // lastRun/lastStatus ikut tersimpan
}

function checkCronSchedules() {
  const now = new Date();
  for (const s of CRON_SCHEDULES) {
    if (!s.active) continue;
    try {
      if (cronMatches(s.cronExpr, now)) executeSchedule(s);
    } catch (err) {
      // Ekspresi invalid: tandai sekali agar tidak spam log tiap 30 detik
      if (s._cronError !== err.message) {
        s._cronError = err.message;
        console.error(`[CRON] jadwal ${s.id} dilewati: ${err.message}`);
      }
    }
  }
}

let CRON_SCHEDULES = loadState('cron_schedules.json', null) || [
  { id: 'cron_1', name: 'Daily Content Repurpose Broadcast', cronExpr: '0 9 * * *', preset: 'repurpose', targetAgents: ['maya', 'citra', 'zahra', 'dewi'], active: true, lastRun: '2026-10-06 09:00:00' },
  { id: 'cron_2', name: 'Bi-Weekly HR & Excel Compliance Audit', cronExpr: '0 0 1,15 * *', preset: 'fullstack', targetAgents: ['sari', 'siti', 'dira'], active: true, lastRun: '2026-10-01 00:00:00' }
];

// LIVE GEMINI AI CHAT ENDPOINT FOR AGENTS
app.post('/api/agents/:id/chat/live', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const agent = AGENTS.find(
    (a) => a.id === req.params.id.toLowerCase() || a.name.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Push user prompt into agent's chat history
  agent.chats.push({ role: 'user', content: prompt.trim() });

  let responseText = '';
  try {
    const systemInstruction = `Anda adalah ${agent.name}, ${agent.role}. Anda bertindak profesional, cerdas, dan responsif. Memori referensi Anda:\n${agent.memory.join('\n')}\nJawablah pesan user secara langsung, ringkas, dan actionable dalam Bahasa Indonesia.`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt.trim(),
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    responseText = aiRes.text || `[Respon ${agent.name}] Siap, instruksi Anda telah diproses oleh ${agent.name}.`;
  } catch (err) {
    console.error('Gemini API live chat error:', err);
    responseText = `[${agent.name} AI Fallback] Instruksi Anda telah dicatat: "${prompt.trim()}". Pembaruan task akan dikirimkan ke log Mesh.`;
  }

  // Push assistant response
  agent.chats.push({ role: 'assistant', content: responseText });

  // Log action
  LOGS.unshift(`${agent.id.charAt(0).toUpperCase() + agent.id.slice(1)}_${new Date().toISOString().split('T')[0]}_live_chat_gemini.log`);

  res.json({
    success: true,
    agentId: agent.id,
    agentName: agent.name,
    responseText,
    history: agent.chats
  });
});

// EXPORT KPI & AUDIT REPORT ENDPOINT
app.get('/api/export/report', (req, res) => {
  const format = req.query.format || 'json';

  if (format === 'csv') {
    let csv = 'Agent ID,Agent Name,Skill,Role,Chats Count,Memory Count\n';
    AGENTS.forEach(ag => {
      csv += `"${ag.id}","${ag.name}","${ag.skill}","${ag.role.replace(/"/g, '""')}",${ag.chats.length},${ag.memory.length}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hermes-kpi-report.csv"');
    return res.send(csv);
  }

  res.json({
    generatedAt: new Date().toISOString(),
    system: 'HERMES_CONTROL_CENTER',
    totalAgents: AGENTS.length,
    agentsSummary: AGENTS.map(ag => ({
      id: ag.id,
      name: ag.name,
      skill: ag.skill,
      chatsCount: ag.chats.length,
      memoryCount: ag.memory.length
    })),
    logsCount: LOGS.length,
    routerKeysCount: ROUTER_KEYS.length,
    socialAccountsCount: SOCIAL_ACCOUNTS.length
  });
});

// CRON SCHEDULER ENDPOINTS
app.get('/api/scheduler/cron', (req, res) => {
  res.json({
    schedules: CRON_SCHEDULES.map(({ _lastFiredMinute, _cronError, ...s }) => s),
    history: CRON_RUN_HISTORY
  });
});

app.post('/api/scheduler/cron', (req, res) => {
  const { name, cronExpr, preset, targetAgents, active } = req.body;
  if (!name || !cronExpr) {
    return res.status(400).json({ error: 'Name and Cron Expression are required' });
  }
  try {
    validateCronExpr(cronExpr);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const agents = Array.isArray(targetAgents) && targetAgents.length > 0
    ? targetAgents.filter(id => findAgent(id)).map(id => findAgent(id).id)
    : ['maya', 'citra', 'dira'];
  if (agents.length === 0) {
    return res.status(400).json({ error: 'targetAgents tidak berisi agent yang dikenal' });
  }

  const newSchedule = {
    id: 'cron_' + Date.now(),
    name: String(name).trim().slice(0, 80),
    cronExpr: String(cronExpr).trim(),
    preset: preset || 'all',
    targetAgents: agents,
    active: active !== false,
    lastRun: 'Pending First Run',
    lastStatus: null
  };

  CRON_SCHEDULES.unshift(newSchedule);
  saveState('cron_schedules.json', CRON_SCHEDULES);
  res.json({ success: true, schedule: newSchedule });
});

app.put('/api/scheduler/cron/:id', (req, res) => {
  const s = CRON_SCHEDULES.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Schedule not found' });
  const { name, cronExpr, preset, targetAgents, active } = req.body;
  if (cronExpr !== undefined) {
    try { validateCronExpr(cronExpr); } catch (err) {
      return res.status(400).json({ error: err.message });
    }
    s.cronExpr = String(cronExpr).trim();
    s._cronError = undefined;
  }
  if (name !== undefined) s.name = String(name).trim().slice(0, 80);
  if (preset !== undefined) s.preset = preset;
  if (targetAgents !== undefined) {
    const agents = (Array.isArray(targetAgents) ? targetAgents : [])
      .filter(id => findAgent(id)).map(id => findAgent(id).id);
    if (agents.length === 0) return res.status(400).json({ error: 'targetAgents tidak berisi agent yang dikenal' });
    s.targetAgents = agents;
  }
  if (active !== undefined) s.active = Boolean(active);
  saveState('cron_schedules.json', CRON_SCHEDULES);
  res.json({ success: true, schedule: s });
});

app.delete('/api/scheduler/cron/:id', (req, res) => {
  const idx = CRON_SCHEDULES.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Schedule not found' });
  CRON_SCHEDULES.splice(idx, 1);
  saveState('cron_schedules.json', CRON_SCHEDULES);
  res.json({ success: true });
});

// ANALYTICS & CHARTS DATA ENDPOINT
app.get('/api/analytics/charts', (req, res) => {
  res.json({
    taskDistribution: AGENTS.map(ag => ({
      agent: ag.name,
      tasks: Math.floor(Math.random() * 15) + 5,
      chats: ag.chats.length
    })),
    routerTraffic24h: [
      { hour: '00:00', requests: 42, latencyMs: 180 },
      { hour: '04:00', requests: 18, latencyMs: 165 },
      { hour: '08:00', requests: 120, latencyMs: 210 },
      { hour: '12:00', requests: 210, latencyMs: 230 },
      { hour: '16:00', requests: 185, latencyMs: 195 },
      { hour: '20:00', requests: 95, latencyMs: 175 }
    ]
  });
});

app.get('/api/agents/:id/chat', (req, res) => {
  const agent = AGENTS.find(
    (a) => a.id === req.params.id.toLowerCase() || a.name.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!agent) {
    return res.status(404).json({ history: [] });
  }
  res.json({ history: agent.chats });
});

app.get('/api/agents/:id/memory', (req, res) => {
  const agent = AGENTS.find(
    (a) => a.id === req.params.id.toLowerCase() || a.name.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!agent) {
    return res.status(404).json({ memory: '' });
  }
  res.json({ memory: agent.memory.join('\n') });
});

// Serve static files from kpi-dashboard
const dashboardDir = path.join(__dirname, 'kpi-dashboard');
app.use(express.static(dashboardDir));

// Serve generated images directory
const assetsDir = path.join(__dirname, 'src/assets/images');
app.use('/src/assets/images', express.static(assetsDir));

// Serve kpi.html at root "/" and "/kpi.html"
app.get('/', (req, res) => {
  res.sendFile(path.join(dashboardDir, 'kpi.html'));
});

app.get('/kpi.html', (req, res) => {
  res.sendFile(path.join(dashboardDir, 'kpi.html'));
});

// Cron runner aktif: cek tiap 30 detik (dievaluasi per menit)
setInterval(checkCronSchedules, 30000);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`KPI Dashboard server running on http://0.0.0.0:${PORT}`);
});
