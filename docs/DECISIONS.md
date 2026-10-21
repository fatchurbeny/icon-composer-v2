# Log keputusan (ADR)

Format: satu entri per keputusan, terbaru di bawah. Entri tidak dihapus. Kalau sebuah keputusan dibatalkan, tambahkan entri baru yang merujuk entri lama.

---

### ADR-001 · 2026-10-17 · Gaya baru digabung ke IC dan TIB lewat registry mesin
**Konteks:** offset, coret, dan sticker adalah composer terpisah dengan model data dan kanvas berbeda. IC dan TIB sudah punya sistem keluarga (`style.family`, `applyFamily`).
**Keputusan:** setiap gaya menjadi mesin dengan kontrak yang sama (`ENGINE-CONTRACT.md`), dipakai kedua app lewat registry.
**Akibat:** kode mesin ditulis sekali. Item lama tetap memakai model IC, dan data khusus mesin masuk ke `item.engine.<id>`.

### ADR-002 · 2026-10-17 · "Coret" berganti nama menjadi "Hand-writing"
**Keputusan pemilik.** Id `hand-writing`, label "Hand-writing". Data lama `family:"coret"` dimigrasi otomatis.

### ADR-003 · 2026-10-17 · Cakupan repetisi
**Keputusan pemilik:**
- Composer: repetisi diperiksa di dalam satu gaya.
- Template Icon Builder: repetisi diperiksa di dalam satu pack.
- Konsep yang sama di gaya berbeda adalah varian sah.

**Akibat:** signature diawali id mesin. Riwayat lintas pack masuk backlog.

### ADR-004 · 2026-10-17 · Offset tanpa pengubah
**Keputusan pemilik.** `supports.mod = false`. Field `mod` tetap disimpan tetapi tidak dirender. Signature offset hanya memakai objek utama.

### ADR-005 · 2026-10-17 · Stack: monorepo Vite, keluaran tetap HTML satu file
**Konteks:** `asm.py` + salinan file bernomor versi tidak cukup untuk 5 mesin di 2 app.
**Keputusan:** npm workspaces + Vite + `vite-plugin-singlefile`, Vitest, Playwright, git dengan tag. UI tetap vanilla.
**Akibat:** cara pakai bagi pemilik tidak berubah (buka file HTML di Chrome).

### ADR-006 · 2026-10-17 · Versi pustaka ikon dikunci dan diseragamkan
Lucide 1.52.0, Tabler 3.49.0, Hugeicons 4.3.5, JSZip 3.10.1. Alasannya, sidik jari repetisi dan golden test bergantung pada bentuk ikon yang stabil. Menaikkan versi butuh ADR baru dan pembaruan golden.

### ADR-007 · 2026-10-17 · Dash hand-writing dipanggang jadi geometri
**Konteks:** `IconOutline` di pipeline ekspor Canva mengabaikan `stroke-dasharray`.
**Keputusan:** mesin hand-writing menghasilkan potongan path nyata, bukan dasharray.

### ADR-008 · 2026-10-17 · Dokumentasi untuk agen + graphify
`AGENTS.md` berisi aturan kerja, `docs/` berisi spesifikasi, `graphify-out/` berisi peta struktur yang di-commit. Agen membaca `GRAPH_REPORT.md` di awal setiap tugas.

### ADR-009 · 2026-10-17 · Offset tanpa pengubah memberi flag info
**Keputusan pemilik.** Flag "Tanpa pengubah: sama dengan ikon pustaka" diganti `info` "Pengubah tidak tersedia pada style ini". Flag ini tidak menghalangi ekspor.

### ADR-010 · 2026-10-17 · Kata gaya judul metadata berpola "Icon-style"
**Keputusan pemilik.** Gaya baru ditulis sebagai `<Gaya> Style Icon` (EN) dan `gaya <gaya>` (ID). Judul classic dan accent tidak berubah.

