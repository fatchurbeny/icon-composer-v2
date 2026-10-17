/* Classic composition engine 1.4.3
 * Change log:
 * - Solid · garis uses an adaptive modifier box so large outline modifiers do not dominate the main body.
 * - The knockout gap is reduced only for that mode, preserving the configured stroke thickness.
 * - Structural lines outside the solid body's interior inherit the body color; interior details stay ink.
 * - Exposes a diagnostic used by the Builder UI and exported submission profile.
 */
const CLASSIC_ENGINE_VERSION = "1.4.3";

function lineOf(it, l){ return style.colors[l].line || style.ink; }
function fillOf(it, l){ return style.colors[l].fill || style.accent; }
let kid = 0;

function anchoredModifierGeometry(it, md, sc){
  const W = md.w*sc, H = md.h*sc, row = it.slot[0], col = it.slot[1];
  let L = col === "L" ? 2 : col === "R" ? 46 - W : 24 - W/2;
  let T = row === "T" ? 2 : row === "B" ? 46 - H : 24 - H/2;
  L += it.nx; T += it.ny;
  return {sc, W, H, L, T, modT:`translate(${r3(L)} ${r3(T)}) scale(${r3(sc)})`};
}

function intersectionRatio(a, b){
  if (!a || !b) return 0;
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return a.w*a.h ? w*h/(a.w*a.h) : 0;
}

function solidLineFit(it, g, P){
  if (!g.md || P.main !== "solid" || P.mod !== "outline") return {g, adjusted:false, overlap:0, gap:style.gap};
  const maxSide = 18;
  const factor = Math.min(1, maxSide/Math.max(g.W, g.H));
  const fitted = factor < 0.999 ? {...g, ...anchoredModifierGeometry(it, g.md, g.sc*factor)} : g;
  const info = mainInfo(it.main), U = info && info.U;
  const body = U ? {x:24 + it.mx + fitted.ms*(U.x - 24), y:24 + it.my + fitted.ms*(U.y - 24), w:fitted.ms*U.w, h:fitted.ms*U.h} : null;
  const overlap = intersectionRatio({x:fitted.L, y:fitted.T, w:fitted.W, h:fitted.H}, body);
  const gap = r3(style.gap*(overlap > 0.35 ? 0.55 : overlap > 0.2 ? 0.7 : 0.85));
  return {g:fitted, adjusted:factor < 0.999 || gap !== style.gap, overlap:r3(overlap), gap, factor:r3(factor)};
}

function solidLineDiagnostic(it){
  const M = MAINS[it.main], info = M && mainInfo(it.main);
  if (!M || !info) return null;
  const openDetails = info.parts.filter(p => !p.body && !p.closed).length;
  return {
    engine:CLASSIC_ENGINE_VERSION,
    complex:openDetails > 2,
    message:openDetails > 2 ? "Solid·garis: detail garis kompleks, periksa hasil outline" : ""
  };
}

function solidMainDetails(it, S, g, ink, accent){
  const info = mainInfo(it.main);
  if (!info || !info.U) return (info && info.M && info.M.s || "").replace(/INK/g, ink).replace(/LUSW/g, r3(S.sw/g.ms/2));
  return info.parts.filter(p => !p.body).map(p => {
    const interior = inBB(p.bb, info.U, 0.8) && !touchBB(p.bb, info.U, 1.2);
    const color = interior ? ink : accent, k = p.k || 1;
    const svg = p.svg.replace(/INK/g, color).replace(/LUSW/g, r3(S.sw/g.ms/k));
    return `<g transform="scale(${r3(k)})" fill="none" stroke="${color}" stroke-width="${r3(S.sw/(g.ms*k))}">${svg}</g>`;
  }).join("");
}

