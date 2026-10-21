# Graph Report - fase45-integrasi-a95e9b  (2026-10-21)

## Corpus Check
- 170 files · ~195,388 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1863 nodes · 4865 edges · 89 communities (88 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 331 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c38ca87`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- golden-utils.js
- render-artboards.py
- README.md
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
- vitest
- Tech stack
- export-canva.spec.js
- icon-sources/index.js
- render
- Arsitektur
- Mesin `offset`
- flagsOf
- builder-ops.js
- composer-edit.js
- app-state.js
- At
- Design handoff: Icon Studio (UI terpadu)
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
- app-state.js
- icon-studio/package.json
- README.md
- @playwright/test
- hand-writing/index.js
- renderDetail
- vitest
- review-ops.js
- studio-undo.spec.js
- Rencana migrasi
- esc
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
- get
- n
- Mesin `accent` (Aksen bagian)
- directFillSvgFile
- runImport
- engines/index.js
- ui-language.spec.js
- renderBins
- ce
- adLoad
- ref_node_path
- sticker-parity.spec.js
- renderLu
- compose
- Produk: tujuan, batasan, alur kerja
- engines/index.js

## God Nodes (most connected - your core abstractions)
1. `esc()` - 59 edges
2. `createRenderer()` - 37 edges
3. `createAppState()` - 32 edges
4. `r3()` - 31 edges
5. `get()` - 30 edges
6. `createShell()` - 29 edges
7. `alert()` - 29 edges
8. `directFillSvgFile()` - 29 edges
9. `aria()` - 28 edges
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

## Communities (89 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (39): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+31 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.08
Nodes (17): ensureManifestItem(), 1. Kunci ikon, 3. Gaya set, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4.4 Urungkan dan ulangi (hanya di memori), 4.5 Migrasi 003 (`apps/icon-studio/src/state/migrations/003-from-hand-writing.js`), 4.6 Migrasi 004 (`apps/icon-studio/src/state/migrations/004-from-sticker.js`) (+9 more)

### Community 3 - "README.md"
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
Nodes (15): ai(), an(), $e(), ei(), Fe(), fn(), ie(), li() (+7 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "builder-ops.js"
Cohesion: 0.10
Nodes (28): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, hwItemOf(), INTERNAL_COLUMNS, LICENSE_HAND_WRITING, LICENSE_OFFSET, LICENSE_STICKER (+20 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.12
Nodes (16): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+8 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.10
Nodes (21): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+13 more)

### Community 13 - "builder.js"
Cohesion: 0.05
Nodes (87): paintSwatches(), finalManifest(), manifestHandWritingStyle(), manifestOffsetStyle(), manifestStickerItem(), manifestStickerStyle(), MODES, useStyle() (+79 more)

### Community 14 - "export/index.js"
Cohesion: 0.16
Nodes (26): engineInfo(), actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control() (+18 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (27): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+19 more)

### Community 16 - "components.js"
Cohesion: 0.11
Nodes (43): 4. Inventaris komponen, accordion(), collapse(), colorpicker(), cpBary(), cpBuild(), cpChanged(), cpClose() (+35 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.09
Nodes (41): actions, canvas(), control(), deps(), headIcon(), isSet(), kombinasi, matrixOf() (+33 more)

### Community 18 - "document.js"
Cohesion: 0.12
Nodes (27): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, applyFamily(), createManifestDocument(), ENGINE_FAMILIES (+19 more)

### Community 19 - "vitest"
Cohesion: 0.15
Nodes (15): SAMPLE_MANIFEST, defaultStorage(), emptyState(), hasState(), ADR-0017, loadState(), normColorPresets(), normSwatchSource() (+7 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "export-canva.spec.js"
Cohesion: 0.15
Nodes (7): DECO_SETS, downloadSvgs(), H, ADR-0011, KEYS, LIB_SAMPLES, VENDOR

### Community 22 - "icon-sources/index.js"
Cohesion: 0.13
Nodes (18): 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), CAT_ID, ID_EN, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS (+10 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (20): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+12 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "Mesin `offset`"
Cohesion: 0.06
Nodes (58): Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item (+50 more)

### Community 26 - "flagsOf"
Cohesion: 0.30
Nodes (12): createVocabulary(), collisions(), exists(), suggest(), dupKey(), flagsOf(), handWritingFlagsOf(), lev() (+4 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.07
Nodes (74): actions, ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), autoPanelCheck(), BLOB_NAME, boxesOf() (+66 more)

### Community 29 - "app-state.js"
Cohesion: 0.13
Nodes (15): HAND_WRITING_LEGACY_KEY, randomUid(), LEGACY_KEYS, MIGRATION_ID, OFFSET_KEY, MIGRATION_ID, MIGRATION_ID, STICKER_KEY (+7 more)

### Community 30 - "At"
Cohesion: 0.17
Nodes (16): At(), bn(), De(), dn(), ir(), mn(), nr(), on() (+8 more)

### Community 31 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.10
Nodes (20): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+12 more)

### Community 32 - "composer.js"
Cohesion: 0.09
Nodes (50): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), isFixedLayout(), isHandWriting() (+42 more)

### Community 33 - "compose"
Cohesion: 0.22
Nodes (16): baseNameEN(), buildZip(), download(), exportSVG(), fileNames(), included(), libName(), libWords() (+8 more)

### Community 34 - "engines-offset.test.js"
Cohesion: 0.17
Nodes (25): applyColors(), colorActions, currentOf(), swatchOptions(), clamp(), fromChroma(), HARMONIES, harmony() (+17 more)

### Community 35 - "doExport"
Cohesion: 0.24
Nodes (10): brandId(), doExport(), finalManifest(), meta(), packOf(), pathOf(), searchOf(), svgFile() (+2 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.17
Nodes (17): styleMeta(), styleWordOf(), styleWordOf(), 2. Modul, bboxUnion(), packColors(), svgColors(), buildZip() (+9 more)

### Community 37 - "cn"
Cohesion: 0.27
Nodes (10): cn(), Ft(), In(), jt(), Le(), _n(), pe(), Vt() (+2 more)

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
Cohesion: 0.09
Nodes (39): hash(), adapt(), axes(), COLOR_PAIRS, compose(), CURL_SIDES, decoParts(), defaultColors() (+31 more)

### Community 44 - "engines-hand-writing.test.js"
Cohesion: 0.12
Nodes (9): HAND_WRITING_DEFAULTS, ctx, KEYS, LEGACY, LEGACY_S, LUCIDE, MODS, root (+1 more)

### Community 45 - "n"
Cohesion: 0.32
Nodes (8): blankItem(), ensureLucide(), normItem(), openLucide(), openModal(), openPack(), renderLucidePick(), uid()

### Community 46 - "builder.js"
Cohesion: 0.10
Nodes (34): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+26 more)

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
Cohesion: 0.22
Nodes (17): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), handWritingComposerSource(), handWritingSetFromComposer() (+9 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "README.md"
Cohesion: 0.18
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 55 - "@playwright/test"
Cohesion: 0.08
Nodes (8): @playwright/test, VENDOR, dxy(), xy(), openPanel(), openTransform(), pickLibrary(), sticker

### Community 56 - "hand-writing/index.js"
Cohesion: 0.09
Nodes (34): Ue(), Cara kerja, Flag, Icon Studio, Knockout (`opt.mode`), Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set) (+26 more)

### Community 57 - "renderDetail"
Cohesion: 0.18
Nodes (25): collisions(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+17 more)

### Community 58 - "vitest"
Cohesion: 0.36
Nodes (5): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT

### Community 59 - "review-ops.js"
Cohesion: 0.12
Nodes (29): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZip(), buildSetZipFiles(), canvaSVG(), DEFAULT_CANVA_META (+21 more)

### Community 61 - "Rencana migrasi"
Cohesion: 0.29
Nodes (6): 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 62 - "esc"
Cohesion: 0.17
Nodes (28): metadataBody(), chips(), colorRow(), pickerExtra(), engineCards(), handWritingStyleTabs(), offsetStyleTabs(), stickerStyleTabs() (+20 more)

### Community 63 - "export-canva.spec.js"
Cohesion: 0.13
Nodes (32): parseRoute(), routeHash(), zoomLabel(), builder, helpButton(), composerSet, composerEdit, tinjau (+24 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "store.js"
Cohesion: 0.25
Nodes (3): app, renderer, shell

### Community 66 - "shell.js"
Cohesion: 0.24
Nodes (16): anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect(), fit(), paintLabels() (+8 more)

### Community 67 - "accentCtx"
Cohesion: 0.24
Nodes (11): accentCtx(), boxes(), composeAccent(), cycleRole(), decoMarkup(), geom(), luAnalyze(), mainInfo() (+3 more)

### Community 68 - "esc"
Cohesion: 0.17
Nodes (11): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Langkah (+3 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.15
Nodes (21): ensureComboFields(), blankItem(), createSetDocument(), normItem(), SET_FAMILIES, addItem(), DEFAULT_POOL, DEFAULT_VIEW (+13 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "Mesin `sticker`"
Cohesion: 0.26
Nodes (12): batchItem(), classicCtx(), esc(), fillOf(), getXY(), lineOf(), modeOf(), partThumb() (+4 more)

### Community 73 - "get"
Cohesion: 0.36
Nodes (6): flagsOf(), engines, get(), migrateFamily(), normStyle(), register()

### Community 74 - "n"
Cohesion: 0.25
Nodes (8): gt(), He(), hi(), ke(), Me(), qt(), xi(), n()

### Community 75 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.16
Nodes (6): hw, mixed, offset, H, ADR-0011, VENDOR

### Community 76 - "directFillSvgFile"
Cohesion: 0.13
Nodes (27): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`), 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP (+19 more)

