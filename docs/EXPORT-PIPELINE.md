# Pipeline ekspor

## 1. Tahapan

```
engine.compose(..., {mode:"mask", size:480})
  → normalizeCanvas            viewBox 0 0 48 48
  → dedupeAttrs                buang atribut ganda (bug lama partStr)
  → outlineSvgFile             stroke → bidang, mask diselesaikan (IconOutline)
  → directFillSvgFile          satu <path> per warna, tanpa g/transform/mask/stroke
  → validasi Canva             ≤5 warna, hanya path fill langsung
  → file di ZIP
```

`outlineSvgFile` dan `directFillSvgFile` dipindah apa adanya dari TIB 1.6.0 ke `packages/export`. Bundel `IconOutline` (`icon-outline.min.js`) masuk sebagai dependensi vendored di `packages/export/vendor/`.

### Aturan wajib ekspor Canva (keputusan pemilik)

**Semua stroke diubah menjadi outline.** File Canva hanya boleh berisi bidang `fill`. Tidak boleh ada kombinasi fill + stroke, karena warna stroke tidak bisa diedit di Canva.

Validasi akhir menolak file kalau ditemukan salah satu dari:
- atribut `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray` (termasuk yang diwarisi dari grup);
- `<mask>`, `<clipPath>`, `<g>`, `transform`, `<style>`, `style=`, `<use>`, `<symbol>`;
- jumlah warna fill unik di luar rentang 1–5.

Garis yang tebalnya 0 setelah outline (misalnya titik `h.01` di Lucide) harus tetap muncul sebagai bulatan kecil, bukan hilang.

### Penerapan per aplikasi

- **Template Icon Builder:** sudah memakai pipeline ini sejak v1.5.0.
- **Icon Composer:** **dinyalakan** (keputusan pemilik, menggantikan catatan "ditunda" di Project Knowledge bagian 15). Ekspor ZIP untuk Canva memakai direct fill. Opsi "SVG asli (stroke, untuk diedit di Illustrator/Figma)" tetap tersedia sebagai pilihan kedua dan masuk ke folder terpisah `svg-asli/`, supaya tidak tertukar saat upload ke Canva.
  - Diterapkan di Fase 5 (`review-ops.buildSetZip`): SVG Canva = render mode `mask` → `directFillSvgFile`. Opsi Tinjau "Sertakan SVG asli" (`review.asli`, bawaan mati) menambah `svg-asli/<nama>.svg` yang identik dengan keluaran IC 1.5.1; pilihan Celah knockout (`review.ko`) hanya berlaku untuk SVG asli dan sprite.
  - Garis putus-putus yang masih ada di objek bawaan (`ticket` classic, placeholder ikon hilang) dipanggang jadi geometri oleh `outlineSvgFile` (`bakeDashArrays`): satu sub-path terbuka per dash dengan ujung garis yang sama, jadi pikselnya setara dan tidak ada `stroke-dasharray` di keluaran. Render UI dan golden tidak berubah karena pemanggangan hanya di jalur ekspor. Berlaku juga untuk Builder.
  - Ikon yang tetap gagal direct fill tidak masuk akar ZIP dan `metadata.csv`; status unduhan menyebut nama filenya, dan SVG aslinya tetap ikut `svg-asli/` bila aktif. Unduhan lain tidak dibatalkan.

## 2. Kompatibilitas per mesin

| Mesin | Risiko outline | Tindakan |
|---|---|---|
| classic, accent | sudah teruji di TIB 1.6.0 | golden test |
| offset | stroke + fill biasa, tanpa mask | uji fixture |
| hand-writing | `stroke-dasharray` diabaikan IconOutline (garis jadi utuh) | **dash dipanggang** di mesin (lihat `engines/hand-writing.md`); `export-canva.spec.js` memastikan celah tetap terlihat di direct fill |
| hand-writing | rotasi + mask knockout | lulus uji fixture 20 ikon (selisih mask vs direct fill < 1,5%). Warna mask wajib `#fff`/`#000` persis: `flattenSvgMasks` mencari bidang potong dengan warna `"#000"`, jadi mask `#000000` tidak memotong apa pun |
| sticker | halo putih = warna ke-4; stroke halo sangat tebal | mode `mask` memotong setiap bagian dengan siluet bagian di atasnya, sehingga warna tidak bertumpuk saat diratakan (`engines/sticker.md`); lolos `export-canva.spec.js` (≤4 warna, di dalam viewBox, selisih < 1,5%) |

