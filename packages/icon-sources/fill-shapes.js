// @ts-check
/**
 * @module icon-sources/fill-shapes
 * Bentuk isi (lapisan warna) mesin sticker, dibangun `scripts/build-icon-data.mjs` dari versi pustaka
 * terkunci (docs/engines/sticker.md). Modul terpisah supaya data ±0,6 MB hanya dimuat oleh yang memakainya.
 */
import FILL_SHAPES from "./data/fill-shapes.json";

/** Versi pustaka sumber data, sama dengan sources.json. */
export const FILL_SHAPE_VERSIONS = FILL_SHAPES.versions;

/**
 * Markup bentuk isi untuk kunci ikon (`lu:` atau `tb:`), tanpa prefiks `~`. Ikon tanpa bentuk isi
 * (termasuk Hugeicons, Kustom, dan objek bawaan) menghasilkan string kosong; mesin lalu memakai `plate`.
 * @param {string} key
 * @returns {string}
 */
export function fillShapeOf(key) {
  const m = /^(lu|tb):(.+)$/.exec(String(key || ""));
  if (!m) return "";
  const table = /** @type {Record<string, string>} */ (
    /** @type {any} */ (FILL_SHAPES)[m[1]]
  );
  const v = (table && Object.prototype.hasOwnProperty.call(table, m[2]) && table[m[2]]) || "";
  return v[0] === "~" ? v.slice(1) : v;
}
