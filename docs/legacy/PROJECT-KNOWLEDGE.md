# Icon Creator: Project Knowledge (serah terima untuk GPT Codex)

> Dokumen ini merangkum seluruh sesi pengembangan dari awal sampai akhir (6 sampai 9 Oktober 2026): tujuan, alur kerja, arsitektur kode, format data, riwayat versi, keputusan, dan pekerjaan yang belum selesai.
> Baca bagian 1 sampai 4 untuk konteks, bagian 5 sampai 8 untuk kode, bagian 11 untuk daftar pekerjaan berikutnya.

---

## 0. Ringkasan cepat (untuk agen)

- **Pemilik:** Ika (Canva Creator, nama artis di Canva: `hashtagben`). Komunikasi dalam **bahasa Indonesia**.
- **Produk:** rangkaian alat HTML satu file untuk membuat **paket ikon unik** yang dijual sebagai **element Canva**, dipasangkan dengan **template presentasi** yang dibuat di Claude Design.
- **Alat aktif (pakai ini):**
  - `template-icon-builder-aksen.html` adalah alat utama: manifest JSON → ZIP berisi SVG + metadata Canva.
  - `icon-composer-aksen.html` adalah editor ikon manual (gaya Klasik + Aksen).
  - `deck-icon-slots-v1.4.0.md` adalah instruksi untuk Claude Design (dipakai bersama skill `canva-ipsum-deck`).
- **Sumber build Builder:** `src/template-icon-builder-aksen/` (template + engine + skill + sample, dirakit oleh `asm.py`). **Jangan edit file HTML hasil rakitan secara langsung**; edit sumbernya lalu jalankan `python3 asm.py`.
- **Aturan kerja dari pemilik:**
  - Kalau diminta membuat versi baru, **buat file baru**, jangan menimpa file lama.
  - Simpan versi dengan nomor versi di nama file.
  - Kalau pemilik menulis "diskusi dulu", jangan eksekusi apa pun.

---

## 1. Tujuan bisnis dan batasan Canva

1. Pemilik membuat **template presentasi wireframe** untuk Canva marketplace. Template dibuat di Claude Design dengan skill `canva-ipsum-deck`.
2. Ikon di template harus **buatan sendiri**, lalu di-submit sebagai element Canva. Pemilik mendapat penghasilan dari element yang dipakai.
3. Batasan yang memandu semua keputusan desain:
   - **SVG editable di Canva maksimal 5 warna.** Gaya ikon dibatasi 2 warna: tinta + aksen.
   - **Ikon harus unik** dan tidak menyerupai ikon pustaka yang sudah ada. Karena itu setiap ikon = **objek utama + pengubah**, dan Builder memeriksa apakah gabungan namanya sudah ada di Lucide/Tabler (misalnya `user-plus`).
   - Metadata Canva: judul unik (kata utama berhuruf kapital), minimal 5 kata kunci yang relevan.
   - **Keputusan terbaru (v1.4.0):** pack hanya berisi ikon yang benar-benar dipakai di slide. Ikon ekstra tidak dibuat lagi. Sebelumnya pemilik ingin "semakin banyak aset semakin baik"; ini sudah dibatalkan.
4. Masalah designer yang ingin diselesaikan: setelah ikon terbit di Canva, designer harus menemukan ikon yang tepat di antara jutaan element. Solusinya ada di bagian 9 (judul berpola + kolom `search` dengan filter `brand:<ID>`).

---

## 2. Alur kerja end-to-end

```
Claude Design
  skill canva-ipsum-deck  +  lampiran deck-icon-slots-v1.4.0.md
  → deck 10–12 slide + 1 slide Resource Page
  → setiap tempat ikon = slot kosong berlabel id (data-icon)
  → <judul-deck>-icon-manifest.json  (file + blok kode JSON di jawaban akhir)
  → peta slot per slide di jawaban akhir
        │
        ▼
Template Icon Builder · Aksen  (template-icon-builder-aksen.html)
  1 Impor   : tempel/unggah manifest → validasi nama, saran nama terdekat
  2 Periksa : edit per ikon (objek, pengubah, posisi, warna bagian, isi bidang, penanda, kilau)
  3 Ekspor  : isi Tema pack + ID brand Canva → unduh ZIP
        │
        ▼
ZIP: aksen/*.svg (+ garis-solid/, solid-garis/ opsional), metadata.csv,
     resource-page.html, manifest-final.json, LICENSES.txt
        │
        ▼
Upload ke Canva Creator (judul + kata kunci dari metadata.csv)
        │
        ▼
Designer membuka template, mencari tiap ikon dengan kolom `search`
(contoh: brand:BA… hire engineers startup pitch), menaruhnya di slot,
lalu menghapus slot + label.
```

---

## 3. Inventaris file

### Aktif

