# Mesin `sticker`

- **Asal:** `legacy/style/sticker-composer.html` (`layer`, `deco`, `compose`, `shapes`) dan dokumen `sticker-composer-handoff.md` di Project claude.ai.
- **Versi awal di registry:** 1.1.0 (`packages/engines/sticker/index.js`, Fase 5).
- **Kanvas asli:** 64. Keluaran selalu `viewBox="0 0 48 48"` (lihat "Normalisasi kanvas").
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

## Normalisasi kanvas dan posisi

Geometri tetap dihitung di satuan 64 legacy (`layer`, `deco`, slot `TL 17,17 · TR 47,17 · BL 17,47 · BR 47,47`), lalu dikalikan 0,75 di transform setiap lapisan. Tebal garis di dalam lapisan dibagi skala lapisan, jadi gambarnya sama persis dengan legacy yang diskalakan.

Posisi kanonik `mx/my` (objek utama) dan `nx/ny` (pengubah) memakai satuan kanvas 48, sama dengan mesin lain, dan diubah ke 64 dengan dibagi 0,75 di `adapt`. Geser dekorasi (`engine.sticker.deco.x/y`) tetap satuan 64 legacy karena hanya dibaca mesin sticker.

## Mode `mask` dan `white`

- `white`: urutan gambar legacy persis (halo, isi, tinta objek → dekorasi → halo, isi, tinta pengubah). Dipakai untuk pratinjau ringan dan uji paritas.
- `mask` (bawaan, UI dan ekspor): urutan yang sama, tetapi setiap bagian dipotong siluet semua bagian di atasnya lewat `<mask>` (halo objek dipotong isi, tinta, dekorasi, dan siluet pengubah; isi objek dipotong tinta, dekorasi, dan siluet pengubah; tinta objek dan dekorasi dipotong siluet pengubah; halo pengubah dipotong isi dan tinta pengubah; isi pengubah dipotong tinta pengubah). Hasilnya, bidang dengan warna berbeda tidak pernah bertumpuk, sehingga `directFillSvgFile` (satu path per warna, urutan warna menurut kemunculan terakhir) tidak bergantung pada urutan tumpukan. Ini menjawab risiko "halo menutup isi saat diratakan" di EXPORT-PIPELINE bagian 2.

Mask dipasang di pembungkus tanpa transform, dengan id `opt.idp + "m" + n`.

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

Item tanpa `engine.sticker` (misalnya set klasik yang dipindah ke Sticker) memakai bawaan yang stabil per item: isi objek dari 8 warna pertama palet menurut `hash(concept(main))`, isi pengubah kuning `#F9D84A` (digeser +3 di palet bila sama dengan isi objek), seed dekorasi `3 + hash(id) % 50`. `engine.sticker` baru ditulis saat pengguna mengubah nilai sticker (Composer · Edit) atau lewat impor, supaya `gaya.json` set classic/accent tetap sama dengan IC 1.5.1.

Ikon tanpa bentuk isi memakai `plate` dan mendapat flag `info` "Tanpa bentuk isi: isi memakai lingkaran". Objek bawaan mendapat `err`, pengubah bawaan `warn` (tidak dirender), dan slot 8 yang dipetakan mendapat `info` "Posisi pengubah TC dipetakan ke TR".

## Batas warna Canva

Warna maksimum per SVG = tinta + isi objek + isi pengubah + putih halo = **4**. Aman di bawah 5. Kalau `main.c === mod.c`, jumlahnya 3.

Karena isi berbeda per ikon, Icon Studio menghitung batas Canva per file (warna terbanyak di satu ikon), bukan untuk seluruh pack. Tinjau menambah pemeriksaan "Maksimal 4 warna per ikon sticker" dan saran legacy "Warna isi di seluruh pack (lebih dari 6 terasa ramai)".

## Data bentuk isi

