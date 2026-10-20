// @ts-check
/**
 * Operasi Composer · Edit pada satu ikon (posisi lapisan, kotak lapisan, slot, warna bagian aksen).
 * Dipindah dari Icon Composer 1.5.1 (`boxes`, `getXY`, `setXY`, `cycleRole`, handler slot dan reset).
 */
import { geomClassic } from "@icon-studio/engines/classic";
import { ROLES } from "@icon-studio/engines/shared";
import { STYLE_RANGES } from "./set-ops.js";

/** Kunci posisi per lapisan (KEYS IC). */
export const LAYER_KEYS = { main: ["mx", "my"], mod: ["nx", "ny"], deco: ["x", "y"] };
/** Rentang posisi per lapisan (RANGE IC). */
export const LAYER_RANGE = { main: [-12, 12], mod: [-12, 12], deco: [0, 48] };
export const LAYERS = /** @type {const} */ (["main", "mod", "deco"]);

/**
 * @typedef {"main" | "mod" | "deco"} Layer
 * @typedef {{x: number, y: number, w: number, h: number}} Box
 * @typedef {{x: number, y: number}} Pt
 */

/** Kunci rotasi per ikon (derajat). Objek utama dan pengubah memakai field baru, dekorasi memakai `deco.r` IC. */
export const ROT_KEYS = { main: "mr", mod: "nr", deco: "r" };
/** Rentang rotasi lapisan (derajat). */
export const ROT_RANGE = [-180, 180];

/**
 * Posisi lapisan dalam satuan kanvas 48.
 * @param {any} it
 * @param {Layer} layer
 * @returns {[number, number]}
 */
export function getXY(it, layer) {
  if (layer === "deco") return [it.deco.x, it.deco.y];
  const [kx, ky] = LAYER_KEYS[layer];
  return [it[kx], it[ky]];
}

/**
 * Atur posisi lapisan, dibatasi rentangnya. `snap` membulatkan ke 0,5 seperti IC; tanpa snap ke 0,05.
 * @param {any} it
 * @param {Layer} layer
 * @param {number} x
 * @param {number} y
 * @param {{snap?: boolean}} [opts]
 */
export function setXY(it, layer, x, y, opts = { snap: true }) {
  const [min, max] = LAYER_RANGE[layer];
  const step = opts.snap === false ? 20 : 2;
  const sn = (/** @type {number} */ v) => Math.max(min, Math.min(max, Math.round(v * step) / step));
  if (layer === "deco") {
    it.deco.x = sn(x);
    it.deco.y = sn(y);
  } else {
    const [kx, ky] = LAYER_KEYS[layer];
    it[kx] = sn(x);
    it[ky] = sn(y);
  }
  return it;
}

/**
 * Kotak tiap lapisan dalam satuan 48 (boxes IC). Lapisan tersembunyi atau kosong berukuran 0.
 * @param {any} it
 * @param {any} style
 * @param {{MODS: Record<string, any>, DECOS: Record<string, any>, PREFS: Record<string, any>}} lib
 * @returns {Record<Layer, Box>}
 */
export function layerBoxes(it, style, lib) {
  const g = geomClassic(it, /** @type {any} */ ({ style, MODS: lib.MODS, PREFS: lib.PREFS })),
    ms = style.scale.main / 100,
    d = it.deco,
    s = style.scale.deco / 100;
  const z = { x: 0, y: 0, w: 0, h: 0 };
  const D = lib.DECOS[d.type];
  return {
    main: it.vis.main ? { x: 24 + it.mx - 20 * ms, y: 24 + it.my - 20 * ms, w: 40 * ms, h: 40 * ms } : z,
    mod: g.md ? { x: g.L, y: g.T, w: g.W, h: g.H } : z,
    deco:
      it.vis.deco && d.type !== "none"
        ? D && D.star
          ? d.type === "star4"
            ? { x: d.x - 4.5 * s, y: d.y - 4.5 * s, w: 9 * s, h: 9 * s }
            : { x: d.x - 5.5 * s, y: d.y - 6.5 * s, w: 12.5 * s, h: 12.5 * s }
          : String(d.type).startsWith("c:")
            ? { x: d.x - 5 * s, y: d.y - 5 * s, w: 10 * s, h: 10 * s }
            : { x: d.x - 6.5 * s, y: d.y - 4.5 * s, w: 13 * s, h: 9 * s }
        : z,
  };
}

