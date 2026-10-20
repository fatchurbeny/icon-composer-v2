# Rencana Fase 2b: UI terpadu Icon Studio

Disusun 2026-10-18 setelah Fase 2 disetujui. Acuan: `docs/design/DESIGN-HANDOFF.md`, `docs/design/UI-RULES.md`, `docs/design/ui-kit.html`, artboard di `docs/design/reference/`.

## Konteks

Composer (IC 1.5.1) dan Template Icon Builder (TIB 1.6.0) digabung menjadi satu app `apps/icon-studio` dengan empat persona (ADR-013). Mesin dan ekspor sudah ada di `packages/` sejak Fase 2, jadi Fase 2b fokus pada:

- UI baru dari `packages/ui`,
- state dokumen,
- memindahkan logika app lama (bukan logika mesin) ke modul persona.

Kondisi sekarang:
- `apps/icon-studio/src/main.js` (88 baris) berisi kerangka statis.
- Routing hash dan `tests/e2e/ui-shell.spec.js` (ukuran kerangka) sudah ada.
- Belum ada data, persona, maupun penyimpanan.

## Keputusan pemilik (2026-10-18)

1. **Penyimpanan:** satu kunci `icon-studio-v1` dengan `schemaVersion`. Kunci ini menampung set Composer dan dokumen Builder. `DATA-MODEL.md` diperbarui mengikuti ini.
2. **Classic:** tiap persona memakai varian app asalnya.
   - Composer: varian IC (`solidV145: false`, bintang dekorasi aktif).
   - Builder: 1.4.5 (`solidV145: true`).
   - Golden kedua app tetap identik. Penyatuan diputuskan terpisah.
3. **Fitur fase berikutnya tidak ditampilkan.**
   - Kartu mesin: Klasik, Aksen, Offset, dan Hand-writing.
   - Panel Repetisi: hanya menghitung rakitan dobel dari `signature()` yang sudah ada.
   - Sticker (Fase 5) dan sidik jari (Fase 6) menyusul.
4. **Urutan:** per persona. Ika menyetujui tampilan tiap persona sebelum persona berikutnya dimulai.

## Prinsip

- **Keluaran mesin tidak berubah.** Ikon yang dirender Icon Studio harus identik dengan IC/TIB untuk item dan gaya yang sama. Ini dijaga golden baru (langkah 1).
- **App lama tetap hidup** sampai Fase 2b selesai, sebagai acuan golden. Keduanya baru dihapus atau dibekukan lewat keputusan terpisah.
- **Struktur kode:**

| Modul | Isi | Aturan |
|---|---|---|
| `apps/icon-studio/src/state/` | dokumen, seleksi, riwayat | tanpa DOM |
| `apps/icon-studio/src/personas/*.js` | render dan event tiap persona | memakai komponen `packages/ui` |
| `apps/icon-studio/src/shell.js` | kerangka, routing, tab dokumen | |

- **UI-RULES berlaku penuh:** hanya token dan kelas `.ic-*`, state lewat ARIA, perilaku lewat `data-ic`, ikon lewat `uiIcon()`. `npm run lint:ui` wajib lulus di setiap commit.
- **Logika app lama yang bukan UI** pindah ke modul state atau paket. Contohnya `normItem`, `applyFamily`, `flagsOf`, `importManifest`, `exportList`, dan `metaOf`. Logika ini tidak disalin ulang.

## Langkah

### 1. Fondasi state + golden render Icon Studio ✅

Selesai 2026-10-18. Catatan pelaksanaan:
- Warna bawaan gaya dan contoh manifest berada di `state/data/` (warna data mesin, dikecualikan `lint:ui`).
- Kait uji `window.__iconStudio` (baca-saja) dipasang di `main.js`.
- Golden `studio-golden.spec.js` (7 tes): set Composer `basic` dan `mixed` (artboard + tile objek utama), dokumen Builder `basic`, dan semua SVG ekspor Builder `mixed` dibandingkan langsung dengan ZIP legacy TIB.
- Batas yang diketahui: `decoStarFill` set Composer belum terjaga golden karena fixture belum memakai dekorasi bintang.