| File | Fungsi |
|---|---|
| `tools/template-icon-builder-aksen.html` | **Alat utama.** Manifest → pack Canva. Versi 1.4.0. Hasil rakitan dari `src/template-icon-builder-aksen/`. |
| `tools/icon-composer-aksen.html` | Editor ikon manual, gaya Klasik + Aksen bagian. Turunan dari `icon-composer.html`. |
| `skill/deck-icon-slots-v1.4.0.md` | Instruksi Markdown (tanpa instal) untuk Claude Design. Versi terbaru. |
| `skill/deck-icon-slots-skill-v1.4.0.zip` | Versi skill terinstal dari isi yang sama (SKILL.md + references/vocabulary.json + references/example-manifest.json). Dibuat oleh tombol "Ekspor skill" di Builder. |
| `src/template-icon-builder-aksen/` | Sumber build Builder (lihat bagian 7). |

### Arsip / referensi

| File | Catatan |
|---|---|
| `tools/icon-composer.html` | Composer asli dari pemilik (gaya Klasik). **Jangan diubah tanpa izin eksplisit.** |
| `tools/template-icon-builder.html` | Builder versi 1.0.0 (Klasik saja, mode A/B). Sumbernya di `src/template-icon-builder-v1/`. |
| `skill/deck-icon-slots-v1.0.0.md` sampai `v1.3.2.md` (+ zip) | Riwayat versi skill (bagian 10). |
| `reference/gaya-aksen-bagian.html`, `gaya-aksen-lapisan.html`, `ideation-style-ikon.html` | Lembar eksplorasi gaya. "Lapisan" ronde 2 adalah dasar gaya Aksen (Cara 3 + Cara 4). |
| `reference/studio-ikon.html` | Alat awal (sebelum Composer), hanya referensi. |
| `reference/series-a-icon-manifest.json` | Manifest contoh nyata (Series A Pitch, 40 slot + 20 ekstra, format v1). Bagus untuk uji. |

### Di luar paket ini
- Deck Claude Design "Series A Pitch" dan "Marketing Process Flow" ada di akun Claude pemilik, tidak ikut dalam paket.
- Project claude.ai "Icon-Creator" berisi salinan `deck-icon-slots.md`.

---

## 4. Konsep ikon (berlaku untuk semua alat)

- **Grid 48 × 48.** Semua koordinat dalam satuan grid.
- **Objek utama (`main`)**: kata benda.
  - **Bawaan:** `face doc clock bell cart box truck door heart ticket laptop chat home pot book pin user calendar phone store`.
  - **Pustaka:** `lu:<nama>` dari Lucide atau `tb:<nama>` dari Tabler outline (tanpa ikon merek).
- **Pengubah (`mod`)**: aksi/status, ditempel di sudut (`anchor`/`slot`: TL TC TR ML MR BL BC BR).
  - **Bawaan:** `bubble card doc lock mail plus check cross parcel pinm pencil cone clockm star heartm bulb`.
  - **Pustaka:** sama seperti objek utama (`lu:` / `tb:`).
- **Dekorasi (`deco`)**: `speed spark base burst` (Klasik), `star4 star4x2` ("Kilau", gaya Aksen), atau SVG unggahan `c:<id>` (hanya di Composer).
- **Celah knockout**: pengubah dan dekorasi "memotong" objek di belakangnya dengan celah. Ada dua cara render:
  - `<mask>` dengan latar transparan, mode `mask` (bawaan);
  - siluet putih di belakang, mode `white`, untuk alat yang tidak mendukung mask.

### Dua keluarga gaya

| Parameter | Klasik | Aksen bagian |
|---|---|---|
| Tebal garis (`sw`) | 2 | 3,5 |
| Celah (`gap`) | 2 | 1,25 |
| Ujung / sambungan | butt / miter | round / round |
| Skala main / mod / deco (%) | 84 / 100 / 100 | 88 / 80 / 100 |
| Warna | tinta + aksen | tinta + aksen (bawaan Composer: koral `#F05A5A`; Builder: dari manifest) |
| Mode | A: objek garis + pengubah solid · B: objek solid + pengubah garis · C: keduanya garis | satu gaya, diatur per ikon (lihat di bawah) |

**Gaya Aksen bagian.** Pemilik memilih Cara 3 + Cara 4 dari eksplorasi:
- **Warna per bagian objek** (`parts`). Setiap bagian SVG objek utama mendapat peran:
  - `ink`: garis tinta;
  - `acc`: garis aksen;
  - `fillA`: bidang aksen;
  - `fill`: bidang tinta.
- **Otomatis** (`autoRoles`): bagian wadah (body) bertinta, bagian isi yang berada di dalam wadah dan tidak menyentuh tepinya beraksen. Hanya satu kelompok aksen. Kalau tidak ada isi, bagian detail terakhir diberi aksen. Objek tanpa body: bagian terbesar bertinta, sisanya beraksen.
- **Isi bidang, Cara 3** (`under`): `none | full | offset | half`. Body diisi aksen di bawah garis, lalu dipotong oleh garis yang diperlebar sehingga ada celah. `offset` digeser `0.75*sw + gap`; `half` hanya separuh bawah.
- **Penanda, Cara 4** (`mstyle`): pengubah digambar di depan dengan warna aksen.
  - `line`: glif garis.
  - `fill`: bentuk solid dengan glif dilubangi.
  - Pengubah yang aslinya lingkaran berisi glif ("badge") digambar hanya glifnya (line) atau lingkaran solid berlubang (fill).
  - Pengubah kecil (sisi kotak < 20) memakai garis × 0,75.
