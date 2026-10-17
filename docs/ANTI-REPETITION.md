# Anti-repetisi

Tujuan: tidak ada dua ikon yang kembar atau nyaris kembar di dalam satu cakupan, dan ikon yang memakai keacakan (hand-writing, sticker, offset) tidak menghasilkan pola berulang.

## 1. Cakupan (keputusan pemilik)

| Aplikasi | Cakupan pemeriksaan |
|---|---|
| Icon Composer | Semua ikon di **set aktif yang dirender dengan gaya yang sama**. Pack tersimpan tidak ikut dibandingkan, kecuali pemilik menyalakan opsi "Bandingkan juga dengan pack tersimpan bergaya sama" (bawaan mati). |
| Template Icon Builder | Semua ikon **aktif (`on`) di satu pack**, untuk tiap gaya ekspor yang dipilih secara terpisah. |

**Konsep yang sama di gaya berbeda bukan repetisi.** Signature selalu diawali id mesin, dan sidik jari hanya dibandingkan dengan ikon bergaya sama.

Riwayat lintas pack dan lintas akun **tidak** termasuk cakupan (lihat backlog di `MIGRATION-PLAN.md`).

## 2. Tiga lapis

| Lapis | Menangkap | Biaya | Hasil |
|---|---|---|---|
| L1 Signature | rakitan yang sama secara konsep | sangat murah, sinkron | flag `err` |
| L2 Sidik jari visual | rakitan berbeda nama tetapi hasilnya nyaris sama | sedang, async (canvas) | flag `err` atau `warn` |
| L3 Perencana variasi | dekorasi atau getaran acak yang berulang | murah, dijalankan saat diminta | mengisi `item.var` + `item.seed` |

## 3. L1: signature

Didefinisikan di `ENGINE-CONTRACT.md` bagian 4. Contoh:

| Item | Signature |
|---|---|
| sticker, `lu:wallet` + `tb:circle-check`, TR | `sticker|wallet|check|TR` |
| sticker, `tb:wallet` + `lu:check-circle`, TC | `sticker|wallet|check|TR` (sama, TC dipetakan ke TR) |
| offset, `lu:wallet` + apa pun | `offset|wallet|-|-` |
| classic, `lu:wallet` + `lu:check`, TR | `classic|wallet|check|TR` |

Aturan flag:
- Signature sama dengan item lain dalam cakupan → `["err", "Rakitan dobel dengan <nama>"]`.
- `dupMap()` lama di TIB (kunci `main|mod`) diganti `signatureMap(items, family)`.
- Flag "Mirip <pustaka> <nama>" (`collisions`) tetap berjalan seperti sekarang, terpisah dari repetisi.

## 4. L2: sidik jari visual

### Algoritma

Untuk setiap item dalam cakupan, render dua versi lewat `engine.compose(..., {mode:"mask"})`:
- **penuh**: dengan dekorasi;
- **inti**: `opt.deco = false`. Ini mencegah dekorasi acak menyembunyikan kembaran struktural.

Lalu untuk setiap render:

1. Gambar SVG ke `OffscreenCanvas` 64×64 di atas latar putih.
2. Ubah ke luminans, lalu buat **dHash 64-bit**: resize ke 9×8, bandingkan piksel yang bersebelahan.
3. Buat **masker tinta 32×32** (luminans < 0,85 = 1) untuk menghitung IoU.
4. Simpan `{dhash, mask, svgHash}` di cache dengan kunci `hash(svg)`.

### Perbandingan

Bandingkan semua pasangan dalam cakupan (O(n²), n ≤ 300 masih < 100 ms setelah cache terisi).

| Kondisi | Flag |
|---|---|
| inti: Hamming ≤ 6 **dan** IoU ≥ 0,90 | `err` "Nyaris identik dengan <nama>" |
| inti: Hamming ≤ 10 **dan** IoU ≥ 0,80 | `warn` "Mirip dengan <nama>" |
| penuh saja yang mirip, inti tidak | tidak ada flag (yang sama hanya dekorasinya, ditangani L3) |

Ambang awal di atas harus **dikalibrasi** dengan fixture `tests/fixtures/repetition/` yang berisi pasangan yang menurut pemilik "kembar", "mirip", dan "beda". Ambang disimpan di `packages/repetition/thresholds.json` per mesin, karena hand-writing (rotasi, celah) secara alami punya jarak lebih besar.

### Kasus yang harus tertangkap (fixture wajib)

