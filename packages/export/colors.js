// @ts-check
/**
 * @module export/colors
 * Hitung warna terlihat (di luar <mask>). Canva hanya bisa mengedit maksimal 5 warna per SVG.
 * Dipindah apa adanya dari Icon Composer 1.5.1.
 */

/** @param {string} svg */
export function svgColors(svg) {
  const vis = svg.replace(/<mask[\s\S]*?<\/mask>/g, "");
  const set = new Set();
  for (const m of vis.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{3,8})"/g))
    set.add(m[1].toUpperCase());
  return set;
}

/**
 * Gabungan warna seluruh ikon dalam satu pack.
 * @template T
 * @param {T[]} items
 * @param {(it: T) => string} render
 */
export function packColors(items, render) {
  const all = new Set();
  for (const it of items) for (const c of svgColors(render(it))) all.add(c);
  return all;
}
