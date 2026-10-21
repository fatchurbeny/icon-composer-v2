// @ts-check
/**
 * @module studio/color-harmony
 * Konversi warna (hex, RGB, HSL, HSV) dan harmoni warna dari satu warna dasar.
 * Fungsi murni: tanpa DOM dan tanpa localStorage. Hex selalu `#RRGGBB` huruf besar, tanpa opacity,
 * karena warna Canva dan direct fill selalu solid.
 */

/** @typedef {{h: number, s: number, l: number}} Hsl h 0..360, s dan l 0..100 */
/** @typedef {{h: number, s: number, v: number}} Hsv h 0..360, s dan v 0..1 */

const HEX6 = /^#?([0-9a-f]{6})$/i;
const HEX3 = /^#?([0-9a-f]{3})$/i;

/**
 * Rapikan teks hex menjadi `#RRGGBB`. Menerima 3 atau 6 digit, dengan atau tanpa `#`.
 * @param {unknown} value
 * @returns {string | null} null bila bukan hex yang sah
 */
export function normHex(value) {
  const text = String(value ?? "").trim();
  const six = HEX6.exec(text);
  if (six) return `#${six[1].toUpperCase()}`;
  const three = HEX3.exec(text);
  if (three) return `#${[...three[1]].map((c) => c + c).join("").toUpperCase()}`;
  return null;
}

/** @param {number} n @param {number} lo @param {number} hi */
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Hue selalu di rentang 0..360 (360 dibaca sebagai 0). @param {number} h */
export const wrapHue = (h) => ((h % 360) + 360) % 360;

/**
 * @param {string} hex
 * @returns {[number, number, number]} r, g, b 0..255
 */
export function hexToRgb(hex) {
  const h = normHex(hex);
  if (!h) throw new Error(`Hex tidak sah: ${hex}`);
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** @param {number} r @param {number} g @param {number} b */
export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/**
 * @param {string} hex
 * @returns {Hsl}
 */
export function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: hueOf(r, g, b, max, d), s: s * 100, l: l * 100 };
}

/**
 * @param {Hsl} hsl
 * @returns {string}
 */
export function hslToHex({ h, s, l }) {
  const S = clamp(s, 0, 100) / 100,
    L = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  return fromChroma(wrapHue(h), c, L - c / 2);
}

/**
 * @param {string} hex
 * @returns {Hsv}
 */
export function hexToHsv(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b),
    d = max - Math.min(r, g, b);
  return { h: hueOf(r, g, b, max, d), s: max === 0 ? 0 : d / max, v: max };
}

/**
 * @param {Hsv} hsv
 * @returns {string}
 */
export function hsvToHex({ h, s, v }) {
  const S = clamp(s, 0, 1),
    V = clamp(v, 0, 1);
  const c = V * S;
  return fromChroma(wrapHue(h), c, V - c);
}

/** HSL ke HSV (hue tetap, juga untuk abu-abu). @param {Hsl} hsl @returns {Hsv} */
export function hslToHsv({ h, s, l }) {
  const S = clamp(s, 0, 100) / 100,
    L = clamp(l, 0, 100) / 100;
  const v = L + S * Math.min(L, 1 - L);
  return { h: wrapHue(h), s: v === 0 ? 0 : 2 * (1 - L / v), v };
}

/** HSV ke HSL (hue tetap). @param {Hsv} hsv @returns {Hsl} */
export function hsvToHsl({ h, s, v }) {
  const S = clamp(s, 0, 1),
    V = clamp(v, 0, 1);
  const l = V * (1 - S / 2);
  const sl = l === 0 || l === 1 ? 0 : (V - l) / Math.min(l, 1 - l);
  return { h: wrapHue(h), s: sl * 100, l: l * 100 };
}

/** @param {number} r @param {number} g @param {number} b @param {number} max @param {number} d */
function hueOf(r, g, b, max, d) {
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return wrapHue(h * 60);
}

/** @param {number} h @param {number} c chroma 0..1 @param {number} m */
function fromChroma(h, c, m) {
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** Jenis harmoni yang ditawarkan pemilih warna. */
export const HARMONIES = /** @type {const} */ ([
  ["complementary", "Komplementer"],
  ["analogous", "Analog"],
  ["triadic", "Triadik"],
]);

/** Geser hue tiap jenis harmoni, warna dasar selalu pertama. */
const HARMONY_STEPS = { complementary: [0, 180], analogous: [0, 30, -30], triadic: [0, 120, 240] };

/**
 * Warna harmoni dari satu warna dasar: saturasi dan kecerahan (HSL) tetap, hanya hue yang diputar.
 * Warna dasar selalu menjadi warna pertama dan tidak diubah.
 * @param {string} hex warna dasar
 * @param {"complementary" | "analogous" | "triadic"} kind
 * @returns {string[]}
 */
export function harmony(hex, kind) {
  const base = normHex(hex);
  if (!base) return [];
  const steps = HARMONY_STEPS[kind];
  if (!steps) return [base];
  const hsl = hexToHsl(base);
  return steps.map((d) => (d === 0 ? base : hslToHex({ ...hsl, h: hsl.h + d })));
}
