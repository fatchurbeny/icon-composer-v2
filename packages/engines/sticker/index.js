// @ts-check
/**
 * @module engines/sticker
 * Gaya sticker: halo putih, isi warna yang digeser, dan garis tinta, ditambah dekorasi sinar, sparkle,
 * dan ikal. Port dari `legacy/style/sticker-composer.html` (`layer`, `deco`, `compose`, `shapes`) ke kontrak
 * mesin (docs/ENGINE-CONTRACT.md, docs/engines/sticker.md).
 *
 * Perbedaan dengan legacy:
 * - Kanvas asli 64 dinormalisasi ke 48 (faktor 0,75). Keluaran selalu `viewBox="0 0 48 48"`, geometri
 *   tetap dihitung di satuan 64 legacy lalu diskalakan di transform, jadi gambarnya sama.
 * - Pengubah memakai 4 slot (8 slot kanonik dipetakan: TC→TR, ML→TL, MR→TR, BC→BR).
 * - Bentuk isi dari `ctx.fillShapeOf` (fill-shapes.json). Ikon tanpa bentuk isi memakai `plate`
 *   (legacy mengisi garis outline-nya sendiri).
 * - Mode `mask` (bawaan, ekspor) memotong setiap lapisan bawah dengan siluet lapisan di atasnya lewat
 *   `<mask>`, sehingga direct fill (satu path per warna) tidak bergantung urutan tumpukan. Mode `white`
 *   menggambar berurutan persis seperti legacy (pratinjau ringan).
 * - Posisi kanonik `mx/my` dan `nx/ny` dalam satuan 48, dikonversi ke 64 (÷0,75).
 */
import { hash, rng } from "@icon-studio/core";
import { concept } from "@icon-studio/icon-sources";

export const STICKER_ENGINE_VERSION = "1.1.0";

/** Sisi kanvas asli legacy. */
const CANVAS = 64;
/** Faktor kanvas 64 → 48. */
const K = 48 / CANVAS;

/** Palet isi objek dan pengubah (PALETTE legacy). */
export const STICKER_PALETTE = Object.freeze([
  "#E5484D",
  "#5AA9F8",
  "#6BD88A",
  "#F9D84A",
  "#F09A3E",
  "#C08A6B",
  "#4A9A78",
  "#B58BEA",
  "#FFFFFF",
]);
/** Palet tinta (INKS legacy). */
export const STICKER_INKS = Object.freeze([
  "#17171B",
  "#2B3A67",
  "#5A2E1F",
  "#FFFFFF",
]);
/** Warna halo putih (juga warna ke-4 di batas Canva). */
export const STICKER_HALO = "#FFFFFF";
const WHITE = STICKER_HALO;
/** Isi pengubah bawaan (kuning legacy). */
export const STICKER_MOD_FILL = "#F9D84A";

/** Patokan gaya set (DEFAULT_STYLE legacy). */
export const STICKER_DEFAULTS = Object.freeze({
  mode: "sticker",
  sw: 2.4,
  halo: 3.25,
  off: 1,
  spk: 3,
  rays: true,
  curl: true,
  ink: "#17171B",
});

/** Rentang nilai gaya dan item (slider legacy): [min, max, langkah]. */
export const STICKER_RANGES = Object.freeze({
  sw: [1.4, 3.6, 0.1],
  halo: [0, 5, 0.25],
  off: [0, 2.5, 0.1],
  spk: [0, 6, 1],
  mainS: [1.2, 2.3, 0.05],
  modS: [0.5, 1.4, 0.05],
  decoS: [0.6, 1.3, 0.02],
  seed: [1, 60, 1],
});

