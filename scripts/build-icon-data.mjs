#!/usr/bin/env node
// @ts-check
/**
 * @module scripts/build-icon-data
 * Membangun `packages/icon-sources/data/fill-shapes.json`: bentuk isi (lapisan warna) mesin sticker
 * dari pustaka ikon versi terkunci (docs/engines/sticker.md bagian "Data bentuk isi").
 *
 * Sumber dibaca dari `tests/fixtures/vendor/` (unduh dulu dengan `npm run fixtures:fetch`):
 * - `lucide.min.js` (Lucide, node ikon sama dengan yang dipakai app);
 * - `tabler-nodes-outline.json`, `tabler-nodes-filled.json`, `tabler-icons.json` (Tabler).
 *
 * Aturan pembentukan (ADR-019 butir 2, diputuskan Beny 2026-10-21):
 * - Bentuk tertutup = circle, rect, ellipse, polygon, path berakhiran z, atau path yang titik awal dan
 *   akhirnya berimpit (< 0,6, aturan `isClosedPart` offset; path itu diberi `z`). Deteksi titik ujung
 *   dipakai karena sejak Lucide 1.x dan Tabler 3.4x banyak path tertutup tidak lagi diakhiri `z`.
 * - `lu`: bentuk tertutup ikon Lucide.
 * - `tb`: varian filled resmi Tabler kalau ada. Kalau tidak ada, bentuk tertutup dari outline-nya,
 *   ditandai prefiks `~`.
 * - Path kosong Tabler `M0 0h24v24H0z` dibuang. Kategori `Brand` dan nama `brand-*` dikecualikan.
 *
 * Pemakaian: `node scripts/build-icon-data.mjs` (atau `npm run icon-data`).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { samplePath } from "../packages/engines/offset/geometry.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendor = path.join(root, "tests/fixtures/vendor");
const outFile = path.join(root, "packages/icon-sources/data/fill-shapes.json");
const sources = JSON.parse(
  await readFile(path.join(root, "packages/icon-sources/sources.json"), "utf8"),
);

/** Atribut geometri yang disimpan, urutan mengikuti node asli. */
const KEEP = new Set([
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
]);
const CLOSED_TAGS = new Set(["circle", "rect", "ellipse", "polygon"]);
const EMPTY = "M0 0h24v24H0z";

/** Sama dengan `kebab` di packages/icon-sources/library.js (nama ekspor Lucide → kunci ikon). */
const kebab = (/** @type {string} */ n) =>
  n
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();

/** @param {[string, Record<string, any>]} part */
const markup = ([tag, a]) =>
  `<${tag}${Object.entries(a)
    .filter(([k]) => KEEP.has(k))
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("")}/>`;

/** @param {[string, Record<string, any>]} part */
const isClosed = ([tag, a]) =>
  a.d !== EMPTY &&
  (CLOSED_TAGS.has(tag) || (tag === "path" && /z\s*$/i.test(String(a.d || ""))));

/**
 * Bentuk tertutup sebuah node ikon (Lucide dan outline Tabler): aturan `isClosed`, ditambah path
 * yang titik awal dan akhirnya berimpit (< 0,6, aturan `isClosedPart` offset) dan diberi `z`.
 * @param {[string, Record<string, any>][]} node
 */
const closedMarkupEndpoint = (node) =>
  node
    .map((part) => {
      if (isClosed(part)) return markup(part);
      const [tag, a] = part;
      if (tag !== "path" || !a.d || a.d === EMPTY) return "";
      const s = samplePath(String(a.d));
      const shut =
        s.start &&
        s.end &&
        s.length > 1 &&
        Math.hypot(s.start[0] - s.end[0], s.start[1] - s.end[1]) < 0.6;
      return shut ? markup(["path", { ...a, d: `${a.d}z` }]) : "";
    })
    .join("");

/* Lucide: indeks sama dengan luIndex() app (nama kebab pertama yang menang) */
const lucideCtx = /** @type {any} */ ({});
lucideCtx.globalThis = lucideCtx;
vm.runInNewContext(
  await readFile(path.join(vendor, "lucide.min.js"), "utf8"),
  lucideCtx,
);
/** @type {Map<string, any>} */
const LU = new Map();
for (const [pn, node] of Object.entries(lucideCtx.lucide.icons)) {
  if (!Array.isArray(node)) continue;
  const k = kebab(pn);
  if (!LU.has(k)) LU.set(k, node);
}
/** @type {Record<string, string>} */
const lu = {};
for (const name of [...LU.keys()].sort()) {
  const m = closedMarkupEndpoint(LU.get(name));
  if (m) lu[name] = m;
}

/* Tabler: filled resmi, atau bentuk tertutup outline dengan prefiks ~ */
const readJson = async (/** @type {string} */ f) =>
  JSON.parse(await readFile(path.join(vendor, f), "utf8"));
const tbOutline = await readJson("tabler-nodes-outline.json");
const tbFilled = await readJson("tabler-nodes-filled.json");
const tbMeta = await readJson("tabler-icons.json");
/** @type {Record<string, string>} */
const tb = {};
let tbIcons = 0;
for (const name of Object.keys(tbOutline).sort()) {
  if (name.startsWith("brand-") || tbMeta[name]?.category === "Brand") continue;
  tbIcons++;
  const filled = (tbFilled[name] || []).filter(
    (/** @type {any} */ [, a]) => a && a.d !== EMPTY,
  );
  if (filled.length) {
    tb[name] = filled.map(markup).join("");
    continue;
  }
  const m = closedMarkupEndpoint(
    tbOutline[name].filter((/** @type {any} */ [, a]) => a && a.stroke !== "none"),
  );
  if (m) tb[name] = "~" + m;
}

const data = {
  $comment:
    "Dibangun scripts/build-icon-data.mjs dari versi pustaka terkunci. Jangan diedit tangan. Prefiks ~ pada tb = bentuk tertutup outline (tidak ada varian filled resmi).",
  versions: { lucide: sources.lucide.version, tabler: sources.tabler.version },
  counts: {
    lu: { icons: LU.size, fill: Object.keys(lu).length },
    tb: {
      icons: tbIcons,
      fill: Object.keys(tb).length,
      official: Object.values(tb).filter((v) => v[0] !== "~").length,
    },
  },
  lu,
  tb,
};
await writeFile(outFile, JSON.stringify(data) + "\n");
console.log(
  `fill-shapes.json: Lucide ${data.counts.lu.fill}/${data.counts.lu.icons}, Tabler ${data.counts.tb.fill}/${data.counts.tb.icons} (${data.counts.tb.official} filled resmi)`,
);
