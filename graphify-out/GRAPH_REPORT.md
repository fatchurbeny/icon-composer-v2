# Graph Report - color-picker-a15bcd  (2026-10-20)

## Corpus Check
- 155 files · ~160,360 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1628 nodes · 4131 edges · 79 communities (76 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 265 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5060c4ca`
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
- classic/index.js
- tinjau.js
- C
- components.js
- kombinasi.js
- document.js
- createClassicData
- Tech stack
- Unreleased
- render.js
- render
- Arsitektur
- compose
- Diubah
- render.js
- composer-edit.js
- Design handoff: Icon Studio (UI terpadu)
- At
- Diubah
- composer.js
- renderEditor
- studio-color.test.js
- Model data
- export/index.js
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- README.md
- lint-ui.mjs
- offset/index.js
- ce
- Glosarium
- palettes.js
- engines/package.json
- 5. L3: perencana variasi
- core/package.json
- export/package.json
- icon-sources/package.json
- app-state.js
- icon-studio/package.json
- Mesin `accent` (Aksen bagian)
- @playwright/test
- icon-sources/index.js
- renderDetail
- vitest
- review-ops.js
- studio-undo.spec.js
- engines/index.js
- library-panel.js
- Rencana migrasi
- Aturan UI untuk agen (wajib dipatuhi)
- renderLucidePick
- shell.js
- Mesin `classic` (Klasik)
- Pipeline ekspor
- 5. L3: perencana variasi
- set-ops.js
- studio-colorpicker.spec.js
- registry.js
- ui-shell.spec.js
- Oe
- directFillSvgFile
- compose
- ui-language.spec.js
- ref_node_path

## God Nodes (most connected - your core abstractions)
1. `esc()` - 58 edges
2. `r3()` - 31 edges
3. `createRenderer()` - 30 edges
4. `createShell()` - 29 edges
5. `get()` - 28 edges
6. `C()` - 27 edges
7. `createAppState()` - 26 edges
8. `directFillSvgFile()` - 26 edges
9. `Diubah` - 26 edges
10. `aria()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4.1 Isi `icon-studio-v1`` --references--> `manifestOffsetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (79 total, 3 thin omitted)

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
Cohesion: 0.04
Nodes (74): ACC_OPTS, accCache, ANCHORS, applyManStyle(), brandId(), CANVA_COLUMNS, closeCreatorMenu(), closeKwMenu() (+66 more)

### Community 6 - "icon-composer/src/main.js"
Cohesion: 0.05
Nodes (39): ACC_OPTS, accCache, bOff, bSel, copyText(), customs, DEFAULT_STYLE, FAMILY_DEFAULT (+31 more)

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
Cohesion: 0.07
Nodes (50): actions, ANCHORS, badgeOf(), brandId(), control(), EXPORT_OPTION_LABEL, importArea(), LEGEND (+42 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "classic/index.js"
Cohesion: 0.24
Nodes (18): r3(), composeAccent(), decoAccent(), modAccent(), modPreviewAccent(), composeClassic(), decoMarkupClassic(), fillOfClassic() (+10 more)

### Community 14 - "tinjau.js"
Cohesion: 0.11
Nodes (44): builder, card(), checkCanvas(), deps(), dmOf(), exportBody(), exportCanvas(), filtered() (+36 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.11
Nodes (43): 4. Inventaris komponen, accordion(), collapse(), colorpicker(), cpBary(), cpBuild(), cpChanged(), cpClose() (+35 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.11
Nodes (35): actions, canvas(), control(), deps(), headIcon(), isSet(), matrixOf(), mutate() (+27 more)

### Community 18 - "document.js"
Cohesion: 0.08
Nodes (38): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, applyFamily(), FILLS, ID_RE (+30 more)

### Community 19 - "createClassicData"
Cohesion: 0.10
Nodes (14): app, renderer, shell, SAMPLE_MANIFEST, PRESET, STORE_KEY, createClassicData(), vitest (+6 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "render.js"
Cohesion: 0.17
Nodes (16): MODES, useStyle(), createRenderer(), accentCtx(), classicCtx(), mainInfo(), modPreviewAccent(), modShape() (+8 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "compose"
Cohesion: 0.20
Nodes (19): baseNameEN(), buildZip(), download(), esc(), exportSVG(), fileNames(), included(), libName() (+11 more)

### Community 26 - "Diubah"
Cohesion: 0.19
Nodes (24): Diubah, escapeAttribute(), partStr(), createLibraryShapes(), analyze(), ensure(), bbOf(), hostEl() (+16 more)

### Community 27 - "render.js"
Cohesion: 0.20
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.09
Nodes (56): actions, control(), ANCHORS, artSvg(), autoPanelCheck(), boxesOf(), classicCtx(), colorCountNote() (+48 more)

### Community 29 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.17
Nodes (11): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib), 9. Kriteria terima UI (+3 more)

### Community 30 - "At"
Cohesion: 0.22
Nodes (13): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+5 more)

### Community 31 - "Diubah"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 32 - "composer.js"
Cohesion: 0.13
Nodes (42): colorRow(), COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo() (+34 more)

### Community 33 - "renderEditor"
Cohesion: 0.15
Nodes (20): accentCtx(), boxes(), classicCtx(), composeAccent(), cycleRole(), decoMarkup(), fillOf(), geom() (+12 more)

### Community 34 - "studio-color.test.js"
Cohesion: 0.16
Nodes (26): applyColors(), chips(), colorActions, currentOf(), pickerExtra(), swatchOptions(), clamp(), fromChroma() (+18 more)

### Community 35 - "Model data"
Cohesion: 0.20
Nodes (9): 1. Kunci ikon, 3. Gaya set, 4.1 Isi `icon-studio-v1`, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4. localStorage, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama (+1 more)

### Community 36 - "export/index.js"
Cohesion: 0.20
Nodes (15): 2. Modul, bboxUnion(), packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS, styleWord() (+7 more)

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
Cohesion: 0.10
Nodes (15): NAMES, out, COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED (+7 more)

### Community 43 - "offset/index.js"
Cohesion: 0.07
Nodes (47): boxesOf(), Cara kerja, Flag khusus, Icon Studio (Fase 3), Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set) (+39 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "Glosarium"
Cohesion: 0.22
Nodes (8): ensureManifestItem(), 2. Item kanonik, 4.4 Urungkan dan ulangi (hanya di memori), Parameter per item, Glosarium, blob(), engine(), style()

### Community 46 - "palettes.js"
Cohesion: 0.29
Nodes (6): ACCENT_OPTIONS, CURATED_PALETTES, FILL_OPTIONS, INK_OPTIONS, LINE_OPTIONS, OFFSET_ACCENT_OPTIONS

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

### Community 48 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

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
Cohesion: 0.24
Nodes (17): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), createManifestDocument(), offsetComposerSource(), offsetSetFromComposer() (+9 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.29
Nodes (6): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Rotasi per ikon, Sumbu variasi (`axes`)

### Community 55 - "@playwright/test"
Cohesion: 0.07
Nodes (10): @playwright/test, DECO_SETS, downloadSvgs(), H, KEYS, VENDOR, VENDOR, openPanel() (+2 more)

### Community 56 - "icon-sources/index.js"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 57 - "renderDetail"
Cohesion: 0.18
Nodes (24): collisions(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+16 more)

### Community 58 - "vitest"
Cohesion: 0.36
Nodes (5): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT

### Community 59 - "review-ops.js"
Cohesion: 0.06
Nodes (57): createVocabulary(), collisions(), esc(), previewSheetHTML(), SET_LICENSES, layerBoxes(), baseNameEN(), buildSetZipFiles() (+49 more)

### Community 61 - "engines/index.js"
Cohesion: 0.07
Nodes (39): flagsOf(), Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash (+31 more)

### Community 62 - "library-panel.js"
Cohesion: 0.24
Nodes (9): fillable, isFillable(), libraryAction(), libraryResults(), libraryUi, LICENSE_NOTE, namesOf(), SOURCE_LABEL (+1 more)

### Community 63 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "renderLucidePick"
Cohesion: 0.32
Nodes (8): blankItem(), ensureLucide(), normItem(), openLucide(), openModal(), openPack(), renderLucidePick(), uid()

### Community 66 - "shell.js"
Cohesion: 0.09
Nodes (46): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+38 more)

### Community 67 - "Mesin `classic` (Klasik)"
Cohesion: 0.33
Nodes (5): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`)

### Community 68 - "Pipeline ekspor"
Cohesion: 0.18
Nodes (10): 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Aturan wajib ekspor Canva (keputusan pemilik), Icon Composer, Penerapan per aplikasi (+2 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "set-ops.js"
Cohesion: 0.21
Nodes (18): ensureComboFields(), blankItem(), createSetDocument(), normItem(), addItem(), clearLayer(), DEFAULT_POOL, DEFAULT_VIEW (+10 more)

### Community 71 - "studio-colorpicker.spec.js"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "registry.js"
Cohesion: 0.17
Nodes (12): on(), Qn(), 1. Cakupan (keputusan pemilik), 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+4 more)

### Community 74 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 76 - "directFillSvgFile"
Cohesion: 0.42
Nodes (11): dedupeAttrs(), cloneSingleShape(), colorKey(), directFillSvgFile(), flattenSvgMasks(), geometryArea(), geometryForColor(), geometryForShape() (+3 more)

### Community 77 - "compose"
Cohesion: 0.20
Nodes (14): batchItem(), compose(), modPreview(), modPreviewAccent(), packColors(), persist(), prefMini(), renderBatch() (+6 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 84 - "ref_node_path"
Cohesion: 0.10
Nodes (11): builds, dist, root, files, outputDir, root, sources, apps (+3 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0012`, `ADR-0017`, `ADR-0017` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 562 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Mesin `classic` (Klasik)`, `export/index.js`, `template-icon-builder/src/main.js`, `Pipeline ekspor`, `review-ops.js`, `builder-ops.js`, `offset/index.js`, `Glosarium`, `tinjau.js`, `createClassicData`, `Mesin `accent` (Aksen bagian)`, `icon-sources/index.js`, `render.js`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0012` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `registry.js` to `kombinasi.js`, `review-ops.js`, `vendor-1.js`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createShell()` (e.g. with `importText()` and `toast()`) actually correct?**
  _`createShell()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._