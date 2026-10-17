# Deck Icon Slots v1.5.1 (versi Markdown, tanpa instal)

> **Cara pakai.** Lampirkan file ini di Claude Design bersama brief deck, lalu tulis misalnya:
> "Buat deck dengan /canva-ipsum-deck. Ikuti juga `deck-icon-slots-v1.5.1.md` untuk slot ikon, Resource Page, dan manifest ikon."
> File ini berdiri sendiri. Semua kosakata dan format yang dibutuhkan sudah ada di sini, tidak perlu `references/vocabulary.json`.

---

## 0. Untuk Claude: cara menggabungkan dengan canva-ipsum-deck

Jalankan canva-ipsum-deck seperti biasa. File ini **menambah** tiga keluaran dan **mengganti satu aturan**:

| Aturan canva-ipsum-deck | Saat file ini dipakai |
|---|---|
| "Icons are simple inline SVG" | **Diganti.** Setiap tempat ikon menjadi slot kosong bertanda `data-icon` (bagian 2). Jangan menggambar SVG ikon di slide konten. |
| 10 sampai 12 slide | Tetap. Resource Page adalah **satu slide tambahan** di akhir, di luar hitungan itu. |
| Nothing blank | Slot ikon adalah pengecualian yang disengaja. Slot selalu punya `data-icon`, `aria-label`, dan label id yang terlihat, jadi tidak dianggap kosong. |
| Angka bulat, font kelipatan 4px, jarak kelipatan 8px | Berlaku juga untuk slot dan Resource Page. Semua ukuran di file ini sudah bulat. |
| Tanpa em dash, tanpa huruf kapital semua, warna hex | Berlaku juga untuk caption, label, dan isi manifest. |

Aturan canva-ipsum-deck lain (Canva Ipsum, tahun 2036, wireframe, metadata pengajuan) tetap berlaku tanpa perubahan. Kalau ada aturan yang bertabrakan dan tidak tercantum di tabel, aturan canva-ipsum-deck yang menang.

---

## 1. Tiga keluaran wajib

1. **Slot ikon** di slide konten: kotak kosong bertanda `data-icon` dengan label id yang terlihat, tanpa gambar ikon.
2. **Slide Resource Page** di akhir deck: semua ikon pack dalam **satu halaman**, berupa kotak kosong + id-nya.
3. **`<judul-deck>-icon-manifest.json`**: resep setiap ikon untuk Template Icon Builder, termasuk tema pack untuk judul dan pencarian element. Disimpan sebagai file **dan** ditempel sebagai blok kode JSON di jawaban akhir.

Ikon tidak digambar di sini. Template Icon Builder merakit SVG-nya dari manifest. Gaya bawaannya **Aksen bagian**:
- garis 3,5 dengan ujung bulat dan celah knockout 1,25;
- wadah berwarna tinta, isi atau bidang berwarna aksen;
- pengubah tampil sebagai penanda aksen di depan objek, dengan celah.

Gaya klasik (garis 2, mode Garis-solid dan Solid-garis) tetap tersedia. Setelah dirakit, ikon di-submit sebagai element Canva. Karena itu setiap ikon harus **unik** dan **tidak menyerupai ikon yang sudah ada**.

## 2. Kapan sebuah tempat diberi ikon

Ikon dipakai untuk **isi konten**, bukan untuk kerangka halaman. Beri ikon pada:
- kartu fitur, tujuan, langkah, atau poin bernomor;
- angka statistik (peserta, durasi, jumlah, metrik);
- label persona, peran, atau kategori di dalam kartu;
- item daftar yang setara dan berdiri sendiri, misalnya 3 sampai 6 keunggulan;
- baris kontak (email, situs, telepon).

Jangan beri ikon pada:
- **label bagian, eyebrow, atau kicker**, yaitu teks kecil di atas atau di samping judul slide, seperti "Our product", "About us", "The problem", atau nama brand. Teks seperti ini tetap berupa teks saja;
- judul slide, judul besar, dan subjudul;
- paragraf penjelasan atau pengantar halaman;
- nama brand, logo, dan nomor halaman;
- checklist dan tabel yang sudah punya kotak centang;
- formulir isian dan skala nilai;
- kutipan;
- foto atau placeholder gambar.

Satu kartu paling banyak satu ikon. Kalau ragu, tanyakan: "apakah ikon ini membantu membedakan isi ini dari isi lain di slide yang sama?" Kalau tidak, jangan pasang.

## 3. Menandai slot

