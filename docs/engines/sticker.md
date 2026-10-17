# Mesin `sticker`

- **Asal:** `legacy/style/sticker-composer.html` (`layer`, `deco`, `compose`, `shapes`) dan dokumen `sticker-composer-handoff.md` di Project claude.ai.
- **Versi awal di registry:** 1.1.0.
- **Kanvas asli:** 64.
- **supports:** `mod:true, deco:true, builtinMains:false, perItemColor:true, maxColors:5`.

## Cara kerja

Urutan gambar: objek utama → dekorasi → pengubah. Setiap lapisan (`layer`) terdiri dari tiga grup:

1. **Halo putih:** fill + stroke putih, `stroke-width = (sw + 2*halo)/sc`. Hanya di mode `sticker`. Pengubah selalu diberi halo ≥ 1,6 sebagai celah knockout.
2. **Isi warna:** bentuk isi digeser `(-off, off)`. Bentuk isi diambil dari data `luf`/`tbf` (bentuk tertutup siap pakai), lingkaran r = 10,5 untuk `fill:"plate"`, atau kosong untuk `"none"`. Tidak dipakai di mode `line`.
3. **Garis tinta:** `stroke = ink`, `stroke-width = sw/sc`.

Dekorasi ada di cincin r ≈ 25–30 di sekitar pusat (64/2):
- **sinar:** 3 garis di salah satu diagonal;
- **sparkle:** `spk` bintang 4 sudut, solid atau outline;
- **ikal:** 1 buah.

Sudut yang berjarak ±42° dari slot pengubah dihindari (`SLOT_ANG`).

## Parameter gaya

| Field | Bawaan | Arti |
|---|---|---|
| `mode` | sticker | sticker / fill / line |
| `sw` | 2.4 | tebal garis |
| `halo` | 3.25 | lebar halo putih |
| `off` | 1 | geser isi |
| `spk` | 3 | jumlah sparkle |
| `rays`, `curl` | true, true | sinar dan ikal aktif |
| `ink` | `#17171B` | palet: `#17171B #2B3A67 #5A2E1F #FFFFFF` |

## Parameter per item

| Field | Arti |
|---|---|
| `main.c`, `mod.c` | warna isi objek dan pengubah, dari palet `#E5484D #5AA9F8 #6BD88A #F9D84A #F09A3E #C08A6B #4A9A78 #B58BEA #FFFFFF` |
| `main.s`, `mod.s` | skala (main 1,2–2,3 · mod 0,5–1,4) |
| `main.fill` | auto / plate / none |
| `deco.seed`, `deco.s/x/y` | seed dan transform dekorasi |

Di item kanonik, field ini disimpan di `item.engine.sticker` (lihat `DATA-MODEL.md`). Posisi dan slot memakai field kanonik (`slot`, `mx/my`, `nx/ny`).

## Batas warna Canva

Warna maksimum per SVG = tinta + isi objek + isi pengubah + putih halo = **4**. Aman di bawah 5. Kalau `main.c === mod.c`, jumlahnya 3.

## Data bentuk isi

Sticker legacy menanam ±2 MB data (`lu`, `luf`, `tb`, `tbf`) di HTML. Di repo baru:
- `scripts/build-icon-data.mjs` menghasilkan `fill-shapes.json` dari versi pustaka yang terkunci;
- `icon-sources.fillShapeOf(key)` menyediakannya;
- ikon tanpa bentuk isi otomatis memakai `plate`.

Data legacy dibangun dari **`lucide-static@0.460.0`** dan **`@tabler/icons@3.31.0`** (sumber: handoff Sticker Composer, 9 Oktober 2026). Aturan pembentukan bentuk isi yang harus dipertahankan `scripts/build-icon-data.mjs`:

- `luf`: hanya bentuk tertutup ikon Lucide (circle/rect/ellipse/polygon, atau path yang diakhiri `z`).
- `tbf`: versi **filled resmi Tabler** (`tabler-nodes-filled.json`) kalau ada. Kalau tidak ada, dipakai bentuk tertutup dari outline-nya, dan data legacy menandainya dengan prefiks `~`.
- Path kosong Tabler `M0 0h24v24H0z` dibuang. Kategori `Brand` dan nama `brand-*` dikecualikan.
- Jumlah di data legacy: Lucide 1.539 ikon (973 punya isi), Tabler 4.568 ikon (1.801 punya isi).

Catatan: varian filled Tabler hanya dipakai sebagai **bentuk lapisan isi warna** di mesin sticker. Filter Bentuk di panel Pustaka tetap memakai deteksi bentuk tertutup per ikon (ADR-015).

Karena versinya naik ke Lucide 1.52.0 dan Tabler 3.49.0, bandingkan hasilnya di golden test dan catat selisihnya.

## Sumbu variasi (`axes`)

| Sumbu | Nilai | Catatan |
|---|---|---|
| `rayDiag` | -45, 45, 135, -135 | nilai yang dekat slot pengubah diblokir (`blockedBy`) |
| `curlSide` | kiri-atas, kanan-atas, kiri-bawah, kanan-bawah | |
| `sparkPattern` | `SSO`, `SOO`, `SOS`, `OSS` | pola solid/outline sparkle |
| `colorPair` | indeks pasangan dari palet set | planner meratakan pemakaian warna di pack |

Sudut sparkle dan ikal yang halus tetap diambil dari seed, tetapi dibatasi kuadran dari sumbu di atas.

## Masalah legacy yang diperbaiki

- `comboItem` memakai `deco.seed = 5 + (j*7) % 50`. Seed ini berulang setiap 50 item dan hanya ada 4 arah sinar, sehingga dekorasi kembar sering muncul di pack. Diganti planner (lihat `ANTI-REPETITION.md`).
- Warna pengubah yang sama dengan objek digeser `+3` di palet. Logika ini pindah ke planner (`colorPair`).
