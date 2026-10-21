# Model data

## 1. Kunci ikon

| Prefiks | Sumber | Contoh |
|---|---|---|
| (tanpa) | objek/pengubah bawaan IC | `face`, `bubble`, `check` |
| `lu:` | Lucide 1.52.0 | `lu:luggage` |
| `tb:` | Tabler outline 3.49.0 (tanpa `brand-*`) | `tb:camera` |
| `hg:` | Hugeicons Free 4.3.5 | `hg:coffee-02` |
| `cu:` | Library kustom pemilik | `cu:rice-field` |

## 2. Item kanonik

Basisnya model item IC 1.5.1, ditambah blok `engine` untuk data khusus mesin.

```js
{
  id, name,
  main: "lu:luggage",          // kunci objek utama
  mod: "lu:check" | "none",    // kunci pengubah
  slot: "BR",                  // TL TC TR ML MR BL BC BR
  nx, ny, mx, my, ms, size,    // geser pengubah, geser objek, skala (ms dan size tidak dibaca mesin)
  mr, nr,                      // rotasi objek utama dan pengubah (derajat, opsional)
  deco: { type, x, y, s, r, color },     // dekorasi classic/accent
  pref, parts, under, mstyle,            // classic/accent
  colors: { main, mod, deco },           // override warna lapisan
  vis: { main, mod, deco },
  engine: {
    offset:         { deco:{tick, tickPos, ground, cloud, grass}, seed, var, varLock },
    "hand-writing": { ms, blob, seed, var, varLock },
    sticker:        { main:{c, s, fill}, mod:{c, s}, deco:{seed, s, x, y}, seed, var, varLock }
  }
}
```

Di TIB, item juga punya field Builder: `uid, idRaw, name:{en,id}, slides, role, keywords, on`.

Aturan:
- `normItem` mengisi `engine.<id>` dengan bawaan mesin bila belum ada. Pengecualian offset, hand-writing, dan sticker: `engine.offset`, `engine["hand-writing"]`, dan `engine.sticker` tidak ditulis oleh `normItem`; bawaannya diisi saat `adapt` (`offsetDeco`: kilat kanan atas + garis tanah; `handWritingItem`: `ms` 0,5, `blob` auto, `seed` 1; `stickerItem`), dan field ditulis hanya saat pengguna mengubahnya atau saat impor set lama. Alasannya, `gaya.json` set classic/accent harus tetap sama dengan IC 1.5.1 (golden).
- `engine["hand-writing"].ms` adalah skala pengubah hand-writing (0,36–0,7), terpisah dari `item.ms` IC (persen, tidak dibaca mesin baru).
- `engine.sticker`: `main.c`/`mod.c` warna isi (`#RRGGBB`), `main.s` 1,2–2,3, `mod.s` 0,5–1,4, `main.fill` `auto`/`plate`/`none`, `deco.seed` 1–60 (`seed` di tingkat `engine.sticker` dibaca bila `deco.seed` kosong), `deco.s` 0,6–1,3, `deco.x/y` ±8 dalam satuan kanvas 64 legacy. Bawaan bila kosong: isi objek dari palet menurut kunci objek, isi pengubah kuning, seed dari `hash(id)` (lihat `engines/sticker.md`). Posisi objek dan pengubah tetap di field kanonik `mx/my`, `nx/ny` (satuan 48); slot 8 dipetakan ke 4 sudut saat `adapt`.
- Rotasi per ikon: `mr` (objek utama, di pusat objek), `nr` (pengubah, di pusat kotaknya), dan `deco.r` (dekorasi, di titik `deco.x/y`). Rentang −180..180 derajat. `mr` dan `nr` hanya disimpan bila tidak 0 (`normItem` menghapus nilai 0 atau tidak valid), sehingga item tanpa rotasi tetap sama dengan IC 1.5.1. Skala tetap di tingkat set (`style.scale`). Dibaca mesin classic dan accent. Offset mengabaikannya.
- Pindah gaya tidak menghapus `engine.<id>` milik gaya lain.
- `engine.<id>` hanya dibaca oleh mesin `<id>`, lewat `adapt`.

## 3. Gaya set

```js
style = {
  family: "classic"|"accent"|"offset"|"hand-writing"|"sticker",
  ink, accent, sw, gap, cap, join, pref, colors, scale, fx,   // classic/accent (lama)
  engine: { offset:{...}, "hand-writing":{...}, sticker:{...} }, // parameter gaya mesin baru
  saved: { [family]: {...} }                                   // patokan tiap keluarga (applyFamily)
}
```