Setiap slot adalah kotak persegi kosong **dengan label id yang terlihat**. Label memberi tahu designer ikon mana yang dipasang di tempat itu:

```html
<div class="icon-slot" data-icon="scan-market" aria-label="Scan the market"
     style="position:relative;flex:none;width:56px;height:56px;box-sizing:border-box;border:2px dashed currentColor;border-radius:8px">
  <span class="icon-slot-label"
        style="position:absolute;left:0;top:100%;margin-top:4px;padding:0 4px;white-space:nowrap;font-family:'Courier New',monospace;font-size:12px;line-height:16px;color:#FFFFFF;background:#E2552D;border-radius:4px">scan-market</span>
</div>
```

- **Setiap slot wajib punya label** `icon-slot-label` berisi id yang **persis sama** dengan `data-icon`. Tanpa label, designer tidak tahu ikon mana yang dipasang di slot itu.
- Label menempel di bawah slot (`position:absolute`), jadi tidak menggeser tata letak. Beri jarak minimal 24px antara slot dan teks di bawahnya agar label tidak menimpa teks.
- Warna label: teks `#FFFFFF` di atas warna aksen deck (hex), supaya jelas terbaca sebagai penanda kerja, bukan isi template.
- Label dan slot adalah penanda sementara. Saat ikon asli dipasang di Canva, designer menghapus keduanya.
- Tidak ada SVG, emoji, atau huruf lain di dalam kotak slot selain label.
- Ukuran slot mengikuti peran:
  - 32 atau 40px di baris tabel atau chip;
  - 48, 56, atau 64px di kartu;
  - 72, 80, atau 96px di kartu besar.
- **Konsep yang sama memakai id yang sama** di semua slide. Contoh: "Idea sprint" di slide 2, 6, dan 7 tetap `idea-sprint`, dan labelnya juga sama.
- Garis slot mengikuti warna teks deck (`currentColor`).

**Peta slot di jawaban akhir.** Setelah deck selesai, tulis daftar singkat di jawaban, satu baris per slide, misalnya:

```
Slide 2: scan-market, name-pain, build-mix, time-launch, project-goal
Slide 7: product-fit, price-tag, place-reach, promo-push
```

## 4. Merakit ikon: objek utama + pengubah

Setiap ikon adalah gabungan:
- **objek utama**: kata benda, misalnya kalender, lampu, atau pengguna;
- **pengubah**: aksi atau status, misalnya jam, plus, atau centang. Di gaya Aksen, pengubah menjadi penanda aksen di sudut, di depan objek.

### Kosakata

- **Objek bawaan:** `face` (Wajah), `doc` (Dokumen), `clock` (Jam), `bell` (Lonceng), `cart` (Troli), `box` (Kotak), `truck` (Truk), `door` (Pintu), `heart` (Hati), `ticket` (Tiket), `laptop` (Laptop), `chat` (Obrolan), `home` (Rumah), `pot` (Panci), `book` (Buku), `pin` (Lokasi), `user` (Pengguna), `calendar` (Kalender), `phone` (Ponsel), `store` (Toko)
- **Pengubah bawaan:** `bubble` (Obrolan), `card` (Kartu), `doc` (Dokumen), `lock` (Gembok), `mail` (Amplop), `plus` (Plus), `check` (Centang), `cross` (Silang), `parcel` (Paket), `pinm` (Pin), `pencil` (Pensil), `cone` (Kerucut), `clockm` (Jam), `star` (Bintang), `heartm` (Hati), `bulb` (Lampu)
- **Lucide:** `lu:<nama-kebab>`, contoh `lu:lightbulb`, `lu:users`, `lu:hammer`, `lu:server`, `lu:smartphone`, `lu:chart-column`
- **Tabler** (tanpa ikon merek): `tb:<nama-kebab>`, contoh `tb:presentation`, `tb:armchair`
- **Hugeicons Free:** `hg:<nama-kebab>`, contoh `hg:analytics-01`, `hg:warehouse`, `hg:user-add-01`
- **Saran pengubah** yang terbaca baik di ukuran kecil: `lu:plus`, `lu:minus`, `lu:check`, `lu:x`, `lu:star`, `lu:search`, `lu:clock`, `lu:timer`, `lu:bell`, `lu:lock`, `lu:shield`, `lu:heart`, `lu:pencil`, `lu:settings`, `lu:cloud`, `lu:share-2`, `lu:download`, `lu:upload`, `lu:refresh-cw`, `lu:triangle-alert`, `lu:info`, `lu:zap`, `lu:eye`, `lu:flag`, `lu:bookmark`, `lu:link`, `lu:user`, `lu:message-circle`, `lu:gift`, `lu:trophy`, `lu:target`, `lu:rocket`, `lu:hourglass`, `lu:thumbs-up`, `lu:send`, `lu:tag`, `lu:map-pin`, `lu:sun`, `lu:leaf`, `lu:music`, `lu:coffee`
- Pakai nama Lucide atau Tabler yang umum. Kalau sebuah nama ternyata tidak ada, Builder akan menyarankan nama terdekat.