- **Kilau**: `star4` atau `star4x2`, bintang 4 sudut berwarna aksen yang ikut memotong objek.

---

## 5. Arsitektur kode

Semua alat adalah **HTML satu file** tanpa framework. Isinya CSS di `<style>`, JS biasa di satu `<script>`, dan SVG dibangun sebagai string.

### Dependensi CDN (versi dikunci)
- Lucide UMD: `https://cdn.jsdelivr.net/npm/lucide@1.52.0/dist/umd/lucide.min.js`
- Tag Lucide (untuk kata kunci): `https://cdn.jsdelivr.net/npm/lucide-static@1.52.0/tags.json`
- Tabler outline nodes: `https://cdn.jsdelivr.net/npm/@tabler/icons@3.49.0/tabler-nodes-outline.json`
- Tag Tabler: `https://cdn.jsdelivr.net/npm/@tabler/icons@3.49.0/icons.json`
- JSZip: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
- Font UI: Geist / Geist Mono (Google Fonts)

### Mesin bersama (ada di Composer dan Builder)

| Fungsi / data | Peran |
|---|---|
| `MAINS[key]` | Objek utama: `{n, b, s}`. `b` = SVG body (bidang tertutup), `s` = detail. Placeholder `INK` (warna) dan `LUSW` (tebal garis pustaka). |
| `MODS[key]` | Pengubah: `{n, w, h, slot, sil, det, ks, kd, badge}`. `sil` = siluet (dipakai untuk knockout dan isi), `det` = detail. |
| `PREFS` | Mode warna Klasik A/B/C: `{main: "outline"|"solid", mod: ...}`. |
| `SHIFT[anchor]` | Geser objek utama menjauhi pengubah (misalnya BR → [-3,-3]). |
| `luIndex()`, `loadTabler()`, `SOURCES` | Indeks Lucide dari UMD, dan Tabler yang dimuat bila perlu. |
| `splitPath`, `prepNode`, `measure` | Path Tabler dengan banyak sub-path dipecah. Setiap bagian diukur dengan `getBBox` di `<svg id="meas">` tersembunyi. |
| `luAnalyze(key)` | Mengurai ikon pustaka: `parts` (dengan bbox, closed, fill, dot) dan `body` (bidang tertutup terbesar ≥20% area). |
| `ensureLucide(key, kind)` | Mendaftarkan ikon pustaka ke `MAINS`/`MODS`. Skala ×2 (24 → 48). Pengubah tanpa body menjadi "badge" lingkaran. |
| `partStr(p, extra)` | Serialisasi satu bagian SVG. **Lihat bug di 11.1.** |
| `geom(it)` | Transform objek utama (`mainT`) dan kotak pengubah (`L, T, W, H`, `modT`) berdasarkan skala set + anchor + offset. |
| `compose(it, opt)` | Render gaya **Klasik** → string `<svg>`. `opt.mode` = `mask` atau `white`. |
| `decoMarkup(it)` | Dekorasi gaya Klasik. |

### Mesin gaya Aksen (`engine.js` bagian akhir, juga di Composer Aksen)

| Fungsi | Peran |
|---|---|
| `mainInfo(key)` | Daftar bagian objek utama dalam satuan 48 (`{svg, k, body, closed, bb}`); `k = 2` untuk Lucide/Tabler. Di-cache per objek `MAINS`. |
| `autoRoles`, `rolesOf(it, info)` | Peran otomatis + penimpaan manual dari `it.parts`. |
| `modShape(key)`, `modAccent(...)` | Bentuk penanda (body/det/badge), markup, dan siluet knockout. |
| `decoAccent(...)` | Kilau dan dekorasi garis + siluetnya. |
| `composeAccent(it, opt)` | Render gaya **Aksen**. Urutan lapisan: isi bidang → objek → dekorasi → penanda. Setiap lapisan di-mask oleh siluet lapisan di atasnya. Placeholder warna siluet `KO` diganti `#000` (mask) atau `#FFFFFF` (white). |
| `partThumb`, `cycleRole(it, i)` | Thumbnail per bagian di panel, dan klik bagian di kanvas untuk mengganti peran secara bergilir. |

### Icon Composer (`icon-composer.html`, `icon-composer-aksen.html`)
- **Tampilan:**
  - **Editor:** pustaka di kiri (Utama/Pengubah/Pustaka Lucide+Tabler), kanvas di tengah (seret lapisan), set di strip bawah, panel properti dan gaya set di kanan.
  - **Kombinasi massal:** matriks objek × pengubah.
  - **Tinjau pack:** lembar ikon, pemeriksaan (maks 5 warna, tepi kanvas), ekspor ZIP/sprite, simpan pack.
