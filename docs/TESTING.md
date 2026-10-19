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

1. `npm run golden:capture` membuka file `legacy/*.html`, menyuntikkan fixture lewat localStorage atau fungsi global, lalu menyimpan keluaran `compose` per item.
2. `npm run test:golden` membangun app baru, merender fixture yang sama, dan membandingkan hasilnya.
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
