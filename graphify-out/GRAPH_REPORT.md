# Graph Report - icon-composer-v2  (2026-10-18)

## Corpus Check
- 118 files · ~103,489 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .css 5, (none) 4, .csv 2)

## Summary
- 1174 nodes · 2647 edges · 71 communities (69 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 203 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `598a7db9`
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
- doExport
- 2. Modul
- C
- hand-writing/index.js
- Mesin `sticker`
- document.js
- Model data
- Tech stack
- Unreleased
- icon-sources/index.js
- render
- Arsitektur
- compose
- r3
- renderLu
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
- AGENTS.md: instruksi untuk agen (Codex)
- Langkah
- engines/package.json
- normItem
- core/package.json
- export/package.json
- icon-sources/package.json
- directFillSvgFile
- icon-studio/package.json
- offset/index.js
- @playwright/test
- doExport
- flagsOf
- Produk: tujuan, batasan, alur kerja
- components.js
- Mesin `hand-writing` (dulu "Coret")
- Pipeline ekspor
- Rencana migrasi
- 3. Anatomi layar
- Mesin `offset`
- Oe
- jt
- studio-golden.spec.js
- renderBins
- Mesin `classic` (Klasik)
- palettes.js

## God Nodes (most connected - your core abstractions)
1. `esc()` - 36 edges
2. `r3()` - 28 edges
3. `C()` - 27 edges
4. `Diubah` - 27 edges
5. `createRenderer()` - 22 edges
6. `2. Modul` - 21 edges
7. `get()` - 20 edges
8. `createShell()` - 19 edges
9. `partStr()` - 19 edges
10. `Log keputusan (ADR)` - 19 edges

## Surprising Connections (you probably didn't know these)
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/ui.js
- `1. Kunci ikon` --references--> `check()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-studio/src/ui.js
- `4. `signature`` --references--> `check()`  [INFERRED]
  docs/ENGINE-CONTRACT.md → apps/icon-studio/src/ui.js
- `Risiko` --references--> `check()`  [INFERRED]
  docs/engines/offset.md → apps/icon-studio/src/ui.js
- `3.3 Builder · Periksa pack` --references--> `flagsOf()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → apps/template-icon-builder/src/main.js

## Import Cycles
- None detected.

## Communities (71 total, 2 thin omitted)

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
Nodes (38): ACC_OPTS, accCache, baseNameEN(), bOff, bSel, copyText(), customs, DEFAULT_STYLE (+30 more)

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
Nodes (15): 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi (+7 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "doExport"
Cohesion: 0.24
Nodes (13): ensureItem(), ensureLucide(), esc(), loadHugeicons(), loadTabler(), packOf(), persist(), renderImport() (+5 more)

### Community 14 - "2. Modul"
Cohesion: 0.30
Nodes (10): 2. Modul, packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS, styleWord(), createTagIndex() (+2 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "hand-writing/index.js"
Cohesion: 0.09
Nodes (32): Penggantian nama, Fase 2: Ekstrak paket bersama ✅, 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian (+24 more)

### Community 17 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 18 - "document.js"
Cohesion: 0.06
Nodes (54): createAppState(), PERSONAS, app, renderer, shell, SAMPLE_MANIFEST, DEFAULT_SET_STYLE, defaultManifestStyle() (+46 more)

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
Cohesion: 0.11
Nodes (21): 3. Persona Composer · Set ✅ (menunggu tinjauan Ika), EN_ID, SMALL, STOP, CAT_ID, ID_EN, LU_CATS, TB_CAT_ID (+13 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 25 - "compose"
Cohesion: 0.18
Nodes (24): batchItem(), buildZip(), compose(), download(), esc(), exportSVG(), fileNames(), included() (+16 more)

### Community 26 - "r3"
Cohesion: 0.08
Nodes (60): useStyle(), createRenderer(), accentCtx(), classicCtx(), mainInfo(), modPreviewAccent(), modShape(), renderManifestItem() (+52 more)

### Community 27 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 28 - "composer-edit.js"
Cohesion: 0.11
Nodes (39): control(), ANCHORS, artSvg(), classicCtx(), colorSwatches(), editActions, editControl(), fillOf() (+31 more)

### Community 29 - "luNames"
Cohesion: 0.19
Nodes (16): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+8 more)

### Community 30 - "At"
Cohesion: 0.15
Nodes (17): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+9 more)

### Community 31 - "adRender"
Cohesion: 0.29
Nodes (7): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent(), 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

### Community 32 - "composer.js"
Cohesion: 0.11
Nodes (35): COMPOSER_TOOLS, ENGINE_CARDS, engineInfo(), renderSet(), setColorCount(), actions, dupGroupsOf(), flaggedOf() (+27 more)

### Community 33 - "accentCtx"
Cohesion: 0.15
Nodes (20): accentCtx(), boxes(), classicCtx(), composeAccent(), cycleRole(), decoMarkup(), fillOf(), geom() (+12 more)

### Community 34 - "ref_node_path"
Cohesion: 0.14
Nodes (11): NAMES, out, builds, dist, root, files, outputDir, root (+3 more)

### Community 35 - "shell.js"
Cohesion: 0.15
Nodes (27): parseRoute(), routeHash(), builder, helpButton(), composerSet, composerEdit, layerList(), engineCards() (+19 more)

### Community 36 - "esc"
Cohesion: 0.26
Nodes (15): importArea(), MODE_LABEL, docFileName(), duplicateCount(), engineCards(), ADR-0017, repetitionPanel(), statusBar() (+7 more)

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
Cohesion: 0.12
Nodes (12): COMPONENTS, DATA_COLOR_OK, defined, EXT, GENERATED, problems, ROOT, RULES (+4 more)

### Community 43 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.33
Nodes (5): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Selalu

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 46 - "Langkah"
Cohesion: 0.17
Nodes (11): 1. Fondasi state + golden render Icon Studio ✅, 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika), 5. Persona Builder, 6. Persona Tinjau, 8. Migrasi localStorage + penutupan, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks (+3 more)

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

### Community 52 - "directFillSvgFile"
Cohesion: 0.42
Nodes (11): dedupeAttrs(), cloneSingleShape(), colorKey(), directFillSvgFile(), flattenSvgMasks(), geometryArea(), geometryForColor(), geometryForShape() (+3 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "offset/index.js"
Cohesion: 0.29
Nodes (8): adapt(), closed(), compose(), EMPTY(), flags(), KEEP, normStyle(), partString()

### Community 55 - "@playwright/test"
Cohesion: 0.16
Nodes (3): @playwright/test, offline(), open()

### Community 56 - "doExport"
Cohesion: 0.20
Nodes (11): brandId(), doExport(), finalManifest(), meta(), pathOf(), resourceHTML(), searchOf(), sheetGrid() (+3 more)

### Community 57 - "flagsOf"
Cohesion: 0.18
Nodes (20): collisions(), curIt(), dupMap(), exportList(), filtered(), flagsOf(), isBad(), keyLabel() (+12 more)

### Community 58 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 59 - "components.js"
Cohesion: 0.27
Nodes (7): 4. Inventaris komponen, collapse(), press(), select(), single(), slider(), tabs()

### Community 60 - "Mesin `hand-writing` (dulu "Coret")"
Cohesion: 0.18
Nodes (9): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Sumbu variasi (`axes`), WAJIB: memanggang dash, Glosarium (+1 more)

### Community 61 - "Pipeline ekspor"
Cohesion: 0.18
Nodes (10): 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Aturan wajib ekspor Canva (keputusan pemilik), Icon Composer, Penerapan per aplikasi (+2 more)

### Community 62 - "Rencana migrasi"
Cohesion: 0.20
Nodes (10): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 7: Skill dan rilis (+2 more)

### Community 63 - "3. Anatomi layar"
Cohesion: 0.25
Nodes (8): 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka, 3. Anatomi layar, Filter Bentuk (ADR-015)

### Community 64 - "Mesin `offset`"
Cohesion: 0.25
Nodes (7): Flag khusus, Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`)

### Community 65 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 66 - "jt"
Cohesion: 0.33
Nodes (6): jt(), pe(), R(), Ue(), Z(), Cara kerja

### Community 68 - "renderBins"
Cohesion: 0.40
Nodes (5): modPreview(), modPreviewAccent(), persist(), renderBins(), setChanged()

### Community 69 - "Mesin `classic` (Klasik)"
Cohesion: 0.40
Nodes (4): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Sumbu variasi (`axes`)

### Community 70 - "palettes.js"
Cohesion: 0.50
Nodes (3): ACCENT_OPTIONS, FILL_OPTIONS, LINE_OPTIONS

## Knowledge Gaps
- **9 isolated node(s):** `ADR-0017`, `ADR-0015`, `ADR-0017`, `ADR-0017`, `eslint` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 437 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `luNames`, `vendor-1.js`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `Diubah` (e.g. with `metadataCSV()` and `cuRoles()`) actually correct?**
  _`Diubah` has 26 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ADR-0017`, `ADR-0015`, `ADR-0017` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05204872646733112 - nodes in this community are weakly interconnected._
- **Why does `7. Persona Kombinasi` connect `At` to `compose`, `luNames`, `Langkah`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `createRenderer()` (e.g. with `dropMissing()` and `ensureManifestItem()`) actually correct?**
  _`createRenderer()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `template-icon-builder/src/main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._