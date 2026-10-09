# Nilai Material PBR & Skema Lighting 3D

Dipindah dari SKILL.md agar ringkas. Buka file ini saat mengerjakan render produk 3D.

## Nilai PBR cepat

| Material | Base color | Roughness | Metallic | Catatan |
|---|---|---|---|---|
| Plastik matte | sesuai produk | 0.6–0.9 | 0 | — |
| Plastik glossy | sesuai produk | 0.2–0.4 | 0 | — |
| Logam (emas, chrome) | sesuai logam | 0.1–0.4 | 1.0 | roughness rendah = reflektif |
| Kaca | putih/transparan | < 0.05 | 0 | transmission 1.0, IOR 1.5 |
| Kain matte | sesuai produk | 0.8–1.0 | 0 | tambah normal map serat bila close-up |
| Kayu | sesuai produk | 0.4–0.7 | 0 | roughness map dari grain |

- Selalu cek material di bawah lighting netral sebelum lanjut ke lighting artistik.
- Jangan mengubah warna produk sampai tidak dikenali di tahap post-processing.

## Skema tiga titik (three-point lighting)

- **Key light**: sumber utama, intensitas paling tinggi, menentukan arah bayangan.
- **Fill light**: 30–50% intensitas key, melembutkan bayangan.
- **Rim/back light**: dari belakang objek, memisahkan objek dari background (wajib untuk background gelap).
- Tambahkan environment/HDRI untuk refleksi realistis pada material metal/kaca.

## Kamera & komposisi

- Eye-level: produk netral. Low angle (+10–15°): kesan premium/powerful. Top-down: flat-lay.
- Terapkan rule of thirds; beri negative space di sekitar objek utama.

## Render & post-processing

- Sample: minimal 128 untuk preview, 512+ untuk final. Aktifkan denoiser.
- Render di resolusi final, bukan upscale.
- Post-processing koreksi kecil saja: exposure, contrast, white balance.