Di Icon Studio, `normSetStyle` menerima `classic`, `accent`, `offset`, `hand-writing` (`"coret"` dibaca sebagai `hand-writing`), dan `sticker`. `style.engine.offset` (`mode, acc, ink, dx, dy, sw, size`), `style.engine["hand-writing"]` (`acc, ink, sw, puff, off, gap, rot, ko`), dan `style.engine.sticker` (`mode, sw, halo, off, spk, rays, curl, ink`) hanya ditulis bila set pernah memakai gaya itu, dan pindah ke offset, hand-writing, atau sticker tidak mengubah field classic/accent (`sw`, `gap`, `scale`, dst.), sehingga kembali ke Klasik atau Aksen memulihkan patokan lama (`ENGINE_FAMILIES` di `state/document.js`).

`normStyle` lama hanya menerima `classic` dan `accent`. Fungsi ini diganti `registry.normStyle(style)` yang memanggil `engine.normStyle` milik mesin aktif dan mempertahankan `saved` untuk semua keluarga.

## 4. localStorage

| Kunci | Pemilik | Status |
|---|---|---|
| `icon-composer-aksen-v1` | IC ≤1.5.1 | dibaca sekali untuk migrasi (fallback `icon-composer-v2`) |
| `icon-composer-meta-v1` | IC metadata Canva | dibaca sekali untuk migrasi ke `meta.canva` dokumen set |
| `template-icon-builder-aksen-v1` | TIB ≤1.6.0 | dibaca sekali untuk migrasi |
| `icon-studio-v1` | Icon Studio (set Composer dan dokumen Builder) | aktif (ADR-017) |
| `tib-canva-brand-id` | TIB | tetap, tidak pernah masuk manifest |
| `offset-composer-v1` | offset-composer 1.0.1 | dibaca sekali oleh migrasi 002, juga bila `icon-studio-v1` sudah ada (bagian 4.3) |
| `coret-composer-v1` | coret-composer 1.0.0 (gaya hand-writing) | dibaca sekali oleh migrasi 003, juga bila `icon-studio-v1` sudah ada (bagian 4.5) |
| `sticker-composer-v1` | sticker-composer | dibaca sekali oleh migrasi 004, juga bila `icon-studio-v1` sudah ada (bagian 4.6) |

`icon-studio-v1` menyimpan `schemaVersion` dan `migrations` (daftar id migrasi yang sudah dijalankan pada state ini). Migrasi berjalan berurutan (`migrations/001-…`, `002-…`, `003-…`, `004-…`), dan setiap langkah punya tes. Migrasi 001 hanya berjalan bila `icon-studio-v1` belum ada. Migrasi berikutnya berjalan bila id-nya belum tercatat di `migrations`, lalu dokumennya ditambahkan tanpa menimpa dokumen yang ada.

### 4.1 Isi `icon-studio-v1`

```js
{ schemaVersion: 1, activeId, migrations: ["002-from-offset", "003-from-hand-writing", "004-from-sticker"],
  colorPresets: ["#3A7BFF", …], swatchSource: "bawaan" | "preset",
  documents: [
  { id, kind: "set", name, style, items, customs,
    pool: { mains, mods, off }, view: { sort, cols, snap, grid, panel, anchor },
    combo: { pos, mode, skipExisting, skip },
    review: { json, html, ko, fmt, bg, size, names, flags, compare, asli, off },
    meta: { canva: { on, artist, locale, packEn, packId, kw, desc, nm }, pack?, import? } },
  { id, kind: "manifest", name, manifest, style, pv /* X|A|B|O|H|S */, items, isSample,
    exportModes, export: { modes, slot, extra, split, skipBad, kw, name, locale, creator, description, sheetCols },
    view: { filter, group, step }, issues, review } ] }
```

`view.anchor` (bawaan `TL`, salah satu `TL TC TR ML C MR BL BC BR`) adalah titik acuan kotak lapisan yang dibaca dan ditulis kolom X/Y di tab Transform Composer · Edit. Seperti seluruh `view`, nilainya tidak ikut undo.

`review.asli` (bawaan `false`): sertakan SVG asli di folder `svg-asli/` ZIP Composer (ADR-011). SVG di akar ZIP selalu direct fill; `review.ko` hanya berlaku untuk SVG asli dan sprite.

