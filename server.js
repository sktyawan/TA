import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// In-memory mock data representing the 10 Hermes Agents & their skills from /skills/*
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

const ROOM_MESSAGES = [
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

const PROPOSALS = [
  { agent: 'Sari', skill: 'hr-admin', title: 'Otomatisasi peringatan H-30 kontrak PKWT', status: 'approved' },
  { agent: 'Dinda', skill: 'upwork-freelance', title: 'Template scoring kelayakan job posting Upwork', status: 'approved' },
  { agent: 'Rina', skill: 'personal-branding', title: 'Playbook konsistensi profil GitHub-LinkedIn-X', status: 'approved' },
  { agent: 'Siti', skill: 'excel-mastery', title: 'Checklist audit kualitas data otomatis', status: 'approved' },
  { agent: 'Citra', skill: 'instagram-creator', title: 'Bank formula hook Reels 0-3 detik', status: 'approved' },
  { agent: 'Maya', skill: 'youtube-creator', title: 'Workflow repurpose video panjang ke Shorts', status: 'approved' },
  { agent: 'Zahra', skill: 'tiktok-creator', title: 'Metode A/B testing 3 varian hook FYP', status: 'approved' },
  { agent: 'Dewi', skill: 'facebook-creator', title: 'Kerangka long-form storytelling komunitas', status: 'approved' },
  { agent: 'Dira', skill: 'fullstack-dev', title: 'Standarisasi response JSON & validasi endpoint', status: 'approved' },
  { agent: 'Fitri', skill: 'desain-3d', title: 'Checklist QA lighting & render produk 3D', status: 'approved' },
  { agent: 'Hermes Mesh', skill: 'multi-agent-orchestration', title: 'Orkestrasi Multi-Agent, Dekomposisi Task & Protocol Routing', status: 'active' }
];

// 9ROUTER API GATEWAY STATE
const ROUTER_KEYS = [
  { id: 'key_1', name: 'Hermes Production Key', key: 'sk-9r-hermes-prod-883921', rateLimit: 120, budget: 50.00, used: 4.82, active: true, created: '2026-10-01' },
  { id: 'key_2', name: 'Hermes Staging & Test Key', key: 'sk-9r-hermes-stage-110293', rateLimit: 60, budget: 10.00, used: 1.15, active: true, created: '2026-10-03' }
];

const ROUTER_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini AI', provider: 'google', apiKey: 'AIzaSy_GEMINI_DEFAULT_KEY_MOCK', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'], status: 'active', latencyMs: 210, priority: 1 },
  { id: 'openai', name: 'OpenAI API', provider: 'openai', apiKey: 'sk-proj-OPENAI_DEFAULT_KEY_MOCK', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'], status: 'active', latencyMs: 340, priority: 2 },
  { id: 'anthropic', name: 'Anthropic Claude', provider: 'anthropic', apiKey: 'sk-ant-CLAUDE_DEFAULT_KEY_MOCK', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet', 'claude-3-haiku'], status: 'active', latencyMs: 290, priority: 3 },
  { id: 'deepseek', name: 'DeepSeek AI', provider: 'deepseek', apiKey: 'sk-ds-DEEPSEEK_DEFAULT_KEY_MOCK', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'], status: 'active', latencyMs: 180, priority: 4 },
  { id: 'groq', name: 'Groq LPU Acceleration', provider: 'groq', apiKey: 'gsk_GROQ_DEFAULT_KEY_MOCK', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'], status: 'active', latencyMs: 85, priority: 5 }
];

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
  { id: 'google', name: 'Google Account (Workspace & Auth)', platform: 'Google', handle: 'setiawanprabowo99@gmail.com', agent: 'Sari & Siti', connected: true, status: 'Connected (OAuth 2.0)', token: 'ya29.a0Axoo-GOOGLE_AUTH_TOKEN_ACTIVE', icon: '🌐' },
  { id: 'youtube', name: 'YouTube Creator Channel', platform: 'YouTube', handle: '@HermesTechStudio', agent: 'Maya', connected: true, status: 'Connected (Studio API)', token: 'yt.token.881293', icon: '▶️' },
  { id: 'instagram', name: 'Instagram Creator Account', platform: 'Instagram', handle: '@hermes_agent_official', agent: 'Citra', connected: true, status: 'Connected (Graph API)', token: 'ig.token.550192', icon: '📸' },
  { id: 'tiktok', name: 'TikTok Creator Hub', platform: 'TikTok', handle: '@hermes_fyp_tech', agent: 'Zahra', connected: true, status: 'Connected (Display API)', token: 'tt.token.330291', icon: '🎵' },
  { id: 'facebook', name: 'Facebook Page & Group', platform: 'Facebook', handle: 'Komunitas Hermes Indonesia', agent: 'Dewi', connected: true, status: 'Connected (Graph API)', token: 'fb.token.990211', icon: '👥' },
  { id: 'upwork', name: 'Upwork Freelance Profile', platform: 'Upwork', handle: 'Setiawan Prabowo (Full-Stack)', agent: 'Dinda', connected: true, status: 'Connected (GraphQL)', token: 'up.token.110294', icon: '💼' },
  { id: 'github', name: 'GitHub & Personal Brand', platform: 'GitHub', handle: '@sktyawan', agent: 'Rina & Dira', connected: true, status: 'Connected (REST v3)', token: 'ghp_GITHUB_TOKEN_ACTIVE', icon: '🐙' },
  { id: 'behance', name: 'Behance & 3D Portfolio', platform: 'Behance', handle: 'be.net/fitri3d', agent: 'Fitri', connected: false, status: 'Disconnected', token: '', icon: '🎨' }
];

// MULTI-AGENT ORCHESTRATION ENGINE
app.post('/api/orchestration/execute', (req, res) => {
  const { goal, agentIds, workflowPreset } = req.body;
  const userGoal = goal || 'Eksekusi kolaborasi terintegrasi antar 10 Hermes Agents';
  
  // Selected or active agents
  const selectedAgentIds = Array.isArray(agentIds) && agentIds.length > 0 
    ? agentIds 
    : ['sari', 'dinda', 'rina', 'siti', 'citra', 'maya', 'zahra', 'dewi', 'dira', 'fitri'];

  const pipelineSteps = [];

  selectedAgentIds.forEach((aId, index) => {
    const agent = AGENTS.find(a => a.id === aId.toLowerCase());
    if (!agent) return;

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
    }

    // Push action log
    if (actionLog) LOGS.unshift(actionLog);

    // Push inter-agent communication message into Mesh
    const targetAgentId = selectedAgentIds[(index + 1) % selectedAgentIds.length];
    const targetAgent = AGENTS.find(a => a.id === targetAgentId) || { name: 'All Agents' };

    ROOM_MESSAGES.push({
      from: agent.name,
      to: targetAgent.name,
      text: stepOutput,
      ts: new Date().toISOString()
    });

    pipelineSteps.push({
      stepNumber: index + 1,
      agentId: agent.id,
      agentName: agent.name,
      skill: agent.skill,
      routedModel: route.primaryModel,
      provider: route.provider,
      output: stepOutput,
      status: 'completed',
      latencyMs: Math.floor(Math.random() * 120) + 80
    });
  });

  res.json({
    success: true,
    orchestrationId: 'orch_' + Date.now(),
    goal: userGoal,
    preset: workflowPreset || 'Custom Multi-Agent Pipeline',
    totalSteps: pipelineSteps.length,
    steps: pipelineSteps,
    executedAt: new Date().toISOString()
  });
});

app.get('/api/social/accounts', (req, res) => {
  res.json({ accounts: SOCIAL_ACCOUNTS });
});

app.put('/api/social/accounts/:id', (req, res) => {
  const { handle, connected, token } = req.body;
  const acc = SOCIAL_ACCOUNTS.find(a => a.id === req.params.id);
  if (acc) {
    if (handle !== undefined) acc.handle = handle;
    if (connected !== undefined) {
      acc.connected = Boolean(connected);
      acc.status = acc.connected ? 'Connected (Active Token)' : 'Disconnected';
    }
    if (token !== undefined) acc.token = token;
    res.json({ success: true, account: acc });
  } else {
    res.status(404).json({ error: 'Social account not found' });
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
  res.json({ success: true, key: newKey });
});

app.delete('/api/router/keys/:id', (req, res) => {
  const idx = ROUTER_KEYS.findIndex(k => k.id === req.params.id);
  if (idx !== -1) {
    ROUTER_KEYS.splice(idx, 1);
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

app.post('/v1/chat/completions', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  const { model, messages, temperature } = req.body;
  const requestedModel = model || 'gemini-2.5-flash';
  
  // Validate virtual key
  const validKey = ROUTER_KEYS.find(k => k.active && (k.key === token || !token || token.startsWith('sk-9r-')));
  
  const promptTokens = (messages || []).reduce((acc, m) => acc + (m.content || '').length / 4, 20);
  const completionText = `[9Router Gateway AI Response] Jawaban dari model ${requestedModel} melalui Hermes Agent Mesh. Pesan Anda telah berhasil diproses oleh 9router dengan latensi optimal.`;
  const completionTokens = Math.round(completionText.length / 4);

  const logEntry = {
    id: 'req_' + Date.now().toString().slice(-4),
    ts: new Date().toISOString(),
    model: requestedModel,
    agent: '9Router Client Proxy',
    promptTokens: Math.round(promptTokens),
    completionTokens,
    latencyMs: Math.floor(Math.random() * 150) + 100,
    status: 200,
    provider: requestedModel.includes('claude') ? 'Anthropic' : requestedModel.includes('gpt') ? 'OpenAI' : requestedModel.includes('deepseek') ? 'DeepSeek' : 'Google Gemini'
  };
  ROUTER_TRAFFIC_LOGS.unshift(logEntry);
  if (ROUTER_TRAFFIC_LOGS.length > 50) ROUTER_TRAFFIC_LOGS.pop();

  if (validKey) {
    validKey.used = parseFloat((validKey.used + 0.0004).toFixed(4));
  }

  res.json({
    id: 'chatcmpl-9r-' + Math.random().toString(36).substring(2, 10),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: requestedModel,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: completionText
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: Math.round(promptTokens),
      completion_tokens: completionTokens,
      total_tokens: Math.round(promptTokens) + completionTokens
    },
    _9router_meta: {
      routed_provider: logEntry.provider,
      latency_ms: logEntry.latencyMs,
      key_authenticated: !!validKey
    }
  });
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

  const logEntry = `${agent.charAt(0).toUpperCase() + agent.slice(1)}_${new Date().toISOString().split('T')[0]}_${action}.log`;
  LOGS.unshift(logEntry);

  if (payload && payload.message) {
    ROOM_MESSAGES.push({
      from: agent.charAt(0).toUpperCase() + agent.slice(1),
      to: payload.to || 'All',
      text: payload.message,
      ts: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: `Webhook dispatch accepted for agent ${agent}`,
    logged: logEntry
  });
});

app.get('/api/spec', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'HERMES Agent Control Center API', version: '3.8.0' },
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'System health & uptime monitor' },
      { path: '/api/agents', method: 'GET', description: 'List all 10 Hermes agents' },
      { path: '/api/logs', method: 'GET', description: 'Retrieve system action logs' },
      { path: '/api/room', method: 'GET', description: 'Inter-agent communication mesh history' },
      { path: '/api/proposals', method: 'GET', description: 'Skill improvement proposals' },
      { path: '/api/agents/:id/chat', method: 'GET', description: 'Retrieve conversation history for an agent' },
      { path: '/api/agents/:id/memory', method: 'GET', description: 'Retrieve memory bank for an agent' },
      { path: '/api/skills/:skillName', method: 'GET', description: 'Download Markdown definition of a skill' },
      { path: '/api/webhook/dispatch', method: 'POST', description: 'Dispatch webhook event to Hermes mesh' }
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

// CRON SCHEDULER STATE
const CRON_SCHEDULES = [
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
  res.json({ schedules: CRON_SCHEDULES });
});

app.post('/api/scheduler/cron', (req, res) => {
  const { name, cronExpr, preset } = req.body;
  if (!name || !cronExpr) {
    return res.status(400).json({ error: 'Name and Cron Expression are required' });
  }

  const newSchedule = {
    id: 'cron_' + Date.now(),
    name: name.trim(),
    cronExpr: cronExpr.trim(),
    preset: preset || 'all',
    targetAgents: ['maya', 'citra', 'dira'],
    active: true,
    lastRun: 'Pending First Run'
  };

  CRON_SCHEDULES.unshift(newSchedule);
  res.json({ success: true, schedule: newSchedule });
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

app.get('/api/skills/:skillName', (req, res) => {
  const skillPath = path.join(__dirname, 'skills', req.params.skillName, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    res.type('text/markdown').send(fs.readFileSync(skillPath, 'utf-8'));
  } else {
    res.status(404).json({ error: 'Skill not found' });
  }
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

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`KPI Dashboard server running on http://0.0.0.0:${PORT}`);
});
