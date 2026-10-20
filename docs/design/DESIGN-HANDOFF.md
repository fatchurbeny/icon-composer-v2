# Design handoff: Icon Studio (UI terpadu)

Dokumen ini adalah serah terima desain untuk agen (Codex) yang membangun UI baru. Composer dan Template Icon Builder menjadi **satu aplikasi** dengan empat persona, mengikuti pola editor Affinity: persona di kiri atas, bilah konteks, tool rail, kanvas, dan studio panel bertab.

## 0. Sumber kebenaran (urutan prioritas)

| Prioritas | Sumber | Dipakai untuk |
|---|---|---|
| 1 | `packages/ui/tokens.css`, `packages/ui/components.css`, `packages/ui/components.js`, `packages/ui/icons.js` | **Semua nilai visual dan perilaku komponen.** Kode aplikasi hanya memakai ini. |
| 2 | `docs/design/ui-kit.html` | Rendering acuan setiap komponen dan semua state-nya, plus satu contoh kerangka penuh berukuran 1440×900. Buka langsung di Chrome. |
| 3 | Artifact Claude Design "Icon Studio · Affinity Redesign" (5 artboard): https://claude.ai/artifact/VGneKnNNPx9t5vz4YaR5WJ (privat milik pemilik) dan screenshot acuan di `docs/design/reference/` | Tata letak dan isi tiap layar: panel apa, di mana, dengan data apa. |
| 4 | Dokumen ini | Spesifikasi yang menghubungkan ketiganya: anatomi layar, perilaku, teks, aksesibilitas. |

Kalau terjadi konflik:
- Soal **tampilan** (warna, ukuran, radius, state), UI kit menang atas artboard.
- Soal **tata letak dan isi layar**, artboard menang.
- Kalau keduanya tidak menjawab, **berhenti dan tanya**. Jangan menebak gaya baru.

### Perbedaan yang sudah diputuskan antara artboard dan kit

| Hal | Artboard | Kit (berlaku) | Alasan |
|---|---|---|---|
| Teks meta kecil | `#8C8C8C`, `#7A7A7A` | `--ic-text-4` `#9A9A9A` minimum | Kontras WCAG AA 4.5:1 di atas `--ic-bg-panel` |
| State aktif | kelas `.on` | atribut ARIA (`aria-pressed`, `aria-selected`, `aria-current`) | State dan aksesibilitas selalu sama |
| Ikon UI | SVG digambar tangan | Lucide lewat `uiIcon(name)` | Satu set ikon, versi terkunci |
| Logo | gambar SVG inline | `.ic-logo` + `.ic-logo__dot` ikut warna persona | Konsisten di semua persona |
| Panel studio | semua panel terbuka bersamaan | akordeon: satu panel terbuka per kolom, panel lain tinggal kepala 34 px | Permintaan pemilik: panel yang dipakai mendapat tinggi penuh |

### Isi folder `docs/design/`

| Path | Isi |
|---|---|
| `ui-kit.html` | Galeri komponen + kerangka contoh (buka di Chrome) |
| `reference/artboard-*.png` | Render 1600×1000 kelima artboard, termasuk keadaan tab Lapisan/Pustaka/Pool dan filter Bentuk "Isi" |
| `reference/shell-composer-1440x900.png`, `reference/ui-kit-full.png` | Render kit |
| `artboards/*.dc.html`, `artboards/canvas.json` | Sumber artboard dari Claude Design (format `.dc.html`): nilai warna, ukuran, dan teks persis |
| `artboards/blob-map.json` | Peta `/_blob/<id>` di artboard → file di `assets/` |
| `assets/` | Semua SVG contoh yang dipakai artboard dan kit |

Render ulang PNG dari artboard: `python3 scripts/render-artboards.py` (butuh Playwright + Chromium; tambah `--fonts <folder>` kalau offline).

## 1. Kerangka aplikasi (`.ic-shell`)

