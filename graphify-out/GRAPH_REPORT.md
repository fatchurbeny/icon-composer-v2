# Graph Report - icon-composer-v2  (2026-10-19)

## Corpus Check
- 136 files · ~123,767 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1370 nodes · 3338 edges · 82 communities (79 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `397d51bf`
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
- tinjau.js
- C
- export/index.js
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
- engines/index.js
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
- directFillSvgFile
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
- common.js
- Produk: tujuan, batasan, alur kerja
- renderEditor
- Pengujian
- set-ops.js
- studio-edit-ops.test.js
- Mesin `sticker`
- renderLu
- icon-studio/src/main.js
- 5. L3: perencana variasi
- builder-ops.js
- engines/index.js
- renderBins
- concept

## God Nodes (most connected - your core abstractions)
1. `esc()` - 52 edges
2. `r3()` - 28 edges
3. `C()` - 27 edges
4. `get()` - 26 edges
5. `Diubah` - 26 edges
6. `createRenderer()` - 24 edges
7. `aria()` - 24 edges
8. `createShell()` - 23 edges
9. `button()` - 22 edges
10. `directFillSvgFile()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Masalah legacy yang diperbaiki` --references--> `comboItem()`  [INFERRED]
  docs/engines/sticker.md → apps/icon-studio/src/state/combo-ops.js
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

## Communities (82 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.11
Nodes (10): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Sumbu variasi (`axes`), WAJIB: memanggang dash, Glosarium (+2 more)

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
Cohesion: 0.07
Nodes (27): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+19 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "builder.js"
Cohesion: 0.11
Nodes (16): actions, ANCHORS, badgeOf(), brandId(), builder, control(), LEGEND, mutate() (+8 more)

### Community 14 - "tinjau.js"
Cohesion: 0.13
Nodes (33): checkCanvas(), filtered(), importArea(), manifestBody(), repetitionBody(), actions, builderDeps(), canvas() (+25 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "export/index.js"
Cohesion: 0.16
Nodes (18): metadataCSV(), metaOf(), styleMeta(), 2. Modul, bboxUnion(), packColors(), svgColors(), buildZip() (+10 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.13
Nodes (26): engineInfo(), actions, canvas(), control(), deps(), headIcon(), isSet(), kombinasi (+18 more)

### Community 18 - "document.js"
Cohesion: 0.15
Nodes (25): createAppState(), PERSONAS, defaultExportOptions(), DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, ANCHORS, applyFamily() (+17 more)

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
Cohesion: 0.15
Nodes (15): CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS, MOD_SYN (+7 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "compose"
Cohesion: 0.38
Nodes (10): buildZip(), download(), exportSVG(), fileNames(), included(), renderReview(), sheetHTML(), slug() (+2 more)

### Community 26 - "r3"
Cohesion: 0.08
Nodes (60): useStyle(), createRenderer(), accentCtx(), classicCtx(), mainInfo(), modPreviewAccent(), modShape(), renderManifestItem() (+52 more)

### Community 27 - "Langkah"
Cohesion: 0.17
Nodes (11): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Langkah (+3 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.09
Nodes (38): statusBar(), actions, composerSet, control(), ANCHORS, artSvg(), classicCtx(), composerEdit (+30 more)

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
Cohesion: 0.24
Nodes (20): renderSet(), setColorCount(), dupGroupsOf(), flaggedOf(), info(), itemsOf(), labelOf(), layerRows() (+12 more)

### Community 33 - "accentCtx"
Cohesion: 0.24
Nodes (11): accentCtx(), boxes(), composeAccent(), cycleRole(), decoMarkup(), geom(), luAnalyze(), mainInfo() (+3 more)

### Community 34 - "ref_node_path"
Cohesion: 0.14
Nodes (12): NAMES, out, builds, dist, root, files, outputDir, root (+4 more)

### Community 35 - "engines/index.js"
Cohesion: 0.33
Nodes (5): Penggantian nama, engines, migrateFamily(), normStyle(), register()

### Community 36 - "variantsOf"
Cohesion: 0.32
Nodes (8): createVocabulary(), collisions(), exists(), suggest(), lev(), validateManifest(), variantsOf(), libNameOf()

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
Cohesion: 0.29
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
Nodes (19): curIt(), ensureItem(), ensureLucide(), esc(), keyLabel(), legend(), loadHugeicons(), loadTabler() (+11 more)

### Community 46 - "directFillSvgFile"
Cohesion: 0.08
Nodes (34): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+26 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "compose"
Cohesion: 0.28
Nodes (9): batchItem(), blankItem(), ensureLucide(), normItem(), openLucide(), openModal(), openPack(), renderLucidePick() (+1 more)

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
Cohesion: 0.12
Nodes (19): SAMPLE_MANIFEST, LEGACY_KEYS, defaultStorage(), emptyState(), hasState(), ADR-0017, loadState(), saveState() (+11 more)

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
Cohesion: 0.15
Nodes (22): brandId(), collisions(), doExport(), dupMap(), exportList(), filtered(), finalManifest(), flagsOf() (+14 more)

### Community 59 - "review-ops.js"
Cohesion: 0.15
Nodes (26): esc(), previewSheetHTML(), SET_LICENSES, layerBoxes(), baseNameEN(), buildSetZipFiles(), DEFAULT_CANVA_META, DEFAULT_REVIEW (+18 more)

### Community 60 - "esc"
Cohesion: 0.27
Nodes (18): card(), deps(), exportBody(), exportCanvas(), iconBody(), metadataBody(), render(), selectedOf() (+10 more)

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

### Community 66 - "common.js"
Cohesion: 0.23
Nodes (13): COMPOSER_TOOLS, duplicateCount(), ENGINE_CARDS, engineCards(), helpButton(), ADR-0017, repetitionPanel(), tinjau (+5 more)

### Community 67 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 68 - "renderEditor"
Cohesion: 0.28
Nodes (15): classicCtx(), compose(), esc(), fillOf(), getXY(), lineOf(), modeOf(), nameOf() (+7 more)

### Community 69 - "Pengujian"
Cohesion: 0.33
Nodes (5): 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 70 - "set-ops.js"
Cohesion: 0.26
Nodes (14): ensureComboFields(), blankItem(), normItem(), addItem(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem(), ensureSetFields() (+6 more)

### Community 71 - "studio-edit-ops.test.js"
Cohesion: 0.22
Nodes (6): resetLayer(), setDeco(), vitest, data, item(), lib

### Community 72 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 73 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 74 - "icon-studio/src/main.js"
Cohesion: 0.25
Nodes (3): app, renderer, shell

### Community 75 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 76 - "builder-ops.js"
Cohesion: 0.14
Nodes (20): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, finalManifest(), INTERNAL_COLUMNS, LICENSES, metaOf(), MOD_POOL (+12 more)

### Community 77 - "engines/index.js"
Cohesion: 0.52
Nodes (5): accent, classic, handWriting, migrateLegacy(), offset

### Community 78 - "renderBins"
Cohesion: 0.33
Nodes (6): modPreview(), modPreviewAccent(), persist(), renderBins(), setChanged(), showView()

### Community 79 - "concept"
Cohesion: 0.50
Nodes (5): Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, rng(), signature(), concept()

## Knowledge Gaps
- **11 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0017`, `ADR-0017`, `ADR-0016` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 497 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `Design handoff: Icon Studio (UI terpadu)`, `review-ops.js`, `studio-combo-ops.test.js`, `vendor-1.js`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Diubah` (e.g. with `cuRoles()` and `decoAccent()`) actually correct?**
  _`Diubah` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0017` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `render-artboards.py`, `Produk: tujuan, batasan, alur kerja`, `template-icon-builder/src/main.js`, `icon-studio/src/main.js`, `builder-ops.js`, `tinjau.js`, `export/index.js`, `doExport`, `review-ops.js`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Why does `6. Persona Tinjau ✅ (menunggu tinjauan Ika)` connect `review-ops.js` to `directFillSvgFile`, `Langkah`, `At`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._