### Memilih bentuk untuk gaya Aksen

- Objek utama terbaik punya **wadah tertutup** (layar, dokumen, kotak, kalender, lingkaran) dengan isi di dalamnya. Builder otomatis memberi tinta pada wadah dan aksen pada isi.
- Pengubah terbaik adalah **glif garis sederhana**: panah, plus, centang, gembok, jam, muat ulang. Hindari pengubah yang rumit atau penuh detail.
- Untuk konsep "baru", "istimewa", atau "peluncuran", pakai kilau (`accent.spark`), bukan `lu:sparkles` sebagai pengubah.
- Jangan menumpuk pengubah pada objek yang sudah penuh detail.

### Aturan keunikan (wajib)

1. Setiap ikon **harus punya pengubah**. Ikon pustaka tanpa pengubah sama dengan salinan.
2. **Hindari gabungan yang sudah ada sebagai ikon pustaka.**
   - Contoh yang dilarang: `user-plus`, `user-star`, `user-check`, `calendar-search`, `calendar-clock`, `calendar-star`, `globe-lock`, `file-check`, `mail-heart`, `heart-plus`, `message-plus`.
   - Pilih pengubah yang menambah makna khusus konsep. Contoh: kalender + jam pasir untuk "jadwal sesi", bukan kalender + jam.
3. Tidak boleh ada dua ikon dengan objek dan pengubah yang sama dalam satu pack.
4. Objek utama dan pengubah tidak boleh benda yang sama.
5. Dilarang memakai logo merek, huruf, atau angka sebagai objek utama.

**Posisi pengubah (`anchor`):** default `BR` (kanan bawah). Pakai `TR`, `BL`, atau `TL` hanya bila detail penting objek utama ada di kanan bawah.

## 5. Jumlah ikon: slot deck, ekstra hanya jika diminta

**Bawaan: manifest hanya berisi ikon slot**, yaitu ikon yang benar-benar dipakai di slide konten.
- Ikon slot: `"role": "slot"`, minimal satu nomor di `slides`.
- Tidak ada batas jumlah ikon slot, asalkan setiap ikon bermakna, lolos aturan keunikan, dan semuanya muat di satu slide Resource Page.
- Konsep yang muncul di beberapa slide tetap satu ikon dengan satu id.

**Ikon ekstra hanya dibuat kalau prompt memintanya secara jelas**, misalnya "tambahkan 20 ikon ekstra". Kalau tidak diminta, jangan buat ekstra.
- Ikon ekstra: `"role": "extra"`, `"slides": []`, satu tema dengan deck, dan tetap lolos aturan keunikan.
- Ekstra **tidak dipasang di slide konten**. Ekstra hanya muncul di manifest dan di kelompok kedua Resource Page.
- Buat sejumlah yang diminta, tidak lebih.

## 6. Slide Resource Page (slide terakhir, satu halaman)

Tambahkan **satu** slide setelah slide konten terakhir. Contoh: deck 12 slide menjadi 13.

- Ikuti gaya visual deck: latar, font, warna, aksen, dan safe area 96px.
- Judul "Resource Page" dan satu kalimat deskripsi dalam bahasa Inggris, misalnya "Use these icons to add clarity and visual impact to your presentation."
- Isi slide adalah **grid semua id di manifest**. Kalau ada ekstra, bagi dua kelompok berlabel kecil: "Used in this deck" (slot) lalu "Extra icons in the same set" (ekstra). Setiap sel berisi:
  - kotak kosong `data-icon="<id>"` dengan ukuran sama di semua sel;
  - di bawahnya, caption id dengan huruf monospace kecil, misalnya `idea-sprint`.
- Urutan: ikon slot sesuai kemunculan pertama di deck, lalu ekstra.
- **Semua ikon harus muat di satu slide 1920 x 1080.** Kolom dan ukuran sel menyesuaikan jumlah ikon:

