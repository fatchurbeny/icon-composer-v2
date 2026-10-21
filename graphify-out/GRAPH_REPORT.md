# Graph Report - builder-sticker-colors-2256ae  (2026-10-21)

## Corpus Check
- 170 files · ~199,568 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 5, .css 5, .csv 2)

## Summary
- 1881 nodes · 4928 edges · 96 communities (93 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 334 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b47cd74`
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
- render.js
- export/index.js
- C
- components.js
- kombinasi.js
- document.js
- icon-studio/src/main.js
- Tech stack
- export-canva.spec.js
- icon-sources/index.js
- render
- Arsitektur
- engines-offset.test.js
- flagsOf
- builder-ops.js
- composer-edit.js
- app-state.js
- At
- Design handoff: Icon Studio (UI terpadu)
- composer.js
- renderReview
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
- esc
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
- compose
- kombinasi.js
- export-canva.spec.js
- Aturan UI untuk agen (wajib dipatuhi)
- studio-state.test.js
- build-icon-data.mjs
- accentCtx
- esc
- 5. L3: perencana variasi
- Langkah
- doExport
- offset/index.js
- engines/index.js
- n
- Mesin `accent` (Aksen bagian)
- directFillSvgFile
- 2. Item kanonik
- concept
- ui-language.spec.js
- Mesin `sticker`
- ce
- accentCtx
- Oe
- ref_node_path
- sticker-parity.spec.js
- 5. L3: perencana variasi
- Pipeline ekspor
- 4. localStorage
- Produk: tujuan, batasan, alur kerja
- Mesin `classic` (Klasik)
- adRender
- ui-shell.spec.js
- renderLu
- closedMarkupEndpoint
- packColors

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
- `Masalah legacy yang diperbaiki` --references--> `comboItem()`  [INFERRED]
  docs/engines/sticker.md → apps/icon-studio/src/state/combo-ops.js
- `3. Gaya set` --references--> `normSetStyle()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/state/document.js
- `Di Icon Studio` --references--> `manifestStickerItem()`  [INFERRED]
  docs/engines/sticker.md → apps/icon-studio/src/state/document.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js

## Import Cycles
- None detected.

## Communities (96 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (39): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+31 more)

### Community 1 - "golden-utils.js"
Cohesion: 0.14
Nodes (17): fixture, mixed, fixture, ADR-0016, mixed, captureIconComposer(), captureIconComposerBins(), captureIconComposerZip() (+9 more)

### Community 3 - "README.md"
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
Nodes (13): ai(), an(), $e(), ei(), Fe(), fn(), ie(), li() (+5 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "builder-ops.js"
Cohesion: 0.10
Nodes (26): BRAND_KEY, buildExportFiles(), CANVA_COLUMNS, hwItemOf(), INTERNAL_COLUMNS, LICENSE_HAND_WRITING, LICENSE_OFFSET, LICENSE_STICKER (+18 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.20
Nodes (9): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 6. Data yang disimpan, Algoritma, Anti-repetisi, Kasus yang harus tertangkap (fixture wajib), Perbandingan (+1 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "render.js"
Cohesion: 0.06
Nodes (86): paintSwatches(), finalManifest(), manifestHandWritingStyle(), manifestOffsetStyle(), manifestStickerStyle(), MODES, useStyle(), layerBoxes() (+78 more)

### Community 14 - "export/index.js"
Cohesion: 0.14
Nodes (32): actions, builderDeps(), cellsOf(), checksBody(), control(), directCache, isSet(), ADR-0011 (+24 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (27): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+19 more)

### Community 16 - "components.js"
Cohesion: 0.11
Nodes (43): 4. Inventaris komponen, accordion(), collapse(), colorpicker(), cpBary(), cpBuild(), cpChanged(), cpClose() (+35 more)

### Community 17 - "kombinasi.js"
Cohesion: 0.21
Nodes (18): poolBody(), activePool(), addCombos(), cellState(), comboItem(), comboMatrix(), comboPrefs(), DEFAULT_COMBO (+10 more)

### Community 18 - "document.js"
Cohesion: 0.11
Nodes (34): stickerItemColors(), stickerPackColors(), DEFAULT_SET_STYLE, defaultManifestStyle(), FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, ANCHORS, defaultModFill() (+26 more)

### Community 19 - "icon-studio/src/main.js"
Cohesion: 0.14
Nodes (8): app, renderer, shell, SAMPLE_MANIFEST, STORE_KEY, hwFixture, offsetFixture, stickerFixture

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "export-canva.spec.js"
Cohesion: 0.15
Nodes (7): DECO_SETS, downloadSvgs(), H, ADR-0011, KEYS, LIB_SAMPLES, VENDOR

### Community 22 - "icon-sources/index.js"
Cohesion: 0.14
Nodes (16): 1. Fondasi state + golden render Icon Studio ✅, CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS (+8 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (21): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+13 more)

### Community 24 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, 7. Struktur Icon Studio (`apps/icon-studio/src/`), Arsitektur

### Community 25 - "engines-offset.test.js"
Cohesion: 0.11
Nodes (22): Cara kerja, Flag khusus, Knockout (`opt.mode`), Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Risiko, Sumbu variasi (`axes`) (+14 more)

### Community 26 - "flagsOf"
Cohesion: 0.38
Nodes (10): createVocabulary(), collisions(), exists(), suggest(), dupKey(), flagsOf(), handWritingFlagsOf(), lev() (+2 more)

### Community 27 - "builder-ops.js"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 28 - "composer-edit.js"
Cohesion: 0.08
Nodes (63): control(), ANCHOR_NAME, anchorOf(), ANCHORS, artSvg(), BLOB_NAME, boxesOf(), cell() (+55 more)

### Community 29 - "app-state.js"
Cohesion: 0.13
Nodes (21): HAND_WRITING_LEGACY_KEY, handWritingSetFromComposer(), offsetSetFromComposer(), randomUid(), LEGACY_KEYS, readJson(), migrateFromOffset(), MIGRATION_ID (+13 more)

### Community 30 - "At"
Cohesion: 0.17
Nodes (16): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+8 more)

### Community 31 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.10
Nodes (20): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+12 more)

### Community 32 - "composer.js"
Cohesion: 0.10
Nodes (46): COMPOSER_TOOLS, docFileName(), duplicateCount(), ENGINE_CARDS, ENGINE_NAMES, engineFlags(), engineInfo(), isFixedLayout() (+38 more)

### Community 33 - "renderReview"
Cohesion: 0.29
Nodes (14): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), metaOf(), nameOf() (+6 more)

### Community 34 - "engines-offset.test.js"
Cohesion: 0.23
Nodes (18): currentOf(), clamp(), fromChroma(), HARMONIES, harmony(), HARMONY_STEPS, hexToHsl(), hexToHsv() (+10 more)

### Community 35 - "doExport"
Cohesion: 0.18
Nodes (17): ensureManifestItem(), brandId(), doExport(), exportList(), finalManifest(), kebab2(), meta(), packOf() (+9 more)

### Community 36 - "export-canva.spec.js"
Cohesion: 0.17
Nodes (17): styleWordOf(), 2. Modul, ADR-016 · 2026-10-18 · Header metadata.csv Composer dikutip, packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS (+9 more)

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

### Community 41 - "dash.js"
Cohesion: 0.25
Nodes (17): WAJIB: memanggang dash, arcLen(), bakeDash(), bigEnough(), cache, cheapFar(), conicLen(), cubicLen() (+9 more)

### Community 42 - "lint-ui.mjs"
Cohesion: 0.10
Nodes (15): NAMES, out, COMPONENTS, DATA_COLOR_OK, defined, EXPORT_TEMPLATE, EXT, GENERATED (+7 more)

### Community 43 - "offset/index.js"
Cohesion: 0.06
Nodes (46): applyColors(), applyStyleColors(), 4.1.1 Preset saya dan sumber swatch (app-level), hash(), adapt(), axes(), COLOR_PAIRS, compose() (+38 more)

### Community 44 - "engines-hand-writing.test.js"
Cohesion: 0.12
Nodes (9): HAND_WRITING_DEFAULTS, ctx, KEYS, LEGACY, LEGACY_S, LUCIDE, MODS, root (+1 more)

### Community 45 - "esc"
Cohesion: 0.12
Nodes (33): builder, exportCanvas(), chips(), colorActions, pickerExtra(), swatchOptions(), helpButton(), composerSet (+25 more)

### Community 46 - "builder.js"
Cohesion: 0.08
Nodes (54): actions, ANCHORS, badgeOf(), brandId(), card(), checkCanvas(), control(), deps() (+46 more)

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

### Community 52 - "app-state.js"
Cohesion: 0.18
Nodes (22): createAppState(), afterRestore(), step(), PERSONAS, defaultExportOptions(), validateManifest(), handWritingComposerSource(), offsetComposerSource() (+14 more)

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
Cohesion: 0.10
Nodes (32): Flag, Icon Studio, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Sumbu variasi (`axes`), Versi pustaka, Fase 4: Mesin hand-writing ✅ (+24 more)

### Community 57 - "renderDetail"
Cohesion: 0.18
Nodes (23): collisions(), curIt(), dupMap(), esc(), filtered(), flagsOf(), isBad(), keyLabel() (+15 more)

### Community 58 - "vitest"
Cohesion: 0.24
Nodes (6): CONTENT_FIELDS, createUndo(), keyOf(), snapshot(), UNDO_LIMIT, vitest

### Community 59 - "review-ops.js"
Cohesion: 0.13
Nodes (19): esc(), previewSheetHTML(), SET_LICENSES, baseNameEN(), buildSetZipFiles(), canvaSVG(), DEFAULT_CANVA_META, DEFAULT_REVIEW (+11 more)

### Community 61 - "compose"
Cohesion: 0.21
Nodes (16): batchItem(), blankItem(), compose(), ensureLucide(), esc(), normItem(), openLucide(), openModal() (+8 more)

### Community 62 - "kombinasi.js"
Cohesion: 0.15
Nodes (25): poolBody(), actions, canvas(), control(), deps(), headIcon(), isSet(), matrixOf() (+17 more)

### Community 63 - "export-canva.spec.js"
Cohesion: 0.13
Nodes (30): parseRoute(), routeHash(), anchorScroll(), clampZoom(), createCanvasZoom(), attach(), bindKeys(), contentRect() (+22 more)

### Community 64 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.29
Nodes (6): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Pengecualian, Selalu

### Community 65 - "studio-state.test.js"
Cohesion: 0.25
Nodes (12): applyFamily(), blankItem(), createManifestDocument(), createSetDocument(), normItem(), normSetStyle(), ADR-0017, migrateFromLegacy() (+4 more)

### Community 66 - "build-icon-data.mjs"
Cohesion: 0.14
Nodes (10): CLOSED_TAGS, data, KEEP, LU, ADR-0019, outFile, root, sources (+2 more)

### Community 67 - "accentCtx"
Cohesion: 0.23
Nodes (14): boxes(), classicCtx(), fillOf(), geom(), getXY(), lineOf(), modeOf(), partThumb() (+6 more)

### Community 68 - "esc"
Cohesion: 0.17
Nodes (11): 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), 5. Persona Builder ✅ (menunggu tinjauan Ika), 8. Migrasi localStorage + penutupan ✅, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks, Langkah (+3 more)