```
┌───────────────────────────────────────────────────────────────────────────┐ 56  .ic-topbar
│ logo · persona-group · ⋮ · mode tampilan ……… info dokumen · ↶ · Ekspor · ? │
├───────────────────────────────────────────────────────────────────────────┤ 42  .ic-context
│ kontrol kontekstual (berganti sesuai seleksi dan persona)                 │
├────┬──────────────────────────────────────────────────┬───────────────────┤
│    │ .ic-doctabs                                   30 │ .ic-studio  330   │
│ 56 │──────────────────────────────────────────────────│  .ic-panel ×2–3   │
│tool│ .ic-canvas (scroll)                              │  (head 34)        │
│rail│                                                  │                   │
├────┴──────────────────────────────────────────────────┴───────────────────┤ 28  .ic-statusbar
└───────────────────────────────────────────────────────────────────────────┘
```

- Ukuran minimum jendela 1280×800. Desain acuan 1600×1000, contoh kit 1440×900.
- Di bawah lebar 1100 px, studio pindah ke bawah kanvas (sudah diatur di `components.css`).
- Persona Kombinasi memakai `.ic-shell--left-studio`: studio pustaka 300 px di kiri menggantikan tool rail.
- Hanya kanvas dan isi panel yang bergulir. Bilah atas, konteks, dan status tidak pernah ikut bergulir.
- **Urungkan dan Ulangi** di bilah atas (semua persona): dua `.ic-iconbtn` (`undo`, `redo`) sebelum tombol aksi, `disabled` bila tidak ada langkah. Pintasan ⌘/Ctrl+Z urungkan, ⌘/Ctrl+Shift+Z atau Ctrl+Y ulangi, tidak aktif saat fokus di isian teks. Maks 10 langkah per dokumen, hanya di memori (hilang saat dimuat ulang). Toast "Diurungkan: <label>" atau "Diulang: <label>", dan Riwayat mencatat "Urungkan: …" atau "Ulangi: …". Seleksi dipertahankan; bila ikonnya hilang, seleksi pindah ke ikon pertama, dan Composer · Edit kembali ke ikhtisar.
- **Kolom studio adalah akordeon** (`.ic-studio[data-ic="accordion"]`, juga studio kiri Kombinasi). Hanya satu panel terbuka per kolom:
  - Panel terbuka mengisi sisa tinggi kolom. Panel tertutup tinggal kepalanya (34 px); footer panel ikut tersembunyi.
  - Membuka panel (tombol lipat `.ic-panel__collapse`, atau klik tab di kepala panel tertutup) menutup panel lain di kolom itu.
  - Menutup panel yang sedang terbuka membuka panel berikutnya; panel terakhir membuka panel sebelumnya. Kolom tidak pernah kosong, kecuali kolom yang hanya berisi satu panel.
  - Panel awal: panel utama (`.ic-panel--grow`), kalau tidak ada maka panel pertama. Composer · Set: Halaman; Composer · Edit: Lapisan (tab Lapisan, Transform, Pustaka); Builder: Ikon; Tinjau: Pemeriksaan; Kombinasi: Pool (kanan) dan Pustaka (kiri).
  - Perintah yang membuka tab lewat program (tool rail Objek utama → Pustaka, Dekorasi, Kata kunci, tombol di peringatan) cukup mengklik tab; akordeon ikut membuka panelnya.
  - Shell mengingat panel terbuka per persona dan kolom selama sesi, jadi bertahan setelah render ulang dan pindah persona atau dokumen.
- **Zoom dan geser kanvas (seperti Affinity), di semua persona:**
  - Ctrl/⌘ + roda atau pinch trackpad: zoom di titik kursor, 10–800%. Roda biasa menggulir, Shift + roda menggulir mendatar.
  - Spasi + seret, tool Geser tampilan (H), atau tombol tengah mouse: geser kanvas.
  - Tool Perbesar (Z): klik untuk zoom in, Alt + klik untuk zoom out. Tool Pilih: V.
  - ⌘/Ctrl + = zoom in, ⌘/Ctrl + − zoom out, ⌘/Ctrl + 0 sesuaikan ke layar, ⌘/Ctrl + 1 100%.
  - Persentase zoom tampil di tab dokumen aktif ("@ 150%") dan di ujung kanan bilah status bersama tombol perkecil, 100%, perbesar, dan sesuaikan.
  - Zoom diingat per dokumen dan persona selama sesi. Filmstrip Composer · Edit berada di bawah kanvas dan tidak ikut di-zoom.

## 2. Persona dan routing

Satu file HTML, routing pakai hash supaya bisa dibuka dari `file://`.

