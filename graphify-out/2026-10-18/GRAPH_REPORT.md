# Graph Report - icon-composer-v2  (2026-10-18)

## Corpus Check
- 122 files · ~110,786 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1261 nodes · 2861 edges · 84 communities (81 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 199 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `95c90a98`
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
- 2. Modul
- C
- Mesin `hand-writing` (dulu "Coret")
- Mesin `sticker`
- app-state.js
- Model data
- Tech stack
- Unreleased
- icon-sources/index.js
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
- shell.js
- esc
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
- Pengujian
- icon-studio/package.json
- offset/index.js
- @playwright/test
- builder-ops.js
- doExport
- Produk: tujuan, batasan, alur kerja
- set-ops.js
- Langkah
- hand-writing/index.js
- ref_node_fs
- Rencana migrasi
- Mesin `offset`
- Oe
- jt
- studio-golden.spec.js
- compose
- AGENTS.md: instruksi untuk agen (Codex)
- libNameOf
- Pipeline ekspor
- engines/index.js
- renderLu
- Mesin `classic` (Klasik)
- packColors
- icon-studio/src/main.js
- document.js
- render.js
- createRenderer
- components.js
- 3. Anatomi layar
- registry.js
- concept

## God Nodes (most connected - your core abstractions)
1. `esc()` - 42 edges
2. `r3()` - 28 edges
3. `Diubah` - 27 edges
4. `C()` - 27 edges
5. `aria()` - 22 edges
6. `2. Modul` - 21 edges
7. `createShell()` - 19 edges
8. `partStr()` - 19 edges
9. `Log keputusan (ADR)` - 19 edges
10. `directFillSvgFile()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `6. Persona Tinjau` --references--> `directFillSvgFile()`  [INFERRED]
  docs/plans/fase-2b.md → packages/export/pipeline.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js
- `Risiko` --references--> `check()`  [INFERRED]
  docs/engines/offset.md → apps/icon-studio/src/ui.js
- `ADR-016 · 2026-10-18 · Header metadata.csv Composer dikutip` --references--> `metadataCsv()`  [INFERRED]
  docs/DECISIONS.md → packages/export/index.js

## Import Cycles
- None detected.

## Communities (84 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.19
Nodes (15): ADR-0016, fixture, mixed, fixture, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+7 more)

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
Cohesion: 0.17
Nodes (11): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib), 9. Kriteria terima UI (+3 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.12
Nodes (16): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+8 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "builder.js"
Cohesion: 0.13
Nodes (30): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+22 more)

### Community 14 - "2. Modul"
Cohesion: 0.20
Nodes (15): 2. Modul, bboxUnion(), packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS, styleWord() (+7 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.18
Nodes (9): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Sumbu variasi (`axes`), WAJIB: memanggang dash, Glosarium (+1 more)

### Community 17 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 18 - "app-state.js"
Cohesion: 0.19
Nodes (16): createAppState(), PERSONAS, defaultExportOptions(), createManifestDocument(), createSetDocument(), normSetStyle(), PRESET, ensureSetFields() (+8 more)

### Community 19 - "Model data"
Cohesion: 0.25
Nodes (7): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4. localStorage, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.33
Nodes (5): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "icon-sources/index.js"
Cohesion: 0.13
Nodes (19): 1. Fondasi state + golden render Icon Studio ✅, 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS (+11 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 25 - "compose"
Cohesion: 0.38
Nodes (10): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), renderReview(), sheetHTML() (+2 more)

### Community 26 - "r3"
Cohesion: 0.09
Nodes (50): Diubah, Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Sumbu variasi (`axes`), escapeAttribute(), partStr() (+42 more)

### Community 27 - "library-panel.js"
Cohesion: 0.24
Nodes (9): fillable, isFillable(), libraryAction(), libraryResults(), libraryUi, LICENSE_NOTE, namesOf(), SOURCE_LABEL (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.11
Nodes (36): ANCHORS, artSvg(), classicCtx(), colorSwatches(), editActions, editControl(), fillOf(), hitLayer() (+28 more)

### Community 29 - "luNames"
Cohesion: 0.21
Nodes (15): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+7 more)

### Community 30 - "At"
Cohesion: 0.15
Nodes (17): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+9 more)

### Community 31 - "adRender"
Cohesion: 0.33
Nodes (6): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent()

### Community 32 - "composer.js"
Cohesion: 0.16
Nodes (23): COMPOSER_TOOLS, duplicateCount(), ENGINE_CARDS, engineCards(), engineInfo(), ADR-0017, repetitionPanel(), setColorCount() (+15 more)

### Community 33 - "accentCtx"
Cohesion: 0.21
Nodes (12): accentCtx(), boxes(), composeAccent(), cycleRole(), decoMarkup(), geom(), luAnalyze(), mainInfo() (+4 more)

### Community 34 - "ref_node_path"
Cohesion: 0.18
Nodes (6): builds, dist, root, apps, root, VENDOR

### Community 35 - "shell.js"
Cohesion: 0.19
Nodes (22): parseRoute(), routeHash(), builder, helpButton(), composerSet, composerEdit, kombinasi, createShell() (+14 more)

### Community 36 - "esc"
Cohesion: 0.19
Nodes (24): importArea(), docFileName(), renderSet(), statusBar(), layerList(), engineCards(), layerRows(), layerScale() (+16 more)

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
Cohesion: 0.25
Nodes (4): Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 42 - "lint-ui.mjs"
Cohesion: 0.14
Nodes (12): COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED, problems, ROOT (+4 more)

### Community 43 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "renderDetail"
Cohesion: 0.18
Nodes (19): curIt(), ensureItem(), ensureLucide(), esc(), keyLabel(), legend(), loadHugeicons(), loadTabler() (+11 more)

### Community 46 - "directFillSvgFile"
Cohesion: 0.30
Nodes (14): 1. Tahapan, Aturan wajib ekspor Canva (keputusan pemilik), Penerapan per aplikasi, dedupeAttrs(), cloneSingleShape(), colorKey(), directFillSvgFile(), flattenSvgMasks() (+6 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "normItem"
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

### Community 52 - "Pengujian"
Cohesion: 0.33
Nodes (5): 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "offset/index.js"
Cohesion: 0.29
Nodes (8): adapt(), closed(), compose(), EMPTY(), flags(), KEEP, normStyle(), partString()

### Community 55 - "@playwright/test"
Cohesion: 0.16
Nodes (3): @playwright/test, offline(), open()

### Community 56 - "builder-ops.js"
Cohesion: 0.10
Nodes (27): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, createVocabulary(), collisions(), exists(), suggest(), finalManifest() (+19 more)

### Community 57 - "doExport"
Cohesion: 0.15
Nodes (22): brandId(), collisions(), doExport(), dupMap(), exportList(), filtered(), finalManifest(), flagsOf() (+14 more)

### Community 58 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 59 - "set-ops.js"
Cohesion: 0.19
Nodes (18): applyFamily(), blankItem(), normItem(), addItem(), clearLayer(), DEFAULT_POOL, DEFAULT_VIEW, duplicateGroups() (+10 more)

### Community 60 - "Langkah"
Cohesion: 0.15
Nodes (12): 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 6. Persona Tinjau, 8. Migrasi localStorage + penutupan, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks (+4 more)

### Community 61 - "hand-writing/index.js"
Cohesion: 0.28
Nodes (10): hash(), adapt(), ANCHORS, attrs(), bakeDash(), compose(), EMPTY(), esc() (+2 more)

### Community 62 - "ref_node_fs"
Cohesion: 0.17
Nodes (7): NAMES, out, files, outputDir, root, sources, FakeZip

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "Mesin `offset`"
Cohesion: 0.25
Nodes (7): Flag khusus, Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`)