- `lu:camera` vs `tb:camera` dengan pengubah sama.
- `plus` vs `circle-plus` sebagai pengubah badge.
- Offset: `lu:wallet` vs `tb:wallet`.
- Dua objek berbeda nama tetapi bentuknya sama di Lucide, misalnya alias lama yang belum ada di `MAIN_ALIAS`.

### UI

- Flag muncul di daftar flag yang sudah ada (`flagsOf` di TIB, pemeriksaan di Tinjau pack di IC).
- Klik flag → kedua ikon disorot berdampingan.
- Di TIB, `isBad` memperlakukan `err` L2 sama seperti `err` lain, sehingga opsi "Lewati yang bermasalah" (`exSkipBad`) ikut melewatinya.

## 5. L3: perencana variasi

### Masalah yang diselesaikan

- Sticker: `seed = 5 + (j*7) % 50` dan hanya 4 arah sinar → dekorasi kembar sering muncul.
- Hand-writing: rotasi murni acak → beberapa ikon berturut-turut miring ke arah yang sama.
- Offset: dekorasi diatur manual → set cenderung memakai kombinasi yang sama.

### Masukan

- `items`: daftar item dalam cakupan, dalam urutan tampil (urutan set di IC, urutan pack di TIB).
- `neighbors(i)`: indeks yang bersebelahan secara visual.
  - IC: item sebelum dan sesudahnya di strip set, ditambah tetangga atas/bawah di grid Tinjau pack.
  - TIB: ikon di slide yang sama, ditambah tetangga di grid Resource Page.
- `engine.axes(item, style)` untuk setiap item.
- `salt`: string stabil per set/pack (`set.id` atau `manifest.deck.file`).

### Algoritma (greedy berimbang, deterministik)

```
counts = {}                          // pemakaian tiap nilai per sumbu
for item in items (urut):
  if item.varLock: tambahkan item.var ke counts; lanjut
  kandidat = produk kartesius nilai sumbu, buang yang diblokir (blockedBy)
  skor(c) = Σ_sumbu  w_sumbu * counts[sumbu][c.sumbu]
          + λ * Σ_tetangga  jumlah sumbu yang sama dengan tetangga
  ambil skor terendah; seri dipecah dengan rng(hash(salt + item.id))
  item.var  = c
  item.seed = hash(salt + item.id) >>> 0
  counts += c
```

- `λ` bawaan 3. Bobot sumbu diambil dari `axis.weight` (bawaan 1).
- Kalau kandidat > 256, ambil 256 sampel deterministik dari rng agar tetap cepat.
- Getaran halus (sudut sparkle, fase dash di dalam kuadran) tetap diambil dari `item.seed`, tetapi dibatasi oleh nilai sumbu yang terpilih.

### Kapan planner dijalankan

- Setelah Kombinasi massal menambah item ke set (IC).
- Setelah impor manifest (TIB).
- Saat pemilik menekan **Ratakan variasi**.
- **Tidak** dijalankan otomatis saat item diedit, supaya ikon tidak berubah sendiri.

### Kontrol per item

- **Acak ulang**: pilih kandidat terbaik berikutnya untuk item itu saja, tanpa mengubah item lain.
- **Kunci variasi** (`varLock`): planner tidak mengubah item ini.
- Mengedit sumbu secara manual otomatis mengunci item.

### Kriteria terima

Untuk set uji 48 ikon sticker dengan 8 objek × 6 pengubah:
- tidak ada dua tetangga dengan `rayDiag` dan `sparkPattern` yang sama sekaligus;
- selisih pemakaian antar nilai satu sumbu ≤ 1 (kecuali karena blokir slot);
- menjalankan planner dua kali dengan masukan yang sama menghasilkan `var` dan `seed` yang identik.

## 6. Data yang disimpan

Variasi disimpan **per mesin**, supaya pindah gaya tidak membawa variasi gaya lain:

```js
item.engine[engineId].seed     // uint32, dari planner atau acak ulang
item.engine[engineId].var      // { [axisId]: value }
item.engine[engineId].varLock  // boolean
```

Di pseudo-kode di atas, `item.var`, `item.seed`, dan `item.varLock` adalah singkatan untuk field di atas sesuai mesin aktif.

Sidik jari **tidak** disimpan di localStorage. Nilainya dihitung ulang saat dibuka, karena bisa berubah kalau mesin diperbarui.

Ekspor:
- `gaya.json` (IC) dan `manifest-final.json` (TIB) menyertakan `seed` dan `var` per ikon, supaya pack bisa direproduksi.
- `submission-profile.json` (TIB) menambahkan ringkasan: jumlah flag L1/L2 dan versi ambang sidik jari.
