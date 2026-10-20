// @ts-check
/**
 * @module engines/offset/geometry
 * Geometri murni untuk bagian ikon pustaka (tanpa DOM). Menggantikan `getTotalLength`,
 * `getPointAtLength`, dan `getBBox` yang dipakai offset-composer 1.0.1 untuk `closed` dan `areaOf`.
 * Kurva dan busur disampel rapat, sehingga kotak dan panjangnya cukup dekat dengan hasil browser.
 */

/** @typedef {{x: number, y: number, w: number, h: number}} Box */
/** @typedef {[string, Record<string, any>]} Part */

const STEPS = 24;
const NUM_RE = /^[\s,]*([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/i;
const FLAG_RE = /^[\s,]*([01])/;
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/**
 * Pecah atribut `d` menjadi daftar perintah dengan argumen angka.
 * @param {string} d
 * @returns {{cmd: string, args: number[]}[]}
 */
export function parsePath(d) {
  const out = [];
  let rest = String(d || "").trim();
  let cmd = "";
  while (rest.length) {
    const head = /^[\s,]*([MmLlHhVvCcSsQqTtAaZz])/.exec(rest);
    if (head) {
      cmd = head[1];
      rest = rest.slice(head[0].length);
      if (cmd === "Z" || cmd === "z") {
        out.push({ cmd, args: [] });
        continue;
      }
    } else if (!cmd || !NUM_RE.test(rest)) break;
    const n = /** @type {Record<string, number>} */ (ARGS)[cmd.toUpperCase()];
    const args = [];
    for (let i = 0; i < n; i++) {
      const isFlag = cmd.toUpperCase() === "A" && (i === 3 || i === 4);
      const m = (isFlag ? FLAG_RE : NUM_RE).exec(rest);
      if (!m) return out;
      args.push(parseFloat(m[1]));
      rest = rest.slice(m[0].length);
    }
    out.push({ cmd, args });
    /* argumen berulang setelah M dibaca sebagai L (aturan SVG) */
    if (cmd === "M") cmd = "L";
    else if (cmd === "m") cmd = "l";
  }
  return out;
}

/**
 * Titik-titik sampel busur elips (rumus parameter pusat, SVG 1.1 lampiran F.6).
 * @param {number} x1 @param {number} y1 @param {number} rx @param {number} ry
 * @param {number} phi derajat @param {number} fa @param {number} fs @param {number} x2 @param {number} y2
 * @param {number} [steps] jumlah titik sampel; 0 = otomatis sehingga jarak antartitik ≤ 0,25 unit
 * @returns {[number, number][]}
 */
export function arcPoints(x1, y1, rx, ry, phi, fa, fs, x2, y2, steps = STEPS) {
  if (x1 === x2 && y1 === y2) return [];
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (!rx || !ry) return [[x2, y2]];
  const p = (phi * Math.PI) / 180,
    cos = Math.cos(p),
    sin = Math.sin(p);
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
  const ang = (
    /** @type {number} */ ux,
    /** @type {number} */ uy,
    /** @type {number} */ vx,
    /** @type {number} */ vy,
  ) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang(
    (x1p - cxp) / rx,
    (y1p - cyp) / ry,
    (-x1p - cxp) / rx,
    (-y1p - cyp) / ry,
  );
  if (!fs && dt > 0) dt -= 2 * Math.PI;
  if (fs && dt < 0) dt += 2 * Math.PI;
  /** @type {[number, number][]} */
  const pts = [];
  const n = steps || Math.max(8, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / 0.25));
  for (let i = 1; i <= n; i++) {
    const t = t1 + (dt * i) / n;
    pts.push([
      cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
      cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
    ]);
  }
  pts[pts.length - 1] = [x2, y2];
  return pts;
}

/**
 * Sampel path menjadi polyline per sub-path.
 * @param {string} d
 * @returns {{start: [number, number] | null, end: [number, number] | null, length: number, points: [number, number][]}}
 */
export function samplePath(d) {
  const cmds = parsePath(d);
  /** @type {[number, number][]} */
  const points = [];
  let x = 0,
    y = 0,
    sx = 0,
    sy = 0,
    length = 0;
  /** @type {[number, number] | null} */
  let start = null;
  /** @type {[number, number] | null} */
  let ctrl = null;
  let prev = "";
  /** @param {number} nx @param {number} ny */
  const lineTo = (nx, ny) => {
    length += Math.hypot(nx - x, ny - y);
    x = nx;
    y = ny;
    points.push([x, y]);
  };
  for (const { cmd, args } of cmds) {
    const rel = cmd === cmd.toLowerCase() && cmd !== "z";
    const C = cmd.toUpperCase();
    const ax = (/** @type {number} */ v) => (rel ? x + v : v),
      ay = (/** @type {number} */ v) => (rel ? y + v : v);
    if (C === "M") {
      x = ax(args[0]);
      y = ay(args[1]);
      sx = x;
      sy = y;
      if (!start) start = [x, y];
      points.push([x, y]);
      ctrl = null;
    } else if (C === "L") lineTo(ax(args[0]), ay(args[1]));
    else if (C === "H") lineTo(rel ? x + args[0] : args[0], y);
    else if (C === "V") lineTo(x, rel ? y + args[0] : args[0]);
    else if (C === "Z") {
      lineTo(sx, sy);
      ctrl = null;
    } else if (C === "C" || C === "S") {
      let c1x, c1y;
      if (C === "S") {
        const refl = ctrl && /[CS]/i.test(prev);
        c1x = refl && ctrl ? 2 * x - ctrl[0] : x;
        c1y = refl && ctrl ? 2 * y - ctrl[1] : y;
      } else {
        c1x = ax(args[0]);
        c1y = ay(args[1]);
      }
      const o = C === "S" ? 0 : 2;
      const c2x = ax(args[o]),
        c2y = ay(args[o + 1]),
        ex = ax(args[o + 2]),
        ey = ay(args[o + 3]);
      const x0 = x,
        y0 = y;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS,
          u = 1 - t;
        lineTo(
          u * u * u * x0 +
            3 * u * u * t * c1x +
            3 * u * t * t * c2x +
            t * t * t * ex,
          u * u * u * y0 +
            3 * u * u * t * c1y +
            3 * u * t * t * c2y +
            t * t * t * ey,
        );
      }
      x = ex;
      y = ey;
      ctrl = [c2x, c2y];
    } else if (C === "Q" || C === "T") {
      let qx, qy;
      if (C === "T") {
        const refl = ctrl && /[QT]/i.test(prev);
        qx = refl && ctrl ? 2 * x - ctrl[0] : x;
        qy = refl && ctrl ? 2 * y - ctrl[1] : y;
      } else {
        qx = ax(args[0]);
        qy = ay(args[1]);
      }
      const o = C === "T" ? 0 : 2;
      const ex = ax(args[o]),
        ey = ay(args[o + 1]);
      const x0 = x,
        y0 = y;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS,
          u = 1 - t;
        lineTo(
          u * u * x0 + 2 * u * t * qx + t * t * ex,
          u * u * y0 + 2 * u * t * qy + t * t * ey,
        );
      }
      x = ex;
      y = ey;
      ctrl = [qx, qy];
    } else if (C === "A") {
      const ex = ax(args[5]),
        ey = ay(args[6]);
      for (const [px, py] of arcPoints(
        x,
        y,
        args[0],
        args[1],
        args[2],
        args[3],
        args[4],
        ex,
        ey,
      ))
        lineTo(px, py);
      x = ex;
      y = ey;
      ctrl = null;
    }
    if (C !== "C" && C !== "S" && C !== "Q" && C !== "T") ctrl = null;
    prev = cmd;
  }
  return { start, end: start ? [x, y] : null, length, points };
}