function compose(it, opt){
  opt = opt || {};
  const S = style, baseGeometry = geom(it), P = PREFS[modeOf(it)] || PREFS.A;
  const fit = solidLineFit(it, baseGeometry, P), g = fit.g;
  const sz = opt.size || 48, mode = opt.mode || "mask";
  const id = opt.idp || ("k" + (++kid));
  const mInk = lineOf(it, "main"), mAcc = fillOf(it, "main"), dInk = lineOf(it, "mod"), dAcc = fillOf(it, "mod");
  const modOutline = P.mod === "outline";
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${sz}" height="${sz}" fill="none" stroke-width="${S.sw}" stroke-linecap="${S.cap}" stroke-linejoin="${S.join}">`;
  let gapW = 0;
  if (g.md){
    gapW = r3((2*fit.gap + (modOutline ? S.sw : 0))/(g.sc*(g.md.ks || 1)));
    if (mode === "mask") out += `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/><g transform="${g.modT}" fill="#000" stroke="#000" stroke-width="${gapW}" stroke-linejoin="round">${g.md.sil}</g></mask></defs>`;
  }
  if (it.vis.main){
    const M = MAINS[it.main];
    const fix = t => (t || "").replace(/INK/g, mInk).replace(/LUSW/g, r3(S.sw/g.ms/2));
    let body;
    if (P.main === "solid") body = M.b ? `<g fill="${mAcc}" stroke="none">${fix(M.b)}</g>` : `<circle cx="24" cy="24" r="19" fill="${mAcc}" stroke="none"/>`;
    else body = fix(M.b);
    let fxL = "";
    const fx = S.fx || {mode:"none"};
    if (P.main !== "solid" && fx.mode === "soft") fxL = M.b ? `<g fill="${fx.color}" stroke="none">${fix(M.b)}</g>` : `<circle cx="24" cy="24" r="19" fill="${fx.color}" stroke="none"/>`;
    if (P.main !== "solid" && fx.mode === "shadow" && M.b) fxL = `<g transform="translate(${r3(fx.dx/g.ms)} ${r3(fx.dy/g.ms)})" fill="${fx.color}" stroke="${fx.color}">${fix(M.b)}</g>`;
    const details = P.main === "solid" ? solidMainDetails(it, S, g, mInk, mAcc) : fix(M.s);
    const inner = `<g transform="${g.mainT}" stroke="${mInk}" stroke-width="${r3(S.sw/g.ms)}">${fxL}${body}${details}</g>`;
    out += (g.md && mode === "mask") ? `<g mask="url(#${id})">${inner}</g>` : inner;
  }
  out += decoMarkup(it);
  if (g.md){
    out += `<g transform="${g.modT}" stroke="${dInk}">`;
    if (mode === "white" && (fit.gap > 0 || modOutline)) out += `<g fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${gapW}" stroke-linejoin="round">${g.md.sil}</g>`;
    out += modOutline ? `<g fill="none" stroke="${dInk}" stroke-width="${r3(S.sw/(g.sc*(g.md.ks || 1)))}">${g.md.sil}</g>` : `<g fill="${dAcc}" stroke="none">${g.md.sil}</g>`;
    if (g.md.det) out += `<g stroke-width="${r3(S.sw*(g.md.badge ? 0.75 : 1)/(g.sc*(g.md.kd || 1)))}">${g.md.det.replace(/INK/g, dInk)}</g>`;
    out += `</g>`;
  }
  return out + `</svg>`;
}

function decoMarkup(it){
  const d = it.deco; if (!it.vis.deco || d.type === "none") return "";
  const s = style.scale.deco/100, ink = lineOf(it, "deco"), acc = fillOf(it, "deco");
  const T = `translate(${r3(d.x)} ${r3(d.y)}) rotate(${d.r}) scale(${r3(s)})`;
  if (DECOS[d.type]){
    if (d.type === "spark") return `<g transform="${T}" fill="${ink}" stroke="none"><circle cx="0" cy="-3" r="0.9"/><circle cx="-2.6" cy="1.6" r="0.9"/><circle cx="2.6" cy="1.6" r="0.7"/></g>`;
    return `<g transform="${T}" fill="none" stroke="${ink}" stroke-width="${r3(style.sw*0.9/s)}"><path d="${DECOS[d.type].d}"/></g>`;
  }
  const c = customs.find(x => "c:" + x.id === d.type); if (!c) return "";
  const [vx, vy, vw, vh] = c.vb, k = 10/Math.max(vw, vh);
  const T2 = `${T} scale(${r3(k)}) translate(${r3(-vx - vw/2)} ${r3(-vy - vh/2)})`;
  if (d.color === "orig") return `<g transform="${T2}">${c.inner}</g>`;
  const col = d.color === "accent" ? acc : ink;
  return `<g transform="${T2}" fill="${col}" stroke="${col}" color="${col}">${c.mono}</g>`;
}
