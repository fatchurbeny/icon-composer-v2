# Inventaris file lama

File di `legacy/` adalah versi final sebelum migrasi. **Read-only.** Dipakai sebagai rujukan golden test dan sebagai sumber port kode.

Isi kolom SHA-256 di Fase 0 dengan `shasum -a 256 legacy/**/*.html`.

| File | Versi | Ukuran | SHA-256 | Dipindah ke |
|---|---|---|---|---|
| `legacy/icon-composer-aksen-v1.5.1.html` | IC 1.5.1 | 272 KB | `208d35852ccfd3f14afdc348b32b1fb42ef031e8e7306f88c7828b158d4b654b` | `apps/icon-composer`, mesin classic/accent |
| `legacy/template-icon-builder-aksen-v1.6.0.html` | TIB 1.6.0, mesin classic 1.4.5 | 408 KB | `c0f1823f8a2b65e4611cde6e944a994087763bacdae45dc7c8c1cc23ad152643` | `apps/template-icon-builder`, `packages/export` |
| `legacy/style/offset-composer-v1.0.1.html` | 1.0.1 | 14 KB | `dc69f33eebcdcd21e0b2738fd3aa136b1312df7423bbca54ddc3878fbea4f53a` | `packages/engines/offset` |
| `legacy/style/coret-composer-v1.0.0.html` | 1.0.0 | 20 KB | `4c034c1cb550c322e0ee8fa81a1839942c23eb5dde38cf407b549721c8bf39b3` | `packages/engines/hand-writing` |
| `legacy/style/sticker-composer.html` | (1.0.0) | 2 MB, termasuk data ikon tertanam | `89cb974c6fe7b4f85f71a76d3ef5e2d624c699049935fa76354cf4d0e16f72ee` | `packages/engines/sticker`, `scripts/build-icon-data.mjs` |

## Bahan pendukung yang sudah disalin dari folder lama

Sumber: `~/Documents/Project/Icon-Composer/icon-creator-handoff/` dan `~/Documents/Project/Icon-Composer/`.

| Tujuan di repo | Asal | Kegunaan |
|---|---|---|
| `legacy/src/template-icon-builder-aksen/` | `src/template-icon-builder-aksen/` | Sumber build TIB sampai 1.6.0 (`template-v1.6.0.html`, `engine-v1.6.0.js`, `engine2.js`, `asm-v1.6.0.py`, `SKILL-v1.5.1.template.md`). Dipakai untuk memisah kode di Fase 1. File terbaru = bernomor versi tertinggi. |
| `legacy/tests/` | `tests/` | Tes Node lama (`builder-*.test.cjs`, `output-*.test.cjs`) sebagai acuan skenario |
| `legacy/skill/deck-icon-slots-v1.5.1.md` | `skill/` | Versi skill terbaru untuk Claude Design |
| `legacy/reference/` | `reference/` | Lembar eksplorasi gaya (aksen, geometris, studio ikon) |
| `packages/export/vendor/icon-outline.min.js` | `src/template-icon-builder-aksen/` | Mesin outline untuk direct fill Canva (`IconOutline`) |
| `packages/icon-sources/data/custom-icons.json` | `src/template-icon-builder-aksen/` | Library kustom `cu:` |
| `tests/fixtures/manifests/creative-workshop-planner.json` | `sample.json` | Manifest contoh 28 ikon |
| `tests/fixtures/manifests/series-a-icon-manifest.json` | `reference/` | Manifest nyata Series A (40 slot + 20 ekstra, format v1) |
| `tests/fixtures/outline-mask/` | `tests/outline-mask-test-icons/` | Ikon uji outline + mask untuk direct fill |
| `docs/legacy/PROJECT-KNOWLEDGE.md` | `Icon-Composer/PROJECT-KNOWLEDGE.md` | Konteks sejarah Icon Creator sampai v1.6.0 |

## Peta fungsi lama → modul baru

### IC 1.5.1 / TIB 1.6.0

