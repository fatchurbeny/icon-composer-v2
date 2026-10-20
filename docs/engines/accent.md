# Mesin `accent` (Aksen bagian)

- **Asal:** `composeAccent()`, `mainInfo`, `autoRoles`, `rolesOf`, `modShape`, `modAccent`, `decoAccent` di IC 1.5.1 dan TIB 1.6.0.
- **Kanvas:** 48.
- **supports:** `mod:true, deco:true, builtinMains:true, perItemColor:false, maxColors:5`.

## Parameter gaya

| Field | Bawaan | Arti |
|---|---|---|
| `sw` | 3.5 | tebal garis |
| `gap` | 1.25 | celah knockout |
| `cap` / `join` | round / round | |
| `accent` | `#F05A5A` | warna aksen |
| `scale` | main 88, mod 80, deco 100 | |

## Parameter per item

| Field | Nilai | Arti |
|---|---|---|
| `parts` | `null` (otomatis) atau `{indeks: "ink"|"acc"|"fillA"|"fill"}` | peran tiap bagian objek |
| `under` | `none` / `full` / `offset` / `half` | isi bidang (Cara 3) |
| `mstyle` | `line` / `fill` | gaya penanda pengubah (Cara 4) |
| `deco.type` | `none` / `star4` / `star4x2` (+ jenis classic) | kilau |

Urutan lapisan: isi bidang → objek → dekorasi → penanda. Setiap lapisan di-mask oleh siluet lapisan di atasnya.

## Sumbu variasi (`axes`)

Accent tidak memakai seed. Sumbu berikut hanya dipakai planner kalau pemilik menyalakan "Ratakan variasi gaya aksen" di TIB. Bawaannya mati, karena `under` dan `mstyle` sering datang dari manifest.

| Sumbu | Nilai | Catatan |
|---|---|---|
| `under` | none, full, offset, half | tidak diubah kalau manifest menetapkan nilainya |
| `mstyle` | line, fill | |

## Masalah yang diketahui

- `autoRoles` berbasis heuristik bbox terbesar. Beberapa objek salah peran (contoh: roda troli ikut beraksen). Tidak termasuk cakupan migrasi.

## Rotasi per ikon

`item.mr` memutar objek utama di pusatnya (`translate(24+mx 24+my) rotate(mr) scale(ms) translate(-24 -24)`). `item.nr` memutar pengubah di pusat kotaknya (`rotate(nr cx cy)` di depan transform pengubah, termasuk siluet knockout). `deco.r` memutar dekorasi seperti di IC. Bagian `rotate` hanya ditulis bila sudutnya tidak 0, jadi keluaran tanpa rotasi tetap identik dengan legacy (golden). Ekspor Canva tetap valid karena `directFillSvgFile` memanggang transform.
