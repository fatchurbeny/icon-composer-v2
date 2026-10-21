# Pengujian

## 1. Jenis tes

| Jenis | Alat | Lokasi | Menguji |
|---|---|---|---|
| Unit | Vitest + jsdom | `packages/*/test/*.test.js` | `rng`, `hash`, `concept`, `signature`, `adapt`, planner, migrasi data |
| Mesin | Vitest | `packages/engines/<id>/test/` | `compose` deterministik, tanpa atribut terlarang, jumlah warna |
| Golden | Playwright | `tests/golden/` | keluaran byte-per-byte (classic/accent) atau visual (mesin baru) terhadap legacy |
| Render | Playwright | `tests/e2e/render.spec.js` | semua mesin × fixture menghasilkan SVG valid (`DOMParser`) |
| Ekspor Canva | Playwright | `tests/e2e/export-canva.spec.js` | outline + direct fill lolos, ≤5 warna, selisih piksel kecil |
| Paritas offset | Playwright | `tests/e2e/offset-parity.spec.js` (`@golden`) | objek offset < 1% piksel dari legacy setelah diskalakan ke 84% |
| Paritas hand-writing | Playwright | `tests/e2e/hand-writing-parity.spec.js` (`@golden`) | 32 ikon Lucide/Tabler/Hugeicons: render 2.0.0 (dash dipanggang) < 1% piksel dari `compose` legacy coret-composer dengan dasharray |
| Mesin hand-writing | Vitest | `tests/unit/engines-hand-writing.test.js` | `compose` legacy dijalankan di `vm`: rotasi, blob, transform, siluet mask, dan pola dash per bagian sama; bentuk dasar → path, skala pathLength versi Skia |
| Paritas sticker | Playwright | `tests/e2e/sticker-parity.spec.js` (`@golden`) | sticker < 1,5% piksel dari `compose` legacy dengan bentuk yang sama (mode mask dan white); selisih versi pustaka dicatat sebagai anotasi |
| Data bentuk isi | Vitest | `tests/unit/fill-shapes.test.js` | `scripts/build-icon-data.mjs` menghasilkan `fill-shapes.json` yang sama persis, aturan bentuk isi Lucide/Tabler, pemuat malas (state, seed, format `{gz}` plugin build) |
| Pemuatan malas bentuk isi | Playwright | `tests/e2e/studio-sticker-lazy.spec.js` | app tanpa Sticker tidak memuat data; memilih Sticker memuat lalu merender bentuk isi benar; placeholder tidak bocor ke ZIP |
| Sidik jari | Playwright | `tests/e2e/fingerprint.spec.js` | pasangan fixture "kembar/mirip/beda" diklasifikasi benar |
| UI | Playwright | `tests/e2e/ic-*.spec.js`, `tib-*.spec.js` | alur utama: tambah ke set, ganti gaya, impor manifest, ekspor ZIP, reload |

Fungsi yang butuh `getBBox`, `getTotalLength`, atau canvas **harus** diuji di Playwright, bukan jsdom.

## 2. Fixture

```
tests/fixtures/
├─ vendor/          lucide UMD + tags, tabler nodes + icons.json, hugeicons esm, jszip (versi terkunci)
├─ sets/            set ikon per gaya untuk golden (JSON item kanonik)
├─ manifests/       series-a-icon-manifest.json, creative-workshop-planner.json (sudah ada); marketing-process-flow (belum ada, minta ke pemilik)
├─ outline-mask/    ikon uji outline + mask (sudah ada)
├─ legacy-storage/  isi localStorage dari tiap app lama, untuk tes migrasi
└─ repetition/      pasangan berlabel: twins.json, similar.json, distinct.json
```

CDN dicegat dengan `page.route("**/cdn.jsdelivr.net/**", …)` dan `cdnjs`, lalu dijawab dari `vendor/`. Tes tidak boleh butuh internet.

## 3. Golden test

1. `npm run golden:capture` membuka file `legacy/*.html`, menyuntikkan fixture lewat localStorage atau fungsi global, lalu menyimpan keluaran `compose` per item ke `tests/golden/icon-composer/` dan `tests/golden/template-icon-builder/` (nama folder = app legacy asal baseline).
2. `npm run test:golden` membangun Icon Studio, lalu menjalankan semua tes `@golden`: `studio-golden.spec.js` (render set Composer dan dokumen Builder classic/accent, set lintas pustaka Tabler/Hugeicons/Lucide dengan tile objek utama dan pengubah panel Bentuk, SVG dan ZIP Builder, ZIP Composer) serta uji paritas piksel offset, hand-writing, dan sticker. ZIP dibandingkan langsung dengan app legacy yang dibuka di Playwright.
3. classic/accent: harus identik string. Mesin baru: dibandingkan per piksel (rasterisasi 256 px). Ambang ada di `docs/engines/<id>.md`.
4. Kalau perubahan visual memang disengaja, perbarui golden dengan `npm run golden:update -- --engine <id>` dan **tulis alasannya** di CHANGELOG.

## 4. Sweep validitas

Tes lama (dari Project Knowledge 7): semua ikon Lucide sebagai objek dan sebagai pengubah, di semua gaya, di-parse dengan `DOMParser`. Hasil yang diharapkan: 0 tidak valid. Sweep ini berjalan di `npm run test:sweep` (lambat, tidak masuk `npm test`, wajib sebelum rilis).

## 5. Tes migrasi data

Untuk setiap kunci localStorage lama di `DATA-MODEL.md`:
- muat fixture dari `legacy-storage/`;
- jalankan app baru;
- pastikan jumlah ikon, nama, dan render (golden) sama;
- pastikan kunci lama tidak dihapus (pemilik bisa kembali ke versi lama).
