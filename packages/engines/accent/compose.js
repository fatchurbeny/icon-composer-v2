// @ts-check
/**
 * @module engines/accent/compose
 * Render accent murni: tanpa DOM, tanpa localStorage, tanpa Math.random().
 * Bentuk pengubah dan bagian objek utama (hasil pengukuran DOM) datang dari
 * aplikasi lewat `ctx`, begitu juga aturan peran bagian (`rolesOf`).
 */
import { r3 } from "@icon-studio/core";
import { geomClassic, lineOfClassic, fillOfClassic } from "../classic/compose.js";

/**
 * @typedef {object} AccentCtx
 * @property {any} style                       gaya aktif (sw, gap, cap, join, accent, scale, ...)
 * @property {Record<string, any>} MODS        pengubah terukur (w, h)
 * @property {Record<string, any>} DECOS       dekorasi bawaan (d, star)
 * @property {() => string} nextId             id mask otomatis bila opt.idp kosong
 * @property {(key:string) => any} shapeOf     bentuk pengubah: {U, body, det, badge}
 * @property {(key:string) => any} infoOf      bagian objek utama: {U, parts}
 * @property {(it:any, info:any) => string[]} rolesOf  peran tiap bagian
 * @property {(it:any) => string} decoMarkup   dekorasi klasik sebagai cadangan
 */

/** @param {any} it @param {any} g @param {string} mAcc @param {string} mode @param {string} id @param {AccentCtx} ctx */
export function modAccent(it, g, mAcc, mode, id, ctx) {
  const S = ctx.style, sh = ctx.shapeOf(it.mod), U = sh.U, fill = it.mstyle === "fill";
  const small = Math.max(g.W, g.H) < 20, msw = S.sw * (small ? 0.75 : 1);
  const cx = g.L + g.W / 2, cy = g.T + g.H / 2, r = Math.min(g.W, g.H) / 2;
  const k = sh.badge ? ((fill ? 1.1 : 1.6) * r) / Math.max(U.w, U.h) : Math.min(g.W / U.w, g.H / U.h);
  const T = `${it.nr ? `rotate(${r3(it.nr)} ${r3(cx)} ${r3(cy)}) ` : ""}translate(${r3(cx - (U.x + U.w / 2) * k)} ${r3(cy - (U.y + U.h / 2) * k)}) scale(${r3(k)})`;
  const lw = r3(msw / k), kw = r3((msw + 2 * S.gap) / k);
  const paint = (/** @type {string} */ s, /** @type {string} */ c) => s.replace(/INK/g, c);
  const bodyS = sh.body.map((/** @type {any} */ b) => b.svg).join(""), detS = sh.det.map((/** @type {any} */ d) => d.svg).join("");
  const lineSil = `<g transform="${T}" fill="none" stroke="KO" stroke-width="${kw}"><g fill="KO">${bodyS}</g>${paint(detS, "KO")}</g>`;
  let defs = "", markup;
  if (!fill) {
    markup = `<g transform="${T}" fill="none" stroke="${mAcc}" stroke-width="${lw}">${paint(bodyS + detS, mAcc)}</g>`;
    return { markup, sil: lineSil, defs };
  }
  if (sh.badge) {
    const knock = (/** @type {string} */ c) => `<g transform="${T}" fill="none" stroke="${c}" stroke-width="${lw}">${paint(detS, c)}</g>`;
    const circ = `<circle cx="${r3(cx)}" cy="${r3(cy)}" r="${r3(r)}" fill="${mAcc}" stroke="none"/>`;
    if (mode === "mask") {
      defs = `<mask id="${id}f" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/>${knock("#000")}</mask>`;
      markup = `<g mask="url(#${id}f)">${circ}</g>`;
    } else markup = circ + knock("#FFFFFF");
    return { markup, sil: `<circle cx="${r3(cx)}" cy="${r3(cy)}" r="${r3(r + S.gap)}" fill="KO" stroke="none"/>`, defs };
  }
  const inS = sh.det.filter((/** @type {any} */ d) => d.inBody).map((/** @type {any} */ d) => d.svg).join("");
  const outS = sh.det.filter((/** @type {any} */ d) => !d.inBody).map((/** @type {any} */ d) => d.svg).join("");
  const solid = `<g transform="${T}" fill="${mAcc}" stroke="${mAcc}" stroke-width="${lw}">${paint(bodyS, mAcc)}</g>` + (outS ? `<g transform="${T}" fill="none" stroke="${mAcc}" stroke-width="${lw}">${paint(outS, mAcc)}</g>` : "");
  const knock = (/** @type {string} */ c) => (inS ? `<g transform="${T}" fill="none" stroke="${c}" stroke-width="${lw}">${paint(inS, c)}</g>` : "");
  if (inS && mode === "mask") {
    defs = `<mask id="${id}f" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/>${knock("#000")}</mask>`;
    markup = `<g mask="url(#${id}f)">${solid}</g>`;
  } else markup = solid + knock("#FFFFFF");
  return { markup, sil: lineSil, defs };
}

