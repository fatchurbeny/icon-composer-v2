# Rencana migrasi

Setiap fase berakhir dengan build yang bisa dipakai pemilik. Jangan memulai fase berikutnya sebelum kriteria terima fase sebelumnya terpenuhi dan pemilik menyetujuinya.

Status: `[ ]` belum · `[~]` berjalan · `[x]` selesai.

---

## Fase 0: Fondasi repo

- [x] Inisialisasi git di `Icon-Composer-v2/`, `.gitignore` (node_modules, dist), `package.json` root dengan workspaces.
- [x] Pindahkan 5 file final dari root ke `legacy/` dan `legacy/style/` tanpa diubah. SHA-256-nya sudah tercatat di `docs/legacy/INVENTORY.md`, jadi cocokkan setelah dipindah.
- [x] Bahan pendukung (sumber build TIB, vendor outline, fixture manifest, skill, referensi) sudah disalin. Lihat `docs/legacy/INVENTORY.md`.
- [x] `packages/icon-sources/sources.json` (versi terkunci) dan `packages/ui` (kit UI) sudah ada.
- [x] Siapkan Vite + `vite-plugin-singlefile`, Vitest, Playwright, ESLint, Prettier.
- [x] `scripts/fetch-fixtures.mjs`: unduh pustaka ikon versi terkunci ke `tests/fixtures/vendor/` untuk tes offline (CDN dicegat lewat `page.route`).
- [x] Pasang graphify (lihat `KNOWLEDGE-GRAPH.md`), buat `.graphifyignore`, jalankan pemetaan pertama.

**Kriteria terima:** `npm test`, `npm run test:e2e` (kosong tapi jalan), dan `npm run build` lulus di Mac pemilik.

## Fase 1: Pindah apa adanya + golden test

- [ ] `scripts/golden-capture.mjs`: buka tiap file legacy di Playwright, render fixture (`tests/fixtures/sets/*.json`), dan simpan SVG ke `tests/golden/<app>/<gaya>/`.
- [ ] Pindahkan IC 1.5.1 ke `apps/icon-composer` dan TIB 1.6.0 ke `apps/template-icon-builder`. Pisahkan CSS/HTML/JS **tanpa mengubah logika**.
- [ ] `npm run test:golden`: hasil build baru harus identik byte-per-byte dengan golden.

**Kriteria terima:** golden identik untuk classic dan accent di kedua app. ZIP ekspor TIB sama isinya, kecuali timestamp `exported_at`.

## Fase 2: Ekstrak paket bersama

- [ ] `packages/core`: `rng`, `hash`, `partStr`, `dedupeAttrs`, pembulatan.
- [ ] `packages/icon-sources`: loader, `sources.json`, `concept()` (gabungan `variantsOf`, `MOD_SYN`, alias).
- [ ] `packages/engines`: registry, lalu classic dan accent sebagai mesin pertama. Bandingkan dua salinan classic (IC vs TIB) dan catat perbedaannya.
- [ ] `packages/export`: outline, direct fill, ZIP, metadata.
- [ ] Kedua app memakai paket di atas. Kode duplikat di app dihapus.

**Kriteria terima:** golden tetap identik. Tidak ada fungsi mesin yang masih terduplikasi di `apps/` (cek `graphify query "compose"`).

## Fase 2b: UI terpadu Icon Studio

Acuan: `docs/design/DESIGN-HANDOFF.md`, `docs/design/UI-RULES.md`, `docs/design/ui-kit.html`, dan artifact Claude Design "Icon Studio · Affinity Redesign".

- [ ] Bangun ulang `packages/ui/icons.js` dari `lucide-static@1.52.0` (versi terkunci).
- [ ] Tambah skrip `lint:ui` ke `package.json` root dan jalankan di CI lokal (`npm run lint`).
- [ ] Buat `apps/icon-studio`: kerangka `.ic-shell`, routing hash (`#/composer`, `#/composer/edit/<id>`, `#/builder`, `#/tinjau`, `#/kombinasi`), dan tab dokumen.
- [ ] Persona Composer · Set dan Composer · Edit, memindahkan logika dari `apps/icon-composer` tanpa mengubah keluaran mesin.
- [ ] Persona Builder, memindahkan logika dari `apps/template-icon-builder`.
- [ ] Persona Tinjau (lembar kontak, pemeriksaan, metadata, isi ZIP).
- [ ] Persona Kombinasi (pustaka lintas library + filter Bentuk, matriks, pool, hasil).
- [ ] `tests/e2e/ui-shell.spec.js`: ukuran kerangka tepat sesuai `DESIGN-HANDOFF.md` bagian 9.
- [ ] Migrasi localStorage dari kedua app lama ke `icon-studio-v1`.