Dokumen manifest bergaya offset (Fase 3): `pv = "O"`, `export.modes.O`, dan isi warna di `style.engine.offset.mode` (`solid`, `white`, `line`).

Dokumen manifest bergaya sticker (Fase 5): `pv = "S"`, `export.modes.S`, dan mode warna di `style.engine.sticker.mode` (`sticker`, `fill`, `line`). Manifest dengan `style.family: "sticker"` diimpor langsung ke mode `S`. Tinta memakai `style.ink` (`manifestStickerStyle`). Warna isi (`manifestStickerItem`, ADR-019 butir 5): pilihan per ikon `item.engine.sticker.main.c`/`mod.c`, lalu pilihan pack `style.engine.sticker.main.c`/`mod.c`, lalu bawaan (isi objek `style.accent`, isi pengubah kuning, digeser +3 di palet bila sama dengan isi objek). Field warna hanya ada bila dipilih, dan "Ikuti warna set" menghapusnya lagi (`setStickerColor`), jadi dokumen lama tidak berubah. Di `manifest-final.json` warna yang dipilih ditulis sebagai `style.engine.sticker` dan `icons[].engine.sticker` (bentuk `{main:{c}, mod:{c}}`, hanya bagian yang dipilih) untuk pratinjau apa pun, dan dibaca lagi saat impor (`manifestStyle`, `toItem`); warna sticker lama di blok `style.engine` manifest asal diganti pilihan dokumen. Posisi manifest diabaikan, slot dipetakan ke 4 sudut. Manifest dengan `style.family: "offset"` diimpor langsung ke mode `O`, dan `style.mode` dibaca sebagai isi warna. Tinta dan aksen offset memakai `style.ink` dan `style.accent` dokumen (`manifestOffsetStyle`). Dokumen lama tanpa `modes.O` tetap terbaca (Offset tidak dicentang).

### 4.1.1 Preset saya dan sumber swatch (app-level)

`colorPresets` dan `swatchSource` berlaku untuk seluruh app (semua set dan dokumen Builder), bukan per dokumen:

- `colorPresets`: maks 16 warna `#RRGGBB` huruf besar, tanpa ganda, urutan sesuai tampilan (`normColorPresets` di `state/store.js`). Tanpa opacity, karena warna Canva dan direct fill selalu solid.
- `swatchSource`: `"bawaan"` (palet `state/data/palettes.js`) atau `"preset"` (baris swatch panel memakai 8 preset pertama). Bila preset kosong, panel tetap memakai palet bawaan.
- Keduanya tidak ikut urungkan dokumen dan diubah lewat `app.setColorPresets` dan `app.setSwatchSource`.
- `schemaVersion` tetap 1: state lama tanpa kedua field ini terbaca dengan nilai bawaan (`[]` dan `"bawaan"`), dan nilai yang tidak sah dirapikan saat dimuat.

Warna yang dipilih lewat pemilih warna ditulis ke field gaya yang sudah ada, jadi format dokumen tidak berubah:

| Kontrol | Field |
|---|---|
| Composer, Warna: Tinta, Aksen (klasik/aksen) | `style.ink`, `style.accent` |
| Composer, Warna: Tinta, Aksen (offset) | `style.engine.offset.ink`, `style.engine.offset.acc` |
| Composer · Edit: Garis/Tinta, Isian per lapisan | `style.colors[layer].line`, `style.colors[layer].fill` (`null` = ikuti warna set) |
| Builder, tab Manifest: Tinta, Aksen | `style.ink`, `style.accent` dokumen manifest (juga dipakai mode Offset lewat `manifestOffsetStyle`) |
| Builder, tab Manifest: Warna sticker Isi objek, Isi pengubah | `style.engine.sticker.main.c`, `style.engine.sticker.mod.c` dokumen manifest (kosong = bawaan aksen dan kuning) |
| Builder, tab Ikon (Sticker): Isi objek, Isi pengubah | `item.engine.sticker.main.c`, `item.engine.sticker.mod.c` (kosong = ikuti warna pack) |
| Palet kurasi dan harmoni (`applyStyleColors`) | tinta → `ink`, aksen → `accent`, isi → `style.colors.main.fill` (klasik/aksen); offset dan Builder hanya tinta dan aksen, kecuali Builder pratinjau Sticker: isi objek sticker pack dikosongkan (ikut aksen) dan isi → `style.engine.sticker.mod.c`. Peran latar palet hanya contoh dan tidak ditulis. |