Tes wajib: `tests/e2e/export-canva.spec.js` merender 20 ikon per mesin, menjalankan `directFillSvgFile`, dan memeriksa:
1. tidak ada exception;
2. jumlah warna ≤ `supports.maxColors`;
3. selisih piksel antara render mask dan render direct-fill < 1,5%.

## 3. Struktur ZIP

### Template Icon Builder

Folder per gaya mengikuti `MODE_INFO`. Gaya baru menambah entri:

| Gaya | Folder | Akhiran file | Kata gaya (judul EN) | Kata gaya (judul ID) |
|---|---|---|---|---|
| accent | `aksen/` | `-aksen.svg` | Accent Line | garis aksen |
| classic A | `garis-solid/` | `-garis-solid.svg` | Two Tone | dua warna |
| classic B | `solid-garis/` | `-solid-garis.svg` | Solid Two Tone | solid dua warna |
| offset | `offset/` | `-offset.svg` | Offset Style | gaya offset |
| hand-writing | `hand-writing/` | `-hand-writing.svg` | Hand-writing Style | gaya hand-writing |
| sticker | `sticker/` | `-sticker.svg` | Sticker Style | gaya sticker |

Kata gaya untuk tiga gaya baru mengikuti pola "Icon-style" (keputusan pemilik). Rinciannya di bagian 4.

Opsi `exSplit` (`slot-deck/` dan `ekstra/`) tetap berlaku di setiap folder gaya.

**Offset di Builder (Fase 3).** Mode Builder `O` (`MODE_INFO.O`, folder `offset/`) merender ikon manifest dengan mesin offset lewat `renderManifestItem`, lalu `directFillSvgFile` seperti gaya lain. Pengubah tidak dirender. Tinta dan aksen diambil dari gaya manifest, isi warna (`solid`, `white`, `line`) dari `style.engine.offset.mode`, dekorasi memakai bawaan `offsetDeco` (kilat kanan atas + garis tanah). Bila folder `offset/` ikut diekspor:
- `metadata.csv` memakai kata gaya `Offset Style` / `gaya offset` dan kata kunci gaya sama dengan Tinjau (`offset style`, `line icon`, `two tone icon`); tag pengubah tidak ikut.
- `metadata-internal.csv` menulis `modifier` = `none` untuk baris `offset`.
- `submission-profile.json` mendapat `offset_engine`, dan `LICENSES.txt` mendapat satu baris `offset/`.
- `manifest-final.json` menulis `style.family: "offset"` dan `style.mode` isi warna bila pratinjau aktif Offset.
Tanpa folder `offset/`, isi ZIP classic/accent tetap identik dengan TIB 1.6.0 (golden).

**Hand-writing di Builder (Fase 4).** Mode Builder `H` (`MODE_INFO.H`, folder `hand-writing/`) merender ikon manifest dengan mesin hand-writing lewat `renderManifestItem`, lalu `directFillSvgFile`. Pengubah pustaka dirender di anchor item. Tinta dan aksen diambil dari gaya manifest, parameter goresan dari `style.engine["hand-writing"]` (bawaan mesin bila kosong, `manifestHandWritingStyle`). Manifest dengan `style.family` `"hand-writing"` atau `"coret"` (lama) memilih mode H. Flag mode H: objek bawaan `err` (ikon dilewati bila "Lewati ikon bermasalah"), pengubah bawaan `warn`, tabrakan nama dengan ikon pustaka dan dobel `err`; tanpa pengubah bukan masalah (sama dengan offset). Bila folder `hand-writing/` ikut diekspor:
- `metadata.csv` memakai kata gaya `Hand-writing Style` / `gaya hand-writing` dan kata kunci gaya `hand-writing style, hand drawn icon, doodle icon` / `gaya hand-writing, ikon gambar tangan, ikon doodle`; tag pengubah ikut.
- `submission-profile.json` mendapat `hand_writing_engine`, dan `LICENSES.txt` mendapat satu baris `hand-writing/`.
- `manifest-final.json` menulis `style.family: "hand-writing"`, `style.engine["hand-writing"]`, dan `icons[].engine["hand-writing"] = {ms, blob, seed}` bila pratinjau aktif Hand-writing.
Tanpa folder `hand-writing/`, isi ZIP classic/accent tetap identik dengan TIB 1.6.0 (golden).

