#!/usr/bin/env node
// @ts-check
/** @module scripts/collect-builds — Mengumpulkan build single-file ke dist/. */
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const builds = [
  ["icon-composer", "icon-composer.html"],
  ["template-icon-builder", "template-icon-builder.html"],
];

await mkdir(dist, { recursive: true });
await rm(path.join(dist, "index.html"), { force: true });
for (const [directory, filename] of builds) {
  await copyFile(
    path.join(dist, directory, "index.html"),
    path.join(dist, filename),
  );
  await rm(path.join(dist, directory), { recursive: true });
}
