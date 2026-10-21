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
 * Ukuran kotak sejajar sumbu dari kotak W×H yang diputar `deg` derajat di pusatnya.
 * @param {number} W
 * @param {number} H
 * @param {number} deg
 * @returns {{w: number, h: number}}
 */
export function rotatedBoxSize(W, H, deg) {
  const a = (deg * Math.PI) / 180,
    c = Math.abs(Math.cos(a)),
    s = Math.abs(Math.sin(a));
  return { w: W * c + H * s, h: W * s + H * c };
}

/**
 * Kotak pengubah yang ditambatkan ke slot, dengan skala `sc`.
 * Bawaan (Composer, IC 1.5.1): kotak yang belum diputar ditambatkan ke tepi slot, lalu diputar `nr` di pusatnya.
 * `opts.rotated` (aturan Solid·garis 1.4.5 di Builder): kotak setelah rotasi yang ditambatkan ke tepi slot,
 * sehingga pengubah yang diputar tetap di dalam slot. Tanpa `nr` kedua cara memberi hasil yang sama.
 * @param {any} it
 * @param {{w:number, h:number}} md
 * @param {number} sc
 * @param {{rotated?: boolean}} [opts]
 */
export function anchoredModifierGeometry(it, md, sc, opts = {}) {
  const W = md.w * sc,
    H = md.h * sc,
    row = it.slot[0],
    col = it.slot[1];
  let L, T;
  if (opts.rotated && it.nr) {
    /* pusat kotak terputar ditempatkan sehingga tepinya menempel di tepi slot (2..46) */
    const R = rotatedBoxSize(W, H, it.nr);
    L = (col === "L" ? 2 + R.w / 2 : col === "R" ? 46 - R.w / 2 : 24) - W / 2;
    T = (row === "T" ? 2 + R.h / 2 : row === "B" ? 46 - R.h / 2 : 24) - H / 2;
  } else {
    L = col === "L" ? 2 : col === "R" ? 46 - W : 24 - W / 2;
    T = row === "T" ? 2 : row === "B" ? 46 - H : 24 - H / 2;
  }
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
 * Kotak sejajar sumbu pengubah setelah rotasi `nr` (sama dengan kotaknya bila tanpa rotasi).
 * @param {any} it
 * @param {{L:number, T:number, W:number, H:number}} g
 * @returns {{x:number, y:number, w:number, h:number}}
 */
export function modifierBox(it, g) {
  if (!it.nr) return { x: g.L, y: g.T, w: g.W, h: g.H };
  const R = rotatedBoxSize(g.W, g.H, it.nr);
  return { x: g.L + g.W / 2 - R.w / 2, y: g.T + g.H / 2 - R.h / 2, w: R.w, h: R.h };
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
  /* pengubah yang diputar (`nr`) dipas dengan kotak setelah rotasi dan ditambatkan ulang ke slot */
  const box = it.nr ? rotatedBoxSize(g.W, g.H, it.nr) : { w: g.W, h: g.H };
  const factor = Math.min(1, maxSide / Math.max(box.w, box.h));
  const fitted =
    factor < 0.999 || it.nr
      ? { ...g, ...anchoredModifierGeometry(it, g.md, factor < 0.999 ? g.sc * factor : g.sc, { rotated: true }) }
      : g;
  const info = ctx.infoOf(it.main),
    U = info && info.U;
  const body = U ? bodyBox(it, U, fitted.ms) : null;
  const overlap = intersectionRatio(modifierBox(it, fitted), body);
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
 * Kotak sejajar sumbu badan objek utama di kanvas 48, setelah geser, skala, dan rotasi `mr`
 * (mainT: rotasi di pusat objek). Tanpa `mr` rumusnya sama dengan mesin 1.4.5.
 * @param {any} it
 * @param {{x:number, y:number, w:number, h:number}} U badan dalam satuan sumber 48
 * @param {number} ms skala objek utama
 */
export function bodyBox(it, U, ms) {
  if (!it.mr)
    return {
      x: 24 + it.mx + ms * (U.x - 24),
      y: 24 + it.my + ms * (U.y - 24),
      w: ms * U.w,
      h: ms * U.h,
    };
  const a = (it.mr * Math.PI) / 180,
    dx = U.x + U.w / 2 - 24,
    dy = U.y + U.h / 2 - 24;
  const cx = 24 + it.mx + ms * (dx * Math.cos(a) - dy * Math.sin(a)),
    cy = 24 + it.my + ms * (dx * Math.sin(a) + dy * Math.cos(a));
  const R = rotatedBoxSize(ms * U.w, ms * U.h, it.mr);
  return { x: cx - R.w / 2, y: cy - R.h / 2, w: R.w, h: R.h };
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
