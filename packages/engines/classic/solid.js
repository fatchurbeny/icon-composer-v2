// @ts-check
/**
 * @module engines/classic/solid
 * Classic composition engine 1.4.5 (varian Template Icon Builder 1.6.0), dipindah apa adanya:
 * - Solid · garis memakai kotak pengubah adaptif supaya pengubah garis yang besar tidak menutupi badan utama.
 * - Celah knockout hanya dikurangi pada mode itu; tebal garis tetap.
 * - Garis struktural di luar bagian dalam badan solid mengikuti warna badan; detail di dalam tetap tinta.
 * - Diagnostik dipakai UI Builder dan profil pengajuan saat ekspor.
 * Aktif bila `ctx.solidV145` true. Icon Composer belum memakainya.
 */
import { r3 } from "@icon-studio/core";
import { inBB, intersectionRatio, touchBB } from "../shared/shapes.js";

export const CLASSIC_ENGINE_VERSION = "1.4.5";

/**
 * Kotak pengubah yang ditambatkan ke slot, dengan skala `sc`.
 * @param {any} it
 * @param {{w:number, h:number}} md
 * @param {number} sc
 */
export function anchoredModifierGeometry(it, md, sc) {
  const W = md.w * sc,
    H = md.h * sc,
    row = it.slot[0],
    col = it.slot[1];
  let L = col === "L" ? 2 : col === "R" ? 46 - W : 24 - W / 2;
  let T = row === "T" ? 2 : row === "B" ? 46 - H : 24 - H / 2;
  L += it.nx;
  T += it.ny;
  return {
    sc,
    W,
    H,
    L,
    T,
    /* rotasi per ikon (`nr`) di pusat kotak pengubah; tanpa rotasi string sama dengan mesin 1.4.5 */
    modT: `${it.nr ? `rotate(${r3(it.nr)} ${r3(L + W / 2)} ${r3(T + H / 2)}) ` : ""}translate(${r3(L)} ${r3(T)}) scale(${r3(sc)})`,
  };
}

/**
 * @typedef {object} SolidCtx
 * @property {any} style
 * @property {Record<string, any>} MAINS
 * @property {(key: string) => any} infoOf  analisis objek utama (mainInfo di app)
 */

/**
 * @param {any} it
 * @param {any} g hasil geomClassic
 * @param {{main: string, mod: string}} P
 * @param {SolidCtx} ctx
 */
export function solidLineFit(it, g, P, ctx) {
  const style = ctx.style;
  if (!g.md || P.main !== "solid" || P.mod !== "outline")
    return { g, adjusted: false, overlap: 0, gap: style.gap };
  const maxSide = 18;
  const factor = Math.min(1, maxSide / Math.max(g.W, g.H));
  const fitted =
    factor < 0.999
      ? { ...g, ...anchoredModifierGeometry(it, g.md, g.sc * factor) }
      : g;
  const info = ctx.infoOf(it.main),
    U = info && info.U;
  const body = U
    ? {
        x: 24 + it.mx + fitted.ms * (U.x - 24),
        y: 24 + it.my + fitted.ms * (U.y - 24),
        w: fitted.ms * U.w,
        h: fitted.ms * U.h,
      }
    : null;
  const overlap = intersectionRatio(
    { x: fitted.L, y: fitted.T, w: fitted.W, h: fitted.H },
    body,
  );
  const gap = r3(
    style.gap * (overlap > 0.35 ? 0.55 : overlap > 0.2 ? 0.7 : 0.85),
  );
  return {
    g: fitted,
    adjusted: factor < 0.999 || gap !== style.gap,
    overlap: r3(overlap),
    gap,
    factor: r3(factor),
  };
}

/**
 * @param {any} it
 * @param {SolidCtx} ctx
 */
export function solidLineDiagnostic(it, ctx) {
  const M = ctx.MAINS[it.main],
    info = M && ctx.infoOf(it.main);
  if (!M || !info) return null;
  const openDetails = info.parts.filter(
    (/** @type {any} */ p) => !p.body && !p.closed,
  ).length;
  return {
    engine: CLASSIC_ENGINE_VERSION,
    complex: openDetails > 2,
    message:
      openDetails > 2
        ? "Solid·garis: detail kompleks, periksa hasil direct-fill"
        : "",
  };
}

/**
 * @param {any} it
 * @param {any} S gaya aktif
 * @param {any} g
 * @param {string} ink
 * @param {string} accent
 * @param {SolidCtx} ctx
 */
export function solidMainDetails(it, S, g, ink, accent, ctx) {
  const info = ctx.infoOf(it.main);
  if (!info || !info.U)
    return ((info && info.M && info.M.s) || "")
      .replace(/INK/g, ink)
      .replace(/LUSW/g, String(r3(S.sw / g.ms / 2)));
  return info.parts
    .filter((/** @type {any} */ p) => !p.body)
    .map((/** @type {any} */ p) => {
      const interior = inBB(p.bb, info.U, 0.8) && !touchBB(p.bb, info.U, 1.2);
      const color = interior ? ink : accent,
        k = p.k || 1;
      const svg = p.svg
        .replace(/INK/g, color)
        .replace(/LUSW/g, String(r3(S.sw / g.ms / k)));
      return `<g transform="scale(${r3(k)})" fill="none" stroke="${color}" stroke-width="${r3(S.sw / (g.ms * k))}">${svg}</g>`;
    })
    .join("");
}