| Persona | Hash | `data-persona` | Warna | Dokumen |
|---|---|---|---|---|
| Composer · Set | `#/composer` | `composer` | `--ic-persona-composer` | set `.icset` (localStorage) |
| Composer · Edit | `#/composer/edit/<id>` | `composer` | sama | ikon dalam set |
| Builder | `#/builder` | `builder` | `--ic-persona-builder` | manifest dari Claude Design |
| Tinjau | `#/tinjau` | `tinjau` | `--ic-persona-tinjau` | dokumen aktif |
| Kombinasi | `#/kombinasi` | `kombinasi` | `--ic-persona-kombinasi` | pool set aktif |

- Tab dokumen (`.ic-doctabs`) menampilkan dokumen terbuka. Mengklik tab dokumen Builder dari persona Composer berpindah ke persona Builder.
- Tinjau dan Kombinasi bekerja pada dokumen yang sedang aktif.
- Pindah persona tidak menghapus seleksi atau state dokumen.

## 3. Anatomi layar

Setiap layar di bawah ini punya artboard dengan nama yang sama di Claude Design.

### 3.1 Composer · Set (ikhtisar halaman)

| Wilayah | Komponen | Isi dan data |
|---|---|---|
| Bilah atas | `.ic-persona-group`, `.ic-persona-group` berisi 2 `.ic-iconbtn` (satu ikon / ikhtisar), `.ic-topbar__info`, `.ic-iconbtn` Urungkan dan Ulangi, `.ic-actionbtn` "Ekspor Canva" | info: `<mesin> <versi>` · `<n> ikon · 48 × 48 · <maks warna> warna` |
| Konteks | teks seleksi, `.ic-check` "Snap ke grid", `.ic-btn--sm` "Patokan set…", "Pengaturan app…", `.ic-select` Urut, `.ic-number` Kolom | Urut: Urutan set · Nama A–Z · Per flag |
| Tool rail | `.ic-tool` ×9: pilih, geser, objek utama, pengubah, dekorasi, kombinasi, ambil warna, geser tampilan, perbesar | |
| Kanvas | `.ic-pagegrid` dengan `.ic-page` per ikon, `.ic-page--new`, `.ic-page--ghost` (saran) | ikon dirender lewat `engine.compose`; flag dari `packages/repetition` |
| Studio · panel 1 | tab **Gaya** \| Warna | `.ic-engines` (5 mesin), `.ic-slider` parameter gaya mesin aktif |
| Studio · panel 2 | tab **Halaman** \| Lapisan \| Pustaka \| Pool | lihat 3.1.1 |
| Studio · panel 3 | tab **Repetisi** \| Navigator \| Riwayat | `.ic-stats`, `.ic-alert` per pasangan mirip, tombol Ratakan variasi + Tinjau pasangan |
| Status | `1 dari 11`, petunjuk tetikus | |

#### 3.1.1 Isi tab panel 2

| Tab | Isi |
|---|---|
| Halaman | `.ic-row` per ikon (thumb, nama, meta `slot · arah sinar`, mata). Footer: ikon baru, duplikat, acak ulang variasi, kunci variasi, hapus. |
| Lapisan | Lapisan ikon terpilih, urutan dari depan ke belakang: Pengubah, Dekorasi, Objek utama. Meta mono berisi kunci, slot, dan skala. Ada ikon kunci dan mata. Footer: buka mode edit, ganti isi lapisan, hapus. |
| Pustaka | `.ic-seg` sumber (Semua · Lucide · Tabler · Huge · Kustom), `.ic-field--search`, `.ic-seg` Bentuk (Semua · Garis · Isi), `.ic-tilegrid` 5 kolom. Klik tile mengganti isi lapisan terpilih. Artboard Main belum menampilkan seg Bentuk, tapi filter ini **wajib** ada di semua panel Pustaka (ADR-015), sama seperti di artboard Kombinasi. |
| Pool | Daftar objek dan pengubah (`.ic-row--sm`, checkbox, `.ic-src`, titik warna, slot). Tombol warna persona Kombinasi: "Buka matriks Kombinasi · <n>". |

### 3.2 Composer · Edit ikon

