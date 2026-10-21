#!/usr/bin/env node
// @ts-check
/** @module scripts/fetch-fixtures — Mengunduh dependensi terkunci untuk tes offline. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = JSON.parse(
  await readFile(path.join(root, "packages/icon-sources/sources.json"), "utf8"),
);
const outputDir = path.join(root, "tests/fixtures/vendor");

const files = [
  ["lucide.min.js", sources.lucide.cdn.umd],
  ["lucide-tags.json", sources.lucide.cdn.tags],
  ["tabler-nodes-outline.json", sources.tabler.cdn.nodes],
  ["tabler-nodes-filled.json", sources.tabler.cdn.nodesFilled],
  ["tabler-icons.json", sources.tabler.cdn.meta],
  ["hugeicons.mjs", sources.hugeicons.cdn.esm],
  ["jszip.min.js", sources.jszip.cdn],
];

await mkdir(outputDir, { recursive: true });

for (const [name, url] of files) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh ${url}: HTTP ${response.status}`);
  }
  const data = new Uint8Array(await response.arrayBuffer());
  await writeFile(path.join(outputDir, name), data);
  console.log(`${name}: ${data.byteLength} byte`);
}
