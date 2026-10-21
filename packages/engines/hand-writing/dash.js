// @ts-check
/**
 * @module engines/hand-writing/dash
 * Memanggang `stroke-dasharray` menjadi potongan path nyata (docs/engines/hand-writing.md bagian
 * "WAJIB: memanggang dash"). Pipeline ekspor Canva mengabaikan dasharray, jadi celah goresan harus
 * berupa geometri. Semua perhitungan murni (tanpa DOM): bentuk dasar diubah menjadi path setara
 * (urutan titik awal dan arah sama dengan browser), path disampel rapat (jarak ≤ 0,25 unit),
 * lalu dipotong mengikuti pola dash per sub-path, seperti cara Chromium (Skia) mengulang pola di
 * awal setiap sub-path.
 *
 * Skala `pathLength="100"` di Chromium memakai panjang path versi Skia (`SkContourMeasure` dengan
 * toleransi 0,5 unit: busur menjadi conic, kurva dibagi dua sampai cukup datar lalu diukur sebagai
 * tali busur). Panjang itu sedikit lebih pendek dari panjang geometri sebenarnya, sehingga celah di
 * legacy jatuh sedikit lebih awal. `skiaLength` meniru ukuran itu supaya celah di posisi yang sama
 * dengan render legacy (docs/engines/hand-writing.md).
 */
import { arcPoints, parsePath } from "../offset/geometry.js";

/** @typedef {[string, Record<string, any>]} Part */
/** @typedef {[number, number][]} Polyline */

/** Jarak sampel maksimum kurva (satuan ikon 24). */
const STEP = 0.25;
/** Batas isi cache potongan. */
const CACHE_MAX = 4000;
/** @type {Map<string, string>} */
const cache = new Map();

/** @param {any} v */
const n = (v) => Number(v) || 0;

/**
 * Path setara bentuk dasar (urutan dan arah mengikuti spesifikasi SVG 2 bagian "equivalent path").
 * @param {Part} part
 * @returns {string}
 */
