# Graph Report - icon-composer-v2  (2026-10-17)

## Corpus Check
- 67 files · ~80,342 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 3, .csv 2)

## Summary
- 860 nodes · 1500 edges · 53 communities
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dde05744`
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
- Rencana migrasi
- partStr
- C
- jt
- Mesin `sticker`
- doExport
- Model data
- Tech stack
- Unreleased
- Produk: tujuan, batasan, alur kerja
- Pengujian
- Mesin `accent` (Aksen bagian)
- r3
- mainInfo
- renderLu
- renderDetail
- luNames
- At
- r3
- doExport
- mainInfo
- runImport
- fileNames
- metaOf
- cn
- jn
- Peta konteks proyek dengan graphify
- Oe
- README.md
- adRender
- Aturan UI untuk agen (wajib dipatuhi)
- ce
- AGENTS.md: instruksi untuk agen (Codex)
- Mesin `offset`
- engines/package.json
- Arsitektur
- core/package.json
- export/package.json
- icon-sources/package.json
- packColors

## God Nodes (most connected - your core abstractions)
1. `r3()` - 30 edges
2. `C()` - 27 edges
3. `compose()` - 18 edges
4. `partStr()` - 17 edges
5. `Log keputusan (ADR)` - 17 edges
6. `directFillSvgFile()` - 15 edges
7. `mainInfo()` - 14 edges
8. `flagsOf()` - 13 edges
9. `renderDetail()` - 13 edges
10. `doExport()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Flag khusus` --references--> `isBad()`  [INFERRED]
  docs/engines/offset.md → apps/template-icon-builder/src/main.js
- `Sumbu variasi (`axes`)` --references--> `C()`  [INFERRED]
  docs/engines/hand-writing.md → apps/template-icon-builder/src/vendor-1.js
- `2. Aturan keras` --references--> `directFillSvgFile()`  [INFERRED]
  AGENTS.md → packages/export/pipeline.js
- `2. Batasan yang memandu semua keputusan` --references--> `directFillSvgFile()`  [INFERRED]
  docs/PRODUCT.md → packages/export/pipeline.js
- `2. Item kanonik` --references--> `normItem()`  [INFERRED]
  docs/DATA-MODEL.md → apps/icon-composer/src/main.js

## Import Cycles
- None detected.

## Communities (53 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (37): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, @playwright/test, prettier, vite (+29 more)

### Community 1 - "fetch-fixtures.mjs"
Cohesion: 0.06
Nodes (31): @playwright/test, NAMES, out, builds, dist, root, files, outputDir (+23 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.09
Nodes (15): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash (+7 more)

### Community 3 - "Kontrak mesin gaya"
Cohesion: 0.25
Nodes (7): 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin, 4. `signature`, 5. `axes`, 6. Menambah mesin baru, Kontrak mesin gaya

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "template-icon-builder/src/main.js"
Cohesion: 0.03
Nodes (55): ACC_OPTS, accCache, ANCHORS, CAT_ID, closeCreatorMenu(), closeKwMenu(), closeLocaleMenu(), CU (+47 more)

### Community 6 - "icon-composer/src/main.js"
Cohesion: 0.03
Nodes (56): ACC_OPTS, accCache, bOff, bSel, CAT_ID, copyText(), customs, DECOS (+48 more)

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
Nodes (24): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.4 Tinjau · Lembar kontak & ekspor, 3. Anatomi layar (+16 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.13
Nodes (14): 2. Tiga lapis, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik), Anti-repetisi, Kapan planner dijalankan (+6 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.12
Nodes (17): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+9 more)

### Community 13 - "Rencana migrasi"
Cohesion: 0.18
Nodes (11): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2b: UI terpadu Icon Studio, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker, Fase 6: Anti-repetisi (+3 more)

### Community 14 - "partStr"
Cohesion: 0.06
Nodes (47): solidLineDiagnostic(), 2. Modul, Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Sumbu variasi (`axes`), 1. Tahapan, 2. Kompatibilitas per mesin (+39 more)

### Community 15 - "C"
Cohesion: 0.10
Nodes (28): be(), bt(), C(), ci(), di(), ee(), F(), gi() (+20 more)

### Community 16 - "jt"
Cohesion: 0.33
Nodes (6): jt(), pe(), R(), Ue(), Z(), Cara kerja

### Community 17 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 18 - "doExport"
Cohesion: 0.17
Nodes (17): brandId(), csvCell(), doExport(), exportList(), finalManifest(), loadTags(), meta(), packOf() (+9 more)

### Community 19 - "Model data"
Cohesion: 0.29
Nodes (6): 1. Kunci ikon, 3. Gaya set, 4. localStorage, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data

### Community 20 - "Tech stack"
Cohesion: 0.25
Nodes (7): 1. Prinsip, 2. Pilihan, 3. Struktur repo, 4. Dependensi pustaka ikon (terkunci), 5. Build, Mode data ikon saat build, Tech stack

### Community 21 - "Unreleased"
Cohesion: 0.29
Nodes (6): Basis sebelum migrasi (dibekukan di `legacy/`), Changelog, Ditambahkan, Ditambahkan (desain), Diubah, Unreleased

### Community 22 - "Produk: tujuan, batasan, alur kerja"
Cohesion: 0.29
Nodes (6): 1. Tujuan bisnis, 2. Batasan yang memandu semua keputusan, 3. Alur kerja end-to-end, 4. Pengguna, 5. Di luar cakupan (saat ini), Produk: tujuan, batasan, alur kerja

### Community 23 - "Pengujian"
Cohesion: 0.33
Nodes (5): 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 24 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.33
Nodes (5): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 25 - "r3"
Cohesion: 0.13
Nodes (32): batchItem(), blankItem(), boxes(), compose(), composeAccent(), decoAccent(), decoMarkup(), ensureLucide() (+24 more)

### Community 26 - "mainInfo"
Cohesion: 0.10
Nodes (26): accPanel(), anchoredModifierGeometry(), autoRoles(), bbOf(), cuRoles(), cycleRole(), inBB(), inside() (+18 more)

### Community 27 - "renderLu"
Cohesion: 0.50
Nodes (5): fillCats(), loadTabler(), luList(), quickHasBody(), renderLu()

### Community 28 - "renderDetail"
Cohesion: 0.19
Nodes (21): collisions(), curIt(), dupMap(), esc(), filtered(), flagsOf(), isBad(), keyLabel() (+13 more)

### Community 29 - "luNames"
Cohesion: 0.18
Nodes (17): cuNames(), exists(), exportSkill(), hgIndex(), hgNames(), lev(), luNames(), pickList() (+9 more)

### Community 30 - "At"
Cohesion: 0.17
Nodes (16): At(), bn(), De(), dn(), gt(), ir(), mn(), nr() (+8 more)

### Community 31 - "r3"
Cohesion: 0.32
Nodes (12): boxesT(), compose(), composeAccent(), decoAccent(), decoMarkup(), fillOf(), geom(), lineOf() (+4 more)

### Community 32 - "doExport"
Cohesion: 0.33
Nodes (7): applyManStyle(), importManifest(), kebab2(), normAcc(), sparkHome(), toItem(), 3.3 Builder · Periksa pack

### Community 33 - "mainInfo"
Cohesion: 0.15
Nodes (17): autoRoles(), bbOf(), cycleRole(), inBB(), inside(), isClosed(), luAnalyze(), luPartSvg() (+9 more)

### Community 34 - "runImport"
Cohesion: 0.18
Nodes (14): ensureItem(), ensureLucide(), hgAttrs(), kebab(), loadHugeicons(), loadTabler(), luIndex(), luLabel() (+6 more)

### Community 35 - "fileNames"
Cohesion: 0.23
Nodes (17): buildZip(), csvCell(), download(), esc(), exportSVG(), fileNames(), included(), loadTags() (+9 more)

### Community 36 - "metaOf"
Cohesion: 0.29
Nodes (8): baseNameEN(), libName(), libWords(), metaOf(), styleMeta(), tagsOf(), titleCase(), trID()

### Community 37 - "cn"
Cohesion: 0.36
Nodes (8): cn(), Ft(), In(), Le(), _n(), Vt(), xn(), Zt()

### Community 38 - "jn"
Cohesion: 0.25
Nodes (8): En(), gn(), Ht(), jn(), kn(), Nt(), tr(), zn()

### Community 39 - "Peta konteks proyek dengan graphify"
Cohesion: 0.25
Nodes (7): 1. Instalasi (sekali, di Mac), 2. Membangun dan memperbarui graf, 3. Yang dipetakan dan yang tidak, 4. Cara agen memakai graf, 5. Konvensi kode agar graf mudah dibaca, 6. Hubungan dengan Project claude.ai, Peta konteks proyek dengan graphify

### Community 40 - "Oe"
Cohesion: 0.29
Nodes (7): ae(), Oe(), pn(), rr(), sr(), We(), xe()

### Community 41 - "README.md"
Cohesion: 0.25
Nodes (4): Icon-Composer v2, Lisensi pustaka ikon, Mulai, Peta dokumentasi

### Community 42 - "adRender"
Cohesion: 0.33
Nodes (6): adLoad(), adRender(), adShow(), cleanSvg(), clone(), setCurrent()

### Community 43 - "Aturan UI untuk agen (wajib dipatuhi)"
Cohesion: 0.33
Nodes (5): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Selalu

### Community 44 - "ce"
Cohesion: 0.40
Nodes (5): ce(), ln(), Sn(), St(), Te()

### Community 45 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.22
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 46 - "Mesin `offset`"
Cohesion: 0.25
Nodes (7): Flag khusus, Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`)

### Community 47 - "engines/package.json"
Cohesion: 0.25
Nodes (7): exports, ./accent, ./classic, name, private, type, version

### Community 48 - "Arsitektur"
Cohesion: 0.29
Nodes (6): 1. Lapisan dan arah ketergantungan, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 49 - "core/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 50 - "export/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 51 - "icon-sources/package.json"
Cohesion: 0.33
Nodes (5): exports, name, private, type, version

### Community 52 - "packColors"
Cohesion: 0.50
Nodes (4): packColors(), prefMini(), renderStyleUI(), svgColors()

## Knowledge Gaps
- **2 isolated node(s):** `eslint`, `prettier`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 388 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `package.json` to `partStr`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `partStr()` (e.g. with `2. Modul` and `Catatan migrasi`) actually correct?**
  _`partStr()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslint`, `prettier` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05094130675526024 - nodes in this community are weakly interconnected._
- **Why does `on()` connect `At` to `luNames`, `vendor-1.js`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Should `fetch-fixtures.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0647342995169082 - nodes in this community are weakly interconnected._
- **Why does `dedupeAttrs()` connect `partStr` to `doExport`, `template-icon-builder/src/main.js`, `icon-composer/src/main.js`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._