Setiap perubahan warna dokumen memakai `mutate` berlabel (mis. "Warna aksen #E2552D", "Palet Laut Dalam", "Harmoni komplementer"), jadi satu langkah urungkan.

### 4.2 Migrasi 001 (`apps/icon-studio/src/state/migrations/001-from-legacy.js`)

Berjalan sekali, hanya bila `icon-studio-v1` belum ada. Kunci lama tidak diubah atau dihapus.

| Kunci lama | Hasil |
|---|---|
| `icon-composer-aksen-v1` (atau `icon-composer-v2`, gaya diganti Aksen seperti boot IC) | dokumen set "Set Icon Composer" (aktif), item lewat `normItem` |
| `packs` di kunci IC | satu dokumen set per pack (`<nama> <versi>`), info pack di `meta.pack` |
| `icon-composer-meta-v1` | `meta.canva` dokumen set dari IC |
| `template-icon-builder-aksen-v1` | dokumen Builder: `man` → `manifest`, `items` (lewat `normAcc`), `pv`, `sheetCols`, `isSample`; centang ekspor = mode pratinjau (seperti boot TIB) |

### 4.3 Migrasi 002 (`apps/icon-studio/src/state/migrations/002-from-offset.js`)

Berjalan sekali per state, ditandai `"002-from-offset"` di `migrations`, jadi juga berjalan untuk pengguna yang sudah punya `icon-studio-v1`. Dokumen hasil migrasi ditambahkan di akhir. Dokumen aktif tidak diganti, kecuali state masih kosong. Kunci lama tidak diubah atau dihapus. Konversinya ada di `state/document.js` (`offsetSetFromComposer`), dipakai bersama oleh migrasi dan impor file.

**Format sumber offset-composer 1.0.1** (`legacy/style/offset-composer-v1.0.1.html`):

| Sumber | Bentuk |
|---|---|
| localStorage `offset-composer-v1` | `{ cur, set: [ikon] }`. `cur` adalah ikon yang sedang diedit dan tidak ikut diimpor. |
| `gaya.json` di ZIP "Unduh semua" | `{ format: "offset-composer", version: "1.0.1", icons: [ikon] }` |
| ikon | `{ key, name, mode, acc, ink, dx, dy, sw, size, dTick, tickPos, dGround, dCloud, dGrass }`. Field yang hilang diisi bawaan legacy (`DEF`). `key` berprefiks `lu:` atau `tb:`. |

**Pemetaan field** (hasilnya satu dokumen set "Set Offset Composer"):

| Field lama | Menjadi |
|---|---|
| `key` | `item.main`; `item.mod = "none"` |
| `name` | `item.name` |
| `dTick`, `tickPos`, `dGround`, `dCloud`, `dGrass` | `item.engine.offset.deco = { tick, tickPos, ground, cloud, grass }` |
| `mode`, `acc`, `ink`, `dx`, `dy`, `sw` ikon pertama | `style.engine.offset`, `style.family = "offset"` |
| `size` | tidak dipakai. `style.engine.offset.size` selalu 100,8 (84% kanvas, ADR-012), legacy memakai 72. |
| (asal data) | `meta.import = { format: "offset-composer", version, source: "offset-composer-v1" \| "gaya.json", warnings }` |

Ikon dengan `key` di luar `lu:`/`tb:` dilewati. Bila nilai gaya ikon lain berbeda dari ikon pertama, `warnings` berisi "Gaya diseragamkan mengikuti ikon pertama", dan pesan ini ikut muncul di toast.

**Impor file:** teks yang ditempel atau file yang diseret di area impor (`importText` di shell) dicek dulu oleh `app.importOffsetSet`. Bila berformat offset-composer, hasilnya set Composer baru yang aktif dan app pindah ke persona Composer. Teks lain tetap diproses sebagai manifest Builder seperti sebelumnya.

### 4.4 Urungkan dan ulangi (hanya di memori)

Riwayat urungkan **tidak** disimpan ke `icon-studio-v1`; hilang saat app dimuat ulang. Modul murni `apps/icon-studio/src/state/undo.js` menyimpan per dokumen:

- `base`: salinan isi dokumen pada pencatatan terakhir.
- `past`: maks **10** langkah `{snap, label}`. Langkah tertua dibuang bila lebih.
- `future`: langkah yang bisa diulang. Dikosongkan oleh perubahan baru.