- `state/document.js`: model dokumen `{id, kind: "set" | "manifest", name, style, items, meta}`.
  - Fungsi `normItem` dan `normStyle` dipindah dari IC.
  - Fungsi `importManifest`, `toItem`, dan `normAcc` dipindah dari TIB.
  - Semua fungsi murni dan dites unit.
- `state/store.js`: simpan dan muat dari `icon-studio-v1` dengan `schemaVersion`. Semua akses dibungkus try/catch.
- `state/render.js`: satu pintu ke `packages/engines`.
  - Membangun `ctx` classic/accent sesuai jenis dokumen (set = varian IC, manifest = 1.4.5).
  - Membangun `createIconSources` dan `createLibraryShapes` sekali per app.
- **Golden:** `tests/e2e/studio-golden.spec.js` membuka `dist/icon-studio.html`, memuat fixture `basic` dan `mixed`, lalu membandingkan SVG per ikon dengan baseline IC/TIB yang sudah ada di `tests/golden/`.
  - Butuh `window.__studio` (hanya di build tes) atau atribut `data-svg` di halaman untuk membaca SVG.

### 2. Kerangka lengkap (shell) ✅ (menunggu tinjauan Ika)

Selesai 2026-10-18. Catatan pelaksanaan:
- Struktur: `src/shell.js`, `src/app-state.js`, `src/ui.js` (pembantu markup kit), `src/personas/{common,composer,builder,tinjau,kombinasi}.js`. Composer · Edit ada di `personas/composer.js`.
- Isi panel yang belum dibangun memakai `.ic-empty` dengan keterangan tahapnya. Kontrol konteks sudah tampil sesuai artboard, tetapi belum berefek sampai langkah persona masing-masing.
- Tombol "Muat set contoh" (PRESET IC) di panel Halaman set kosong, untuk meninjau kerangka dengan isi.
- Font Instrument Sans dan Geist Mono dimuat dari Google Fonts seperti `ui-kit.html`. Tanpa internet, jatuh ke `system-ui`.
- Uji screenshot (DESIGN-HANDOFF 9.3) dibatasi ke wilayah yang isinya sama dengan kit: bilah atas kiri dan tool rail. Wilayah lain di kit berisi data contoh sticker dan 5 mesin, jadi tidak bisa dibandingkan piksel. Ambang: < 2% piksel berbeda (toleransi kanal 24). Sebagai pembanding, wilayah studio berbeda 17,8%.
- Preview pane Claude memuat file sebagai `data:` URL: routing hash dan localStorage tidak berjalan di sana. Buka `dist/icon-studio/index.html` langsung di Chrome untuk meninjau.

**Butuh keputusan sebelum langkah 3–6 (UI-RULES "Menambah komponen"):** kit belum punya komponen untuk artboard edit 520 px + handle seleksi + filmstrip (Edit), grup kartu per slide (Builder), lembar kontak + uji 32 px (Tinjau), dan area drop manifest (Builder; sementara memakai `.ic-empty`). Setiap komponen baru perlu usulan, CSS di `packages/ui/components.css`, contoh di `ui-kit.html`, dan baris di DESIGN-HANDOFF bagian 4.


- Rapikan `main.js` menjadi `shell.js`. Isinya:
  - bilah atas: persona, mode tampilan, info dokumen, Ekspor;
  - bilah konteks per persona;
  - tool rail;
  - tab dokumen yang terhubung ke state;
  - studio dengan 2–3 panel;
  - bilah status.
- Routing: `#/composer`, `#/composer/edit/<id>`, `#/builder`, `#/tinjau`, `#/kombinasi`. Pindah persona tidak menghapus seleksi.
- Keadaan khusus (DESIGN-HANDOFF bagian 7): pustaka dimuat, pustaka gagal, set kosong, manifest belum diimpor.
- Tes:
  - `ui-shell.spec.js` diperluas dengan ukuran tiap persona;
  - kerangka Kombinasi diuji dengan `.ic-shell--left-studio`;
  - screenshot kerangka Composer · Set dibandingkan dengan kerangka contoh `ui-kit.html` (< 2% di luar kanvas).
