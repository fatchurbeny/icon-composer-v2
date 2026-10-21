// @ts-check
/**
 * Plugin Vite (khusus build): mengganti `packages/icon-sources/data/fill-shapes.json` yang diimpor dinamis oleh
 * `fill-shapes.js` dengan modul `export default {gz: "<gzip base64>"}`.
 *
 * Alasan: vite-plugin-singlefile menginline semua chunk dinamis ke satu HTML, jadi import dinamis saja tidak
 * mengurangi ukuran file. Dengan gzip, data ±0,9 MB menjadi ±0,2 MB string yang baru didekode
 * (`decodeFillShapes`, DecompressionStream) saat gaya Sticker dipakai. Lihat docs/engines/sticker.md.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const VIRTUAL_ID = "\0icon-studio-fill-shapes-gz";

/** @returns {import("vite").Plugin} */
export function fillShapesGzip() {
  /** @type {string | null} */
  let file = null;
  return {
    name: "icon-studio:fill-shapes-gz",
    apply: "build",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.endsWith("data/fill-shapes.json")) return null;
      if (!/[\\/]icon-sources[\\/]fill-shapes\.js$/.test(importer)) return null;
      file = path.resolve(path.dirname(importer), source);
      return VIRTUAL_ID;
    },
    async load(id) {
      if (id !== VIRTUAL_ID || !file) return null;
      const json = JSON.stringify(JSON.parse(await readFile(file, "utf8")));
      const gz = gzipSync(json, { level: 9 }).toString("base64");
      return `export default { gz: ${JSON.stringify(gz)} };`;
    },
  };
}
