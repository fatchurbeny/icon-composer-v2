# Mesin `offset`

- **Asal:** `legacy/style/offset-composer-v1.0.1.html` (`compose`, `closed`, `splitParts`, `areaOf`).
- **Modul:** `packages/engines/offset/index.js` (mesin) dan `geometry.js` (geometri path murni).
- **Versi awal di registry:** 1.1.0 (1.0.1 + kontrak registry).
- **Kanvas asli:** 120.
- **supports:** `mod:false, deco:true, builtinMains:false, perItemColor:false, maxColors:3`.

**Keputusan pemilik: offset tidak memakai pengubah.** Field `mod` dan `slot` pada item tetap disimpan tetapi tidak dirender.

## Cara kerja

1. Node ikon pustaka dipecah per sub-path (`splitParts`).
2. Bagian tertutup dideteksi (`isClosedPart`): elemen `circle/rect/ellipse/polygon`, path yang diakhiri `Z`, atau path yang panjangnya > 1 dan titik awal serta akhirnya berjarak < 0,6. Legacy mengukurnya dengan `getTotalLength`; port memakai `geometry.samplePath` (parser path murni: garis, kurva, dan busur disampel), jadi mesin tetap tanpa DOM.
3. **Body** = bagian tertutup dengan bbox terbesar (`areaOf`, setara `getBBox`, dihitung `geometry.partBox`).
4. Lapisan warna digeser `(dx, dy)` di belakang garis tinta:
   - `solid`: semua bagian tertutup diisi aksen.
   - `white`: body aksen tergeser + body putih tepat di bawah garis + detail dalam digeser 0,6×.
   - `line`: hanya body aksen tergeser.
5. Garis tinta di atas semuanya.
6. Dekorasi garis di luar objek.

### Knockout (`opt.mode`)

- `mask` (bawaan, UI dan ekspor): di mode `white`, lapisan aksen yang digeser dipotong siluet body lewat `<mask>`. Hasil gambarnya sama dengan legacy (body putih menutupinya), tetapi direct fill tidak lagi bergantung urutan tumpukan warna. Dekorasi yang menyentuh objek memotong lapisan objek lewat mask selebar tebal garis + 2 × `gap` classic (2).
- `white` (pratinjau ringan): tanpa mask. Body putih digambar seperti legacy, dan knockout dekorasi memakai garis putih.
- Mask selalu dipasang di pembungkus `<g mask>` tanpa `transform`, supaya `maskUnits="userSpaceOnUse"` tetap kanvas 48.

Warna di keluaran: aksen, tinta, dan putih (mode `white` atau knockout dekorasi). Maksimal 3, sesuai `supports.maxColors`.

## Parameter gaya (berlaku untuk seluruh set)

| Field | Bawaan | Arti |
|---|---|---|
| `mode` | solid | solid / white / line |
| `acc` | `#B8405A` | warna aksen |
| `ink` | `#1A1A1A` | tinta |
| `dx`, `dy` | 4, 4 | besar geser isi (satuan legacy: kanvas 120, objek 72), dibatasi −8 s.d. 8 |
| `sw` | 2.6 | tebal garis (satuan legacy), dibatasi 1,5 s.d. 4 |
| `size` | 100.8 | sisi objek dalam kanvas 120, sama dengan 84% kanvas (patokan classic). Legacy memakai 72. |

## Parameter per item

| Field | Nilai |
|---|---|
| `deco.tick` | boolean, garis kilat |
| `deco.tickPos` | TR / TL |
| `deco.ground` | boolean, garis tanah |
| `deco.cloud` | boolean, awan kecil |
| `deco.grass` | boolean, rumput |

Di item kanonik, dekorasi offset disimpan di `item.engine.offset.deco` (lihat `DATA-MODEL.md`), supaya tidak bentrok dengan `item.deco` milik classic/accent. Bawaan per item mengikuti `DEF` legacy: kilat kanan atas + garis tanah (`offsetDeco`).

Parameter gaya disimpan di `style.engine.offset`. `offsetParams(style)` membacanya dari sana saja; field classic seperti `style.sw` tidak ikut terbaca.

## Normalisasi kanvas

Kanvas 120 diskalakan ke 48 (faktor 0,4).

**Keputusan pemilik: ukuran objek offset sama dengan classic, yaitu 84% kanvas** (40,32 dari 48; `size` 100,8 di kanvas 120). Legacy memakai 60% (`size` 72).

