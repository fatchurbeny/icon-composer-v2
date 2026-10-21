# Arsitektur

## 1. Lapisan dan arah ketergantungan

```
apps/icon-composer        apps/template-icon-builder
        │                          │
        └────────────┬─────────────┘
                     ▼
   packages/export   packages/repetition
          │                 │
          └───────┬─────────┘
                  ▼
          packages/engines  (registry + 5 mesin)
                  │
                  ▼
   packages/icon-sources   packages/core
```

Aturan:
- Panah hanya ke bawah. `packages/*` tidak boleh mengimpor dari `apps/*`.
- `packages/engines` tidak tahu soal UI, localStorage, atau ZIP.
- `packages/repetition` memakai mesin hanya lewat registry (`compose`, `axes`, `signature`), tidak memanggil fungsi internal mesin.

## 2. Modul

| Modul | Tanggung jawab | Fungsi utama |
|---|---|---|
| `core` | Utilitas murni | `rng(seed)` (mulberry32), `hash(str)` (FNV-1a), `partStr`, `dedupeAttrs`, `r2/r3`, `bboxUnion` |
| `icon-sources` | Memuat dan menormalkan pustaka | `createIconSources({getLucide, custom})` (cache Lucide, `loadTabler`, `loadHugeicons`, Kustom, `customRoles`), `SOURCE_URLS` dari `sources.json`, `concept(key)`, `variantsOf`, `libNameOf`; subpath `/catalog` (kategori, `ID_EN`), `/custom` (`CUSTOM_ICONS`), dan `/fill-shapes` (`loadFillShapes`, `fillShapeOf`, `fillShapeReady`: bentuk isi sticker yang dimuat malas, lihat `engines/sticker.md`) |
| `engines/registry` | Daftar mesin dan dispatch | `register(engine)`, `get(id)`, `list()`, `migrateFamily(id)` |
| `engines/<id>` | Satu gaya | `compose`, `axes`, `signature`, `defaults`, `normStyle`, `adapt`. Classic juga punya `createClassicData` (data bawaan) dan `solid.js` (aturan Solid·garis 1.4.5, aktif lewat `ctx.solidV145`) |
| `engines/shared` | Analisis bentuk yang dipakai lebih dari satu mesin | `createLibraryShapes` (dulu `luAnalyze`/`ensureLucide`), `analyzeLibraryIcon`, `mainInfoOf`, `modShapeOf`, `rolesOf`, `setMeasureHost` |
| `repetition` | Deteksi dan variasi | `signatureFlags`, `fingerprint`, `similarPairs`, `planVariations` |
| `export` | Dari SVG mentah ke file Canva | `outlineSvgFile`, `directFillSvgFile`, `buildZip`, `metadataCsv`, `STYLE_WORDS`/`styleWord`, `createTagIndex`, `titleCase`, `trID`, `svgColors`, `packColors`. Rencana: `gayaJson` |

## 3. Alur render satu ikon

```
item (format kanonik, lihat DATA-MODEL.md)
  → engine = registry.get(style.family)
  → params = engine.adapt(item, style)          // terjemahkan ke parameter mesin
  → svgRaw = engine.compose(params, style, opt)  // string SVG, viewBox asli mesin
  → svg48  = normalizeCanvas(svgRaw, engine.canvas)  // dibungkus ke viewBox 0 0 48 48
  → tampil di UI  /  dikirim ke packages/export untuk ekspor
```

`normalizeCanvas` membungkus isi dengan `<g transform="scale(48/canvas)">`. Transform ini diratakan oleh pipeline outline saat ekspor, jadi tidak tersisa di file Canva.

## 4. Alur repetisi

```
daftar item dalam cakupan (Composer: set aktif · TIB: pack aktif)
  → signature per item          → flag "Rakitan dobel"       (L1)
  → fingerprint per item (async) → flag "Mirip #n"           (L2)
  → planVariations(items)        → item.var + item.seed       (L3, dijalankan saat diminta)
```

Detail di `ANTI-REPETITION.md`.

## 5. Perbedaan dua aplikasi

| Hal | Icon Composer | Template Icon Builder |
|---|---|---|
| Sumber item | Editor manual + Kombinasi massal | Manifest dari Claude Design |
| Cakupan repetisi | Set aktif, dalam satu gaya | Satu pack |
| Pemilihan gaya | `style.family` per set | Pratinjau aktif (`pv`) + pilihan gaya ekspor |
| Ekspor | ZIP: SVG + `gaya.json` + `metadata.csv` (extension) | ZIP: SVG per gaya + `metadata.csv` (Canva) + manifest + resource page + submission profile |

Kedua app memakai mesin, planner, dan pipeline ekspor yang sama. Yang berbeda hanya UI dan cara item dibuat.

## 6. State dan penyimpanan

- State app disimpan di `localStorage`. Kuncinya didaftar di `DATA-MODEL.md`.
- Mesin tidak menyimpan state. Cache analisis bentuk (`analyzeParts`) dan cache sidik jari dikelola di modulnya sendiri, dengan kunci = hash input.
- Pengukuran bentuk butuh `getBBox`/`getTotalLength`. Semua pengukuran lewat satu `<svg id="meas">` tersembunyi yang disediakan app dan disuntikkan ke `packages/engines/shared` (`setMeasureHost(el)`), supaya modul tetap bisa diuji di Playwright.

## 7. Struktur Icon Studio (`apps/icon-studio/src/`)

Sejak Fase 2b, kedua app digabung di Icon Studio. Persona Composer memakai varian classic IC, persona Builder memakai classic 1.4.5 (ADR-017).

| Path | Isi |
|---|---|
| `main.js` | titik masuk: kit UI, renderer, state app, kerangka, kait uji `window.__iconStudio` |
| `shell.js` | kerangka, routing hash, tab dokumen, delegasi event ke persona (`actions`, `control`, `mount`, `canvasFoot`), toast |
| `canvas-zoom.js` | zoom dan geser kanvas (CSS `zoom` pada `.studio-zoom`), tool Geser/Perbesar, pintasan |
| `app-state.js` | dokumen, dokumen aktif, seleksi per dokumen, riwayat sesi, migrasi sekali, penyimpanan |
| `ui.js` | pembantu markup kelas `.ic-*` (panel, segmented, dropdown, angka, peringatan) |
| `personas/` | `composer.js` (Set), `composer-edit.js`, `builder.js`, `tinjau.js`, `kombinasi.js`, `library-panel.js`, `common.js` |
| `state/document.js` | model item dan dokumen (`normItem`, `importManifest`, `useStyle`) |
| `state/render.js` | satu pintu ke mesin: registry pustaka dan `ctx` per jenis dokumen |
| `state/set-ops.js`, `edit-ops.js`, `combo-ops.js` | operasi Composer, Edit, dan Kombinasi |
| `state/builder-ops.js`, `review-ops.js` | logika ekspor TIB 1.6.0 dan Tinjau pack IC 1.5.1 |
| `state/store.js`, `state/migrations/` | `icon-studio-v1` dan migrasi dari kunci lama |
| `state/data/` | data mesin dan pratinjau (warna), `data/export/` untuk template file ekspor |

Keluaran Icon Studio dijaga oleh `tests/e2e/studio-golden.spec.js`: SVG, ZIP Builder, dan ZIP Composer dibandingkan langsung dengan app legacy.
