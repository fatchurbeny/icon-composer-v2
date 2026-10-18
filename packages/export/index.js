// @ts-check
/** @module export */
export { directFillSvgFile, outlineSvgFile } from "./pipeline.js";
export { svgColors, packColors } from "./colors.js";
export { EN_ID, SMALL, createTagIndex, titleCase, trID } from "./tags.js";

/**
 * Kata gaya untuk judul metadata (EXPORT-PIPELINE.md bagian 4). Satu sumber untuk Composer dan Builder.
 * Nilai classic dan accent sama dengan legacy supaya pack yang sudah terbit tetap konsisten.
 */
export const STYLE_WORDS = Object.freeze({
  accent: { en: "Accent Line", id: "garis aksen" },
  "classic:A": { en: "Two Tone", id: "dua warna" },
  "classic:B": { en: "Solid Two Tone", id: "solid dua warna" },
  "classic:C": { en: "Outline", id: "garis" },
  offset: { en: "Offset Style", id: "gaya offset" },
  "hand-writing": { en: "Hand-writing Style", id: "gaya hand-writing" },
  sticker: { en: "Sticker Style", id: "gaya sticker" },
});

/**
 * Kata gaya untuk keluarga dan mode classic (A, B, C).
 * @param {string} family
 * @param {string} [mode]
 * @returns {{en: string, id: string}}
 */
export function styleWord(family, mode) {
  const key = family === "classic" ? `classic:${mode || "A"}` : family;
  return /** @type {Record<string, {en: string, id: string}>} */ (STYLE_WORDS)[
    key
  ];
}

/**
 * CSV metadata: BOM UTF-8, CRLF, semua sel data dikutip.
 * `quoteHeader: false` mempertahankan header tanpa kutip (format legacy Template Icon Builder).
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} columns
 * @param {{quoteHeader?: boolean}} [options]
 */
export function metadataCsv(rows, columns, options = {}) {
  const cell = (/** @type {unknown} */ value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header =
    options.quoteHeader === false
      ? columns.join(",")
      : columns.map(cell).join(",");
  return `\uFEFF${[
    header,
    ...rows.map((row) => columns.map((key) => cell(row[key])).join(",")),
  ].join("\r\n")}\r\n`;
}

/**
 * @param {any} JSZipClass
 * @param {Record<string, unknown>} files nama file (boleh berfolder) → isi, sesuai urutan sisip
 * @param {{type?: string}} [options]
 */
export async function buildZip(JSZipClass, files, options = {}) {
  const zip = new JSZipClass();
  for (const [name, content] of Object.entries(files)) zip.file(name, content);
  return zip.generateAsync({ type: options.type || "blob" });
}