### Community 69 - "5. L3: perencana variasi"
Cohesion: 0.22
Nodes (7): ALL_KEYS, H, HG_KEYS, KEYS, LEGACY_VIEWBOX, MODES, VENDOR

### Community 70 - "Langkah"
Cohesion: 0.18
Nodes (16): addItem(), clearLayer(), DEFAULT_POOL, DEFAULT_VIEW, duplicateItem(), HW_FIELDS, moveItem(), removeItem() (+8 more)

### Community 71 - "doExport"
Cohesion: 0.29
Nodes (5): checkPicker(), expectInViewport(), openComposerColors(), trigger(), VENDOR

### Community 72 - "offset/index.js"
Cohesion: 0.14
Nodes (23): Icon Studio (Fase 3), Parameter per item, touches(), unionBox(), adapt(), axes(), compose(), decoPaths() (+15 more)

### Community 73 - "engines/index.js"
Cohesion: 0.23
Nodes (9): Penggantian nama, accent, classic, handWriting, offset, engines, migrateFamily(), normStyle() (+1 more)

### Community 74 - "n"
Cohesion: 0.17
Nodes (12): He(), hi(), jt(), ke(), Me(), pe(), qt(), R() (+4 more)

### Community 75 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.33
Nodes (3): H, ADR-0011, VENDOR