/**
 * Kotak pembatas geometri satu bagian (setara getBBox, tanpa tebal garis).
 * @param {Part} part
 * @returns {Box}
 */
export function partBox([tag, a]) {
  const n = (/** @type {any} */ v) => Number(v) || 0;
  if (tag === "circle")
    return {
      x: n(a.cx) - n(a.r),
      y: n(a.cy) - n(a.r),
      w: 2 * n(a.r),
      h: 2 * n(a.r),
    };
  if (tag === "ellipse")
    return {
      x: n(a.cx) - n(a.rx),
      y: n(a.cy) - n(a.ry),
      w: 2 * n(a.rx),
      h: 2 * n(a.ry),
    };
  if (tag === "rect")
    return { x: n(a.x), y: n(a.y), w: n(a.width), h: n(a.height) };
  if (tag === "line")
    return boxOf([
      [n(a.x1), n(a.y1)],
      [n(a.x2), n(a.y2)],
    ]);
  if (tag === "polygon" || tag === "polyline") {
    const v = String(a.points || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    /** @type {[number, number][]} */
    const pts = [];
    for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i], v[i + 1]]);
    return boxOf(pts);
  }
  if (tag === "path") return boxOf(samplePath(a.d).points);
  return { x: 0, y: 0, w: 0, h: 0 };
}

/** @param {[number, number][]} pts @returns {Box} */
function boxOf(pts) {
  if (!pts.length) return { x: 0, y: 0, w: 0, h: 0 };
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * Gabungan beberapa kotak, atau null kalau daftar kosong.
 * @param {Box[]} list
 * @returns {Box | null}
 */
export function unionBox(list) {
  if (!list.length) return null;
  const x0 = Math.min(...list.map((b) => b.x)),
    y0 = Math.min(...list.map((b) => b.y));
  return {
    x: x0,
    y: y0,
    w: Math.max(...list.map((b) => b.x + b.w)) - x0,
    h: Math.max(...list.map((b) => b.y + b.h)) - y0,
  };
}

/**
 * Dua kotak bersentuhan (termasuk bersinggungan).
 * @param {Box} a
 * @param {Box} b
 */
export const touches = (a, b) =>
  a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;
