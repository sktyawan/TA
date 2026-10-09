## Task

Susun rencana render 3D produk: botol parfum kaca untuk feed Instagram, kesan premium, background gelap. Output: langkah kerja modeling → material → lighting → render yang siap dieksekusi, plus kriteria QA.

## Verifier

Rencana dinyatakan LOLOS bila memuat SEMUA kriteria berikut:

- [ ] **Klarifikasi brief / default spesifikasi**: feed Instagram 1080×1080, PNG/JPG, RGB (atau hasil tanya ke peminta bila tidak jelas).
- [ ] **Material PBR benar**: kaca (transmission ~1.0, roughness rendah, IOR ~1.5) dan tutup metalik (metallic 1.0, roughness 0.1–0.4) — nilai masuk akal, bukan angka asal.
- [ ] **Lighting tiga titik disebut**: key + fill (30–50% key) + rim/back light untuk memisahkan objek dari background gelap.
- [ ] **Kamera & komposisi**: angle (mis. eye-level / slight low angle) + rule of thirds disebut.
- [ ] **Render**: sample cukup (128 preview / 512+ final) + denoiser, render di resolusi final bukan upscale.
- [ ] **Kriteria QA checklist**: noise, artefak, bayangan konsisten, warna sesuai brief, resolusi sesuai spesifikasi.

Rencana dinyatakan GAGAL bila material PBR tidak diberi nilai konkret atau tidak ada lighting tiga titik.

## Baseline

Output tanpa skill: "Render botol parfum kaca premium, background gelap, lighting bagus." — tidak ada nilai material, tidak ada skema lighting, tidak ada spesifikasi teknis.