Field isi yang disalin (structuredClone): `name`, `items`, `style`, `customs`, `pool`, `combo`, `review`, `meta`, `manifest`, `export`, `pv`. Tidak ikut: `view` (tab, filter, langkah Builder, grid), `issues` (dihitung ulang dengan `validateManifest` setelah dipulihkan), dan seleksi. `meta` ikut karena metadata Canva di Tinjau disimpan di `meta.canva`.

Aturan di `app-state.js`:

- `mutate` dengan label: bila isi berbeda dari `base`, `base` lama menjadi satu langkah berlabel. Perubahan langsung sejak pencatatan terakhir (seret posisi, ukuran, atau putar di Composer · Edit) ikut dalam langkah itu, jadi satu seret = satu langkah.
- `mutate` tanpa label (render ulang, perubahan tampilan): `base` disamakan tanpa membuat langkah. Karena itu setiap perubahan isi wajib memakai label.
- Impor manifest, impor set offset, dan dokumen baru menjadi titik awal. `loadPreset` dan `close` mengosongkan riwayat dokumennya.
- `discard(docId, label)`: membatalkan langkah terakhir tanpa jejak. Isi kembali seperti sebelum langkah itu, tidak ada langkah ulangi baru, riwayat ulangi yang dikosongkan langkah itu dipulihkan, dan catatan Riwayat sesinya dihapus. Hanya berlaku bila langkah terakhir berlabel `label` dan isi belum berubah sejak langkah itu (render ulang tanpa perubahan isi tidak menghalangi; urungkan, ulangi, atau perubahan isi lain menghalangi). Dipakai lembar kontak Tinjau: klik dua kali pada sel membatalkan langkah "Ubah isi unduhan" dari klik pertama, jadi tidak tertinggal langkah urungkan kosong.
- Setelah urungkan atau ulangi: ikon pustaka didaftarkan ulang (`renderer.lib.ensure`, `ensureManifestItem`), dokumen manifest divalidasi ulang, seleksi dipertahankan atau pindah ke item pertama bila itemnya hilang, dan Riwayat sesi mencatat "Urungkan: …" atau "Ulangi: …".

### 4.5 Migrasi 003 (`apps/icon-studio/src/state/migrations/003-from-hand-writing.js`)

Aturannya sama dengan migrasi 002 (bagian 4.3): sekali per state, ditandai `"003-from-hand-writing"`, dokumen ditambahkan di akhir, dokumen aktif tidak diganti kecuali state masih kosong, kunci lama tidak diubah atau dihapus. Konversinya `handWritingSetFromComposer` di `state/document.js`, dipakai bersama oleh migrasi dan impor file; pemetaan field memakai `migrateLegacy` milik mesin hand-writing.

**Format sumber coret-composer 1.0.0** (`legacy/style/coret-composer-v1.0.0.html`):

| Sumber | Bentuk |
|---|---|
| localStorage `coret-composer-v1` | `{ S, set: [ikon], cur }`. `cur` tidak ikut diimpor. |
| `gaya.json` di ZIP "Unduh ZIP" | `{ family: "coret", version: "1.0.0", style: S, icons: [ikon] }`. `family: "hand-writing"` juga diterima. |
| ikon | `{ name, main, mod, anchor, ms, blob, seed }` (localStorage juga punya `id`, `nameEdited`). `main` dan `mod` berprefiks `lu:`, `tb:`, atau `hg:`; `mod` boleh `null`. |

**Pemetaan field** (hasilnya satu dokumen set "Set Hand-writing"):

| Field lama | Menjadi |
|---|---|
| `main`, `name` | `item.main`, `item.name` |
| `mod` (`null` = tanpa) | `item.mod` (`"none"` bila kosong atau bukan ikon pustaka) |
| `anchor` | `item.slot` (`mx`, `my` diisi `SHIFT` slot itu untuk gaya classic) |
| `ms`, `blob`, `seed` | `item.engine["hand-writing"] = { ms, blob, seed }` |
| `S` / `style` | `style.engine["hand-writing"]`, `style.family = "hand-writing"` |
| (asal data) | `meta.import = { format: "coret-composer", version, source: "coret-composer-v1" \| "gaya.json", warnings }` |

Ikon dengan `main` di luar `lu:`/`tb:`/`hg:` dilewati dengan peringatan "N ikon dilewati: bukan ikon pustaka". Gaya coret-composer berlaku untuk seluruh set, jadi tidak ada peringatan penyeragaman.

**Impor file:** di area impor, `app.importHandWritingSet` dicek setelah `importOffsetSet` dan sebelum manifest Builder. Tabler dan Hugeicons dimuat lebih dulu bila set memakainya.