- **Konteks:** jenis lapisan terpilih, kunci (`.ic-field--mono`) + tombol "Ganti…", `.ic-anchor` (2×2 untuk sticker, 3×3 untuk mesin lain), `.ic-number` Skala, swatch Isi, `.ic-check` Celah knockout, tombol "Acak ulang variasi" dan "Kunci variasi".
- **Kanvas:** `.ic-artboard` 520×520 putih dengan grid 16 sel (tiap 3 unit kanvas 48, sesuai artboard). Seleksi lapisan: `.ic-selbox` (bingkai biru 1,5 px + 8 handle 9 px, ukurannya tetap di layar saat zoom). Tooltip koordinat (`.ic-tooltip`) dalam satuan 48, atau nilai skala/sudut saat menyeret pegangan. `.ic-filmstrip` 84 px di bawah kanvas.
  - **Seret pegangan** mengubah skala set lapisan itu (`style.scale`, berlaku untuk semua ikon). Shift = kelipatan 5%. Objek utama dan dekorasi berskala di pusatnya, pengubah dari sudut atau sisi slotnya. Pegangan pengubah yang berimpit dengan titik tetap disembunyikan.
  - **Seret zona di luar sudut** (kursor putar) memutar lapisan untuk ikon ini saja (`mr`, `nr`, `deco.r`). Shift = kelipatan 15°. Kotak seleksi dan wilayah klik ikut berputar.
  - Esc saat menyeret membatalkan. Tool Geser tampilan dan Spasi tetap menggeser kanvas, bukan pegangan. Gaya offset hanya bisa memilih lapisan (kotak seleksi tanpa pegangan).
- **Studio:** tiga panel di kolom akordeon.
  1. **Gaya** | Warna (kartu mesin).
  2. **Lapisan | Transform | Pustaka** (panel utama, `.ic-panel--grow`, terbuka saat masuk Edit di tab Lapisan). Daftar Lapisan dan Transform bergantian di satu panel, jadi panel kontekstual tidak pernah menutup daftar Lapisan lewat akordeon. Pustaka di panel ini mengganti isi lapisan terpilih (tombol "Ganti…").
  3. **Halaman** | Variasi | Riwayat.
  - Memilih lapisan (klik di artboard atau di daftar Lapisan) membuka tab Transform yang berisi kontrol lapisan itu, dan membuka panel Lapisan bila sedang tertutup. Untuk memilih lapisan lain dari daftar, kembali ke tab Lapisan. Sakelar "Buka panel ini saat memilih lapisan" di tab Transform mematikannya (`view.panel`).
  - Transform berisi X/Y/W/H, Skala (semua ikon), dan Rotasi (ikon ini).
  - Variasi berisi sumbu mesin aktif dari `engine.axes()`. Nilai yang diblokir tampil `disabled`. Seed planner ditampilkan, dan hasil cek kembaran tampil sebagai `.ic-alert[data-level=ok]`.
- **Keyboard:** panah menggeser 0,5 unit (Shift = 2), `[` `]` memutar 15° (Shift = 1°), Esc kembali ke ikhtisar, Delete menghapus lapisan pengubah atau dekorasi.

### 3.3 Builder · Periksa pack

- **Konteks:** `.ic-steps` (Impor ✓ → Periksa → Ekspor), `.ic-chip` filter (Semua, Bermasalah, Slot deck, Ekstra), `.ic-select` Pratinjau (5 gaya), `.ic-check` Kelompokkan per slide.
- **Kanvas:** `.ic-slidegroup` per slide (judul slide + "n slot") dengan `.ic-cardgrid` 4 kolom `.ic-iconcard`. Ikon terpilih bercincin biru. Ikon dobel bercincin merah dengan `.ic-flag[err]`. Ikon mirip diberi `.ic-flag[warn]`.
- **Studio:**
  - **Ikon** \| Manifest \| Pustaka: pratinjau besar, field id, Nama EN, Nama ID, Objek, Posisi, Pengubah, Isi, dan kata kunci (`.ic-tag`).
  - **Repetisi** \| Flag: `.ic-alert` per temuan, tombol Ratakan variasi dan Lewati bermasalah.
  - **Gaya ekspor** \| Metadata: baris checkbox per gaya dengan thumb dan nama folder, footer `.ic-alert[ok]` tentang direct fill.
- Data dari `toItem`/`normAcc` TIB, `signatureMap`, dan `flagsOf`.

### 3.4 Tinjau · Lembar kontak & ekspor

