// @ts-check
/**
 * @module engines/hand-writing
 * Gaya hand-writing (dulu "Coret"): tinta bergaya goresan tangan di atas blob warna aksen yang digeser.
 * Port dari `legacy/style/coret-composer-v1.0.0.html` (`coret`, `compose`) ke kontrak mesin
 * (docs/ENGINE-CONTRACT.md, docs/engines/hand-writing.md).
 *
 * Perbedaan dengan legacy:
 * - `coret()` menjadi `strokeSet()`.
 * - Dash dipanggang menjadi potongan path (`dash.js`), tanpa `stroke-dasharray` dan `pathLength`.
 * - Kanvas 24 (viewBox legacy `-3 -3 30 30`) dibungkus ke `viewBox="0 0 48 48"` lewat satu matriks,
 *   jadi geometri identik dengan legacy dan file ekspor sama dengan gaya lain.
 * - Id mask memakai `opt.idp` (legacy: `uidN` global).
 * - Objek bawaan atau ikon yang belum termuat menghasilkan SVG kosong + flag, bukan `null`.
 * - Sumbu variasi `var` (`tilt`, `gapPhase`, `gapPick`) dapat menggantikan hasil acak; tanpa `var`
 *   urutan dan nilai acak sama persis dengan legacy.
 */
import { hash, rng } from "@icon-studio/core";
import { concept } from "@icon-studio/icon-sources";
import { partBox, unionBox } from "../offset/geometry.js";
import { bakeDash } from "./dash.js";

/** @typedef {[string, Record<string, any>]} Part */
/** @typedef {{acc: string, ink: string, sw: number, puff: number, off: number, gap: number, rot: number, ko: number}} HandWritingStyle */

export const HAND_WRITING_ENGINE_VERSION = "2.0.0";

/** Patokan gaya coret-composer 1.0.0 (`S` legacy). */
export const HAND_WRITING_DEFAULTS = Object.freeze({
  acc: "#FDBF57",
  ink: "#2B1D2E",
  sw: 2.3,
  puff: 2,
  off: 1.25,
  gap: 9,
  rot: 5,
  ko: 1.25,
});

/** Rentang slider legacy: [min, max, langkah]. */
export const HAND_WRITING_RANGES = Object.freeze({
  sw: [1.4, 3.2, 0.1],
  puff: [0, 4, 0.25],
  off: [0, 3, 0.25],
  gap: [0, 20, 1],
  rot: [0, 10, 1],
  ko: [0.5, 3, 0.25],
  ms: [0.36, 0.7, 0.02],
});

/** Palet legacy (`ACC`, `INKS`). */
export const HAND_WRITING_ACCENTS = ["#FDBF57", "#7FC4BE", "#F28B82", "#A7C7F2", "#C3A6E8", "#9DCB86"];
export const HAND_WRITING_INKS = ["#2B1D2E", "#141414", "#1F2A37", "#3B2418"];

/** Mode blob per item. */
export const BLOB_MODES = ["auto", "circle", "none"];

/** Titik anchor pengubah (`ANC` legacy), satuan kanvas 24. */
export const ANCHORS = Object.freeze({
  TL: [5.5, 5.5],
  TC: [12, 4.5],
  TR: [18.5, 5.5],
  ML: [4.5, 12],
  MR: [19.5, 12],
  BL: [5.5, 18.5],
  BC: [12, 19.5],
  BR: [18.5, 18.5],
});

