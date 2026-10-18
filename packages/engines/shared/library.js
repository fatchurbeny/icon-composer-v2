// @ts-check
/**
 * @module engines/shared/library
 * Mengubah ikon pustaka (lu/tb/hg/cu) menjadi entri objek utama atau pengubah di
 * registry `MAINS`/`MODS` milik app. Logika dipindah apa adanya dari Icon Composer 1.5.1
 * dan Template Icon Builder 1.6.0 (`luAnalyze`, `ensureLucide`), yang keduanya identik.
 */
import { partStr, r3 } from "@icon-studio/core";
import { luLabel } from "@icon-studio/icon-sources";
import { analyzeLibraryIcon } from "./shapes.js";

/**
 * @param {{
 *   MAINS: Record<string, any>,
 *   MODS: Record<string, any>,
 *   SOURCES: Record<string, {index: () => Map<string, any> | null}>,
 *   LIB_RE: RegExp,
 * }} options
 */
export function createLibraryShapes({ MAINS, MODS, SOURCES, LIB_RE }) {
  const cache = new Map();

  /**
   * Analisis bagian ikon pustaka, disimpan di cache per kunci.
   * @param {string} key
   */
  function analyze(key) {
    if (!LIB_RE.test(key)) key = "lu:" + key;
    if (cache.has(key)) return cache.get(key);
    const src = key.slice(0, 2),
      idx = SOURCES[src].index(),
      raw = idx && idx.get(key.slice(3));
    if (!raw) return null;
    const res = analyzeLibraryIcon(raw, src, key);
    cache.set(key, res);
    return res;
  }

  /**
   * Memastikan ikon pustaka terdaftar di `MAINS` atau `MODS`. Kalau pustaka belum
   * termuat, dipasang placeholder garis putus-putus dengan `missing: true`.
   * @param {string} key
   * @param {"main" | "mod"} kind
   */
  function ensure(key, kind) {
    const reg = kind === "main" ? MAINS : MODS;
    if (reg[key]) return true;
    const name = key.slice(3),
      A = analyze(key);
    if (!A) {
      if (kind === "main")
        MAINS[key] = {
          n: luLabel(name),
          lu: true,
          missing: true,
          b: "",
          s: `<circle cx="24" cy="24" r="16" stroke-dasharray="3 3"/>`,
        };
      else
        MODS[key] = {
          n: luLabel(name),
          lu: true,
          missing: true,
          w: 16,
          h: 16,
          slot: "BL",
          sil: `<circle cx="8" cy="8" r="8"/>`,
          det: "",
        };
      return false;
    }
    const { parts, U, body } = A;
    /** @param {any} p */
    const asDet = (p) =>
      p.dot
        ? partStr(p, ` stroke-linecap="round"`)
        : p.fill && !body.includes(p) && Math.max(p.bb.w, p.bb.h) < 3.2
          ? partStr(p, ` fill="INK" stroke="none"`)
          : partStr(p);
    /** @param {string} t */
    const cc = (t) => t.replace(/currentColor/g, "INK");
    if (kind === "main") {
      /** @param {string[]} list */
      const wrap = (list) =>
        list.length
          ? `<g transform="scale(2)" stroke-width="LUSW">${list.join("")}</g>`
          : "";
      MAINS[key] = {
        n: luLabel(name),
        lu: true,
        plate: !body.length,
        b: wrap(body.map((/** @type {any} */ p) => partStr(p))),
        s: cc(
          wrap(
            parts
              .filter((/** @type {any} */ p) => !body.includes(p))
              .map(asDet),
          ),
        ),
      };
      return true;
    }
    if (body.length) {
      const k = r3(22 / Math.max(U.w, U.h)),
        T = `scale(${k}) translate(${r3(-U.x)} ${r3(-U.y)})`;
      const det = parts
        .filter((/** @type {any} */ p) => !body.includes(p))
        .map(asDet)
        .join("");
      MODS[key] = {
        n: luLabel(name),
        lu: true,
        w: r3(U.w * k),
        h: r3(U.h * k),
        slot: "BL",
        ks: k,
        kd: k,
        sil: `<g transform="${T}">${body.map((/** @type {any} */ p) => partStr(p)).join("")}</g>`,
        det: det ? cc(`<g transform="${T}">${det}</g>`) : "",
      };
    } else {
      const kd = r3(12 / Math.max(U.w, U.h)),
        ox = r3(9 - (U.x + U.w / 2) * kd),
        oy = r3(9 - (U.y + U.h / 2) * kd);
      MODS[key] = {
        n: luLabel(name),
        lu: true,
        badge: true,
        w: 18,
        h: 18,
        slot: "BL",
        ks: 1,
        kd,
        sil: `<circle cx="9" cy="9" r="9"/>`,
        det: cc(
          `<g transform="translate(${ox} ${oy}) scale(${kd})">${parts.map((/** @type {any} */ p) => (p.dot ? partStr(p, ` stroke-linecap="round"`) : partStr(p))).join("")}</g>`,
        ),
      };
    }
    return true;
  }

  return { analyze, ensure, cache };
}