- **Patokan set:** warna lapisan, skala, tebal garis, celah, dan ujung garis berlaku untuk semua ikon. Yang per ikon hanya posisi, jangkar, dan (di Aksen) peran bagian, isi bidang, penanda.
- **Model item:** `{id, name, main, mod, slot, size, nx, ny, ms, mx, my, deco:{type,x,y,s,r,color}, pref, parts, under, mstyle, colors, vis:{main,mod,deco}}`.
- **Model gaya:** `{family, ink, accent, sw, gap, cap, join, pref, colors:{main,mod,deco}, scale:{main,mod,deco}, fx, saved}`. `saved` menyimpan patokan tiap keluarga saat berpindah gaya (`applyFamily`).
- **localStorage:**
  - `icon-composer-v2` dipakai Composer asli.
  - `icon-composer-aksen-v1` dipakai Composer Aksen. Saat pertama dibuka, Composer Aksen menyalin data dari `icon-composer-v2`.
- **Hanya di Composer Aksen:**
  - Pilihan "Gaya ikon: Klasik | Aksen bagian".
  - Panel "Warna bagian", "Isi bidang", "Penanda", serta warna aksen.
  - Klik bagian di kanvas untuk mengganti perannya.
  - Perbaikan scroll: hanya panel kanan yang bergulir (`.side{position:relative}`, `.sr{top:0;left:0}`, dan `html,body{overflow:hidden}` di ≥1100px).

### Template Icon Builder · Aksen (`template-icon-builder-aksen.html`, v1.4.0)
- **Langkah 1, Impor:** tempel atau unggah manifest, lalu dinormalisasi lewat `toItem` + `normAcc`.
  - **Validasi:** format, `pack` kosong, id tidak valid/dobel, nama objek/pengubah tidak dikenal (dengan saran via Levenshtein dan alias bawaan → Lucide).
  - **Ikon `role: "extra"`** otomatis `on = false` (dikeluarkan).
  - **Data contoh:** tombol "Coba data contoh" memasang flag `isSample` dan menampilkan peringatan.
- **Langkah 2, Periksa:**
  - Pustaka di kiri untuk mengganti objek/pengubah. Pilihan yang sudah ada sebagai ikon pustaka ditandai merah.
  - Kanvas: seret objek, pengubah, dan kilau; klik bagian untuk mengganti peran (khusus pratinjau Aksen).
  - Grid pack dengan filter.
  - Detail ikon: tiga pratinjau gaya, id, nama EN/ID, jangkar, posisi, dan panel "Gaya aksen".
- **Langkah 3, Ekspor:** pratinjau Resource Page (kolom otomatis 4/6/8/10/12/14), pilihan gaya (Aksen; Garis·solid dan Solid·garis opsional), Tema pack EN/ID, ID brand Canva, jumlah kata kunci.
- **Flag per ikon (`flagsOf`):** tidak dikenal, tanpa pengubah, "Mirip <pustaka> <nama>" (gabungan nama objek + pengubah ada di Lucide/Tabler), rakitan dobel, objek = pengubah, belum termuat, tanpa body.
- **Model item Builder:** `{uid, id, idRaw, name:{en,id}, main, mod, slot, nx, ny, mx, my, slides, role, keywords:{en,id}, on, vis, deco:{type,x,y,r,color}, under, mstyle, parts}`.
- **localStorage:**
  - `template-icon-builder-aksen-v1` untuk `{man, items, pv, sheetCols, isSample}`;
  - `tib-canva-brand-id` untuk ID brand (tidak pernah masuk manifest).
- **Ekspor skill:** tombol "Ekspor skill" membuat `deck-icon-slots-skill-v<TIB_VERSION>.zip` dari `SKILL.template.md`. Placeholder `{{VERSION}}`, `{{BUILTIN_MAIN}}`, `{{BUILTIN_MOD}}`, `{{MOD_POOL}}` diisi saat runtime.

---

## 6. Format data

### 6.1 Manifest masuk (`<judul-deck>-icon-manifest.json`, version 2)

```json
{
  "format": "tib-manifest",
  "version": 2,
  "skill_version": "1.4.0",
  "deck": { "title": "Marketing Process Flow", "slides": 11, "resource_slide": 11, "file": "marketing-process-flow-icon-manifest.json" },
  "pack": { "en": "Marketing Process", "id": "Proses Pemasaran" },
  "style": { "family": "accent", "ink": "#1F2A37", "accent": "#E2552D" },
  "resource": { "description": "Use these icons to add clarity and visual impact to your presentation." },
  "icons": [
    {
      "id": "scan-market",
      "name": { "en": "Scan the market", "id": "Pindai pasar" },
      "main": "lu:radar",
      "mod": "lu:search",
      "anchor": "BR",
      "accent": { "fill": "none", "marker": "line", "spark": "none" },
      "slides": [2],
      "role": "slot",
      "keywords": { "en": ["market", "scan", "research", "segment", "opportunity"], "id": ["pasar", "pindai", "riset", "segmen", "peluang"] }
    }
  ]
}
```