### Community 77 - "runImport"
Cohesion: 0.33
Nodes (7): ensureItem(), ensureLucide(), loadHugeicons(), loadTabler(), persist(), runImport(), setKey()

### Community 78 - "engines/index.js"
Cohesion: 0.15
Nodes (13): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2: Ekstrak paket bersama ✅, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset ✅, Fase 5: Mesin sticker ✅, Fase 6: Anti-repetisi (+5 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "renderBins"
Cohesion: 0.40
Nodes (5): modPreview(), modPreviewAccent(), persist(), renderBins(), setChanged()

### Community 81 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 83 - "adLoad"
Cohesion: 0.50
Nodes (4): adLoad(), adShow(), cleanSvg(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 84 - "ref_node_path"
Cohesion: 0.07
Nodes (17): NAMES, out, builds, dist, root, files, outputDir, root (+9 more)

### Community 85 - "sticker-parity.spec.js"
Cohesion: 0.33
Nodes (6): ALL, caseOf(), CASES, H, STYLES, VENDOR

### Community 86 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 88 - "compose"
Cohesion: 0.27
Nodes (11): adRender(), clone(), compose(), nameOf(), packColors(), prefMini(), renderEditor(), renderPack() (+3 more)

### Community 89 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 90 - "engines/index.js"
Cohesion: 0.43
Nodes (6): accent, classic, handWriting, migrateLegacy(), seedOf(), offset

## Knowledge Gaps
- **18 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0011`, `ADR-0012`, `ADR-0017` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 651 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `package.json`, `shell.js`, `engines-offset.test.js`, `export-canva.spec.js`, `vitest`, `Langkah`, `builder-ops.js`, `offset/index.js`, `engines-hand-writing.test.js`, `builder.js`, `kombinasi.js`, `icon-sources/index.js`, `Mesin `offset``, `engines/index.js`, `review-ops.js`, `composer-edit.js`, `app-state.js`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0011` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0507399577167019 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Produk: tujuan, batasan, alur kerja`, `store.js`, `render-artboards.py`, `doExport`, `export-canva.spec.js`, `template-icon-builder/src/main.js`, `esc`, `review-ops.js`, `builder-ops.js`, `builder.js`, `export/index.js`, `kombinasi.js`, `Mesin `offset``, `builder-ops.js`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `createAppState()` (e.g. with `documentFor()` and `migrateFromOffset()`) actually correct?**
  _`createAppState()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._