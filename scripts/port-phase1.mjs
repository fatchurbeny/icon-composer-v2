#!/usr/bin/env node
// @ts-check
/** @module scripts/port-phase1 — Memisahkan HTML legacy ke sumber Vite tanpa mengubah logika. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const apps = [
  {
    name: "icon-composer",
    legacy: "legacy/icon-composer-aksen-v1.5.1.html",
    vendorScripts: 0,
  },
  {
    name: "template-icon-builder",
    legacy: "legacy/template-icon-builder-aksen-v1.6.0.html",
    vendorScripts: 1,
  },
];

for (const app of apps) {
  const source = await readFile(path.join(root, app.legacy), "utf8");
  const style = source.match(/<style>\n?([\s\S]*?)<\/style>/);
  const inlineScripts = [
    ...source.matchAll(/<script>\n?([\s\S]*?)<\/script>/g),
  ];
  if (!style || inlineScripts.length !== app.vendorScripts + 1) {
    throw new Error(`Struktur legacy ${app.name} tidak dikenali.`);
  }

  const appDir = path.join(root, "apps", app.name);
  const srcDir = path.join(appDir, "src");
  await mkdir(srcDir, { recursive: true });
  await writeFile(path.join(srcDir, "style.css"), `${style[1].trim()}\n`);
  let mainSource = inlineScripts.at(-1)?.[1].trim() || "";
  mainSource = mainSource
    .replace("const r3 = v => Math.round(v * 1000) / 1000;", "")
    .replace(/^const partStr = .*;$/m, "")
    .replace(/^function dedupeAttrs\(svg\)\{.*\}$/m, "");
  let sharedImports =
    'import { dedupeAttrs, partStr, r3 } from "@icon-studio/core";\n';
  if (app.name === "template-icon-builder") {
    const exportStart = mainSource.indexOf("const OUTLINE_SHAPES");
    const exportEnd = mainSource.indexOf("function finalManifest");
    if (exportStart < 0 || exportEnd < 0) {
      throw new Error("Pipeline ekspor TIB tidak ditemukan.");
    }
    let exportSource = mainSource.slice(exportStart, exportEnd);
    exportSource = exportSource
      .replace("function outlineSvgFile", "export function outlineSvgFile")
      .replace(
        "function directFillSvgFile",
        "export function directFillSvgFile",
      );
    const exportDir = path.join(root, "packages/export");
    await mkdir(exportDir, { recursive: true });
    await writeFile(
      path.join(exportDir, "pipeline.js"),
      `// @ts-check\n/** @module export */\nimport { dedupeAttrs } from "@icon-studio/core";\n${exportSource}`,
    );
    mainSource = mainSource.slice(0, exportStart) + mainSource.slice(exportEnd);
    sharedImports +=
      'import { directFillSvgFile } from "@icon-studio/export";\n';
  }
  await writeFile(
    path.join(srcDir, "main.js"),
    `/* eslint-disable -- Kode UI legacy dibekukan sampai Fase 2b. */\n${sharedImports}${mainSource}\n`,
  );

  let html = source.replace(
    style[0],
    '<link rel="stylesheet" href="/src/style.css">',
  );
  inlineScripts.forEach((match, index) => {
    const file =
      index < app.vendorScripts ? `vendor-${index + 1}.js` : "main.js";
    html = html.replace(
      match[0],
      `<script type="module" src="/src/${file}"></script>`,
    );
  });
  for (let index = 0; index < app.vendorScripts; index += 1) {
    await writeFile(
      path.join(srcDir, `vendor-${index + 1}.js`),
      `/* eslint-disable -- Vendor legacy dibekukan. */\n${inlineScripts[index][1].trim()}\n`,
    );
  }
  await writeFile(path.join(appDir, "index.html"), html);
}
