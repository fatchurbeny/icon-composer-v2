# Produk: tujuan, batasan, alur kerja

## 1. Tujuan bisnis

1. Pemilik membuat template presentasi untuk Canva marketplace. Deck dibuat di Claude Design dengan skill `canva-ipsum-deck` dan instruksi `deck-icon-slots`.
2. Ikon di template harus buatan sendiri, lalu di-submit sebagai element Canva. Penghasilan datang dari element yang dipakai.
3. Repo ini menambah gaya visual baru (offset, hand-writing, sticker) ke dua alat yang sudah final, sehingga satu konsep ikon bisa diterbitkan dalam beberapa gaya.

## 2. Batasan yang memandu semua keputusan

| Batasan | Akibat di kode |
|---|---|
| SVG editable Canva maksimal 5 warna, dan warna hanya bisa diedit pada bidang fill | Setiap mesin wajib lolos validasi `directFillSvgFile`: ≤5 warna, semua stroke diubah jadi outline, hanya path fill langsung. Berlaku di Composer dan Builder. |
| Ikon harus unik, tidak boleh menyerupai ikon pustaka | Gaya classic/accent/hand-writing/sticker memakai objek utama + pengubah. Builder memeriksa gabungan nama terhadap Lucide/Tabler/Hugeicons. |
| Element di satu pack tidak boleh kembar | Deteksi repetisi di dalam pack (TIB) dan di dalam satu gaya (Composer). Lihat `ANTI-REPETITION.md`. |
| Satu konsep di gaya berbeda **boleh** | "Koper + centang" versi offset dan versi sticker adalah varian sah, bukan repetisi. |
| Metadata: judul unik, kata kunci ≥5 | Sudah ada di IC 1.5.1 dan TIB 1.6.0. Kata gaya baru mengikuti pola "Icon-style" (lihat `EXPORT-PIPELINE.md` bagian 4). |

## 3. Alur kerja end-to-end

```
Claude Design (canva-ipsum-deck + deck-icon-slots)
  → deck + slide Resource Page + <judul-deck>-icon-manifest.json
        │
        ▼
Template Icon Builder
  1 Impor manifest → 2 Periksa (gaya, variasi, flag repetisi) → 3 Ekspor ZIP
        │
        ▼
ZIP: <gaya>/*.svg, metadata.csv, resource-page.html, manifest-final.json,
     submission-profile.json, LICENSES.txt
        │
        ▼
canva-submit (server lokal Python) → upload ke Canva Creator
```

Icon Composer dipakai untuk ikon yang dibuat manual atau pack di luar deck. Keluarannya ZIP berisi SVG, `gaya.json`, dan `metadata.csv` untuk Chrome extension pengisi metadata.

## 4. Pengguna

Satu pengguna utama (pemilik), bekerja di Mac dengan Chrome. Alat dibuka sebagai file lokal (`file://`), jadi tidak ada login, server, atau sinkronisasi antarperangkat.

## 5. Di luar cakupan (saat ini)

- Riwayat lintas pack atau lintas akun Canva (ledger sidik jari). Dibahas, tetapi pemilik membatasi cakupan repetisi ke dalam satu gaya dan satu pack. Tercatat sebagai backlog di `MIGRATION-PLAN.md`.
- Pengubah untuk gaya offset. Pemilik memutuskan offset tetap tanpa pengubah.
- Aplikasi desktop (Electron/Tauri) atau server web.
