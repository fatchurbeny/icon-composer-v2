# Mesin `offset`

- **Asal:** `legacy/style/offset-composer-v1.0.1.html` (`compose`, `closed`, `splitParts`, `areaOf`).
- **Versi awal di registry:** 1.1.0 (1.0.1 + kontrak registry).
- **Kanvas asli:** 120.
- **supports:** `mod:false, deco:true, builtinMains:false, perItemColor:false, maxColors:3`.

**Keputusan pemilik: offset tidak memakai pengubah.** Field `mod` dan `slot` pada item tetap disimpan tetapi tidak dirender.

## Cara kerja

1. Node ikon pustaka dipecah per sub-path (`splitParts`).
2. Bagian tertutup dideteksi (`closed`): elemen `circle/rect/ellipse/polygon`, path yang diakhiri `Z`, atau path yang titik awal dan akhirnya berjarak < 0,6 (diukur dengan `getTotalLength`).
3. **Body** = bagian tertutup dengan bbox terbesar.
4. Lapisan warna digeser `(dx, dy)` di belakang garis tinta:
   - `solid`: semua bagian tertutup diisi aksen.
   - `white`: body aksen tergeser + body putih tepat di bawah garis + detail dalam digeser 0,6×.
   - `line`: hanya body aksen tergeser.
5. Garis tinta di atas semuanya.
6. Dekorasi garis di luar objek.

## Parameter gaya (berlaku untuk seluruh set)

| Field | Bawaan | Arti |
|---|---|---|
| `mode` | solid | solid / white / line |
| `acc` | `#B8405A` | warna aksen |
| `ink` | `#1A1A1A` | tinta |
| `dx`, `dy` | 4, 4 | besar geser isi (satuan kanvas 120) |
| `sw` | 2.6 | tebal garis |
| `size` | 100.8 | sisi objek dalam kanvas 120, sama dengan 84% kanvas (patokan classic). Legacy memakai 72. |

## Parameter per item

| Field | Nilai |
|---|---|
| `deco.tick` | boolean, garis kilat |
| `deco.tickPos` | TR / TL |
| `deco.ground` | boolean, garis tanah |
| `deco.cloud` | boolean, awan kecil |
| `deco.grass` | boolean, rumput |

Di item kanonik, dekorasi offset disimpan di `item.engine.offset.deco` (lihat `DATA-MODEL.md`), supaya tidak bentrok dengan `item.deco` milik classic/accent.

## Normalisasi kanvas

Kanvas 120 diskalakan ke 48 (faktor 0,4).

**Keputusan pemilik: ukuran objek offset sama dengan classic, yaitu 84% kanvas** (40,32 dari 48; `size` 100,8 di kanvas 120). Legacy memakai 60% (`size` 72).

Akibatnya, margin di sekitar objek tinggal sekitar 3,8 unit (skala 48), sehingga dekorasi harus disesuaikan:
- Semua dekorasi (kilat, tanah, awan, rumput) wajib berada di dalam viewBox 0–48. Tes: bbox gabungan semua elemen setelah outline berada di dalam `[0, 48]`.
- **Garis tanah** ditaruh di y = 46 dan tidak lagi melebar 10 unit ke kiri-kanan objek. Lebarnya sama dengan objek ± 2 unit.
- **Kilat** dan **awan** diperkecil 0,7× dan ditempatkan di sudut kosong. Kalau menyentuh objek, dekorasi diberi celah knockout putih selebar `gap` classic.
- **Geser isi** (`dx`, `dy`) ikut dikalikan rasio ukuran (100,8 / 72 = 1,4) supaya proporsinya sama dengan legacy.
- Golden test offset terhadap legacy dibandingkan **setelah** objek legacy diskalakan ke 84%. Dekorasi dikecualikan dari perbandingan piksel dan dicek terpisah lewat tes bbox.

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

## Risiko

- Karena tidak ada pengubah, dua ikon dengan objek utama sama selalu memiliki signature sama. Di TIB, manifest yang memakai `lu:wallet` + `plus` dan `lu:wallet` + `check` akan ditandai "Rakitan dobel" di gaya offset. Ini perilaku yang benar karena hasil render keduanya identik.
