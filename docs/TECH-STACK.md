# Tech stack

## 1. Prinsip

- **Hasil akhir tetap satu file HTML statis per aplikasi.** Dibuka langsung di Chrome lewat `file://`, tanpa server.
- **Sumber kode modular.** Mesin gaya cukup ditulis sekali dan dipakai kedua aplikasi.
- **Tidak ada framework UI.** UI lama berbasis string template dan tetap seperti itu, hanya dipecah per modul.

## 2. Pilihan

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Runtime dev | Node.js 22 LTS, npm 10 | `engines` dikunci di `package.json` root |
| Bahasa | JavaScript ES2022 (ESM) + `// @ts-check` + JSDoc | TypeScript penuh boleh menyusul, tidak wajib |
| Build | Vite 6 + `vite-plugin-singlefile` | Menggantikan `asm.py` lama |
| Monorepo | npm workspaces | Tanpa Turborepo/Nx; cukup untuk 2 app |
| Unit test | Vitest + jsdom | Mesin, adapter, planner, signature |
| Browser test | Playwright (Chromium) | Render, `getBBox`, sidik jari canvas, ekspor ZIP |
| Lint/format | ESLint (flat config) + Prettier | Aturan ringan, tidak memblokir gaya lama |
| Versi | Git + tag per app | Menggantikan salinan file `-v1.4.x` |
| Peta konteks | graphify | Lihat `KNOWLEDGE-GRAPH.md` |

## 3. Struktur repo

```
Icon-Composer-v2/
├─ AGENTS.md  README.md  CHANGELOG.md  package.json  .graphifyignore
├─ packages/
│  ├─ ui/              tokens.css, components.css, components.js, icons.js (satu-satunya sumber gaya UI)
│  ├─ core/            rng, hash, svg helpers (partStr, dedupeAttrs), geometri bersama
│  ├─ icon-sources/    sources.json (versi terkunci), loader Lucide/Tabler/Hugeicons/cu, concept()
│  ├─ engines/         registry.js + classic/ accent/ offset/ hand-writing/ sticker/
│  ├─ repetition/      signature, fingerprint, planner variasi, flag
│  └─ export/          outline, direct fill, ZIP, metadata.csv, gaya.json
├─ apps/
│  └─ icon-studio/             aplikasi terpadu (Fase 2b): index.html + src/personas/*
├─ legacy/             file final lama, read-only (rujukan golden test)
│  └─ style/           offset, coret (hand-writing), sticker
├─ tests/
│  ├─ fixtures/        set ikon contoh, manifest contoh, data pustaka lokal
│  ├─ golden/          keluaran SVG rujukan
│  └─ e2e/             skenario Playwright
├─ scripts/            build-icon-data.mjs, golden-capture.mjs, release.mjs
├─ dist/               hasil build (tidak di-commit)
├─ releases/           file rilis bernomor versi (di-commit, tidak pernah ditimpa)
├─ graphify-out/       hasil graphify (di-commit)
└─ docs/
```

## 4. Dependensi pustaka ikon (terkunci)

Versi dikunci di `packages/icon-sources/sources.json`. Semua alat harus memakai versi yang sama.

| Pustaka | Versi | Dipakai sekarang oleh |
|---|---|---|
| `lucide` (UMD) + `lucide-static` tags | 1.52.0 | IC, TIB, offset |
| `@tabler/icons` nodes outline + icons.json | 3.49.0 | IC, TIB, offset |
| `@hugeicons/core-free-icons` | 4.3.5 | IC, TIB |
| `jszip` | 3.10.1 | semua |

Perbedaan yang harus diselesaikan saat migrasi:
- **Hand-writing (coret)** memakai Lucide 0.460.0, Tabler 3.31.0, dan Hugeicons `@1`. Samakan ke versi di atas.
- **Sticker** menanam data ikon langsung di HTML (`<script id="icondata">`, ±2 MB) termasuk bentuk isi siap pakai (`luf`, `tbf`). Data ini dipindah ke skrip build `scripts/build-icon-data.mjs` yang menghasilkan bentuk isi dari versi pustaka yang terkunci.

### Mode data ikon saat build

`ICON_DATA=cdn` (bawaan): file HTML memuat pustaka dari jsDelivr dengan versi terkunci. File kecil, butuh internet.

`ICON_DATA=inline`: semua data dibundel ke HTML. File besar (beberapa MB), bisa offline.

Kedua mode harus menghasilkan SVG yang identik.

## 5. Build

```bash
npm run build                      # semua app, ICON_DATA=cdn
ICON_DATA=inline npm run build     # versi offline
npm run release -- --app ic        # salin dist ke releases/icon-composer-vX.Y.Z.html + tag git
```

Konstanta versi (`TIB_VERSION`, `IC_VERSION`) diambil dari `package.json` app saat build, bukan ditulis tangan.