**Kriteria terima:** semua butir `DESIGN-HANDOFF.md` bagian 9 lulus, golden test mesin tetap identik, dan pemilik menyetujui tampilan tiap persona dibandingkan dengan artboard.

## Fase 3: Mesin offset

- [ ] Port mesin ke kontrak (`docs/engines/offset.md`), termasuk normalisasi kanvas 120 → 48.
- [ ] UI IC: opsi gaya "Offset". Saat aktif, panel pengubah nonaktif dengan teks "Pengubah tidak tersedia pada style ini", dan Kombinasi massal hanya memakai daftar objek.
- [ ] Ukuran objek 84% dan penyesuaian dekorasi (ADR-012).
- [ ] UI TIB: pratinjau dan gaya ekspor "Offset".
- [ ] Impor set dari offset-composer lama.
- [ ] Lolos `export-canva.spec.js`.

**Kriteria terima:** objek offset berbeda < 1% piksel dari legacy setelah diskalakan ke 84%. Semua dekorasi berada di dalam viewBox. Direct fill valid dan tanpa stroke. Flag info muncul di TIB.

## Fase 4: Mesin hand-writing

- [ ] Port mesin, ganti nama di semua tempat.
- [ ] **Panggang dash jadi geometri** (wajib, lihat `docs/engines/hand-writing.md`).
- [ ] Samakan versi pustaka (Lucide 1.52.0, Tabler 3.49.0, Hugeicons 4.3.5).
- [ ] Impor set dari coret-composer lama, termasuk `family:"coret"` di `gaya.json`.

**Kriteria terima:** celah terlihat di file direct fill. Selisih piksel terhadap legacy < 1% pada fixture yang ikonnya ada di kedua versi pustaka.

## Fase 5: Mesin sticker

- [ ] `scripts/build-icon-data.mjs` menghasilkan bentuk isi (`fill-shapes.json`).
- [ ] Port mesin. Pemetaan slot 8 → 4. Warna per item lewat `engine.sticker`.
- [ ] Tambah lembar kontak `pratinjau.html` ke ekspor IC.
- [ ] Ekspor Canva IC memakai direct fill (semua stroke jadi outline) + folder opsional `svg-asli/` (ADR-011).
- [ ] Impor set dari sticker-composer lama.

**Kriteria terima:** ≤4 warna per SVG, direct fill valid, golden visual terhadap legacy < 1,5% (selisih versi pustaka dicatat).

## Fase 6: Anti-repetisi

- [ ] L1: `signature` di semua mesin, `signatureMap` menggantikan `dupMap`.
- [ ] L2: `packages/repetition/fingerprint.js` + fixture kalibrasi + `thresholds.json` per mesin.
- [ ] L3: planner + tombol Ratakan variasi, Acak ulang, Kunci variasi.
- [ ] Integrasi flag di `flagsOf` (TIB) dan Tinjau pack (IC).

**Kriteria terima:** semua kriteria di `ANTI-REPETITION.md` bagian 4 dan 5 lulus. Pemilik meninjau hasil kalibrasi ambang.

## Fase 7: Skill dan rilis

- [ ] Skill `deck-icon-slots` versi baru dengan tiga gaya tambahan.
- [ ] `TIB_VERSION` dan `IC_VERSION` naik. Rilis ke `releases/`, tag git.
- [ ] Perbarui `PROJECT-KNOWLEDGE.md` di Project claude.ai dengan ringkasan dari `docs/`.

---

## Keputusan pemilik atas pertanyaan terbuka (2026-10-17)

1. **Offset di TIB:** flag lama "Tanpa pengubah: sama dengan ikon pustaka" diganti `info` **"Pengubah tidak tersedia pada style ini"**. Flag ini tidak menghalangi ekspor. Lihat `docs/engines/offset.md`.
2. **Kata gaya di judul metadata:** pola "Icon-style", yaitu nama gaya + `Style Icon`. Rinciannya ada di `EXPORT-PIPELINE.md` bagian 4.
3. **Direct fill di Icon Composer:** dinyalakan. Ekspor khusus Canva wajib mengubah semua stroke menjadi outline, sehingga file hanya berisi bidang `fill` dan warnanya bisa diedit di Canva. Lihat `EXPORT-PIPELINE.md` bagian 1.
4. **Ukuran objek offset:** disamakan dengan classic (84% kanvas). Lihat `docs/engines/offset.md`.

## Backlog (di luar cakupan sekarang)

- Ledger sidik jari lintas pack dan lintas akun (hashtagben/chital), terhubung ke `canva-submit/.data/history.json`.
- Pengubah untuk offset.
- Undo/redo di Composer.
- Peran otomatis aksen yang lebih akurat (heuristik per objek bawaan).