Sticker legacy menanam ±2 MB data (`lu`, `luf`, `tb`, `tbf`) di HTML. Di repo baru:
- `scripts/build-icon-data.mjs` menghasilkan `fill-shapes.json` dari versi pustaka yang terkunci;
- `icon-sources.fillShapeOf(key)` menyediakannya;
- ikon tanpa bentuk isi otomatis memakai `plate`.

### Pemuatan malas

Data itu hanya dibutuhkan gaya Sticker, jadi `packages/icon-sources/fill-shapes.js` memuatnya saat perlu:

- `loadFillShapes()` mengimpor `fill-shapes.json` secara dinamis (sekali per halaman); `fillShapesState()` bernilai `idle`, `loading`, `ready`, atau `error`. `fillShapeOf(key)` tetap sinkron dan memakai data yang sudah termuat; `fillShapeReady(key)` memberi tahu apakah jawabannya sudah final.
- Build Icon Studio satu file (vite-plugin-singlefile) tetap menginline chunk dinamis, jadi plugin `scripts/vite-fill-shapes.mjs` mengganti JSON itu dengan `{gz}` (gzip base64, ±0,2 MB) yang didekode `decodeFillShapes` lewat `DecompressionStream` saat dimuat (±8 ms di Chromium). Di dev dan Vitest JSON dimuat apa adanya. Ukuran `dist/icon-studio/index.html` turun dari 1.501.816 menjadi ±831.000 byte.
- `FILL_SHAPE_SEED` berisi bentuk isi ikon contoh kartu gaya Sticker (`lu:luggage`, `lu:circle-check`), supaya pratinjau kartu benar tanpa memuat data. Isinya dijaga sama dengan `fill-shapes.json` oleh `tests/unit/fill-shapes.test.js`; perbarui bila skrip data mengubah kedua ikon itu.
- Mesin tetap murni: renderer Icon Studio menyuntik `ctx.fillShapeOf`. Sebelum data termuat, render sticker yang butuh kunci di luar seed (`renderSetItem`, mode `S` Builder) mengembalikan SVG kosong `data-loading="fill-shapes"` dan memicu pemuatan; flag sticker kosong sementara. Setelah termuat, app memvalidasi ulang dokumen Builder dan merender ulang. Bila pemuatan gagal, mesin memakai `plate` (tidak menunggu terus).
- Pemicu: set atau dokumen Builder bergaya Sticker (mode `S` di pratinjau atau ekspor) saat app dibuka, termasuk hasil migrasi 004 (`warmLibraries`); kartu Sticker dipilih; impor sticker-composer; render sticker apa pun. Ekspor ZIP set Sticker (`buildSetZip`), sprite, dan ekspor Builder dengan mode `S` (`buildExportFiles`) menunggu data termuat. Dicek `tests/e2e/studio-sticker-lazy.spec.js`.

Data legacy dibangun dari **`lucide-static@0.460.0`** dan **`@tabler/icons@3.31.0`** (sumber: handoff Sticker Composer, 9 Oktober 2026). Aturan pembentukan bentuk isi yang harus dipertahankan `scripts/build-icon-data.mjs`:

- `luf`: hanya bentuk tertutup ikon Lucide (circle/rect/ellipse/polygon, atau path yang diakhiri `z`).
- `tbf`: versi **filled resmi Tabler** (`tabler-nodes-filled.json`) kalau ada. Kalau tidak ada, dipakai bentuk tertutup dari outline-nya, dan data legacy menandainya dengan prefiks `~`.
- Path kosong Tabler `M0 0h24v24H0z` dibuang. Kategori `Brand` dan nama `brand-*` dikecualikan.
- Jumlah di data legacy: Lucide 1.539 ikon (973 punya isi), Tabler 4.568 ikon (1.801 punya isi).
- Jumlah di `fill-shapes.json` (Lucide 1.52.0, Tabler 3.49.0): Lucide 2.122 ikon (1.293 punya isi), Tabler 4.808 ikon (2.811 punya isi, 1.019 filled resmi). Dicek ulang oleh `tests/unit/fill-shapes.test.js` (skrip harus menghasilkan file yang sama persis).