- **Tinjauan Ika:** kerangka dan navigasi.

### 3. Persona Composer · Set ✅ (menunggu tinjauan Ika)

Selesai 2026-10-18. Catatan pelaksanaan:
- Komponen kit baru dipasang lebih dulu (usulan `docs/design/proposals/komponen-fase-2b.md`, disetujui).
- Logika set di `state/set-ops.js` (dites unit). Panel Pustaka di `personas/library-panel.js` dipakai lagi di Kombinasi.
- Tata letak studio: tab Gaya hanya berisi kartu mesin, tebal garis, celah, dan ujung (seperti artboard). Mode warna, aksen, dan efek ada di tab Warna. Skala per lapisan ada di tab Lapisan (seperti panel properti IC).
- Kartu Offset dan Hand-writing tampil tetapi nonaktif sampai UI Fase 3 dan 4.
- Filter Bentuk "Isi" memakai `analyzeLibraryIcon().hasBody` dan di-cache per kunci. Saat filter aktif, hasil dipindai bertahap ("40+ ikon").
- Tabler dan Hugeicons dimuat saat sumbernya dipilih. "Semua" hanya menampilkan pustaka yang sudah termuat.
- Belum ada: halaman saran (`.ic-page--ghost`, menunggu Kombinasi), warna per lapisan (langkah 4), undo (backlog), dan tombol Pool berwarna persona (kit hanya mengizinkan warna persona di 4 tempat, jadi dipakai `.ic-btn--block`).


- Kanvas `.ic-pagegrid`: satu `.ic-page` per ikon, `.ic-page--new`, dan flag `dobel` dari signature.
- Konteks:
  - Snap ke grid;
  - Patokan set (`applyFamily`, `saved` per keluarga);
  - Urut (Urutan set, Nama A–Z, Per flag);
  - Kolom.
- Studio:
  - **Gaya | Warna**: `.ic-engines` 4 mesin, slider parameter mesin aktif.
  - **Halaman | Lapisan | Pustaka | Pool**: panel Pustaka memakai `createIconSources`, seg sumber, pencarian, dan seg Bentuk (ADR-015).
  - **Repetisi | Riwayat**.
- Filter Bentuk "Isi" butuh `fillable` per ikon (DESIGN-HANDOFF 3.5). Nilainya dihitung dari `analyzeLibraryIcon().body.length > 0` lalu di-cache di `createLibraryShapes`. Tidak ada perubahan keluaran.
- **Tinjauan Ika** terhadap `artboard-main-*.png`.

### 4. Persona Composer · Edit ✅ (menunggu tinjauan Ika)

Selesai 2026-10-18. Catatan pelaksanaan:
- Kode di `personas/composer-edit.js` dan `state/edit-ops.js` (dites unit). Rumus kotak lapisan, rentang posisi, slot, dan reset dipindah dari editor IC 1.5.1.
- Seret hanya memperbarui gambar, kotak seleksi, dan tooltip selama digeser. Dokumen disimpan saat dilepas. Snap ke grid membulatkan ke 0,5 unit (seperti IC); tanpa snap ke 0,05.
- Handle kotak seleksi masih penanda visual. Ukuran diatur lewat Skala (berlaku untuk semua ikon di set, seperti IC).
- Warna garis/isi lapisan berlaku untuk seluruh set (`style.colors`, seperti IC), dan ini disebut di panel.
- Rute `#/composer/edit/<id>` mengikuti ikon yang dipilih di filmstrip atau Halaman (`history.replaceState`).
- Belum ada: unggah dekorasi SVG sendiri (`cleanSvg` + dialog; kit belum punya komponen dialog), "Celah knockout" per ikon (tidak ada padanannya di mesin classic/accent; tidak dipasang), undo (backlog), dan sumbu Variasi (classic/accent tidak punya).