### Community 76 - "directFillSvgFile"
Cohesion: 0.23
Nodes (19): Cara kerja, Knockout (`opt.mode`), 1. Tahapan, 2. Kompatibilitas per mesin, Aturan wajib ekspor Canva (keputusan pemilik), Penerapan per aplikasi, 6. Persona Tinjau ✅ (menunggu tinjauan Ika), dedupeAttrs() (+11 more)

### Community 77 - "2. Item kanonik"
Cohesion: 0.18
Nodes (10): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data, Parameter per item, Glosarium (+2 more)

### Community 78 - "concept"
Cohesion: 0.10
Nodes (21): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2: Ekstrak paket bersama ✅, Fase 2b: UI terpadu Icon Studio ✅, Fase 3: Mesin offset ✅, Fase 5: Mesin sticker ✅, Fase 6: Anti-repetisi (+13 more)

### Community 79 - "ui-language.spec.js"
Cohesion: 0.24
Nodes (8): ALLOWED, collect(), ENGLISH, englishIn(), route(), sweep(), VENDOR, WORDS

### Community 80 - "Mesin `sticker`"
Cohesion: 0.18
Nodes (10): Batas warna Canva, Cara kerja, Di Icon Studio, Masalah legacy yang diperbaiki, Mesin `sticker`, Mode `mask` dan `white`, Normalisasi kanvas dan posisi, Parameter gaya (+2 more)

