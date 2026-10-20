// @ts-check
/**
 * @module engines/classic/compose
 * Render classic murni: tanpa DOM, tanpa localStorage, tanpa Math.random().
 * Data pustaka yang sudah diukur (MAINS, MODS, DECOS, customs) dan gaya
 * diberikan lewat `ctx`. Pengukuran (getBBox) tetap di aplikasi.
 */
import { r3 } from "@icon-studio/core";
import { anchoredModifierGeometry, solidLineFit, solidMainDetails } from "./solid.js";

/**
 * @typedef {object} ClassicCtx
 * @property {any} style                       gaya aktif (sw, cap, join, gap, ink, colors, scale, fx, pref)
 * @property {Record<string, any>} MAINS       objek utama terukur: {b, s}
 * @property {Record<string, any>} MODS        pengubah terukur: {w, h, sil, det, ks, kd, badge}
 * @property {Record<string, any>} PREFS       preferensi mode A/B/C
 * @property {Record<string, any>} DECOS       dekorasi bawaan
 * @property {Array<any>} customs              dekorasi unggahan: {id, vb, inner, mono}
 * @property {() => string} nextId             id mask otomatis bila opt.idp kosong
 * @property {boolean} decoStarFill            true: bintang dekorasi dirender terisi (IC)
 * @property {boolean} [solidV145]               true: aturan Solid·garis mesin 1.4.5 (TIB), lihat ./solid.js
 * @property {(key:string) => any} [infoOf]     analisis objek utama, wajib bila solidV145 true
 */

/** @param {any} it @param {ClassicCtx} ctx */
export function modeOfClassic(it, ctx) {
  const { PREFS, style } = ctx;
  return it.pref && it.pref !== "set" && PREFS[it.pref] ? it.pref : PREFS[style.pref] ? style.pref : "A";
}

/** @param {any} it @param {ClassicCtx} ctx */
export function geomClassic(it, ctx) {
  const { style, MODS } = ctx;
  const md = it.mod !== "none" && it.vis.mod ? MODS[it.mod] : null;
  const ms = style.scale.main / 100;
  /* rotasi per ikon (`mr`) di pusat objek; tanpa rotasi string transform sama dengan IC 1.5.1 */
  const rot = it.mr ? ` rotate(${r3(it.mr)})` : "";
  const mainT = `translate(${r3(24 + it.mx)} ${r3(24 + it.my)})${rot} scale(${r3(ms)}) translate(-24 -24)`;
  const g = { md, ms, mainT };
  if (it.mod !== "none" && MODS[it.mod]) {
    Object.assign(g, anchoredModifierGeometry(it, MODS[it.mod], style.scale.mod / 100));
  }
  return g;
}

/** @param {any} it @param {ClassicCtx} ctx */
export const lineOfClassic = (it, ctx, l) => ctx.style.colors[l].line || ctx.style.ink;
/** @param {any} it @param {ClassicCtx} ctx */
export const fillOfClassic = (it, ctx, l) => ctx.style.colors[l].fill || ctx.style.accent;

/**
 * @param {any} it
 * @param {ClassicCtx} ctx
 * @param {{size?:number, mode?:"mask"|"white", idp?:string}} [opt]
 * @returns {string}
 */
