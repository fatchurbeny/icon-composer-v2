# Graph Report - fase-5-sticker-612d7e  (2026-10-20)

## Corpus Check
- 164 files · ~179,657 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1774 nodes · 4567 edges · 94 communities (91 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 296 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `717addf8`
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
- render.js
- export/index.js
- C
- components.js
- kombinasi.js
- document.js
- createClassicData
- Tech stack
- editControl
- icon-sources/index.js
- render
- Arsitektur
- offset/index.js
- Model data
- builder-ops.js
- composer-edit.js
- studio-migration.test.js
- At
- edit-ops.js
- composer.js
- renderReview
- engines-offset.test.js
- doExport
- export-canva.spec.js
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- README.md
- lint-ui.mjs
- sticker/index.js
- ce
- renderLucidePick
- studio-migration.test.js
- engines/package.json
- shell.js
- core/package.json
- export/package.json
- icon-sources/package.json
- app-state.js
- icon-studio/package.json
- transformBody
- @playwright/test
- Mesin `hand-writing` (dulu "Coret")
- renderDetail
- vitest
- review-ops.js
- studio-undo.spec.js
- concept
- kombinasi.js
- shell.js
- Aturan UI untuk agen (wajib dipatuhi)
- icon-studio/src/main.js
- shell.js
- accentCtx
- esc
- 5. L3: perencana variasi
- Langkah
- doExport
- renderEditor
- @playwright/test
- hand-writing/index.js
- Mesin `sticker`
- directFillSvgFile
- engines-sticker.test.js
- Rencana migrasi
- ui-language.spec.js
- slot4
- Pipeline ekspor
- fill-shapes.test.js
- adRender
- ref_node_path
- sticker-parity.spec.js
- renderLu
- Oe
- compose
- Produk: tujuan, batasan, alur kerja
- engines/index.js
- palettes.js
- Mesin `classic` (Klasik)
- renderOverlay

## God Nodes (most connected - your core abstractions)
1. `esc()` - 59 edges
2. `createRenderer()` - 35 edges
3. `r3()` - 31 edges
4. `get()` - 31 edges
5. `createAppState()` - 29 edges
6. `createShell()` - 29 edges
7. `directFillSvgFile()` - 29 edges
8. `aria()` - 27 edges
9. `alert()` - 27 edges
10. `C()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js
- `Risiko` --references--> `check()`  [INFERRED]
  docs/engines/offset.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (94 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (39): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+31 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

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
Nodes (37): ACC_OPTS, accCache, baseNameEN(), bOff, bSel, copyText(), customs, DEFAULT_STYLE (+29 more)

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
Cohesion: 0.09
Nodes (38): brandId(), metadataBody(), BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, createVocabulary(), collisions(), exists() (+30 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.12
Nodes (16): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+8 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.10
Nodes (20): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+12 more)

### Community 13 - "render.js"
Cohesion: 0.06
Nodes (79): paintSwatches(), finalManifest(), manifestOffsetStyle(), manifestStickerItem(), manifestStickerStyle(), useStyle(), layerPaints(), createRenderer() (+71 more)

### Community 14 - "export/index.js"
Cohesion: 0.14
Nodes (29): actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control(), directCache (+21 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.06
Nodes (62): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka (+54 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.11
Nodes (29): poolBody(), activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO (+21 more)

### Community 18 - "document.js"
Cohesion: 0.09
Nodes (35): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, applyFamily(), createManifestDocument(), createSetDocument() (+27 more)

### Community 19 - "createClassicData"
Cohesion: 0.18
Nodes (9): STORE_KEY, createClassicData(), ctxOf(), fakeRenderer(), offsetFixture, stickerFixture, fakeRenderer(), lib() (+1 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "editControl"
Cohesion: 0.23
Nodes (14): control(), editControl(), mutateItem(), onKey(), mutate(), rerender(), selectedOf(), setRot() (+6 more)

### Community 22 - "icon-sources/index.js"
Cohesion: 0.14
Nodes (17): CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS, MOD_SYN (+9 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "offset/index.js"
Cohesion: 0.05
Nodes (61): Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item (+53 more)

### Community 26 - "Model data"
Cohesion: 0.17
Nodes (10): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data, Parameter per item, Glosarium (+2 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.20
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.13
Nodes (29): ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), boxesOf(), cell(), composerEdit, CURSORS (+21 more)

### Community 29 - "studio-migration.test.js"
Cohesion: 0.14
Nodes (16): SAMPLE_MANIFEST, offsetComposerSource(), offsetSetFromComposer(), readJson(), migrateFromOffset(), MIGRATION_ID, OFFSET_KEY, migrateFromSticker() (+8 more)

### Community 30 - "At"
Cohesion: 0.15
Nodes (17): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+9 more)

### Community 31 - "edit-ops.js"
Cohesion: 0.13
Nodes (25): ANCHOR_POINTS, anchorFrac(), anchorRange(), anchorXY(), angleFromDrag(), DEFAULT_ANCHOR, getXY(), LAYER_KEYS (+17 more)

### Community 32 - "composer.js"
Cohesion: 0.14
Nodes (30): colorRow(), COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo() (+22 more)

### Community 33 - "renderReview"
Cohesion: 0.26
Nodes (14): buildZip(), cleanSvg(), download(), esc(), exportSVG(), fileNames(), included(), metadataCSV() (+6 more)

### Community 34 - "engines-offset.test.js"
Cohesion: 0.15
Nodes (28): applyColors(), chips(), colorActions, currentOf(), pickerExtra(), swatchOptions(), clamp(), fromChroma() (+20 more)

### Community 35 - "doExport"
Cohesion: 0.15
Nodes (22): brandId(), collisions(), doExport(), dupMap(), exportList(), filtered(), finalManifest(), flagsOf() (+14 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.19
Nodes (14): metaOf(), styleMeta(), packColors(), svgColors(), buildZip(), STYLE_WORDS, styleWord(), createTagIndex() (+6 more)

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
Cohesion: 0.15
Nodes (9): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan (desain), Unreleased, Icon-Composer v2, Lisensi pustaka ikon, Mulai (+1 more)

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "sticker/index.js"
Cohesion: 0.11
Nodes (28): axes(), compose(), CURL_SIDES, decoParts(), emptySvg(), hasMod(), KEEP, layerParts() (+20 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderLucidePick"
Cohesion: 0.32
Nodes (8): blankItem(), ensureLucide(), normItem(), openLucide(), openModal(), openPack(), renderLucidePick(), uid()

### Community 46 - "studio-migration.test.js"
Cohesion: 0.10
Nodes (28): actions, ANCHORS, badgeOf(), card(), checkCanvas(), control(), deps(), dmOf() (+20 more)

### Community 47 - "engines/package.json"
Cohesion: 0.17
Nodes (11): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, ./sticker, name (+3 more)

### Community 48 - "shell.js"
Cohesion: 0.21
Nodes (15): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+7 more)

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
Cohesion: 0.26
Nodes (15): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), ensureReviewFields(), defaultStorage() (+7 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "transformBody"
Cohesion: 0.36
Nodes (9): autoPanelCheck(), colorCountNote(), colorSwatches(), layerOf(), offsetTransformBody(), stickerSlider(), stickerSlots(), stickerTransformBody() (+1 more)

### Community 55 - "@playwright/test"
Cohesion: 0.10
Nodes (12): DECO_SETS, downloadSvgs(), H, ADR-0011, KEYS, VENDOR, dxy(), xy() (+4 more)

### Community 56 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.15
Nodes (11): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash, engines (+3 more)

### Community 57 - "renderDetail"
Cohesion: 0.18
Nodes (19): curIt(), ensureItem(), ensureLucide(), esc(), keyLabel(), legend(), loadHugeicons(), loadTabler() (+11 more)

### Community 58 - "vitest"
Cohesion: 0.24
Nodes (6): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT, vitest

### Community 59 - "review-ops.js"
Cohesion: 0.14
Nodes (22): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZip(), buildSetZipFiles(), canvaSVG(), DEFAULT_CANVA_META (+14 more)

### Community 61 - "concept"
Cohesion: 0.18
Nodes (11): Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian, rng() (+3 more)

### Community 62 - "kombinasi.js"
Cohesion: 0.14
Nodes (36): iconBody(), manifestBody(), packColorNote(), statusBar(), actions, canvas(), control(), deps() (+28 more)

### Community 63 - "shell.js"
Cohesion: 0.14
Nodes (31): parseRoute(), routeHash(), builder, helpButton(), kombinasi, tinjau, createShell(), context() (+23 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "icon-studio/src/main.js"
Cohesion: 0.25
Nodes (3): app, renderer, shell

### Community 66 - "shell.js"
Cohesion: 0.23
Nodes (17): anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect(), fit(), paintLabels() (+9 more)

### Community 67 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 68 - "esc"
Cohesion: 0.15
Nodes (12): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks (+4 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.24
Nodes (15): ensureComboFields(), blankItem(), normItem(), addItem(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem(), ensureSetFields() (+7 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "renderEditor"
Cohesion: 0.29
Nodes (10): batchItem(), classicCtx(), fillOf(), getXY(), lineOf(), modeOf(), partThumb(), renderBatch() (+2 more)

### Community 74 - "hand-writing/index.js"
Cohesion: 0.25
Nodes (11): hash(), adapt(), ANCHORS, attrs(), bakeDash(), compose(), EMPTY(), esc() (+3 more)

### Community 75 - "Mesin `sticker`"
Cohesion: 0.33
Nodes (3): H, ADR-0011, VENDOR

### Community 76 - "directFillSvgFile"
Cohesion: 0.26
Nodes (18): 2. Modul, 1. Tahapan, Aturan wajib ekspor Canva (keputusan pemilik), Penerapan per aplikasi, 6. Persona Tinjau ✅ (menunggu tinjauan Ika), bboxUnion(), dedupeAttrs(), bakeDashArrays() (+10 more)

### Community 77 - "engines-sticker.test.js"
Cohesion: 0.17
Nodes (8): COLOR_PAIRS, SLOT_MAP, sticker, STICKER_DEFAULTS, ctx, LUCIDE, TABLER, vendor

### Community 78 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset ✅, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker ✅, Fase 6: Anti-repetisi (+3 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "slot4"
Cohesion: 0.29
Nodes (14): isOffset(), isSticker(), renderSet(), stickerDecoLabel(), layerList(), layerRows(), offsetDecoLabel(), pageRows() (+6 more)

### Community 81 - "Pipeline ekspor"
Cohesion: 0.25
Nodes (7): 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Icon Composer, Pipeline ekspor, Template Icon Builder

### Community 82 - "fill-shapes.test.js"
Cohesion: 0.32
Nodes (4): FILL_SHAPE_VERSIONS, fillShapeOf(), dataFile, root

### Community 83 - "adRender"
Cohesion: 0.40
Nodes (5): adLoad(), adRender(), adShow(), clone(), setCurrent()

### Community 84 - "ref_node_path"
Cohesion: 0.10
Nodes (15): NAMES, out, builds, dist, root, files, outputDir, root (+7 more)

### Community 85 - "sticker-parity.spec.js"
Cohesion: 0.33
Nodes (6): ALL, caseOf(), CASES, H, STYLES, VENDOR

### Community 86 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 87 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 88 - "compose"
Cohesion: 0.26
Nodes (12): compose(), nameOf(), packColors(), persist(), prefMini(), renderBins(), renderEditor(), renderPack() (+4 more)

### Community 89 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 90 - "engines/index.js"
Cohesion: 0.52
Nodes (5): accent, classic, handWriting, migrateLegacy(), offset

### Community 91 - "palettes.js"
Cohesion: 0.33
Nodes (5): ACCENT_OPTIONS, FILL_OPTIONS, INK_OPTIONS, LINE_OPTIONS, OFFSET_ACCENT_OPTIONS

### Community 92 - "Mesin `classic` (Klasik)"
Cohesion: 0.33
Nodes (5): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`)

### Community 93 - "renderOverlay"
Cohesion: 1.00
Nodes (3): boxes(), geom(), renderOverlay()

## Knowledge Gaps
- **18 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0011`, `ADR-0012`, `ADR-0017` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 616 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Produk: tujuan, batasan, alur kerja`, `icon-studio/src/main.js`, `doExport`, `esc`, `template-icon-builder/src/main.js`, `export-canva.spec.js`, `review-ops.js`, `builder-ops.js`, `render.js`, `export/index.js`, `kombinasi.js`, `Pipeline ekspor`, `offset/index.js`, `Model data`, `builder-ops.js`, `Mesin `classic` (Klasik)`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0011` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0507399577167019 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `package.json`, `shell.js`, `engines-offset.test.js`, `export-canva.spec.js`, `Langkah`, `builder-ops.js`, `engines-sticker.test.js`, `render.js`, `kombinasi.js`, `fill-shapes.test.js`, `createClassicData`, `document.js`, `icon-sources/index.js`, `offset/index.js`, `engines/index.js`, `review-ops.js`, `studio-migration.test.js`, `edit-ops.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `At` to `components.js`, `kombinasi.js`, `directFillSvgFile`, `vendor-1.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._