/** Atribut geometri yang dipertahankan (`KEEP` legacy). */
const KEEP = ["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "points", "x1", "y1", "x2", "y2"];
const HEX = /^#[0-9a-f]{6}$/i;
const LIB = /^(lu|tb|hg|cu):/;
/** Kanvas 24 dengan tepi 3 (viewBox legacy -3 -3 30 30) ke 48: skala 1,6, geser 4,8. */
const TO48 = "matrix(1.6 0 0 1.6 4.8 4.8)";

const emptySvg = (/** @type {number | string} */ size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"></svg>`;

/** Pembulatan 2 desimal (`f` legacy). @param {number} v */
const f = (v) => +v.toFixed(2);

/** @param {any} v @param {number} dflt @param {number} min @param {number} max */
const num = (v, dflt, min, max) =>
  v !== "" && v != null && Number.isFinite(+v) ? Math.max(min, Math.min(max, +v)) : dflt;

/** @param {any} v */
const seedOf = (v) => (v !== "" && v != null && Number.isFinite(+v) ? Math.trunc(+v) : null);

/**
 * Buang atribut non-geometri dan kotak latar 24×24 (`clean` legacy).
 * @param {any} node
 * @returns {Part[]}
 */
export function cleanNode(node) {
  return (Array.isArray(node) ? node : [])
    .filter((p) => Array.isArray(p) && typeof p[0] === "string")
    .map(([t, a]) => {
      /** @type {Record<string, any>} */
      const o = {};
      for (const k of KEEP) if (a && a[k] != null) o[k] = a[k];
      return /** @type {Part} */ ([t, o]);
    })
    .filter(([, a]) => a.d !== "M0 0h24v24H0z");
}

/** @param {string} t @param {Record<string, any>} a */
const isClosed = (t, a) =>
  t === "circle" || t === "rect" || t === "ellipse" || t === "polygon" || (t === "path" && /z\s*$/i.test(a.d || ""));

/** @param {any} v */
const escAttr = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Markup satu bentuk (`el` legacy). @param {string} t @param {Record<string, any>} a @param {string} ex */
const el = (t, a, ex) => {
  let s = "<" + t;
  for (const k in a) s += ` ${k}="${escAttr(a[k])}"`;
  return s + ex + "/>";
};

/* ---------- gaya dan item ---------- */

/**
 * Parameter gaya hand-writing yang sudah dibatasi. Menerima gaya set (dibaca dari
 * `style.engine["hand-writing"]`) atau objek parameter langsung.
 * @param {any} [raw]
 * @returns {HandWritingStyle}
 */
export function handWritingParams(raw = {}) {
  raw = raw || {};
  const isSetStyle = "family" in raw || "engine" in raw;
  const e = (isSetStyle ? raw.engine && raw.engine["hand-writing"] : raw) || {};
  const d = HAND_WRITING_DEFAULTS,
    R = HAND_WRITING_RANGES;
  return {
    acc: HEX.test(e.acc || "") ? String(e.acc).toUpperCase() : d.acc,
    ink: HEX.test(e.ink || "") ? String(e.ink).toUpperCase() : d.ink,
    sw: num(e.sw, d.sw, R.sw[0], R.sw[1]),
    puff: num(e.puff, d.puff, R.puff[0], R.puff[1]),
    off: num(e.off, d.off, R.off[0], R.off[1]),
    gap: num(e.gap, d.gap, R.gap[0], R.gap[1]),
    rot: num(e.rot, d.rot, R.rot[0], R.rot[1]),
    ko: num(e.ko, d.ko, R.ko[0], R.ko[1]),
  };
}

/**
 * Parameter per item (`item.engine["hand-writing"]`): skala pengubah, mode blob, seed, variasi.
 * @param {any} it
 * @returns {{ms: number, blob: "auto" | "circle" | "none", seed: number, var: any}}
 */
export function handWritingItem(it) {
  const e = (it && it.engine && it.engine["hand-writing"]) || {};
  return {
    ms: num(e.ms, 0.5, HAND_WRITING_RANGES.ms[0], HAND_WRITING_RANGES.ms[1]),
    blob: BLOB_MODES.includes(e.blob) ? e.blob : "auto",
    seed: seedOf(e.seed) ?? seedOf(it && it.seed) ?? 1,
    var: e.var && typeof e.var === "object" ? e.var : (it && it.var) || null,
  };
}

/**
 * Isi `style.engine["hand-writing"]` dengan nilai yang sah. Field classic/accent tidak disentuh.
 * @param {any} [style]
 */
function normStyle(style = {}) {
  return {
    ...style,
    family: "hand-writing",
    engine: { ...(style.engine || {}), "hand-writing": handWritingParams(style) },
  };
}

/**
 * Item kanonik → parameter mesin. Node ikon diambil lewat `ctx.nodeOf` saat compose.
 * @param {any} it
 */
function adapt(it) {
  it = it || {};
  const p = handWritingItem(it);
  const mod = it.mod && it.mod !== "none" ? String(it.mod) : null;
  const slot = it.slot || it.anchor;
  return {
    main: String(it.main || ""),
    mod,
    node: it.node || it.parts || null,
    modNode: it.modNode || null,
    anchor: /** @type {any} */ (ANCHORS)[slot] ? slot : "BR",
    ms: p.ms,
    blob: p.blob,
    seed: p.seed,
    var: p.var,
    vis: { main: true, mod: true, ...(it.vis || {}) },
  };
}

/* ---------- mesin ---------- */

/** Pola bagian besar yang diberi celah (`gapPick`), menggantikan peluang 75%: indeks yang dilewati. */
const GAP_PICK = {
  A: (/** @type {number} */ i) => i % 4 !== 3,
  B: (/** @type {number} */ i) => i % 4 !== 1,
  C: (/** @type {number} */ i) => i % 3 !== 2,
};

/**
 * Blob, tinta, dan siluet knockout satu lapisan (`coret` legacy). `sc` = skala grup, untuk menjaga tebal
 * garis visual. Pemanggilan `r()` sama urutannya dengan legacy.
 * @param {Part[]} nodes
 * @param {() => number} r
 * @param {HandWritingStyle} S
 * @param {number} sc
 * @param {string} blobMode
 * @param {any} v variasi item (`gapPhase`, `gapPick`)
 */
function strokeSet(nodes, r, S, sc, blobMode, v) {
  const closed = nodes.filter(([t, a]) => isClosed(t, a));
  const bw = f((S.sw + S.puff * 2) / sc),
    sw = f(S.sw / sc);
  /** @type {[string, Record<string, any>, number][]} */
  let blobShapes = [];
  if (blobMode !== "none") {
    if (blobMode === "auto" && closed.length) blobShapes = closed.map(([t, a]) => [t, a, bw]);
    else blobShapes = [["circle", { cx: 12, cy: 12, r: f(8 + S.puff * 0.6) }, 0]];
  }
  const blob = (/** @type {string} */ c) =>
    blobShapes.map(([t, a, w]) => el(t, a, ` fill="${c}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"`)).join("");
  let big = 0;
  const dash = nodes.map(([t, a]) => {
    const isBig = isClosed(t, a) || (t === "path" && (a.d || "").length > 18);
    if (!(isBig && S.gap > 0)) return null;
    const roll = r() < 0.75;
    const pick = v && v.gapPick in GAP_PICK ? /** @type {any} */ (GAP_PICK)[v.gapPick](big) : roll;
    big++;
    if (!pick) return null;
    const g = S.gap * (0.6 + r() * 0.8);
    const ph = r();
    const q = v && [0, 1, 2, 3].includes(v.gapPhase) ? (v.gapPhase + ph) * 25 : ph * 100;
    return { dash: f(100 - g), gap: f(g), offset: f(q) };
  });
  const inkAttrs = (/** @type {string} */ c) =>
    ` fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const ink = (/** @type {string} */ c) =>
    nodes
      .map(([t, a], i) => {
        const dsh = dash[i];
        if (!dsh) return el(t, a, inkAttrs(c));
        const d = bakeDash([t, a], dsh.dash, dsh.gap, dsh.offset);
        return d ? `<path d="${d}"${inkAttrs(c)}/>` : "";
      })
      .join("");
  const ko = f(S.ko / sc);
  const sil = (/** @type {string} */ c) =>
    blobShapes.map(([t, a, w]) => el(t, a, ` fill="${c}" stroke="${c}" stroke-width="${f(w + ko * 2)}" stroke-linejoin="round"`)).join("") +
    nodes.map(([t, a]) => el(t, a, ` fill="none" stroke="${c}" stroke-width="${f(sw + ko * 2)}" stroke-linecap="round" stroke-linejoin="round"`)).join("");
  return { blob, ink, sil };
}

/**
 * Render satu ikon hand-writing. `params` dari `adapt` (item kanonik juga diterima); node diambil dari
 * `params.node` atau `opt.ctx.nodeOf`.
 * @param {any} params
 * @param {any} style gaya set atau parameter hand-writing langsung
 * @param {{size?: number | string, mode?: "mask" | "white", idp?: string, deco?: boolean, back?: "white" | null, ctx?: {nodeOf?: (key: string) => any}}} [opt]
 */
function compose(params, style, opt = {}) {
  const p = params && "anchor" in params && "ms" in params && "vis" in params ? params : adapt(params);
  const S = handWritingParams(style);
  const ctx = opt.ctx || {};
  const size = opt.size || 48;
  const raw = p.node || (LIB.test(p.main) && ctx.nodeOf ? ctx.nodeOf(p.main) : null);
  const mn = cleanNode(raw);
  if (!mn.length) return emptySvg(size);
  const rawMod = p.mod ? p.modNode || (LIB.test(p.mod) && ctx.nodeOf ? ctx.nodeOf(p.mod) : null) : null;
  const mdn = cleanNode(rawMod);
  const hasMod = mdn.length > 0;
  const v = p.var || null;
  const r = rng((p.seed || 1) + hash(p.main + (p.mod || "")));
  const roll = r() * 2 - 1;
  const tilt = v && [-1, -0.5, 0.5, 1].includes(v.tilt) ? v.tilt : roll;
  const rot = f(tilt * S.rot),
    ox = f(-S.off),
    oy = f(S.off * 0.8);
  const msc = hasMod ? 0.84 : 1;
  const [ax, ay] = /** @type {any} */ (ANCHORS)[p.anchor] || ANCHORS.BR;
  const mT = hasMod ? `translate(${f((12 - ax) * 0.12)} ${f((12 - ay) * 0.12)}) translate(12 12) scale(${msc}) translate(-12 -12)` : "";
  const M = strokeSet(mn, r, S, msc, p.blob || "auto", v);
  const maskMode = opt.mode !== "white";
  const id = `${opt.idp || "hw"}ko`;
  let defs = "",
    maskAttr = "",
    modOut = "",
    whiteSil = "";
  if (hasMod) {
    const ms = p.ms || 0.5;
    const D = strokeSet(mdn, r, S, ms, "circle", v);
    if (p.vis.mod !== false) {
      const T = `translate(${ax} ${ay}) scale(${ms}) translate(-12 -12)`;
      if (maskMode) {
        /* warna mask #fff/#000 seperti legacy: pipeline ekspor mencari bidang potong dengan warna "#000" persis */
        defs = `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36"><rect x="-6" y="-6" width="36" height="36" fill="#fff"/><g transform="${T}">${D.sil("#000")}</g></mask></defs>`;
        maskAttr = ` mask="url(#${id})"`;
      } else whiteSil = `<g transform="${T}">${D.sil("#FFFFFF")}</g>`;
      modOut = `<g transform="${T}"><g transform="translate(${f(ox / ms)} ${f(oy / ms)})">${D.blob(S.acc)}</g>${D.ink(S.ink)}</g>`;
    }
  }
  const mainOut =
    p.vis.main === false
      ? ""
      : `<g${maskAttr}><g${mT ? ` transform="${mT}"` : ""}><g transform="translate(${ox} ${oy})">${M.blob(S.acc)}</g>${M.ink(S.ink)}</g></g>`;
  const back = opt.back === "white" ? `<rect x="0" y="0" width="48" height="48" fill="#FFFFFF"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">${defs}${back}<g transform="${TO48}"><g transform="rotate(${rot} 12 12)">${mainOut}${whiteSil}${modOut}</g></g></svg>`;
}

