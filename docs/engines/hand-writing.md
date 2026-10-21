# Mesin `hand-writing` (dulu "Coret")

- **Asal:** `legacy/style/coret-composer-v1.0.0.html` (`coret`, `compose`, `rng`, `hash`).
- **Modul:** `packages/engines/hand-writing/index.js` (mesin, `boxesHandWriting`, `migrateLegacy`) dan `dash.js` (memanggang dash, panjang path versi Skia).
- **Versi di registry:** 2.0.0. Naik mayor karena nama berubah dan dash dipanggang jadi geometri.
- **Kanvas asli:** 24, viewBox legacy `-3 -3 30 30`. Keluaran dibungkus satu matriks `matrix(1.6 0 0 1.6 4.8 4.8)` ke `viewBox="0 0 48 48"`, jadi geometri identik dengan legacy dan file ekspor sama dengan gaya lain.
- **supports:** `mod:true, deco:false, builtinMains:false, perItemColor:false, maxColors:3`.

## Penggantian nama

| Lama | Baru |
|---|---|
| Coret / coret | Hand-writing / `hand-writing` |
| `localStorage["coret-composer-v1"]` | dibaca sekali oleh migrasi `003-from-hand-writing`, lalu tidak dipakai (lihat `DATA-MODEL.md` bagian 4.5) |
| `gaya.json` `{family:"coret"}` | dibaca sebagai `hand-writing` oleh `registry.migrateFamily`, `handWritingSetFromComposer`, dan impor manifest Builder |
| file ekspor `<nama>-coret.svg`, folder `coret/` | `<nama>-hand-writing.svg`, folder `hand-writing/` |
| fungsi `coret()` | `strokeSet()` |
| label UI "Celah coretan", "Acak ulang" | "Celah goresan", "Acak ulang goresan" |

## Cara kerja

1. **Blob** (isi warna di belakang): bagian tertutup diberi fill + stroke tebal (`sw + 2*puff`) dengan warna aksen, lalu digeser `(-off, off*0.8)`. Mode blob per item: `auto` (bentuk tertutup), `circle` (lingkaran r = 8 + 0,6·puff, tanpa garis tepi), `none`.
2. **Tinta:** semua bagian digambar garis. Bagian "besar" (bentuk tertutup atau path dengan `d` > 18 karakter) diberi celah dengan peluang 75%. Besar celah = `gap × (0,6..1,4)` dalam satuan `pathLength=100`, fase acak 0..100. Celah dipanggang menjadi potongan path (bagian berikut).
3. **Rotasi:** seluruh ikon diputar `±rot` derajat di sekitar pusat.
4. **Pengubah:** diskalakan `ms` (bawaan 0,5) di salah satu 8 anchor. Objek utama mengecil 0,84 dan bergeser menjauhi anchor. Pengubah selalu memakai blob lingkaran.
5. **Knockout:** objek utama di-mask oleh siluet pengubah yang dilebarkan `ko`. Warna mask ditulis `#fff`/`#000` persis seperti legacy, karena pipeline ekspor (`flattenSvgMasks`) mencari bidang potong dengan warna `"#000"`.

Semua keacakan berasal dari `rng(seed + hash(main + mod))` (`packages/core`), dengan urutan pemanggilan `r()` sama persis dengan legacy: miring, lalu per bagian objek utama (peluang celah, besar celah, fase), lalu per bagian pengubah. Tes unit menjalankan `compose` legacy asli di `vm` dan membandingkan rotasi, blob, transform, siluet mask, dan pola dash per bagian.

### Knockout (`opt.mode`)

- `mask` (bawaan, UI dan ekspor): `<mask id="<idp>ko">` dengan `maskUnits="userSpaceOnUse"`, dipasang di pembungkus `<g mask>` tanpa `transform`, di dalam grup rotasi (sama dengan legacy).
- `white` (pratinjau ringan): siluet pengubah digambar putih di atas objek utama, tanpa mask.

Warna di keluaran: aksen dan tinta (ditambah putih di mode `white`). Maksimal 3, sesuai `supports.maxColors`.

## Parameter gaya (berlaku untuk seluruh set)

