# Kontrak mesin gaya

Setiap gaya adalah satu modul di `packages/engines/<id>/index.js` yang mendaftarkan objek berikut ke registry.

## 1. Antarmuka

```js
/** @typedef {"classic"|"accent"|"offset"|"hand-writing"|"sticker"} EngineId */

/**
 * @typedef Engine
 * @property {EngineId} id
 * @property {string}   version        semver mesin, ikut ditulis ke gaya.json dan manifest-final.json
 * @property {string}   label          nama di UI, contoh "Hand-writing"
 * @property {number}   canvas         sisi viewBox asli (48, 120, 24, 64)
 * @property {{mod:boolean, deco:boolean, builtinMains:boolean, perItemColor:boolean, maxColors:number}} supports
 * @property {object}   defaults       patokan gaya awal (dulu FAMILY_DEFAULT)
 * @property {(s:object)=>object} normStyle       mengisi dan membatasi nilai gaya
 * @property {(it:Item, s:object)=>object} adapt  item kanonik → parameter mesin
 * @property {(p:object, s:object, opt:ComposeOpt)=>string} compose  string <svg>
 * @property {(it:Item, s:object)=>Axis[]} axes  sumbu variasi diskret (boleh [])
 * @property {(it:Item, s:object)=>string} signature  kunci identitas rakitan
 * @property {(it:Item, s:object)=>Flag[]} [flags] flag khusus mesin (opsional)
 */

/** @typedef {{size?:number, mode?:"mask"|"white", idp?:string, deco?:boolean, back?:"white"|null}} ComposeOpt */
/** @typedef {{id:string, values:(string|number)[], weight?:number, blockedBy?:(it:Item, v:any)=>boolean}} Axis */
/** @typedef {[("err"|"warn"|"info"), string]} Flag */
```

## 2. Aturan wajib

1. **Murni dan deterministik.** Input yang sama (item, gaya, opt, `item.seed`, `item.var`) harus menghasilkan string yang sama persis. Tidak boleh ada `Math.random()`, `Date.now()`, atau akses DOM selain lewat `shared/measure`.
2. **ID unik per render.** Id `mask`/`defs` memakai `opt.idp` sebagai prefiks, supaya banyak ikon dalam satu halaman tidak bentrok (masalah lama: `uidN` global di coret).
3. **`opt.mode`** harus didukung:
   - `mask`: knockout dengan `<mask>` (bawaan, untuk UI dan ekspor).
   - `white`: knockout dengan siluet putih (untuk pratinjau ringan).
4. **`opt.deco === false`** merender tanpa dekorasi. Dipakai untuk sidik jari "inti" (lihat `ANTI-REPETITION.md`).
5. **Warna ditulis sebagai atribut langsung.** Jumlah warna unik di keluaran tidak boleh melebihi `supports.maxColors` (≤5).
6. **Tanpa `stroke-dasharray`, `pathLength`, `<style>`, `<use>`, `<clipPath>`** di keluaran. Mesin yang butuh efek putus-putus memanggang dash jadi geometri.
7. **Item yang tidak didukung tidak boleh membuat crash.** Contoh: objek bawaan (`face`) di mesin yang `builtinMains:false`. `compose` mengembalikan SVG kosong 48×48, dan `flags` mengembalikan `["err", "Objek bawaan tidak didukung gaya <label>"]`.

## 3. `adapt`: dari item kanonik ke parameter mesin

Item kanonik mengikuti model IC (lihat `DATA-MODEL.md`). Setiap mesin menerjemahkan field yang relevan dan mengabaikan sisanya. Field yang diabaikan **tidak dihapus** dari item, supaya pindah gaya tidak menghilangkan data.

Pemetaan posisi pengubah (8 slot IC: TL TC TR ML MR BL BC BR):

| Mesin | Pemetaan |
|---|---|
| classic, accent | langsung |
| hand-writing | langsung ke `ANC` (8 titik) |
| sticker | ke 4 sudut: TC→TR, ML→TL, MR→TR, BC→BR. UI sticker menampilkan hanya 4 slot. |
| offset | tidak ada pengubah (`supports.mod:false`) |

## 4. `signature`

Format: `<engineId>|<concept main>|<concept mod atau "-">|<slot atau "-">`.

- `concept(key)` ada di `icon-sources`. Fungsi ini membuang prefiks sumber (`lu:`, `tb:`, `hg:`, `cu:`), menerapkan alias bawaan (`MAIN_ALIAS`, `MOD_ALIAS`), angka varian (`-2`), dan sinonim pengubah (`MOD_SYN`, contoh `circle-check` = `check-circle` = `check`).
- Mesin dengan `supports.mod:false` menulis `-` untuk pengubah dan slot.
- Slot dipetakan dulu lewat `adapt`. Dua item sticker dengan slot TC dan TR punya signature sama.

## 5. `axes`

Sumbu variasi diskret yang boleh diubah planner tanpa melanggar konsistensi set. Parameter gaya set (tebal garis, warna tinta, besar offset) **bukan** sumbu. Daftar sumbu per mesin ada di `docs/engines/<id>.md`.

## 6. Menambah mesin baru

1. Buat `packages/engines/<id>/index.js` dan `docs/engines/<id>.md`.
2. Daftarkan di `packages/engines/registry.js`.
3. Tambah fixture di `tests/fixtures/engines/<id>/` dan golden SVG.
4. Pastikan lolos `tests/e2e/export-canva.spec.js` (≤5 warna, direct fill valid).
5. Tambah kata gaya untuk metadata (`STYLE_WORDS` di `packages/export`).
6. Tambah ADR di `DECISIONS.md`.