Akibatnya, margin di sekitar objek tinggal sekitar 3,8 unit (skala 48), sehingga dekorasi harus disesuaikan:
- Semua dekorasi (kilat, tanah, awan, rumput) wajib berada di dalam viewBox 0–48. Tes: bbox gabungan semua elemen setelah outline berada di dalam `[0, 48]`.
- **Garis tanah** ditaruh di y = 46 dan tidak lagi melebar 10 unit ke kiri-kanan objek. Lebarnya sama dengan objek ± 2 unit.
- **Kilat** dan **awan** diperkecil 0,7× dan ditempatkan di sudut kosong. Kalau menyentuh objek, dekorasi diberi celah knockout putih selebar `gap` classic.
- **Geser isi** (`dx`, `dy`) ikut dikalikan rasio ukuran (100,8 / 72 = 1,4) supaya proporsinya sama dengan legacy. Tebal garis objek juga, sehingga dalam satuan ikon 24 tetap `sw / 3` seperti legacy.
- Objek berada di tengah kanvas (titik asal 3,84 di skala 48). Legacy menaikkan objek 6 unit untuk memberi ruang garis tanah; ini tidak lagi perlu karena garis tanah pindah ke y = 46.

Penempatan dekorasi (skala 48, implementasi Fase 3):

| Dekorasi | Bentuk legacy | Penempatan |
|---|---|---|
| kilat | `M0 6 l6 -6 M3 16 l8 -2`, skala 0,7 × 0,4 | sudut atas sesuai `tickPos`, 1,6 dari tepi |
| awan | `c0-6 8-6 9-2 3-4 10-2 9 3h-18z`, skala 0,7 × 0,4, garis 0,8× | sudut atas yang tidak dipakai kilat |
| tanah | garis datar | y = 46, selebar kotak objek ± 2 (dibatasi 1,6 s.d. 46,4) |
| rumput | `l3 -6 2 6` dan `l2 -5 2 5`, skala 0,4 | di kedua ujung garis tanah |

Tebal garis dekorasi sama dengan tebal garis objek di kanvas (legacy juga begitu). `boxesOffset` mengembalikan kotak lapisan (objek, dekorasi) untuk wilayah klik editor dan cek tepi viewBox di Tinjau.
- Golden test offset terhadap legacy dibandingkan **setelah** objek legacy diskalakan ke 84%. Dekorasi dikecualikan dari perbandingan piksel dan dicek terpisah lewat tes bbox.
  - Paritas: `tests/e2e/offset-parity.spec.js` (`@golden`) memanggil `compose` legacy asli dan renderer Icon Studio untuk 20 ikon Lucide dan Tabler serta 12 ikon Hugeicons × 3 mode. Selisih terukur maks 0,002% dari kanvas (ambang warna 48 per kanal, raster 240 px, batas 1%).
  - **Hugeicons tidak didukung offset-composer 1.0.1.** `nodeOf` legacy hanya mengenal `lu` (UMD Lucide) dan `tb` (JSON Tabler), jadi paritas langsung tidak mungkin. Pembandingnya: node Hugeicons dari renderer Icon Studio (`renderer.nodeOf`, sudah lewat `hgAttrs`) disuntikkan ke peta `TB` legacy dengan kunci `tb:hg~<nama>`, lalu `compose` legacy asli dipanggil. Alasannya: setelah node didapat, `compose` legacy (`splitParts`, `closed` lewat `getTotalLength`, `areaOf` lewat `getBBox`, `partStr`) tidak bergantung pada sumber, sehingga pembanding ini menguji hal yang sama dengan paritas Lucide/Tabler, yaitu geometri murni port (`geometry.samplePath`, `partBox`) terhadap pengukuran DOM legacy. Yang tidak diuji: cara legacy memuat Hugeicons (memang tidak ada). Ikon yang diuji: `home-01`, `favourite` (body tunggal), `mail-01`, `shopping-cart-01`, `camera-01`, `calendar-03`, `bubble-chat`, `delivery-truck-01` (banyak bidang), `user` (body lingkaran), `coffee-01` (body elips), `rocket` (garis terbuka tanpa bidang), `music` (bagian `fill` yang dibuang `partStr`).
  - Kotak dekorasi: `tests/unit/engines-offset.test.js` (semua `decoSet` × `tickPos` × geser ekstrem) dan `tests/e2e/export-canva.spec.js` (kotak gabungan setelah direct fill).

## Sumbu variasi (`axes`)