export function composeClassic(it, ctx, opt = {}) {
  const S = ctx.style, base = geomClassic(it, ctx), P = ctx.PREFS[modeOfClassic(it, ctx)] || ctx.PREFS.A;
  const fit = ctx.solidV145 ? solidLineFit(it, base, P, /** @type {any} */ (ctx)) : { g: base, gap: S.gap };
  const g = fit.g;
  const sz = opt.size || 48, mode = opt.mode || "mask";
  const id = opt.idp || ctx.nextId();
  const mInk = lineOfClassic(it, ctx, "main"), mAcc = fillOfClassic(it, ctx, "main"), dInk = lineOfClassic(it, ctx, "mod"), dAcc = fillOfClassic(it, ctx, "mod");
  const modOutline = P.mod === "outline";
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${sz}" height="${sz}" fill="none" stroke-width="${S.sw}" stroke-linecap="${S.cap}" stroke-linejoin="${S.join}">`;
  let gapW = 0;
  if (g.md) {
    gapW = r3((2 * fit.gap + (modOutline ? S.sw : 0)) / (g.sc * (g.md.ks || 1)));
    if (mode === "mask") out += `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/><g transform="${g.modT}" fill="#000" stroke="#000" stroke-width="${gapW}" stroke-linejoin="round">${g.md.sil}</g></mask></defs>`;
  }
  if (it.vis.main) {
    const M = ctx.MAINS[it.main];
    const fix = (/** @type {string} */ t) => (t || "").replace(/INK/g, mInk).replace(/LUSW/g, r3(S.sw / g.ms / 2));
    let body;
    if (P.main === "solid") body = M.b ? `<g fill="${mAcc}" stroke="none">${fix(M.b)}</g>` : `<circle cx="24" cy="24" r="19" fill="${mAcc}" stroke="none"/>`;
    else body = fix(M.b);
    let fxL = "";
    const fx = S.fx || { mode: "none" };
    if (P.main !== "solid" && fx.mode === "soft") fxL = M.b ? `<g fill="${fx.color}" stroke="none">${fix(M.b)}</g>` : `<circle cx="24" cy="24" r="19" fill="${fx.color}" stroke="none"/>`;
    if (P.main !== "solid" && fx.mode === "shadow" && M.b) fxL = `<g transform="translate(${r3(fx.dx / g.ms)} ${r3(fx.dy / g.ms)})" fill="${fx.color}" stroke="${fx.color}">${fix(M.b)}</g>`;
    const details = P.main === "solid" && ctx.solidV145 ? solidMainDetails(it, S, g, mInk, mAcc, /** @type {any} */ (ctx)) : fix(M.s);
    const inner = `<g transform="${g.mainT}" stroke="${mInk}" stroke-width="${r3(S.sw / g.ms)}">${fxL}${body}${details}</g>`;
    out += g.md && mode === "mask" ? `<g mask="url(#${id})">${inner}</g>` : inner;
  }
  out += decoMarkupClassic(it, ctx);
  if (g.md) {
    out += `<g transform="${g.modT}" stroke="${dInk}">`;
    if (mode === "white" && (fit.gap > 0 || modOutline)) out += `<g fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${gapW}" stroke-linejoin="round">${g.md.sil}</g>`;
    out += modOutline ? `<g fill="none" stroke="${dInk}" stroke-width="${r3(S.sw / (g.sc * (g.md.ks || 1)))}">${g.md.sil}</g>` : `<g fill="${dAcc}" stroke="none">${g.md.sil}</g>`;
    if (g.md.det) out += `<g stroke-width="${r3((S.sw * (g.md.badge ? 0.75 : 1)) / (g.sc * (g.md.kd || 1)))}">${g.md.det.replace(/INK/g, dInk)}</g>`;
    out += `</g>`;
  }
  return out + `</svg>`;
}

/** @param {any} it @param {ClassicCtx} ctx */
export function decoMarkupClassic(it, ctx) {
  const d = it.deco;
  if (!it.vis.deco || d.type === "none") return "";
  const { style, DECOS, customs } = ctx;
  const s = style.scale.deco / 100, ink = lineOfClassic(it, ctx, "deco"), acc = fillOfClassic(it, ctx, "deco");
  const T = `translate(${r3(d.x)} ${r3(d.y)}) rotate(${d.r}) scale(${r3(s)})`;
  if (DECOS[d.type]) {
    if (ctx.decoStarFill && DECOS[d.type].star) return `<g transform="${T}"><path d="${DECOS[d.type].d}" fill="${acc}" stroke="none"/></g>`;
    if (d.type === "spark") return `<g transform="${T}" fill="${ink}" stroke="none"><circle cx="0" cy="-3" r="0.9"/><circle cx="-2.6" cy="1.6" r="0.9"/><circle cx="2.6" cy="1.6" r="0.7"/></g>`;
    return `<g transform="${T}" fill="none" stroke="${ink}" stroke-width="${r3((style.sw * 0.9) / s)}"><path d="${DECOS[d.type].d}"/></g>`;
  }
  const c = customs.find((x) => "c:" + x.id === d.type);
  if (!c) return "";
  const [vx, vy, vw, vh] = c.vb, k = 10 / Math.max(vw, vh);
  const T2 = `${T} scale(${r3(k)}) translate(${r3(-vx - vw / 2)} ${r3(-vy - vh / 2)})`;
  if (d.color === "orig") return `<g transform="${T2}">${c.inner}</g>`;
  const col = d.color === "accent" ? acc : ink;
  return `<g transform="${T2}" fill="${col}" stroke="${col}" color="${col}">${c.mono}</g>`;
}