/* ---------- kotak lapisan ---------- */

/**
 * Kotak lapisan objek dan pengubah dalam satuan 48 (wilayah klik editor dan cek tepi viewBox Tinjau).
 * Memakai geometri murni: kotak bagian + tebal blob/tinta, transform lapisan, lalu kotak setelah rotasi.
 * Hand-writing tidak punya dekorasi, jadi `deco` selalu kosong.
 * @param {any} it item kanonik
 * @param {any} style gaya set
 * @param {{nodeOf?: (key: string) => any}} [ctx]
 */
export function boxesHandWriting(it, style, ctx = {}) {
  const z = { x: 0, y: 0, w: 0, h: 0 };
  const p = adapt(it);
  const S = handWritingParams(style);
  const mn = cleanNode(p.node || (LIB.test(p.main) && ctx.nodeOf ? ctx.nodeOf(p.main) : null));
  if (!mn.length) return { main: z, mod: z, deco: z };
  const mdn = cleanNode(p.mod ? p.modNode || (LIB.test(p.mod) && ctx.nodeOf ? ctx.nodeOf(p.mod) : null) : null);
  const hasMod = mdn.length > 0;
  const r = rng((p.seed || 1) + hash(p.main + (p.mod || "")));
  const roll = r() * 2 - 1;
  const v = p.var || null;
  const rot = (f((v && [-1, -0.5, 0.5, 1].includes(v.tilt) ? v.tilt : roll) * S.rot) * Math.PI) / 180;
  const [ax, ay] = /** @type {any} */ (ANCHORS)[p.anchor] || ANCHORS.BR;
  /** Kotak satu lapisan di kanvas 24 sebelum rotasi. @param {Part[]} nodes @param {string} blobMode @param {number} sc */
  const local = (nodes, blobMode, sc) => {
    const closed = nodes.filter(([t, a]) => isClosed(t, a));
    const ink = unionBox(nodes.map((n) => partBox(n)));
    const pad = S.sw / sc / 2;
    const boxes = [{ x: ink.x - pad, y: ink.y - pad, w: ink.w + 2 * pad, h: ink.h + 2 * pad }];
    if (blobMode !== "none") {
      const own = blobMode === "auto" && closed.length > 0;
      /* blob lingkaran tanpa garis tepi (stroke-width 0, seperti legacy) */
      const bp = own ? (S.sw + S.puff * 2) / sc / 2 : 0;
      const b =
        own
          ? unionBox(closed.map((n) => partBox(n)))
          : { x: 12 - (8 + S.puff * 0.6), y: 12 - (8 + S.puff * 0.6), w: 2 * (8 + S.puff * 0.6), h: 2 * (8 + S.puff * 0.6) };
      boxes.push({ x: b.x - bp - S.off / sc, y: b.y - bp + (S.off * 0.8) / sc, w: b.w + 2 * bp, h: b.h + 2 * bp });
    }
    return unionBox(boxes);
  };
  /** Kotak kanvas 24 → 48 setelah transform lapisan (skala + geser) dan rotasi ikon. @param {any} b @param {number} k @param {number} tx @param {number} ty */
  const place = (b, k, tx, ty) => {
    const cs = Math.cos(rot),
      sn = Math.sin(rot);
    const pts = [
      [b.x, b.y],
      [b.x + b.w, b.y],
      [b.x, b.y + b.h],
      [b.x + b.w, b.y + b.h],
    ].map(([x, y]) => {
      const X = tx + x * k - 12,
        Y = ty + y * k - 12;
      return [12 + X * cs - Y * sn, 12 + X * sn + Y * cs];
    });
    const xs = pts.map((q) => q[0] * 1.6 + 4.8),
      ys = pts.map((q) => q[1] * 1.6 + 4.8);
    const x0 = Math.min(...xs),
      y0 = Math.min(...ys);
    return { x: x0, y: y0, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 };
  };
  const msc = hasMod ? 0.84 : 1;
  const main = hasMod
    ? place(local(mn, p.blob, msc), msc, 12 - 12 * msc + (12 - ax) * 0.12, 12 - 12 * msc + (12 - ay) * 0.12)
    : place(local(mn, p.blob, 1), 1, 0, 0);
  const mod = hasMod ? place(local(mdn, "circle", p.ms), p.ms, ax - 12 * p.ms, ay - 12 * p.ms) : z;
  return { main: p.vis.main === false ? z : main, mod: p.vis.mod === false ? z : mod, deco: z };
}