/** Pusat 4 slot pengubah di kanvas 64 (SLOTS legacy). */
export const STICKER_SLOTS = Object.freeze({
  TL: [17, 17],
  TR: [47, 17],
  BL: [17, 47],
  BR: [47, 47],
});
/** Arah slot dari pusat, untuk menghindari dekorasi di dekat pengubah (SLOT_ANG legacy). */
const SLOT_ANG = { TR: -45, BR: 45, BL: 135, TL: -135 };
/** Pemetaan 8 slot kanonik ke 4 sudut sticker (ENGINE-CONTRACT bagian 3). */
export const SLOT_MAP = Object.freeze({
  TL: "TL",
  TC: "TR",
  TR: "TR",
  ML: "TL",
  MR: "TR",
  BL: "BL",
  BC: "BR",
  BR: "BR",
});

/** Bintang 4 sudut sparkle (STAR legacy). */
export const STAR =
  "M0 -1C.12 -.2 .2 -.12 1 0C.2 .12 .12 .2 0 1C-.12 .2 -.2 .12 -1 0C-.2 -.12 -.12 -.2 0 -1Z";
const CURL = "M-1.2 -3.2C-3 -1.2 1.6 .4 1.2 -1.4C.8 -3.4 -2.6 -.4 -1 3";
const PLATE = `<circle cx="12" cy="12" r="10.5"/>`;

/** Nilai sumbu variasi (docs/engines/sticker.md bagian "Sumbu variasi"). */
export const RAY_DIAGS = [-45, 45, 135, -135];
export const CURL_SIDES = ["TL", "TR", "BL", "BR"];
export const SPARK_PATTERNS = ["SSO", "SOO", "SOS", "OSS"];
/** Pasangan warna [isi objek, isi pengubah] dari 8 warna pertama palet, untuk sumbu `colorPair`. */
export const COLOR_PAIRS = STICKER_PALETTE.slice(0, 8).flatMap((a, i) =>
  STICKER_PALETTE.slice(0, 8)
    .filter((_, j) => j !== i)
    .map((b) => [a, b]),
);

const HEX = /^#[0-9a-f]{6}$/i;
const LIB = /^(lu|tb|hg|cu):/;
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

/** Pembulatan 2 desimal seperti legacy (r2). @param {number} v */
const r2 = (v) => Math.round(v * 100) / 100;
/** Pembulatan 4 desimal untuk nilai yang sudah diskalakan ke 48. @param {number} v */
const r4 = (v) => Math.round(v * 10000) / 10000;

/** @param {any} v @param {number} dflt @param {number} min @param {number} max */
const num = (v, dflt, min, max) =>
  v !== "" && v != null && Number.isFinite(+v)
    ? Math.max(min, Math.min(max, +v))
    : dflt;
/** @param {any} v @param {string} dflt */
const hex = (v, dflt) => (HEX.test(v || "") ? String(v).toUpperCase() : dflt);