**Sticker di Builder (Fase 5).** Mode Builder `S` (`MODE_INFO.S`, folder `sticker/`) merender ikon manifest dengan mesin sticker: pengubah dirender di 4 sudut (slot 8 dipetakan), tinta dari `style.ink`, isi objek dari `style.accent`, isi pengubah kuning, mode warna dari `style.engine.sticker.mode`, dekorasi dan gaya lain bawaan mesin. Flag: objek/pengubah tidak dikenal, flag mesin sticker, nama gabungan sama dengan pustaka, dan dobel objek + pengubah. Bila folder `sticker/` ikut diekspor: kata gaya `Sticker Style` / `gaya sticker`, `submission-profile.json` mendapat `sticker_engine`, `LICENSES.txt` mendapat satu baris `sticker/`, dan `manifest-final.json` menulis `style.family: "sticker"` bila pratinjau aktif Sticker.

```
<nama-pack>.zip
├─ <folder-gaya>/[slot-deck|ekstra/]<id>-<akhiran>.svg
├─ metadata.csv
├─ resource-page.html
├─ manifest-final.json        + style.family baru, + icons[].engine.<id>.{seed,var}
├─ submission-profile.json    + ringkasan repetisi
└─ LICENSES.txt
```

### Icon Composer

```
<nama>.zip
├─ <nama>-<akhiran>.svg    direct fill untuk Canva (hanya path fill)
├─ svg-asli/<nama>.svg     opsional (review.asli): SVG asli IC dengan stroke
├─ LICENSES.txt
├─ gaya.json        {format:"icon-composer", version, family, engine:{id,version}, style, icons:[...]}
├─ metadata.csv     filename,title,keywords,Artist,locale,description (BOM + CRLF)
└─ pratinjau.html   lembar kontak (sheetHTML IC 1.5.1; dipakai juga untuk set sticker)
```

## 4. Judul metadata (pola "Icon-style")

Pola judul tetap seperti di Project Knowledge bagian 6.4. Untuk tiga gaya baru, bagian `[Gaya]` diisi **nama gaya + `Style`**, lalu diakhiri `Icon`:

| Bahasa | Pola | Contoh |
|---|---|---|
| EN | `[Nama] [Tema pack] [Gaya] Style Icon` | `Scan The Market Marketing Process Offset Style Icon` |
| EN | | `Koper Siap Travel Set Hand-writing Style Icon` |
| EN | | `Road Trip Travel Set Sticker Style Icon` |
| ID | `Ikon [nama] [tema pack] gaya [gaya]` | `Ikon pindai pasar proses pemasaran gaya offset` |

Kata kunci gaya yang ditambahkan: `offset style`, `hand-writing style` + `hand drawn`, `sticker style` + `sticker`, ditambah `icon`/`ikon`.

Judul classic dan accent **tidak berubah** (`Accent Line`, `Two Tone`, `Solid Two Tone`), supaya pack yang sudah terbit tetap konsisten.

Konstanta `STYLE_WORDS` di `packages/export` menjadi satu-satunya sumber kata gaya judul. Composer (metadata.csv untuk extension) dan Builder (metadata.csv Canva) sama-sama membacanya lewat `styleWord(family, mode)`. Daftar kata kunci gaya masih berbeda per app (lihat `docs/legacy/INVENTORY.md`).

Format `metadata.csv`: BOM UTF-8, baris CRLF, semua sel data dikutip. Header Composer dikutip (ADR-016). Header Builder tetap tanpa kutip seperti legacy 1.6.0.

## 5. Manifest dari Claude Design

`style.family` di manifest menerima nilai baru `offset`, `hand-writing`, `sticker`. Konsekuensinya:
- Skill `deck-icon-slots` perlu versi baru yang mengenal tiga gaya ini dan menjelaskan bahwa offset tidak memakai pengubah.
- Konstanta `TIB_VERSION` (yang juga versi skill) naik minor.
- Manifest lama tanpa `family` tetap dibaca sebagai `accent`.