export function shapeToPath([tag, a]) {
  if (tag === "path") return String(a.d || "");
  if (tag === "circle" || tag === "ellipse") {
    const cx = n(a.cx),
      cy = n(a.cy),
      rx = tag === "circle" ? n(a.r) : n(a.rx),
      ry = tag === "circle" ? n(a.r) : n(a.ry);
    if (rx <= 0 || ry <= 0) return "";
    return `M${cx + rx} ${cy}A${rx} ${ry} 0 0 1 ${cx} ${cy + ry}A${rx} ${ry} 0 0 1 ${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx} ${cy - ry}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}Z`;
  }
  if (tag === "rect") {
    const x = n(a.x),
      y = n(a.y),
      w = n(a.width),
      h = n(a.height);
    if (w <= 0 || h <= 0) return "";
    let rx = a.rx != null ? n(a.rx) : a.ry != null ? n(a.ry) : 0,
      ry = a.ry != null ? n(a.ry) : rx;
    rx = Math.min(Math.max(0, rx), w / 2);
    ry = Math.min(Math.max(0, ry), h / 2);
    if (!rx || !ry)
      return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    return `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
  }
  if (tag === "line")
    return `M${n(a.x1)} ${n(a.y1)}L${n(a.x2)} ${n(a.y2)}`;
  if (tag === "polygon" || tag === "polyline") {
    const v = String(a.points || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((x) => Number.isFinite(x));
    if (v.length < 4) return "";
    let d = `M${v[0]} ${v[1]}`;
    for (let i = 2; i + 1 < v.length; i += 2) d += `L${v[i]} ${v[i + 1]}`;
    return tag === "polygon" ? d + "Z" : d;
  }
  return "";
}

/**
 * Sampel path menjadi polyline per sub-path. Garis lurus tidak disampel ulang, kurva dan busur
 * disampel dengan jarak ≤ STEP.
 * @param {string} d
 * @returns {Polyline[]}
 */
export function subpaths(d) {
  /** @type {Polyline[]} */
  const out = [];
  /** @type {Polyline | null} */
  let cur = null;
  let x = 0,
    y = 0,
    sx = 0,
    sy = 0,
    prev = "";
  /** @type {[number, number] | null} */
  let ctrl = null;
  const start = () => {
    if (!cur) {
      cur = [[x, y]];
      out.push(cur);
    }
    return cur;
  };
  /** @param {number} nx @param {number} ny */
  const lineTo = (nx, ny) => {
    start().push([nx, ny]);
    x = nx;
    y = ny;
  };
  for (const { cmd, args } of parsePath(d)) {
    const C = cmd.toUpperCase(),
      rel = cmd !== C && C !== "Z";
    const ax = (/** @type {number} */ v) => (rel ? x + v : v),
      ay = (/** @type {number} */ v) => (rel ? y + v : v);
    if (C === "M") {
      x = sx = ax(args[0]);
      y = sy = ay(args[1]);
      cur = null;
      start();
    } else if (C === "L") lineTo(ax(args[0]), ay(args[1]));
    else if (C === "H") lineTo(rel ? x + args[0] : args[0], y);
    else if (C === "V") lineTo(x, rel ? y + args[0] : args[0]);
    else if (C === "Z") {
      lineTo(sx, sy);
      cur = null;
    } else if (C === "C" || C === "S" || C === "Q" || C === "T") {
      const cubic = C === "C" || C === "S";
      const smooth = C === "S" || C === "T";
      let c1x, c1y;
      if (smooth) {
        const refl = ctrl && (cubic ? /[CS]/i : /[QT]/i).test(prev);
        c1x = refl && ctrl ? 2 * x - ctrl[0] : x;
        c1y = refl && ctrl ? 2 * y - ctrl[1] : y;
      } else {
        c1x = ax(args[0]);
        c1y = ay(args[1]);
      }
      const o = smooth ? 0 : 2;
      let c2x = c1x,
        c2y = c1y,
        ex,
        ey;
      if (cubic) {
        c2x = ax(args[o]);
        c2y = ay(args[o + 1]);
        ex = ax(args[o + 2]);
        ey = ay(args[o + 3]);
      } else {
        ex = ax(args[o]);
        ey = ay(args[o + 1]);
      }
      const x0 = x,
        y0 = y;
      const hull =
        Math.hypot(c1x - x0, c1y - y0) +
        Math.hypot(c2x - c1x, c2y - c1y) +
        Math.hypot(ex - c2x, ey - c2y);
      const steps = Math.max(4, Math.ceil(hull / STEP));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps,
          u = 1 - t;
        if (cubic)
          lineTo(
            u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex,
            u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey,
          );
        else
          lineTo(
            u * u * x0 + 2 * u * t * c1x + t * t * ex,
            u * u * y0 + 2 * u * t * c1y + t * t * ey,
          );
      }
      x = ex;
      y = ey;
      ctrl = cubic ? [c2x, c2y] : [c1x, c1y];
    } else if (C === "A") {
      const ex = ax(args[5]),
        ey = ay(args[6]);
      start();
      for (const [px, py] of arcPoints(x, y, args[0], args[1], args[2], args[3], args[4], ex, ey, 0))
        lineTo(px, py);
      x = ex;
      y = ey;
    }
    if (!/[CSQT]/.test(C)) ctrl = null;
    prev = cmd;
  }
  return out;
}

/* ---------- panjang versi Skia (skala pathLength di Chromium) ---------- */

/** Toleransi `SkContourMeasure` pada resScale 1. */
const SK_TOL = 0.5;
/** Rentang t fixed-point Skia dan batas pembagian (`tspan_big_enough`). */
const SK_TMAX = 0x3fffffff;
/** @param {number} span */
const bigEnough = (span) => span >> 10 !== 0;
/** @param {number} ax @param {number} ay @param {number} bx @param {number} by */
const cheapFar = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by)) > SK_TOL;

/** @param {number[]} p [x0,y0,x1,y1,x2,y2] @param {number} mint @param {number} maxt @returns {number} */
function quadLen(p, mint, maxt) {
  const dx = p[2] / 2 - (p[0] + p[4]) / 4,
    dy = p[3] / 2 - (p[1] + p[5]) / 4;
  if (bigEnough(maxt - mint) && Math.max(Math.abs(dx), Math.abs(dy)) > SK_TOL) {
    const half = (mint + maxt) >> 1;
    const ax = (p[0] + p[2]) / 2,
      ay = (p[1] + p[3]) / 2,
      bx = (p[2] + p[4]) / 2,
      by = (p[3] + p[5]) / 2,
      mx = (ax + bx) / 2,
      my = (ay + by) / 2;
    return quadLen([p[0], p[1], ax, ay, mx, my], mint, half) + quadLen([mx, my, bx, by, p[4], p[5]], half, maxt);
  }
  return Math.hypot(p[4] - p[0], p[5] - p[1]);
}

/** @param {number[]} p [x0,y0,..,x3,y3] @param {number} mint @param {number} maxt @returns {number} */
function cubicLen(p, mint, maxt) {
  const curvy =
    cheapFar(p[2], p[3], p[0] + (p[6] - p[0]) / 3, p[1] + (p[7] - p[1]) / 3) ||
    cheapFar(p[4], p[5], p[0] + ((p[6] - p[0]) * 2) / 3, p[1] + ((p[7] - p[1]) * 2) / 3);
  if (bigEnough(maxt - mint) && curvy) {
    const half = (mint + maxt) >> 1;
    const ab = [(p[0] + p[2]) / 2, (p[1] + p[3]) / 2],
      bc = [(p[2] + p[4]) / 2, (p[3] + p[5]) / 2],
      cd = [(p[4] + p[6]) / 2, (p[5] + p[7]) / 2],
      abc = [(ab[0] + bc[0]) / 2, (ab[1] + bc[1]) / 2],
      bcd = [(bc[0] + cd[0]) / 2, (bc[1] + cd[1]) / 2],
      m = [(abc[0] + bcd[0]) / 2, (abc[1] + bcd[1]) / 2];
    return cubicLen([p[0], p[1], ...ab, ...abc, ...m], mint, half) + cubicLen([...m, ...bcd, ...cd, p[6], p[7]], half, maxt);
  }
  return Math.hypot(p[6] - p[0], p[7] - p[1]);
}

/**
 * Panjang conic (bobot w) versi Skia: titik tengah parameter dibandingkan dengan tengah tali busur.
 * @param {number[]} p [x0,y0,x1,y1,x2,y2] @param {number} w
 */
function conicLen(p, w) {
  const at = (/** @type {number} */ t) => {
    const u = 1 - t,
      a = u * u,
      b = 2 * w * t * u,
      c = t * t,
      den = a + b + c;
    return [(a * p[0] + b * p[2] + c * p[4]) / den, (a * p[1] + b * p[3] + c * p[5]) / den];
  };
  /** @returns {number} */
  const seg = (/** @type {number} */ mint, /** @type {number[]} */ minP, /** @type {number} */ maxt, /** @type {number[]} */ maxP) => {
    const half = (mint + maxt) >> 1;
    const h = at(half / SK_TMAX);
    if (bigEnough(maxt - mint) && cheapFar(h[0], h[1], (minP[0] + maxP[0]) / 2, (minP[1] + maxP[1]) / 2))
      return seg(mint, minP, half, h) + seg(half, h, maxt, maxP);
    return Math.hypot(maxP[0] - minP[0], maxP[1] - minP[1]);
  };
  return seg(0, [p[0], p[1]], SK_TMAX, [p[4], p[5]]);
}

/**
 * Busur SVG menjadi conic seperti `SkPath::arcTo` (paling lebar 120° per conic).
 * @returns {number}
 */
function arcLen(/** @type {number} */ x1, /** @type {number} */ y1, /** @type {number} */ rx, /** @type {number} */ ry, /** @type {number} */ phi, /** @type {number} */ fa, /** @type {number} */ fs, /** @type {number} */ x2, /** @type {number} */ y2) {
  if (x1 === x2 && y1 === y2) return 0;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (!rx || !ry) return Math.hypot(x2 - x1, y2 - y1);
  const pr = (phi * Math.PI) / 180,
    cos = Math.cos(pr),
    sin = Math.sin(pr);
  const dx = (x1 - x2) / 2,
    dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy,
    y1p = -sin * dx + cos * dy;
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) {
    rx *= Math.sqrt(lam);
    ry *= Math.sqrt(lam);
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const co = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (co * rx * y1p) / ry,
    cyp = (-co * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2,
    cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const t1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  let t2 = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx);
  let dt = t2 - t1;
  if (fs && dt < 0) dt += 2 * Math.PI;
  if (!fs && dt > 0) dt -= 2 * Math.PI;
  const segments = Math.ceil(Math.abs(dt / ((2 * Math.PI) / 3)));
  if (!segments) return 0;
  const width = dt / segments,
    w = Math.sqrt(0.5 + Math.cos(width) * 0.5),
    tan = Math.tan(width / 2);
  const map = (/** @type {number} */ ux, /** @type {number} */ uy) => [cx + rx * ux * cos - ry * uy * sin, cy + rx * ux * sin + ry * uy * cos];
  let L = 0,
    th = t1,
    [px, py] = [x1, y1];
  for (let i = 0; i < segments; i++) {
    const end = th + width;
    const ce = Math.cos(end),
      se = Math.sin(end);
    const [qx, qy] = map(ce + tan * se, se - tan * ce);
    const [ex, ey] = i === segments - 1 ? [x2, y2] : map(ce, se);
    L += conicLen([px, py, qx, qy, ex, ey], w);
    [px, py] = [ex, ey];
    th = end;
  }
  return L;
}

/**
 * Panjang path seperti `SkContourMeasure` (resScale 1) yang dipakai Chromium untuk skala `pathLength`.
 * Bentuk dasar diubah dulu lewat `shapeToPath` (lingkaran, elips, dan sudut rect menjadi busur 90°).
 * @param {string} d
 */
export function skiaLength(d) {
  let x = 0,
    y = 0,
    sx = 0,
    sy = 0,
    L = 0,
    prev = "";
  /** @type {[number, number] | null} */
  let ctrl = null;
  for (const { cmd, args } of parsePath(d)) {
    const C = cmd.toUpperCase(),
      rel = cmd !== C && C !== "Z";
    const ax = (/** @type {number} */ v) => (rel ? x + v : v),
      ay = (/** @type {number} */ v) => (rel ? y + v : v);
    let nx = x,
      ny = y;
    if (C === "M") {
      nx = sx = ax(args[0]);
      ny = sy = ay(args[1]);
    } else if (C === "L" || C === "H" || C === "V" || C === "Z") {
      nx = C === "Z" ? sx : C === "V" ? x : ax(args[0]);
      ny = C === "Z" ? sy : C === "H" ? y : C === "V" ? ay(args[0]) : ay(args[1]);
      L += Math.hypot(nx - x, ny - y);
    } else if (C === "C" || C === "S") {
      const refl = C === "S" && ctrl && /[CS]/i.test(prev);
      const c1 = C === "S" ? (refl && ctrl ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : [x, y]) : [ax(args[0]), ay(args[1])];
      const o = C === "S" ? 0 : 2;
      const c2 = [ax(args[o]), ay(args[o + 1])];
      nx = ax(args[o + 2]);
      ny = ay(args[o + 3]);
      L += cubicLen([x, y, c1[0], c1[1], c2[0], c2[1], nx, ny], 0, SK_TMAX);
      ctrl = [c2[0], c2[1]];
    } else if (C === "Q" || C === "T") {
      const refl = C === "T" && ctrl && /[QT]/i.test(prev);
      const c1 = C === "T" ? (refl && ctrl ? [2 * x - ctrl[0], 2 * y - ctrl[1]] : [x, y]) : [ax(args[0]), ay(args[1])];
      const o = C === "T" ? 0 : 2;
      nx = ax(args[o]);
      ny = ay(args[o + 1]);
      L += quadLen([x, y, c1[0], c1[1], nx, ny], 0, SK_TMAX);
      ctrl = [c1[0], c1[1]];
    } else if (C === "A") {
      nx = ax(args[5]);
      ny = ay(args[6]);
      L += arcLen(x, y, args[0], args[1], args[2], args[3], args[4], nx, ny);
    }
    if (!/[CSQT]/.test(C)) ctrl = null;
    x = nx;
    y = ny;
    prev = cmd;
  }
  return L;
}

/** @param {Polyline} pl */
const lengthOf = (pl) => {
  let L = 0;
  for (let i = 1; i < pl.length; i++)
    L += Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1]);
  return L;
};

/** @param {number} v */
const fmt = (v) => {
  const s = (Math.round(v * 1000) / 1000).toFixed(3).replace(/\.?0+$/, "");
  return s === "-0" ? "0" : s;
};

/**
 * Potong satu polyline pada rentang panjang [s0, s1].
 * @param {Polyline} pl
 * @param {number} s0
 * @param {number} s1
 * @returns {Polyline}
 */
function slice(pl, s0, s1) {
  /** @type {Polyline} */
  const pts = [];
  let acc = 0;
  for (let i = 1; i < pl.length; i++) {
    const [ax, ay] = pl[i - 1],
      [bx, by] = pl[i];
    const len = Math.hypot(bx - ax, by - ay);
    const a = acc,
      b = acc + len;
    acc = b;
    if (b < s0 || len === 0) continue;
    if (a > s1) break;
    const at = (/** @type {number} */ s) => {
      const t = len ? Math.min(1, Math.max(0, (s - a) / len)) : 0;
      return /** @type {[number, number]} */ ([ax + (bx - ax) * t, ay + (by - ay) * t]);
    };
    if (!pts.length) pts.push(at(Math.max(s0, a)));
    pts.push(b <= s1 ? [bx, by] : at(s1));
  }
  return pts;
}

/**
 * Pola dash setara `stroke-dasharray="dash gap" stroke-dashoffset="offset"` dengan `pathLength="100"`,
 * dipanggang menjadi `d` berisi potongan yang terlihat. Pola dimulai ulang di awal setiap sub-path.
 * Mengembalikan "" bila tidak ada bagian yang terlihat.
 * @param {Part} part bentuk asli (path atau bentuk dasar)
 * @param {number} dash panjang garis dalam satuan pathLength 100
 * @param {number} gap panjang celah dalam satuan pathLength 100
 * @param {number} offset fase dalam satuan pathLength 100
 * @returns {string}
 */
export function bakeDash(part, dash, gap, offset) {
  const d = shapeToPath(part);
  const key = `${d}|${dash}|${gap}|${offset}`;
  const hit = cache.get(key);
  if (hit != null) return hit;
  const lines = subpaths(d);
  const lengths = lines.map(lengthOf);
  const total = lengths.reduce((a, b) => a + b, 0);
  let out = "";
  if (total > 0) {
    /* satuan pathLength mengikuti panjang Skia, posisi diukur di geometri sebenarnya */
    const k = (skiaLength(d) || total) / 100,
      on = dash * k,
      period = (dash + gap) * k,
      phase = (((offset * k) % period) + period) % period;
    lines.forEach((pl, i) => {
      const L = lengths[i];
      if (!(L > 0)) return;
      /* posisi pola p = s + phase; garis terlihat bila (p mod period) < on */
      for (let start = -phase; start < L; start += period) {
        const s0 = Math.max(0, start),
          s1 = Math.min(L, start + on);
        if (s1 <= s0) continue;
        const pts = slice(pl, s0, s1);
        if (pts.length < 2) continue;
        out += `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
        for (let j = 1; j < pts.length; j++)
          out += `L${fmt(pts[j][0])} ${fmt(pts[j][1])}`;
      }
    });
  }
  if (cache.size >= CACHE_MAX) cache.clear();
  cache.set(key, out);
  return out;
}
