# Graph Report - icon-composer-v2  (2026-10-20)

## Corpus Check
- 155 files · ~163,554 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1642 nodes · 4189 edges · 79 communities (77 shown, 2 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 269 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c81f481f`
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
- builder.js
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
- Mesin `offset`
- classic/index.js
- builder-ops.js
- composer-edit.js
- icon-sources/index.js
- At
- render.js
- composer.js
- compose
- engines-offset.test.js
- doExport
- export-canva.spec.js
- cn
- jn
- Peta konteks proyek dengan graphify
- Usulan komponen kit: Fase 2b
- README.md
- lint-ui.mjs
- offset/index.js
- ce
- engines-offset.test.js
- studio-migration.test.js
- engines/package.json
- shell.js
- core/package.json
- export/package.json
- icon-sources/package.json
- app-state.js
- icon-studio/package.json
- on
- @playwright/test
- get
- renderDetail
- vitest
- review-ops.js
- studio-undo.spec.js
- engines/index.js
- shell.js
- runImport
- Aturan UI untuk agen (wajib dipatuhi)
- 5. L3: perencana variasi
- shell.js
- accentCtx
- esc
- 5. L3: perencana variasi
- Langkah
- doExport
- palettes.js
- @playwright/test
- get
- Mesin `sticker`
- directFillSvgFile
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
8. `aria()` - 26 edges
9. `directFillSvgFile()` - 26 edges
10. `Diubah` - 26 edges

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

## Communities (79 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (38): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+30 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 2 - "Model data"
Cohesion: 0.07
Nodes (21): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4.1 Isi `icon-studio-v1`, 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4. localStorage, 5. Migrasi dari composer gaya lama (+13 more)

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
Cohesion: 0.04
Nodes (59): ACC_OPTS, accCache, adLoad(), adRender(), adShow(), baseNameEN(), batchItem(), blankItem() (+51 more)

### Community 7 - "vendor-1.js"
Cohesion: 0.06
Nodes (17): ai(), an(), $e(), ei(), Fe(), fn(), He(), hi() (+9 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "builder.js"
Cohesion: 0.11
Nodes (28): brandId(), metadataBody(), BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, exists(), dupKey(), finalManifest() (+20 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (18): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+10 more)

### Community 13 - "builder.js"
Cohesion: 0.20
Nodes (22): paintSwatches(), layerPaints(), r3(), composeAccent(), decoAccent(), modAccent(), modPreviewAccent(), composeClassic() (+14 more)

### Community 14 - "export/index.js"
Cohesion: 0.16
Nodes (25): actions, builderDeps(), canvas(), cellFlag(), cellsOf(), checksBody(), control(), directCache (+17 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "components.js"
Cohesion: 0.11
Nodes (43): 4. Inventaris komponen, accordion(), collapse(), colorpicker(), cpBary(), cpBuild(), cpChanged(), cpClose() (+35 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.10
Nodes (36): actions, canvas(), control(), deps(), headIcon(), isSet(), kombinasi, matrixOf() (+28 more)

### Community 18 - "document.js"
Cohesion: 0.11
Nodes (31): DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, applyFamily(), createManifestDocument(), FILLS (+23 more)

### Community 19 - "studio-state.test.js"
Cohesion: 0.12
Nodes (11): app, renderer, shell, SAMPLE_MANIFEST, createClassicData(), ctxOf(), fakeRenderer(), offsetFixture (+3 more)

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "geometry.js"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Diperbaiki, Ditambahkan, Ditambahkan (desain), Unreleased

### Community 22 - "icon-sources/index.js"
Cohesion: 0.14
Nodes (17): 1. Fondasi state + golden render Icon Studio ✅, CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS (+9 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (20): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+12 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "Mesin `offset`"
Cohesion: 0.17
Nodes (19): Cara kerja, Flag khusus, Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Risiko, Sumbu variasi (`axes`) (+11 more)

### Community 26 - "classic/index.js"
Cohesion: 0.13
Nodes (32): Diubah, 2. Modul, Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Rotasi per ikon, Sumbu variasi (`axes`) (+24 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.09
Nodes (63): control(), ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), autoPanelCheck(), boxesOf(), cell() (+55 more)

### Community 29 - "icon-sources/index.js"
Cohesion: 0.17
Nodes (11): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 5. Ikon, 6. Teks UI, 7. Keadaan khusus, 8. Aksesibilitas (wajib), 9. Kriteria terima UI (+3 more)

### Community 30 - "At"
Cohesion: 0.22
Nodes (13): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+5 more)

### Community 31 - "render.js"
Cohesion: 0.20
Nodes (16): MODES, useStyle(), layerBoxes(), createRenderer(), accentCtx(), boxesOf(), classicCtx(), mainInfo() (+8 more)

### Community 32 - "composer.js"
Cohesion: 0.11
Nodes (46): colorRow(), COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo() (+38 more)

### Community 33 - "compose"
Cohesion: 0.13
Nodes (35): buildZip(), classicCtx(), compose(), download(), esc(), exportSVG(), fileNames(), fillOf() (+27 more)

### Community 34 - "engines-offset.test.js"
Cohesion: 0.15
Nodes (27): applyColors(), chips(), colorActions, currentOf(), pickerExtra(), swatchOptions(), clamp(), fromChroma() (+19 more)

### Community 35 - "doExport"
Cohesion: 0.24
Nodes (10): brandId(), doExport(), finalManifest(), meta(), packOf(), pathOf(), searchOf(), svgFile() (+2 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.23
Nodes (11): packColors(), svgColors(), buildZip(), STYLE_WORDS, createTagIndex(), EN_ID, SMALL, STOP (+3 more)

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
Cohesion: 0.25
Nodes (4): Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 42 - "lint-ui.mjs"
Cohesion: 0.10
Nodes (15): NAMES, out, COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED (+7 more)

### Community 43 - "offset/index.js"
Cohesion: 0.16
Nodes (21): Parameter per item, touches(), unionBox(), adapt(), axes(), boxesOffset(), compose(), decoPaths() (+13 more)

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "engines-offset.test.js"
Cohesion: 0.14
Nodes (8): ensureManifestItem(), 4.4 Urungkan dan ulangi (hanya di memori), DECO_SETS, OFFSET_DEFAULTS, ctx, LUCIDE, style(), vendor

### Community 46 - "studio-migration.test.js"
Cohesion: 0.11
Nodes (39): actions, ANCHORS, badgeOf(), card(), checkCanvas(), control(), deps(), dmOf() (+31 more)

### Community 47 - "engines/package.json"
Cohesion: 0.18
Nodes (10): exports, ./accent, ./classic, ./hand-writing, ./offset, ./shared, name, private (+2 more)

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
Cohesion: 0.25
Nodes (7): exports, ./catalog, ./custom, name, private, type, version

### Community 52 - "app-state.js"
Cohesion: 0.13
Nodes (27): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), offsetComposerSource(), offsetSetFromComposer() (+19 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "on"
Cohesion: 0.17
Nodes (12): on(), Qn(), 1. Cakupan (keputusan pemilik), 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+4 more)

### Community 55 - "@playwright/test"
Cohesion: 0.09
Nodes (10): DECO_SETS, downloadSvgs(), H, KEYS, VENDOR, VENDOR, dxy(), xy() (+2 more)

### Community 56 - "get"
Cohesion: 0.31
Nodes (7): flagsOf(), Penggantian nama, engines, get(), migrateFamily(), normStyle(), register()

### Community 57 - "renderDetail"
Cohesion: 0.18
Nodes (25): collisions(), curIt(), dupMap(), esc(), exportList(), filtered(), flagsOf(), isBad() (+17 more)

### Community 58 - "vitest"
Cohesion: 0.24
Nodes (6): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT, vitest

### Community 59 - "review-ops.js"
Cohesion: 0.12
Nodes (29): styleWordOf(), esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZipFiles(), DEFAULT_CANVA_META, DEFAULT_REVIEW (+21 more)

### Community 61 - "engines/index.js"
Cohesion: 0.06
Nodes (42): createVocabulary(), collisions(), suggest(), lev(), Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2: Ekstrak paket bersama ✅ (+34 more)

### Community 62 - "shell.js"
Cohesion: 0.14
Nodes (15): builder, composerSet, composerEdit, fillable, isFillable(), libraryAction(), libraryResults(), libraryUi (+7 more)

### Community 63 - "runImport"
Cohesion: 0.33
Nodes (7): ensureItem(), ensureLucide(), loadHugeicons(), loadTabler(), persist(), runImport(), setKey()

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 66 - "shell.js"
Cohesion: 0.10
Nodes (38): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+30 more)

### Community 67 - "accentCtx"
Cohesion: 0.19
Nodes (13): accentCtx(), boxes(), composeAccent(), cycleRole(), decoMarkup(), geom(), luAnalyze(), mainInfo() (+5 more)

### Community 68 - "esc"
Cohesion: 0.17
Nodes (11): 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Langkah (+3 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.22
Nodes (17): ensureComboFields(), blankItem(), createSetDocument(), normItem(), addItem(), clearLayer(), DEFAULT_POOL, DEFAULT_VIEW (+9 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "palettes.js"
Cohesion: 0.33
Nodes (5): ACCENT_OPTIONS, FILL_OPTIONS, INK_OPTIONS, LINE_OPTIONS, OFFSET_ACCENT_OPTIONS

### Community 73 - "@playwright/test"
Cohesion: 0.18
Nodes (3): @playwright/test, mixed, offset

### Community 74 - "get"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 76 - "directFillSvgFile"
Cohesion: 0.09
Nodes (32): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`), 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP (+24 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 84 - "ref_node_path"
Cohesion: 0.10
Nodes (11): builds, dist, root, files, outputDir, root, sources, apps (+3 more)

## Knowledge Gaps
- **14 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0012`, `ADR-0017`, `ADR-0017` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 564 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `Model data`, `doExport`, `esc`, `template-icon-builder/src/main.js`, `export-canva.spec.js`, `review-ops.js`, `builder.js`, `export/index.js`, `studio-state.test.js`, `classic/index.js`, `builder-ops.js`, `render.js`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0012` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `on` to `kombinasi.js`, `review-ops.js`, `vendor-1.js`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createShell()` (e.g. with `importText()` and `toast()`) actually correct?**
  _`createShell()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._