### 4.6 Migrasi 004 (`apps/icon-studio/src/state/migrations/004-from-sticker.js`)

Sama dengan migrasi 002: berjalan sekali per state (ditandai `"004-from-sticker"`), dokumen ditambahkan di akhir, kunci lama tidak diubah. Berjalan setelah migrasi 003 (coret-composer, bagian 4.5). Konversinya `stickerSetFromComposer` di `state/document.js`, dipakai bersama oleh migrasi dan impor file (`app.importStickerSet`, teks yang ditempel atau diseret di area impor, dicek setelah `importHandWritingSet`).

**Format sumber sticker-composer** (`legacy/style/sticker-composer.html`):

| Sumber | Bentuk |
|---|---|
| localStorage `sticker-composer-v1` | `{ style, set: [ikon], pools: {main:[{k,c,on}], mod:[{k,c,slot,on}]} }` |
| `gaya.json` di ZIP Tinjau pack | `{ kanvas: 64, style, ikon: [ikon tanpa id] }` |
| ikon | `{ id, name, main:{k,c,s,x,y,fill}, mod:{k,c,s,slot,x,y}, deco:{on,seed,s,x,y}, vis:{main,mod} }` |

**Pemetaan** (hasilnya satu dokumen set "Set Sticker Composer", `style.family = "sticker"`):

| Field lama | Menjadi |
|---|---|
| `style` | `style.engine.sticker` (lewat `stickerParams`, nilai dibatasi rentang) |
| `main.k`, `mod.k` (kosong = `"none"`), `mod.slot` | `item.main`, `item.mod`, `item.slot` |
| `main.x/y`, `mod.x/y` (satuan 64) | `mx/my`, `nx/ny` dikali 0,75 (satuan 48) |
| `main.c/s/fill`, `mod.c/s`, `deco.seed/s/x/y` | `item.engine.sticker` (dirapikan seperti saat dirender) |
| `vis.main`, `vis.mod`, `deco.on` | `item.vis.main`, `item.vis.mod`, `item.vis.deco` |
| `pools` (hanya localStorage) | `doc.pool` (`mains`, `mods`, `off` untuk yang tidak dicentang) |
| (asal data) | `meta.import = { format: "sticker-composer", version: "", source: "sticker-composer-v1" \| "gaya.json", warnings }` |

Ikon tanpa objek `lu:`/`tb:` dilewati dengan peringatan "N ikon tanpa objek Lucide atau Tabler dilewati". Gaya legacy sudah berlaku untuk seluruh set, jadi tidak ada penyeragaman.

## 5. Migrasi dari composer gaya lama

| Sumber | Pemetaan ke item kanonik |
|---|---|
| offset `{key, name, mode, acc, ink, dx, dy, sw, size, dTick, tickPos, dGround, dCloud, dGrass}` | `main = key`, `mod = "none"`. Field gaya (`mode, acc, ink, dx, dy, sw`) diambil dari item pertama → `style.engine.offset`; `size` diganti 100,8 (ADR-012). Dekorasi → `engine.offset.deco`. Rincian di bagian 4.3. |
| coret `{main, mod, anchor, ms, blob, seed, name}` + `S` | `main, mod, slot = anchor`, `engine["hand-writing"] = {ms, blob, seed}`, `S` → `style.engine["hand-writing"]`, `family = "hand-writing"`. |
| sticker `{main:{k,c,s,x,y,fill}, mod:{k,c,s,slot,x,y}, deco, vis}` | `main = main.k`, `mod = mod.k || "none"`, `slot = mod.slot`, `mx/my = main.x/y × 0,75`, `nx/ny = mod.x/y × 0,75` (kanvas 64 → 48), sisanya → `engine.sticker`. Rincian di bagian 4.5. |

Kalau set gaya lama berisi ikon dengan nilai gaya berbeda-beda (misalnya offset dengan `acc` berbeda per ikon), app menampilkan peringatan: "Gaya diseragamkan mengikuti ikon pertama". Alasannya, di IC parameter gaya berlaku untuk seluruh set.

## 6. Nama keluarga lama

`registry.migrateFamily(name)`:
- `"coret"` → `"hand-writing"`
- `undefined` (manifest v1) → `"accent"`
- `"X"` (pratinjau TIB lama) → `"accent"`, `"A"`/`"B"` → `"classic"` dengan `pref` yang sesuai
