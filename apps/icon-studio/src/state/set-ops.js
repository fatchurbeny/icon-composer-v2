// @ts-check
/**
 * Operasi pada dokumen set Composer. Murni terhadap DOM: hanya mengubah objek dokumen yang diberikan.
 * Perilaku mengikuti Icon Composer 1.5.1 (tambah, duplikat, hapus, ganti isi lapisan, gaya set).
 */
import { ensureComboFields } from "./combo-ops.js";
import { applyFamily, blankItem, normItem } from "./document.js";

/** Pool Kombinasi bawaan (bSel IC 1.5.1). */
export const DEFAULT_POOL = { mains: ["face", "doc", "cart"], mods: ["bubble", "lock", "plus", "card"], off: {} };

/** Preferensi tampilan set bawaan. */
export const DEFAULT_VIEW = { sort: "set", cols: 8, snap: true, grid: true };

/**
 * Lengkapi field set yang ditambahkan Icon Studio (pool, tampilan).
 * @param {any} doc
 */
export function ensureSetFields(doc) {
  doc.pool = doc.pool && Array.isArray(doc.pool.mains) ? doc.pool : structuredClone(DEFAULT_POOL);
  doc.pool.off = doc.pool.off || {};
  doc.view = { ...DEFAULT_VIEW, ...(doc.view || {}) };
  return ensureComboFields(doc);
}

/**
 * Nama tampilan ikon (nameOf IC).
 * @param {any} it
 * @param {{MAINS: Record<string, any>, MODS: Record<string, any>}} lib
 */
export function nameOf(it, lib) {
  if (it.name) return it.name;
  const M = lib.MAINS[it.main],
    D = it.mod !== "none" ? lib.MODS[it.mod] : null;
  return (M ? M.n : it.main) + (D ? " + " + String(D.n).toLowerCase() : "");
}

/**
 * Tambah ikon kosong di akhir set.
 * @param {any} doc
 * @param {import("./document.js").Library} lib
 * @param {any} [init]
 */
export function addItem(doc, lib, init = {}) {
  const it = normItem({ ...blankItem(), ...init, id: null }, lib, { customs: doc.customs });
  doc.items.push(it);
  return it;
}

/**
 * Duplikat ikon tepat setelah aslinya (nama + " (2)", seperti IC).
 * @param {any} doc
 * @param {string} id
 * @param {import("./document.js").Library} lib
 */
export function duplicateItem(doc, id, lib) {
  const i = doc.items.findIndex((/** @type {any} */ it) => it.id === id);
  if (i < 0) return null;
  const src = doc.items[i];
  const it = normItem({ ...structuredClone(src), id: null, name: nameOf(src, lib) + " (2)" }, lib, { customs: doc.customs });
  doc.items.splice(i + 1, 0, it);
  return it;
}

/**
 * Hapus ikon. Mengembalikan id ikon yang sebaiknya dipilih berikutnya.
 * @param {any} doc
 * @param {string} id
 */
export function removeItem(doc, id) {
  const i = doc.items.findIndex((/** @type {any} */ it) => it.id === id);
  if (i < 0) return null;
  doc.items.splice(i, 1);
  const next = doc.items[Math.min(i, doc.items.length - 1)];
  return next ? next.id : null;
}

/**
 * Pindahkan ikon ke posisi baru di urutan set.
 * @param {any} doc
 * @param {string} id
 * @param {number} to indeks tujuan setelah ikon diangkat
 */
export function moveItem(doc, id, to) {
  const i = doc.items.findIndex((/** @type {any} */ it) => it.id === id);
  if (i < 0) return false;
  const [it] = doc.items.splice(i, 1);
  doc.items.splice(Math.max(0, Math.min(doc.items.length, to)), 0, it);
  return true;
}

/**
 * Ganti isi lapisan (klik tile pustaka). Pengubah baru ikut slot bawaannya, seperti IC.
 * @param {any} it
 * @param {"main" | "mod"} layer
 * @param {string} key
 * @param {import("./document.js").Library} lib
 */
export function replaceLayer(it, layer, key, lib) {
  if (lib.LIB_RE.test(key)) lib.ensure(key, layer);
  if (layer === "main") {
    it.main = key;
    it.parts = null;
    it.vis.main = true;
    return it;
  }
  it.mod = key;
  const slot = (lib.MODS[key] && lib.MODS[key].slot) || "BL";
  it.slot = slot;
  it.nx = 0;
  it.ny = 0;
  [it.mx, it.my] = lib.SHIFT[slot] || [0, 0];
  it.vis.mod = true;
  return it;
}

/**
 * Lepas pengubah atau dekorasi dari ikon (objek utama tidak bisa dilepas).
 * @param {any} it
 * @param {"mod" | "deco"} layer
 */
export function clearLayer(it, layer) {
  if (layer === "mod") {
    it.mod = "none";
    it.mx = 0;
    it.my = 0;
  } else it.deco = { ...it.deco, type: "none" };
  return it;
}

/** Batas nilai gaya set (rentang slider IC 1.5.1). */
export const STYLE_RANGES = {
  sw: [1, 4, 0.25],
  gap: [0, 4, 0.25],
  "scale.main": [60, 100, 1],
  "scale.mod": [50, 150, 1],
  "scale.deco": [50, 200, 1],
};

/**
 * Ubah satu nilai gaya set. Nilai angka dibatasi rentang slider.
 * @param {any} style
 * @param {string} key sw, gap, cap, pref, fx, accent, family, scale.main, scale.mod, scale.deco
 * @param {any} value
 */
export function setStyleValue(style, key, value) {
  if (key === "family") return applyFamily(style, value === "accent" ? "accent" : "classic");
  if (key in STYLE_RANGES) {
    const [min, max] = /** @type {any} */ (STYLE_RANGES)[key];
    const v = Math.max(min, Math.min(max, Number(value)));
    if (!Number.isFinite(v)) return style;
    if (key.startsWith("scale.")) style.scale = { ...style.scale, [key.slice(6)]: v };
    else style[key] = v;
    return style;
  }
  if (key === "cap") {
    style.cap = value === "round" ? "round" : "butt";
    style.join = style.cap === "round" ? "round" : "miter";
  } else if (key === "pref" && ["A", "B", "C"].includes(value)) style.pref = value;
  else if (key === "fx" && ["none", "soft", "shadow"].includes(value)) style.fx = { ...style.fx, mode: value };
  else if (key === "accent" && /^#[0-9a-f]{6}$/i.test(value)) style.accent = String(value).toUpperCase();
  return style;
}

/**
 * Urutan tampilan halaman tanpa mengubah urutan set.
 * @param {any[]} items
 * @param {"set" | "name" | "flag"} sort
 * @param {(it: any) => string} label
 * @param {Set<string>} flagged id ikon yang punya flag
 */
export function sortedItems(items, sort, label, flagged) {
  if (sort === "name") return [...items].sort((a, b) => label(a).localeCompare(label(b), "id"));
  if (sort === "flag") return [...items].sort((a, b) => Number(flagged.has(b.id)) - Number(flagged.has(a.id)));
  return items;
}

/**
 * Kelompok rakitan dobel: signature sama lebih dari satu ikon.
 * @param {any[]} items
 * @param {(it: any) => string} signature
 * @returns {any[][]}
 */
export function duplicateGroups(items, signature) {
  const by = new Map();
  for (const it of items) {
    const key = signature(it);
    by.set(key, [...(by.get(key) || []), it]);
  }
  return [...by.values()].filter((group) => group.length > 1);
}