const emptySvg = (/** @type {number | string} */ size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"></svg>`;

/** @typedef {{mode: "sticker" | "fill" | "line", sw: number, halo: number, off: number, spk: number, rays: boolean, curl: boolean, ink: string}} StickerStyle */
/** @typedef {{c: string, s: number, fill: "auto" | "plate" | "none"}} StickerMain */
/** @typedef {{c: string, s: number}} StickerMod */
/** @typedef {{seed: number, s: number, x: number, y: number}} StickerDeco */
/** @typedef {{rayDiag?: number, curlSide?: string, sparkPattern?: string, colorPair?: number}} StickerVar */

/**
 * Parameter gaya sticker yang sudah dibatasi. Menerima gaya set (dibaca dari `style.engine.sticker`)
 * atau objek parameter sticker langsung.
 * @param {any} [raw]
 * @returns {StickerStyle}
 */
export function stickerParams(raw = {}) {
  raw = raw || {};
  const isSetStyle = "family" in raw || "engine" in raw;
  const e = (isSetStyle ? raw.engine && raw.engine.sticker : raw) || {};
  const d = STICKER_DEFAULTS,
    R = STICKER_RANGES;
  return {
    mode: ["sticker", "fill", "line"].includes(e.mode) ? e.mode : d.mode,
    sw: num(e.sw, d.sw, R.sw[0], R.sw[1]),
    halo: num(e.halo, d.halo, R.halo[0], R.halo[1]),
    off: num(e.off, d.off, R.off[0], R.off[1]),
    spk: Math.round(num(e.spk, d.spk, R.spk[0], R.spk[1])),
    rays: typeof e.rays === "boolean" ? e.rays : d.rays,
    curl: typeof e.curl === "boolean" ? e.curl : d.curl,
    ink: hex(e.ink, d.ink),
  };
}

/**
 * Warna bawaan item yang belum punya `engine.sticker`: isi objek dari palet menurut kunci objek,
 * isi pengubah kuning, digeser +3 di palet bila sama dengan isi objek (aturan comboItem legacy).
 * @param {string} main
 */
export function defaultColors(main) {
  const i = hash(concept(String(main || ""))) % 8;
  const c = STICKER_PALETTE[i];
  const mod = c === STICKER_MOD_FILL ? STICKER_PALETTE[(i + 3) % 8] : STICKER_MOD_FILL;
  return { main: c, mod };
}

/**
 * Data sticker satu item (`item.engine.sticker`), diisi bawaan bila belum ada.
 * @param {any} it
 * @returns {{main: StickerMain, mod: StickerMod, deco: StickerDeco, seed: number, var: StickerVar}}
 */
export function stickerItem(it) {
  const e = (it && it.engine && it.engine.sticker) || {};
  const m = e.main || {},
    d = e.mod || {},
    dc = e.deco || {},
    R = STICKER_RANGES;
  const dflt = defaultColors(it && it.main);
  const seed = Math.round(
    num(
      dc.seed ?? e.seed,
      3 + (hash(String((it && it.id) || (it && it.main) || "")) % 50),
      R.seed[0],
      R.seed[1],
    ),
  );
  const v = e.var && typeof e.var === "object" ? e.var : {};
  return {
    main: {
      c: hex(m.c, dflt.main),
      s: num(m.s, 1.8, R.mainS[0], R.mainS[1]),
      fill: ["auto", "plate", "none"].includes(m.fill) ? m.fill : "auto",
    },
    mod: { c: hex(d.c, dflt.mod), s: num(d.s, 0.9, R.modS[0], R.modS[1]) },
    deco: {
      seed,
      s: num(dc.s, 1, R.decoS[0], R.decoS[1]),
      x: num(dc.x, 0, -8, 8),
      y: num(dc.y, 0, -8, 8),
    },
    seed,
    var: {
      ...(RAY_DIAGS.includes(v.rayDiag) ? { rayDiag: v.rayDiag } : {}),
      ...(CURL_SIDES.includes(v.curlSide) ? { curlSide: v.curlSide } : {}),
      ...(SPARK_PATTERNS.includes(v.sparkPattern)
        ? { sparkPattern: v.sparkPattern }
        : {}),
      ...(Number.isInteger(v.colorPair) &&
      v.colorPair >= 0 &&
      v.colorPair < COLOR_PAIRS.length
        ? { colorPair: v.colorPair }
        : {}),
    },
  };
}

/** Slot 8 kanonik → 4 sudut sticker. @param {any} slot */
export const slot4 = (slot) =>
  /** @type {"TL" | "TR" | "BL" | "BR"} */ (
    /** @type {Record<string, string>} */ (SLOT_MAP)[slot] || "TR"
  );

/** @param {any} key */
const hasMod = (key) => !!key && key !== "none";

/**
 * Item kanonik → parameter mesin (satuan 64 legacy).
 * @param {any} it
 */
function adapt(it) {
  it = it || {};
  const e = stickerItem(it);
  const vis = { main: true, mod: true, deco: true, ...(it.vis || {}) };
  const pair = e.var.colorPair != null ? COLOR_PAIRS[e.var.colorPair] : null;
  return {
    main: {
      k: String(it.main || ""),
      c: pair ? pair[0] : e.main.c,
      s: e.main.s,
      x: (+it.mx || 0) / K,
      y: (+it.my || 0) / K,
      fill: e.main.fill,
    },
    mod: {
      k: hasMod(it.mod) ? String(it.mod) : null,
      c: pair ? pair[1] : e.mod.c,
      s: e.mod.s,
      slot: slot4(it.slot),
      x: (+it.nx || 0) / K,
      y: (+it.ny || 0) / K,
    },
    deco: e.deco,
    var: e.var,
    vis: { main: !!vis.main, mod: !!vis.mod, deco: !!vis.deco },
  };
}

/**
 * Isi `style.engine.sticker` dengan nilai yang sah. Field classic/accent tidak disentuh.
 * @param {any} [style]
 */
function normStyle(style = {}) {
  return {
    ...style,
    family: "sticker",
    engine: { ...(style.engine || {}), sticker: stickerParams(style) },
  };
}

/* ---------- bentuk ---------- */

/** @param {[string, Record<string, any>]} part */
function partStr([tag, a]) {
  const at = KEEP.filter((k) => a && a[k] != null)
    .map((k) => `${k}="${String(a[k]).replace(/"/g, "&quot;")}"`)
    .join(" ");
  return `<${tag} ${at}/>`;
}

/**
 * Markup outline dan bentuk isi satu kunci ikon (shapes legacy). `f` kosong bila tidak ada bentuk isi.
 * @param {string | null} key
 * @param {{nodeOf?: (key: string) => any, fillShapeOf?: (key: string) => string}} ctx
 * @returns {{o: string, f: string} | null}
 */
export function stickerShapes(key, ctx) {
  if (!key || !LIB.test(key) || !ctx.nodeOf) return null;
  const node = ctx.nodeOf(key);
  if (!Array.isArray(node) || !node.length) return null;
  const parts = node.filter(
    ([t, a]) =>
      t &&
      a &&
      a.d !== "M0 0h24v24H0z" &&
      ["path", "circle", "rect", "ellipse", "line", "polyline", "polygon"].includes(t),
  );
  if (!parts.length) return null;
  return {
    o: parts.map(partStr).join(""),
    f: (ctx.fillShapeOf && ctx.fillShapeOf(key)) || "",
  };
}

/* ---------- lapisan dan dekorasi (satuan 64) ---------- */

/** Transform lapisan di kanvas 48 (T legacy dikalikan 0,75). @param {number} cx @param {number} cy @param {number} sc */
const layerT = (cx, cy, sc) =>
  `translate(${r4(r2(cx) * K)} ${r4(r2(cy) * K)}) scale(${r4(r2(sc) * K)}) translate(-12 -12)`;

/**
 * Bagian satu lapisan: halo, isi, tinta (layer legacy), masing-masing sebagai markup grup.
 * `paint` memberi warna; dipakai juga untuk siluet hitam di dalam mask.
 * @param {{k: string, c: string, s: number, fill: string}} L
 * @param {{o: string, f: string}} sh
 * @param {number} cx
 * @param {number} cy
 * @param {boolean} isMod
 * @param {StickerStyle} S
 */
function layerParts(L, sh, cx, cy, isMod, S) {
  const sc = L.s,
    T = layerT(cx, cy, sc);
  const fill =
    L.fill === "plate" ? PLATE : L.fill === "none" ? "" : sh.f || PLATE;
  const haloW = isMod ? Math.max(S.halo, 1.6) : S.mode === "sticker" ? S.halo : 0;
  const offT = `translate(${r4(-r2(S.off) * K)} ${r4(r2(S.off) * K)}) ${T}`;
  return {
    halo:
      haloW > 0
        ? (/** @type {string} */ c) =>
            `<g transform="${T}" fill="${c}" stroke="${c}" stroke-width="${r2((S.sw + haloW * 2) / sc)}">${fill}${sh.o}</g>`
        : null,
    fill:
      S.mode !== "line" && fill
        ? (/** @type {string} */ c) =>
            `<g transform="${offT}" fill="${c}" stroke="none">${fill}</g>`
        : null,
    ink: (/** @type {string} */ c) =>
      `<g transform="${T}" fill="none" stroke="${c}" stroke-width="${r2(S.sw / sc)}">${sh.o}</g>`,
    color: L.c,
  };
}

/**
 * Elemen dekorasi di kanvas 64 (deco legacy). Sudut halus dari `seed`; sumbu variasi (`var`) membatasi
 * diagonal sinar, kuadran ikal, dan pola solid sparkle bila diisi planner.
 * @param {ReturnType<typeof adapt>} p
 * @param {StickerStyle} S
 * @returns {{markup: (c: string) => string} | null}
 */
function decoParts(p, S) {
  const R = rng(p.deco.seed);
  /** @type {((c: string) => string)[]} */
  const out = [];
  const block = p.mod.k ? SLOT_ANG[p.mod.slot] : null;
  const free = (/** @type {number} */ a) =>
    block === null || Math.abs(((a - block + 540) % 360) - 180) > 42;
  const pick = () => {
    for (let i = 0; i < 30; i++) {
      const a = R() * 360 - 180;
      if (free(a)) return a;
    }
    return 180;
  };
  const at = (/** @type {number} */ a, /** @type {number} */ r) => [
    32 + Math.cos((a * Math.PI) / 180) * r,
    32 + Math.sin((a * Math.PI) / 180) * r,
  ];
  if (S.rays) {
    const opts = RAY_DIAGS.filter(free);
    const roll = opts[Math.floor(R() * opts.length)] ?? -90;
    const a =
      p.var.rayDiag != null && free(p.var.rayDiag) ? p.var.rayDiag : roll;
    [-14, 0, 14].forEach((o, i) => {
      const [x1, y1] = at(a + o, 25.5),
        [x2, y2] = at(a + o, i === 1 ? 30.5 : 29);
      out.push(
        () =>
          `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`,
      );
    });
  }
  const pattern = p.var.sparkPattern || null;
  for (let i = 0; i < S.spk; i++) {
    const a = pick(),
      r = 26 + R() * 3,
      s = 1.5 + R() * 1.1,
      roll = R() > 0.45,
      solid = pattern && i < pattern.length ? pattern[i] === "S" : roll,
      [x, y] = at(a, r);
    out.push(
      (c) =>
        `<path transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)})" d="${STAR}" fill="${solid ? c : "none"}" stroke-width="${r2(0.95 / s)}"/>`,
    );
  }
  if (S.curl) {
    let a = pick();
    if (p.var.curlSide) {
      /* kuadran dari sumbu: sudut halus dari seed dipetakan ke kuadran yang diminta */
      const base = { TL: -180, TR: -90, BR: 0, BL: 90 }[p.var.curlSide] ?? -180;
      a = base + 10 + ((((a + 180) % 90) + 90) % 90) * (70 / 90);
    }
    const [x, y] = at(a, 27),
      rot = Math.round(R() * 90 - 45);
    out.push(
      () =>
        `<path transform="translate(${r2(x)} ${r2(y)}) rotate(${rot})" d="${CURL}" fill="none" stroke-width="1"/>`,
    );
  }
  if (!out.length) return null;
  const dc = p.deco;
  const T = `translate(${r4(r2(32 + (dc.x || 0)) * K - 32 * r2(dc.s || 1) * K)} ${r4(r2(32 + (dc.y || 0)) * K - 32 * r2(dc.s || 1) * K)}) scale(${r4(r2(dc.s || 1) * K)})`;
  return {
    markup: (c) =>
      `<g transform="${T}" stroke="${c}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" fill="none">${out.map((f) => f(c)).join("")}</g>`,
  };
}

/* ---------- compose ---------- */

/**
 * Render satu ikon sticker.
 * @param {any} params hasil `adapt` (atau item kanonik)
 * @param {any} style gaya set (`style.engine.sticker`) atau parameter sticker langsung
 * @param {{size?: number | string, mode?: "mask" | "white", idp?: string, deco?: boolean, back?: "white" | null, ctx?: {nodeOf?: (key: string) => any, fillShapeOf?: (key: string) => string}}} [opt]
 */
function compose(params = {}, style = {}, opt = {}) {
  const p = params && params.deco && params.vis && params.var ? params : adapt(params);
  const ctx = opt.ctx || {};
  const size = opt.size || 48;
  const mainSh = stickerShapes(p.main.k, ctx);
  if (!mainSh) return emptySvg(size);
  const S = stickerParams(style);
  const idp = opt.idp || "s";
  const maskMode = opt.mode !== "white";

  const main = p.vis.main
    ? layerParts(p.main, mainSh, 32 + p.main.x, 32 + p.main.y, false, S)
    : null;
  const deco = opt.deco !== false && p.vis.deco ? decoParts(p, S) : null;
  const modSh = p.mod.k && p.vis.mod ? stickerShapes(p.mod.k, ctx) : null;
  const [sx, sy] = STICKER_SLOTS[p.mod.slot] || STICKER_SLOTS.TR;
  const mod = modSh
    ? layerParts(
        { ...p.mod, k: /** @type {string} */ (p.mod.k), fill: "auto" },
        modSh,
        sx + p.mod.x,
        sy + p.mod.y,
        true,
        S,
      )
    : null;

  let body = "";
  const defs = [];
  if (!maskMode) {
    /* urutan legacy: objek (halo, isi, tinta), dekorasi, pengubah */
    if (main) {
      if (main.halo) body += main.halo(WHITE);
      if (main.fill) body += main.fill(main.color);
      body += main.ink(S.ink);
    }
    if (deco) body += deco.markup(S.ink);
    if (mod) {
      if (mod.halo) body += mod.halo(WHITE);
      if (mod.fill) body += mod.fill(mod.color);
      body += mod.ink(S.ink);
    }
  } else {
    /* setiap bagian dipotong siluet semua bagian di atasnya, supaya warna tidak saling tumpuk */
    const B = "#000";
    const modSil = mod
      ? [mod.halo && mod.halo(B), mod.fill && mod.fill(B), mod.ink(B)]
          .filter(Boolean)
          .join("")
      : "";
    let n = 0;
    const masked = (/** @type {string} */ inner, /** @type {string} */ cut) => {
      if (!cut) return inner;
      const id = `${idp}m${n++}`;
      defs.push(
        `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><rect x="0" y="0" width="48" height="48" fill="#FFFFFF"/>${cut}</mask>`,
      );
      return `<g mask="url(#${id})">${inner}</g>`;
    };
    const decoB = deco ? deco.markup(B) : "";
    if (main) {
      const inkB = main.ink(B),
        fillB = main.fill ? main.fill(B) : "";
      if (main.halo)
        body += masked(main.halo(WHITE), fillB + inkB + decoB + modSil);
      if (main.fill) body += masked(main.fill(main.color), inkB + decoB + modSil);
      body += masked(main.ink(S.ink), modSil);
    }
    if (deco) body += masked(deco.markup(S.ink), modSil);
    if (mod) {
      const inkB = mod.ink(B),
        fillB = mod.fill ? mod.fill(B) : "";
      if (mod.halo) body += masked(mod.halo(WHITE), fillB + inkB);
      if (mod.fill) body += masked(mod.fill(mod.color), inkB);
      body += mod.ink(S.ink);
    }
  }
  const back =
    opt.back === "white"
      ? `<rect x="0" y="0" width="48" height="48" fill="#FFFFFF"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke-linecap="round" stroke-linejoin="round">${defs.length ? `<defs>${defs.join("")}</defs>` : ""}${back}${body}</svg>`;
}

/* ---------- kotak, sumbu, signature, flag ---------- */

/**
 * Kotak tiap lapisan dalam satuan 48 (boxOf legacy), untuk wilayah klik editor dan cek tepi viewBox.
 * Kotak objek dan pengubah memakai setengah sisi 11 × skala, dekorasi 31 × skala.
 * @param {any} it item kanonik
 * @returns {{main: {x: number, y: number, w: number, h: number}, mod: {x: number, y: number, w: number, h: number}, deco: {x: number, y: number, w: number, h: number}}}
 */
export function boxesSticker(it) {
  const p = adapt(it),
    z = { x: 0, y: 0, w: 0, h: 0 };
  const box = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ h) => ({
    x: (cx - h) * K,
    y: (cy - h) * K,
    w: 2 * h * K,
    h: 2 * h * K,
  });
  const [sx, sy] = STICKER_SLOTS[p.mod.slot];
  return {
    main: p.vis.main ? box(32 + p.main.x, 32 + p.main.y, 11 * p.main.s) : z,
    mod:
      p.mod.k && p.vis.mod ? box(sx + p.mod.x, sy + p.mod.y, 11 * p.mod.s) : z,
    deco: p.vis.deco ? box(32 + p.deco.x, 32 + p.deco.y, 31 * p.deco.s) : z,
  };
}