- Artboard 520×520 dengan grid 8 unit, seleksi lapisan + handle, tooltip koordinat, filmstrip.
- Konteks:
  - kunci lapisan + Ganti;
  - `.ic-anchor` 3×3;
  - Skala, Isi, Celah knockout.
- Studio: Gaya, Lapisan | Transform | Pustaka, dan Halaman | Variasi | Riwayat (susunan setelah akordeon, lihat DESIGN-HANDOFF 3.2). Variasi diisi `engine.axes()`. Classic dan accent masih kosong, jadi tampil `.ic-empty`.
- Keyboard: panah 0,5 unit (Shift 2), Esc, Delete. Logika `getXY`/`setXY` dipindah dari IC.
- Undo/redo masih backlog. Panel Riwayat hanya menampilkan log perubahan sesi, tanpa tombol undo.
- **Tinjauan Ika** terhadap `artboard-edit-1600x1000.png`.

### 5. Persona Builder ✅ (menunggu tinjauan Ika)

Selesai 2026-10-18. Catatan pelaksanaan:
- Logika TIB tanpa DOM di `state/builder-ops.js`: kosakata (`exists`, `suggest`, `collisions`), `validateManifest`, `flagsOf`, `exportList`, `metaOf`, `finalManifest`, `buildExportFiles`. Template Resource Page di `state/data/export/resource-page.js`.
- Golden `studio-golden.spec.js`: isi ZIP Builder dibandingkan langsung dengan TIB 1.6.0 untuk `basic` (gaya A) dan `mixed` (X, A, B). Normalisasi hanya `exported_at` dan id mask `rp<uid>` di Resource Page (uid memakai angka acak).
- Kunci JSON `version` di manifest akhir ditulis sekali (TIB menulis dua kali); nilai dan urutan kunci sama.
- Perbedaan perilaku UI dari TIB (bukan keluaran): memilih Pratinjau tidak lagi mengubah centang gaya ekspor (artboard memisahkan Pratinjau dan panel Gaya ekspor). Posisi lapisan di Builder diatur lewat jangkar, tanpa seret di kanvas (handoff 3.3 tidak memintanya).
- Pengecualian `lint:ui` untuk `apps/icon-studio/src/state/data/export/`: font dan ukuran huruf di HTML ekspor adalah bagian keluaran golden, bukan UI.
- Panel studio yang tidak tumbuh dibatasi 34vh dan menggulir, supaya panel Ikon tetap terlihat di layar 900 px.
- Belum ada: dobel klik membuka ikon di Composer (perlu konversi item manifest ke set), Ratakan variasi (Fase 6), dan ekspor skill `deck-icon-slots` (Fase 7).


- Langkah Impor → Periksa → Ekspor.
  - Area drop manifest.
  - Contoh manifest diambil dari `SAMPLE` TIB.
- Kanvas: grup per slide, kartu ikon, cincin seleksi, `.ic-flag` dari `flagsOf`.
- Studio:
  - **Ikon | Manifest | Pustaka**: field id, nama EN/ID, objek, posisi, pengubah, kata kunci.
  - **Repetisi | Flag**.
  - **Gaya ekspor | Metadata**.
- Ekspor memakai jalur TIB yang sekarang sudah di paket: `directFillSvgFile`, `metadataCsv` (header tanpa kutip), `buildZip`.
- Golden: ZIP Builder dari Icon Studio dibandingkan dengan legacy TIB, memakai fixture `basic` dan `mixed`.
- **Tinjauan Ika** terhadap `artboard-builder-1600x1000.png`.

### 6. Persona Tinjau ✅ (menunggu tinjauan Ika)

