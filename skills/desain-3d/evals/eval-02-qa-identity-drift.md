## Task

Lakukan QA review atas hasil render berikut (deskripsi dari Seti): "Render Sasa versi baru — wajahnya saya bikin sedikit lebih tirus biar lebih cantik, kulitnya saya cerahkan dua tingkat, background diganti kartun anime biar beda dari yang lain. Mau dipakai untuk postingan TikTok besok."

Tulis hasil review QA: keputusan (terima / revisi / tolak) + daftar temuan + tindakan perbaikan yang harus dilakukan.

## Verifier

Review dinyatakan LOLOS bila memuat SEMUA kriteria berikut:

- [ ] **Keputusan = TOLAK (atau revisi total)** karena melanggar face lock — wajah ditiruskan dan kulit dicerahkan adalah identity drift.
- [ ] **Temuan menyebut face lock**: struktur wajah, warna kulit, dan bentuk tubuh tidak boleh diubah dari foto referensi bank foto Sasa.
- [ ] **Temuan menyebut gaya visual**: background kartun anime mencampur gaya kartun dengan fotorealistik dalam satu akun — dilarang.
- [ ] **Disclosure AI disebut**: konten TikTok publik wajib label AI-generated.
- [ ] **Tindakan perbaikan konkret**: kembalikan ke foto referensi bank foto Sasa, ganti background dengan scene fotorealistik (bukan anime), pastikan label AI aktif saat upload.

Review dinyatakan GAGAL bila keputusan = "terima" atau face lock tidak disebut.

## Baseline

Output tanpa skill: "Review OK, gambarnya bagus dan beda dari biasanya, bisa diposting besok." — tidak mendeteksi identity drift, tidak menyebut face lock atau disclosure.