/**
 * Ganti slot pengubah: geser direset dan objek utama ikut digeser (handler data-slot IC).
 * @param {any} it
 * @param {string} slot
 * @param {Record<string, number[]>} SHIFT
 */
export function setSlot(it, slot, SHIFT) {
  if (!SHIFT[slot]) return it;
  it.slot = slot;
  it.nx = 0;
  it.ny = 0;
  [it.mx, it.my] = SHIFT[slot];
  return it;
}

/**
 * Kembalikan posisi dan rotasi lapisan ke bawaan (tombol reset IC).
 * @param {any} it
 * @param {Layer} layer
 * @param {{SHIFT: Record<string, number[]>, DECOS: Record<string, any>}} lib
 */
export function resetLayer(it, layer, lib) {
  if (layer === "main") {
    [it.mx, it.my] = it.mod !== "none" ? lib.SHIFT[it.slot] : [0, 0];
    delete it.mr;
  } else if (layer === "mod") {
    it.nx = 0;
    it.ny = 0;
    delete it.nr;
  } else {
    const h = lib.DECOS[it.deco.type] ? lib.DECOS[it.deco.type].home : [9, 9];
    Object.assign(it.deco, { x: h[0], y: h[1], s: 100, r: 0 });
  }
  return it;
}

/**
 * Pasang dekorasi bawaan di posisi asalnya (handler data-dtype IC).
 * @param {any} it
 * @param {string} type
 * @param {Record<string, any>} DECOS
 */
export function setDeco(it, type, DECOS) {
  const h = DECOS[type] ? DECOS[type].home : [9, 9];
  it.deco = { ...it.deco, type, x: h[0], y: h[1], r: 0 };
  it.vis.deco = true;
  return it;
}

/**
 * Atur peran satu bagian objek utama (gaya aksen). Bagian terbuka tidak bisa diisi.
 * @param {any} it
 * @param {{parts: {closed: boolean}[]}} info
 * @param {string[]} roles peran saat ini (rolesOf)
 * @param {number} i
 * @param {string} role
 */
export function setPartRole(it, info, roles, i, role) {
  const p = info.parts[i];
  if (!p || !ROLES.includes(role) || (!p.closed && role.startsWith("fill"))) return it;
  it.parts = Object.fromEntries(roles.map((r, j) => [j, r]));
  it.parts[i] = role;
  return it;
}

/* ---------- ubah ukuran dan putar (pegangan kotak seleksi) ---------- */

/**
 * Rotasi lapisan dalam derajat (0 bila belum diatur).
 * @param {any} it
 * @param {Layer} layer
 */
export function getRot(it, layer) {
  const v = layer === "deco" ? it.deco.r : it[ROT_KEYS[layer]];
  return Number(v) || 0;
}

/**
 * Atur rotasi lapisan per ikon. Sudut dibungkus ke -180..180 lalu dibulatkan ke 1 derajat,
 * atau ke kelipatan 15 derajat bila `snap` (Shift). Rotasi 0 pada objek utama dan pengubah
 * menghapus field-nya, supaya item tanpa rotasi tetap sama dengan data IC 1.5.1.
 * @param {any} it
 * @param {Layer} layer
 * @param {number} deg
 * @param {{snap?: boolean}} [opts]
 */
export function setRot(it, layer, deg, opts = {}) {
  if (!Number.isFinite(Number(deg))) return it;
  const step = opts.snap ? 15 : 1;
  let v = Math.round(Number(deg) / step) * step;
  v = ((((v + 180) % 360) + 360) % 360) - 180;
  if (v === -180 && Number(deg) > 0) v = 180;
  v = v || 0;
  if (layer === "deco") it.deco.r = v;
  else if (v) it[ROT_KEYS[layer]] = v;
  else delete it[ROT_KEYS[layer]];
  return it;
}