Selesai 2026-10-18. Catatan pelaksanaan:
- Set Composer memakai `state/review-ops.js` (nama file, `exportSVG`, sprite, `metaOf`, `buildSetZipFiles`, `reviewChecks`). Template `pratinjau.html` dan LICENSES ada di `state/data/export/preview-sheet.js`.
- Dokumen Builder di Tinjau memakai `builder-ops.js`. Klik sel mengubah `on` (sama dengan Builder), dan unduhan memakai ekspor Builder. Metadata pack diatur di Builder.
- Golden: ZIP Composer Icon Studio dibandingkan langsung dengan IC 1.5.1 (fixture `mixed`). Hanya header `metadata.csv` yang berbeda (ADR-016).
- Pilihan tinjau (latar, ukuran, ikon yang dikeluarkan, format, mask) dan metadata Canva disimpan per dokumen (`doc.review`, `doc.meta.canva`). Migrasi `icon-composer-meta-v1` dikerjakan di langkah 8.
- **Temuan untuk Fase 5:** objek bawaan IC `ticket` memakai `stroke-dasharray` (garis sobekan tiket), sehingga `directFillSvgFile` menolaknya ("Stroke putus-putus belum didukung"). Ini juga melanggar aturan AGENTS.md "tidak ada stroke-dasharray di keluaran akhir". ZIP Composer saat ini masih SVG asli (sama dengan IC), jadi keluarannya belum berubah. Di Tinjau, sel ini diberi lencana "gagal direct fill" dan muncul di Pemeriksaan. Perlu keputusan: panggang dash `ticket` jadi geometri (seperti hand-writing) sebelum direct fill Composer dipasang di Fase 5.
- Belum ada: blokir unduhan bila pemeriksaan Canva gagal (IC tidak memblokir; menunggu direct fill Fase 5).


- Lembar kontak dengan latar (5 swatch), ukuran 128/64/32, nama file, tanda flag, dan Bandingkan SVG asli / Direct fill.
  - Mode Direct fill memakai `directFillSvgFile` untuk pratinjau saja.
  - Ekspor ZIP Composer tetap SVG asli sampai Fase 5 (ADR-011 dikerjakan di Fase 5).
- Klik ikon mengeluarkan atau memasukkan kembali ikon ke unduhan (`rOff` IC).
- Uji 32 px di latar terang dan gelap.
- Studio:
  - **Pemeriksaan**: maks 5 warna (`packColors`), dobel, ID unik.
  - **Metadata Canva**: dari `rMeta` IC.
  - **Isi ZIP**: pohon folder, Unduh ZIP, Sprite SVG.
- Golden: ZIP Composer dari Icon Studio dibandingkan dengan legacy IC (header CSV dikutip, ADR-016).
- **Tinjauan Ika** terhadap `artboard-tinjau-1600x1000.png`.

### 7. Persona Kombinasi ✅ (menunggu tinjauan Ika)

Selesai 2026-10-18. Catatan pelaksanaan:
- Logika di `state/combo-ops.js` (`comboItem` = batchItem IC, `comboMatrix`, `addCombos`, `setSkip`, `togglePool`), dites unit.
- Status sel memakai signature mesin aktif untuk "di set" dan `collisions` Builder untuk "sama dengan pustaka". Status `similar` menunggu sidik jari Fase 6, jadi "Lewati yang mirip" dan "Ratakan variasi setelah ditambah" masih nonaktif.
- Konteks memakai "Mode warna" (Ikuti set / Semua 3 mode, dari IC) di tempat "Warna pengubah" artboard, karena warna pengubah per ikon hanya ada di mesin sticker (Fase 5). Posisi pengubah: Bawaan, Paksa BL (opsi IC), Paksa TR, Paksa BR (artboard).
- Kepala baris/kolom memakai kelas tata letak lokal `studio-mhead` (kit belum punya kepala matriks). Isinya tombol: klik memilih atau melewati seluruh baris/kolom.
- Bug yang ditemukan dan diperbaiki: `skip` Kombinasi dan `off` Tinjau ikut terbagi antardokumen baru karena objek bawaan disalin dangkal.
- Belum ada: impor ikon kustom dari Figma (tab Kustom; tombol nonaktif), halaman saran di Composer · Set.


