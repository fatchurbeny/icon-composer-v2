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
  nx, ny, mx, my, ms, size,    // geser pengubah, geser objek, skala
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
- `normItem` mengisi `engine.<id>` dengan bawaan mesin bila belum ada.
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

`normStyle` lama hanya menerima `classic` dan `accent`. Fungsi ini diganti `registry.normStyle(style)` yang memanggil `engine.normStyle` milik mesin aktif dan mempertahankan `saved` untuk semua keluarga.

## 4. localStorage

| Kunci | Pemilik | Status |
|---|---|---|
| `icon-composer-aksen-v1` | IC ≤1.5.1 | dibaca sekali untuk migrasi |
| `icon-composer-v3` | IC baru | aktif |
| `icon-composer-meta-v1` | IC metadata Canva | tetap |
| `template-icon-builder-aksen-v1` | TIB ≤1.6.0 | dibaca sekali untuk migrasi |
| `template-icon-builder-v2` | TIB baru | aktif |
| `tib-canva-brand-id` | TIB | tetap, tidak pernah masuk manifest |
| `offset-composer-v1`, `coret-composer-v1`, `sticker-composer-v1` | composer gaya lama | **impor opsional** lewat menu "Impor set dari composer gaya lama" |

Setiap app menyimpan `schemaVersion`. Migrasi berjalan berurutan (`migrations/001-…`, `002-…`), dan setiap langkah punya tes.

## 5. Migrasi dari composer gaya lama

| Sumber | Pemetaan ke item kanonik |
|---|---|
| offset `{key, name, mode, acc, ink, dx, dy, sw, size, dTick, tickPos, dGround, dCloud, dGrass}` | `main = key`, `mod = "none"`. Field gaya (`mode, acc, ink, dx, dy, sw, size`) diambil dari item pertama → `style.engine.offset`. Dekorasi → `engine.offset.deco`. |
| coret `{main, mod, anchor, ms, blob, seed, name}` + `S` | `main, mod, slot = anchor`, `engine["hand-writing"] = {ms, blob, seed}`, `S` → `style.engine["hand-writing"]`, `family = "hand-writing"`. |
| sticker `{main:{k,c,s,x,y,fill}, mod:{k,c,s,slot,x,y}, deco, vis}` | `main = main.k`, `mod = mod.k || "none"`, `slot = mod.slot`, `mx/my = main.x/y`, `nx/ny = mod.x/y`, sisanya → `engine.sticker`. |

Kalau set gaya lama berisi ikon dengan nilai gaya berbeda-beda (misalnya offset dengan `acc` berbeda per ikon), app menampilkan peringatan: "Gaya diseragamkan mengikuti ikon pertama". Alasannya, di IC parameter gaya berlaku untuk seluruh set.

## 6. Nama keluarga lama

`registry.migrateFamily(name)`:
- `"coret"` → `"hand-writing"`
- `undefined` (manifest v1) → `"accent"`
- `"X"` (pratinjau TIB lama) → `"accent"`, `"A"`/`"B"` → `"classic"` dengan `pref` yang sesuai
