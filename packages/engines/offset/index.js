// @ts-check
/**
 * @module engines/offset
 * Gaya offset: garis tinta di atas lapisan warna yang digeser. Port dari
 * `legacy/style/offset-composer-v1.0.1.html` (`compose`, `closed`, `splitParts`, `areaOf`)
 * ke kontrak mesin (docs/ENGINE-CONTRACT.md, docs/engines/offset.md).
 *
 * Perbedaan dengan legacy:
 * - Kanvas asli 120 dinormalisasi ke 48 (faktor 0,4). Keluaran selalu `viewBox="0 0 48 48"`.
 * - Objek 84% kanvas (`size` 100,8, ADR-012). Geser isi dan tebal garis ikut dikalikan 100,8 / 72,
 *   sehingga objek identik dengan legacy yang diskalakan.
 * - Objek di tengah kanvas (legacy menaikkan objek 6 unit untuk garis tanah).
 * - Dekorasi diperkecil dan ditaruh di sudut kosong supaya tetap di dalam viewBox.
 * - Deteksi bidang tertutup dan luas memakai geometri murni (`geometry.js`), bukan DOM.
 */
import { r3 } from "@icon-studio/core";
import { concept } from "@icon-studio/icon-sources";
import { partBox, samplePath, touches, unionBox } from "./geometry.js";

/** @typedef {import("./geometry.js").Box} Box */
/** @typedef {import("./geometry.js").Part} Part */
/** @typedef {{tick: boolean, tickPos: "TR" | "TL", ground: boolean, cloud: boolean, grass: boolean}} OffsetDeco */
/** @typedef {{mode: "solid" | "white" | "line", acc: string, ink: string, dx: number, dy: number, sw: number, size: number}} OffsetStyle */

export const OFFSET_ENGINE_VERSION = "1.1.0";

/** Sisi kanvas asli legacy. */
const CANVAS = 120;
/** Faktor kanvas 120 → 48. */
const K48 = 48 / CANVAS;
/** Sisi objek legacy (60% kanvas). */
const LEGACY_SIZE = 72;
/** Sisi objek offset (84% kanvas, sama dengan classic). */
export const OFFSET_SIZE = 100.8;
/** Celah knockout dekorasi, sama dengan `gap` classic. */
const DECO_GAP = 2;

/** Patokan gaya offset. `dx`, `dy`, dan `sw` memakai satuan legacy (kanvas 120, objek 72). */
export const OFFSET_DEFAULTS = Object.freeze({
  mode: "solid",
  acc: "#B8405A",
  ink: "#1A1A1A",
  dx: 4,
  dy: 4,
  sw: 2.6,
  size: OFFSET_SIZE,
});

/** Dekorasi bawaan per item (DEF legacy: kilat kanan atas + garis tanah). */
export const OFFSET_DECO_DEFAULTS = Object.freeze({
  tick: true,
  tickPos: "TR",
  ground: true,
  cloud: false,
  grass: false,
});

/** Kombinasi dekorasi yang disetujui (sumbu `decoSet`). */
export const DECO_SETS = [
  "tick",
  "tick+ground",
  "ground",
  "cloud+ground",
  "grass+ground",
  "tick+cloud",
];

/** Rentang nilai gaya (slider legacy). */
export const OFFSET_RANGES = Object.freeze({
  dx: [-8, 8, 0.5],
  dy: [-8, 8, 0.5],
  sw: [1.5, 4, 0.1],
});

const KEEP = [
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "width",
  "height",
  "points",
  "x1",
  "y1",
  "x2",
  "y2",
];
const HEX = /^#[0-9a-f]{6}$/i;
const LIB = /^(lu|tb|hg|cu):/;