| Sumbu | Nilai | Catatan |
|---|---|---|
| `tickPos` | TR, TL | hanya kalau `tick` aktif |
| `decoSet` | `tick`, `tick+ground`, `ground`, `cloud+ground`, `grass+ground`, `tick+cloud` | kombinasi dekorasi yang disetujui |

Arah dan besar geser (`dx`, `dy`) adalah identitas gaya, **bukan** sumbu.

## Flag khusus

- Objek tanpa bagian tertutup → `warn "Tanpa bidang tertutup: isi warna offset tidak muncul"`.
- Objek bawaan (`face`, `doc`, dst.) → `err "Objek bawaan tidak didukung gaya Offset"`.
- Di TIB, flag lama "Tanpa pengubah: sama dengan ikon pustaka" **tidak berlaku** untuk offset. Penggantinya adalah `["info", "Pengubah tidak tersedia pada style ini"]` (keputusan pemilik). Flag `info` tidak dihitung oleh `isBad` dan tidak menghalangi ekspor.
- Flag yang sama muncul di Composer kalau pengguna memilih gaya Offset untuk item yang punya pengubah. Panel pengubah tetap terlihat tetapi nonaktif dengan teks yang sama.
- `flags(it, style, ctx)` menerima `ctx.nodeOf` (node ikon pustaka) untuk memeriksa bidang tertutup.

## Icon Studio (Fase 3)

- `state/render.js`: `renderSetItem` memanggil mesin offset dengan `ctx.nodeOf` (node mentah dari `icon-sources`). `boxesOf` dan `flagsOf` dipakai editor, Repetisi, dan Tinjau.
- Kartu gaya Offset merender pratinjau mesin (`lu:luggage`, patokan legacy). Kartu Hand-writing tetap nonaktif sampai Fase 4.
- Composer · Set: panel Gaya berisi Isi warna (Bidang, Putih, Garis), Geser X/Y, dan Tebal garis; panel Warna berisi aksen offset. Ikon dengan objek bawaan diberi flag `bawaan`; ringkasan flag mesin tampil di panel Repetisi.
- Composer · Edit: lapisan Pengubah menampilkan "Pengubah tidak tersedia pada style ini" tanpa kontrol; lapisan Dekorasi berisi sakelar kilat, posisi kilat, tanah, awan, dan rumput per ikon. Posisi objek mengikuti patokan gaya, jadi seret dan panah tidak memindahkan lapisan.
- Nama ikon, nama file, dan judul metadata offset tidak menyebut pengubah, karena pengubah tidak dirender. Kata gaya metadata: `Offset Style` / `gaya offset`.
- Kombinasi: matriks memakai satu kolom "objek saja". Objek bawaan di pool dilewati dengan keterangan, karena tidak bisa dirender gaya Offset.
- Builder: mode `O` ("Offset") ada di pilihan Pratinjau dan Gaya ekspor, di samping Aksen dan Klasik. Render lewat `renderManifestItem(it, "O", style)` dengan `manifestOffsetStyle(style)`: tinta dan aksen dari manifest, isi warna dari `style.engine.offset.mode` (kontrol Isi warna di panel Ikon), geser dan tebal garis bawaan, dekorasi bawaan `offsetDeco`. Pengubah tidak dirender. Flag Builder di mode O: objek tidak dikenal, flag mesin (objek bawaan, tanpa bidang tertutup), dobel per objek utama, dan `info` "Pengubah tidak tersedia pada style ini". Flag pengubah TIB (tanpa pengubah, mirip pustaka, objek dan pengubah sama, Solid·garis) tidak berlaku. Flag `info` tidak memberi lencana dan tidak dihitung Bermasalah. Panel Gaya ekspor menampilkan flag info pack berisi jumlah ikon yang pengubahnya diabaikan. ZIP Builder `offset/` sudah direct fill (lihat `EXPORT-PIPELINE.md` bagian 3).
- ZIP Composer masih berisi SVG asli sampai direct fill IC dinyalakan di Fase 5. `export-canva.spec.js` menjalankan `directFillSvgFile` pada setiap SVG di ZIP offset.

## Risiko

- Karena tidak ada pengubah, dua ikon dengan objek utama sama selalu memiliki signature sama. Di TIB, manifest yang memakai `lu:wallet` + `plus` dan `lu:wallet` + `check` akan ditandai "Rakitan dobel" di gaya offset. Ini perilaku yang benar karena hasil render keduanya identik.
