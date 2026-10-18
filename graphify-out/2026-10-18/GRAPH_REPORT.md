# Graph Report - icon-composer-v2  (2026-10-18)

## Corpus Check
- 91 files · ~78,506 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, .css 4, .csv 2)

## Summary
- 945 nodes · 1906 edges · 59 communities
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 189 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50bced4e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- fetch-fixtures.mjs
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
- Rencana migrasi
- Model data
- Tech stack
- Unreleased
- icon-sources/index.js
- render
- Arsitektur
- compose
- r3
- renderLu
- flagsOf
- luNames
- At
- adRender
- doExport
- accentCtx
- renderDetail
- fileNames
- metaOf
- cn
- jn
- Peta konteks proyek dengan graphify
- Produk: tujuan, batasan, alur kerja
- README.md
- Langkah
- Aturan UI untuk agen (wajib dipatuhi)
- ce
- directFillSvgFile
- Pipeline ekspor
- engines/package.json
- normItem
- core/package.json
- export/package.json
- icon-sources/package.json
- AGENTS.md: instruksi untuk agen (Codex)
- icon-studio/package.json
- offset/index.js
- Mesin `classic` (Klasik)
- renderOverlay
- getXY
- packColors

## God Nodes (most connected - your core abstractions)
1. `r3()` - 28 edges
2. `Diubah` - 27 edges
3. `C()` - 27 edges
4. `2. Modul` - 21 edges
5. `Log keputusan (ADR)` - 19 edges
6. `directFillSvgFile()` - 17 edges
7. `partStr()` - 17 edges
8. `compose()` - 16 edges
9. `flagsOf()` - 15 edges
10. `doExport()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `2. Item kanonik` --references--> `normItem()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-composer/src/main.js
- `ADR-016 · 2026-10-18 · Header metadata.csv Composer dikutip` --references--> `metadataCsv()`  [INFERRED]
  docs/DECISIONS.md → packages/export/index.js
- `6. Persona Tinjau` --references--> `directFillSvgFile()`  [INFERRED]
  docs/plans/fase-2b.md → packages/export/pipeline.js
- `4. Judul metadata (pola "Icon-style")` --references--> `icon()`  [INFERRED]
  docs/EXPORT-PIPELINE.md → apps/icon-studio/src/main.js
- `2. Aturan keras` --references--> `directFillSvgFile()`  [INFERRED]
  AGENTS.md → packages/export/pipeline.js

## Import Cycles
- None detected.

## Communities (59 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (39): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, lucide-static, @playwright/test, prettier (+31 more)