const emptySvg = (/** @type {number | string} */ size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"></svg>`;

/** Markup satu bagian dengan atribut geometri saja (partStr legacy). @param {Part} part */
export function partStr([tag, a]) {
  const at = KEEP.filter((k) => a[k] != null)
    .map((k) => `${k}="${String(a[k]).replace(/"/g, "&quot;")}"`)
    .join(" ");
  return `<${tag} ${at}/>`;
}

/**
 * Pecah path ber-sub-path (`M…M…`) menjadi bagian terpisah dan buang kotak latar 24×24 (splitParts legacy).
 * @param {Part[]} node
 * @returns {Part[]}
 */
export function splitParts(node) {
  /** @type {Part[]} */
  const out = [];
  for (const [t, a] of node) {
    if (a.d === "M0 0h24v24H0z") continue;
    if (t === "path" && a.d) {
      const segs = String(a.d).trim().split(/(?=M)/);
      if (segs.length > 1 && segs.every((x) => /^M/.test(x))) {
        segs.forEach((x) => out.push(["path", { ...a, d: x.trim() }]));
        continue;
      }
    }
    out.push([t, a]);
  }
  return out;
}

/**
 * Bagian tertutup: bentuk dasar, path berakhiran Z, atau path yang titik awal dan akhirnya berjarak < 0,6 (closed legacy).
 * @param {Part} part
 */
export function isClosedPart([t, a]) {
  if (a.d === "M0 0h24v24H0z") return false;
  if (["circle", "rect", "ellipse", "polygon"].includes(t)) return true;
  if (t !== "path") return false;
  const d = String(a.d || "");
  if (/[zZ]\s*$/.test(d)) return true;
  const s = samplePath(d);
  return !!(
    s.start &&
    s.end &&
    s.length > 1 &&
    Math.hypot(s.start[0] - s.end[0], s.start[1] - s.end[1]) < 0.6
  );
}

/** Luas kotak pembatas satu bagian (areaOf legacy). @param {Part} part */
export const areaOf = (part) => {
  const b = partBox(part);
  return b.w * b.h;
};

/**
 * Analisis node ikon: bagian, bagian tertutup, body (bagian tertutup dengan kotak terbesar), dan detail dalam.
 * @param {Part[]} node
 */
export function analyzeOffset(node) {
  const parts = splitParts(node || []);
  const closed = parts.filter(isClosedPart);
  let body = /** @type {Part | null} */ (null);
  if (closed.length)
    body = closed.reduce((m, p) => (areaOf(p) > areaOf(m) ? p : m));
  return { parts, closed, body, inner: closed.filter((p) => p !== body) };
}

/* ---------- gaya dan item ---------- */

/** @param {any} v @param {number} dflt @param {number} min @param {number} max */
const num = (v, dflt, min, max) =>
  v !== "" && v != null && Number.isFinite(+v)
    ? Math.max(min, Math.min(max, +v))
    : dflt;

/**
 * Parameter gaya offset yang sudah dibatasi. Menerima gaya set (dibaca dari `style.engine.offset`,
 * field classic seperti `sw` diabaikan) atau objek parameter offset langsung.
 * @param {any} [raw]
 * @returns {OffsetStyle}
 */
export function offsetParams(raw = {}) {
  raw = raw || {};
  const isSetStyle = "family" in raw || "engine" in raw;
  const e = (isSetStyle ? raw.engine && raw.engine.offset : raw) || {};
  const d = OFFSET_DEFAULTS;
  return {
    mode: ["solid", "white", "line"].includes(e.mode) ? e.mode : d.mode,
    acc: HEX.test(e.acc || "") ? String(e.acc).toUpperCase() : d.acc,
    ink: HEX.test(e.ink || "") ? String(e.ink).toUpperCase() : d.ink,
    dx: num(e.dx, d.dx, OFFSET_RANGES.dx[0], OFFSET_RANGES.dx[1]),
    dy: num(e.dy, d.dy, OFFSET_RANGES.dy[0], OFFSET_RANGES.dy[1]),
    sw: num(e.sw, d.sw, OFFSET_RANGES.sw[0], OFFSET_RANGES.sw[1]),
    size: OFFSET_SIZE,
  };
}

/**
 * Dekorasi offset satu item (`item.engine.offset.deco`), diisi bawaan bila belum ada.
 * @param {any} it
 * @returns {OffsetDeco}
 */
export function offsetDeco(it) {
  const d =
    (it && it.engine && it.engine.offset && it.engine.offset.deco) || {};
  const b = OFFSET_DECO_DEFAULTS;
  return {
    tick: typeof d.tick === "boolean" ? d.tick : b.tick,
    tickPos: d.tickPos === "TL" ? "TL" : "TR",
    ground: typeof d.ground === "boolean" ? d.ground : b.ground,
    cloud: typeof d.cloud === "boolean" ? d.cloud : b.cloud,
    grass: typeof d.grass === "boolean" ? d.grass : b.grass,
  };
}

/**
 * Isi `style.engine.offset` dengan nilai yang sah. Field classic/accent tidak disentuh.
 * @param {any} [style]
 */
function normStyle(style = {}) {
  return {
    ...style,
    family: "offset",
    engine: { ...(style.engine || {}), offset: offsetParams(style) },
  };
}

/**
 * Item kanonik → parameter mesin. Node ikon diambil lewat `ctx.nodeOf` saat compose.
 * @param {any} it
 */
function adapt(it) {
  return {
    main: it && it.main,
    node: (it && it.node) || null,
    deco: offsetDeco(it),
    vis: { main: true, deco: true, ...((it && it.vis) || {}) },
  };
}

/* ---------- tata letak (satuan kanvas 48) ---------- */

/**
 * Ukuran turunan untuk satu gaya, semua dalam satuan 48.
 * @param {OffsetStyle} S
 */
function metrics(S) {
  const ratio = S.size / LEGACY_SIZE;
  const k = (S.size / 24) * K48;
  const o = ((CANVAS - S.size) / 2) * K48;
  /* tebal garis dalam satuan ikon 24: sama dengan legacy (sw / (72 / 24)) */
  const swIcon = (S.sw * ratio) / (S.size / 24);
  return {
    k,
    o,
    dx: S.dx * ratio * K48,
    dy: S.dy * ratio * K48,
    swIcon,
    sw: swIcon * k,
  };
}

/** @param {Box} b @param {number} k @param {number} tx @param {number} ty @param {number} pad */
const place = (b, k, tx, ty, pad) => ({
  x: tx + b.x * k - pad,
  y: ty + b.y * k - pad,
  w: b.w * k + 2 * pad,
  h: b.h * k + 2 * pad,
});

/**
 * Kotak isi objek (garis + lapisan warna) dalam satuan 48.
 * @param {ReturnType<typeof analyzeOffset>} A
 * @param {OffsetStyle} S
 */
function objectBox(A, S) {
  const m = metrics(S);
  const boxes = A.parts.map((p) => place(partBox(p), m.k, m.o, m.o, m.sw / 2));
  const fill = S.mode === "solid" ? A.closed : A.body ? [A.body] : [];
  for (const p of fill)
    boxes.push(place(partBox(p), m.k, m.o + m.dx, m.o + m.dy, 0));
  return unionBox(boxes);
}

/**
 * Geometri dekorasi: daftar path `{d, w}` (w = tebal garis) dalam satuan 48.
 * @param {OffsetDeco} D
 * @param {OffsetStyle} S
 * @param {Box | null} obj kotak objek (untuk lebar garis tanah)
 */
function decoPaths(D, S, obj) {
  const m = metrics(S);
  const s = 0.7 * K48; // kilat dan awan diperkecil 0,7×
  const f = (/** @type {number} */ v) => r3(v);
  /** @type {{d: string, w: number, box: Box}[]} */
  const out = [];
  const half = m.sw / 2;
  if (D.tick) {
    /* kilat legacy: M0 6 l6 -6 M3 16 l8 -2, di sudut atas */
    const r = D.tickPos === "TR";
    const x = r ? 48 - 1.6 - 11 * s : 1.6 + 11 * s,
      y = 1.6,
      sg = r ? 1 : -1;
    const x0 = x;
    const d = `M${f(x0)} ${f(y + 6 * s)}l${f(6 * s * sg)} ${f(-6 * s)}M${f(x0 + 3 * s * sg)} ${f(y + 16 * s)}l${f(8 * s * sg)} ${f(-2 * s)}`;
    const xs = [x0, x0 + 6 * s * sg, x0 + 3 * s * sg, x0 + 11 * s * sg];
    out.push({
      d,
      w: m.sw,
      box: {
        x: Math.min(...xs) - half,
        y: y - half,
        w: 11 * s + 2 * half,
        h: 16 * s + 2 * half,
      },
    });
  }
  const gy = 46;
  const span = obj
    ? [Math.max(1.6, obj.x - 2), Math.min(46.4, obj.x + obj.w + 2)]
    : [1.84, 46.16];
  if (D.ground)
    out.push({
      d: `M${f(span[0])} ${gy}H${f(span[1])}`,
      w: m.sw,
      box: {
        x: span[0] - half,
        y: gy - half,
        w: span[1] - span[0] + 2 * half,
        h: 2 * half,
      },
    });
  if (D.grass) {
    /* rumput legacy: l3 -6 2 6 di ujung kiri dan l2 -5 2 5 di ujung kanan garis tanah */
    const g = K48;
    const xl = span[0] + 0.4,
      xr = span[1] - 4 * g - 0.4;
    out.push({
      d: `M${f(xl)} ${gy}l${f(3 * g)} ${f(-6 * g)} ${f(2 * g)} ${f(6 * g)}M${f(xr)} ${gy}l${f(2 * g)} ${f(-5 * g)} ${f(2 * g)} ${f(5 * g)}`,
      w: m.sw,
      box: {
        x: xl - half,
        y: gy - 6 * g - half,
        w: xr + 4 * g - xl + 2 * half,
        h: 6 * g + 2 * half,
      },
    });
  }
  if (D.cloud) {
    /* awan legacy: c0-6 8-6 9-2 3-4 10-2 9 3h-18z, di sudut atas yang tidak dipakai kilat */
    const w = m.sw * 0.8,
      hw = w / 2;
    const left = D.tickPos === "TR" || !D.tick;
    const cx = left ? 1.6 + hw : 48 - 1.6 - hw - 18 * s,
      cy = 1.6 + hw + 4.8 * s;
    const d = `M${f(cx)} ${f(cy)}c0 ${f(-6 * s)} ${f(8 * s)} ${f(-6 * s)} ${f(9 * s)} ${f(-2 * s)} ${f(3 * s)} ${f(-4 * s)} ${f(10 * s)} ${f(-2 * s)} ${f(9 * s)} ${f(3 * s)}h${f(-18 * s)}z`;
    out.push({
      d,
      w,
      box: { x: cx - hw, y: cy - 4.8 * s - hw, w: 18 * s + w, h: 5.8 * s + w },
    });
  }
  return out;
}

/**
 * Kotak tiap lapisan dalam satuan 48, untuk wilayah klik editor dan cek tepi viewBox.
 * @param {any} it item kanonik
 * @param {any} style gaya set
 * @param {{nodeOf?: (key: string) => any}} [ctx]
 * @returns {{main: Box, mod: Box, deco: Box}}
 */
export function boxesOffset(it, style, ctx = {}) {
  const S = offsetParams(style),
    p = adapt(it),
    z = { x: 0, y: 0, w: 0, h: 0 };
  const node =
    p.node ||
    (ctx.nodeOf && LIB.test(String(p.main)) ? ctx.nodeOf(p.main) : null);
  const A = analyzeOffset(Array.isArray(node) ? node : []);
  const obj = A.parts.length ? objectBox(A, S) : null;
  const deco = p.vis.deco
    ? unionBox(decoPaths(p.deco, S, obj).map((x) => x.box))
    : null;
  return { main: p.vis.main && obj ? obj : z, mod: z, deco: deco || z };
}

/* ---------- compose ---------- */

/**
 * Render satu ikon offset.
 * @param {any} params hasil `adapt` (atau item kanonik)
 * @param {any} style gaya set (`style.engine.offset`) atau parameter offset langsung
 * @param {{size?: number | string, mode?: "mask" | "white", idp?: string, deco?: boolean, back?: "white" | null, ctx?: {nodeOf?: (key: string) => any}}} [opt]
 */
function compose(params = {}, style = {}, opt = {}) {
  const p = params && params.deco && params.vis ? params : adapt(params);
  const key = String(p.main || "");
  const node =
    p.node ||
    (opt.ctx && opt.ctx.nodeOf && LIB.test(key) ? opt.ctx.nodeOf(key) : null);
  if (!Array.isArray(node) || !node.length) return emptySvg(opt.size);
  const S = offsetParams(style);
  const A = analyzeOffset(node);
  if (!A.parts.length) return emptySvg(opt.size);
  const m = metrics(S);
  const idp = opt.idp || "o";
  const maskMode = opt.mode !== "white";
  const T = (/** @type {number} */ x, /** @type {number} */ y) =>
    `translate(${r3(m.o + x)} ${r3(m.o + y)}) scale(${r3(m.k)})`;
  const list = (/** @type {Part[]} */ ps) => ps.map(partStr).join("");

  const obj = objectBox(A, S);
  const decos =
    opt.deco !== false && p.vis.deco ? decoPaths(p.deco, S, obj) : [];
  /* dekorasi yang menyentuh objek diberi celah knockout selebar gap classic */
  const cut = p.vis.main && obj ? decos.filter((x) => touches(x.box, obj)) : [];
  const cutStrokes = (/** @type {string} */ color) =>
    cut
      .map(
        (x) =>
          `<path d="${x.d}" fill="none" stroke="${color}" stroke-width="${r3(x.w + 2 * DECO_GAP)}" stroke-linecap="round" stroke-linejoin="round"/>`,
      )
      .join("");

  const defs = [];
  /** @param {string} id @param {string} inner */
  const addMask = (id, inner) =>
    defs.push(
      `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><rect x="0" y="0" width="48" height="48" fill="#FFFFFF"/>${inner}</mask>`,
    );
  const koId = `${idp}ko`,
    wbId = `${idp}wb`;
  if (maskMode && cut.length) addMask(koId, cutStrokes("#000"));
  /* mask dipasang di pembungkus tanpa transform, supaya userSpaceOnUse tetap kanvas 48 */
  const masked = (
    /** @type {string | null} */ id,
    /** @type {string} */ inner,
  ) => (id ? `<g mask="url(#${id})">${inner}</g>` : inner);
  const ko = maskMode && cut.length ? koId : null;

  let out = "";
  if (p.vis.main) {
    if (S.mode === "solid" && A.closed.length)
      out += masked(
        ko,
        `<g transform="${T(m.dx, m.dy)}" fill="${S.acc}">${list(A.closed)}</g>`,
      );
    if (S.mode === "white" && A.body) {
      /* mode mask: lapisan aksen dipotong siluet body, supaya direct fill tidak bergantung urutan tumpukan */
      if (maskMode) {
        addMask(
          wbId,
          `<g transform="${T(0, 0)}" fill="#000">${partStr(A.body)}</g>${cutStrokes("#000")}`,
        );
        out += masked(
          wbId,
          `<g transform="${T(m.dx, m.dy)}" fill="${S.acc}">${partStr(A.body)}</g>`,
        );
      } else
        out += `<g transform="${T(m.dx, m.dy)}" fill="${S.acc}">${partStr(A.body)}</g>`;
      out += masked(
        ko,
        `<g transform="${T(0, 0)}" fill="#FFFFFF">${partStr(A.body)}</g>`,
      );
      if (A.inner.length)
        out += masked(
          ko,
          `<g transform="${T(m.dx * 0.6, m.dy * 0.6)}" fill="${S.acc}">${list(A.inner)}</g>`,
        );
    }
    if (S.mode === "line" && A.body)
      out += masked(
        ko,
        `<g transform="${T(m.dx, m.dy)}" fill="${S.acc}">${partStr(A.body)}</g>`,
      );
    out += masked(
      ko,
      `<g transform="${T(0, 0)}" fill="none" stroke="${S.ink}" stroke-width="${m.swIcon.toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${list(A.parts)}</g>`,
    );
  }
  if (!maskMode && cut.length) out += cutStrokes("#FFFFFF");
  for (const x of decos)
    out += `<path d="${x.d}" fill="none" stroke="${S.ink}" stroke-width="${r3(x.w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const back =
    opt.back === "white"
      ? `<rect x="0" y="0" width="48" height="48" fill="#FFFFFF"/>`
      : "";
  const size = opt.size || 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">${defs.length ? `<defs>${defs.join("")}</defs>` : ""}${back}${out}</svg>`;
}

/* ---------- sumbu, signature, flag ---------- */

/** @param {any} it */
function axes(it) {
  return [
    {
      id: "tickPos",
      values: ["TR", "TL"],
      blockedBy: (/** @type {any} */ x) => !offsetDeco(x || it).tick,
    },
    { id: "decoSet", values: [...DECO_SETS] },
  ];
}

/** @param {any} it */
const signature = (it) =>
  `offset|${concept(String((it && it.main) || ""))}|-|-`;

/**
 * Flag khusus offset. `ctx.nodeOf` dipakai untuk memeriksa bidang tertutup.
 * @param {any} it
 * @param {any} [_style]
 * @param {{nodeOf?: (key: string) => any}} [ctx]
 * @returns {[("err" | "warn" | "info"), string][]}
 */
function flags(it, _style, ctx = {}) {
  /** @type {[("err" | "warn" | "info"), string][]} */
  const out = [];
  const key = String((it && it.main) || "");
  if (!LIB.test(key))
    out.push(["err", "Objek bawaan tidak didukung gaya Offset"]);
  else {
    const node = (it && it.node) || (ctx.nodeOf ? ctx.nodeOf(key) : null);
    if (Array.isArray(node) && !analyzeOffset(node).closed.length)
      out.push([
        "warn",
        "Tanpa bidang tertutup: isi warna offset tidak muncul",
      ]);
  }
  if (it && it.mod && it.mod !== "none")
    out.push(["info", "Pengubah tidak tersedia pada style ini"]);
  return out;
}

export const offset = {
  id: "offset",
  version: OFFSET_ENGINE_VERSION,
  label: "Offset",
  canvas: CANVAS,
  supports: {
    mod: false,
    deco: true,
    builtinMains: false,
    perItemColor: false,
    maxColors: 3,
  },
  defaults: { ...OFFSET_DEFAULTS },
  normStyle,
  adapt,
  compose,
  axes,
  signature,
  flags,
};
