# Graph Report - transform-affinity-2f2d46  (2026-10-20)

## Corpus Check
- 151 files · ~153,354 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1565 nodes · 3924 edges · 83 communities (80 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 259 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71c4e0bd`
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
- studio-combo-ops.test.js
- document.js
- vitest
- Tech stack
- Unreleased
- icon-sources/index.js
- render
- Arsitektur
- compose
- classic/index.js
- Diubah
- composer-edit.js
- luNames
- At
- Diubah
- composer.js
- renderEditor
- Mesin `sticker`
- createRenderer
- export-canva.spec.js
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
- core/index.js
- @playwright/test
- render.js
- renderPick
- vitest
- review-ops.js
- studio-undo.spec.js
- engines/index.js
- kombinasi.js
- Rencana migrasi
- Aturan UI untuk agen (wajib dipatuhi)
- compose
- shell.js
- accentCtx
- Mesin `accent` (Aksen bagian)
- 5. L3: perencana variasi
- set-ops.js
- doExport
- fetch-fixtures.mjs
- engines/index.js
- Oe
- esc
- directFillSvgFile
- ui-shell.spec.js
- 5. L3: perencana variasi
- ui-language.spec.js
- packColors
- ref_node_path

## God Nodes (most connected - your core abstractions)
1. `esc()` - 55 edges
2. `r3()` - 31 edges
3. `createRenderer()` - 30 edges
4. `createShell()` - 28 edges
5. `get()` - 28 edges
6. `C()` - 27 edges
7. `aria()` - 26 edges
8. `directFillSvgFile()` - 26 edges
9. `Diubah` - 26 edges
10. `createAppState()` - 23 edges

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

## Communities (83 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.06
Nodes (24): ensureManifestItem(), 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4.1 Isi `icon-studio-v1`, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4.4 Urungkan dan ulangi (hanya di memori) (+16 more)

### Community 3 - "Kontrak mesin gaya"
Cohesion: 0.25
Nodes (7): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "template-icon-builder/src/main.js"
Cohesion: 0.05
Nodes (36): ACC_OPTS, accCache, ANCHORS, CANVA_COLUMNS, closeCreatorMenu(), closeKwMenu(), closeLocaleMenu(), CU (+28 more)

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
Cohesion: 0.13
Nodes (24): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, finalManifest(), INTERNAL_COLUMNS, LICENSE_OFFSET, LICENSES, metaOf() (+16 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "builder.js"
Cohesion: 0.10
Nodes (27): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), dmOf() (+19 more)

### Community 14 - "tinjau.js"
Cohesion: 0.16
Nodes (20): builder, actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control() (+12 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.07
Nodes (35): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+27 more)

### Community 17 - "studio-combo-ops.test.js"
Cohesion: 0.25
Nodes (15): activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO, matrixMains() (+7 more)

### Community 18 - "document.js"
Cohesion: 0.12
Nodes (22): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, FILLS, ID_RE, importManifest() (+14 more)

### Community 19 - "vitest"
Cohesion: 0.13
Nodes (9): app, renderer, shell, SAMPLE_MANIFEST, createClassicData(), ctxOf(), fakeRenderer(), offsetFixture (+1 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "icon-sources/index.js"
Cohesion: 0.13
Nodes (21): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Langkah, CAT_ID, LU_CATS (+13 more)

### Community 23 - "render"
Cohesion: 0.17
Nodes (19): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+11 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "compose"
Cohesion: 0.29
Nodes (14): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), metaOf(), nameOf() (+6 more)

### Community 26 - "classic/index.js"
Cohesion: 0.24
Nodes (18): r3(), composeAccent(), decoAccent(), modAccent(), modPreviewAccent(), composeClassic(), decoMarkupClassic(), fillOfClassic() (+10 more)

### Community 27 - "Diubah"
Cohesion: 0.26
Nodes (18): Diubah, bbOf(), hostEl(), measureNode(), setMeasureHost(), splitPath(), svgParts(), analyzeLibraryIcon() (+10 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.07
Nodes (70): control(), ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), autoPanelCheck(), boxesOf(), cell() (+62 more)

### Community 29 - "luNames"
Cohesion: 0.21
Nodes (15): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+7 more)

### Community 30 - "At"
Cohesion: 0.17
Nodes (16): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+8 more)

### Community 31 - "Diubah"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 32 - "composer.js"
Cohesion: 0.12
Nodes (40): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo(), isOffset() (+32 more)

### Community 33 - "renderEditor"
Cohesion: 0.23
Nodes (14): boxes(), classicCtx(), fillOf(), geom(), getXY(), lineOf(), modeOf(), partThumb() (+6 more)

### Community 34 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 35 - "createRenderer"
Cohesion: 0.17
Nodes (18): useStyle(), createRenderer(), accentCtx(), classicCtx(), flagsOf(), mainInfo(), modPreviewAccent(), modShape() (+10 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.22
Nodes (5): DECO_SETS, downloadSvgs(), H, KEYS, VENDOR

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
Nodes (9): 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian, Icon-Composer v2, Lisensi pustaka ikon, Mulai (+1 more)

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "offset/index.js"
Cohesion: 0.07
Nodes (47): boxesOf(), Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set) (+39 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderDetail"
Cohesion: 0.17
Nodes (21): collisions(), curIt(), esc(), filtered(), flagsOf(), isBad(), keyLabel(), legend() (+13 more)

### Community 46 - "studio-migration.test.js"
Cohesion: 0.18
Nodes (13): offsetSetFromComposer(), randomUid(), ADR-0017, LEGACY_KEYS, readJson(), migrateFromOffset(), MIGRATION_ID, OFFSET_KEY (+5 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "Langkah"
Cohesion: 0.29
Nodes (6): Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Prinsip, Rencana Fase 2b: UI terpadu Icon Studio, Tes per langkah

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
Cohesion: 0.16
Nodes (20): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), createManifestDocument(), offsetComposerSource() (+12 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "core/index.js"
Cohesion: 0.50
Nodes (6): escapeAttribute(), partStr(), createLibraryShapes(), analyze(), ensure(), luLabel()

### Community 55 - "@playwright/test"
Cohesion: 0.09
Nodes (7): @playwright/test, VENDOR, dxy(), xy(), openPanel(), H, VENDOR

### Community 56 - "render.js"
Cohesion: 0.33
Nodes (3): MODES, ADR-0017, CUSTOM_ICONS

### Community 57 - "renderPick"
Cohesion: 0.24
Nodes (10): applyManStyle(), ensureItem(), ensureLucide(), importManifest(), normAcc(), persist(), runImport(), setKey() (+2 more)

### Community 58 - "vitest"
Cohesion: 0.24
Nodes (6): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT, vitest

### Community 59 - "review-ops.js"
Cohesion: 0.09
Nodes (44): esc(), previewSheetHTML(), SET_LICENSES, layerBoxes(), baseNameEN(), buildSetZipFiles(), DEFAULT_CANVA_META, DEFAULT_REVIEW (+36 more)

### Community 61 - "engines/index.js"
Cohesion: 0.12
Nodes (26): createVocabulary(), collisions(), suggest(), lev(), Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, hash(), rng() (+18 more)

### Community 62 - "kombinasi.js"
Cohesion: 0.16
Nodes (21): actions, canvas(), control(), deps(), headIcon(), isSet(), matrixOf(), mutate() (+13 more)

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "compose"
Cohesion: 0.21
Nodes (16): batchItem(), blankItem(), compose(), ensureLucide(), esc(), normItem(), openLucide(), openModal() (+8 more)

### Community 66 - "shell.js"
Cohesion: 0.09
Nodes (47): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+39 more)

### Community 67 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 68 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.29
Nodes (6): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Rotasi per ikon, Sumbu variasi (`axes`)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "set-ops.js"
Cohesion: 0.22
Nodes (18): ensureComboFields(), applyFamily(), blankItem(), createSetDocument(), normItem(), addItem(), DEFAULT_POOL, DEFAULT_VIEW (+10 more)

### Community 71 - "doExport"
Cohesion: 0.18
Nodes (17): brandId(), doExport(), dupMap(), exportList(), finalManifest(), kebab2(), packOf(), pathOf() (+9 more)

### Community 72 - "fetch-fixtures.mjs"
Cohesion: 0.40
Nodes (4): files, outputDir, root, sources

### Community 73 - "engines/index.js"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 74 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 75 - "esc"
Cohesion: 0.25
Nodes (23): deps(), exportBody(), exportCanvas(), iconBody(), manifestBody(), metadataBody(), offsetNote(), render() (+15 more)

### Community 76 - "directFillSvgFile"
Cohesion: 0.06
Nodes (41): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+33 more)

### Community 78 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "packColors"
Cohesion: 0.67
Nodes (3): packColors(), prefMini(), renderStyleUI()

### Community 84 - "ref_node_path"
Cohesion: 0.13
Nodes (9): NAMES, out, builds, dist, root, apps, root, mixed (+1 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0012`, `ADR-0017`, `ADR-0017` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 557 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `render-artboards.py`, `Mesin `accent` (Aksen bagian)`, `template-icon-builder/src/main.js`, `doExport`, `builder-ops.js`, `offset/index.js`, `tinjau.js`, `vitest`, `icon-sources/index.js`, `review-ops.js`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0012` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `At` to `components.js`, `studio-combo-ops.test.js`, `review-ops.js`, `vendor-1.js`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createShell()` (e.g. with `importText()` and `toast()`) actually correct?**
  _`createShell()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._