/** @param {any} it */
function axes(it) {
  const blocked = (/** @type {any} */ x, /** @type {number} */ a) => {
    const item = x || it;
    if (!hasMod(item && item.mod)) return false;
    const b = SLOT_ANG[slot4(item.slot)];
    return Math.abs(((a - b + 540) % 360) - 180) <= 42;
  };
  return [
    {
      id: "rayDiag",
      values: [...RAY_DIAGS],
      blockedBy: (/** @type {any} */ x, /** @type {any} */ v) => blocked(x, v),
    },
    { id: "curlSide", values: [...CURL_SIDES] },
    { id: "sparkPattern", values: [...SPARK_PATTERNS] },
    { id: "colorPair", values: COLOR_PAIRS.map((_, i) => i) },
  ];
}

/** @param {any} it */
const signature = (it) =>
  `sticker|${concept(String((it && it.main) || ""))}|${hasMod(it && it.mod) ? concept(it.mod, "mod") : "-"}|${hasMod(it && it.mod) ? slot4(it.slot) : "-"}`;

/**
 * Flag khusus sticker.
 * @param {any} it
 * @param {any} [_style]
 * @param {{nodeOf?: (key: string) => any, fillShapeOf?: (key: string) => string}} [ctx]
 * @returns {[("err" | "warn" | "info"), string][]}
 */
