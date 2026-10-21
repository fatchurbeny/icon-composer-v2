# Graph Report - icon-composer-v2  (2026-10-21)

## Corpus Check
- 163 files · ~179,873 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, .css 3, .csv 2)

## Summary
- 1546 nodes · 4047 edges · 72 communities (69 shown, 3 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 349 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7bde9c5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- golden-utils.js
- render-artboards.py
- README.md
- ui/package.json
- fill-shapes.test.js
- createRenderer
- Design handoff: Icon Studio (UI terpadu)
- ref_node_path
- engines-sticker.test.js
- builder-ops.js
- 5. L3: perencana variasi
- Log keputusan (ADR)
- render.js
- transformBody
- scripts
- components.js
- kombinasi.js
- document.js
- devDependencies
- Tech stack
- export-canva.spec.js
- render.js
- importManifest
- Arsitektur
- offset/index.js
- setStyleValue
- builder-ops.js
- composer-edit.js
- app-state.js
- 2. Item kanonik
- 5. L3: perencana variasi
- composer.js
- get
- engines-offset.test.js
- studio-composer-edit.spec.js
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
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
- tinjau.js
- Aturan UI untuk agen (wajib dipatuhi)
- shell.js
- normItem
- 5. L3: perencana variasi
- Langkah
- doExport
- engines/index.js
- studio-tinjau.spec.js
- directFillSvgFile
- engines/index.js
- ui-language.spec.js
- @playwright/test
- sticker-parity.spec.js
- Produk: tujuan, batasan, alur kerja
- manifestOffsetStyle

## God Nodes (most connected - your core abstractions)
1. `esc()` - 59 edges
2. `Diubah` - 33 edges
3. `createAppState()` - 32 edges
4. `createRenderer()` - 30 edges
5. `alert()` - 29 edges
6. `createShell()` - 29 edges
7. `aria()` - 28 edges
8. `2. Modul` - 26 edges
9. `normItem()` - 26 edges
10. `@playwright/test` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Status sel matriks` --references--> `exists()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → apps/icon-studio/src/state/builder-ops.js
- `Fase 6: Anti-repetisi` --references--> `dupMap()`  [INFERRED]
  docs/MIGRATION-PLAN.md → apps/icon-studio/src/state/builder-ops.js
- `UI` --references--> `isBad()`  [INFERRED]
  docs/ANTI-REPETITION.md → apps/icon-studio/src/state/builder-ops.js
- `2. Modul` --references--> `fillShapeOf()`  [INFERRED]
  docs/ARCHITECTURE.md → packages/icon-sources/fill-shapes.js
- `Pemuatan malas` --references--> `ready()`  [INFERRED]
  docs/engines/sticker.md → packages/icon-sources/fill-shapes.js

## Import Cycles
- None detected.

## Communities (72 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.14
Nodes (14): engines, node, npm, name, private, type, version, workspaces (+6 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.16
Nodes (14): fixture, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip(), captureTemplateIconBuilder(), captureTemplateIconBuilderZip(), installOfflineRoutes() (+6 more)

### Community 3 - "README.md"
Cohesion: 0.25
Nodes (7): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "fill-shapes.test.js"
Cohesion: 0.13
Nodes (14): createFillShapes(), fillShapeOf(), load(), ready(), decodeFillShapes(), FILL_SHAPE_SEED, fillShapeOf, fillShapeVersions (+6 more)

### Community 6 - "createRenderer"
Cohesion: 0.17
Nodes (19): layerBoxes(), createRenderer(), accentCtx(), boxesOf(), classicCtx(), flagsOf(), loadStickerFills(), mainInfo() (+11 more)

### Community 7 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.11
Nodes (18): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka, 3. Anatomi layar (+10 more)

### Community 8 - "ref_node_path"
Cohesion: 0.14
Nodes (9): NAMES, out, files, outputDir, root, sources, hw, mixed (+1 more)

### Community 9 - "engines-sticker.test.js"
Cohesion: 0.15
Nodes (7): COLOR_PAIRS, SLOT_MAP, STICKER_DEFAULTS, ctx, LUCIDE, TABLER, vendor

### Community 10 - "builder-ops.js"
Cohesion: 0.09
Nodes (40): brandId(), metadataBody(), BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, createVocabulary(), collisions(), exists() (+32 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.18
Nodes (10): 1. Cakupan (keputusan pemilik), 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib) (+2 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.06
Nodes (37): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+29 more)

### Community 13 - "render.js"
Cohesion: 0.07
Nodes (65): paintSwatches(), layerPaints(), Diperbaiki, Ditambahkan, Ditambahkan (desain), Diubah, Unreleased, Masalah yang diketahui (+57 more)

### Community 14 - "transformBody"
Cohesion: 0.32
Nodes (12): engineFlags(), autoPanelCheck(), boxesOf(), colorCountNote(), handWritingTransformBody(), layerOf(), offsetTransformBody(), slotGrid() (+4 more)

### Community 15 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, fixtures:fetch, format:check, golden:capture, icon-data, legacy:verify, lint (+4 more)

### Community 16 - "components.js"
Cohesion: 0.11
Nodes (43): 4. Inventaris komponen, accordion(), collapse(), colorpicker(), cpBary(), cpBuild(), cpChanged(), cpClose() (+35 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.23
Nodes (17): poolBody(), activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO (+9 more)

### Community 18 - "document.js"
Cohesion: 0.12
Nodes (26): stickerItemColors(), stickerPackColors(), DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, defaultModFill() (+18 more)

### Community 19 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+3 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "export-canva.spec.js"
Cohesion: 0.15
Nodes (7): DECO_SETS, downloadSvgs(), H, ADR-0011, KEYS, LIB_SAMPLES, VENDOR

### Community 22 - "render.js"
Cohesion: 0.12
Nodes (4): MODES, STICKER_MODE, ADR-0017, CUSTOM_ICONS

### Community 23 - "importManifest"
Cohesion: 0.31
Nodes (9): importManifest(), normAcc(), sparkHome(), toItem(), useStyle(), 7. Struktur Icon Studio (`apps/icon-studio/src/`), 3.3 Builder · Periksa pack, 1. Fondasi state + golden render Icon Studio ✅ (+1 more)

### Community 24 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 25 - "offset/index.js"
Cohesion: 0.06
Nodes (64): WAJIB: memanggang dash, Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set) (+56 more)

### Community 26 - "setStyleValue"
Cohesion: 0.29
Nodes (8): control(), selectLayer(), mount(), mutate(), openTab(), rerender(), moveItem(), setStyleValue()

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.09
Nodes (55): ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), BLOB_NAME, cell(), CURSORS, editActions (+47 more)

### Community 29 - "app-state.js"
Cohesion: 0.12
Nodes (27): PERSONAS, defaultExportOptions(), HAND_WRITING_LEGACY_KEY, handWritingComposerSource(), handWritingSetFromComposer(), offsetComposerSource(), offsetSetFromComposer(), randomUid() (+19 more)

### Community 30 - "2. Item kanonik"
Cohesion: 0.20
Nodes (8): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data, Glosarium, engine()

### Community 31 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 32 - "composer.js"
Cohesion: 0.11
Nodes (52): colorRow(), COMPOSER_TOOLS, duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineInfo(), isFixedLayout(), isHandWriting() (+44 more)

### Community 33 - "get"
Cohesion: 0.43
Nodes (5): engines, get(), migrateFamily(), normStyle(), register()

### Community 34 - "engines-offset.test.js"
Cohesion: 0.16
Nodes (26): applyColors(), chips(), currentOf(), pickerExtra(), swatchOptions(), clamp(), fromChroma(), HARMONIES (+18 more)

### Community 39 - "Peta konteks proyek dengan graphify"
Cohesion: 0.25
Nodes (7): 1. Instalasi (sekali, di Mac), 2. Membangun dan memperbarui graf, 3. Yang dipetakan dan yang tidak, 4. Cara agen memakai graf, 5. Konvensi kode agar graf mudah dibaca, 6. Hubungan dengan Project claude.ai, Peta konteks proyek dengan graphify

### Community 40 - "Usulan komponen kit: Fase 2b"
Cohesion: 0.20
Nodes (9): 1. Artboard edit, kotak seleksi, filmstrip, 2. Grup slide dan kartu ikon, 3. Lembar kontak dan uji 32 px, 4. Area drop dan field banyak baris, Pertanyaan untuk Ika (dijawab 2026-10-18), Ringkasan, Setelah disetujui, Token baru (`tokens.css`) (+1 more)

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "offset/index.js"
Cohesion: 0.12
Nodes (27): axes(), compose(), CURL_SIDES, decoParts(), emptySvg(), hasMod(), KEEP, layerParts() (+19 more)

### Community 44 - "engines-hand-writing.test.js"
Cohesion: 0.12
Nodes (8): ctx, KEYS, LEGACY, LEGACY_S, LUCIDE, MODS, root, vendor

### Community 46 - "builder.js"
Cohesion: 0.09
Nodes (33): actions, ANCHORS, badgeOf(), card(), checkCanvas(), control(), deps(), dmOf() (+25 more)

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
Cohesion: 0.24
Nodes (13): createAppState(), afterRestore(), step(), PRESET, defaultStorage(), emptyState(), hasState(), ADR-0017 (+5 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "README.md"
Cohesion: 0.18
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 55 - "@playwright/test"
Cohesion: 0.09
Nodes (5): VENDOR, openPanel(), openTransform(), pickLibrary(), sticker

### Community 56 - "hand-writing/index.js"
Cohesion: 0.09
Nodes (36): 4.5 Migrasi 003 (`apps/icon-studio/src/state/migrations/003-from-hand-writing.js`), Flag, Icon Studio, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Penggantian nama (+28 more)

### Community 58 - "vitest"
Cohesion: 0.24
Nodes (6): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT, vitest

### Community 59 - "review-ops.js"
Cohesion: 0.05
Nodes (58): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZip(), buildSetZipFiles(), canvaSVG(), DEFAULT_CANVA_META (+50 more)

### Community 61 - "Rencana migrasi"
Cohesion: 0.17
Nodes (11): 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian, hash(), signature() (+3 more)

### Community 62 - "library-panel.js"
Cohesion: 0.15
Nodes (34): iconBody(), statusBar(), poolBody(), actions, canvas(), control(), deps(), headIcon() (+26 more)

### Community 63 - "tinjau.js"
Cohesion: 0.12
Nodes (28): builder, docFileName(), actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody() (+20 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 66 - "shell.js"
Cohesion: 0.06
Nodes (54): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+46 more)

### Community 68 - "normItem"
Cohesion: 0.18
Nodes (18): applyFamily(), blankItem(), createManifestDocument(), createSetDocument(), normItem(), normSetStyle(), ADR-0017, LEGACY_KEYS (+10 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.11
Nodes (22): stickerSlots(), ensureComboFields(), SET_FAMILIES, DEFAULT_POOL, DEFAULT_VIEW, HW_FIELDS, removeItem(), replaceLayer() (+14 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 73 - "engines/index.js"
Cohesion: 0.48
Nodes (5): accent, classic, handWriting, offset, sticker

### Community 75 - "studio-tinjau.spec.js"
Cohesion: 0.33
Nodes (3): H, ADR-0011, VENDOR

### Community 76 - "directFillSvgFile"
Cohesion: 0.05
Nodes (50): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`), Cara kerja, Knockout (`opt.mode`), Batas warna Canva (+42 more)

### Community 78 - "engines/index.js"
Cohesion: 0.20
Nodes (10): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset ✅, Fase 5: Mesin sticker ✅, Fase 6: Anti-repetisi, Fase 7: Skill dan rilis (+2 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 84 - "@playwright/test"
Cohesion: 0.10
Nodes (7): @playwright/test, H, HW_FIXTURE, ROUTES, VENDOR, offline(), open()

### Community 85 - "sticker-parity.spec.js"
Cohesion: 0.15
Nodes (10): ADR-0019, ALL, caseOf(), CASES, H, RESTORED, RESTORED_REDRAWN, RULE_CHANGED (+2 more)

### Community 89 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 94 - "manifestOffsetStyle"
Cohesion: 0.20
Nodes (14): finalManifest(), manifestHandWritingStyle(), manifestOffsetStyle(), manifestStickerStyle(), ensureManifestItem(), renderManifestItem(), 4.1.1 Preset saya dan sumber swatch (app-level), 4.1 Isi `icon-studio-v1` (+6 more)

## Knowledge Gaps
- **19 isolated node(s):** `ADR-0011`, `ADR-0017`, `ADR-0011`, `ADR-0016`, `ADR-0019` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 561 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `package.json`, `shell.js`, `engines-offset.test.js`, `normItem`, `fill-shapes.test.js`, `engines/index.js`, `engines-sticker.test.js`, `builder-ops.js`, `engines-hand-writing.test.js`, `render.js`, `kombinasi.js`, `app-state.js`, `offset/index.js`, `review-ops.js`, `composer-edit.js`, `app-state.js`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 32 inferred relationships involving `Diubah` (e.g. with `importManifest()` and `normAcc()`) actually correct?**
  _`Diubah` has 32 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0011`, `ADR-0017`, `ADR-0011` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Produk: tujuan, batasan, alur kerja`, `shell.js`, `builder-ops.js`, `builder-ops.js`, `render.js`, `2. Item kanonik`, `offset/index.js`, `review-ops.js`, `manifestOffsetStyle`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `createAppState()` (e.g. with `documentFor()` and `migrateFromOffset()`) actually correct?**
  _`createAppState()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `fill-shapes.test.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1341991341991342 - nodes in this community are weakly interconnected._