/** @param {any} it @param {string} ink @param {string} acc @param {AccentCtx} ctx */
export function decoAccent(it, ink, acc, ctx) {
  const d = it.deco;
  if (!it.vis.deco || d.type === "none") return { markup: "", sil: "" };
  const S = ctx.style, s = S.scale.deco / 100, gp = S.gap;
  const T = `translate(${r3(d.x)} ${r3(d.y)}) rotate(${d.r}) scale(${r3(s)})`;
  const D = ctx.DECOS[d.type];
  if (!D) return { markup: ctx.decoMarkup(it), sil: "" };
  if (D.star) return { markup: `<g transform="${T}"><path d="${D.d}" fill="${acc}" stroke="none"/></g>`, sil: `<g transform="${T}"><path d="${D.d}" fill="KO" stroke="KO" stroke-width="${r3((2 * gp) / s)}" stroke-linejoin="round"/></g>` };
  if (d.type === "spark") {
    const dots = [[0, -3, 0.9], [-2.6, 1.6, 0.9], [2.6, 1.6, 0.7]];
    return {
      markup: `<g transform="${T}" fill="${ink}" stroke="none">${dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 1.2}"/>`).join("")}</g>`,
      sil: `<g transform="${T}" fill="KO" stroke="none">${dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r3(r * 1.2 + gp / s)}"/>`).join("")}</g>`,
    };
  }
  const w = S.sw * 0.75;
  return {
    markup: `<g transform="${T}" fill="none" stroke="${ink}" stroke-width="${r3(w / s)}"><path d="${D.d}"/></g>`,
    sil: `<g transform="${T}" fill="none" stroke="KO" stroke-width="${r3((w + 2 * gp) / s)}"><path d="${D.d}"/></g>`,
  };
}

/**
 * @param {any} it
 * @param {AccentCtx} ctx
 * @param {{size?:number, mode?:"mask"|"white", idp?:string}} [opt]
 * @returns {string}
 */