Aturan kolom:
- `id`: kebab-case ASCII, unik, maksimal 40 karakter. Dipakai sebagai nama file SVG dan teks pencarian.
- `anchor`: TL TC TR ML MR BL BC BR.
- `accent.fill`: `none|full|offset|half`. `accent.marker`: `line|fill`. `accent.spark`: `none|star4|star4x2`.
- `slides`: tidak boleh kosong. `role`: selalu `"slot"` (sejak v1.4.0).
- `style.family`: `accent` (bawaan) atau `classic`, ditambah `style.mode` `A|B`.
- **Kompatibilitas:** manifest v1 (tanpa `family`, `accent`, `pack`) tetap dibaca. Tanpa `family`, Builder memakai pratinjau Aksen.

### 6.2 Manifest keluar (`manifest-final.json` di ZIP)
Sama seperti manifest masuk, ditambah:
- `generator: {name, version, exported_at}`;
- `offset: {main:[x,y], mod:[x,y]}`;
- `accent.parts` berupa `"auto"` atau `{ "<indeks bagian>": "ink|acc|fillA|fill" }`;
- `accent.spark_pos: [x,y]`;
- `style.family`/`mode` mengikuti pratinjau aktif;
- `pack` hasil edit di langkah Ekspor.

### 6.3 Isi ZIP ekspor
```
<nama-pack>.zip
├─ aksen/<id>-aksen.svg            (480 px, viewBox 0 0 48 48)
├─ garis-solid/<id>-garis-solid.svg  (opsional)
├─ solid-garis/<id>-solid-garis.svg  (opsional)
├─ metadata.csv     file,id,style,title_en,title_id,keywords_en,keywords_id,search,pack,slides,role,main,modifier
├─ resource-page.html
├─ manifest-final.json
└─ LICENSES.txt     (Lucide ISC, Tabler MIT)
```

### 6.4 Pola metadata Canva
- `title_en`: `[Nama EN, Title Case] [Pack EN] [gaya] Icon`, contoh `Hire Engineers Startup Pitch Accent Line Icon`. Kata gaya: Aksen = `Accent Line`, A = `Two Tone`, B = `Solid Two Tone`.
- `title_id`: `Ikon [nama id] [pack id] [gaya id]`.
- `keywords_*`: kata kunci manifest + nama + pack + tag Lucide/Tabler objek dan pengubah (diterjemahkan lewat kamus `EN_ID`) + kata gaya + `icon`/`ikon`. Jumlah per bahasa diatur di UI (10 sampai 25).
- `search`: `brand:<ID brand> <id dengan spasi> <pack en huruf kecil>`.

---

## 7. Build dan pengujian

### Merakit Builder
```
src/template-icon-builder-aksen/
├─ template.html       UI + logika Builder (placeholder /*@ENGINE@*/, /*@ENGINE2@*/, /*@SKILL@*/"", /*@SAMPLE@*/null)
├─ engine.js           mesin bersama + mesin Aksen (sumber: Composer)
├─ engine2.js          compose Klasik + decoMarkup
├─ SKILL.template.md   teks skill deck-icon-slots ({{VERSION}} = TIB_VERSION)
├─ sample.json         data contoh "Creative Workshop Planner" (28 ikon)
├─ asm.py              perakit → menulis HTML hasil + tib.js untuk cek sintaks
└─ patch_*.py, t1.py, t2.py   skrip patch dan uji yang pernah dipakai (referensi)
```
- `asm.py` menulis ke path absolut `/home/claude/template-icon-builder-aksen.html`. **Ubah path di `asm.py`** sesuai repo Anda.
- **Cek sintaks:** `node --check tib.js`.
- **Versi:** konstanta `TIB_VERSION` di `template.html` sekaligus menjadi versi skill yang diekspor. Naikkan bersama `sample.json.skill_version` dan `deck-icon-slots-v*.md`.

### Pengujian yang dipakai selama sesi
- Playwright (Chromium headless) membuka file lewat `file://`. Request CDN dicegat (`page.route`) dan diisi file lokal: lucide UMD, JSZip, tabler nodes JSON.
- **Skenario yang sudah diuji:**
  - impor contoh dan manifest Series A;
  - klik bagian untuk mengganti peran; seret objek, pengubah, kilau;
  - ekspor ZIP lalu cek isi `metadata.csv` dan `manifest-final.json`;
  - ekspor skill;
  - persistensi setelah reload;
  - scroll halaman = tinggi viewport.
- **Uji validitas SVG:** semua ikon Lucide sebagai objek utama dan sebagai pengubah, di 3 gaya (12.732 render), di-parse dengan `DOMParser(..., "image/svg+xml")`. Hasilnya **0 tidak valid** setelah perbaikan 11.1. File di ZIP juga dicek dengan `xml.dom.minidom`.

---

## 8. Skill / instruksi Claude Design: `deck-icon-slots`

Dipakai bersama skill `canva-ipsum-deck`. Versi Markdown dilampirkan ke chat Claude Design. Contoh prompt:
> Buat deck dengan /canva-ipsum-deck. Ikuti juga `deck-icon-slots-v1.4.0.md` untuk slot ikon, Resource Page, dan manifest ikon.