- `.ic-shell--left-studio`.
  - Kiri: studio Pustaka | Kustom | Riwayat.
  - Kanan: Pool | Hasil.
- `.ic-matrix` dengan `.ic-cell[data-state]`.
  - `on`, `skipped`, `exists`: dari signature.
  - `library`: nama sama dengan ikon pustaka.
  - `similar`: tidak dipakai sampai Fase 6.
- Logika kombinasi massal (`renderBatch`, `bSel`) dipindah dari IC.
- "Tambahkan <n> ke set" menulis ke dokumen set aktif.
- **Tinjauan Ika** terhadap `artboard-kombinasi-*.png`.

### 8. Migrasi localStorage + penutupan ✅

Selesai 2026-10-18. Catatan pelaksanaan:
- Migrasi 001 dan isi `icon-studio-v1` dicatat di `docs/DATA-MODEL.md` bagian 4.1–4.2. Dites unit (`studio-migration.test.js`, `studio-app-state.test.js`) dan e2e (`studio-migration.spec.js`).
- Pack tersimpan IC (`packs`) ikut dimigrasikan sebagai dokumen set terpisah, supaya tidak ada data yang hilang.
- Ikut diperbaiki: toast hilang saat kerangka dirender ulang.

**Pemeriksaan DESIGN-HANDOFF bagian 9:**

| Butir | Hasil |
|---|---|
| 1. `npm run lint:ui` | lulus |
| 2. Ukuran kerangka 1440×900 (56/42/30/34/28, rail 56, studio 330, studio kiri 300) | lulus untuk 4 persona (`ui-shell.spec.js`) |
| 3. Screenshot vs kerangka kit (< 2%) | lulus untuk bilah atas kiri dan tool rail. Wilayah lain berisi data contoh kit yang berbeda (lihat langkah 2) |
| 4. Keyboard: Tab, panah antar tab panel, dropdown | lulus (`ui-shell.spec.js`), plus Alt + panah urutan set, panah/Shift/Delete/Esc di Edit |
| 5. Tanpa teks UI berbahasa Inggris | diperiksa dengan pemindaian teks, label, dan placeholder di 4 persona. Yang tersisa hanya nama gaya, nama pustaka, kunci ikon, istilah Canva (Artist, ZIP, SVG, direct fill), dan judul "Resource Page" milik file ekspor |


- `state/migrations/001-from-legacy.js` membaca:
  - `icon-composer-aksen-v1` (fallback ke `icon-composer-v2`);
  - `template-icon-builder-aksen-v1`;
  - `icon-composer-meta-v1`.

  Data ditulis ke `icon-studio-v1` sekali. Data lama tidak dihapus.
- `tib-canva-brand-id` tetap dipakai apa adanya.
- Tes unit migrasi memakai fixture localStorage dari golden `mixed`.
- Dokumen yang diperbarui:
  - `DATA-MODEL.md` bagian 4: kunci `icon-studio-v1`;
  - `MIGRATION-PLAN.md`;
  - `CHANGELOG.md`;
  - `graphify update .`.
- Cek semua butir DESIGN-HANDOFF bagian 9: ukuran, screenshot, keyboard, dan teks tanpa bahasa Inggris.

## Tes per langkah

Setiap commit menjalankan:

```
npm test
npm run test:e2e
npm run test:golden
npm run lint
npm run build
```

Tes baru per langkah:

| Langkah | Tes |
|---|---|
| 1 | unit `state/*`, e2e `studio-golden` |
| 2 | `ui-shell` per persona, screenshot kerangka, keyboard tab panel |
| 3–7 | e2e alur persona (pilih, ubah, ekspor), golden ZIP untuk 5 dan 6 |
| 8 | unit migrasi |

## Di luar cakupan Fase 2b

- Sticker (Fase 5), sidik jari dan planner (Fase 6), direct fill di ZIP Composer (Fase 5).
- Penyatuan classic IC ke 1.4.5 (butuh keputusan terpisah).
- Undo/redo (backlog).
- Menghapus `apps/icon-composer` dan `apps/template-icon-builder`.