export function composeAccent(it, ctx, opt) {
  opt = opt || {};
  const S = ctx.style, g = geomClassic(it, ctx), sz = opt.size || 48, mode = opt.mode || "mask";
  const id = opt.idp || ctx.nextId();
  const ink = lineOfClassic(it, ctx, "main"), acc = fillOfClassic(it, ctx, "main"), mAcc = fillOfClassic(it, ctx, "mod");
  const dInk = lineOfClassic(it, ctx, "deco"), dAcc = fillOfClassic(it, ctx, "deco");
  const W = S.sw / g.ms;
  let defs = "", out = "";
  const ko = (/** @type {string} */ s, /** @type {string} */ c) => s.replace(/KO/g, c);
  const info = it.vis.main ? ctx.infoOf(it.main) : null;
  const md = g.md ? modAccent(it, g, mAcc, mode, id, ctx) : null;
  const dc = decoAccent(it, dInk, dAcc, ctx);
  if (md) defs += md.defs;
  const wrap = (/** @type {string} */ body, /** @type {(string|null|undefined|false)[]} */ sils, /** @type {string} */ sfx) => {
    const s = sils.filter(Boolean).join("");
    if (!s || mode !== "mask") return body;
    defs += `<mask id="${id}${sfx}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/>${ko(s, "#000")}</mask>`;
    return `<g mask="url(#${id}${sfx})">${body}</g>`;
  };
  const white = (/** @type {string} */ s) => (mode === "mask" || !s ? "" : ko(s, "#FFFFFF"));
  if (info) {
    const R = ctx.rolesOf(it, info);
    const colR = (/** @type {string} */ r) => (r === "acc" || r === "fillA" ? acc : ink);
    const sc = (/** @type {any} */ p) => (p.k === 1 ? "" : ` transform="scale(${p.k})"`);
    const mainS = info.parts.map((/** @type {any} */ p, /** @type {number} */ i) => {
      const r = R[i], c = colR(r), f = (r === "fill" || r === "fillA") && p.closed ? c : "none";
      return `<g${sc(p)} fill="${f}" stroke="${c}" stroke-width="${r3(W / p.k)}">${p.svg.replace(/INK/g, c)}</g>`;
    }).join("");
    const mainSil = info.parts.map((/** @type {any} */ p, /** @type {number} */ i) => {
      const r = R[i], f = (r === "fill" || r === "fillA") && p.closed ? "KO" : "none";
      return `<g${sc(p)} fill="${f}" stroke="KO" stroke-width="${r3((S.sw + 2 * S.gap) / g.ms / p.k)}">${p.svg.replace(/INK/g, "KO")}</g>`;
    }).join("");
    const bodies = info.parts.filter((/** @type {any} */ p) => p.body);
    if (it.under && it.under !== "none" && bodies.length) {
      let u = bodies.map((/** @type {any} */ p) => `<g${sc(p)} fill="${acc}" stroke="${acc}" stroke-width="${r3(W / p.k)}">${p.svg.replace(/INK/g, acc)}</g>`).join("");
      if (it.under === "offset") {
        const o = r3((0.75 * S.sw + S.gap) / g.ms);
        u = `<g transform="translate(${o} ${o})">${u}</g>`;
      }
      if (it.under === "half") {
        const U = info.U;
        defs += `<clipPath id="${id}h"><rect x="${r3(U.x - 6)}" y="${r3(U.y + U.h / 2)}" width="${r3(U.w + 12)}" height="${r3(U.h / 2 + 6)}"/></clipPath>`;
        u = `<g clip-path="url(#${id}h)">${u}</g>`;
      }
      out += wrap(`<g transform="${g.mainT}">${u}</g>`, [`<g transform="${g.mainT}">${mainSil}</g>`, dc.sil, md && md.sil], "u");
      out += white(`<g transform="${g.mainT}">${mainSil}</g>`);
    }
    out += wrap(`<g transform="${g.mainT}">${mainS}</g>`, [dc.sil, md && md.sil], "m");
  }
  if (dc.markup) {
    out += white(dc.sil);
    out += wrap(dc.markup, [md && md.sil], "d");
  }
  if (md) {
    out += white(md.sil);
    out += md.markup;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${sz}" height="${sz}" fill="none" stroke-width="${S.sw}" stroke-linecap="${S.cap}" stroke-linejoin="${S.join}">${defs ? `<defs>${defs}</defs>` : ""}${out}</svg>`;
}

/** @param {string} key @param {string} mstyle @param {AccentCtx} ctx */
export function modPreviewAccent(key, mstyle, ctx) {
  const S = ctx.style, md = ctx.MODS[key];
  const sc = Math.min(26 / md.w, 26 / md.h), W = md.w * sc, H = md.h * sc;
  const r = modAccent({ mod: key, mstyle: mstyle || "line" }, { L: 24 - W / 2, T: 24 - H / 2, W, H }, S.accent, "mask", "mp" + key.replace(/\W/g, ""), ctx);
  return `<svg viewBox="0 0 48 48" fill="none" stroke-linecap="${S.cap}" stroke-linejoin="${S.join}">${r.defs ? `<defs>${r.defs}</defs>` : ""}${r.markup}</svg>`;
}