Isi pokok v1.4.0:
1. **Kapan diberi ikon:** hanya isi konten (kartu, langkah, statistik, persona, daftar setara, kontak). Tidak untuk label bagian/eyebrow ("Our product"), judul, paragraf penjelasan, logo, tabel berkotak centang, kutipan, foto.
2. **Slot:** kotak dashed 2px, ukuran 32 sampai 96px (kelipatan 8), plus **label id** (`.icon-slot-label`, absolute di bawah kotak, putih di atas warna aksen, 12px mono). Jarak minimal 24px ke teks di bawahnya.
3. **Gabungan objek + pengubah**, dengan aturan keunikan dan daftar gabungan terlarang (`user-plus`, `calendar-star`, dan seterusnya).
4. **Hanya ikon yang dipakai di slide** (tanpa ekstra). Tidak ada batas jumlah, tetapi harus muat di satu slide Resource Page.
5. **Resource Page satu halaman:** tabel kolom dan ukuran kotak per jumlah ikon. Caption = id.
6. **Manifest:** disimpan sebagai `<judul-deck>-icon-manifest.json` **dan** ditempel utuh sebagai blok kode ```json di akhir jawaban. `deck.title` sama persis dengan judul sampul.
7. **Peta slot per slide** di jawaban akhir.
8. **Penyesuaian dengan canva-ipsum-deck:** aturan "Icons are simple inline SVG" diganti slot; Resource Page adalah slide tambahan; angka bulat; tanpa em dash; warna hex.

---

## 9. Pencarian element di Canva (keputusan v1.2.0)

- Elements Canva menerima filter kreator `brand:<ID>` dan bisa digabung dengan kata kunci (misalnya `brand:BAxxxx hire engineers`). **Sumbernya panduan pihak ketiga (bloggingguide.com), belum diverifikasi resmi.** Pemilik perlu menguji pada satu ikon yang sudah terbit.
- **ID brand** hanya diisi di Builder (langkah Ekspor) dan hanya muncul di `metadata.csv`. Tidak pernah ditulis di deck atau manifest.
- **Tema pack** (`pack.en`/`pack.id`) membuat judul dan pencarian unik per pack. Contohnya `contact-email` di dua pack berbeda tetap bisa dibedakan.
- Judul memakai bahasa alami, bukan kode. Judul berbentuk kode seperti `Meshwork-Hire-Engineers-Icon` dihindari karena berisiko ditolak review, dan nama brand Canva Ipsum tidak unik.

---

## 10. Riwayat versi `deck-icon-slots`

| Versi | Perubahan |
|---|---|
| 1.0.0 | Versi awal: gaya Klasik (garis 2, celah 2, mode A/B), slot kosong tanpa label, ekstra minimal sama dengan jumlah slot, Resource Page boleh lebih dari satu slide. |
| 1.1.0 | Gaya Aksen bagian jadi bawaan; ikon hanya untuk isi konten (bukan eyebrow); Resource Page satu halaman; manifest v2 dengan `style.family` dan `accent`; versi Markdown pertama dengan tabel penyesuaian canva-ipsum-deck. |
| 1.2.0 | Kolom `pack` (tema pack) untuk judul dan pencarian; id harus berupa kata yang jelas. |
| 1.3.0 | Label id wajib di setiap slot + peta slot per slide. |
| 1.3.1 | Manifest wajib ditempel sebagai blok kode JSON lengkap di jawaban akhir. |
| 1.3.2 | Nama file manifest mengikuti judul deck; kolom `deck.file`; `deck.title` sama dengan judul sampul. |
| 1.4.0 | **Tanpa ikon ekstra**: hanya ikon yang dipakai di slide; `role` selalu `slot`; `slides` wajib terisi. |

---

## 11. Masalah yang diketahui dan pekerjaan berikutnya

### 11.1 Bug atribut ganda (sebagian sudah diperbaiki)
- **Gejala:** SVG ekspor tidak valid ("duplicate attribute"), misalnya `<circle ... fill="#000" fill="#000"/>` pada `lu:tag`.
- **Penyebab:** `partStr(p, extra)` menulis atribut asli (`fill="currentColor"`) lalu menambahkan `extra` yang berisi `fill="INK"`.
- **Sudah diperbaiki di `template-icon-builder-aksen.html`:**
  - `partStr` membuang atribut asli yang ditimpa oleh `extra`;
  - `svgFile` menjalankan `dedupeAttrs()` sebagai pengaman.
- **BELUM diperbaiki** di `icon-composer.html`, `icon-composer-aksen.html`, dan `template-icon-builder.html`. Pasang perbaikan `partStr` yang sama, dan tambahkan `dedupeAttrs` di jalur ekspor Composer (`exportSVG`). `icon-composer.html` hanya boleh diubah dengan izin pemilik.

### 11.2 Lain-lain
1. **Verifikasi `brand:`** di Canva setelah ikon pertama terbit. Kalau tidak berfungsi, ganti kolom `search` dengan judul element lengkap.
2. **Peran otomatis belum selalu tepat** (misalnya roda troli ikut jadi aksen). Bisa diperbaiki dengan heuristik per objek bawaan atau peta peran bawaan untuk `MAINS`.
3. **Builder belum bisa mengedit `keywords` per ikon** di UI (hanya id dan nama).
4. **Composer Aksen:** mode "Semua 3 mode" di Kombinasi massal dinonaktifkan untuk keluarga Aksen. Belum ada varian massal untuk `under`/`mstyle`.
5. **`template-icon-builder.html` (v1.0.0)** tertinggal: belum ada gaya Aksen, pack, brand ID, label slot. Anggap arsip.
6. **Canva Ipsum data file** tidak tersedia di akun Claude lain, sehingga Claude Design memakai nama bisnis tebakan. Ini di luar alat ini, tetapi perlu dicatat saat uji.
7. **Pengujian otomatis** belum dijadikan suite tetap. Ide: jadikan `t1.py`/`t2.py` + sweep validitas SVG sebagai `pytest` dengan fixture CDN lokal.
8. **Ide lanjutan yang pernah dibahas:** sumber ikon lain berkarakter mirip Lucide (Heroicons dan Phosphor sudah dibahas; yang dipasang baru Tabler).

---

## 12. Riwayat keputusan penting (kronologis singkat)

1. **Composer Klasik**:
   - menu Mode ikon + Tinta/Aksen dihapus;
   - tab Objek utama/Pengubah dihapus;
   - patokan set (warna, skala, garis, knockout, ujung) berlaku untuk semua ikon;
   - sumber Tabler ditambahkan;
   - indeks Lucide diperbaiki (dedup yang membuang nama kanonik).
2. **Alur Claude Design → ikon:** mode manifest dipisah dari Composer menjadi **Template Icon Builder**, dan skill `deck-icon-slots` dibuat. Style ikon awal = gaya Composer (garis dan solid); bahasa metadata ID + EN.
3. **Uji Series A Pitch** (deck 13 slide, 60 ikon), lalu perbaikan Builder:
   - gaya "garis-garis" dihapus dari Builder;
   - editor ikon tetap ada di detail;
   - pustaka pengganti objek dipindah ke kiri.
4. **Eksplorasi gaya baru** dari referensi hitam + koral:
   - ronde 1 sebagian ditolak (megaphone, rocket, map, phone);
   - ronde 2 "lapisan" disetujui: **Cara 3 (isi bidang) + Cara 4 (penanda di depan dengan celah)**.
5. **Composer Aksen dan Builder Aksen** dibuat sebagai file baru, tanpa mengubah file asli.
6. **Perbaikan dan pembatalan:**
   - scroll: hanya panel kanan yang bergulir;
   - fitur "isian warna untuk lapisan garis" sempat dibuat lalu **dibatalkan atas permintaan pemilik** (salah persepsi). Jangan dipasang lagi tanpa diminta.
7. **Versi Markdown skill** untuk dipakai tanpa instal, lalu v1.2 sampai v1.4 dari hasil uji nyata "Marketing Process Flow": label slot, manifest siap salin, nama file per deck, tanpa ekstra.
8. **Bug SVG atribut ganda** ditemukan dari file `price-tag-aksen.svg` dan diperbaiki di Builder Aksen.

---

## 13. Glosarium (ID → EN / kode)

| Istilah | Arti / nama di kode |
|---|---|
| Objek utama | `main` |
| Pengubah | `mod`, modifier |
| Jangkar | `anchor` / `slot` (posisi sudut pengubah) |
| Tinta / Aksen | `ink` / `accent` (2 warna set) |
| Celah knockout | `gap`, mask pemotong di sekitar lapisan atas |
| Warna bagian | `parts` / `ROLES` (`ink`, `acc`, `fillA`, `fill`) |
| Isi bidang (Cara 3) | `under` (`none`, `full`, `offset`, `half`) |
| Penanda (Cara 4) | `mstyle` (`line`, `fill`) |
| Kilau | deco `star4` / `star4x2` |
| Gaya Klasik / Aksen bagian | `family: classic` / `accent` (Builder: pratinjau `A`,`B` / `X`) |
| Tema pack | `pack.en`, `pack.id` |
| Slot ikon | `.icon-slot[data-icon]` + `.icon-slot-label` di deck |
| Resource Page | slide terakhir berisi semua ikon pack |

---

## 14. Update 14 Oktober 2026: Template Icon Builder v1.5.1 (slot dan ekstra)

Dibangun di atas `template-v1.5.0.html` (versi dengan Hugeicons, SVG fill langsung untuk Canva, dan submission profile). Semua file versi lama tetap ada.

**Masalah:** deck menghasilkan 24 slot + 24 ekstra, tetapi ekspor hanya 24. Penyebabnya: sejak v1.4.0, Builder mengeluarkan ikon `role: "extra"` secara otomatis saat impor.

**Perubahan Builder v1.5.1:**
- Ekstra tidak lagi dikeluarkan saat impor; hanya diberi catatan. State lama yang ekstranya dimatikan dipulihkan otomatis (flag `v151` di localStorage).
- Langkah Ekspor punya bagian **Isi ekspor**: `exSlot` (ikon slot deck), `exExtra` (ikon ekstra), `exSplit` (pisahkan folder).
- Path ZIP lewat `pathOf(it, style)`: `aksen/slot-deck/<id>-aksen.svg` dan `aksen/ekstra/<id>-aksen.svg`. Tanpa `exSplit`, semua langsung di folder gaya. Nama file di `metadata.csv (Canva)` tetap tanpa folder.
- Urutan ekspor: slot dulu, lalu ekstra. Pratinjau Resource Page dan `resource-page.html` dikelompokkan "Used in this deck" lalu "Extra icons in the same set".

**Skill deck-icon-slots v1.5.1:** bawaannya hanya ikon slot. Ekstra hanya dibuat kalau prompt memintanya (`role: "extra"`, `slides: []`), tidak dipasang di slide konten, dan tampil sebagai kelompok kedua di Resource Page. Kosakata tetap memuat Hugeicons (`hg:`).

**File baru:**
- `tools/template-icon-builder-aksen-v1.5.1.html`
- `src/template-icon-builder-aksen/template-v1.5.1.html`, `SKILL-v1.5.1.template.md`, `asm-v1.5.1.py`
- `skill/deck-icon-slots-v1.5.1.md` (paket `.zip` diekspor dari Builder v1.5.1 lewat tombol "Ekspor skill", karena vocabulary Hugeicons dimuat dari CDN di browser)
- `tests/builder-slot-extra-v1.5.1.test.cjs`

**Catatan versi:** file `template-icon-builder-aksen.html` / skill "v1.5.0" yang dikirim lewat chat Claude pada 14 Oktober dibangun dari v1.4.0 lama dan **tidak dipakai**. Jalur resmi: v1.5.0 (folder ini) lalu v1.5.1.

**Eksplorasi terpisah:** `reference/geometris-uji.html`: uji gaya Geometris garis (sudut tajam, 4 template komposisi: Tunggal + penanda, Ditopang, Diapit dua tangan, Tiga unsur). Belum dipasang ke Composer/Builder.

## 15. Icon Composer v1.5.1 — metadata.csv untuk Chrome extension (2026-10-14)
- File baru: `icon-creator-handoff/tools/icon-composer-aksen-v1.5.1.html` (basis: Composer v1.5.0; v1.5.0 tidak diubah).
- Panel Pack → "Metadata Canva · Chrome extension": checkbox Sertakan metadata.csv, Artist (hashtagben/chital), Bahasa (en/id), Nama di judul (Otomatis/Nama ikon), Tema pack EN/ID, Kata kunci 10/15/20/25, Deskripsi. Pengaturan disimpan di localStorage `icon-composer-meta-v1`.
- ZIP berisi `metadata.csv`: kolom `filename,title,keywords,Artist,locale,description`, BOM + CRLF, filename = nama SVG di ZIP (sudah diuji cocok 14/14, en & id).
- Judul en: `[Nama] [Tema pack] [Gaya] Icon`; mode Otomatis memakai nama objek pustaka (EN) karena nama ikon di set umumnya berbahasa Indonesia. Judul id: `Ikon [nama ikon] [tema pack] [gaya]`.
- Kata kunci: tag Lucide/Tabler (+ terjemahan EN_ID untuk id), helper diambil dari Builder v1.6.0.
- Belum: SVG fill langsung (editable color Canva) — ditunda, Ika akan cek sendiri. Format Sprite SVG tidak menyertakan metadata.

## 16. Template Icon Builder v1.6.0 — Library Kustom `cu:` (2026-10-14)
- File: `icon-creator-handoff/tools/template-icon-builder-aksen-v1.6.0.html` (basis: v1.5.1; semua fitur v1.5.1 seperti `exSlot`/`exExtra`/`exSplit` tetap ada). `TIB_VERSION = "1.6.0"`.
- Namespace baru `cu:` diterima (`LIB_RE = /^(lu|tb|hg|cu):/`). Data Library Kustom disematkan di file sebagai `CU_DATA` (format `cu-icons`), contoh `cu:espresso-tamper`.
- Peran bawaan ikon kustom lewat `cuRoles(key, n)`; pemilih ikon punya tombol sumber "Kustom" (`data-psrc="cu"`).
- LICENSES.txt mencantumkan "Library Kustom (cu:)"; vocabulary yang diekspor ("Ekspor skill") memuat bagian `custom`.
- Helper kata kunci dari versi ini dipakai juga oleh Icon Composer v1.5.1 (lihat §15).
- Tes: `icon-creator-handoff/tests/builder-custom-v1.6.0.test.cjs`.
- Belum: file `skill/deck-icon-slots-v1.6.0.md` yang memuat kosakata `cu:`; versi skill terbaru di folder masih v1.5.1 (paket bisa diekspor dari Builder v1.6.0).