Disimpan di `style.engine["hand-writing"]` dan dibaca `handWritingParams`.

| Field | Bawaan | Rentang |
|---|---|---|
| `acc` | `#FDBF57` | palet: `#FDBF57 #7FC4BE #F28B82 #A7C7F2 #C3A6E8 #9DCB86` (`HAND_WRITING_ACCENT_OPTIONS`) |
| `ink` | `#2B1D2E` | palet: `#2B1D2E #141414 #1F2A37 #3B2418` (`HAND_WRITING_INK_OPTIONS`) |
| `sw` | 2.3 | 1,4 – 3,2 |
| `puff` | 2 | 0 – 4 |
| `off` | 1.25 | 0 – 3 |
| `gap` | 9 (%) | 0 – 20 |
| `rot` | 5 (°) | 0 – 10 |
| `ko` | 1.25 | 0,5 – 3 |

Pemilih warna custom tetap bisa memilih warna di luar palet.

## Parameter per item

`slot` (anchor 8 titik, sama dengan slot IC), lalu `item.engine["hand-writing"] = { ms, blob, seed, var? }` (dibaca `handWritingItem`):

| Field | Bawaan | Rentang |
|---|---|---|
| `ms` | 0.5 | 0,36 – 0,7 (slider legacy) |
| `blob` | `auto` | `auto` / `circle` / `none` |
| `seed` | 1 | bilangan bulat; "Acak ulang goresan" di Composer · Edit mengganti seed |

Field IC seperti `item.ms` (skala pengubah classic, persen) tidak dibaca mesin ini.

## WAJIB: memanggang dash

Pipeline ekspor Canva (`IconOutline` di TIB 1.6.0) **mengabaikan `stroke-dasharray`** dan menggambar garis utuh. Kalau dibiarkan, efek tulisan tangan hilang di semua file Canva.

Mesin v2.0.0 menghasilkan potongan path nyata (`dash.js`, `bakeDash`):

1. Bentuk dasar diubah ke path setara (`shapeToPath`) dengan titik awal dan arah seperti browser: lingkaran dan elips mulai di `(cx + r, cy)` searah jarum jam, `rect` di `(x + rx, y)`.
2. Path disampel menjadi polyline per sub-path (`subpaths`): garis lurus tidak disampel ulang, kurva dan busur dengan jarak ≤ 0,25 unit. Tanpa DOM, jadi tidak lewat `shared/measure`.
3. **Skala `pathLength`.** Chromium tidak memakai panjang geometri sebenarnya untuk skala `pathLength="100"`, tetapi panjang versi Skia (`SkContourMeasure`, toleransi 0,5 unit pada resScale 1): busur SVG menjadi conic (≤ 120° per conic), lalu tiap kurva dibagi dua sampai cukup datar dan diukur sebagai tali busur. Untuk ikon kanvas 24 panjang ini sampai 9% lebih pendek (lingkaran kecil r = 2), sehingga celah legacy jatuh lebih awal dari posisi geometris. `skiaLength` meniru ukuran itu; posisi celah tetap diukur di geometri sebenarnya. Tanpa langkah ini selisih piksel terhadap legacy sampai 0,84%; dengan langkah ini maks 0,18%.
4. Pola `[100 − g, g]` dan fase dimulai ulang di awal setiap sub-path (cara Skia mendash per kontur).
5. Keluaran berisi `<path>` biasa (satu `d` dengan beberapa `M…L…`) tanpa `stroke-dasharray` dan tanpa `pathLength`. Bagian tanpa celah ditulis apa adanya (tanpa `pathLength`).
6. Hasil potongan di-cache dengan kunci `d + pola + fase` (maks 4000 entri).

Satu perbedaan kecil yang tidak ditiru: bila fase tepat 0, Skia menggambar titik bulat sepanjang 0 di ujung garis terbuka. Pengaruhnya < 0,2% piksel pada garis pendek dan fase yang dibulatkan ke 0 sangat jarang (peluang sekitar 1 : 20 000 per bagian).