- **Konteks:** `.ic-swatches` latar (putih, abu, gelap, kuning, transparan), `.ic-seg--inline` ukuran 128/64/32, `.ic-check` Nama file dan Tanda flag, `.ic-seg` Bandingkan (SVG asli / Direct fill).
- **Kanvas:** `.ic-sheet` (judul set + meta), grid 6 kolom. Klik ikon mengeluarkan atau memasukkan kembali ikon ke unduhan (`aria-pressed`, opasitas 35% + label "dikeluarkan"). Klik dua kali membuka ikon di Composer · Edit. Di bawahnya `.ic-sizetest`: uji 32 px di latar terang dan gelap.
- **Studio:**
  - **Pemeriksaan**: checklist `.ic-row--sm` dengan bulatan ✓ atau !.
  - **Metadata Canva**: seg Artist hashtagben/chital, seg Bahasa, field Tema pack, `.ic-number` Kata kunci, dan contoh judul berpola "Icon-style".
  - **Isi ZIP**: pohon folder mono, tombol "Unduh ZIP Canva" (primer) dan "Sprite SVG".

### 3.5 Kombinasi · Matriks + pustaka

- Kerangka `.ic-shell--left-studio`.
- **Studio kiri:** Pustaka \| Kustom \| Riwayat.
  - Seg sumber, pencarian, seg "Klik menambah ke: Objek / Pengubah", seg Bentuk (Semua · Garis · Isi), dan keterangan Bentuk.
  - Hasil dikelompokkan per pustaka: `.ic-src`, nama, versi, jumlah, lalu `.ic-tilegrid` 4 kolom.
  - Grup Kustom kosong memakai `.ic-empty` + "Impor dari Figma…".
  - Footer berisi lisensi.
- **Kanvas:** `.ic-matrix`. Kepala kolom = pengubah (ikon garis, kunci, slot). Kepala baris = objek (ikon garis, kunci, titik warna). Sel memakai `.ic-cell[data-state]`.
- **Konteks:** select Gaya, seg Posisi pengubah, seg Warna pengubah, Pilih semua / Lewati semua, `.ic-check` Lewati yang sudah ada dan Lewati yang mirip.
- **Studio kanan:** **Pool** (objek dan pengubah, checkbox) dan **Hasil** (rekap jumlah per status + `.ic-check` Ratakan variasi setelah ditambah + tombol primer "Tambahkan <n> ke set").
- **Bilah atas:** `.ic-actionbtn--persona` "Tambahkan <n> ke set".

#### Status sel matriks

| `data-state` | Arti | Bisa diklik |
|---|---|---|
| `on` | akan ditambahkan | ya → `skipped` |
| `skipped` | dilewati manual | ya → `on` |
| `exists` | signature sudah ada di set | tidak |
| `similar` | sidik jari mirip ikon lain di gaya ini | ya (memaksa `on` memunculkan konfirmasi) |
| `library` | gabungan nama sama dengan ikon pustaka | tidak |

#### Filter Bentuk (ADR-015)

- **Isi** = ikon punya minimal satu bentuk tertutup (body) yang bisa diwarnai. Ini dihitung per ikon untuk semua library oleh `engines/shared.analyzeParts` (`closed`, `bodyOf`), bukan dari nama ikon atau varian pustaka.
- **Garis** = ikon tanpa bentuk tertutup.
- Hasil dihitung saat indeks pustaka dibangun, lalu di-cache per kunci ikon (`icon-sources` menyimpan `fillable: boolean`).
- Varian "filled" bawaan Tabler tidak dipakai.

## 4. Inventaris komponen

Rendering semua komponen ada di `ui-kit.html`. Perilaku diaktifkan lewat `data-ic` dan diatur `components.js`. Setiap perubahan memancarkan event `ic-change` (bubbles) dengan `detail.value`.

