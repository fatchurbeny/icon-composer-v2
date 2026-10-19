# Graph Report - icon-composer-v2  (2026-10-19)

## Corpus Check
- 136 files · ~123,767 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1373 nodes · 3337 edges · 80 communities (77 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76f52ee0`
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
- Design handoff: Icon Studio (UI terpadu)
- 5. L3: perencana variasi
- Log keputusan (ADR)
- builder.js
- app-state.js
- C
- components.js
- kombinasi.js
- document.js
- Model data
- Tech stack
- Unreleased
- export/index.js
- render
- Arsitektur
- compose
- r3
- Langkah
- composer-edit.js
- luNames
- At
- adRender
- composer.js
- accentCtx
- ref_node_path
- Mesin `hand-writing` (dulu "Coret")
- variantsOf
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- README.md
- lint-ui.mjs
- offset/index.js
- ce
- renderDetail
- builder-ops.js
- engines/package.json
- compose
- core/package.json
- export/package.json
- icon-sources/package.json
- studio-state.test.js
- icon-studio/package.json
- createShell
- @playwright/test
- Mesin `offset`
- doExport
- ui-shell.spec.js
- review-ops.js
- esc
- core/index.js
- studio-combo-ops.test.js
- Rencana migrasi
- Aturan UI untuk agen (wajib dipatuhi)
- packColors
- shell.js
- Produk: tujuan, batasan, alur kerja
- renderEditor
- Pengujian
- set-ops.js
- AGENTS.md: instruksi untuk agen (Codex)
- Mesin `sticker`
- renderLu
- 3. Anatomi layar
- runImport
- icon-sources/library.js
- engines/index.js

## God Nodes (most connected - your core abstractions)
1. `esc()` - 52 edges
2. `r3()` - 28 edges
3. `C()` - 27 edges
4. `Diubah` - 26 edges
5. `get()` - 26 edges
6. `createRenderer()` - 24 edges
7. `aria()` - 24 edges
8. `createShell()` - 23 edges
9. `button()` - 22 edges
10. `directFillSvgFile()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Status sel matriks` --references--> `on()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → apps/template-icon-builder/src/vendor-1.js
- `Filter Bentuk (ADR-015)` --references--> `closed()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → packages/engines/offset/index.js
- `Sumbu variasi (`axes`)` --references--> `C()`  [INFERRED]
  docs/engines/hand-writing.md → apps/template-icon-builder/src/vendor-1.js
- `2. Aturan keras` --references--> `directFillSvgFile()`  [INFERRED]
  AGENTS.md → packages/export/pipeline.js
- `2. Batasan yang memandu semua keputusan` --references--> `directFillSvgFile()`  [INFERRED]
  docs/PRODUCT.md → packages/export/pipeline.js

## Import Cycles
- None detected.

## Communities (80 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.17
Nodes (4): Parameter per item, Glosarium, main(), blob()

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

### Community 10 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.17
Nodes (11): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib), 9. Kriteria terima UI (+3 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.12
Nodes (16): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+8 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (18): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+10 more)

### Community 13 - "builder.js"
Cohesion: 0.12
Nodes (34): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+26 more)

### Community 14 - "app-state.js"
Cohesion: 0.22
Nodes (14): createAppState(), PERSONAS, defaultExportOptions(), validateManifest(), createManifestDocument(), ensureReviewFields(), defaultStorage(), emptyState() (+6 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.27
Nodes (7): 4. Inventaris komponen, collapse(), press(), select(), single(), slider(), tabs()

### Community 17 - "kombinasi.js"
Cohesion: 0.14
Nodes (24): actions, canvas(), control(), deps(), headIcon(), isSet(), matrixOf(), mutate() (+16 more)

### Community 18 - "document.js"
Cohesion: 0.15
Nodes (22): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, ANCHORS, applyFamily(), createSetDocument(), FILLS, ID_RE (+14 more)

### Community 19 - "Model data"
Cohesion: 0.20
Nodes (9): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4.1 Isi `icon-studio-v1`, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4. localStorage, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama (+1 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "export/index.js"
Cohesion: 0.14
Nodes (16): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Langkah, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS (+8 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (20): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+12 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "compose"
Cohesion: 0.29
Nodes (14): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), metaOf(), nameOf() (+6 more)

### Community 26 - "r3"
Cohesion: 0.08
Nodes (63): useStyle(), createRenderer(), accentCtx(), classicCtx(), mainInfo(), modPreviewAccent(), modShape(), renderManifestItem() (+55 more)

### Community 27 - "Langkah"
Cohesion: 0.29
Nodes (6): Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Prinsip, Rencana Fase 2b: UI terpadu Icon Studio, Tes per langkah

### Community 28 - "composer-edit.js"
Cohesion: 0.08
Nodes (40): actions, control(), ANCHORS, artSvg(), classicCtx(), editActions, editControl(), fillOf() (+32 more)

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
Cohesion: 0.17
Nodes (25): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, engineInfo(), ADR-0017, renderSet(), repetitionPanel() (+17 more)

### Community 33 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 34 - "ref_node_path"
Cohesion: 0.14
Nodes (12): NAMES, out, builds, dist, root, files, outputDir, root (+4 more)

### Community 35 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.15
Nodes (11): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash, engines (+3 more)

### Community 36 - "variantsOf"
Cohesion: 0.21
Nodes (12): createVocabulary(), collisions(), exists(), suggest(), lev(), Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, rng() (+4 more)

### Community 37 - "cn"
Cohesion: 0.21
Nodes (12): cn(), Ft(), In(), jt(), Le(), _n(), pe(), R() (+4 more)

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

### Community 43 - "offset/index.js"
Cohesion: 0.29
Nodes (8): adapt(), closed(), compose(), EMPTY(), flags(), KEEP, normStyle(), partString()

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderDetail"
Cohesion: 0.18
Nodes (25): collisions(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+17 more)

### Community 46 - "builder-ops.js"
Cohesion: 0.05
Nodes (59): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, finalManifest(), INTERNAL_COLUMNS, LICENSES, metaOf(), MOD_POOL (+51 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "compose"
Cohesion: 0.21
Nodes (16): batchItem(), blankItem(), compose(), ensureLucide(), esc(), normItem(), openLucide(), openModal() (+8 more)

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
Cohesion: 0.09
Nodes (14): app, renderer, shell, SAMPLE_MANIFEST, LEGACY_KEYS, createClassicData(), vitest, ctxOf() (+6 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "createShell"
Cohesion: 0.13
Nodes (32): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+24 more)

### Community 55 - "@playwright/test"
Cohesion: 0.12
Nodes (4): @playwright/test, VENDOR, H, VENDOR

### Community 56 - "Mesin `offset`"
Cohesion: 0.22
Nodes (8): Z(), Cara kerja, Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`)

