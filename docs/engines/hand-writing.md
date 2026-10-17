# Mesin `hand-writing` (dulu "Coret")

- **Asal:** `legacy/style/coret-composer-v1.0.0.html` (`coret`, `compose`, `rng`, `hash`).
- **Versi awal di registry:** 2.0.0. Naik mayor karena nama berubah dan dash dipanggang jadi geometri.
- **Kanvas asli:** 24, viewBox `-3 -3 30 30`.
- **supports:** `mod:true, deco:false, builtinMains:false, perItemColor:false, maxColors:3`.

## Penggantian nama

| Lama | Baru |
|---|---|
| Coret / coret | Hand-writing / `hand-writing` |
| `localStorage["coret-composer-v1"]` | dibaca sekali saat migrasi, lalu tidak dipakai |
| `gaya.json` `{family:"coret"}` | dibaca sebagai `hand-writing` oleh `registry.migrateFamily` |
| file ekspor `<nama>-coret.svg`, folder `coret/` | `<nama>-hand-writing.svg`, folder `hand-writing/` |
| fungsi `coret()` | `strokeSet()` |

## Cara kerja

1. **Blob** (isi warna di belakang): bagian tertutup diberi fill + stroke tebal (`sw + 2*puff`) dengan warna aksen, lalu digeser `(-off, off*0.8)`. Mode blob per item: `auto` (bentuk tertutup), `circle` (lingkaran r = 8 + 0,6·puff), `none`.
2. **Tinta:** semua bagian digambar garis. Bagian "besar" (bentuk tertutup atau path dengan `d` > 18 karakter) diberi celah putus-putus dengan peluang 75%. Besar celah = `gap × (0,6..1,4)`, fase acak.
3. **Rotasi:** seluruh ikon diputar `±rot` derajat di sekitar pusat.
4. **Pengubah:** diskalakan `ms` (bawaan 0,5) di salah satu 8 anchor. Objek utama mengecil 0,84 dan bergeser menjauhi anchor. Pengubah selalu memakai blob lingkaran.
5. **Knockout:** objek utama di-mask oleh siluet pengubah yang dilebarkan `ko`.

Semua keacakan berasal dari `rng(seed + hash(main + mod))`.

## Parameter gaya (berlaku untuk seluruh set)

| Field | Bawaan | Rentang |
|---|---|---|
| `acc` | `#FDBF57` | palet: `#FDBF57 #7FC4BE #F28B82 #A7C7F2 #C3A6E8 #9DCB86` |
| `ink` | `#2B1D2E` | palet: `#2B1D2E #141414 #1F2A37 #3B2418` |
| `sw` | 2.3 | 1,4 – 3,2 |
| `puff` | 2 | 0 – 4 |
| `off` | 1.25 | 0 – 3 |
| `gap` | 9 (%) | 0 – 20 |
| `rot` | 5 (°) | 0 – 10 |
| `ko` | 1.25 | 0,5 – 3 |

## Parameter per item

`anchor` (dari `item.slot`), `ms`, `blob` (`auto`/`circle`/`none`), `seed`.

## WAJIB: memanggang dash

Pipeline ekspor Canva (`IconOutline` di TIB 1.6.0) **mengabaikan `stroke-dasharray`** dan menggambar garis utuh. Kalau dibiarkan, efek tulisan tangan hilang di semua file Canva.

Mesin v2.0.0 harus menghasilkan potongan path nyata:

1. Untuk tiap bagian yang diberi celah, ukur panjang total `L` lewat `shared/measure`.
2. Hitung segmen yang terlihat dari pola `[100-g, g]` dan fase dalam satuan `pathLength=100`, lalu ubah ke panjang nyata `L/100`.
3. Ambil titik sampel di sepanjang segmen (`getPointAtLength`, jarak ≤ 0,5 unit). Tulis sebagai polyline, atau sebagai kurva yang disederhanakan bila ada helper di `core`.
4. Keluaran berisi beberapa `<path>` biasa tanpa `stroke-dasharray` dan tanpa `pathLength`.
5. Hasil potongan di-cache dengan kunci `hash(d + pola + fase)`.

Kriteria terima: render v2.0.0 dan render legacy (dengan dasharray) berbeda < 1% piksel pada fixture 32 ikon, dan file direct-fill hasilnya masih memperlihatkan celah.

## Sumbu variasi (`axes`)

| Sumbu | Nilai | Catatan |
|---|---|---|
| `tilt` | -1, -0.5, 0.5, 1 | dikali `rot` gaya. Tidak ada 0, supaya kesan tulisan tangan tetap ada. |
| `gapPhase` | 0, 1, 2, 3 | kuadran fase dash; jitter halus di dalam kuadran dari seed |
| `gapPick` | `A`, `B`, `C` | pola bagian mana saja yang diberi celah (menggantikan peluang 75% murni) |

## Masalah legacy yang diperbaiki

- `uidN` global untuk id mask diganti `opt.idp`.
- Hugeicons dimuat dengan versi `@1`. Disamakan ke 4.3.5.
- `compose` mengembalikan `null` bila ikon belum termuat. Diganti SVG kosong + flag, sesuai kontrak.
