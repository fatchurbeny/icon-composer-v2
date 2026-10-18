#!/usr/bin/env node
// @ts-check
/** @module scripts/golden-capture — Menangkap keluaran SVG final legacy. */
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  captureIconComposer,
  captureIconComposerBins,
  captureTemplateIconBuilder,
  openHtml,
  root,
} from "../tests/e2e/golden-utils.js";

const fixture = JSON.parse(
  await readFile(path.join(root, "tests/fixtures/sets/basic.json"), "utf8"),
);
const mixed = JSON.parse(
  await readFile(path.join(root, "tests/fixtures/sets/mixed.json"), "utf8"),
);
const browser = await chromium.launch();
try {
  for (const family of fixture.iconComposer.families) {
    const page = await browser.newPage();
    await openHtml(page, "legacy/icon-composer-aksen-v1.5.1.html");
    const svg = await captureIconComposer(page, family);
    const directory = path.join(root, "tests/golden/icon-composer", family);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, `${fixture.name}.svg`), `${svg}\n`);
    await page.close();
  }
  for (const style of fixture.templateIconBuilder.styles) {
    const family = style === "X" ? "accent" : "classic";
    const page = await browser.newPage();
    await openHtml(page, "legacy/template-icon-builder-aksen-v1.6.0.html");
    const svg = await captureTemplateIconBuilder(page, style);
    const directory = path.join(
      root,
      "tests/golden/template-icon-builder",
      family,
    );
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, `${fixture.name}.svg`), `${svg}\n`);
    await page.close();
  }
  for (const family of mixed.iconComposer.families) {
    const page = await browser.newPage();
    await openHtml(page, "legacy/icon-composer-aksen-v1.5.1.html", {
      storage: mixed.iconComposer.storage,
    });
    const html = await captureIconComposerBins(page, family);
    const directory = path.join(root, "tests/golden/icon-composer", family);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, `${mixed.name}.html`), `${html}\n`);
    await page.close();
  }
} finally {
  await browser.close();
}
