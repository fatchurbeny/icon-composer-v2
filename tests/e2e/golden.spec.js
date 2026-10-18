// @ts-check
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  captureIconComposer,
  captureIconComposerBins,
  captureIconComposerZip,
  captureTemplateIconBuilder,
  captureTemplateIconBuilderZip,
  openHtml,
  root,
} from "./golden-utils.js";

const fixture = JSON.parse(
  await readFile(path.join(root, "tests/fixtures/sets/basic.json"), "utf8"),
);
const mixed = JSON.parse(
  await readFile(path.join(root, "tests/fixtures/sets/mixed.json"), "utf8"),
);

for (const family of fixture.iconComposer.families) {
  test(`@golden Icon Composer ${family}`, async ({ page }) => {
    await openHtml(page, "dist/icon-composer.html");
    const actual = await captureIconComposer(page, family);
    const expected = await readFile(
      path.join(
        root,
        "tests/golden/icon-composer",
        family,
        `${fixture.name}.svg`,
      ),
      "utf8",
    );
    expect(`${actual}\n`).toBe(expected);
  });
}

test("@golden isi ZIP Template Icon Builder", async ({ browser }) => {
  const legacy = await browser.newPage();
  const current = await browser.newPage();
  try {
    await openHtml(legacy, "legacy/template-icon-builder-aksen-v1.6.0.html");
    await openHtml(current, "dist/template-icon-builder.html");
    const expected = await captureTemplateIconBuilderZip(
      legacy,
      fixture.templateIconBuilder.zipManifest,
    );
    const actual = await captureTemplateIconBuilderZip(
      current,
      fixture.templateIconBuilder.zipManifest,
    );
    expect(actual).toEqual(expected);
  } finally {
    await legacy.close();
    await current.close();
  }
});

for (const style of fixture.templateIconBuilder.styles) {
  const family = style === "X" ? "accent" : "classic";
  test(`@golden Template Icon Builder ${family}`, async ({ page }) => {
    await openHtml(page, "dist/template-icon-builder.html");
    const actual = await captureTemplateIconBuilder(page, style);
    const expected = await readFile(
      path.join(
        root,
        "tests/golden/template-icon-builder",
        family,
        `${fixture.name}.svg`,
      ),
      "utf8",
    );
    expect(`${actual}\n`).toBe(expected);
  });
}

for (const family of mixed.iconComposer.families) {
  test(`@golden Icon Composer ${family} lintas pustaka`, async ({ page }) => {
    await openHtml(page, "dist/icon-composer.html", {
      storage: mixed.iconComposer.storage,
    });
    const actual = await captureIconComposerBins(page, family);
    const expected = await readFile(
      path.join(
        root,
        "tests/golden/icon-composer",
        family,
        `${mixed.name}.html`,
      ),
      "utf8",
    );
    expect(`${actual}\n`).toBe(expected);
  });
}

test("@golden isi ZIP Template Icon Builder lintas pustaka", async ({
  browser,
}) => {
  const legacy = await browser.newPage();
  const current = await browser.newPage();
  try {
    await openHtml(legacy, "legacy/template-icon-builder-aksen-v1.6.0.html");
    await openHtml(current, "dist/template-icon-builder.html");
    const { zipManifest, zipStyles } = mixed.templateIconBuilder;
    const expected = await captureTemplateIconBuilderZip(
      legacy,
      zipManifest,
      zipStyles,
    );
    const actual = await captureTemplateIconBuilderZip(
      current,
      zipManifest,
      zipStyles,
    );
    expect(Object.keys(actual).length).toBeGreaterThan(10);
    expect(actual).toEqual(expected);
  } finally {
    await legacy.close();
    await current.close();
  }
});

/**
 * ADR-016: header metadata.csv Icon Composer kini dikutip. Selain baris header, isi harus sama dengan legacy.
 * @param {Record<string, string | null>} zip
 */
function quoteLegacyCsvHeader(zip) {
  const csv = zip["metadata.csv"];
  if (typeof csv !== "string") return zip;
  const [header, ...rest] = csv.split("\r\n");
  const quoted = header
    .replace(/^\uFEFF/, "")
    .split(",")
    .map((column) => `"${column}"`)
    .join(",");
  return { ...zip, "metadata.csv": ["\uFEFF" + quoted, ...rest].join("\r\n") };
}

test("@golden isi ZIP Icon Composer lintas pustaka", async ({ browser }) => {
  const legacy = await browser.newPage();
  const current = await browser.newPage();
  try {
    const options = { storage: mixed.iconComposer.storage };
    await openHtml(legacy, "legacy/icon-composer-aksen-v1.5.1.html", options);
    await openHtml(current, "dist/icon-composer.html", options);
    const expected = quoteLegacyCsvHeader(await captureIconComposerZip(legacy));
    const actual = await captureIconComposerZip(current);
    expect(Object.keys(actual)).toContain("metadata.csv");
    expect(actual).toEqual(expected);
  } finally {
    await legacy.close();
    await current.close();
  }
});
