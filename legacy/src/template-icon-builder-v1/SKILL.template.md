---
name: deck-icon-slots
description: Gunakan saat membuat deck presentasi atau template di Claude Design yang ikonnya akan dibuat dengan Template Icon Builder, untuk menandai slot ikon, menambah slide Resource Page, dan menulis icon-manifest.json.
---

# Deck Icon Slots · v{{VERSION}}

Skill ini membuat deck siap dilengkapi ikon buatan sendiri. Ada tiga keluaran wajib:

1. **Slot ikon** di slide konten: kotak kosong bertanda `data-icon`, tanpa gambar ikon.
2. **Slide Resource Page** di akhir deck: semua ikon pack sebagai kotak kosong + id-nya.
3. **`icon-manifest.json`**: resep setiap ikon untuk Template Icon Builder.

Ikon tidak digambar di sini. Template Icon Builder yang merakit SVG-nya dari manifest dengan gaya Icon Composer: garis 2, celah knockout 2, dua warna (tinta + aksen), dalam dua mode warna. Setelah itu ikon di-submit sebagai element Canva. Karena itu setiap ikon harus **unik** dan **tidak menyerupai ikon yang sudah ada**.

## 1. Kapan sebuah tempat diberi ikon

Beri ikon pada:
- kartu fitur, tujuan, langkah, atau poin bernomor;
- angka statistik (peserta, durasi, jumlah);
- label persona, peran, kategori;
- chip navigasi dan judul bagian;
- baris kontak (email, situs, telepon).

Jangan beri ikon pada:
- checklist dan tabel yang sudah punya kotak centang;
- formulir isian dan skala nilai;
- kutipan;
- foto atau placeholder gambar;
- judul besar.

Satu kartu = paling banyak satu ikon.

## 2. Menandai slot

Setiap slot adalah kotak persegi kosong:

```html
<div class="icon-slot" data-icon="idea-sprint" aria-label="Idea sprint"
     style="width:56px;height:56px;border:1.5px dashed currentColor;border-radius:8px;opacity:.55"></div>
```

- Tidak ada SVG, emoji, atau huruf di dalam slot.
- Ukuran mengikuti peran: 32–40px di baris tabel atau chip, 48–64px di kartu, 72–96px di kartu besar.
- **Konsep yang sama memakai id yang sama** di semua slide. Contoh: "Idea sprint" di slide 2, 6, dan 7 tetap `idea-sprint`.
- Warna garis slot mengikuti warna teks deck.

## 3. Merakit ikon: objek utama + pengubah

Setiap ikon adalah gabungan:
- **objek utama**: kata benda, misalnya kalender, lampu, atau pengguna;
- **pengubah kecil di pojok**: aksi atau status, misalnya jam, plus, atau bintang.

Pengubah dipotong rapi dengan celah dari objek utama.

**Kosakata:**
- Objek bawaan: {{BUILTIN_MAIN}}
- Pengubah bawaan: {{BUILTIN_MOD}}
- Lucide: `lu:<nama-kebab>`, contoh `lu:lightbulb`, `lu:users`, `lu:hammer`
- Tabler (tanpa ikon merek): `tb:<nama-kebab>`, contoh `tb:presentation`, `tb:armchair`
- Saran pengubah yang terbaca baik di ukuran kecil: {{MOD_POOL}}
- Daftar lengkap ada di `references/vocabulary.json` bila tersedia. Kalau ragu sebuah nama ada atau tidak, pakai nama yang umum. Builder akan menyarankan nama terdekat.

**Aturan keunikan (wajib):**
1. Setiap ikon **harus punya pengubah**. Ikon pustaka tanpa pengubah sama dengan salinan.
2. **Hindari gabungan yang sudah ada sebagai ikon pustaka.** Contoh yang dilarang: `user-plus`, `user-star`, `user-check`, `calendar-search`, `calendar-clock`, `globe-lock`, `file-check`, `mail-heart`, `heart-plus`, `message-plus`. Pilih pengubah yang menambah makna khusus konsep. Contoh: kalender + jam pasir untuk "jadwal sesi", bukan kalender + jam.
3. Tidak boleh ada dua ikon dengan objek dan pengubah yang sama dalam satu pack.
4. Objek utama dan pengubah tidak boleh benda yang sama.
5. Dilarang memakai logo merek, huruf, atau angka sebagai objek utama.

**Posisi pengubah (`anchor`):** default `BR` (kanan bawah). Pakai `TR`, `BL`, atau `TL` hanya bila detail penting objek utama ada di kanan bawah.

## 4. Memperbanyak aset (ekstra)

