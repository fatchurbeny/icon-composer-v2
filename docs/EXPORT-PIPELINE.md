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

## 2. Kompatibilitas per mesin

| Mesin | Risiko outline | Tindakan |
|---|---|---|
| classic, accent | sudah teruji di TIB 1.6.0 | golden test |
| offset | stroke + fill biasa, tanpa mask | uji fixture |
| hand-writing | `stroke-dasharray` diabaikan IconOutline (garis jadi utuh) | **dash dipanggang** di mesin (lihat `engines/hand-writing.md`) |
| hand-writing | rotasi + mask knockout | uji fixture; rotasi harus ikut diratakan |
| sticker | halo putih = warna ke-4; stroke halo sangat tebal | uji fixture; pastikan halo tidak menutup isi saat diratakan |

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
├─ <nama>-<akhiran>.svg
├─ gaya.json        {format:"icon-composer", version, family, engine:{id,version}, style, icons:[...]}
├─ metadata.csv     filename,title,keywords,Artist,locale,description (BOM + CRLF)
└─ pratinjau.html   (dari sticker legacy: lembar kontak)
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
