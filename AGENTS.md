# AGENTS.md: instruksi untuk agen (Codex)

File ini dibaca setiap kali agen mulai bekerja di repo ini. Isinya aturan kerja. Konteks lengkap ada di `docs/`.

## 0. Bahasa dan pemilik

- Pemilik: Ika (Canva Creator, artis `hashtagben` dan `chital`).
- Komunikasi, teks UI, dan dokumentasi memakai **bahasa Indonesia**.
- Nama variabel, fungsi, file, dan commit memakai **bahasa Inggris**. Pengecualian: istilah domain yang sudah ada di kode lama (`deco`, `mod`, `slot`) tetap dipakai.

## 1. Sebelum mengerjakan tugas apa pun

1. Baca `graphify-out/GRAPH_REPORT.md` untuk peta struktur terkini (lihat `docs/KNOWLEDGE-GRAPH.md`).
2. Baca dokumen yang relevan:
   - Menyentuh mesin gaya → `docs/ENGINE-CONTRACT.md` dan `docs/engines/<id>.md`
   - Menyentuh deteksi repetisi atau variasi → `docs/ANTI-REPETITION.md`
   - Menyentuh ekspor ZIP/SVG → `docs/EXPORT-PIPELINE.md`
   - Menyentuh format item, gaya, manifest, atau localStorage → `docs/DATA-MODEL.md`
   - Menyentuh UI apa pun → `docs/design/UI-RULES.md` (wajib), `docs/design/DESIGN-HANDOFF.md`, dan buka `docs/design/ui-kit.html`
3. Cek `docs/MIGRATION-PLAN.md` untuk fase aktif. Kerjakan hanya tugas di fase itu, kecuali diminta lain.
4. Kalau ada kontradiksi antara kode dan dokumen, **berhenti dan laporkan**. Jangan memilih sendiri diam-diam.

## 2. Aturan keras

- **"Diskusi dulu" berarti jangan eksekusi.** Kalau pemilik menulis itu, jawab dengan analisis dan pertanyaan saja. Jangan mengubah file.
- **Jangan edit file di `legacy/`.** Isinya rujukan emas (golden reference) versi final sebelum migrasi.
- **Jangan edit file hasil build di `dist/`.** Ubah sumber di `packages/` atau `apps/`, lalu jalankan build.
- **Mesin harus murni.** `compose()` menerima data dan mengembalikan string SVG. Mesin tidak boleh menyentuh DOM UI, `localStorage`, atau `Math.random()`. Keacakan selalu lewat `rng(seed)` dari `packages/core`.
- **Warna SVG ditulis sebagai atribut langsung** (`fill="#..."`), bukan CSS variable atau class.
- **Maksimal 5 warna editable per SVG ekspor** (batas Canva). Setiap mesin wajib lolos `directFillSvgFile`.
- **Ekspor Canva hanya berisi bidang `fill`.** Semua stroke diubah menjadi outline, tanpa kombinasi fill + stroke, di Composer maupun Builder (lihat `docs/EXPORT-PIPELINE.md` bagian 1).
- **Tidak ada `stroke-dasharray` di keluaran akhir.** Pipeline outline mengabaikannya. Dash harus dipanggang jadi geometri (lihat `docs/engines/hand-writing.md`).
- **Versi pustaka ikon dikunci** di `packages/icon-sources/sources.json`. Jangan menaikkan versi tanpa ADR baru di `docs/DECISIONS.md`, karena sidik jari repetisi bergantung pada bentuk ikon.
- **Nama gaya "coret" sudah diganti "hand-writing".** Jangan pakai kata "coret" di kode atau UI baru. Data lama dengan `family: "coret"` dimigrasi otomatis.
- **Fitur yang pernah dibatalkan pemilik tidak dipasang lagi tanpa diminta.** Daftarnya ada di `docs/DECISIONS.md` bagian "Dibatalkan".
- **UI hanya dari `packages/ui`.** Warna, ukuran, dan radius lewat token `var(--ic-…)`. Komponen dari kelas `.ic-*` di `components.css`. State lewat atribut ARIA. Perilaku lewat `data-ic`. Ikon UI lewat `uiIcon()`. Jangan membuat kelas, warna, atau ikon UI baru di luar `packages/ui`. Aturan lengkap: `docs/design/UI-RULES.md`.

## 3. Perintah

```bash
npm install                 # sekali, di root
npm run dev -w apps/icon-studio      # aplikasi terpadu (setelah Fase 2b)
npm run dev -w apps/icon-composer    # port legacy (Fase 1–2, untuk golden test)
npm run dev -w apps/template-icon-builder
npm run build               # semua app → dist/*.html satu file
npm test                    # Vitest (unit, mesin, planner)
npm run test:e2e            # Playwright (render, sidik jari, ekspor, ukuran kerangka UI)
npm run test:golden         # paritas keluaran terhadap legacy/
npm run lint
npm run lint:ui             # node scripts/lint-ui.mjs, menegakkan docs/design/UI-RULES.md
```

Semua perintah di atas harus lulus sebelum tugas dinyatakan selesai.

## 4. Definisi selesai

Sebuah tugas selesai kalau:

1. Tes yang relevan ditambah atau diperbarui, dan `npm test` + `npm run test:e2e` lulus.
2. Kalau tugas menyentuh mesin classic/accent: `npm run test:golden` lulus tanpa selisih.
3. Dokumen yang terdampak ikut diperbarui di commit yang sama (kontrak, data model, spesifikasi mesin).
4. `CHANGELOG.md` mendapat satu baris di bagian `Unreleased`.
5. Kalau struktur modul berubah: jalankan `$graphify . --update` dan commit `graphify-out/`.
6. Kalau tugas menyentuh UI: `npm run lint:ui` lulus, dan checklist di `docs/design/UI-RULES.md` terpenuhi.

## 5. Versi dan rilis

- Versi app ada di `apps/*/package.json`. Versi mesin ada di field `version` tiap modul mesin.
- Rilis = git tag `ic-vX.Y.Z` atau `tib-vX.Y.Z`. Build rilis menghasilkan file bernomor versi, misalnya `dist/icon-composer-v1.6.0.html`.
- Pemilik ingin setiap versi tersimpan sebagai file baru. Jangan pernah menimpa file rilis lama di `releases/`.

## 6. Gaya kode

- JavaScript ES2022, modul ESM, `// @ts-check` + JSDoc di semua file `packages/`.
- Tidak ada framework UI. UI vanilla, dipecah per persona di `apps/icon-studio/src/personas/` (`composer.js`, `composer-edit.js`, `builder.js`, `tinjau.js`, `kombinasi.js`), memakai komponen `packages/ui`.
- Fungsi mesin diberi tag `@module` dan nama yang konsisten (`composeX`, `axesX`, `signatureX`), supaya graf graphify terbaca jelas.
- Komentar dan pesan UI dalam bahasa Indonesia, kalimat lengkap, tanpa em dash.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