**Kriteria terima (lulus):** render v2.0.0 dan render legacy (dengan dasharray, node ikon yang sama) berbeda < 1% piksel pada fixture 32 ikon Lucide, Tabler, dan Hugeicons (`tests/e2e/hand-writing-parity.spec.js`, `@golden`, maks 0,18%), dan file direct fill hasilnya masih memperlihatkan celah (`tests/e2e/export-canva.spec.js`: 19 dari 20 ikon kehilangan tinta di posisi celah dibanding set yang sama tanpa celah; ambang tes minimal 17, karena peluang celah 75% per bagian besar).

## Versi pustaka

Mesin membaca node ikon lewat `ctx.nodeOf` milik renderer Icon Studio, jadi versinya mengikuti `packages/icon-sources/sources.json` (Lucide 1.52.0, Tabler 3.49.0, Hugeicons 4.3.5). Legacy memuat Lucide 0.460.0, Tabler 3.31.0, dan Hugeicons `@1`. Uji paritas menyuntikkan node yang sama ke `SRC` legacy, sehingga yang dibandingkan hanya mesinnya. Nama Hugeicons dari set coret lama yang tidak ada di 4.3.5 dirender kosong dengan flag "Objek belum termuat".

## Sumbu variasi (`axes`)

Disimpan di `item.engine["hand-writing"].var`. Tanpa `var`, keluaran sama persis dengan legacy. Dengan `var`, nilai acak tetap dipanggil (urutan `r()` tidak bergeser) lalu diganti:

| Sumbu | Nilai | Catatan |
|---|---|---|
| `tilt` | -1, -0.5, 0.5, 1 | dikali `rot` gaya. Tidak ada 0, supaya kesan tulisan tangan tetap ada. |
| `gapPhase` | 0, 1, 2, 3 | kuadran fase dash: fase = (kuadran + acak) × 25 |
| `gapPick` | `A`, `B`, `C` | pola bagian besar yang diberi celah, menggantikan peluang 75%: A melewati tiap bagian ke-4 (indeks 3, 7, …), B indeks 1, 5, …, C tiap bagian ke-3 (indeks 2, 5, …) |

Planner variasi (Fase 6) yang mengisi `var`; Composer · Edit baru menyediakan "Acak ulang goresan" (seed).

## Icon Studio

- **Composer · Set:** kartu Hand-writing di panel Gaya; panel Gaya berisi slider `sw`, `puff`, `off`, `gap`, `rot`, `ko`, panel Warna berisi Tinta dan Aksen. Ikon baru memakai `lu:pizza` tanpa pengubah, karena objek bawaan tidak didukung.
- **Composer · Edit:** tata letak dari patokan mesin (lapisan tidak bisa diseret, diskalakan, atau diputar bebas). Lapisan Pengubah: posisi 8 anchor dan skala `ms`. Lapisan Objek utama: mode blob dan "Acak ulang goresan". Lapisan Dekorasi: "Dekorasi tidak tersedia pada gaya ini". Kotak lapisan dihitung `boxesHandWriting` (geometri murni).
- **Kombinasi:** hanya objek dan pengubah pustaka; objek dan pengubah bawaan di pool dilewati dengan keterangan. Posisi bawaan pengubah BR (seperti coret-composer).
- **Tinjau:** kata gaya "Hand-writing Style" / "gaya hand-writing", kata kunci `hand-writing style, hand drawn icon, doodle icon` / `gaya hand-writing, ikon gambar tangan, ikon doodle`; cek tambahan "Objek didukung gaya Hand-writing" dan "Pengubah dari pustaka".
- **Builder:** mode `H` (lihat `EXPORT-PIPELINE.md` bagian 3).

## Flag

| Flag | Level |
|---|---|
| Objek bawaan tidak didukung gaya Hand-writing | `err` (compose mengembalikan SVG kosong 48×48) |
| Pengubah bawaan tidak didukung gaya Hand-writing | `warn` (ikon dirender tanpa pengubah) |
| Objek belum termuat | `warn` |

## Masalah legacy yang diperbaiki

- `uidN` global untuk id mask diganti `opt.idp`.
- Hugeicons dimuat dengan versi `@1`. Disamakan ke 4.3.5 lewat `sources.json`.
- `compose` mengembalikan `null` bila ikon belum termuat. Diganti SVG kosong + flag, sesuai kontrak.
