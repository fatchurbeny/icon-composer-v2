# Graph Report - fase-5-sticker-612d7e  (2026-10-20)

## Corpus Check
- 164 files · ~178,820 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1773 nodes · 4560 edges · 89 communities (87 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 292 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `717addf8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- golden-utils.js
- Model data
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
- offset/index.js
- classic/index.js
- builder-ops.js
- composer-edit.js
- app-state.js
- At
- render.js
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
- compose
- studio-migration.test.js
- engines/package.json
- shell.js
- core/package.json
- export/package.json
- icon-sources/package.json
- studio-migration.test.js
- icon-studio/package.json
- on
- @playwright/test
- engines/index.js
- renderDetail
- vitest
- review-ops.js
- studio-undo.spec.js
- concept
- kombinasi.js
- shell.js
- Aturan UI untuk agen (wajib dipatuhi)
- 5. L3: perencana variasi
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
- Mesin `accent` (Aksen bagian)
- fill-shapes.test.js
- adRender
- ref_node_path
- sticker-parity.spec.js
- renderLu
- stickerParams
- packColors

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

## Communities (89 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (39): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+31 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "Model data"
Cohesion: 0.08
Nodes (17): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data, Cara kerja, Masalah legacy yang diperbaiki (+9 more)

### Community 3 - "Kontrak mesin gaya"
Cohesion: 0.25
Nodes (7): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "template-icon-builder/src/main.js"
Cohesion: 0.05
Nodes (44): ACC_OPTS, accCache, ANCHORS, applyManStyle(), CANVA_COLUMNS, closeCreatorMenu(), closeKwMenu(), closeLocaleMenu() (+36 more)

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
Cohesion: 0.10
Nodes (25): BRAND_KEY, CANVA_COLUMNS, createVocabulary(), collisions(), exists(), suggest(), INTERNAL_COLUMNS, lev() (+17 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "builder.js"
Cohesion: 0.21
Nodes (21): paintSwatches(), layerPaints(), r3(), composeAccent(), decoAccent(), modAccent(), modPreviewAccent(), composeClassic() (+13 more)

### Community 14 - "export/index.js"
Cohesion: 0.14
Nodes (22): actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control(), directCache (+14 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.07
Nodes (54): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 4. Inventaris komponen, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib) (+46 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.11
Nodes (29): poolBody(), activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO (+21 more)

### Community 18 - "document.js"
Cohesion: 0.11
Nodes (27): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, applyFamily(), createManifestDocument(), ENGINE_PARAMS (+19 more)

### Community 19 - "studio-state.test.js"
Cohesion: 0.10
Nodes (13): app, renderer, shell, SAMPLE_MANIFEST, PRESET, STORE_KEY, createClassicData(), vitest (+5 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "geometry.js"
Cohesion: 0.33
Nodes (5): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan (desain), Unreleased

### Community 22 - "icon-sources/index.js"
Cohesion: 0.16
Nodes (15): CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS, MOD_SYN (+7 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (21): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+13 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "offset/index.js"
Cohesion: 0.05
Nodes (60): Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item (+52 more)

### Community 26 - "classic/index.js"
Cohesion: 0.19
Nodes (24): Diubah, 2. Modul, bboxUnion(), escapeAttribute(), partStr(), createLibraryShapes(), analyze(), ensure() (+16 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.08
Nodes (63): actions, control(), ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), boxesOf(), cell() (+55 more)

### Community 29 - "app-state.js"
Cohesion: 0.19
Nodes (20): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), createSetDocument(), normSetStyle() (+12 more)

### Community 30 - "At"
Cohesion: 0.20
Nodes (14): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+6 more)

### Community 31 - "render.js"
Cohesion: 0.18
Nodes (23): finalManifest(), manifestOffsetStyle(), manifestStickerItem(), manifestStickerStyle(), useStyle(), layerBoxes(), createRenderer(), accentCtx() (+15 more)

### Community 32 - "composer.js"
Cohesion: 0.14
Nodes (56): iconBody(), manifestBody(), colorRow(), engineFlags(), isOffset(), isSticker(), renderSet(), setColorCount() (+48 more)

### Community 33 - "renderReview"
Cohesion: 0.29
Nodes (14): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), metaOf(), nameOf() (+6 more)

### Community 34 - "engines-offset.test.js"
Cohesion: 0.15
Nodes (27): applyColors(), chips(), currentOf(), pickerExtra(), swatchOptions(), clamp(), fromChroma(), HARMONIES (+19 more)

### Community 35 - "doExport"
Cohesion: 0.18
Nodes (17): ensureManifestItem(), brandId(), doExport(), exportList(), finalManifest(), kebab2(), meta(), packOf() (+9 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.23
Nodes (11): packColors(), svgColors(), buildZip(), STYLE_WORDS, createTagIndex(), EN_ID, SMALL, STOP (+3 more)

### Community 37 - "cn"
Cohesion: 0.19
Nodes (13): cn(), Ft(), In(), jt(), Le(), _n(), pe(), R() (+5 more)

### Community 38 - "jn"
Cohesion: 0.13
Nodes (15): ae(), En(), gn(), Ht(), jn(), kn(), Nt(), Oe() (+7 more)

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

### Community 43 - "sticker/index.js"
Cohesion: 0.13
Nodes (23): compose(), CURL_SIDES, decoParts(), emptySvg(), KEEP, layerParts(), layerT(), normStyle() (+15 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "compose"
Cohesion: 0.21
Nodes (16): batchItem(), blankItem(), compose(), ensureLucide(), esc(), normItem(), openLucide(), openModal() (+8 more)

### Community 46 - "studio-migration.test.js"
Cohesion: 0.07
Nodes (50): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+42 more)

### Community 47 - "engines/package.json"
Cohesion: 0.17
Nodes (11): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, ./sticker, name (+3 more)

### Community 48 - "shell.js"
Cohesion: 0.20
Nodes (16): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+8 more)

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.29
Nodes (6): exports, ./vendor/icon-outline, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.22
Nodes (8): exports, ./catalog, ./custom, ./fill-shapes, name, private, type, version

### Community 52 - "studio-migration.test.js"
Cohesion: 0.15
Nodes (17): LEGACY_KEYS, STICKER_KEY, defaultStorage(), emptyState(), hasState(), ADR-0017, loadState(), normColorPresets() (+9 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "on"
Cohesion: 0.17
Nodes (12): on(), Qn(), 1. Cakupan (keputusan pemilik), 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+4 more)

### Community 55 - "@playwright/test"
Cohesion: 0.10
Nodes (12): DECO_SETS, downloadSvgs(), H, ADR-0011, KEYS, VENDOR, dxy(), xy() (+4 more)

### Community 56 - "engines/index.js"
Cohesion: 0.22
Nodes (10): Penggantian nama, accent, classic, handWriting, migrateLegacy(), offset, engines, migrateFamily() (+2 more)

### Community 57 - "renderDetail"
Cohesion: 0.18
Nodes (23): collisions(), curIt(), dupMap(), esc(), filtered(), flagsOf(), isBad(), keyLabel() (+15 more)

### Community 58 - "vitest"
Cohesion: 0.36
Nodes (5): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT

### Community 59 - "review-ops.js"
Cohesion: 0.12
Nodes (30): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZip(), buildSetZipFiles(), canvaSVG(), DEFAULT_CANVA_META (+22 more)

### Community 61 - "concept"
Cohesion: 0.18
Nodes (11): Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian, rng() (+3 more)

### Community 62 - "kombinasi.js"
Cohesion: 0.10
Nodes (32): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineInfo(), ADR-0017, NO_MOD_TEXT (+24 more)

### Community 63 - "shell.js"
Cohesion: 0.18
Nodes (14): builder, colorActions, composerSet, composerEdit, kombinasi, tinjau, toolrail(), PERSONA_NAV (+6 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 66 - "shell.js"
Cohesion: 0.12
Nodes (34): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+26 more)

### Community 67 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 68 - "esc"
Cohesion: 0.14
Nodes (13): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Langkah (+5 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.18
Nodes (18): ensureComboFields(), blankItem(), normItem(), SET_FAMILIES, addItem(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem() (+10 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "renderEditor"
Cohesion: 0.23
Nodes (14): boxes(), classicCtx(), fillOf(), geom(), getXY(), lineOf(), modeOf(), partThumb() (+6 more)

### Community 74 - "hand-writing/index.js"
Cohesion: 0.30
Nodes (9): adapt(), ANCHORS, attrs(), bakeDash(), compose(), EMPTY(), esc(), normStyle() (+1 more)

### Community 75 - "Mesin `sticker`"
Cohesion: 0.33
Nodes (3): H, ADR-0011, VENDOR

### Community 76 - "directFillSvgFile"
Cohesion: 0.09
Nodes (32): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`), 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP (+24 more)

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
Cohesion: 0.31
Nodes (10): hash(), adapt(), axes(), defaultColors(), flags(), hasMod(), num(), signature() (+2 more)