| Fungsi lama | Modul baru |
|---|---|
| `luIndex`, `tbIndex`, `hgIndex`, `loadTabler`, `loadHugeicons`, `ensureLucide` | `icon-sources` |
| `splitPath`, `prepNode`, `measure`, `luAnalyze`, `mainInfo`, `bbOf` | `engines/shared` |
| `compose`, `geom`, `decoMarkup`, `lineOf`, `fillOf`, `PREFS`, `SHIFT`, `DECOS` | `engines/classic` |
| `composeAccent`, `autoRoles`, `rolesOf`, `modShape`, `modAccent`, `decoAccent` | `engines/accent` |
| `applyFamily`, `FAMILY_DEFAULT`, `normStyle` | `engines/registry` |
| `variantsOf`, `MOD_SYN`, `libName`, `MAIN_ALIAS`, `MOD_ALIAS` | `icon-sources/concept` |
| `collisions`, `flagsOf`, `dupMap`, `isBad` | `repetition` (+ sisa flag non-repetisi tetap di app TIB) |
| `outlineSvgFile`, `directFillSvgFile`, `dedupeAttrs`, `svgFile`, `IconOutline` | `export` |
| `metadataCSV`, `fileNames`, `buildZip`, `spriteSVG`, `sheetHTML` | `export` |
| `partStr` | `core` |

### offset-composer 1.0.1

| Fungsi lama | Modul baru |
|---|---|
| `compose`, `closed`, `splitParts`, `areaOf` | `engines/offset` (+ `closed` dan `areaOf` ke `engines/shared`) |

### coret-composer 1.0.0

| Fungsi lama | Modul baru |
|---|---|
| `coret` | `engines/hand-writing/strokeSet` |
| `compose`, `ANC` | `engines/hand-writing` |
| `rng`, `hash` | `core` |

### sticker-composer

| Fungsi lama | Modul baru |
|---|---|
| `layer`, `deco`, `compose`, `SLOTS`, `SLOT_ANG`, `STAR`, `PALETTE` | `engines/sticker` |
| `shapes`, `<script id="icondata">` | `icon-sources.fillShapeOf` + `scripts/build-icon-data.mjs` |
| `combos`, `comboItem`, `presetPools` | `apps/icon-composer/src/ui/batch.js` (seed digantikan planner) |
| `sheetHTML`, `spriteSVG` (pratinjau.html) | `export` |

## Perbedaan yang ditemukan saat migrasi

Catat di sini setiap perbedaan perilaku antar salinan kode (misalnya classic IC vs classic TIB), beserta keputusan versi mana yang dipakai.

| Tanggal | Fungsi | Perbedaan | Dipakai |
|---|---|---|---|
| 2026-10-17 | `partStr`, `dedupeAttrs` | TIB menimpa atribut lama saat atribut tambahan diberikan dan membersihkan atribut SVG ganda; IC tidak. | Perilaku TIB. |
| 2026-10-17 | Classic `compose` | TIB 1.6.0 memakai mesin classic 1.4.5: kotak pengubah adaptif pada Solid·garis, celah berdasarkan overlap, pewarnaan detail struktural, dan `solidLineDiagnostic`. IC 1.5.1 belum memilikinya. | Mesin TIB 1.4.5 menjadi kanonis. |
| 2026-10-18 | Dekorasi classic (`DECOS`, `decoStarFill`) | IC punya dekorasi bintang `star4` dan `star4x2` yang dirender terisi (`decoStarFill: true`). TIB tidak punya keduanya (`decoStarFill: false`). | Keduanya dipertahankan: `createClassicData({starDecos})` dan `ctx.decoStarFill`. |
| 2026-10-18 | Classic Solid·garis 1.4.5 | Aturan Solid·garis 1.4.5 kini di `packages/engines/classic/solid.js`, aktif lewat `ctx.solidV145`. TIB menyalakannya, IC belum (keputusan Ika 2026-10-18, golden IC tetap). | TIB: aktif. IC: menyusul lewat keputusan terpisah. |
| 2026-10-18 | `normStyle` | `normStyle` IC (batas skala, efek `fx`, keluarga default classic) berbeda dari `normStyle` registry mesin. | Tetap di IC sebagai normalisasi gaya set, bukan logika mesin. |
