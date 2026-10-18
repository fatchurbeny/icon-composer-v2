# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Versi app dan versi mesin dicatat terpisah.

## Unreleased

### Ditambahkan
- Fase 2 berjalan: paket bersama `core`, `icon-sources`, registry mesin classic/accent, dan pipeline ekspor mulai diekstrak serta dilindungi tes unit dan golden.
- Fase 2b berjalan: shell awal `Icon Studio` dengan empat persona, routing hash, perilaku komponen UI, dan tes ukuran kerangka handoff.
- Fase 3 berjalan: mesin `offset` 1.1.0 masuk registry dengan normalisasi ukuran 84%, flag pengubah nonaktif, signature, axes, dan mode warna dasar.
- Fase 4 berjalan: mesin `hand-writing` 2.0.0 masuk registry, memakai seed deterministik dan mengeluarkan segmen geometri tanpa `stroke-dasharray`.
- Fase 4 dilanjutkan: migrator payload `coret` ke item kanonik `hand-writing` ditambahkan, termasuk anchor, seed, blob, dan parameter gaya.
- Fase 1: port Icon Composer 1.5.1 dan Template Icon Builder 1.6.0 ke sumber Vite terpisah, fixture serta baseline SVG golden, dan uji paritas keluaran SVG/ZIP terhadap legacy.
- Dokumentasi pengembangan awal: AGENTS.md, docs/, rencana migrasi ke monorepo Vite.
- Fondasi Fase 0: npm workspaces, Vite single-file, Vitest, Playwright, ESLint, Prettier, dan salinan legacy terverifikasi.
- Fixture pustaka ikon offline, Git/graphify proyek, serta checksum lima HTML fundamental.

### Diubah
- Gaya "Coret" berganti nama menjadi "Hand-writing" (`hand-writing`).
- Keputusan ADR-009 s.d. ADR-012: flag info offset, kata gaya "Icon-style", direct fill wajib di Composer, ukuran objek offset 84%.
- ADR-015: filter Bentuk "Isi" = bentuk tertutup untuk semua library.
- ADR-013/014: aplikasi terpadu Icon Studio (4 persona) dan UI kit `packages/ui` sebagai satu-satunya sumber gaya.
- Fase 2 (langkah 1): `MAIN_ALIAS`, `MOD_ALIAS`, `MOD_SYN`, dan `variantsOf` dipindah dari kedua app ke `@icon-studio/icon-sources`. Keluaran golden tidak berubah.
- Fase 2 (langkah 2): render classic (`composeClassic`, `decoMarkupClassic`, `geomClassic`, `modeOfClassic`) pindah ke `packages/engines/classic/compose.js` tanpa DOM. Varian IC dan TIB dipertahankan lewat `ctx` (`solidFit`, `solidDetails`, `decoStarFill`). Keluaran golden tidak berubah.
- Fase 2 (langkah 3): render accent (`composeAccent`, `modAccent`, `decoAccent`, `modPreviewAccent`) pindah ke `packages/engines/accent/compose.js`. Pengukuran bentuk dan aturan peran tetap di app, disuntik lewat `ctx`. Keluaran golden tidak berubah.
- Fase 2 (langkah 4): helper pengukuran dan bentuk (`measureNode`, `splitPath`, `svgParts`, `bbOf`, `analyzeLibraryIcon`, `mainInfoOf`, `modShapeOf`, `autoRoles`, `intersectionRatio`) pindah ke `packages/engines/shared`. Satu-satunya akses DOM ada di `shared/measure.js` (`setMeasureHost`). Keluaran golden tidak berubah.
- Fase 2 (langkah 5): `rolesOf` dipindah ke `shared` dengan parameter `customRoles` (TIB memberi `cuRoles`, IC tidak). Mesin classic dan accent kini dipanggil lewat registry `get(family)`, dan adapter `compose` menerima `options.ctx`. Keluaran golden tidak berubah.
- Fase 2 (langkah 6): perakitan ZIP Icon Composer memakai `buildZip` dari `@icon-studio/export`. Isi file tidak berubah. Belum dipindah: `metadataCSV` (header IC tanpa kutip, paket memakai kutip) dan `STYLE_WORD` TIB, menunggu keputusan format.
- Fase 2 (langkah 7): `metadataCSV` Icon Composer memakai `metadataCsv` dari `@icon-studio/export`. Perubahan format: baris header `metadata.csv` kini diberi kutip, sama seperti baris data. Isi nilai tidak berubah.
- Fase 2 (langkah 8): pemuat pustaka ikon (`createIconSources`: cache Lucide, Tabler dengan filter kategori, Hugeicons, Kustom) dan katalog kategori pindah ke `@icon-studio/icon-sources`. `ensureLucide`/`luAnalyze` pindah ke `createLibraryShapes` di `engines/shared`. URL CDN dibaca dari `sources.json`. Golden diperluas ke Tabler, Hugeicons, Kustom, dan tag. Keluaran tidak berubah.
- Fase 2 (langkah 9): data bawaan classic (`MAINS`, `PREFS`, `MODS`, `SHIFT`, `SLOT_GLYPH`, `DECOS`) pindah ke `createClassicData` di `packages/engines/classic/data.js`. Aturan Solid·garis 1.4.5 TIB pindah ke `packages/engines/classic/solid.js` dan aktif lewat `ctx.solidV145`. IC belum memakainya. Keluaran tidak berubah.
- Fase 2 (langkah 10): tag pustaka, `titleCase`, `trID` (`packages/export/tags.js`) dan hitung warna (`packages/export/colors.js`) dipakai kedua app. Kata gaya judul dibaca dari `STYLE_WORDS` (kunci `classic:C` ditambah, kata accent ID dibetulkan menjadi `garis aksen` sesuai legacy). ZIP dan CSV TIB memakai `buildZip` dan `metadataCsv` (header tetap tanpa kutip). Golden ZIP Icon Composer ditambah. Keluaran tidak berubah.
- Fase 2 (langkah 11): tes unit untuk `icon-sources` (pemuat Tabler, Hugeicons, Lucide, Kustom), mesin classic (`solidV145`, `createClassicData`), dan `export` (`STYLE_WORDS`, `metadataCsv`, `buildZip`, warna, tag).
- ADR-016: header `metadata.csv` Icon Composer dikutip. Fase 2 ditandai selesai di `MIGRATION-PLAN.md`, menunggu persetujuan pemilik.

### Ditambahkan (desain)
- Render acuan 5 artboard (`docs/design/reference/`), sumber artboard (`docs/design/artboards/`), `scripts/render-artboards.py`, `packages/icon-sources/sources.json`, bahan pendukung dari folder lama (lihat `docs/legacy/INVENTORY.md`).
- `packages/ui` (tokens.css, components.css, components.js, icons.js), `docs/design/` (DESIGN-HANDOFF.md, UI-RULES.md, ui-kit.html + aset contoh), `scripts/lint-ui.mjs`, `scripts/build-ui-icons.mjs`.

## Basis sebelum migrasi (dibekukan di `legacy/`)

| File | Versi |
|---|---|
| icon-composer-aksen | 1.5.1 |
| template-icon-builder-aksen | 1.6.0 (mesin classic 1.4.5) |
| offset-composer | 1.0.1 |
| coret-composer (→ hand-writing) | 1.0.0 |
| sticker-composer | tanpa nomor versi (dianggap 1.0.0) |
