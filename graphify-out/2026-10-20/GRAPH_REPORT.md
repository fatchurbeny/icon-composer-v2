# Graph Report - undo-redo-bcbb05  (2026-10-20)

## Corpus Check
- 151 files · ~151,299 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1551 nodes · 3879 edges · 84 communities (83 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 257 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34e374ad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- golden-utils.js
- render-artboards.py
- Kontrak mesin gaya
- ui/package.json
- template-icon-builder/src/main.js
- icon-composer/src/main.js
- vendor-1.js
- icon-composer/package.json
- template-icon-builder/package.json
- builder-ops.js
- 5. L3: perencana variasi
- Log keputusan (ADR)
- builder.js
- tinjau.js
- C
- components.js
- kombinasi.js
- document.js
- vitest
- Tech stack
- Unreleased
- icon-sources/index.js
- render
- Arsitektur
- compose
- classic/index.js
- render.js
- composer-edit.js
- luNames
- At
- Diubah
- composer.js
- concept
- Pengujian
- Mesin `hand-writing` (dulu "Coret")
- export/index.js
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- README.md
- lint-ui.mjs
- offset/index.js
- ce
- renderDetail
- studio-migration.test.js
- engines/package.json
- Langkah
- core/package.json
- export/package.json
- icon-sources/package.json
- app-state.js
- icon-studio/package.json
- createCanvasZoom
- @playwright/test
- icon-sources/index.js
- renderPick
- vitest
- review-ops.js
- studio-undo.spec.js
- hand-writing/index.js
- library-panel.js
- Rencana migrasi
- Aturan UI untuk agen (wajib dipatuhi)
- renderLucidePick
- shell.js
- accentCtx
- concept
- 5. L3: perencana variasi
- set-ops.js
- doExport
- registry.js
- engines/index.js
- Oe
- aria
- directFillSvgFile
- engines/index.js
- 5. L3: perencana variasi
- ui-language.spec.js
- metaOf
- renderOverlay
- ref_node_path
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `esc()` - 55 edges
2. `r3()` - 31 edges
3. `createRenderer()` - 30 edges
4. `createShell()` - 28 edges
5. `get()` - 28 edges
6. `C()` - 27 edges
7. `directFillSvgFile()` - 26 edges
8. `Diubah` - 26 edges
9. `aria()` - 25 edges
10. `createAppState()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4.1 Isi `icon-studio-v1`` --references--> `manifestOffsetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (84 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.08
Nodes (18): ensureManifestItem(), 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4.1 Isi `icon-studio-v1`, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4.4 Urungkan dan ulangi (hanya di memori) (+10 more)

### Community 3 - "Kontrak mesin gaya"
Cohesion: 0.25
Nodes (7): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "template-icon-builder/src/main.js"
Cohesion: 0.05
Nodes (42): ACC_OPTS, accCache, ANCHORS, applyManStyle(), CANVA_COLUMNS, closeCreatorMenu(), closeKwMenu(), closeLocaleMenu() (+34 more)

### Community 6 - "icon-composer/src/main.js"
Cohesion: 0.05
Nodes (33): ACC_OPTS, accCache, bOff, bSel, copyText(), customs, DEFAULT_STYLE, FAMILY_DEFAULT (+25 more)

### Community 7 - "vendor-1.js"
Cohesion: 0.06
Nodes (17): ai(), an(), $e(), ei(), Fe(), fn(), He(), hi() (+9 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "builder-ops.js"
Cohesion: 0.13
Nodes (26): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, suggest(), finalManifest(), INTERNAL_COLUMNS, lev(), LICENSE_OFFSET (+18 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (18): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+10 more)

### Community 13 - "builder.js"
Cohesion: 0.10
Nodes (38): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+30 more)

### Community 14 - "tinjau.js"
Cohesion: 0.14
Nodes (27): importArea(), actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control() (+19 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.09
Nodes (26): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 4. Inventaris komponen, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib) (+18 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.10
Nodes (36): actions, canvas(), control(), deps(), headIcon(), isSet(), kombinasi, matrixOf() (+28 more)

### Community 18 - "document.js"
Cohesion: 0.12
Nodes (28): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, applyFamily(), createManifestDocument(), FILLS (+20 more)

### Community 19 - "vitest"
Cohesion: 0.10
Nodes (20): app, renderer, shell, SAMPLE_MANIFEST, PRESET, useStyle(), defaultStorage(), emptyState() (+12 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "icon-sources/index.js"
Cohesion: 0.11
Nodes (20): MODES, OFFSET_MODE, layerBoxes(), ADR-0017, 1. Fondasi state + golden render Icon Studio ✅, CAT_ID, LU_CATS, TB_CAT_ID (+12 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "compose"
Cohesion: 0.39
Nodes (9): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), sheetHTML(), slug() (+1 more)

### Community 26 - "classic/index.js"
Cohesion: 0.07
Nodes (63): createRenderer(), accentCtx(), classicCtx(), flagsOf(), mainInfo(), modPreviewAccent(), modShape(), renderManifestItem() (+55 more)

### Community 27 - "render.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.08
Nodes (55): actions, control(), ANCHORS, artSvg(), boxesOf(), classicCtx(), composerEdit, CURSORS (+47 more)

### Community 29 - "luNames"
Cohesion: 0.22
Nodes (14): collisions(), cuNames(), exists(), hgIndex(), hgNames(), lev(), libName(), luIndex() (+6 more)

### Community 30 - "At"
Cohesion: 0.22
Nodes (13): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+5 more)

### Community 31 - "Diubah"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 32 - "composer.js"
Cohesion: 0.15
Nodes (33): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo(), isOffset() (+25 more)

### Community 33 - "concept"
Cohesion: 0.17
Nodes (25): batchItem(), classicCtx(), compose(), esc(), fillOf(), getXY(), lineOf(), modeOf() (+17 more)

### Community 34 - "Pengujian"
Cohesion: 0.33
Nodes (5): 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 35 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.15
Nodes (11): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash, engines (+3 more)

### Community 36 - "export/index.js"
Cohesion: 0.15
Nodes (18): styleWordOf(), styleMeta(), meta(), styleWordOf(), tagsOf(), packColors(), svgColors(), buildZip() (+10 more)

### Community 37 - "cn"
Cohesion: 0.19
Nodes (13): cn(), Ft(), In(), jt(), Le(), _n(), pe(), R() (+5 more)

### Community 38 - "jn"
Cohesion: 0.25
Nodes (8): En(), gn(), Ht(), jn(), kn(), Nt(), tr(), zn()

### Community 39 - "Peta konteks proyek dengan graphify"
Cohesion: 0.25
Nodes (7): 1. Instalasi (sekali, di Mac), 2. Membangun dan memperbarui graf, 3. Yang dipetakan dan yang tidak, 4. Cara agen memakai graf, 5. Konvensi kode agar graf mudah dibaca, 6. Hubungan dengan Project claude.ai, Peta konteks proyek dengan graphify

### Community 40 - "Usulan komponen kit: Fase 2b"
Cohesion: 0.20
Nodes (9): 1. Artboard edit, kotak seleksi, filmstrip, 2. Grup slide dan kartu ikon, 3. Lembar kontak dan uji 32 px, 4. Area drop dan field banyak baris, Pertanyaan untuk Ika (dijawab 2026-10-18), Ringkasan, Setelah disetujui, Token baru (`tokens.css`) (+1 more)

### Community 41 - "README.md"
Cohesion: 0.25
Nodes (4): Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "offset/index.js"
Cohesion: 0.08
Nodes (45): boxesOf(), Cara kerja, Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko (+37 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderDetail"
Cohesion: 0.17
Nodes (23): brandId(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+15 more)

### Community 46 - "studio-migration.test.js"
Cohesion: 0.18
Nodes (9): randomUid(), LEGACY_KEYS, MIGRATION_ID, OFFSET_KEY, data, ADR-0012, lib, mixed (+1 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "Langkah"
Cohesion: 0.17
Nodes (11): 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 6. Persona Tinjau ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Langkah (+3 more)

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.29
Nodes (6): exports, ./vendor/icon-outline, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.25
Nodes (7): exports, ./catalog, ./custom, name, private, type, version

### Community 52 - "app-state.js"
Cohesion: 0.27
Nodes (11): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), createSetDocument(), offsetComposerSource(), offsetSetFromComposer() (+3 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "createCanvasZoom"
Cohesion: 0.23
Nodes (17): anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect(), fit(), paintLabels() (+9 more)

### Community 55 - "@playwright/test"
Cohesion: 0.08
Nodes (7): DECO_SETS, downloadSvgs(), H, KEYS, VENDOR, VENDOR, openPanel()

### Community 56 - "icon-sources/index.js"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 57 - "renderPick"
Cohesion: 0.31
Nodes (9): ensureItem(), ensureLucide(), loadHugeicons(), loadTabler(), persist(), renderPick(), runImport(), setKey() (+1 more)

### Community 58 - "vitest"
Cohesion: 0.24
Nodes (6): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT, vitest

### Community 59 - "review-ops.js"
Cohesion: 0.16
Nodes (24): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZipFiles(), DEFAULT_CANVA_META, DEFAULT_REVIEW, ensureReviewFields() (+16 more)

### Community 61 - "hand-writing/index.js"
Cohesion: 0.28
Nodes (10): hash(), adapt(), ANCHORS, attrs(), bakeDash(), compose(), EMPTY(), esc() (+2 more)

### Community 62 - "library-panel.js"
Cohesion: 0.24
Nodes (11): fillable, isFillable(), libraryAction(), libraryBody(), libraryResults(), libraryTile(), libraryUi, LICENSE_NOTE (+3 more)

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "renderLucidePick"
Cohesion: 0.32
Nodes (8): blankItem(), ensureLucide(), normItem(), openLucide(), openModal(), openPack(), renderLucidePick(), uid()

### Community 66 - "shell.js"
Cohesion: 0.14
Nodes (30): parseRoute(), routeHash(), builder, helpButton(), composerSet, tinjau, createShell(), context() (+22 more)

### Community 67 - "accentCtx"
Cohesion: 0.22
Nodes (11): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+3 more)

### Community 68 - "concept"
Cohesion: 0.31
Nodes (9): createVocabulary(), collisions(), Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, rng(), signature(), signature(), concept() (+1 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "set-ops.js"
Cohesion: 0.21
Nodes (17): ensureComboFields(), blankItem(), normItem(), addItem(), clearLayer(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem() (+9 more)

### Community 71 - "doExport"
Cohesion: 0.33
Nodes (7): doExport(), exportSkill(), finalManifest(), pathOf(), saveFile(), svgFile(), toast()

### Community 72 - "registry.js"
Cohesion: 0.17
Nodes (12): on(), Qn(), 1. Cakupan (keputusan pemilik), 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+4 more)

### Community 73 - "engines/index.js"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 74 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 75 - "aria"
Cohesion: 0.38
Nodes (13): autoPanelCheck(), colorSwatches(), offsetTransformBody(), transformBody(), engineCards(), offsetStyleTabs(), stylePanel(), styleSlider() (+5 more)

### Community 76 - "directFillSvgFile"
Cohesion: 0.13
Nodes (25): 2. Modul, Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`), 1. Tahapan, 2. Kompatibilitas per mesin (+17 more)