| Jumlah ikon | Kolom | Kotak ikon | Caption |
|---|---|---|---|
| sampai 12 | 4 | 72px | 20px |
| sampai 24 | 6 | 64px | 16px |
| sampai 40 | 8 | 56px | 16px |
| sampai 60 | 10 | 48px | 16px |
| sampai 96 | 12 | 40px | 12px |
| lebih dari 96 | 14 | 32px | 12px |

- Kecilkan jarak antarbaris (tetap kelipatan 8px) sebelum mengecilkan kotak. Jangan membuat "Resource Page (2)".
- Caption harus **persis sama** dengan id di manifest, karena id dipakai sebagai nama file SVG dan baris metadata.

## 7. Manifest ikon (`<judul-deck>-icon-manifest.json`)

Keluarkan manifest dengan **dua cara sekaligus**:
1. Simpan sebagai file di proyek dengan nama **`<judul-deck>-icon-manifest.json`**: judul deck dalam huruf kecil, kebab-case, ASCII. Contoh: deck "Marketing Process Flow" menjadi `marketing-process-flow-icon-manifest.json`. Nama ini mencegah manifest dari deck berbeda tertukar.
2. **Tempel isinya utuh** sebagai satu blok kode ```json di bagian paling akhir jawaban, setelah peta slot. File di proyek tidak selalu bisa diunduh langsung, jadi blok kode ini yang disalin ke Template Icon Builder (langkah Impor, tempel di kotak teks).

Blok kode harus JSON valid dan lengkap: semua ikon di manifest, tanpa dipotong, tanpa komentar, tanpa `...`.

```json
{
  "format": "tib-manifest",
  "version": 2,
  "skill_version": "1.5.1",
  "deck": { "title": "Creative Workshop Planner", "slides": 13, "resource_slide": 13, "file": "creative-workshop-planner-icon-manifest.json" },
  "pack": { "en": "Creative Workshop", "id": "Lokakarya Kreatif" },
  "style": { "family": "accent", "ink": "#141414", "accent": "#FECC33" },
  "resource": { "description": "Use these icons to add clarity and visual impact to your presentation." },
  "icons": [
    {
      "id": "idea-sprint",
      "name": { "en": "Idea sprint", "id": "Sprint ide" },
      "main": "lu:lightbulb",
      "mod": "lu:timer",
      "anchor": "BR",
      "accent": { "fill": "none", "marker": "line", "spark": "none" },
      "slides": [2, 6, 7],
      "role": "slot",
      "keywords": {
        "en": ["idea", "brainstorm", "sprint", "workshop", "creativity"],
        "id": ["ide", "curah gagasan", "sprint", "lokakarya", "kreativitas"]
      }
    },
    {
      "id": "launch-day",
      "name": { "en": "Launch day", "id": "Hari peluncuran" },
      "main": "calendar",
      "mod": "lu:rocket",
      "anchor": "BR",
      "accent": { "fill": "half", "marker": "line", "spark": "star4" },
      "slides": [],
      "role": "extra",
      "keywords": {
        "en": ["launch", "release", "date", "milestone", "go live"],
        "id": ["peluncuran", "rilis", "tanggal", "tonggak", "mulai"]
      }
    }
  ]
}
```

### Isi setiap kolom

- `pack`: **tema pack**, dipakai Builder untuk judul element dan teks pencarian Canva agar ikon pack ini tidak tercampur dengan pack lain.
  - `pack.en`: 1 sampai 3 kata bahasa Inggris, Title Case, menggambarkan niche deck. Contoh: `Startup Pitch`, `Creative Workshop`, `Wedding Planner`.
  - `pack.id`: terjemahan bahasa Indonesia, misalnya `Pitch Startup`.
  - Jangan memakai nama brand atau perusahaan di deck (nama Canva Ipsum), nama alat, atau kata umum seperti `Presentation` saja.
  - Satu tema untuk semua ikon di manifest.
  - Builder membentuk judul `[nama ikon] [tema pack] [gaya] Icon`, misalnya `Hire Engineers Startup Pitch Accent Line Icon`, dan teks pencarian `hire engineers startup pitch`. ID brand Canva diisi di Builder, tidak ditulis di sini.
- `deck.title`: judul utama deck, **persis sama** dengan judul di slide sampul (misalnya `Marketing Process Flow`). Builder memakainya untuk nama ZIP dan judul pack.
- `deck.slides`: jumlah slide termasuk Resource Page. `deck.resource_slide`: nomor slide Resource Page.
- `deck.file`: nama file manifest ini, misalnya `marketing-process-flow-icon-manifest.json`.
- `id`: bahasa Inggris, huruf kecil, kebab-case, ASCII, unik, maksimal 40 karakter. Pakai kata yang jelas karena id juga menjadi teks pencarian, misalnya `hire-engineers`, bukan `he-01`.
- `name.en` dan `name.id`: nama singkat dalam bahasa Inggris dan Indonesia.
- `main`, `mod`: dari kosakata di bagian 4.
- `anchor`: `TL`, `TC`, `TR`, `ML`, `MR`, `BL`, `BC`, atau `BR`.
- `accent` (opsional, untuk gaya Aksen). Kalau tidak diisi, semua bernilai default.
  - `fill`: isi bidang wadah dengan warna aksen.
    - `none` (default): hanya bagian isi yang beraksen.
    - `full`: seluruh bidang diisi.
    - `offset`: isi digeser ke kanan bawah.
    - `half`: separuh bawah diisi.
    - Hanya untuk objek berwadah tertutup. Pakai di sekitar 20 sampai 30% ikon agar pack bervariasi tapi tetap satu keluarga.
  - `marker`: bentuk penanda pengubah.
    - `line` (default): glif garis.
    - `fill`: bentuk solid dengan glif dilubangi. Cocok untuk status seperti centang, peringatan, atau kunci.
  - `spark`: kilau bintang 4 sudut, yaitu `none` (default), `star4`, atau `star4x2`. Pakai hemat, untuk konsep baru, istimewa, prestasi, atau peluncuran.
  - `parts` dan `spark_pos` diisi oleh Builder setelah ikon disunting. Jangan ditulis di sini.
- `offset` (opsional): geseran manual `{"main":[x,y],"mod":[x,y]}` dalam satuan grid 48. Biasanya tidak diisi. Builder menuliskannya ke `manifest-final.json` setelah ikon digeser.
- `slides`: nomor slide tempat slot muncul. Wajib terisi untuk slot; `[]` untuk ekstra.
- `role`: `"slot"` (bawaan) atau `"extra"` (hanya jika diminta).
- `keywords`: 5 sampai 10 kata per bahasa, **khusus konsep ini**. Builder sudah menambahkan kata umum seperti "icon", "outline", dan nama objek.
- `style.family`: `accent` (default) atau `classic`.
  - Untuk `classic`, tambahkan `style.mode`: `A` (objek garis, pengubah solid) atau `B` (objek solid, pengubah garis).
- `style.ink`: warna teks tergelap di deck, dalam hex.
- `style.accent`: warna aksen utama deck, yaitu warna sorotan paling menonjol, dalam hex.

## 8. Cek sebelum selesai

Jalankan bersama langkah "Check before declaring it done" dari canva-ipsum-deck.

- [ ] Tidak ada SVG ikon tergambar di slide konten. Semua tempat ikon berupa slot `data-icon`.
- [ ] Tidak ada slot ikon di label bagian, eyebrow, judul, atau paragraf penjelasan.
- [ ] Setiap slot di slide konten punya label `icon-slot-label` yang sama persis dengan `data-icon`, dan label tidak menimpa teks.
- [ ] Setiap `data-icon` di slide ada di manifest, dan sebaliknya.
- [ ] Jawaban akhir memuat peta slot per slide.
- [ ] File manifest bernama `<judul-deck>-icon-manifest.json`, dan `deck.title` sama persis dengan judul sampul.
- [ ] Jawaban akhir ditutup dengan blok kode ```json berisi manifest yang utuh dan valid.
- [ ] Slide Resource Page hanya satu, memuat semua id, dengan caption yang sama persis.
- [ ] Setiap ikon punya `mod`, tidak ada gabungan yang dilarang, dan tidak ada yang dobel.
- [ ] Nilai `accent` hanya dari daftar di bagian 7, dan `fill` hanya dipakai pada objek berwadah.
- [ ] Manifest punya `pack` (en dan id) yang spesifik ke niche deck, tanpa nama brand.
- [ ] Nama dan kata kunci ada dalam dua bahasa.
- [ ] Setiap ikon `slot` muncul di minimal satu slide konten. Ikon `extra` hanya ada kalau prompt memintanya, dengan `slides: []`, dan jumlahnya sesuai permintaan.
- [ ] Semua ukuran slot, caption, dan jarak bulat (font kelipatan 4px, jarak kelipatan 8px).
