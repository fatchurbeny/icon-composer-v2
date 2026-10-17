function lineOf(it, l){ return style.colors[l].line || style.ink; }
function fillOf(it, l){ return style.colors[l].fill || style.accent; }
let kid = 0;
function compose(it, opt){
  opt = opt || {};
  const S = style, g = geom(it), P = PREFS[modeOf(it)] || PREFS.A;
  const sz = opt.size || 48, mode = opt.mode || "mask";
  const id = opt.idp || ("k" + (++kid));
  const mInk = lineOf(it, "main"), mAcc = fillOf(it, "main"), dInk = lineOf(it, "mod"), dAcc = fillOf(it, "mod");
  const modOutline = P.mod === "outline";
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${sz}" height="${sz}" fill="none" stroke-width="${S.sw}" stroke-linecap="${S.cap}" stroke-linejoin="${S.join}">`;
  let gapW = 0;
  if (g.md){
    gapW = r3((2*S.gap + (modOutline ? S.sw : 0))/(g.sc*(g.md.ks || 1)));
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
    const inner = `<g transform="${g.mainT}" stroke="${mInk}" stroke-width="${r3(S.sw/g.ms)}">${fxL}${body}${fix(M.s)}</g>`;
    out += (g.md && mode === "mask") ? `<g mask="url(#${id})">${inner}</g>` : inner;
  }
  out += decoMarkup(it);
  if (g.md){
    out += `<g transform="${g.modT}" stroke="${dInk}">`;
    if (mode === "white" && (S.gap > 0 || modOutline)) out += `<g fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${gapW}" stroke-linejoin="round">${g.md.sil}</g>`;
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