### Community 77 - "engines/index.js"
Cohesion: 0.52
Nodes (5): accent, classic, handWriting, migrateLegacy(), offset

### Community 78 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 79 - "ui-language.spec.js"
Cohesion: 0.28
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "metaOf"
Cohesion: 0.40
Nodes (6): baseNameEN(), libName(), libWords(), metaOf(), styleMeta(), tagsOf()

### Community 81 - "renderOverlay"
Cohesion: 1.00
Nodes (3): boxes(), geom(), renderOverlay()

### Community 84 - "ref_node_path"
Cohesion: 0.11
Nodes (13): NAMES, out, builds, dist, root, files, outputDir, root (+5 more)

### Community 85 - "@playwright/test"
Cohesion: 0.13
Nodes (5): @playwright/test, H, VENDOR, offline(), open()

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0012`, `ADR-0017`, `ADR-0017` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 554 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `registry.js` to `Langkah`, `kombinasi.js`, `vendor-1.js`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0012` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `render-artboards.py`, `export/index.js`, `template-icon-builder/src/main.js`, `doExport`, `builder-ops.js`, `tinjau.js`, `Langkah`, `vitest`, `icon-sources/index.js`, `classic/index.js`, `render.js`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createShell()` (e.g. with `importText()` and `toast()`) actually correct?**
  _`createShell()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._