function flags(it, _style, ctx = {}) {
  /** @type {[("err" | "warn" | "info"), string][]} */
  const out = [];
  const key = String((it && it.main) || "");
  if (!LIB.test(key)) out.push(["err", "Objek bawaan tidak didukung gaya Sticker"]);
  else if (
    ctx.fillShapeOf &&
    !ctx.fillShapeOf(key) &&
    stickerItem(it).main.fill === "auto"
  )
    out.push(["info", "Tanpa bentuk isi: isi memakai lingkaran"]);
  if (hasMod(it && it.mod)) {
    if (!LIB.test(String(it.mod)))
      out.push(["warn", "Pengubah bawaan tidak didukung gaya Sticker dan tidak dirender"]);
    const s = String(it.slot || "");
    if (s && slot4(s) !== s)
      out.push(["info", `Posisi pengubah ${s} dipetakan ke ${slot4(s)}`]);
  }
  return out;
}

export const sticker = {
  id: "sticker",
  version: STICKER_ENGINE_VERSION,
  label: "Sticker",
  canvas: CANVAS,
  supports: {
    mod: true,
    deco: true,
    builtinMains: false,
    perItemColor: true,
    maxColors: 5,
  },
  defaults: { ...STICKER_DEFAULTS },
  normStyle,
  adapt,
  compose,
  axes,
  signature,
  flags,
};
