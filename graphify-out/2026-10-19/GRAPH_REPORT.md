# Graph Report - icon-composer-v2  (2026-10-19)

## Corpus Check
- 145 files · ~138,197 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1485 nodes · 3680 edges · 83 communities (79 shown, 4 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 242 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `629f7f83`
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
- classic/index.js
- 5. L3: perencana variasi
- Log keputusan (ADR)
- builder.js
- tinjau.js
- C
- components.js
- library-panel.js
- document.js
- accent/index.js
- Tech stack
- Unreleased
- builder-ops.js
- render
- Arsitektur
- compose
- Diubah
- vitest
- composer-edit.js
- luNames
- At
- adRender
- composer.js
- renderProps
- studio-migration.spec.js
- export-canva.spec.js
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
- export-canva.spec.js
- engines/package.json
- render.js
- core/package.json
- export/package.json
- icon-sources/package.json
- studio-state.test.js
- icon-studio/package.json
- createShell
- @playwright/test
- runImport
- doExport
- offset-parity.spec.js
- review-ops.js
- app-state.js
- core/index.js
- studio-combo-ops.test.js
- Rencana migrasi
- Aturan UI untuk agen (wajib dipatuhi)
- packColors
- shell.js
- Produk: tujuan, batasan, alur kerja
- Oe
- offset-parity.spec.js
- set-ops.js
- AGENTS.md: instruksi untuk agen (Codex)
- Mesin `sticker`
- renderLu
- metaOf
- tinjau.js
- directFillSvgFile
- createRenderer
- ui-shell.spec.js
- Pipeline ekspor
- Mesin `classic` (Klasik)
- ref_node_path
- studio-tinjau.spec.js

## God Nodes (most connected - your core abstractions)
1. `esc()` - 56 edges
2. `r3()` - 31 edges
3. `createRenderer()` - 29 edges
4. `get()` - 28 edges
5. `createShell()` - 27 edges
6. `C()` - 27 edges
7. `Diubah` - 26 edges
8. `aria()` - 25 edges
9. `directFillSvgFile()` - 23 edges
10. `alert()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `Sumbu variasi (`axes`)` --references--> `C()`  [INFERRED]
  docs/engines/hand-writing.md → apps/template-icon-builder/src/vendor-1.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js
- `Risiko` --references--> `check()`  [INFERRED]
  docs/engines/offset.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (83 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

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
Nodes (38): ACC_OPTS, accCache, bOff, bSel, copyText(), customs, DEFAULT_STYLE, FAMILY_DEFAULT (+30 more)

### Community 7 - "vendor-1.js"
Cohesion: 0.06
Nodes (17): ai(), an(), $e(), ei(), Fe(), fn(), He(), hi() (+9 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "classic/index.js"
Cohesion: 0.25
Nodes (17): r3(), composeClassic(), decoMarkupClassic(), fillOfClassic(), geomClassic(), lineOfClassic(), modeOfClassic(), createClassicData() (+9 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (18): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+10 more)

### Community 13 - "builder.js"
Cohesion: 0.11
Nodes (31): actions, ANCHORS, badgeOf(), brandId(), card(), control(), deps(), exportBody() (+23 more)

### Community 14 - "tinjau.js"
Cohesion: 0.15
Nodes (28): checkCanvas(), filtered(), iconBody(), actions, builderDeps(), canvas(), cellFlag(), cellsOf() (+20 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.07
Nodes (32): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+24 more)

### Community 17 - "library-panel.js"
Cohesion: 0.17
Nodes (17): importArea(), labelOf(), layerScale(), pageRows(), pagesPanel(), poolBody(), fillable, isFillable() (+9 more)

### Community 18 - "document.js"
Cohesion: 0.12
Nodes (21): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, FILLS, ID_RE, importManifest() (+13 more)

### Community 19 - "accent/index.js"
Cohesion: 0.24
Nodes (10): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Sumbu variasi (`axes`), composeAccent(), decoAccent(), modAccent() (+2 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "builder-ops.js"
Cohesion: 0.06
Nodes (46): BRAND_KEY, CANVA_COLUMNS, createVocabulary(), collisions(), exists(), suggest(), finalManifest(), INTERNAL_COLUMNS (+38 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (20): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+12 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "compose"
Cohesion: 0.29
Nodes (13): buildZip(), download(), esc(), exportSVG(), fileNames(), fillCats(), included(), metadataCSV() (+5 more)

### Community 26 - "Diubah"
Cohesion: 0.22
Nodes (23): Diubah, 2. Modul, partStr(), createLibraryShapes(), analyze(), ensure(), bbOf(), hostEl() (+15 more)

### Community 27 - "vitest"
Cohesion: 0.22
Nodes (6): resetLayer(), setDeco(), vitest, data, item(), lib

### Community 28 - "composer-edit.js"
Cohesion: 0.10
Nodes (43): isOffset(), renderSet(), control(), ANCHORS, artSvg(), boxesOf(), classicCtx(), colorSwatches() (+35 more)

### Community 29 - "luNames"
Cohesion: 0.21
Nodes (15): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+7 more)

### Community 30 - "At"
Cohesion: 0.17
Nodes (16): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+8 more)

### Community 31 - "adRender"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 32 - "composer.js"
Cohesion: 0.10
Nodes (42): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo(), ADR-0017 (+34 more)

### Community 33 - "renderProps"
Cohesion: 0.15
Nodes (20): accentCtx(), boxes(), classicCtx(), composeAccent(), cycleRole(), decoMarkup(), fillOf(), geom() (+12 more)

### Community 35 - "export-canva.spec.js"
Cohesion: 0.17
Nodes (10): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Sumbu variasi (`axes`), WAJIB: memanggang dash, Glosarium (+2 more)

### Community 36 - "export/index.js"
Cohesion: 0.15
Nodes (17): styleWordOf(), styleWordOf(), ADR-016 · 2026-10-18 · Header metadata.csv Composer dikutip, 5. Persona Builder ✅ (menunggu tinjauan Ika), packColors(), svgColors(), buildZip(), metadataCsv() (+9 more)

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
Cohesion: 0.29
Nodes (4): Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 42 - "lint-ui.mjs"
Cohesion: 0.12
Nodes (13): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+5 more)

### Community 43 - "offset/index.js"
Cohesion: 0.07
Nodes (51): ADR-0012, 2. Item kanonik, Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas (+43 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderDetail"
Cohesion: 0.18
Nodes (25): collisions(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+17 more)

### Community 46 - "export-canva.spec.js"
Cohesion: 0.22
Nodes (4): DECO_SETS, H, KEYS, VENDOR

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "render.js"
Cohesion: 0.32
Nodes (5): LAYER_KEYS, LAYER_RANGE, LAYERS, ADR-0017, ROLES

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.29
Nodes (6): exports, ./vendor/icon-outline, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.25
Nodes (7): exports, ./catalog, ./custom, name, private, type, version

### Community 52 - "studio-state.test.js"
Cohesion: 0.20
Nodes (9): SAMPLE_MANIFEST, defaultStorage(), emptyState(), hasState(), ADR-0017, loadState(), saveState(), STORE_KEY (+1 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "createShell"
Cohesion: 0.09
Nodes (40): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+32 more)

### Community 55 - "@playwright/test"
Cohesion: 0.08
Nodes (4): @playwright/test, apps, root, VENDOR

### Community 56 - "runImport"
Cohesion: 0.33
Nodes (7): ensureItem(), ensureLucide(), loadHugeicons(), loadTabler(), persist(), runImport(), setKey()

### Community 57 - "doExport"
Cohesion: 0.24
Nodes (10): brandId(), doExport(), finalManifest(), meta(), packOf(), pathOf(), searchOf(), svgFile() (+2 more)

### Community 58 - "offset-parity.spec.js"
Cohesion: 0.22
Nodes (3): app, renderer, shell

### Community 59 - "review-ops.js"
Cohesion: 0.15
Nodes (25): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZipFiles(), DEFAULT_CANVA_META, DEFAULT_REVIEW, exportSVG() (+17 more)

### Community 60 - "app-state.js"
Cohesion: 0.13
Nodes (23): createAppState(), PERSONAS, defaultExportOptions(), validateManifest(), applyFamily(), createManifestDocument(), offsetComposerSource(), offsetSetFromComposer() (+15 more)

### Community 61 - "core/index.js"
Cohesion: 0.10
Nodes (28): Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian, bboxUnion() (+20 more)

### Community 62 - "studio-combo-ops.test.js"
Cohesion: 0.26
Nodes (15): activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO, matrixMains() (+7 more)

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "packColors"
Cohesion: 0.18
Nodes (19): batchItem(), blankItem(), compose(), ensureLucide(), nameOf(), normItem(), packColors(), persist() (+11 more)

### Community 66 - "shell.js"
Cohesion: 0.17
Nodes (23): builder, engineCards(), helpButton(), composerSet, composerEdit, kombinasi, libraryUi, tinjau (+15 more)

### Community 67 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 68 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 69 - "offset-parity.spec.js"
Cohesion: 0.33
Nodes (5): H, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "set-ops.js"
Cohesion: 0.19
Nodes (18): ensureComboFields(), blankItem(), createSetDocument(), normItem(), SET_FAMILIES, addItem(), DEFAULT_POOL, DEFAULT_VIEW (+10 more)

### Community 71 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.20
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 72 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 73 - "renderLu"
Cohesion: 0.50
Nodes (5): loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 74 - "metaOf"
Cohesion: 0.50
Nodes (5): baseNameEN(), libName(), libWords(), metaOf(), tagsOf()

### Community 75 - "tinjau.js"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 76 - "directFillSvgFile"
Cohesion: 0.42
Nodes (11): dedupeAttrs(), cloneSingleShape(), colorKey(), directFillSvgFile(), flattenSvgMasks(), geometryArea(), geometryForColor(), geometryForShape() (+3 more)

### Community 77 - "createRenderer"
Cohesion: 0.15
Nodes (19): useStyle(), createRenderer(), accentCtx(), boxesOf(), classicCtx(), flagsOf(), mainInfo(), modPreviewAccent() (+11 more)

### Community 79 - "Pipeline ekspor"
Cohesion: 0.18
Nodes (10): 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Aturan wajib ekspor Canva (keputusan pemilik), Icon Composer, Penerapan per aplikasi (+2 more)

### Community 83 - "Mesin `classic` (Klasik)"
Cohesion: 0.40
Nodes (4): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Sumbu variasi (`axes`)

### Community 84 - "ref_node_path"
Cohesion: 0.15
Nodes (9): NAMES, out, builds, dist, root, files, outputDir, root (+1 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0012`, `ADR-0017`, `ADR-0017`, `ADR-0012`, `eslint` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 536 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `components.js`, `review-ops.js`, `studio-combo-ops.test.js`, `vendor-1.js`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0012`, `ADR-0017`, `ADR-0017` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Diubah`, `export-canva.spec.js`, `template-icon-builder/src/main.js`, `export/index.js`, `AGENTS.md: instruksi untuk agen (Codex)`, `Produk: tujuan, batasan, alur kerja`, `offset/index.js`, `builder.js`, `tinjau.js`, `Pipeline ekspor`, `builder-ops.js`, `doExport`, `offset-parity.spec.js`, `review-ops.js`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createShell()` (e.g. with `importText()` and `toast()`) actually correct?**
  _`createShell()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._