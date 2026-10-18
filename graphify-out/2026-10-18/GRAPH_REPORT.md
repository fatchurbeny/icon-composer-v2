# Graph Report - icon-composer-v2  (2026-10-18)

## Corpus Check
- 126 files · ~115,421 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1303 nodes · 3097 edges · 63 communities (62 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 205 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72bdecdd`
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
- libNameOf
- C
- runImport
- Mesin `sticker`
- document.js
- Model data
- Tech stack
- Unreleased
- export/index.js
- render
- Arsitektur
- compose
- r3
- library-panel.js
- composer-edit.js
- luNames
- At
- adRender
- composer.js
- accentCtx
- ref_node_path
- esc
- Oe
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- README.md
- lint-ui.mjs
- Aturan UI untuk agen (wajib dipatuhi)
- ce
- renderDetail
- directFillSvgFile
- engines/package.json
- normItem
- core/package.json
- export/package.json
- icon-sources/package.json
- icon-studio/package.json
- @playwright/test
- doExport
- ui-shell.spec.js
- tinjau.js
- hand-writing/index.js
- renderOverlay
- Rencana migrasi
- jt
- compose
- renderLu

## God Nodes (most connected - your core abstractions)
1. `esc()` - 48 edges
2. `r3()` - 28 edges
3. `C()` - 27 edges
4. `Diubah` - 26 edges
5. `createRenderer()` - 24 edges
6. `aria()` - 24 edges
7. `button()` - 21 edges
8. `2. Modul` - 21 edges
9. `get()` - 20 edges
10. `directFillSvgFile()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `ADR-016 · 2026-10-18 · Header metadata.csv Composer dikutip` --references--> `metadataCsv()`  [INFERRED]
  docs/DECISIONS.md → packages/export/index.js
- `Sumbu variasi (`axes`)` --references--> `C()`  [INFERRED]
  docs/engines/hand-writing.md → apps/template-icon-builder/src/vendor-1.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (63 total, 1 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): ADR-0017, fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins() (+9 more)

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

### Community 10 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.07
Nodes (27): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+19 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.12
Nodes (16): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+8 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "builder.js"
Cohesion: 0.07
Nodes (58): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+50 more)

### Community 14 - "libNameOf"
Cohesion: 0.33
Nodes (7): baseNameEN(), libName(), libWords(), metaOf(), styleMeta(), tagsOf(), libNameOf()

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "runImport"
Cohesion: 0.33
Nodes (7): ensureItem(), ensureLucide(), loadHugeicons(), loadTabler(), persist(), runImport(), setKey()

### Community 17 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 18 - "document.js"
Cohesion: 0.06
Nodes (55): createAppState(), PERSONAS, app, renderer, shell, defaultExportOptions(), SAMPLE_MANIFEST, DEFAULT_SET_STYLE (+47 more)

### Community 19 - "Model data"
Cohesion: 0.25
Nodes (7): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4. localStorage, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.33
Nodes (5): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "export/index.js"
Cohesion: 0.06
Nodes (43): styleWordOf(), 2. Modul, 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan, Di luar cakupan Fase 2b (+35 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (20): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+12 more)

### Community 24 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 25 - "compose"
Cohesion: 0.39
Nodes (9): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), sheetHTML(), slug() (+1 more)

### Community 26 - "r3"
Cohesion: 0.08
Nodes (61): useStyle(), createRenderer(), accentCtx(), classicCtx(), mainInfo(), modPreviewAccent(), modShape(), renderManifestItem() (+53 more)

### Community 27 - "library-panel.js"
Cohesion: 0.18
Nodes (16): pageRows(), pagesPanel(), poolBody(), fillable, isFillable(), libraryAction(), libraryBody(), libraryResults() (+8 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.10
Nodes (38): actions, control(), ANCHORS, artSvg(), classicCtx(), editActions, editControl(), fillOf() (+30 more)

### Community 29 - "luNames"
Cohesion: 0.21
Nodes (15): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+7 more)

### Community 30 - "At"
Cohesion: 0.15
Nodes (17): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+9 more)

### Community 31 - "adRender"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 32 - "composer.js"
Cohesion: 0.12
Nodes (35): builder, COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, engineCards(), engineInfo(), helpButton() (+27 more)

### Community 33 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 34 - "ref_node_path"
Cohesion: 0.14
Nodes (11): NAMES, out, builds, dist, root, files, outputDir, root (+3 more)

### Community 35 - "esc"
Cohesion: 0.22
Nodes (22): parseRoute(), routeHash(), iconBody(), colorSwatches(), layerList(), layerOf(), transformBody(), layerRows() (+14 more)

### Community 36 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 37 - "cn"
Cohesion: 0.36
Nodes (8): cn(), Ft(), In(), Le(), _n(), Vt(), xn(), Zt()

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

### Community 43 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderDetail"
Cohesion: 0.18
Nodes (25): collisions(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+17 more)

### Community 46 - "directFillSvgFile"
Cohesion: 0.06
Nodes (40): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+32 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "normItem"
Cohesion: 0.32
Nodes (8): blankItem(), ensureLucide(), normItem(), openLucide(), openModal(), openPack(), renderLucidePick(), uid()

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.29
Nodes (6): exports, ./vendor/icon-outline, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.25
Nodes (7): exports, ./catalog, ./custom, name, private, type, version

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 55 - "@playwright/test"
Cohesion: 0.12
Nodes (4): @playwright/test, VENDOR, H, VENDOR

### Community 57 - "doExport"
Cohesion: 0.24
Nodes (10): brandId(), doExport(), finalManifest(), meta(), packOf(), pathOf(), searchOf(), svgFile() (+2 more)

### Community 59 - "tinjau.js"
Cohesion: 0.08
Nodes (48): labelOf(), actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control() (+40 more)

### Community 61 - "hand-writing/index.js"
Cohesion: 0.06
Nodes (45): Penggantian nama, Flag khusus, Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`) (+37 more)

### Community 62 - "renderOverlay"
Cohesion: 1.00
Nodes (3): boxes(), geom(), renderOverlay()

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "jt"
Cohesion: 0.33
Nodes (6): jt(), pe(), R(), Ue(), Z(), Cara kerja

### Community 68 - "compose"
Cohesion: 0.17
Nodes (25): batchItem(), classicCtx(), compose(), esc(), fillOf(), getXY(), lineOf(), modeOf() (+17 more)

### Community 73 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

## Knowledge Gaps
- **10 isolated node(s):** `ADR-0016`, `ADR-0017`, `eslint`, `lucide-static`, `prettier` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 485 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `Design handoff: Icon Studio (UI terpadu)`, `tinjau.js`, `vendor-1.js`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Diubah` (e.g. with `cuRoles()` and `decoAccent()`) actually correct?**
  _`Diubah` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0016`, `ADR-0017`, `eslint` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `6. Persona Tinjau ✅ (menunggu tinjauan Ika)` connect `tinjau.js` to `directFillSvgFile`, `At`, `export/index.js`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `createRenderer()` (e.g. with `dropMissing()` and `ensureManifestItem()`) actually correct?**
  _`createRenderer()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._