### Community 81 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.25
Nodes (8): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Rotasi per ikon, Sumbu variasi (`axes`), autoRoles(), touchBB()

### Community 82 - "fill-shapes.test.js"
Cohesion: 0.32
Nodes (4): FILL_SHAPE_VERSIONS, fillShapeOf(), dataFile, root

### Community 83 - "adRender"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 84 - "ref_node_path"
Cohesion: 0.10
Nodes (15): NAMES, out, builds, dist, root, files, outputDir, root (+7 more)

### Community 85 - "sticker-parity.spec.js"
Cohesion: 0.33
Nodes (6): ALL, caseOf(), CASES, H, STYLES, VENDOR

### Community 86 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 87 - "stickerParams"
Cohesion: 0.33
Nodes (6): 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4.5 Migrasi 004 (`apps/icon-studio/src/state/migrations/004-from-sticker.js`), 4. localStorage, hex(), stickerParams()

### Community 88 - "packColors"
Cohesion: 0.67
Nodes (3): packColors(), prefMini(), renderStyleUI()

## Knowledge Gaps
- **18 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0011`, `ADR-0012`, `ADR-0017` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 617 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Model data`, `doExport`, `export-canva.spec.js`, `template-icon-builder/src/main.js`, `review-ops.js`, `builder-ops.js`, `studio-migration.test.js`, `export/index.js`, `Mesin `accent` (Aksen bagian)`, `kombinasi.js`, `studio-state.test.js`, `offset/index.js`, `classic/index.js`, `builder-ops.js`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0011` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0507399577167019 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `studio-state.test.js` to `package.json`, `shell.js`, `engines-offset.test.js`, `export-canva.spec.js`, `Langkah`, `engines-sticker.test.js`, `builder.js`, `studio-migration.test.js`, `kombinasi.js`, `fill-shapes.test.js`, `studio-migration.test.js`, `icon-sources/index.js`, `engines/index.js`, `offset/index.js`, `vitest`, `review-ops.js`, `composer-edit.js`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `on` to `kombinasi.js`, `review-ops.js`, `vendor-1.js`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._