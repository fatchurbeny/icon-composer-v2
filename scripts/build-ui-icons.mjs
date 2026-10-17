// Membuat packages/ui/icons.js dari lucide-static (versi terkunci di sources.json).
// Jalankan: node scripts/build-ui-icons.mjs <path ke node_modules/lucide-static/icons>
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2] || "node_modules/lucide-static/icons";
// Daftar ikon UI resmi. Tambah nama di sini, lalu jalankan ulang. Jangan menggambar ikon UI dengan tangan.
const NAMES = {
  select: "mouse-pointer-2",
  move: "move",
  "add-main": "square-plus",
  "add-mod": "circle-plus",
  deco: "sparkle",
  combine: "layout-grid",
  eyedropper: "pipette",
  hand: "hand",
  zoom: "zoom-in",
  search: "search",
  eye: "eye",
  "eye-off": "eye-off",
  lock: "lock",
  unlock: "lock-open",
  trash: "trash-2",
  duplicate: "copy",
  dice: "dices",
  "chevron-down": "chevron-down",
  "chevron-right": "chevron-right",
  undo: "undo-2",
  redo: "redo-2",
  help: "circle-help",
  composer: "pen-tool",
  builder: "layers",
  tinjau: "layout-dashboard",
  kombinasi: "sparkles",
  "view-single": "square",
  "view-pages": "grid-3x3",
  more: "ellipsis-vertical",
  settings: "settings",
  grid: "grid-2x2",
  plus: "plus",
  check: "check",
  x: "x",
  import: "file-input",
  tag: "tag",
  compare: "columns-2",
  magnifier: "scan-search",
  export: "upload",
  even: "chart-no-axes-column",
  edit: "pencil",
  swap: "arrow-left-right",
  drag: "grip-vertical",
};
const out = {};
for (const [name, file] of Object.entries(NAMES)) {
  const p = path.join(dir, file + ".svg");
  if (!fs.existsSync(p)) {
    console.error("tidak ada:", file);
    process.exitCode = 1;
    continue;
  }
  const s = fs.readFileSync(p, "utf8");
  out[name] = [
    ...s.matchAll(
      /<(path|circle|rect|ellipse|polygon|polyline|line)\b[^>]*\/>/g,
    ),
  ]
    .map((m) => m[0].replace(/\s+\/>/, "/>"))
    .join("");
}
const body = `/* @module ui/icons — DIBUAT OTOMATIS oleh scripts/build-ui-icons.mjs dari lucide-static. Jangan edit manual. */
(function (global) {
  const ICONS = ${JSON.stringify(out, null, 0)};
  /** SVG string ikon UI. size: 13 | 16 | 20. */
  function uiIcon(name, size = 16, label) {
    const inner = ICONS[name];
    if (!inner) throw new Error('Ikon UI tidak terdaftar: ' + name);
    const a11y = label ? \`role="img" aria-label="\${label}"\` : 'aria-hidden="true"';
    return \`<svg class="ic-icon" width="\${size}" height="\${size}" viewBox="0 0 24 24" \${a11y}>\${inner}</svg>\`;
  }
  /** Ganti setiap <i data-icon="nama" data-size="16"></i> dengan SVG-nya. */
  function hydrateIcons(root) {
    (root || document).querySelectorAll('i[data-icon]').forEach((el) => {
      el.outerHTML = uiIcon(el.dataset.icon, +(el.dataset.size || 16), el.dataset.label);
    });
  }
  global.ICONS_UI = { ICONS, uiIcon, hydrateIcons };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => hydrateIcons());
    else hydrateIcons();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
`;
fs.writeFileSync(new URL("../packages/ui/icons.js", import.meta.url), body);
console.log("ikon UI:", Object.keys(out).length);