/* ---------- sumbu, signature, flag ---------- */

const axes = () => [
  { id: "tilt", values: [-1, -0.5, 0.5, 1] },
  { id: "gapPhase", values: [0, 1, 2, 3] },
  { id: "gapPick", values: ["A", "B", "C"] },
];

/** @param {any} it */
const signature = (it) => {
  const mod = it && it.mod && it.mod !== "none" ? String(it.mod) : "";
  return `hand-writing|${concept(String((it && it.main) || ""))}|${mod ? concept(mod, "mod") : "-"}|${mod ? it.slot || it.anchor || "BR" : "-"}`;
};

/**
 * Flag khusus hand-writing: objek atau pengubah bawaan tidak didukung.
 * @param {any} it
 * @param {any} [_style]
 * @param {{nodeOf?: (key: string) => any}} [ctx]
 * @returns {[("err" | "warn" | "info"), string][]}
 */
function flags(it, _style, ctx = {}) {
  /** @type {[("err" | "warn" | "info"), string][]} */
  const out = [];
  if (it && (it.node || it.parts)) return out;
  const main = String((it && it.main) || "");
  if (!LIB.test(main)) out.push(["err", "Objek bawaan tidak didukung gaya Hand-writing"]);
  else if (ctx.nodeOf && !ctx.nodeOf(main)) out.push(["warn", "Objek belum termuat"]);
  const mod = it && it.mod && it.mod !== "none" ? String(it.mod) : "";
  if (mod && !LIB.test(mod)) out.push(["warn", "Pengubah bawaan tidak didukung gaya Hand-writing"]);
  return out;
}

