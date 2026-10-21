// @ts-check
/**
 * @module engines/shared/shapes
 * Analisis bentuk pustaka dan objek bawaan: bagian, badan, kotak pembatas,
 * dan peran bagian. Pengukuran DOM datang dari ./measure.js. Cache dan
 * pencarian sumber pustaka tetap di aplikasi.
 */
import { partStr, r3 } from "@icon-studio/core";
import { bbOf, measureNode, splitPath, svgParts } from "./measure.js";

/** @typedef {{x:number, y:number, w:number, h:number}} BB */

/** @param {string} s */
export const isClosed = (s) => /^<(circle|rect|ellipse|polygon)\b/.test(s) || (/^<path\b/.test(s) && /\sd="[^"]*[zZ]\s*"/.test(s));

/** @param {BB[]} list @returns {BB | null} */
export const unionBB = (list) =>
  list.reduce((u, b) => {
    if (!u) return { ...b };
    const x = Math.min(u.x, b.x), y = Math.min(u.y, b.y);
    return { x, y, w: Math.max(u.x + u.w, b.x + b.w) - x, h: Math.max(u.y + u.h, b.y + b.h) - y };
  }, /** @type {BB | null} */ (null));

/** @param {BB} a @param {BB} U @param {number} t */
export const inBB = (a, U, t) => a.x >= U.x - t && a.y >= U.y - t && a.x + a.w <= U.x + U.w + t && a.y + a.h <= U.y + U.h + t;

/** @param {BB} a @param {BB} U @param {number} t */
export const touchBB = (a, U, t) => a.x <= U.x + t || a.y <= U.y + t || a.x + a.w >= U.x + U.w - t || a.y + a.h >= U.y + U.h - t;

/** @param {BB} a @param {BB} b */
const inside = (a, b) => a.x >= b.x - 0.5 && a.y >= b.y - 0.5 && a.x + a.w <= b.x + b.w + 0.5 && a.y + a.h <= b.y + b.h + 0.5;

/** @param {BB | null} a @param {BB | null} b */
export function intersectionRatio(a, b) {
  if (!a || !b) return 0;
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return a.w * a.h ? (w * h) / (a.w * a.h) : 0;
}

/**
 * Pecah path sumber pustaka sesuai jenisnya (tb dan hg dipisah per sub-bentuk).
 * @param {string} src
 * @param {any[]} node
 */
export function prepNode(src, node) {
  if (src !== "tb" && src !== "hg") return node;
  return node.flatMap(([t, a]) => (t === "path" && a.d ? splitPath(a.d, r3).map((d) => [t, { ...a, d }]) : [[t, a]]));
}

/**
 * Markup satu bagian pustaka, dengan dot dan isian kecil ditangani.
 * @param {any} p
 * @param {{body: any[]}} A
 */
export function luPartSvg(p, A) {
  const s = p.dot
    ? partStr(p, ` stroke-linecap="round"`)
    : p.fill && !A.body.includes(p) && Math.max(p.bb.w, p.bb.h) < 3.2
      ? partStr(p, ` fill="INK" stroke="none"`)
      : partStr(p);
  return s.replace(/currentColor/g, "INK");
}

/**
 * Analisis satu ikon pustaka dari node mentahnya (tanpa cache).
 * @param {any[]} raw node SVG mentah dari sumber
 * @param {string} src awalan sumber: lu, tb, hg, atau cu
 * @param {string} key kunci lengkap, contoh "lu:check"
 */
export function analyzeLibraryIcon(raw, src, key) {
  const node = prepNode(src, raw);
  const parts = measureNode(node);
  const U = parts.reduce(
    (u, p) => {
      const x2 = Math.max(u.x + u.w, p.bb.x + p.bb.w), y2 = Math.max(u.y + u.h, p.bb.y + p.bb.h);
      const x = Math.min(u.x, p.bb.x), y = Math.min(u.y, p.bb.y);
      return { x, y, w: x2 - x, h: y2 - y };
    },
    { ...parts[0].bb },
  );
  const fillers = parts.filter((p) => p.fill).sort((a, b) => b.area - a.area);
  const big = fillers[0];
  const body = big && big.area >= 0.2 * U.w * U.h ? fillers.filter((p) => p === big || (p.area >= 0.15 * big.area && !inside(p.bb, big.bb))) : [];
  return { name: key.slice(3), src, key, node, parts, U, body, hasBody: body.length > 0 };
}

/**
 * Bagian objek utama. `analyze` mengembalikan hasil analyzeLibraryIcon atau null.
 * @param {any} M objek utama: {b, s, lu?, missing?}
 * @param {string} key
 * @param {(key: string) => any} analyze
 * @param {(key: string) => boolean} isLib
 */