| Komponen | Kelas | `data-ic` | State (ARIA) | Pakai untuk | Jangan untuk |
|---|---|---|---|---|---|
| Persona | `.ic-persona` | (link) | `aria-current="page"` | pindah persona | aksi |
| Tombol | `.ic-btn` `--primary` `--sm` `--lg` `--block` | | `disabled` | aksi | navigasi (pakai `<a>`) |
| Tombol aksi atas | `.ic-actionbtn` `--persona` | | | ekspor, aksi utama persona | lebih dari satu per bilah atas |
| Tombol ikon | `.ic-iconbtn` `--help` | `press` (opsional) | `aria-pressed`, `disabled` | aksi ringkas di footer panel, Urungkan dan Ulangi di bilah atas | tanpa `aria-label` |
| Tool | `.ic-tool` | `single` (di rail) | `aria-pressed` | alat kanvas | aksi sekali klik |
| Tab dokumen | `.ic-doctab` | | `aria-selected` | dokumen terbuka | |
| Panel bertab | `.ic-panel` `__head` `__body` `__foot` `__sub`, `.ic-tab`, `.ic-panel__collapse` | `tabs`, `collapse` | `aria-selected`, `aria-expanded`, `hidden` | studio | dialog |
| Akordeon panel | wadah `.ic-studio` berisi `.ic-panel` | `accordion` (di wadah) | `aria-expanded` tombol lipat; `ic-change` dari wadah dengan `value` = `data-panel` panel terbuka; `ICUI.openPanel(section)` membuka tanpa event | kolom studio | panel di luar kolom |
| Segmented | `.ic-seg` `--inline` | `single` | `aria-pressed` | 2–5 opsi pendek | lebih dari 5 opsi |
| Dropdown | `.ic-select`, `.ic-select__trigger`, `.ic-menu`, `.ic-menu__item`, `.ic-menu__sep` | `select` | `aria-expanded`, `aria-selected`, `aria-disabled` | 4+ opsi, label panjang | aksi (pakai menu tombol) |
| Slider | `.ic-slider` (range + `.ic-field`) | `slider` | | parameter kontinu gaya | nilai diskret (pakai seg) |
| Angka | `.ic-number` | `number` | | skala, kolom, jumlah | |
| Field | `.ic-field` `--search` `--mono`, `.ic-formrow` | | `:focus-within` | teks, id, pencarian | |
| Checkbox | `.ic-check` | | `checked` | opsi yang diterapkan oleh tombol lain | |
| Toggle | `.ic-toggle`, `.ic-toggle__track[role=switch]` | `switch` | `aria-checked` | pengaturan yang langsung berlaku | |
| Chip | `.ic-chip` | `single` / `press` | `aria-pressed` | filter daftar | |
| Tag | `.ic-tag` | | | kata kunci | |
| Langkah | `.ic-steps`, `.ic-step`, `.ic-step__n`, `.ic-steps__line` | | `aria-current="step"`, `data-state="done"` | alur Builder | |
| Lencana sumber | `.ic-src[data-src=lu\|tb\|hg\|cu]` | | | asal ikon | |
| Flag | `.ic-flag[data-level=err\|warn\|ok\|info]` | | | status pendek | kalimat |
| Titik status | `.ic-dot[data-level=err\|warn\|ok\|info]` | | | awal baris peringatan | satu-satunya penanda (selalu sertakan teks) |
| Peringatan | `.ic-alert[data-level=err\|warn\|ok\|info]`, `.ic-alert__meta` | | | temuan repetisi/validasi; `info` (abu netral: `--ic-bg-card`, `--ic-line-4`, `--ic-text-2`, meta dan titik `--ic-text-4`) untuk catatan yang tidak memblokir ekspor, mis. "Pengubah tidak tersedia pada style ini" | jangan pakai `info` untuk masalah yang harus diperbaiki |
| Statistik | `.ic-stats`, `.ic-stat[data-level]`, `__n`, `__l` | | | ringkasan angka | |
| Baris | `.ic-list`, `.ic-row` `--sm`, `__thumb`, `__name`, `__sub` | | `aria-selected` | halaman, lapisan, pool, checklist | |
| Tile pustaka | `.ic-tilegrid`, `.ic-tile`, `__kind`, `__check`, `__note` | `press` | `aria-pressed`, `data-in-pool`, `data-similar` | hasil pustaka | |
| Halaman ikon | `.ic-pagegrid`, `.ic-page` `--new` `--ghost`, `__label`, `__card` | | `aria-selected` | ikhtisar set | |
| Kartu gaya | `.ic-engines`, `.ic-engine`, `__pv` | `single` | `aria-pressed` | pilih mesin | |
| Sel matriks | `.ic-matrix`, `.ic-cell[data-state]` | | `data-state` | Kombinasi | |
| Swatch | `.ic-swatches`, `.ic-swatch` `--round` | `single` | `aria-pressed` | palet tinta/isi/latar | |
| Posisi pengubah | `.ic-anchor` (`--ic-anchor-cols: 2` untuk sticker) | `single` | `aria-pressed`, `disabled` | slot pengubah | |
| Kosong | `.ic-empty` | | | daftar tanpa isi | |
| Tooltip | `.ic-tooltip` | | | koordinat kanvas | penjelasan panjang (pakai `.ic-tip`) |
| Rich tooltip | `.ic-tip`, `__head`, `__key`, `__desc`, `__list` | `data-tip` + `aria-describedby` pada pemicu | `hidden`, `role=tooltip` | penjelasan tool: judul + pintasan, deskripsi, gestur (kata kerja tebal) | tombol atau tautan di dalamnya (pakai dialog/popover) |
| Toast | `.ic-toast` | | `hidden` | konfirmasi singkat (1,8 detik) | error yang butuh tindakan |
| Artboard edit | `.ic-artboard-wrap`, `.ic-artboard`, `__label`, `__art` | | `data-grid="off"` | kanvas Composer · Edit 520 px bergrid 16 sel | pratinjau kecil (pakai `.ic-page`) |
| Kotak seleksi | `.ic-selbox`, `.ic-selbox__h[data-at][data-cur]`, `.ic-selbox__rot[data-at]` | | posisi inline (geometri), `--ic-selbox-r` + `transform-origin` (rotasi), `--ic-zoom` dari kanvas, `hidden` | lapisan terpilih di artboard: 8 pegangan ubah ukuran, 4 zona putar di luar sudut (kursor `--ic-cursor-rotate`) | |
| Filmstrip | `.ic-filmstrip`, `.ic-filmstrip__item` (`role=option`) | | `aria-selected` | strip set di bawah kanvas edit | |
| Grup slide | `.ic-slidegrid`, `.ic-slidegroup`, `__head`, `__no`, `__title` | | `--ic-cols` | pengelompokan ikon per slide (Builder) | |
| Kartu ikon | `.ic-cardgrid`, `.ic-iconcard`, `__art`, `__id` | | `aria-selected`, `data-level="err"` | kartu ikon Builder (id mono di bawah) | halaman set (pakai `.ic-page`) |
| Lembar kontak | `.ic-sheet`, `__head`, `__title`, `__meta`, `__grid`, `__cell`, `__file`, `__badge` | | `aria-pressed` (ikut diunduh), `data-names="off"`, `--ic-sheet-bg`, `--ic-sheet-icon` | lembar kontak Tinjau di atas latar terang | |
| Uji ukuran kecil | `.ic-sizetest`, `__panel`, `__row` | | `--ic-sizetest-bg` | uji 32 px di latar terang/gelap | |
| Area drop | `.ic-dropzone`, `__title`, `__actions` | | `data-dragover="true"` | impor manifest (Builder) | daftar kosong (pakai `.ic-empty`) |
| Field banyak baris | `.ic-field--area` + `<textarea>` | | `:focus-within` | tempel JSON manifest | teks satu baris |

