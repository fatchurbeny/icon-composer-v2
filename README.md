# Icon-Composer v2

Rangkaian alat untuk membuat paket ikon unik yang dijual sebagai element Canva dan dipasangkan dengan template presentasi.

Repo ini menyatukan dua aplikasi lama dan lima gaya ikon dalam satu aplikasi, **Icon Studio** (`apps/icon-studio`):

| Persona | Fungsi | Basis legacy |
|---|---|---|
| **Composer** (Set, Edit, Kombinasi, Tinjau) | Editor ikon manual: set, kombinasi massal, tinjau pack, ekspor ZIP | `legacy/icon-composer-aksen-v1.5.1.html` |
| **Builder** | Manifest dari deck Claude Design → pack ikon + metadata Canva | `legacy/template-icon-builder-aksen-v1.6.0.html` |

| Gaya (mesin) | id | Asal |
|---|---|---|
| Klasik | `classic` | sudah ada di IC/TIB |
| Aksen bagian | `accent` | sudah ada di IC/TIB |
| Offset | `offset` | `legacy/style/offset-composer-v1.0.1.html` |
| Hand-writing | `hand-writing` | `legacy/style/coret-composer-v1.0.0.html` (dulu "Coret") |
| Sticker | `sticker` | `legacy/style/sticker-composer.html` |

Hasil build tetap **satu file HTML**, dibuka langsung di Chrome tanpa server.

## Mulai

```bash
npm install
npm run dev -w apps/icon-studio
npm run build        # → dist/icon-studio/index.html
```

## Peta dokumentasi

| Dokumen | Isi |
|---|---|
| [AGENTS.md](AGENTS.md) | Aturan kerja untuk agen (Codex). Baca pertama. |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Tujuan bisnis, batasan Canva, alur kerja end-to-end |
| [docs/TECH-STACK.md](docs/TECH-STACK.md) | Stack, struktur repo, build, dependensi terkunci |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Modul, alur data, batas tanggung jawab |
| [docs/ENGINE-CONTRACT.md](docs/ENGINE-CONTRACT.md) | Antarmuka wajib setiap mesin gaya |
| [docs/engines/](docs/engines/) | Spesifikasi per mesin: classic, accent, offset, hand-writing, sticker |
| [docs/ANTI-REPETITION.md](docs/ANTI-REPETITION.md) | Deteksi repetisi dan perencana variasi |
| [docs/EXPORT-PIPELINE.md](docs/EXPORT-PIPELINE.md) | SVG → outline → direct fill → ZIP + metadata |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Item, gaya, manifest, gaya.json, localStorage, migrasi |
| [docs/MIGRATION-PLAN.md](docs/MIGRATION-PLAN.md) | Fase kerja, tugas, kriteria terima |
| [docs/TESTING.md](docs/TESTING.md) | Strategi tes, fixture, golden test |
| [docs/KNOWLEDGE-GRAPH.md](docs/KNOWLEDGE-GRAPH.md) | Peta konteks proyek dengan graphify |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Log keputusan (ADR) dan fitur yang dibatalkan |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | Istilah Indonesia ↔ nama di kode |
| [docs/legacy/INVENTORY.md](docs/legacy/INVENTORY.md) | Inventaris file lama dan pemetaannya ke modul baru |
| [docs/design/DESIGN-HANDOFF.md](docs/design/DESIGN-HANDOFF.md) | Serah terima desain UI terpadu: kerangka, persona, anatomi layar, komponen |
| [docs/design/UI-RULES.md](docs/design/UI-RULES.md) | Aturan UI wajib untuk agen + `npm run lint:ui` |
| [docs/design/ui-kit.html](docs/design/ui-kit.html) | Galeri komponen dan contoh kerangka (buka di Chrome) |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan |

## Lisensi pustaka ikon

Lucide (ISC), Tabler Icons (MIT), Hugeicons Free (MIT). Ikon merek Tabler tidak disertakan. Paket Hugeicons Pro tidak digunakan.