export function mainInfoOf(M, key, analyze, isLib) {
  let parts = [];
  if (isLib(key) && !M.missing) {
    const A = analyze(key);
    if (A) {
      parts = A.parts.map((/** @type {any} */ p) => ({
        svg: luPartSvg(p, A),
        k: 2,
        body: A.body.includes(p),
        closed: p.fill && !p.dot,
        bb: { x: p.bb.x * 2, y: p.bb.y * 2, w: p.bb.w * 2, h: p.bb.h * 2 },
      }));
    }
  }
  if (!parts.length) {
    parts = [...svgParts(M.b).map((s) => ({ svg: s, body: true })), ...svgParts(M.s).map((s) => ({ svg: s, body: false }))].map((p) => ({
      ...p,
      k: 1,
      closed: isClosed(p.svg) && !/fill="INK"/.test(p.svg),
      bb: bbOf(p.svg, 1),
    }));
  }
  const bodies = parts.filter((p) => p.body);
  return { M, parts, U: bodies.length ? unionBB(bodies.map((p) => p.bb)) : null };
}

/**
 * Bentuk pengubah: badan, detail, dan kotak. `analyze` seperti di mainInfoOf.
 * @param {any} M pengubah: {w, h, sil, det, lu?, missing?}
 * @param {string} key
 * @param {(key: string) => any} analyze
 */
export function modShapeOf(M, key, analyze) {
  let body = [], det = [], U, badge;
  const A = M.lu && !M.missing ? analyze(key) : null;
  if (A) {
    body = A.body.map((/** @type {any} */ p) => ({ svg: partStr(p), bb: { ...p.bb } }));
    det = A.parts.filter((/** @type {any} */ p) => !A.body.includes(p)).map((/** @type {any} */ p) => ({ svg: luPartSvg(p, A), bb: { ...p.bb } }));
    badge = !body.length;
    U = badge ? unionBB(det.map((d) => d.bb)) : unionBB(body.map((b) => b.bb).concat(det.map((d) => d.bb)));
  } else {
    const sil = svgParts(M.sil), ds = svgParts(M.det || "");
    badge = sil.length === 1 && /^<circle\b/.test(sil[0]) && ds.length > 0;
    det = ds.map((s) => ({ svg: s, bb: bbOf(s, 1) }));
    body = badge ? [] : sil.map((s) => ({ svg: s, bb: bbOf(s, 1) }));
    U = badge ? unionBB(det.map((d) => d.bb)) : { x: 0, y: 0, w: M.w, h: M.h };
  }
  const BU = body.length ? unionBB(body.map((b) => b.bb)) : null;
  det.forEach((d) => (d.inBody = !!BU && inBB(d.bb, BU, 0.3)));
  U = U && U.w ? U : { x: 0, y: 0, w: M.w || 16, h: M.h || 16 };
  return { M, body, det, U, badge };
}

/**
 * Peran otomatis tiap bagian: ink, acc, fillA, atau fill.
 * @param {any} info hasil mainInfoOf
 * @param {string} under
 * @returns {string[]}
 */
export function autoRoles(info, under) {
  const r = info.parts.map(() => "ink");
  if (under && under !== "none" && info.U) return r;
  const dets = info.parts.map((/** @type {any} */ p, /** @type {number} */ i) => [p, i]).filter(([p]) => !p.body);
  if (info.U) {
    const content = dets.filter(([p]) => inBB(p.bb, info.U, 1) && !touchBB(p.bb, info.U, 1));
    if (content.length) content.forEach(([, i]) => (r[i] = "acc"));
    else if (dets.length) r[dets[dets.length - 1][1]] = "acc";
  } else if (info.parts.length > 1) {
    let big = 0;
    info.parts.forEach((/** @type {any} */ p, /** @type {number} */ i) => {
      if (p.bb.w * p.bb.h > info.parts[big].bb.w * info.parts[big].bb.h) big = i;
    });
    info.parts.forEach((/** @type {any} */ _p, /** @type {number} */ i) => {
      if (i !== big) r[i] = "acc";
    });
  }
  return r;
}

/** Peran bagian yang dikenal. */
export const ROLES = ["ink", "acc", "fillA", "fill"];

/**
 * Peran tiap bagian: peran pustaka (customRoles) bila ada dan tanpa pengubah
 * bagian, lalu koreksi manual dari it.parts.
 * @param {any} it
 * @param {any} info hasil mainInfoOf
 * @param {((key: string, n: number) => string[] | null) | null} [customRoles]
 * @returns {string[]}
 */
export function rolesOf(it, info, customRoles = null) {
  const cr = (!it.under || it.under === "none") && customRoles ? customRoles(it.main, info.parts.length) : null;
  const r = cr ? cr.map((/** @type {string} */ v, /** @type {number} */ i) => ((v === "fill" || v === "fillA") && !info.parts[i].closed ? "ink" : v)) : autoRoles(info, it.under);
  if (it.parts)
    for (const [i, v] of Object.entries(it.parts)) {
      const n = +i;
      if (r[n] !== undefined && ROLES.includes(/** @type {string} */ (v))) r[n] = (v === "fill" || v === "fillA") && !info.parts[n].closed ? "ink" : v;
    }
  return r;
}
