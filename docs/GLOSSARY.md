# Glosarium

| Istilah (UI, bahasa Indonesia) | Nama di kode | Arti |
|---|---|---|
| Objek utama | `main` | kata benda inti ikon |
| Pengubah | `mod`, modifier | aksi/status yang ditempel di sudut |
| Jangkar / posisi pengubah | `slot`, `anchor` | TL TC TR ML MR BL BC BR |
| Dekorasi | `deco` | elemen tambahan di luar objek (kilat, kilau, sinar, sparkle) |
| Kilau | `deco.type: star4 / star4x2` | bintang 4 sudut di gaya aksen |
| Celah knockout | `gap`, `ko`, `halo` | potongan di sekitar lapisan atas |
| Tinta / Aksen | `ink` / `accent`, `acc` | dua warna dasar set |
| Gaya / keluarga | `style.family`, mesin (`engine`) | classic, accent, offset, hand-writing, sticker |
| Patokan set | `style` | parameter gaya yang berlaku untuk semua ikon di set |
| Set | `set` (IC) | kumpulan ikon yang sedang dikerjakan di Composer |
| Pack | `pack`, `items` (TIB) | kumpulan ikon dari satu manifest / satu deck |
| Kombinasi massal | `combos`, batch | matriks objek × pengubah untuk membuat banyak ikon sekaligus |
| Tinjau pack | review | lembar kontak + pemeriksaan sebelum ekspor |
| Warna bagian | `parts`, peran `ink/acc/fillA/fill` | warna per bagian objek (gaya aksen) |
| Isi bidang | `under` | none / full / offset / half (gaya aksen) |
| Penanda | `mstyle` | line / fill (gaya aksen) |
| Blob | `blob` | isi warna di belakang garis (hand-writing) |
| Halo | `halo` | tepi putih stiker (sticker) |
| Geser isi | `dx/dy` (offset), `off` (hand-writing, sticker) | jarak isi warna dari garis |
| Rakitan dobel | flag L1 | signature sama dalam satu cakupan |
| Mirip / nyaris identik | flag L2 | sidik jari visual berdekatan |
| Ratakan variasi | planner L3 | membagi variasi acak secara merata |
| Kunci variasi | `varLock` | item tidak diubah planner |
| Sidik jari | fingerprint (dHash + IoU) | ringkasan visual untuk deteksi kemiripan |
| Signature | `signature` | kunci identitas konsep: `mesin|objek|pengubah|slot` |
| Konsep | `concept(key)` | nama ikon tanpa prefiks sumber, alias, dan sinonim |
| Resource Page | `resource-page.html` | slide berisi semua ikon pack |
| Tema pack | `pack.en`, `pack.id` | nama pack untuk judul dan pencarian Canva |
| Direct fill | `directFillSvgFile` | SVG rata, satu path per warna, siap Canva |