### ADR-011 · 2026-10-17 · Direct fill wajib di Composer dan Builder
**Keputusan pemilik.** Ekspor Canva mengubah semua stroke menjadi outline, sehingga file hanya berisi bidang `fill` dan warnanya editable di Canva. Ini menggantikan status "ditunda" untuk Composer. SVG asli dengan stroke tetap bisa diekspor ke folder terpisah `svg-asli/`.

### ADR-012 · 2026-10-17 · Ukuran objek offset sama dengan classic
**Keputusan pemilik.** Objek offset 84% kanvas (legacy 60%). Dekorasi offset diperkecil dan dipindah supaya tetap di dalam viewBox.

### ADR-013 · 2026-10-17 · Satu aplikasi Icon Studio dengan empat persona
**Konteks:** pemilik meminta Composer dan Template Icon Builder digabung menjadi satu halaman editor seperti aplikasi Affinity.
**Keputusan:** satu app `apps/icon-studio` dengan persona Composer, Builder, Tinjau, dan Kombinasi (routing hash). Hasil build tetap satu file HTML. Desain acuan ada di artifact Claude Design "Icon Studio · Affinity Redesign".

### ADR-014 · 2026-10-17 · UI kit sebagai satu-satunya sumber gaya
`packages/ui` (token, komponen CSS, perilaku `data-ic`, ikon Lucide) wajib dipakai untuk semua UI, ditegakkan `scripts/lint-ui.mjs`. State komponen lewat atribut ARIA. Teks meta kecil memakai minimum `#9A9A9A` demi kontras AA, menggantikan abu yang lebih gelap di artboard.

### ADR-015 · 2026-10-17 · Filter Bentuk "Isi" = bentuk tertutup
**Keputusan pemilik.** Di panel Pustaka, "Isi" berarti ikon yang punya bentuk tertutup (body) yang bisa diwarnai, dihitung per ikon untuk semua library (Lucide, Tabler, Hugeicons, Kustom) oleh `engines/shared.analyzeParts`. "Garis" berarti ikon tanpa bentuk tertutup. Varian "filled" bawaan Tabler tidak dipakai.

### ADR-016 · 2026-10-18 · Header metadata.csv Composer dikutip
**Keputusan pemilik.** `metadata.csv` Icon Composer dibuat oleh `metadataCsv` di `packages/export`, sehingga header ikut dikutip (`"filename","title",...`), sama seperti baris data. Legacy 1.5.1 menulis header tanpa kutip. Isi nilai tidak berubah, dan pembaca CSV standar membaca keduanya sama. Golden ZIP Composer membandingkan dengan legacy setelah header legacy dikutip. Header `metadata.csv` dan `metadata-internal.csv` Builder belum diubah (tetap seperti legacy 1.6.0).

### ADR-017 · 2026-10-18 · Keputusan awal Fase 2b
**Keputusan pemilik.**
1. Icon Studio menyimpan semua dokumen (set Composer dan dokumen Builder) di satu kunci localStorage `icon-studio-v1` dengan `schemaVersion`. Kunci app lama hanya dibaca sekali untuk migrasi dan tidak dihapus.
2. Persona Composer memakai varian classic IC (`solidV145: false`, bintang dekorasi aktif). Persona Builder memakai classic 1.4.5 (`solidV145: true`). Penyatuan diputuskan terpisah.
3. UI hanya menampilkan fitur yang sudah ada: empat kartu mesin (Klasik, Aksen, Offset, Hand-writing), dan panel Repetisi berbasis signature. Sticker dan sidik jari menyusul di Fase 5 dan 6.
4. Fase 2b dikerjakan per persona. Pemilik menyetujui tampilan tiap persona sebelum persona berikutnya dimulai.

Rencana kerja: `docs/plans/fase-2b.md`.