Komponen artboard edit sampai field banyak baris ditambahkan lewat usulan `docs/design/proposals/komponen-fase-2b.md` (disetujui 2026-10-18).

**Warna data** (warna isi ikon, warna pool, swatch palet mesin) adalah data mesin, bukan warna UI. Warna ini boleh ditulis inline (`style="background: #E5484D"`) dan harus berasal dari palet di `packages/engines/<id>`.

## 5. Ikon

- **Ikon UI:** hanya lewat `uiIcon(name, size)` atau `<i data-icon="name" data-size="16">` dari `packages/ui/icons.js`. Ukuran 13, 16 (bawaan), atau 20 (tool rail).
  - Nama baru ditambahkan di `scripts/build-ui-icons.mjs`, lalu jalankan `node scripts/build-ui-icons.mjs node_modules/lucide-static/icons`.
  - Pakai `lucide-static` versi terkunci 1.52.0. Contoh kit dibuat dari 1.59.0, jadi bangun ulang saat Fase UI.
- **Seni ikon** (hasil mesin) hanya lewat `engine.compose`. Jangan pernah menggambar ulang ikon set di UI.

## 6. Teks UI

- Bahasa Indonesia, huruf kapital hanya di awal kalimat ("Ekspor Canva", bukan "EKSPOR CANVA").
- Tanpa em dash. Gunakan titik tengah `·` sebagai pemisah meta.
- Istilah wajib mengikuti `docs/GLOSSARY.md` (Objek utama, Pengubah, Dekorasi, Patokan set, Halaman, Pool).
- Teks flag tetap:

