// @ts-check
/**
 * @module engines/shared/measure
 * Satu-satunya modul engine yang menyentuh DOM (getBBox, getTotalLength,
 * DOMParser). Aplikasi memberi elemen <svg> tersembunyi lewat setMeasureHost.
 */

const NS = "http://www.w3.org/2000/svg";
const NUM = /^[\s,]*([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/i;

/** @type {SVGSVGElement | (() => SVGSVGElement | null) | null} */
let host = null;

/** @param {SVGSVGElement | (() => SVGSVGElement | null)} el elemen <svg> tersembunyi, atau getter-nya */
export function setMeasureHost(el) {
  host = el;
}

function hostEl() {
  const el = typeof host === "function" ? host() : host;
  if (!el) throw new Error("elemen pengukur belum tersedia");
  return el;
}

/**
 * Pecah elemen SVG pembungkus menjadi potongan level atas.
 * @param {string} src
 * @returns {string[]}
 */
export function svgParts(src) {
  if (!src) return [];
  const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}">${src}</svg>`, "image/svg+xml");
  const out = [];
  const walk = (/** @type {Element} */ n) => {
    for (const c of [...n.children]) {
      if (c.tagName === "g" && !c.getAttribute("transform") && !c.attributes.length) {
        walk(c);
        continue;
      }
      out.push(new XMLSerializer().serializeToString(c).replace(/ xmlns="[^"]+"/g, ""));
    }
  };
  walk(doc.documentElement);
  return out;
}

/**
 * Kotak pembatas satu potongan SVG, dikali faktor k.
 * @param {string} svg
 * @param {number} k
 */
export function bbOf(svg, k) {
  const meas = hostEl();
  meas.innerHTML = `<g fill="none" stroke="#000">${svg.replace(/INK/g, "#000")}</g>`;
  let b = { x: 0, y: 0, w: 0, h: 0 };
  try {
    const r = /** @type {SVGGraphicsElement} */ (meas.firstChild).getBBox();
    b = { x: r.x * k, y: r.y * k, w: r.width * k, h: r.height * k };
  } catch { /* elemen tidak bisa diukur: pakai nilai awal */ }
  meas.innerHTML = "";
  return b;
}

/**
 * Pecah path dengan banyak sub-bentuk (M…m…) menjadi path terpisah.
 * @param {string} d
 * @param {(n: number) => number} round pembulatan koordinat
 * @returns {string[]}
 */
export function splitPath(d, round) {
  const segs = d.split(/(?=[Mm])/).map((t) => t.trim()).filter(Boolean);
  if (segs.length < 2) return [d];
  const el = document.createElementNS(NS, "path");
  hostEl().append(el);
  const out = [];
  let acc = "";
  for (const seg of segs) {
    let piece = seg;
    if (seg[0] === "m" && acc) {
      el.setAttribute("d", acc);
      let cx = 0, cy = 0;
      try {
        const L = el.getTotalLength(), pt = el.getPointAtLength(L);
        cx = pt.x;
        cy = pt.y;
      } catch { /* elemen tidak bisa diukur: pakai nilai awal */ }
      let rest = seg.slice(1);
      const a = NUM.exec(rest);
      if (a) {
        rest = rest.slice(a[0].length);
        const b = NUM.exec(rest);
        if (b) {
          rest = rest.slice(b[0].length);
          const X = cx + parseFloat(a[1]), Y = cy + parseFloat(b[1]);
          rest = rest.trim();
          piece = `M${round(X)} ${round(Y)}` + (rest && /^[-+.\d]/.test(rest) ? "l" + rest : rest);
        }
      }
    }
    acc += (acc ? " " : "") + seg;
    out.push(piece);
  }
  el.remove();
  return out.filter((t) => /[a-ln-z]/i.test(t.replace(/^M/i, "")));
}

/**
 * Ukur setiap elemen node: kotak, apakah berisi, panjang sisi terbuka.
 * @param {[string, Record<string, any>][]} node
 */
export function measureNode(node) {
  const meas = hostEl();
  meas.innerHTML = "";
  const parts = node.map(([tag, attrs]) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) if (k !== "key") el.setAttribute(k, attrs[k]);
    meas.append(el);
    const shape = /** @type {SVGGraphicsElement} */ (/** @type {unknown} */ (el));
    let bb;
    try {
      const b = shape.getBBox();
      bb = { x: b.x, y: b.y, w: b.width, h: b.height };
    } catch {
      bb = { x: 0, y: 0, w: 0, h: 0 };
    }
    const closed = ["circle", "rect", "ellipse", "polygon"].includes(tag) || (tag === "path" && /z\s*$/i.test(attrs.d || ""));
    let gap = 99;
    if (!closed && (tag === "path" || tag === "polyline")) {
      try {
        const geom = /** @type {SVGGeometryElement} */ (/** @type {unknown} */ (el));
        const L = geom.getTotalLength(), a = geom.getPointAtLength(0), b = geom.getPointAtLength(L);
        gap = Math.hypot(a.x - b.x, a.y - b.y);
      } catch { /* elemen tidak bisa diukur: pakai nilai awal */ }
    }
    const fill = closed || (Math.min(bb.w, bb.h) > 3 && gap < 0.55 * Math.min(bb.w, bb.h));
    let at = attrs;
    if (!closed && tag === "path" && gap < 0.02 && Math.min(bb.w, bb.h) > 1) at = { ...attrs, d: attrs.d + "z" };
    const dot = !closed && Math.max(bb.w, bb.h) < 0.6;
    return { tag, attrs: at, bb, fill, closed, dot, area: Math.max(0.01, bb.w) * Math.max(0.01, bb.h) };
  });
  meas.innerHTML = "";
  return parts;
}