Semakin banyak ikon unik, semakin baik untuk pack Canva. Setelah semua slot terisi:
- Tambahkan ikon `"role": "extra"` yang masih satu tema dengan deck. Caranya: objek utama dari deck dengan pengubah lain, atau konsep terkait yang wajar muncul di presentasi sejenis.
- Tidak ada batas jumlah. Patokannya: setiap ekstra tetap bermakna dan lolos aturan keunikan.
- Target awal minimal sama banyak dengan jumlah slot.

## 5. Slide Resource Page (slide terakhir)

Tambahkan satu slide setelah slide konten terakhir. Contoh: deck 12 slide menjadi 13.

- Ikuti gaya visual deck: latar, font, warna, aksen.
- Judul "Resource Page" dan satu kalimat deskripsi (bahasa Inggris), misalnya "Use these icons to add clarity and visual impact to your presentation."
- Isi slide adalah **grid semua id di manifest** (slot + ekstra). Setiap sel berisi:
  - kotak kosong `data-icon="<id>"`, ukuran sama di semua sel;
  - di bawahnya, caption id dengan huruf monospace kecil, misalnya `idea-sprint`.
- Urutan: ikon slot sesuai urutan kemunculan pertama di deck, lalu ekstra yang dikelompokkan per objek utama.
- Kolom grid menyesuaikan jumlah:
  - ≤12 ikon → 4 kolom;
  - ≤24 → 6 kolom;
  - ≤40 → 8 kolom;
  - ≤60 → 10 kolom;
  - lebih dari 60 → lanjutkan di slide berikutnya berjudul "Resource Page (2)".
- Caption harus **persis sama** dengan id di manifest, karena id dipakai sebagai nama file SVG dan baris metadata.

## 6. icon-manifest.json

Tulis sebagai file `icon-manifest.json`. Kalau tidak bisa membuat file, tulis sebagai satu blok kode JSON di akhir jawaban.

```json
{
  "format": "tib-manifest",
  "version": 1,
  "skill_version": "{{VERSION}}",
  "deck": { "title": "Creative Workshop Planner", "slides": 13, "resource_slide": 13 },
  "style": { "mode": "A", "ink": "#141414", "accent": "#FECC33" },
  "resource": { "description": "Use these icons to add clarity and visual impact to your presentation." },
  "icons": [
    {
      "id": "idea-sprint",
      "name": { "en": "Idea sprint", "id": "Sprint ide" },
      "main": "lu:lightbulb",
      "mod": "lu:timer",
      "anchor": "BR",
      "slides": [2, 6, 7],
      "role": "slot",
      "keywords": {
        "en": ["idea", "brainstorm", "sprint", "workshop", "creativity"],
        "id": ["ide", "curah gagasan", "sprint", "lokakarya", "kreativitas"]
      }
    }
  ]
}
```

Isi setiap kolom:
- `id`: bahasa Inggris, huruf kecil, kebab-case, ASCII, unik, maksimal 40 karakter.
- `name.en` dan `name.id`: nama singkat dalam bahasa Inggris dan Indonesia.
- `main`, `mod`: dari kosakata di bagian 3.
- `anchor`: `TL`, `TC`, `TR`, `ML`, `MR`, `BL`, `BC`, atau `BR`.
- `offset` (opsional): geseran manual `{"main":[x,y],"mod":[x,y]}` dalam satuan grid 48. Biasanya tidak diisi. Builder menuliskannya ke `manifest-final.json` setelah ikon digeser.
- `slides`: nomor slide tempat slot muncul. Untuk ekstra, isi `[]`.
- `role`: `"slot"` atau `"extra"`.
- `keywords`: 5–10 kata per bahasa, **khusus konsep ini**. Builder sudah menambahkan kata umum seperti "icon", "outline", dan nama objek.
- `style.mode`: mode warna yang tampil di deck.
  - `A`: objek utama garis, pengubah solid aksen. Ini default.
  - `B`: objek utama solid aksen, pengubah garis.
  - Builder tetap mengekspor kedua mode.
- `style.ink`: warna teks tergelap di deck.
- `style.accent`: warna aksen utama deck, yaitu warna sorotan atau highlight paling menonjol.

## 7. Cek sebelum selesai

- [ ] Setiap `data-icon` di slide ada di manifest, dan sebaliknya.
- [ ] Slide Resource Page memuat semua id, dengan caption yang sama persis.
- [ ] Setiap ikon punya `mod`, tidak ada gabungan yang dilarang, dan tidak ada yang dobel.
- [ ] Nama dan kata kunci ada dalam dua bahasa.
- [ ] Jumlah ekstra minimal sama dengan jumlah slot.