| Situasi | Teks |
|---|---|
| Signature sama | `dobel` / "Rakitan dobel dengan <nama>" |
| Sidik jari mirip | `Mirip` / "<a> ≈ <b>" |
| Sama dengan pustaka | `= <Pustaka> <nama>` |
| Sudah di set | `di set` |
| Dilewati manual | `dilewati` |
| Offset tanpa pengubah | "Pengubah tidak tersedia pada style ini" |

- Petunjuk bilah status memakai pola "**Kata kerja** objek untuk hasil." dengan kata kerja tebal.

## 7. Keadaan khusus

| Keadaan | Tampilan |
|---|---|
| Pustaka sedang dimuat | `.ic-meta` "Memuat pustaka…" di tempat jumlah hasil; tile berupa kotak `--ic-bg-card` kosong |
| Pustaka gagal dimuat | `.ic-alert[err]` "Gagal memuat pustaka. Periksa koneksi internet." + tombol "Coba lagi" |
| Set kosong | `.ic-page--new` saja + `.ic-empty` di panel Halaman: "Belum ada ikon. Pilih objek dari Pustaka atau buka Kombinasi." |
| Manifest belum diimpor | Builder di langkah Impor: `.ic-dropzone` (border putus `--ic-line-5`) dengan tombol pilih file, Muat contoh, dan `.ic-field--area` untuk menempel JSON |
| Ekspor gagal validasi Canva | `.ic-alert[err]` di Tinjau → Pemeriksaan, tombol unduh `disabled` |

## 8. Aksesibilitas (wajib)

- Semua kontrol berupa elemen asli: `<button>`, `<a href>`, `<input>` + `<label>`. Tidak ada `onclick` di `<div>`.
- Tombol ikon dan tool wajib punya `aria-label` berbahasa Indonesia.
- State selalu lewat ARIA (tabel di bagian 4). CSS hanya membaca ARIA.
- Fokus terlihat lewat `--ic-focus`. Jangan pernah `outline: none` tanpa pengganti.
- Warna tidak boleh jadi satu-satunya penanda: flag selalu berteks, dan titik status selalu didampingi teks.
- Target klik minimal 24×24 px. Kontrol 20 px di dalam segmented memakai wadah 24 px.
- `prefers-reduced-motion` mematikan transisi (sudah ada di CSS).

## 9. Kriteria terima UI

1. `npm run lint:ui` lulus (lihat `docs/design/UI-RULES.md`).
2. Tes Playwright `tests/e2e/ui-shell.spec.js`:
   - membuka build app di 1440×900;
   - mengukur tinggi `.ic-topbar` (56), `.ic-context` (42), `.ic-doctabs` (30), `.ic-panel__head` (34), dan `.ic-statusbar` (28);
   - mengukur lebar `.ic-toolrail` (56) dan `.ic-studio` (330);
   - semua harus tepat sama.
3. Screenshot persona Composer · Set dibandingkan dengan kerangka contoh di `ui-kit.html`. Selisih piksel area kerangka (di luar kanvas) harus < 2%.
4. Navigasi keyboard: Tab mencapai semua kontrol, panah berpindah tab panel, dan dropdown bisa dibuka/dipilih/ditutup tanpa tetikus.
5. Teks: tidak ada string UI berbahasa Inggris selain nama gaya, nama pustaka, dan kunci ikon.
   - Dites oleh `tests/e2e/ui-language.spec.js`: tes mengunjungi setiap persona dan tab panel (termasuk set contoh, manifest contoh, dan gaya Offset), lalu mencocokkan teks, `aria-label`, `title`, `placeholder`, dan isi `.ic-tip` dengan daftar kata Inggris umum. Pengecualian yang diizinkan beserta alasannya ditulis di `ALLOWED` dalam file tes itu.
