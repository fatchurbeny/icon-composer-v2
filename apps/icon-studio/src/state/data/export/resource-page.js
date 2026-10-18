// @ts-check
/**
 * Halaman Resource Page di ZIP Builder (resourceHTML TIB 1.6.0, apa adanya).
 * Warna di sini adalah bagian file ekspor, bukan UI Icon Studio.
 */

/** @param {unknown} v */
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * @param {any[]} list ikon yang diekspor
 * @param {{man: any, cols: number, render: (it: any, idp: string) => string, searchOf: (it: any) => string}} o
 */
export function resourceHTML(list, o) {
  const cols = o.cols, man = o.man;
  const cell = (/** @type {any} */ it) => `<figure>${o.render(it, "rp" + it.uid)}<figcaption>${esc(it.id)}<small>${esc(o.searchOf(it))}</small></figcaption></figure>`;
  const grp = [["slot", "Used in this deck"], ["extra", "Extra icons in the same set"]].map(([r, lab]) => { const g = list.filter(i => (i.role === "extra" ? "extra" : "slot") === r); return g.length ? `${list.some(i => i.role === "extra") ? `<h2>${lab} · ${g.length}</h2>` : ""}<div class="g">${g.map(cell).join("")}</div>` : ""; }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resource Page</title><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#141414}main{padding:40px}h1{font-size:40px;margin:0 0 6px;font-weight:600}p{color:#5E6068;margin:0 0 28px}.g{display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:22px 14px}figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:8px}svg{width:72px;height:72px}figcaption{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#5E6068;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}small{font-size:9px;color:#8B8D96}h2{font-size:16px;color:#5E6068;margin:28px 0 14px;font-weight:600}</style></head><body><main><h1>Resource Page</h1><p>${esc((man && man.resource && man.resource.description) || "Use these icons to add clarity to your presentation.")}</p>${grp}</main></body></html>`;
}