Penyesuaian aturan karena versi: Tabler 3.4x tidak lagi menulis `z` di path outline, sehingga aturan legacy hanya menghasilkan 0 bentuk fallback. Untuk `tbf` fallback, path yang titik awal dan akhirnya berimpit (< 0,6, aturan `isClosedPart` offset) ikut dihitung tertutup dan diberi `z`. Lucide tetap memakai aturan legacy (hanya path ber-`z`).

Catatan: varian filled Tabler hanya dipakai sebagai **bentuk lapisan isi warna** di mesin sticker. Filter Bentuk di panel Pustaka tetap memakai deteksi bentuk tertutup per ikon (ADR-015).

Karena versinya naik ke Lucide 1.52.0 dan Tabler 3.49.0, bandingkan hasilnya di golden test dan catat selisihnya.

### Hasil golden visual (`tests/e2e/sticker-parity.spec.js`)

- **Paritas mesin** (bentuk Icon Studio disuntikkan ke `compose` legacy asli, 14 rakitan × 4 gaya): selisih maks **0,047%** piksel di mode `mask` dan **0,000%** di mode `white`. Batas kriteria 1,5%.
- **Selisih versi pustaka** (legacy dengan datanya sendiri, gaya bawaan): 0% untuk luggage, map, camera, tent-tree, caravan, mountain-snow, cable-car, bus, umbrella, mail; house + plus 3,4%; heart (isi Tanpa) 7,4%; sailboat 11,2%; minus 21,7% (aturan `plate` baru, legacy mengisi garisnya sendiri). Angka lengkap tercatat sebagai anotasi tes.
- **Pertanyaan terbuka untuk pemilik:** di Lucide 1.52.0 sebagian path tertutup tidak lagi diakhiri `z`. Dengan aturan Lucide legacy, 30 ikon yang dulu punya bentuk isi kini memakai lingkaran (contoh `heart`). Memakai deteksi titik ujung seperti Tabler akan memulihkan 30 ikon itu, tetapi mengubah bentuk isi 10 ikon yang sekarang sama dengan legacy (contoh badan `luggage` ikut terisi) dan menambah 43 ikon baru. Belum diubah, menunggu keputusan.

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

Sampai planner Fase 6 ada, `compose` sudah membaca `engine.sticker.var` (`rayDiag`, `curlSide`, `sparkPattern`, `colorPair`) bila diisi; tanpa `var` hasilnya sama dengan legacy.

## Di Icon Studio

- **Composer · Set:** kartu Sticker, panel Gaya (mode Stiker/Isi/Garis, tebal garis, halo, geser isi, sparkle, sinar, ikal) dan Warna (tinta). Palet kurasi hanya mengganti tinta.
- **Composer · Edit:** tab Transform per lapisan: warna isi, isi (Bentuk/Lingkaran/Tanpa isi), skala, geser; 4 sudut pengubah; seed, skala, dan geser dekorasi. Objek dan pengubah bisa diseret, tanpa pegangan skala dan putar. Delete pada dekorasi menyembunyikannya (`vis.deco`).
- **Kombinasi:** objek dan pengubah bawaan dilewati, slot dipetakan ke 4 sudut, objek utama tidak digeser slot.
- **Tinjau:** kata gaya `Sticker Style` / `gaya sticker`, kata kunci `sticker style`, `sticker`, `colorful icon`.
- **Builder:** mode `S` (folder `sticker/`): isi objek = aksen manifest, isi pengubah kuning, mode warna dari `style.engine.sticker.mode`, gaya lain bawaan mesin. Manifest `style.family: "sticker"` diimpor langsung ke mode `S`. Pilihan warna ini usulan sementara dan perlu persetujuan pemilik.