/**
 * Putar titik `p` mengelilingi `c` sebesar `deg` derajat.
 * @param {Pt} p @param {Pt} c @param {number} deg
 * @returns {Pt}
 */
export function rotatePt(p, c, deg) {
  const a = (deg * Math.PI) / 180,
    dx = p.x - c.x,
    dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
}

/**
 * Pusat rotasi lapisan dalam satuan 48, sama dengan transform mesin classic/accent:
 * objek utama di pusat objek, pengubah di pusat kotaknya, dekorasi di titik (x, y).
 * @param {any} it
 * @param {Layer} layer
 * @param {Box} box kotak lapisan (layerBoxes)
 * @returns {Pt}
 */
export function rotCenter(it, layer, box) {
  if (layer === "main") return { x: 24 + it.mx, y: 24 + it.my };
  if (layer === "deco") return { x: it.deco.x, y: it.deco.y };
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

/**
 * Titik tetap saat skala lapisan berubah (satuan 48, sudah diputar). Objek utama dan dekorasi
 * berskala di pusatnya. Pengubah berskala dari sudut atau sisi slotnya, seperti `anchoredModifierGeometry`.
 * @param {any} it
 * @param {Layer} layer
 * @param {Box} box
 * @returns {Pt}
 */
export function scalePivot(it, layer, box) {
  const c = rotCenter(it, layer, box);
  if (layer !== "mod") return c;
  const row = it.slot[0],
    col = it.slot[1];
  const p = { x: (col === "L" ? 2 : col === "R" ? 46 : 24) + it.nx, y: (row === "T" ? 2 : row === "B" ? 46 : 24) + it.ny };
  return rotatePt(p, c, getRot(it, layer));
}

/**
 * Skala set baru dari seretan pegangan: perbandingan jarak kursor ke titik tetap sebelum dan sesudah.
 * Hasilnya dibulatkan ke 1% (Shift: kelipatan 5%) dan dibatasi rentang `scale.<layer>` di STYLE_RANGES.
 * @param {Layer} layer
 * @param {number} s0 skala awal (%)
 * @param {Pt} pivot
 * @param {Pt} p0 titik awal seretan
 * @param {Pt} p1 titik sekarang
 * @param {{snap?: boolean}} [opts]
 */
export function scaleFromDrag(layer, s0, pivot, p0, p1, opts = {}) {
  const [min, max] = /** @type {any} */ (STYLE_RANGES)[`scale.${layer}`];
  const d0 = Math.hypot(p0.x - pivot.x, p0.y - pivot.y);
  if (d0 < 0.01) return s0;
  const step = opts.snap ? 5 : 1;
  const v = Math.round((s0 * Math.hypot(p1.x - pivot.x, p1.y - pivot.y)) / d0 / step) * step;
  return Math.max(min, Math.min(max, v));
}

/**
 * Sudut baru dari seretan zona putar: sudut awal ditambah selisih arah kursor terhadap pusat.
 * @param {number} r0
 * @param {Pt} c
 * @param {Pt} p0
 * @param {Pt} p1
 */
export function angleFromDrag(r0, c, p0, p1) {
  const a0 = Math.atan2(p0.y - c.y, p0.x - c.x),
    a1 = Math.atan2(p1.y - c.y, p1.x - c.x);
  return r0 + ((a1 - a0) * 180) / Math.PI;
}

/* ---------- panel Transform gaya Affinity (titik acuan, W/H) ---------- */

/** Titik acuan kotak lapisan, urut baris demi baris seperti `.ic-anchor` 3×3. */
export const ANCHOR_POINTS = /** @type {const} */ (["TL", "TC", "TR", "ML", "C", "MR", "BL", "BC", "BR"]);
/** Titik acuan bawaan (kiri atas, seperti Affinity). Disimpan di `view.anchor`. */
export const DEFAULT_ANCHOR = "TL";

/**
 * Pecahan [fx, fy] titik acuan di dalam kotak: 0 = kiri/atas, 0,5 = tengah, 1 = kanan/bawah.
 * Nilai yang tidak dikenal dibaca sebagai titik acuan bawaan.
 * @param {string} anchor
 * @returns {[number, number]}
 */
export function anchorFrac(anchor) {
  const a = /** @type {readonly string[]} */ (ANCHOR_POINTS).includes(anchor) ? anchor : DEFAULT_ANCHOR;
  const row = a[0],
    col = a[1] || "C";
  return [col === "L" ? 0 : col === "R" ? 1 : 0.5, row === "T" ? 0 : row === "B" ? 1 : 0.5];
}

/**
 * Koordinat titik acuan kotak lapisan dalam satuan 48 (kotak sebelum rotasi, seperti layerBoxes).
 * @param {Box} box
 * @param {string} anchor
 * @returns {[number, number]}
 */
export function anchorXY(box, anchor) {
  const [fx, fy] = anchorFrac(anchor);
  return [box.x + fx * box.w, box.y + fy * box.h];
}

/**
 * Geser lapisan supaya titik acuan kotaknya jatuh di (ax, ay). Menggeser lapisan menggeser kotaknya
 * sejauh yang sama, jadi selisihnya ditambahkan ke posisi getXY lalu ditulis lewat setXY
 * (rentang LAYER_RANGE dan snap tetap berlaku).
 * @param {any} it
 * @param {Layer} layer
 * @param {Box} box kotak lapisan saat ini
 * @param {string} anchor
 * @param {number} ax
 * @param {number} ay
 * @param {{snap?: boolean}} [opts]
 */
export function setAnchorXY(it, layer, box, anchor, ax, ay, opts) {
  const [px, py] = getXY(it, layer),
    [cx, cy] = anchorXY(box, anchor);
  return setXY(it, layer, px + Number(ax) - cx, py + Number(ay) - cy, opts);
}

/**
 * Rentang X dan Y titik acuan: LAYER_RANGE digeser sejauh jarak titik acuan ke posisi lapisan.
 * @param {any} it
 * @param {Layer} layer
 * @param {Box} box
 * @param {string} anchor
 * @returns {{x: [number, number], y: [number, number]}}
 */
export function anchorRange(it, layer, box, anchor) {
  const [px, py] = getXY(it, layer),
    [cx, cy] = anchorXY(box, anchor),
    [min, max] = LAYER_RANGE[layer];
  return { x: [min + cx - px, max + cx - px], y: [min + cy - py, max + cy - py] };
}

/**
 * Skala set baru dari ukuran W atau H baru. Mesin hanya mengenal skala seragam, dan ukuran kotak
 * sebanding dengan skala, jadi skala = skala lama × ukuran baru / ukuran lama. Dibulatkan ke 1%
 * dan dibatasi rentang `scale.<layer>` di STYLE_RANGES. Ukuran lama 0 (lapisan kosong) tidak mengubah apa pun.
 * @param {Layer} layer
 * @param {number} s0 skala sekarang (%)
 * @param {number} size0 W atau H sekarang
 * @param {number} size1 W atau H baru
 */
export function scaleForSize(layer, s0, size0, size1) {
  const [min, max] = /** @type {any} */ (STYLE_RANGES)[`scale.${layer}`];
  if (!(size0 > 0) || !Number.isFinite(Number(size1))) return s0;
  return Math.max(min, Math.min(max, Math.round((s0 * Number(size1)) / size0)));
}

/**
 * Rentang ukuran (W atau H) yang bisa dicapai dalam rentang skala set lapisan.
 * @param {Layer} layer
 * @param {number} s0 skala sekarang (%)
 * @param {number} size0 W atau H sekarang
 * @returns {[number, number]}
 */
export function sizeRange(layer, s0, size0) {
  const [min, max] = /** @type {any} */ (STYLE_RANGES)[`scale.${layer}`];
  return [(size0 * min) / s0, (size0 * max) / s0];
}