### Community 1 - "fetch-fixtures.mjs"
Cohesion: 0.05
Nodes (40): ADR-0016, @playwright/test, NAMES, out, builds, dist, root, files (+32 more)

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
Nodes (36): ACC_OPTS, accCache, ANCHORS, CANVA_COLUMNS, closeCreatorMenu(), closeKwMenu(), closeLocaleMenu(), CU (+28 more)

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
Cohesion: 0.09
Nodes (26): icon(), panel(), personaBody(), personaNav(), personas, render(), route(), 0. Sumber kebenaran (urutan prioritas) (+18 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.13
Nodes (14): 2. Tiga lapis, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi, Kapan planner dijalankan (+6 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.11
Nodes (19): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+11 more)

### Community 13 - "doExport"
Cohesion: 0.26
Nodes (12): brandId(), doExport(), finalManifest(), meta(), packOf(), pathOf(), renderExport(), resourceHTML() (+4 more)

### Community 14 - "2. Modul"
Cohesion: 0.22
Nodes (14): 2. Modul, packColors(), svgColors(), buildZip(), metadataCsv(), STYLE_WORDS, styleWord(), createTagIndex() (+6 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "hand-writing/index.js"
Cohesion: 0.07
Nodes (40): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash, Fase 2: Ekstrak paket bersama ✅ (+32 more)

### Community 17 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 18 - "Rencana migrasi"
Cohesion: 0.20
Nodes (10): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 7: Skill dan rilis (+2 more)

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
Cohesion: 0.14
Nodes (17): CAT_ID, LU_CATS, TB_CAT_ID, TB_CATS, CUSTOM_ICONS, MAIN_ALIAS, MOD_ALIAS, MOD_SYN (+9 more)

### Community 23 - "render"
Cohesion: 0.15
Nodes (22): accentCtx(), accPanel(), boxesT(), classicCtx(), compose(), composeAccent(), cuRoles(), cycleRole() (+14 more)

### Community 24 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 25 - "compose"
Cohesion: 0.24
Nodes (18): classicCtx(), compose(), esc(), fillOf(), lineOf(), modeOf(), nameOf(), partThumb() (+10 more)

### Community 26 - "r3"
Cohesion: 0.09
Nodes (51): Diubah, Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Sumbu variasi (`axes`), partStr(), r3() (+43 more)

### Community 27 - "renderLu"
Cohesion: 0.40
Nodes (6): fillCats(), loadHugeicons(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 28 - "flagsOf"
Cohesion: 0.24
Nodes (13): collisions(), dupMap(), exportList(), filtered(), flagsOf(), isBad(), libName(), roleOk() (+5 more)

### Community 29 - "luNames"
Cohesion: 0.18
Nodes (17): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luIndex(), luNames() (+9 more)

### Community 30 - "At"
Cohesion: 0.17
Nodes (16): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+8 more)

### Community 31 - "adRender"
Cohesion: 0.33
Nodes (6): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent()

### Community 32 - "doExport"
Cohesion: 0.36
Nodes (8): applyManStyle(), importManifest(), kebab2(), normAcc(), sparkHome(), toItem(), 3.3 Builder · Periksa pack, 1. Fondasi state + golden render Icon Studio

### Community 33 - "accentCtx"
Cohesion: 0.24
Nodes (10): accentCtx(), composeAccent(), cycleRole(), decoMarkup(), luAnalyze(), mainInfo(), modPreview(), modPreviewAccent() (+2 more)

### Community 34 - "renderDetail"
Cohesion: 0.18
Nodes (19): curIt(), ensureItem(), ensureLucide(), esc(), keyLabel(), legend(), loadHugeicons(), loadTabler() (+11 more)

### Community 35 - "fileNames"
Cohesion: 0.38
Nodes (10): buildZip(), download(), exportSVG(), fileNames(), included(), metadataCSV(), renderReview(), sheetHTML() (+2 more)

### Community 36 - "metaOf"
Cohesion: 0.33
Nodes (7): baseNameEN(), libName(), libWords(), metaOf(), styleMeta(), syncMetaUI(), tagsOf()

### Community 37 - "cn"
Cohesion: 0.21
Nodes (12): cn(), Ft(), In(), jt(), Le(), _n(), pe(), R() (+4 more)

### Community 38 - "jn"
Cohesion: 0.13
Nodes (15): ae(), En(), gn(), Ht(), jn(), kn(), Nt(), Oe() (+7 more)

### Community 39 - "Peta konteks proyek dengan graphify"
Cohesion: 0.25
Nodes (7): 1. Instalasi (sekali, di Mac), 2. Membangun dan memperbarui graf, 3. Yang dipetakan dan yang tidak, 4. Cara agen memakai graf, 5. Konvensi kode agar graf mudah dibaca, 6. Hubungan dengan Project claude.ai, Peta konteks proyek dengan graphify

### Community 40 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 41 - "README.md"
Cohesion: 0.25
Nodes (4): Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 42 - "Langkah"
Cohesion: 0.17
Nodes (11): 2. Kerangka lengkap (shell), 3. Persona Composer · Set, 5. Persona Builder, 6. Persona Tinjau, 8. Migrasi localStorage + penutupan, Di luar cakupan Fase 2b, Keputusan pemilik (2026-10-18), Konteks (+3 more)

### Community 43 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.33
Nodes (5): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Selalu

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "directFillSvgFile"
Cohesion: 0.42
Nodes (11): dedupeAttrs(), cloneSingleShape(), colorKey(), directFillSvgFile(), flattenSvgMasks(), geometryArea(), geometryForColor(), geometryForShape() (+3 more)

### Community 46 - "Pipeline ekspor"
Cohesion: 0.18
Nodes (10): 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Aturan wajib ekspor Canva (keputusan pemilik), Icon Composer, Penerapan per aplikasi (+2 more)

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
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.25
Nodes (7): exports, ./catalog, ./custom, name, private, type, version

### Community 52 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 53 - "icon-studio/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 54 - "offset/index.js"
Cohesion: 0.09
Nodes (25): Z(), 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.4 Tinjau · Lembar kontak & ekspor, 3.5 Kombinasi · Matriks + pustaka, 3. Anatomi layar, Filter Bentuk (ADR-015) (+17 more)

### Community 55 - "Mesin `classic` (Klasik)"
Cohesion: 0.40
Nodes (4): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Sumbu variasi (`axes`)

### Community 56 - "renderOverlay"
Cohesion: 1.00
Nodes (3): boxes(), geom(), renderOverlay()

### Community 57 - "getXY"
Cohesion: 0.67
Nodes (3): getXY(), setXY(), 4. Persona Composer · Edit

### Community 58 - "packColors"
Cohesion: 0.67
Nodes (3): packColors(), prefMini(), renderStyleUI()

## Knowledge Gaps
- **4 isolated node(s):** `eslint`, `lucide-static`, `prettier`, `ADR-0016`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 384 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `on()` connect `At` to `luNames`, `offset/index.js`, `vendor-1.js`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `Diubah` (e.g. with `metadataCSV()` and `cuRoles()`) actually correct?**
  _`Diubah` has 26 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslint`, `lucide-static`, `prettier` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04830917874396135 - nodes in this community are weakly interconnected._
- **Why does `directFillSvgFile()` connect `directFillSvgFile` to `render-artboards.py`, `template-icon-builder/src/main.js`, `Produk: tujuan, batasan, alur kerja`, `Langkah`, `doExport`, `Pipeline ekspor`, `2. Modul`, `AGENTS.md: instruksi untuk agen (Codex)`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `2. Modul` (e.g. with `bboxUnion()` and `dedupeAttrs()`) actually correct?**
  _`2. Modul` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Should `fetch-fixtures.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.052600818234950324 - nodes in this community are weakly interconnected._