/**
 * Migrasi payload `gaya.json` coret-composer 1.0.0 (`{family:"coret", style, icons}`) ke bentuk kanonik
 * hand-writing: `anchor` → `slot`, `ms`/`blob`/`seed` → `engine["hand-writing"]`.
 * @param {any} [payload]
 */
export function migrateLegacy(payload = {}) {
  const source = payload.style || payload.S || {};
  const icons = Array.isArray(payload.icons) ? payload.icons : Array.isArray(payload.set) ? payload.set : [];
  return {
    ...payload,
    family: "hand-writing",
    version: 2,
    style: handWritingParams({ ...source, acc: source.acc || source.accent }),
    icons: icons.map((/** @type {any} */ icon, /** @type {number} */ index) => {
      const slot = icon.slot || icon.anchor;
      return {
        ...icon,
        mod: icon.mod || "none",
        slot: /** @type {any} */ (ANCHORS)[slot] ? slot : "BR",
        engine: {
          ...icon.engine,
          "hand-writing": {
            ms: num(icon.ms, 0.5, HAND_WRITING_RANGES.ms[0], HAND_WRITING_RANGES.ms[1]),
            blob: BLOB_MODES.includes(icon.blob) ? icon.blob : "auto",
            seed: seedOf(icon.seed) ?? index + 1,
          },
        },
      };
    }),
  };
}

export const handWriting = {
  id: "hand-writing",
  version: HAND_WRITING_ENGINE_VERSION,
  label: "Hand-writing",
  canvas: 24,
  supports: {
    mod: true,
    deco: false,
    builtinMains: false,
    perItemColor: false,
    maxColors: 3,
  },
  defaults: { ...HAND_WRITING_DEFAULTS },
  normStyle,
  adapt,
  compose,
  axes,
  signature,
  flags,
};
