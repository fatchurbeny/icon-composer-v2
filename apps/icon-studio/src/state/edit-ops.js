// @ts-check
/**
 * Operasi Composer · Edit pada satu ikon (posisi lapisan, kotak lapisan, slot, warna bagian aksen).
 * Dipindah dari Icon Composer 1.5.1 (`boxes`, `getXY`, `setXY`, `cycleRole`, handler slot dan reset).
 */
import { geomClassic } from "@icon-studio/engines/classic";
import { ROLES } from "@icon-studio/engines/shared";

/** Kunci posisi per lapisan (KEYS IC). */
export const LAYER_KEYS = { main: ["mx", "my"], mod: ["nx", "ny"], deco: ["x", "y"] };
/** Rentang posisi per lapisan (RANGE IC). */
export const LAYER_RANGE = { main: [-12, 12], mod: [-12, 12], deco: [0, 48] };
export const LAYERS = /** @type {const} */ (["main", "mod", "deco"]);

/**
 * @typedef {"main" | "mod" | "deco"} Layer
 * @typedef {{x: number, y: number, w: number, h: number}} Box
 */

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
 * Kembalikan posisi lapisan ke bawaan (tombol reset IC).
 * @param {any} it
 * @param {Layer} layer
 * @param {{SHIFT: Record<string, number[]>, DECOS: Record<string, any>}} lib
 */
export function resetLayer(it, layer, lib) {
  if (layer === "main") [it.mx, it.my] = it.mod !== "none" ? lib.SHIFT[it.slot] : [0, 0];
  else if (layer === "mod") {
    it.nx = 0;
    it.ny = 0;
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
