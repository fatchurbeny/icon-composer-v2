#!/usr/bin/env node
// Lint UI: menegakkan docs/design/UI-RULES.md secara otomatis.
// Pakai: node scripts/lint-ui.mjs [folder ...]   (bawaan: apps packages/ui)
// Keluar dengan kode 1 bila ada pelanggaran.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["apps", "packages/ui"];
const TOKENS = path.join(ROOT, "packages/ui/tokens.css");
const COMPONENTS = path.join(ROOT, "packages/ui/components.css");
const EXT = new Set([".js", ".mjs", ".css", ".html"]);
const SKIP_DIR = new Set([
  "node_modules",
  "dist",
  "releases",
  "vendor",
  "legacy",
  "test",
  "tests",
]);
// File yang boleh memuat warna data mesin (palet ikon), bukan warna UI.
const DATA_COLOR_OK = [/packages\/engines\//, /palette/i, /\/data\//];
const GENERATED = [/packages\/ui\/icons\.js$/];

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIR.has(e.name)) walk(p, out);
    } else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
};

const defined = new Set(
  [...fs.readFileSync(COMPONENTS, "utf8").matchAll(/\.(ic-[a-z0-9_-]+)/g)].map(
    (m) => m[1],
  ),
);
const problems = [];
const report = (file, line, rule, text) =>
  problems.push(
    `${path.relative(ROOT, file)}:${line}  [${rule}]  ${text.trim().slice(0, 140)}`,
  );

const RULES = [
  {
    id: "warna-literal",
    re: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/,
    skip: (f) => f === TOKENS || DATA_COLOR_OK.some((r) => r.test(f)),
  },
  {
    id: "kelas-state",
    re: /class(Name)?\s*=\s*["'`][^"'`]*\b(on|active|selected|is-[a-z-]+)\b[^"'`]*["'`]|classList\.(add|toggle|remove)\(\s*["'](on|active|selected)["']/,
  },
  {
    id: "font-literal",
    re: /font-family\s*:(?!\s*var\(--ic-font)/,
    skip: (f) => f === TOKENS,
  },
  {
    id: "ukuran-huruf-literal",
    re: /font-size\s*:\s*\d/,
    skip: (f) => f === TOKENS || f === COMPONENTS,
  },
  {
    id: "radius-literal",
    re: /border-radius\s*:\s*\d/,
    skip: (f) => f === TOKENS || f === COMPONENTS,
  },
  {
    id: "outline-none",
    re: /outline\s*:\s*(none|0)\b(?![^;]*--ic-focus)/,
    skip: (f) => f === COMPONENTS,
  },
  { id: "emoji", re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/u },
  {
    id: "framework",
    re: /from\s+['"](react|vue|svelte|preact|lit|tailwindcss)['"]|cdn\.tailwindcss/,
  },
];

for (const t of targets) {
  for (const file of walk(path.join(ROOT, t))) {
    if (GENERATED.some((r) => r.test(file))) continue;
    const src = fs.readFileSync(file, "utf8");
    const lines = src.split("\n");
    lines.forEach((ln, i) => {
      for (const r of RULES) {
        if (r.skip && r.skip(file)) continue;
        if (r.re.test(ln)) report(file, i + 1, r.id, ln);
      }
      // Kelas ic- yang tidak didefinisikan di components.css
      if (file !== COMPONENTS) {
        for (const m of ln.matchAll(
          /class(?:Name)?\s*=\s*["'`]([^"'`]*)["'`]/g,
        )) {
          for (const c of m[1].split(/\s+/)) {
            if (c.startsWith("ic-") && !c.includes("${") && !defined.has(c))
              report(file, i + 1, "kelas-tak-terdaftar", c);
          }
        }
      }
      // Tombol ikon/tool tanpa aria-label
      for (const m of ln.matchAll(
        /<button\b[^>]*class=["'][^"']*\bic-(iconbtn|tool)\b[^"']*["'][^>]*>/g,
      )) {
        if (!/aria-label(ledby)?=/.test(m[0]))
          report(file, i + 1, "tanpa-aria-label", m[0]);
      }
    });
  }
}

if (problems.length) {
  console.error(
    `lint:ui menemukan ${problems.length} pelanggaran (lihat docs/design/UI-RULES.md):\n` +
      problems.join("\n"),
  );
  process.exit(1);
}
console.log("lint:ui lulus");