### Community 65 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 66 - "jt"
Cohesion: 0.33
Nodes (6): jt(), pe(), R(), Ue(), Z(), Cara kerja

### Community 68 - "compose"
Cohesion: 0.19
Nodes (21): classicCtx(), compose(), esc(), fillOf(), getXY(), lineOf(), modeOf(), modPreview() (+13 more)

### Community 69 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 70 - "libNameOf"
Cohesion: 0.33
Nodes (7): baseNameEN(), libName(), libWords(), metaOf(), styleMeta(), syncMetaUI(), tagsOf()

### Community 71 - "Pipeline ekspor"
Cohesion: 0.25
Nodes (7): 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Icon Composer, Pipeline ekspor, Template Icon Builder

### Community 72 - "engines/index.js"
Cohesion: 0.52
Nodes (5): accent, classic, handWriting, migrateLegacy(), offset

### Community 73 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 74 - "Mesin `classic` (Klasik)"
Cohesion: 0.40
Nodes (4): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Sumbu variasi (`axes`)

### Community 75 - "packColors"
Cohesion: 0.67
Nodes (3): packColors(), prefMini(), renderStyleUI()

### Community 76 - "icon-studio/src/main.js"
Cohesion: 0.12
Nodes (6): app, renderer, shell, SAMPLE_MANIFEST, STORE_KEY, vitest

### Community 77 - "document.js"
Cohesion: 0.18
Nodes (14): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, ANCHORS, FILLS, ID_RE, importManifest(), kebab2() (+6 more)

### Community 79 - "createRenderer"
Cohesion: 0.33
Nodes (10): useStyle(), createRenderer(), accentCtx(), classicCtx(), mainInfo(), modPreviewAccent(), modShape(), renderManifestItem() (+2 more)

### Community 80 - "components.js"
Cohesion: 0.27
Nodes (7): 4. Inventaris komponen, collapse(), press(), select(), single(), slider(), tabs()

### Community 81 - "3. Anatomi layar"
Cohesion: 0.22
Nodes (9): 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka, 3. Anatomi layar, Filter Bentuk (ADR-015) (+1 more)

### Community 82 - "registry.js"
Cohesion: 0.33
Nodes (5): Penggantian nama, engines, migrateFamily(), normStyle(), register()

### Community 83 - "concept"
Cohesion: 0.50
Nodes (5): Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, rng(), signature(), concept()

## Knowledge Gaps
- **9 isolated node(s):** `ADR-0017`, `ADR-0017`, `eslint`, `lucide-static`, `prettier` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 481 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `3. Anatomi layar`, `vendor-1.js`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `Diubah` (e.g. with `metadataCSV()` and `cuRoles()`) actually correct?**
  _`Diubah` has 26 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0017`, `eslint` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `7. Persona Kombinasi` connect `At` to `compose`, `Langkah`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `template-icon-builder/src/main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `template-icon-builder/src/main.js`, `AGENTS.md: instruksi untuk agen (Codex)`, `Pipeline ekspor`, `icon-studio/src/main.js`, `2. Modul`, `Mesin `hand-writing` (dulu "Coret")`, `doExport`, `Produk: tujuan, batasan, alur kerja`, `Langkah`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._