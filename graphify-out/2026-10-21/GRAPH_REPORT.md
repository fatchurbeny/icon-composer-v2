# Graph Report - fase-4-hand-writing-331e40  (2026-10-20)

## Corpus Check
- 161 files · ~178,893 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1733 nodes · 4486 edges · 82 communities (81 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 301 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf122d8f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- golden-utils.js
- Model data
- README.md
- ui/package.json
- template-icon-builder/src/main.js
- icon-composer/src/main.js
- vendor-1.js
- icon-composer/package.json
- template-icon-builder/package.json
- hand-writing/index.js
- 5. L3: perencana variasi
- Log keputusan (ADR)
- builder.js
- export/index.js
- C
- components.js
- kombinasi.js
- document.js
- studio-state.test.js
- Tech stack
- geometry.js
- icon-sources/index.js
- render
- Arsitektur
- Mesin `offset`
- classic/index.js
- builder-ops.js
- composer-edit.js
- app-state.js
- At
- render.js
- composer.js
- compose
- engines-offset.test.js
- doExport
- export-canva.spec.js
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- dash.js
- lint-ui.mjs
- offset/index.js
- engines-hand-writing.test.js
- n
- builder.js
- engines/package.json
- shell.js
- core/package.json
- export/package.json
- icon-sources/package.json
- studio-migration.test.js
- icon-studio/package.json
- on
- @playwright/test
- Mesin `hand-writing` (dulu "Coret")
- renderDetail
- vitest
- review-ops.js
- studio-undo.spec.js
- Rencana migrasi
- shell.js
- export-canva.spec.js
- Aturan UI untuk agen (wajib dipatuhi)
- store.js
- shell.js
- accentCtx
- esc
- 5. L3: perencana variasi
- Langkah
- doExport
- Mesin `sticker`
- studio-migration.spec.js
- Pipeline ekspor
- Mesin `accent` (Aksen bagian)
- directFillSvgFile
- Produk: tujuan, batasan, alur kerja
- engines/index.js
- ui-language.spec.js
- Mesin `classic` (Klasik)
- ref_node_path

## God Nodes (most connected - your core abstractions)
1. `esc()` - 58 edges
2. `createRenderer()` - 32 edges
3. `r3()` - 31 edges
4. `createAppState()` - 29 edges
5. `createShell()` - 29 edges
6. `get()` - 29 edges
7. `aria()` - 27 edges
8. `alert()` - 27 edges
9. `C()` - 27 edges
10. `directFillSvgFile()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Masalah legacy yang diperbaiki` --references--> `comboItem()`  [INFERRED]
  docs/engines/sticker.md → apps/icon-studio/src/state/combo-ops.js
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4.1 Isi `icon-studio-v1`` --references--> `manifestOffsetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (82 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "Model data"
Cohesion: 0.08
Nodes (19): ensureManifestItem(), 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4.1.1 Preset saya dan sumber swatch (app-level), 4.1 Isi `icon-studio-v1`, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`) (+11 more)

### Community 3 - "README.md"
Cohesion: 0.12
Nodes (11): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya, Icon-Composer v2 (+3 more)

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "template-icon-builder/src/main.js"
Cohesion: 0.05
Nodes (44): ACC_OPTS, accCache, ANCHORS, applyManStyle(), CANVA_COLUMNS, closeCreatorMenu(), closeKwMenu(), closeLocaleMenu() (+36 more)

### Community 6 - "icon-composer/src/main.js"
Cohesion: 0.04
Nodes (58): ACC_OPTS, accCache, adLoad(), adRender(), adShow(), baseNameEN(), batchItem(), blankItem() (+50 more)

### Community 7 - "vendor-1.js"
Cohesion: 0.06
Nodes (18): ai(), an(), ce(), $e(), ei(), Fe(), fn(), ie() (+10 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "hand-writing/index.js"
Cohesion: 0.12
Nodes (27): boxesOf(), setHandWritingItem(), hash(), adapt(), ANCHORS, BLOB_MODES, boxesHandWriting(), cleanNode() (+19 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.12
Nodes (16): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+8 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.10
Nodes (20): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+12 more)

### Community 13 - "builder.js"
Cohesion: 0.22
Nodes (20): layerPaints(), r3(), composeAccent(), decoAccent(), modAccent(), modPreviewAccent(), composeClassic(), decoMarkupClassic() (+12 more)

### Community 14 - "export/index.js"
Cohesion: 0.14
Nodes (37): iconBody(), importArea(), statusBar(), autoPanelCheck(), handWritingTransformBody(), offsetTransformBody(), slotGrid(), transformBody() (+29 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (27): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+19 more)

### Community 16 - "components.js"
Cohesion: 0.07
Nodes (54): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 4. Inventaris komponen, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib) (+46 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.16
Nodes (28): actions, canvas(), control(), deps(), headIcon(), isSet(), matrixOf(), mutate() (+20 more)

### Community 18 - "document.js"
Cohesion: 0.13
Nodes (20): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, ENGINE_FAMILIES, FILLS, HAND_WRITING_LEGACY_KEY (+12 more)

### Community 19 - "studio-state.test.js"
Cohesion: 0.09
Nodes (16): app, renderer, shell, SAMPLE_MANIFEST, applyFamily(), PRESET, STORE_KEY, createClassicData() (+8 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "geometry.js"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "icon-sources/index.js"
Cohesion: 0.10
Nodes (26): libName(), tagsOf(), 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅ (+18 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "Mesin `offset`"
Cohesion: 0.10
Nodes (22): Cara kerja, Flag khusus, Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Risiko, Sumbu variasi (`axes`) (+14 more)

### Community 26 - "classic/index.js"
Cohesion: 0.18
Nodes (24): Diubah, bboxUnion(), escapeAttribute(), partStr(), createLibraryShapes(), analyze(), ensure(), bbOf() (+16 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.08
Nodes (59): control(), ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), BLOB_NAME, boxesOf(), cell() (+51 more)

### Community 29 - "app-state.js"
Cohesion: 0.24
Nodes (18): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), createManifestDocument(), createSetDocument(), handWritingComposerSource() (+10 more)

### Community 30 - "At"
Cohesion: 0.25
Nodes (11): At(), bn(), De(), dn(), ir(), mn(), Se(), vn() (+3 more)

### Community 31 - "render.js"
Cohesion: 0.14
Nodes (22): manifestHandWritingStyle(), MODES, useStyle(), createRenderer(), accentCtx(), classicCtx(), flagsOf(), mainInfo() (+14 more)

### Community 32 - "composer.js"
Cohesion: 0.09
Nodes (53): colorRow(), swatchOptions(), COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags() (+45 more)

### Community 33 - "compose"
Cohesion: 0.13
Nodes (35): buildZip(), classicCtx(), compose(), download(), esc(), exportSVG(), fileNames(), fillOf() (+27 more)

### Community 34 - "engines-offset.test.js"
Cohesion: 0.19
Nodes (23): applyColors(), chips(), currentOf(), pickerExtra(), clamp(), fromChroma(), HARMONIES, harmony() (+15 more)

### Community 35 - "doExport"
Cohesion: 0.24
Nodes (13): brandId(), doExport(), finalManifest(), kebab2(), meta(), packOf(), pathOf(), renderExport() (+5 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.22
Nodes (14): 2. Modul, packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS, styleWord(), createTagIndex() (+6 more)

### Community 37 - "cn"
Cohesion: 0.36
Nodes (8): cn(), Ft(), In(), Le(), _n(), Vt(), xn(), Zt()

### Community 38 - "jn"
Cohesion: 0.13
Nodes (15): ae(), En(), gn(), Ht(), jn(), kn(), Nt(), Oe() (+7 more)

### Community 39 - "Peta konteks proyek dengan graphify"
Cohesion: 0.25
Nodes (7): 1. Instalasi (sekali, di Mac), 2. Membangun dan memperbarui graf, 3. Yang dipetakan dan yang tidak, 4. Cara agen memakai graf, 5. Konvensi kode agar graf mudah dibaca, 6. Hubungan dengan Project claude.ai, Peta konteks proyek dengan graphify

### Community 40 - "Usulan komponen kit: Fase 2b"
Cohesion: 0.20
Nodes (9): 1. Artboard edit, kotak seleksi, filmstrip, 2. Grup slide dan kartu ikon, 3. Lembar kontak dan uji 32 px, 4. Area drop dan field banyak baris, Pertanyaan untuk Ika (dijawab 2026-10-18), Ringkasan, Setelah disetujui, Token baru (`tokens.css`) (+1 more)

### Community 41 - "dash.js"
Cohesion: 0.25
Nodes (17): WAJIB: memanggang dash, arcLen(), bakeDash(), bigEnough(), cache, cheapFar(), conicLen(), cubicLen() (+9 more)

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "offset/index.js"
Cohesion: 0.15
Nodes (24): Icon Studio (Fase 3), Parameter per item, touches(), unionBox(), adapt(), axes(), boxesOffset(), compose() (+16 more)

### Community 44 - "engines-hand-writing.test.js"
Cohesion: 0.12
Nodes (9): HAND_WRITING_DEFAULTS, ctx, KEYS, LEGACY, LEGACY_S, LUCIDE, MODS, root (+1 more)

### Community 45 - "n"
Cohesion: 0.15
Nodes (13): gt(), He(), hi(), jt(), ke(), Me(), pe(), qt() (+5 more)

### Community 46 - "builder.js"
Cohesion: 0.06
Nodes (72): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+64 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "shell.js"
Cohesion: 0.19
Nodes (17): collisions(), cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex() (+9 more)

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.29
Nodes (6): exports, ./vendor/icon-outline, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.25
Nodes (7): exports, ./catalog, ./custom, name, private, type, version

### Community 52 - "studio-migration.test.js"
Cohesion: 0.16
Nodes (15): randomUid(), ADR-0017, LEGACY_KEYS, readJson(), migrateFromOffset(), MIGRATION_ID, OFFSET_KEY, migrateFromHandWriting() (+7 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "on"
Cohesion: 0.17
Nodes (13): nr(), on(), Qn(), 1. Cakupan (keputusan pemilik), 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack (+5 more)

### Community 55 - "@playwright/test"
Cohesion: 0.08
Nodes (8): @playwright/test, VENDOR, dxy(), xy(), openPanel(), openTransform(), H, VENDOR

### Community 56 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.22
Nodes (8): Flag, Icon Studio, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Penggantian nama, Sumbu variasi (`axes`), Versi pustaka

### Community 57 - "renderDetail"
Cohesion: 0.19
Nodes (21): curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad(), keyLabel() (+13 more)

### Community 58 - "vitest"
Cohesion: 0.36
Nodes (5): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT

### Community 59 - "review-ops.js"
Cohesion: 0.15
Nodes (25): esc(), previewSheetHTML(), SET_LICENSES, layerBoxes(), baseNameEN(), buildSetZipFiles(), DEFAULT_CANVA_META, DEFAULT_REVIEW (+17 more)

### Community 61 - "Rencana migrasi"
Cohesion: 0.09
Nodes (22): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2: Ekstrak paket bersama ✅, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset ✅, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker (+14 more)

### Community 62 - "shell.js"
Cohesion: 0.24
Nodes (11): fillable, isFillable(), libraryAction(), libraryBody(), libraryResults(), libraryTile(), libraryUi, LICENSE_NOTE (+3 more)

### Community 63 - "export-canva.spec.js"
Cohesion: 0.18
Nodes (5): DECO_SETS, downloadSvgs(), H, KEYS, VENDOR

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "store.js"
Cohesion: 0.38
Nodes (9): defaultStorage(), emptyState(), hasState(), ADR-0017, loadState(), normColorPresets(), normSwatchSource(), saveState() (+1 more)

### Community 66 - "shell.js"
Cohesion: 0.08
Nodes (50): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+42 more)

### Community 67 - "accentCtx"
Cohesion: 0.19
Nodes (13): accentCtx(), boxes(), composeAccent(), cycleRole(), decoMarkup(), geom(), luAnalyze(), mainInfo() (+5 more)

### Community 68 - "esc"
Cohesion: 0.29
Nodes (6): Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Prinsip, Rencana Fase 2b: UI terpadu Icon Studio, Tes per langkah

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.19
Nodes (16): ensureComboFields(), blankItem(), SET_FAMILIES, addItem(), clearLayer(), DEFAULT_POOL, DEFAULT_VIEW, duplicateGroups() (+8 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 73 - "studio-migration.spec.js"
Cohesion: 0.40
Nodes (3): hw, mixed, offset

### Community 74 - "Pipeline ekspor"
Cohesion: 0.22
Nodes (8): 1. Tahapan, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Aturan wajib ekspor Canva (keputusan pemilik), Icon Composer, Penerapan per aplikasi, Pipeline ekspor

### Community 75 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.29
Nodes (7): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Rotasi per ikon, Sumbu variasi (`axes`), autoRoles()

### Community 76 - "directFillSvgFile"
Cohesion: 0.25
Nodes (16): svgFile(), Catatan migrasi, Cara kerja, Knockout (`opt.mode`), 2. Kompatibilitas per mesin, dedupeAttrs(), cloneSingleShape(), colorKey() (+8 more)

### Community 77 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 78 - "engines/index.js"
Cohesion: 0.60
Nodes (4): accent, classic, handWriting, offset

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "Mesin `classic` (Klasik)"
Cohesion: 0.40
Nodes (4): Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`)

### Community 84 - "ref_node_path"
Cohesion: 0.08
Nodes (17): NAMES, out, builds, dist, root, files, outputDir, root (+9 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0012`, `ADR-0017`, `ADR-0017` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 599 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Model data`, `doExport`, `export-canva.spec.js`, `template-icon-builder/src/main.js`, `review-ops.js`, `Pipeline ekspor`, `Mesin `accent` (Aksen bagian)`, `offset/index.js`, `Produk: tujuan, batasan, alur kerja`, `builder.js`, `export/index.js`, `Mesin `classic` (Klasik)`, `studio-state.test.js`, `icon-sources/index.js`, `builder-ops.js`, `render.js`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0012` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `on` to `kombinasi.js`, `review-ops.js`, `vendor-1.js`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `studio-state.test.js` to `package.json`, `shell.js`, `engines-offset.test.js`, `export-canva.spec.js`, `Langkah`, `engines-hand-writing.test.js`, `builder.js`, `engines/index.js`, `builder.js`, `kombinasi.js`, `studio-migration.test.js`, `icon-sources/index.js`, `Mesin `offset``, `vitest`, `review-ops.js`, `composer-edit.js`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._