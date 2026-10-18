// @ts-check
/** @module export */
export { directFillSvgFile, outlineSvgFile } from "./pipeline.js";
export const STYLE_WORDS = Object.freeze({
  accent: { en: "Accent Line", id: "aksen garis" },
  "classic:A": { en: "Two Tone", id: "dua warna" },
  "classic:B": { en: "Solid Two Tone", id: "solid dua warna" },
  offset: { en: "Offset Style", id: "gaya offset" },
  "hand-writing": { en: "Hand-writing Style", id: "gaya hand-writing" },
  sticker: { en: "Sticker Style", id: "gaya sticker" },
});

export function metadataCsv(rows, columns) {
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return `\uFEFF${[
    columns,
    ...rows.map((row) => columns.map((key) => row[key])),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n")}\r\n`;
}

export async function buildZip(JSZipClass, files, options = {}) {
  const zip = new JSZipClass();
  for (const [name, content] of Object.entries(files)) zip.file(name, content);
  return zip.generateAsync({ type: options.type || "blob" });
}
