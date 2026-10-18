// @ts-check
/**
 * Lembar pratinjau `pratinjau.html` di ZIP Composer (sheetHTML IC 1.5.1, apa adanya).
 * Warna dan font di sini adalah bagian file ekspor, bukan UI Icon Studio.
 */

/** @param {unknown} v */
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * @param {{label: string, file: string, svg: string}[]} cells
 */
export function previewSheetHTML(cells) {
  const body = cells.map((c) => `<figure>${c.svg}<figcaption>${esc(c.label)}<small>${c.file}</small></figcaption></figure>`).join("\n");
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Set ikon</title><style>body{font-family:system-ui,sans-serif;margin:0;padding:32px 16px;background:#F6F6F3;color:#17181C}main{max-width:960px;margin:0 auto}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}figure{margin:0;background:#fff;border:1px solid #DDD;border-radius:10px;padding:20px 12px 12px;display:flex;flex-direction:column;align-items:center;gap:10px}figure svg{width:72px;height:72px}figcaption{font-size:13px;font-weight:600;text-align:center;display:flex;flex-direction:column}small{font-weight:400;color:#888;font-family:ui-monospace,monospace;font-size:11px}</style></head><body><main><h1>Set ikon</h1><div class="g">\n${body}\n</div></main></body></html>`;
}

/** LICENSES.txt di ZIP Composer. */
export const SET_LICENSES = `Sebagian bentuk dasar ikon berasal dari:\n- Lucide (https://lucide.dev) — ISC License, © Lucide Contributors\n- Tabler Icons (https://tabler.io/icons) — MIT License, © Paweł Kuna\n- Hugeicons Free (https://hugeicons.com) — MIT License, © Hugeicons\n\nPaket Hugeicons Pro tidak digunakan. Ikon dirakit ulang melalui Icon Composer.\n`;
