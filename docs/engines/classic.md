# Mesin `classic` (Klasik)

- **Asal:** `compose()` + `decoMarkup()` di IC 1.5.1 dan TIB 1.6.0 (`CLASSIC_ENGINE_VERSION 1.4.5` di TIB).
- **Versi awal di registry:** 1.4.5. Keluaran harus identik byte-per-byte dengan legacy.
- **Kanvas:** 48.
- **supports:** `mod:true, deco:true, builtinMains:true, perItemColor:false, maxColors:5`.

## Parameter gaya

| Field | Bawaan | Arti |
|---|---|---|
| `sw` | 2 | tebal garis |
| `gap` | 2 | celah knockout |
| `cap` / `join` | butt / miter | ujung dan sambungan garis |
| `accent` | `#C3DC1E` | warna aksen |
| `scale` | main 84, mod 100, deco 100 | skala lapisan (%) |
| `pref` | A | mode warna: A objek garis + pengubah solid · B objek solid + pengubah garis · C keduanya garis |
| `fx` | none | efek: none / soft / shadow |

## Catatan migrasi

- Ada **dua salinan** mesin ini (IC dan TIB). Sebelum disatukan, bandingkan keduanya. Kalau berbeda, versi TIB 1.4.5 menjadi acuan karena punya perbaikan "Solid · garis" (kotak pengubah adaptif, diagnostik `solidLineDiagnostic`). Catat perbedaannya di `docs/legacy/INVENTORY.md`.
- Perbaikan bug atribut ganda (`partStr` + `dedupeAttrs`) sudah ada di TIB. Pastikan versi gabungan memakainya.

## Sumbu variasi (`axes`)

Tidak ada. Classic deterministik penuh dan tidak memakai seed. Repetisi dicegah oleh L1 dan L2 saja.