### ADR-018 · 2026-10-20 · Keputusan teknis Fase 4 (hand-writing)
**Keputusan teknis (penanggung jawab: Beny), mengikuti pola Fase 3.**
1. **Skala `pathLength` versi Skia.** Dash dipanggang (ADR-007) dengan pola `pathLength="100"` yang diskalakan memakai panjang path versi Skia (`SkContourMeasure`, toleransi 0,5, busur sebagai conic), bukan panjang geometri sebenarnya, karena begitulah Chromium merender legacy. Celah jatuh di posisi yang sama dengan coret-composer 1.0.0 (paritas 32 ikon maks 0,18%; dengan panjang geometris 0,84%). Rincian: `docs/engines/hand-writing.md`.
2. **Migrasi otomatis `003-from-hand-writing`.** Set di `coret-composer-v1` diimpor sekali saat boot, seperti `002-from-offset` (menggantikan catatan "impor opsional lewat menu" untuk coret di `DATA-MODEL.md`). `gaya.json` `family:"coret"` bisa ditempel atau diseret di area impor.
3. **Builder mode `H`.** Folder `hand-writing/`, kata gaya "Hand-writing Style" (ADR-010). Tanpa pengubah tidak diberi flag `err`, sama dengan offset (ADR-009): goresan tangan sudah membedakan ikon dari ikon pustaka. Tabrakan nama objek + pengubah dengan ikon pustaka tetap `err`, karena pengubah dirender.
4. **Objek bawaan IC/TIB tidak didukung** (`builtinMains:false`): SVG kosong + flag `err`; pengubah bawaan `warn` dan tidak dirender.

### ADR-019 · 2026-10-20 · Mesin sticker dan direct fill di ZIP Composer (Fase 5)
**Konteks:** Fase 5 memindahkan sticker-composer ke kontrak mesin dan menyalakan direct fill IC (ADR-011).
**Keputusan teknis Fase 5** (menunggu tinjauan Beny; butir 2 dan 5 menunggu keputusan pemilik):
1. Mesin `sticker` 1.1.0 menghitung di kanvas 64 legacy dan mengeluarkan viewBox 48. Mode `mask` memotong setiap bagian dengan siluet bagian di atasnya, supaya direct fill satu path per warna tidak bergantung urutan tumpukan.
2. Bentuk isi dibangun `scripts/build-icon-data.mjs` ke `fill-shapes.json`. Fallback Tabler memakai deteksi titik ujung karena Tabler 3.4x tidak lagi menulis `z`; Lucide tetap aturan legacy (hanya path ber-`z`) sampai pemilik memutuskan (pertanyaan terbuka di `engines/sticker.md`).
3. Ikon tanpa bentuk isi memakai `plate` (lingkaran), sesuai spesifikasi.
4. SVG di akar ZIP Composer selalu direct fill; SVG asli ke `svg-asli/` (opsional). `stroke-dasharray` objek bawaan (`ticket`) dipanggang jadi geometri di jalur ekspor (`outlineSvgFile`), bukan di mesin, supaya golden render classic tetap identik. Ikon yang tetap gagal direct fill dilewati dari SVG Canva dan disebut di status unduhan.
5. Builder mode `S`: isi objek = aksen manifest, isi pengubah kuning. Usulan sementara, menunggu persetujuan pemilik.
6. Migrasi `004-from-sticker`. Id 003 dipakai migrasi coret-composer (Fase 4, ADR-018); app menjalankan 002, 003, lalu 004 berurutan.

Catatan penomoran: Fase 4 dan Fase 5 dikerjakan paralel dan sama-sama memakai nomor ADR-018. Saat digabung (2026-10-21), ADR Fase 4 tetap ADR-018 dan ADR Fase 5 menjadi ADR-019.

---

## Dibatalkan (jangan dipasang lagi tanpa diminta)

- **Isian warna untuk lapisan garis** di Composer Aksen: sempat dibuat, lalu dibatalkan pemilik karena salah persepsi.
- **Ikon ekstra otomatis** (TIB v1.4.0): dibatalkan, lalu dikembalikan sebagai opsi eksplisit di v1.5.1 (`exExtra`). Jangan membuat ekstra kalau tidak diminta manifest.
- **Gaya "garis-garis"** di Builder: dihapus setelah uji Series A Pitch.