### Community 57 - "doExport"
Cohesion: 0.24
Nodes (10): brandId(), doExport(), finalManifest(), meta(), packOf(), pathOf(), searchOf(), svgFile() (+2 more)

### Community 59 - "review-ops.js"
Cohesion: 0.09
Nodes (47): actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control(), directCache (+39 more)

### Community 60 - "esc"
Cohesion: 0.31
Nodes (17): engineCards(), colorSwatches(), layerList(), transformBody(), engineCards(), stylePanel(), metaBody(), toolrail() (+9 more)

### Community 61 - "core/index.js"
Cohesion: 0.28
Nodes (10): hash(), adapt(), ANCHORS, attrs(), bakeDash(), compose(), EMPTY(), esc() (+2 more)

### Community 62 - "studio-combo-ops.test.js"
Cohesion: 0.24
Nodes (14): activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO, setSkip() (+6 more)

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio (selesai, menunggu persetujuan akhir), Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "packColors"
Cohesion: 0.67
Nodes (3): packColors(), prefMini(), renderStyleUI()

### Community 66 - "shell.js"
Cohesion: 0.25
Nodes (7): builder, composerSet, composerEdit, kombinasi, tinjau, PERSONA_NAV, PERSONA_SPECS

### Community 67 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 68 - "renderEditor"
Cohesion: 0.23
Nodes (14): boxes(), classicCtx(), fillOf(), geom(), getXY(), lineOf(), modeOf(), partThumb() (+6 more)

### Community 69 - "Pengujian"
Cohesion: 0.33
Nodes (5): 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 70 - "set-ops.js"
Cohesion: 0.26
Nodes (14): ensureComboFields(), blankItem(), normItem(), addItem(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem(), ensureSetFields() (+6 more)

### Community 71 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 72 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 73 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 74 - "3. Anatomi layar"
Cohesion: 0.22
Nodes (9): 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka, 3. Anatomi layar, Filter Bentuk (ADR-015) (+1 more)

### Community 75 - "runImport"
Cohesion: 0.33
Nodes (7): ensureItem(), ensureLucide(), loadHugeicons(), loadTabler(), persist(), runImport(), setKey()

### Community 76 - "icon-sources/library.js"
Cohesion: 0.48
Nodes (4): CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS

### Community 77 - "engines/index.js"
Cohesion: 0.52
Nodes (5): accent, classic, handWriting, migrateLegacy(), offset

## Knowledge Gaps
- **11 isolated node(s):** `eslint`, `lucide-static`, `prettier`, `ADR-0016`, `ADR-0017` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 500 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `3. Anatomi layar`, `review-ops.js`, `studio-combo-ops.test.js`, `vendor-1.js`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Diubah` (e.g. with `cuRoles()` and `decoAccent()`) actually correct?**
  _`Diubah` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslint`, `lucide-static`, `prettier` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `builder-ops.js` to `render-artboards.py`, `Produk: tujuan, batasan, alur kerja`, `template-icon-builder/src/main.js`, `AGENTS.md: instruksi untuk agen (Codex)`, `studio-state.test.js`, `doExport`, `r3`, `review-ops.js`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Why does `6. Persona Tinjau ✅ (menunggu tinjauan Ika)` connect `review-ops.js` to `builder-ops.js`, `At`, `export/index.js`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._