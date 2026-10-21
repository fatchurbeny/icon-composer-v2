# Graph Report - remove-old-apps-bb06e2  (2026-10-21)

## Corpus Check
- 160 files · ~171,310 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .css 3, .csv 2)

## Summary
- 1484 nodes · 3936 edges · 76 communities (75 shown, 1 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 333 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b47cd74`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- golden-utils.js
- render-artboards.py
- README.md
- ui/package.json
- build-icon-data.mjs
- 001-from-legacy.js
- transformBody
- Mesin `sticker`
- scripts
- builder-ops.js
- 5. L3: perencana variasi
- Log keputusan (ADR)
- render.js
- Mesin `offset`
- devDependencies
- components.js
- kombinasi.js
- document.js
- engines-offset.test.js
- Tech stack
- export-canva.spec.js
- icon-sources/index.js
- setStyleValue
- Arsitektur
- geometry.js
- flagsOf
- builder-ops.js
- composer-edit.js
- app-state.js
- palettes.js
- Mesin `hand-writing` (dulu "Coret")
- composer.js
- handWritingParams
- engines-offset.test.js
- engines
- export-canva.spec.js
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- dash.js
- lint-ui.mjs
- offset/index.js
- engines-hand-writing.test.js
- builder.js
- engines/package.json
- core/package.json
- export/package.json
- icon-sources/package.json
- app-state.js
- icon-studio/package.json
- README.md
- @playwright/test
- hand-writing/index.js
- vitest
- review-ops.js
- studio-undo.spec.js
- Rencana migrasi
- library-panel.js
- export-canva.spec.js
- Aturan UI untuk agen (wajib dipatuhi)
- importManifest
- 5. L3: perencana variasi
- Langkah
- doExport
- offset/index.js
- engines/index.js
- directFillSvgFile
- engines/index.js
- ui-language.spec.js
- vitest
- ref_node_path
- sticker-parity.spec.js
- 5. L3: perencana variasi
- 4. localStorage
- Produk: tujuan, batasan, alur kerja
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `esc()` - 59 edges
2. `createRenderer()` - 37 edges
3. `Diubah` - 33 edges
4. `createAppState()` - 32 edges
5. `createShell()` - 29 edges
6. `alert()` - 29 edges
7. `aria()` - 28 edges
8. `directFillSvgFile()` - 27 edges
9. `normItem()` - 26 edges
10. `@playwright/test` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Status sel matriks` --references--> `exists()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → apps/icon-studio/src/state/builder-ops.js
- `Fase 6: Anti-repetisi` --references--> `dupMap()`  [INFERRED]
  docs/MIGRATION-PLAN.md → apps/icon-studio/src/state/builder-ops.js
- `UI` --references--> `isBad()`  [INFERRED]
  docs/ANTI-REPETITION.md → apps/icon-studio/src/state/builder-ops.js
- `Masalah legacy yang diperbaiki` --references--> `comboItem()`  [INFERRED]
  docs/engines/sticker.md → apps/icon-studio/src/state/combo-ops.js
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js

## Import Cycles
- None detected.

## Communities (76 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.15
Nodes (13): name, private, type, version, workspaces, eslint, eslint-config-prettier, @eslint/js (+5 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.12
Nodes (18): fixture, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip(), captureTemplateIconBuilder(), captureTemplateIconBuilderZip(), installOfflineRoutes() (+10 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.11
Nodes (11): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data, Parameter per item, Glosarium (+3 more)

### Community 3 - "README.md"
Cohesion: 0.25
Nodes (7): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "build-icon-data.mjs"
Cohesion: 0.12
Nodes (14): ADR-019 · 2026-10-20 · Mesin sticker dan direct fill di ZIP Composer (Fase 5), CLOSED_TAGS, closedMarkupEndpoint(), data, isClosed(), KEEP, LU, markup() (+6 more)

### Community 6 - "001-from-legacy.js"
Cohesion: 0.30
Nodes (12): defaultManifestStyle(), applyFamily(), createManifestDocument(), createSetDocument(), manifestStyle(), normSetStyle(), randomUid(), stickerSetFromComposer() (+4 more)

### Community 7 - "transformBody"
Cohesion: 0.28
Nodes (13): engineFlags(), autoPanelCheck(), boxesOf(), colorCountNote(), colorSwatches(), handWritingTransformBody(), layerOf(), offsetTransformBody() (+5 more)

### Community 8 - "Mesin `sticker`"
Cohesion: 0.15
Nodes (12): Batas warna Canva, Cara kerja, Data bentuk isi, Di Icon Studio, Hasil golden visual (`tests/e2e/sticker-parity.spec.js`), Masalah legacy yang diperbaiki, Mesin `sticker`, Mode `mask` dan `white` (+4 more)

### Community 9 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, fixtures:fetch, format:check, golden:capture, icon-data, legacy:verify, lint (+4 more)

### Community 10 - "builder-ops.js"
Cohesion: 0.11
Nodes (26): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, hwItemOf(), INTERNAL_COLUMNS, LICENSE_HAND_WRITING, LICENSE_OFFSET, LICENSE_STICKER (+18 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.18
Nodes (10): 1. Cakupan (keputusan pemilik), 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib) (+2 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.10
Nodes (21): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+13 more)

### Community 13 - "render.js"
Cohesion: 0.05
Nodes (89): paintSwatches(), finalManifest(), manifestHandWritingStyle(), manifestOffsetStyle(), manifestStickerItem(), manifestStickerStyle(), MODES, useStyle() (+81 more)

### Community 14 - "Mesin `offset`"
Cohesion: 0.20
Nodes (10): Flag khusus, Icon Studio (Fase 3), Mesin `offset`, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`), adapt() (+2 more)

