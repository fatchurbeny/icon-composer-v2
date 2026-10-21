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

## Rotasi per ikon

`item.mr` memutar objek utama di pusatnya (`translate(24+mx 24+my) rotate(mr) scale(ms) translate(-24 -24)`). `item.nr` memutar pengubah di pusat kotaknya (`rotate(nr cx cy)` di depan transform pengubah, termasuk siluet knockout). `deco.r` memutar dekorasi seperti di IC. Bagian `rotate` hanya ditulis bila sudutnya tidak 0, jadi keluaran tanpa rotasi tetap identik dengan legacy (golden). Ekspor Canva tetap valid karena `directFillSvgFile` memanggang transform.

### Rotasi pada aturan Solid·garis 1.4.5 (Builder)

Aturan Solid·garis 1.4.5 (`ctx.solidV145`, dipakai persona Builder dan TIB) mengepas ulang pengubah garis pada mode B supaya sisi terpanjangnya maksimal 18 satuan. Untuk pengubah yang diputar (`nr` bukan 0), pengepasan memakai kotak setelah rotasi (`rotatedBoxSize`: `W·|cos| + H·|sin|` × `W·|sin| + H·|cos|`):

- Skala dihitung dari sisi terpanjang kotak terputar, jadi pengubah yang diputar tidak lagi melebar sampai sekitar 23 satuan pada 45°.
- Pengubah ditambatkan ulang (`anchoredModifierGeometry(it, md, sc, {rotated: true})`) sehingga tepi kotak terputar menempel di tepi slot (2 dan 46), seperti kotak tanpa rotasi. Rotasi tetap di pusat kotak. Tanpa aturan ini pengubah di sudut bisa keluar dari viewBox 48.
- Overlap dengan badan objek utama (penentu celah knockout) memakai kotak pengubah terputar (`modifierBox`) dan kotak badan setelah rotasi `mr` (`bodyBox`).

Bila `nr` dan `mr` kosong atau 0, rumus dan keluaran sama persis dengan mesin 1.4.5 (golden TIB 1.6.0). Composer serta mode A dan C tidak memakai aturan ini: pengubah yang diputar tetap ditambatkan dengan kotak yang belum diputar, sama seperti di Composer · Edit. Versi mesin tetap 1.4.5 karena dicatat di `submission-profile.json` golden.

