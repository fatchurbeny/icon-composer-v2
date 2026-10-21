// @ts-check
/**
 * Zoom dan geser kanvas ala Affinity di Icon Studio.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const MOD = process.platform === "darwin" ? "Meta" : "Control";

/** @param {import("@playwright/test").Page} page */
async function open(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js"))
      return route.fulfill({
        path: resolve("tests/fixtures/vendor/lucide.min.js"),
      });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-action="load-preset"]');
}

const zoomOf = (page) =>
  page.locator(".studio-zoom").evaluate((el) => Number(el.style.zoom));
const label = (page) => page.locator(".studio-zoombtn--label");

test.describe("Icon Studio · zoom kanvas", () => {
  test("Ctrl/⌘ + roda zoom di titik kursor, isi bisa digulir", async ({
    page,
  }) => {
    await open(page);
    const card = page.locator(".ic-page__card[data-select]").nth(2);
    const before = await card.boundingBox();
    const cx = before.x + before.width / 2,
      cy = before.y + before.height / 2;
    await page.mouse.move(cx, cy);
    await page.keyboard.down(MOD);
    await page.mouse.wheel(0, -400);
    await page.keyboard.up(MOD);
    await expect.poll(() => zoomOf(page)).toBeGreaterThan(1.5);
    const after = await card.boundingBox();
    expect(Math.abs(after.x + after.width / 2 - cx)).toBeLessThan(3);
    expect(Math.abs(after.y + after.height / 2 - cy)).toBeLessThan(3);
    const overflow = await page
      .locator(".ic-canvas")
      .evaluate(
        (c) => c.scrollWidth > c.clientWidth && c.scrollHeight > c.clientHeight,
      );
    expect(overflow).toBe(true);
    await expect(
      page.locator('.ic-doctab[aria-selected="true"]'),
    ).toContainText(await label(page).innerText());
  });

  test("tombol dan pintasan keyboard zoom", async ({ page }) => {
    await open(page);
    await expect(label(page)).toHaveText("100%");
    await page.locator('[data-action="zoom-in"]').click();
    await expect(label(page)).toHaveText("150%");
    await page.locator('[data-action="zoom-out"]').click();
    await page.locator('[data-action="zoom-out"]').click();
    await expect(label(page)).toHaveText("67%");
    await page.locator(".ic-canvas").click({ position: { x: 900, y: 700 } });
    await page.keyboard.press(`${MOD}+Equal`);
    await expect(label(page)).toHaveText("100%");
    await page.keyboard.press(`${MOD}+Equal`);
    await expect(label(page)).toHaveText("150%");
    await page.keyboard.press(`${MOD}+Digit1`);
    await expect(label(page)).toHaveText("100%");
    await page.keyboard.press(`${MOD}+Digit0`);
    await expect.poll(() => zoomOf(page)).not.toBe(1);
    await page.locator('[data-action="zoom-reset"]').click();
    await expect(label(page)).toHaveText("100%");
  });

  test("tool Geser tampilan (H) dan Spasi + seret menggeser kanvas tanpa memilih halaman", async ({
    page,
  }) => {
    await open(page);
    for (let i = 0; i < 3; i++)
      await page.locator('[data-action="zoom-in"]').click();
    const canvas = page.locator(".ic-canvas");
    const scroll = () => canvas.evaluate((c) => [c.scrollLeft, c.scrollTop]);
    await page.keyboard.press("h");
    await expect(canvas).toHaveAttribute("data-tool", "hand");
    await expect(page.locator('.ic-tool[data-value="hand"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const s0 = await scroll();
    const selected = await page
      .locator('.ic-page__card[aria-selected="true"]')
      .getAttribute("data-select");
    await page.mouse.move(800, 600);
    await page.mouse.down();
    await page.mouse.move(600, 450, { steps: 4 });
    await page.mouse.up();
    const s1 = await scroll();
    expect([s1[0] - s0[0], s1[1] - s0[1]]).toEqual([200, 150]);
    await expect(
      page.locator('.ic-page__card[aria-selected="true"]'),
    ).toHaveAttribute("data-select", selected || "");
    await page.keyboard.press("v");
    await expect(canvas).toHaveAttribute("data-tool", "select");
    await page.mouse.move(800, 600);
    await page.keyboard.down("Space");
    await expect(canvas).toHaveAttribute("data-tool", "hand");
    await page.mouse.down();
    await page.mouse.move(850, 650, { steps: 3 });
    await page.mouse.up();
    await page.keyboard.up("Space");
    const s2 = await scroll();
    expect([s1[0] - s2[0], s1[1] - s2[1]]).toEqual([50, 50]);
    await expect(canvas).toHaveAttribute("data-tool", "select");
  });

  test("tool Perbesar (Z): klik zoom in, Alt + klik zoom out", async ({
    page,
  }) => {
    await open(page);
    await page.keyboard.press("z");
    await page.mouse.click(700, 500);
    await expect(label(page)).toHaveText("150%");
    await page.keyboard.down("Alt");
    await page.mouse.click(700, 500);
    await page.keyboard.up("Alt");
    await expect(label(page)).toHaveText("100%");
  });

  test("zoom diingat per tampilan dan seret lapisan Edit tetap akurat di 200%", async ({
    page,
  }) => {
    await open(page);
    await page.locator('[data-action="zoom-in"]').click();
    await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
    await expect(page).toHaveURL(/edit/);
    await expect(label(page)).toHaveText("100%");
    await page.locator('[data-action="zoom-in"]').click();
    await page.locator('[data-action="zoom-in"]').click();
    await expect(label(page)).toHaveText("200%");
    await expect(page.locator(".ic-filmstrip")).toBeVisible();
    const film = await page.locator(".ic-filmstrip").boundingBox();
    expect(film?.height).toBe(84);
    await openPanel(page, "edit-layers");
    await page
      .locator('[data-action="layer-select"][data-layer="mod"]')
      .click();
    const xIn = page.locator('[data-name="edit-x"] input');
    const x0 = Number(await xIn.inputValue());
    const hit = await page.locator('[data-hit="mod"]').boundingBox();
    const x = hit.x + hit.width / 2,
      y = hit.y + hit.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    /* 4 unit kanvas = 4 × 520/48 px × 2 (zoom) */
    await page.mouse.move(x + (4 * 520 * 2) / 48, y, { steps: 6 });
    await page.mouse.up();
    /* X membaca titik acuan kotak, jadi yang diuji pergeserannya */
    await expect.poll(async () => Number(await xIn.inputValue()) - x0).toBeCloseTo(4);
    await page.keyboard.press("Escape");
    await expect(label(page)).toHaveText("150%");
  });
});