### Community 15 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+3 more)

### Community 16 - "components.js"
Cohesion: 0.06
Nodes (62): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka (+54 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.10
Nodes (38): actions, canvas(), control(), deps(), headIcon(), isSet(), matrixOf(), mutate() (+30 more)

### Community 18 - "document.js"
Cohesion: 0.13
Nodes (16): DEFAULT_SET_STYLE, FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, ENGINE_FAMILIES, FILLS, ID_RE, ADR-0012 (+8 more)

### Community 19 - "engines-offset.test.js"
Cohesion: 0.18
Nodes (5): DECO_SETS, OFFSET_DEFAULTS, ctx, LUCIDE, vendor

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "export-canva.spec.js"
Cohesion: 0.15
Nodes (7): DECO_SETS, downloadSvgs(), H, ADR-0011, KEYS, LIB_SAMPLES, VENDOR

### Community 22 - "icon-sources/index.js"
Cohesion: 0.11
Nodes (22): Fase 2: Ekstrak paket bersama ✅, EN_ID, SMALL, STOP, CAT_ID, ID_EN, LU_CATS, TB_CAT_ID (+14 more)

### Community 23 - "setStyleValue"
Cohesion: 0.31
Nodes (9): control(), mutate(), mutateItem(), rerender(), selectedOf(), control(), libraryControl(), setSlot() (+1 more)

### Community 24 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 25 - "geometry.js"
Cohesion: 0.32
Nodes (11): Cara kerja, Knockout (`opt.mode`), Normalisasi kanvas, ARGS, boxOf(), partBox(), samplePath(), analyzeOffset() (+3 more)

### Community 26 - "flagsOf"
Cohesion: 0.33
Nodes (12): createVocabulary(), collisions(), exists(), suggest(), dupKey(), flagsOf(), handWritingFlagsOf(), lev() (+4 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.07
Nodes (67): actions, composerSet, ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), BLOB_NAME, cell() (+59 more)

### Community 29 - "app-state.js"
Cohesion: 0.13
Nodes (16): HAND_WRITING_LEGACY_KEY, handWritingSetFromComposer(), LEGACY_KEYS, MIGRATION_ID, OFFSET_KEY, migrateFromHandWriting(), MIGRATION_ID, MIGRATION_ID (+8 more)

### Community 30 - "palettes.js"
Cohesion: 0.22
Nodes (8): ACCENT_OPTIONS, CURATED_PALETTES, FILL_OPTIONS, HAND_WRITING_ACCENT_OPTIONS, HAND_WRITING_INK_OPTIONS, INK_OPTIONS, LINE_OPTIONS, OFFSET_ACCENT_OPTIONS

### Community 31 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.22
Nodes (8): Cara kerja, Flag, Knockout (`opt.mode`), Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Penggantian nama, Sumbu variasi (`axes`), Versi pustaka

### Community 32 - "composer.js"
Cohesion: 0.13
Nodes (45): colorRow(), COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineInfo(), isFixedLayout() (+37 more)

### Community 33 - "handWritingParams"
Cohesion: 0.38
Nodes (7): Parameter gaya (berlaku untuk seluruh set), handWritingItem(), handWritingParams(), migrateLegacy(), normStyle(), num(), seedOf()

### Community 34 - "engines-offset.test.js"
Cohesion: 0.18
Nodes (24): applyColors(), chips(), colorActions, currentOf(), pickerExtra(), swatchOptions(), clamp(), fromChroma() (+16 more)

### Community 35 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, npm

### Community 36 - "export-canva.spec.js"
Cohesion: 0.31
Nodes (10): 2. Modul, packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS, styleWord(), createTagIndex() (+2 more)

### Community 39 - "Peta konteks proyek dengan graphify"
Cohesion: 0.25
Nodes (7): 1. Instalasi (sekali, di Mac), 2. Membangun dan memperbarui graf, 3. Yang dipetakan dan yang tidak, 4. Cara agen memakai graf, 5. Konvensi kode agar graf mudah dibaca, 6. Hubungan dengan Project claude.ai, Peta konteks proyek dengan graphify

### Community 40 - "Usulan komponen kit: Fase 2b"
Cohesion: 0.20
Nodes (9): 1. Artboard edit, kotak seleksi, filmstrip, 2. Grup slide dan kartu ikon, 3. Lembar kontak dan uji 32 px, 4. Area drop dan field banyak baris, Pertanyaan untuk Ika (dijawab 2026-10-18), Ringkasan, Setelah disetujui, Token baru (`tokens.css`) (+1 more)

### Community 41 - "dash.js"
Cohesion: 0.23
Nodes (18): WAJIB: memanggang dash, arcLen(), bakeDash(), bigEnough(), cache, cheapFar(), conicLen(), cubicLen() (+10 more)

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "offset/index.js"
Cohesion: 0.08
Nodes (43): signature(), signature(), adapt(), axes(), COLOR_PAIRS, compose(), CURL_SIDES, decoParts() (+35 more)

### Community 44 - "engines-hand-writing.test.js"
Cohesion: 0.12
Nodes (9): HAND_WRITING_DEFAULTS, ctx, KEYS, LEGACY, LEGACY_S, LUCIDE, MODS, root (+1 more)

### Community 46 - "builder.js"
Cohesion: 0.08
Nodes (64): actions, ANCHORS, badgeOf(), brandId(), builder, card(), checkCanvas(), deps() (+56 more)

### Community 47 - "engines/package.json"
Cohesion: 0.17
Nodes (11): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, ./sticker, name (+3 more)

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.29
Nodes (6): exports, ./vendor/icon-outline, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.22
Nodes (8): exports, ./catalog, ./custom, ./fill-shapes, name, private, type, version

### Community 52 - "app-state.js"
Cohesion: 0.18
Nodes (22): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), handWritingComposerSource(), offsetComposerSource() (+14 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "README.md"
Cohesion: 0.18
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 55 - "@playwright/test"
Cohesion: 0.10
Nodes (9): dxy(), xy(), openPanel(), openTransform(), pickLibrary(), sticker, H, ADR-0011 (+1 more)

### Community 56 - "hand-writing/index.js"
Cohesion: 0.16
Nodes (20): Icon Studio, Fase 4: Mesin hand-writing ✅, hash(), rng(), adapt(), ANCHORS, boxesHandWriting(), cleanNode() (+12 more)

### Community 58 - "vitest"
Cohesion: 0.36
Nodes (5): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT

### Community 59 - "review-ops.js"
Cohesion: 0.13
Nodes (30): cellsOf(), esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZip(), buildSetZipFiles(), canvaSVG() (+22 more)

### Community 61 - "Rencana migrasi"
Cohesion: 0.29
Nodes (6): 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 62 - "library-panel.js"
Cohesion: 0.24
Nodes (9): fillable, isFillable(), libraryAction(), libraryResults(), libraryUi, LICENSE_NOTE, namesOf(), SOURCE_LABEL (+1 more)

### Community 63 - "export-canva.spec.js"
Cohesion: 0.06
Nodes (53): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+45 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 68 - "importManifest"
Cohesion: 0.27
Nodes (10): importManifest(), normAcc(), sparkHome(), toItem(), 7. Struktur Icon Studio (`apps/icon-studio/src/`), 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 3.3 Builder · Periksa pack, 1. Fondasi state + golden render Icon Studio ✅ (+2 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.16
Nodes (20): ensureComboFields(), blankItem(), normItem(), SET_FAMILIES, addItem(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem() (+12 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "offset/index.js"
Cohesion: 0.18
Nodes (18): touches(), compose(), decoPaths(), emptySvg(), flags(), ADR-0012, KEEP, metrics() (+10 more)

### Community 73 - "engines/index.js"
Cohesion: 0.26
Nodes (8): accent, classic, handWriting, offset, engines, migrateFamily(), normStyle(), register()

### Community 76 - "directFillSvgFile"
Cohesion: 0.13
Nodes (27): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`), 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP (+19 more)

### Community 78 - "engines/index.js"
Cohesion: 0.20
Nodes (10): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset ✅, Fase 5: Mesin sticker ✅, Fase 6: Anti-repetisi, Fase 7: Skill dan rilis (+2 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "vitest"
Cohesion: 0.22
Nodes (4): FILL_SHAPE_VERSIONS, vitest, dataFile, root

### Community 84 - "ref_node_path"
Cohesion: 0.15
Nodes (9): NAMES, out, files, outputDir, root, sources, hw, mixed (+1 more)

### Community 85 - "sticker-parity.spec.js"
Cohesion: 0.15
Nodes (10): ALL, caseOf(), CASES, H, ADR-0019, RESTORED, RESTORED_REDRAWN, RULE_CHANGED (+2 more)

### Community 86 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 88 - "4. localStorage"
Cohesion: 0.33
Nodes (6): 4.1.1 Preset saya dan sumber swatch (app-level), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4.4 Urungkan dan ulangi (hanya di memori), 4.5 Migrasi 003 (`apps/icon-studio/src/state/migrations/003-from-hand-writing.js`), 4.6 Migrasi 004 (`apps/icon-studio/src/state/migrations/004-from-sticker.js`), 4. localStorage

### Community 89 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 92 - "@playwright/test"
Cohesion: 0.09
Nodes (4): @playwright/test, VENDOR, offline(), open()

## Knowledge Gaps
- **19 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0011`, `ADR-0012`, `ADR-0017` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 539 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `package.json`, `engines-offset.test.js`, `export-canva.spec.js`, `Langkah`, `engines/index.js`, `builder-ops.js`, `offset/index.js`, `engines-hand-writing.test.js`, `render.js`, `kombinasi.js`, `document.js`, `engines-offset.test.js`, `icon-sources/index.js`, `vitest`, `review-ops.js`, `composer-edit.js`, `app-state.js`, `export-canva.spec.js`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0011` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12307692307692308 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `render-artboards.py`, `export-canva.spec.js`, `builder-ops.js`, `Mesin `sticker``, `builder-ops.js`, `render.js`, `builder.js`, `Mesin `offset``, `Produk: tujuan, batasan, alur kerja`, `flagsOf`, `review-ops.js`, `export-canva.spec.js`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 32 inferred relationships involving `Diubah` (e.g. with `importManifest()` and `normAcc()`) actually correct?**
  _`Diubah` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Should `render-artboards.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._