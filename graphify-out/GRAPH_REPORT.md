# Graph Report - icon-composer-v2  (2026-10-17)

## Corpus Check
- 46 files · ~26,557 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .csv 2, .css 1)

## Summary
- 327 nodes · 338 edges · 26 communities
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- package.json
- fetch-fixtures.mjs
- render-artboards.py
- README.md
- ui/package.json
- devDependencies
- components.js
- scripts
- icon-composer/package.json
- template-icon-builder/package.json
- Design handoff: Icon Studio (UI terpadu)
- 5. L3: perencana variasi
- Log keputusan (ADR)
- Rencana migrasi
- Pipeline ekspor
- AGENTS.md: instruksi untuk agen (Codex)
- Mesin `offset`
- Mesin `sticker`
- Arsitektur
- Model data
- Tech stack
- Unreleased
- Produk: tujuan, batasan, alur kerja
- Pengujian
- Mesin `accent` (Aksen bagian)
- Mesin `classic` (Klasik)

## God Nodes (most connected - your core abstractions)
1. `Log keputusan (ADR)` - 17 edges
2. `Rencana migrasi` - 12 edges
3. `Design handoff: Icon Studio (UI terpadu)` - 11 edges
4. `scripts` - 10 edges
5. `AGENTS.md: instruksi untuk agen (Codex)` - 9 edges
6. `4. Inventaris komponen` - 8 edges
7. `Mesin `hand-writing` (dulu "Coret")` - 8 edges
8. `Mesin `offset`` - 8 edges
9. `Mesin `sticker`` - 8 edges
10. `main()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `4. Inventaris komponen` --references--> `single()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → packages/ui/components.js
- `4. Inventaris komponen` --references--> `press()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → packages/ui/components.js
- `4. Inventaris komponen` --references--> `slider()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → packages/ui/components.js
- `4. Inventaris komponen` --references--> `number()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → packages/ui/components.js
- `4. Inventaris komponen` --references--> `collapse()`  [INFERRED]
  docs/design/DESIGN-HANDOFF.md → packages/ui/components.js

## Import Cycles
- None detected.

## Communities (26 total, 0 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.09
Nodes (17): engines, node, npm, name, private, type, version, workspaces (+9 more)

### Community 1 - "fetch-fixtures.mjs"
Cohesion: 0.08
Nodes (20): NAMES, out, builds, dist, root, files, outputDir, root (+12 more)

### Community 2 - "render-artboards.py"
Cohesion: 0.10
Nodes (11): Cara kerja, Masalah legacy yang diperbaiki, Mesin `hand-writing` (dulu "Coret"), Parameter gaya (berlaku untuk seluruh set), Parameter per item, Penggantian nama, Sumbu variasi (`axes`), WAJIB: memanggang dash (+3 more)

### Community 3 - "README.md"
Cohesion: 0.07
Nodes (23): Aturan UI untuk agen (wajib dipatuhi), Checklist sebelum menyatakan UI selesai, Dilarang, Menambah atau mengubah komponen, Selalu, 1. Antarmuka, 2. Aturan wajib, 3. `adapt`: dari item kanonik ke parameter mesin (+15 more)

### Community 4 - "ui/package.json"
Cohesion: 0.18
Nodes (10): description, exports, ./components.css, ./components.js, ./icons.js, ./tokens.css, files, name (+2 more)

### Community 5 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-prettier, @eslint/js, globals, @playwright/test, prettier, vite (+2 more)

### Community 6 - "components.js"
Cohesion: 0.31
Nodes (8): 4. Inventaris komponen, collapse(), number(), press(), select(), single(), slider(), tabs()

### Community 7 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, fixtures:fetch, format:check, legacy:verify, lint, lint:ui, test (+2 more)

### Community 8 - "icon-composer/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 9 - "template-icon-builder/package.json"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, type, version

### Community 10 - "Design handoff: Icon Studio (UI terpadu)"
Cohesion: 0.10
Nodes (20): 0. Sumber kebenaran (urutan prioritas), 1. Kerangka aplikasi (`.ic-shell`), 2. Persona dan routing, 3.1.1 Isi tab panel 2, 3.1 Composer · Set (ikhtisar halaman), 3.2 Composer · Edit ikon, 3.3 Builder · Periksa pack, 3.4 Tinjau · Lembar kontak & ekspor (+12 more)

### Community 11 - "5. L3: perencana variasi"
Cohesion: 0.11
Nodes (17): 1. Cakupan (keputusan pemilik), 2. Tiga lapis, 3. L1: signature, 4. L2: sidik jari visual, 5. L3: perencana variasi, 6. Data yang disimpan, Algoritma, Algoritma (greedy berimbang, deterministik) (+9 more)

### Community 12 - "Log keputusan (ADR)"
Cohesion: 0.12
Nodes (17): ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin, ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing", ADR-003 · 2026-10-17 · Cakupan repetisi, ADR-004 · 2026-10-17 · Offset tanpa pengubah, ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file, ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan, ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri, ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify (+9 more)

### Community 13 - "Rencana migrasi"
Cohesion: 0.17
Nodes (12): Backlog (di luar cakupan sekarang), Fase 0: Fondasi repo, Fase 1: Pindah apa adanya + golden test, Fase 2: Ekstrak paket bersama, Fase 2b: UI terpadu Icon Studio, Fase 3: Mesin offset, Fase 4: Mesin hand-writing, Fase 5: Mesin sticker (+4 more)

### Community 14 - "Pipeline ekspor"
Cohesion: 0.18
Nodes (10): 1. Tahapan, 2. Kompatibilitas per mesin, 3. Struktur ZIP, 4. Judul metadata (pola "Icon-style"), 5. Manifest dari Claude Design, Aturan wajib ekspor Canva (keputusan pemilik), Icon Composer, Penerapan per aplikasi (+2 more)

### Community 15 - "AGENTS.md: instruksi untuk agen (Codex)"
Cohesion: 0.20
Nodes (9): 0. Bahasa dan pemilik, 1. Sebelum mengerjakan tugas apa pun, 2. Aturan keras, 3. Perintah, 4. Definisi selesai, 5. Versi dan rilis, 6. Gaya kode, AGENTS.md: instruksi untuk agen (Codex) (+1 more)

### Community 16 - "Mesin `offset`"
Cohesion: 0.22
Nodes (8): Cara kerja, Flag khusus, Mesin `offset`, Normalisasi kanvas, Parameter gaya (berlaku untuk seluruh set), Parameter per item, Risiko, Sumbu variasi (`axes`)

### Community 17 - "Mesin `sticker`"
Cohesion: 0.22
Nodes (8): Batas warna Canva, Cara kerja, Data bentuk isi, Masalah legacy yang diperbaiki, Mesin `sticker`, Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 18 - "Arsitektur"
Cohesion: 0.25
Nodes (7): 1. Lapisan dan arah ketergantungan, 2. Modul, 3. Alur render satu ikon, 4. Alur repetisi, 5. Perbedaan dua aplikasi, 6. State dan penyimpanan, Arsitektur

### Community 19 - "Model data"
Cohesion: 0.25
Nodes (7): 1. Kunci ikon, 2. Item kanonik, 3. Gaya set, 4. localStorage, 5. Migrasi dari composer gaya lama, 6. Nama keluarga lama, Model data

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
Cohesion: 0.29
Nodes (6): 1. Jenis tes, 2. Fixture, 3. Golden test, 4. Sweep validitas, 5. Tes migrasi data, Pengujian

### Community 24 - "Mesin `accent` (Aksen bagian)"
Cohesion: 0.33
Nodes (5): Masalah yang diketahui, Mesin `accent` (Aksen bagian), Parameter gaya, Parameter per item, Sumbu variasi (`axes`)

### Community 25 - "Mesin `classic` (Klasik)"
Cohesion: 0.40
Nodes (4): Catatan migrasi, Mesin `classic` (Klasik), Parameter gaya, Sumbu variasi (`axes`)

## Knowledge Gaps
- **2 isolated node(s):** `eslint`, `prettier`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design handoff: Icon Studio (UI terpadu)` connect `Design handoff: Icon Studio (UI terpadu)` to `components.js`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **What connects `eslint`, `prettier` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09333333333333334 - nodes in this community are weakly interconnected._
- **Why does `Log keputusan (ADR)` connect `Log keputusan (ADR)` to `README.md`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `fetch-fixtures.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.082010582010582 - nodes in this community are weakly interconnected._
- **Should `render-artboards.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._
- **Should `README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._