### Community 81 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 82 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 83 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 84 - "ref_node_path"
Cohesion: 0.08
Nodes (16): builds, dist, root, files, outputDir, root, sources, apps (+8 more)

### Community 85 - "sticker-parity.spec.js"
Cohesion: 0.15
Nodes (10): ALL, caseOf(), CASES, H, ADR-0019, RESTORED, RESTORED_REDRAWN, RULE_CHANGED (+2 more)

### Community 86 - "5. L3: perencana variasi"
Cohesion: 0.29
Nodes (7): 5. L3: perencana variasi, Algoritma (greedy berimbang, deterministik), Kapan planner dijalankan, Kontrol per item, Kriteria terima, Masalah yang diselesaikan, Masukan

### Community 87 - "Pipeline ekspor"
Cohesion: 0.33
Nodes (5): 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Icon Composer, Pipeline ekspor

### Community 88 - "4. localStorage"
Cohesion: 0.40
Nodes (5): 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`), 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`), 4.5 Migrasi 003 (`apps/icon-studio/src/state/migrations/003-from-hand-writing.js`), 4.6 Migrasi 004 (`apps/icon-studio/src/state/migrations/004-from-sticker.js`), 4. localStorage

### Community 89 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 90 - "Mesin `classic` (Klasik)"
Cohesion: 0.33
Nodes (5): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Rotasi per ikon, Sumbu variasi (`axes`)

### Community 91 - "adRender"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 93 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 94 - "closedMarkupEndpoint"
Cohesion: 0.33
Nodes (6): ADR-019 · 2026-10-20 · Mesin sticker dan direct fill di ZIP Composer (Fase 5), Data bentuk isi, Hasil golden visual (`tests/e2e/sticker-parity.spec.js`), closedMarkupEndpoint(), isClosed(), markup()

### Community 95 - "packColors"
Cohesion: 0.67
Nodes (3): packColors(), prefMini(), renderStyleUI()

## Knowledge Gaps
- **20 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0011`, `ADR-0012`, `ADR-0017` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 661 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `doExport`, `export-canva.spec.js`, `template-icon-builder/src/main.js`, `esc`, `offset/index.js`, `review-ops.js`, `builder-ops.js`, `esc`, `export/index.js`, `render.js`, `Mesin `sticker``, `2. Item kanonik`, `icon-studio/src/main.js`, `Produk: tujuan, batasan, alur kerja`, `Mesin `classic` (Klasik)`, `builder-ops.js`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `createRenderer()` (e.g. with `boxesOf()` and `dropMissing()`) actually correct?**
  _`createRenderer()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0011` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0507399577167019 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `package.json`, `studio-state.test.js`, `engines-offset.test.js`, `export-canva.spec.js`, `Langkah`, `engines/index.js`, `offset/index.js`, `engines-hand-writing.test.js`, `render.js`, `kombinasi.js`, `document.js`, `icon-studio/src/main.js`, `icon-sources/index.js`, `engines-offset.test.js`, `review-ops.js`, `composer-edit.js`, `app-state.js`, `export-canva.spec.js`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `createAppState()` (e.g. with `documentFor()` and `migrateFromOffset()`) actually correct?**
  _`createAppState()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `golden-utils.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._