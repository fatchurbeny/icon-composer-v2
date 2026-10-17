# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Versi app dan versi mesin dicatat terpisah.

## Unreleased

### Ditambahkan
- Dokumentasi pengembangan awal: AGENTS.md, docs/, rencana migrasi ke monorepo Vite.
- Fondasi Fase 0: npm workspaces, Vite single-file, Vitest, Playwright, ESLint, Prettier, dan salinan legacy terverifikasi.
- Fixture pustaka ikon offline, Git/graphify proyek, serta checksum lima HTML fundamental.

### Diubah
- Gaya "Coret" berganti nama menjadi "Hand-writing" (`hand-writing`).
- Keputusan ADR-009 s.d. ADR-012: flag info offset, kata gaya "Icon-style", direct fill wajib di Composer, ukuran objek offset 84%.
- ADR-015: filter Bentuk "Isi" = bentuk tertutup untuk semua library.
- ADR-013/014: aplikasi terpadu Icon Studio (4 persona) dan UI kit `packages/ui` sebagai satu-satunya sumber gaya.

### Ditambahkan (desain)
- Render acuan 5 artboard (`docs/design/reference/`), sumber artboard (`docs/design/artboards/`), `scripts/render-artboards.py`, `packages/icon-sources/sources.json`, bahan pendukung dari folder lama (lihat `docs/legacy/INVENTORY.md`).
- `packages/ui` (tokens.css, components.css, components.js, icons.js), `docs/design/` (DESIGN-HANDOFF.md, UI-RULES.md, ui-kit.html + aset contoh), `scripts/lint-ui.mjs`, `scripts/build-ui-icons.mjs`.

## Basis sebelum migrasi (dibekukan di `legacy/`)

| File | Versi |
|---|---|
| icon-composer-aksen | 1.5.1 |
| template-icon-builder-aksen | 1.6.0 (mesin classic 1.4.5) |
| offset-composer | 1.0.1 |
| coret-composer (→ hand-writing) | 1.0.0 |
| sticker-composer | tanpa nomor versi (dianggap 1.0.0) |
