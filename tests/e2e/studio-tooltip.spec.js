// @ts-check
/**
 * Rich tooltip (`.ic-tip`) di tool rail Icon Studio, dan tool perintah yang kini berfungsi.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;

/** @param {import("@playwright/test").Page} page */
async function open(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("lucide.min.js")) return route.fulfill({ path: resolve("tests/fixtures/vendor/lucide.min.js") });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('[data-action="load-preset"]');
}

/** @param {import("@playwright/test").Page} page @param {string} name */
const tool = (page, name) => page.locator(`.ic-toolrail .ic-tool[data-value="${name}"]`);

test.describe("Icon Studio · tooltip tool rail", () => {
  test("hover menampilkan judul, pintasan, dan gestur setelah jeda", async ({ page }) => {
    await open(page);
    const tip = page.locator("#tip-tool-hand");
    await expect(tool(page, "hand")).toHaveAttribute("aria-describedby", "tip-tool-hand");
    await tool(page, "hand").hover();
    await page.waitForTimeout(150);
    await expect(tip).toBeHidden();
    await expect(tip).toBeVisible();
    await expect(tip.locator(".ic-tip__head")).toContainText("Geser tampilan");
    await expect(tip.locator(".ic-tip__key")).toHaveText("H");
    await expect(tip.locator(".ic-tip__list li")).toHaveCount(3);
    /* di kanan rail, tidak menutupi tombol */
    const t = await tip.boundingBox(),
      b = await tool(page, "hand").boundingBox();
    expect(t.x).toBeGreaterThan(b.x + b.width);

    /* pindah ke tool lain: langsung muncul tanpa jeda */
    await tool(page, "zoom").hover();
    await expect(tip).toBeHidden();
    await expect(page.locator("#tip-tool-zoom")).toBeVisible({ timeout: 200 });

    await page.mouse.move(700, 450);
    await expect(page.locator("#tip-tool-zoom")).toBeHidden();
  });

  test("Escape dan klik menutup tooltip, fokus keyboard membukanya", async ({ page }) => {
    await open(page);
    const tip = page.locator("#tip-tool-select");
    await tool(page, "select").hover();
    await expect(tip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tip).toBeHidden();

    await tool(page, "hand").hover();
    await expect(page.locator("#tip-tool-hand")).toBeVisible();
    await tool(page, "hand").click();
    await expect(page.locator("#tip-tool-hand")).toBeHidden();

    await page.mouse.move(700, 450);
    await tool(page, "zoom").focus();
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("#tip-tool-hand")).toBeVisible();
  });

  test("tool perintah: Objek utama membuka Pustaka, Kombinasi massal pindah persona", async ({ page }) => {
    await open(page);
    await tool(page, "add-main").click();
    await expect(page.locator('.ic-studio [role="tab"][data-value="pustaka"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-name="lib-query"] input')).toBeFocused();
    /* rail kembali ke tool mode */
    await expect(tool(page, "select")).toHaveAttribute("aria-pressed", "true");
    await expect(tool(page, "add-main")).toHaveAttribute("aria-pressed", "false");

    await tool(page, "combine").click();
    await expect(page).toHaveURL(/#\/kombinasi$/);
  });

  test("pintasan H dan Z memilih tool, Bandingkan di Tinjau berganti tampilan", async ({ page }) => {
    await open(page);
    await page.keyboard.press("h");
    await expect(tool(page, "hand")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".ic-canvas")).toHaveAttribute("data-tool", "hand");
    await page.keyboard.press("v");
    await expect(page.locator(".ic-canvas")).toHaveAttribute("data-tool", "select");

    await page.goto(`${APP}#/tinjau`);
    await page.keyboard.press("z");
    await expect(tool(page, "magnifier")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".ic-canvas")).toHaveAttribute("data-tool", "zoom");
    const compare = page.locator('[data-name="t-compare"] [data-value="direct"]');
    await expect(compare).toHaveAttribute("aria-pressed", "false");
    await tool(page, "compare").click();
    await expect(page.locator('[data-name="t-compare"] [data-value="direct"]')).toHaveAttribute("aria-pressed", "true");
  });
});
