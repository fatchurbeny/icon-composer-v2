// @ts-check
/**
 * Matriks Kombinasi: objek × pengubah dari pool set (kombinasi massal Icon Composer 1.5.1).
 * Status sel mengikuti DESIGN-HANDOFF 3.5: on, skipped, exists, library. Status `similar`
 * (sidik jari) menyusul di Fase 6.
 */
import { normItem } from "./document.js";

/** Pilihan matriks bawaan. `pos`: default = slot bawaan pengubah; `mode`: set = mode warna set, all = A, B, C. */
export const DEFAULT_COMBO = { pos: "default", mode: "set", skipExisting: true, skip: {} };

/** @param {any} doc set Composer (sudah lewat ensureSetFields) */
export function ensureComboFields(doc) {
  const prev = doc.combo || {};
  /* skip disalin baru supaya objek bawaan tidak terbagi antardokumen */
  doc.combo = { ...DEFAULT_COMBO, ...prev, skip: { ...(prev.skip || {}) } };
  return doc;
}

/**
 * Objek dan pengubah aktif di pool.
 * @param {{mains: string[], mods: string[], off: Record<string, boolean>}} pool
 */
export function activePool(pool) {
  return {
    mains: pool.mains.filter((k) => !pool.off[`main|${k}`]),
    mods: pool.mods.filter((k) => !pool.off[`mod|${k}`]),
  };
}

/**
 * Gaya tanpa pengubah (offset): kombinasi hanya memakai daftar objek.
 * @param {any} doc
 */
export const objectsOnly = (doc) => doc.style.family === "offset";

/** Kunci ikon pustaka (lu, tb, hg, cu). Objek bawaan tidak didukung gaya offset dan hand-writing. */
const LIB_KEY = /^(lu|tb|hg|cu):/;

/**
 * Gaya yang hanya merender ikon pustaka (offset, hand-writing).
 * @param {any} doc
 */
export const libraryOnly = (doc) => doc.style.family === "offset" || doc.style.family === "hand-writing";

/**
 * Baris matriks: objek aktif. Offset dan hand-writing melewati objek bawaan karena tidak bisa dirender.
 * @param {any} doc
 */
export const matrixMains = (doc) => activePool(doc.pool).mains.filter((m) => !libraryOnly(doc) || LIB_KEY.test(m));

/**
 * Kolom matriks: pengubah aktif, atau satu kolom "none" untuk gaya tanpa pengubah. Hand-writing hanya
 * memakai pengubah pustaka.
 * @param {any} doc
 */
export const matrixMods = (doc) => (objectsOnly(doc) ? ["none"] : activePool(doc.pool).mods.filter((d) => !libraryOnly(doc) || LIB_KEY.test(d)));

/**
 * Item hasil kombinasi (batchItem IC).
 * @param {string} m objek utama
 * @param {string} d pengubah
 * @param {{pos: string}} combo
 * @param {string | null} pref mode warna (A/B/C) atau null = ikuti set
 * @param {any} lib registry
 * @param {string} [family] keluarga gaya set (hand-writing: posisi bawaan BR seperti coret-composer)
 */
export function comboItem(m, d, combo, pref, lib, family) {
  if (d === "none") {
    const M = lib.MAINS[m];
    return normItem({ main: m, mod: "none", mx: 0, my: 0, pref: pref || "set", name: M ? M.n : m }, lib);
  }
  const slot = combo.pos === "default" ? (family === "hand-writing" ? "BR" : (lib.MODS[d] && lib.MODS[d].slot) || "BL") : combo.pos;
  const M = lib.MAINS[m],
    D = lib.MODS[d];
  return normItem(
    { main: m, mod: d, slot, mx: lib.SHIFT[slot][0], my: lib.SHIFT[slot][1], pref: pref || "set", name: `${M ? M.n : m} + ${D ? String(D.n).toLowerCase() : d}${pref ? " (" + pref + ")" : ""}` },
    lib,
  );
}

/**
 * Mode warna yang dibuat untuk tiap kombinasi.
 * @param {any} doc
 */
export const comboPrefs = (doc) => (doc.combo.mode === "all" && doc.style.family === "classic" ? ["A", "B", "C"] : [null]);

/**
 * Status satu sel.
 * @param {any} doc
 * @param {string} m
 * @param {string} d
 * @param {{lib: any, signature: (it: any) => string, collisions: (it: any) => string[], existing: Set<string>}} deps
 * @returns {{state: "on" | "skipped" | "exists" | "library", flag: string, item: any}}
 */
export function cellState(doc, m, d, deps) {
  const item = comboItem(m, d, doc.combo, null, deps.lib, doc.style.family);
  const hits = deps.collisions(item);
  if (hits.length) return { state: "library", flag: `= ${hits[0]}`, item };
  if (doc.combo.skipExisting && deps.existing.has(deps.signature(item))) return { state: "exists", flag: "di set", item };
  if (doc.combo.skip[`${m}|${d}`]) return { state: "skipped", flag: "dilewati", item };
  return { state: "on", flag: "", item };
}

/**
 * Seluruh matriks dan rekap jumlah per status.
 * @param {any} doc
 * @param {{lib: any, signature: (it: any) => string, collisions: (it: any) => string[]}} deps
 */
export function comboMatrix(doc, deps) {
  const mains = matrixMains(doc),
    mods = matrixMods(doc);
  const existing = new Set(doc.items.map((/** @type {any} */ it) => deps.signature(it)));
  const rows = mains.map((m) => ({ main: m, cells: mods.map((d) => ({ mod: d, ...cellState(doc, m, d, { ...deps, existing }) })) }));
  const count = { on: 0, skipped: 0, exists: 0, library: 0 };
  for (const r of rows) for (const c of r.cells) count[c.state]++;
  return { mains, mods, rows, count, add: count.on * comboPrefs(doc).length };
}

/**
 * Tambahkan kombinasi berstatus `on` ke set.
 * @param {any} doc
 * @param {{lib: any, signature: (it: any) => string, collisions: (it: any) => string[]}} deps
 * @returns {{added: any[]}}
 */
export function addCombos(doc, deps) {
  const matrix = comboMatrix(doc, deps);
  const added = [];
  for (const r of matrix.rows)
    for (const c of r.cells) {
      if (c.state !== "on") continue;
      for (const p of comboPrefs(doc)) {
        const it = comboItem(r.main, c.mod, doc.combo, p, deps.lib, doc.style.family);
        doc.items.push(it);
        added.push(it);
      }
    }
  return { added };
}

/**
 * Lewati atau pilih sekumpulan sel sekaligus (kepala baris/kolom, Pilih semua, Lewati semua).
 * @param {any} doc
 * @param {[string, string][]} cells pasangan [objek, pengubah]
 * @param {boolean} skip
 */
export function setSkip(doc, cells, skip) {
  for (const [m, d] of cells) {
    if (skip) doc.combo.skip[`${m}|${d}`] = true;
    else delete doc.combo.skip[`${m}|${d}`];
  }
  return doc;
}

/**
 * Tambah atau keluarkan kunci dari pool.
 * @param {any} pool
 * @param {"main" | "mod"} kind
 * @param {string} key
 * @returns {boolean} true bila sekarang ada di pool
 */
export function togglePool(pool, kind, key) {
  const list = kind === "main" ? pool.mains : pool.mods;
  const i = list.indexOf(key);
  if (i >= 0) {
    list.splice(i, 1);
    delete pool.off[`${kind}|${key}`];
    return false;
  }
  list.push(key);
  return true;
}
