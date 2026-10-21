// @ts-check
/**
 * Alur Builder di Icon Studio (Fase 2b langkah 5): impor, periksa, perbaiki, ekspor ZIP.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");

/** @param {import("@playwright/test").Page} page */
async function open(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("file:")) return route.continue();
    if (url.includes("jszip"))
      return route.fulfill({
        path: `${VENDOR}/jszip.min.js`,
        contentType: "application/javascript",
      });
    if (url.includes("lucide.min.js"))
      return route.fulfill({
        path: `${VENDOR}/lucide.min.js`,
        contentType: "application/javascript",
      });
    if (url.includes("tabler-nodes-outline"))
      return route.fulfill({
        path: `${VENDOR}/tabler-nodes-outline.json`,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("core-free-icons"))
      return route.fulfill({
        path: `${VENDOR}/hugeicons.mjs`,
        contentType: "application/javascript",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("lucide-static@1.52.0/tags.json"))
      return route.fulfill({
        path: `${VENDOR}/lucide-tags.json`,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("@tabler/icons@3.49.0/icons.json"))
      return route.fulfill({
        path: `${VENDOR}/tabler-icons.json`,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    return route.abort();
  });
  await page.goto(`${APP}#/builder`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test.describe("Icon Studio · Builder", () => {
  test("impor contoh: kartu per slide, filter, dan pratinjau gaya", async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(".ic-dropzone")).toBeVisible();
    await page.locator('[data-action="import-sample"]').click();
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Periksa",
    );
    const cards = page.locator(".ic-iconcard[data-select]");
    const total = await cards.count();
    expect(total).toBeGreaterThan(20);
    await expect(page.locator(".ic-slidegroup").first()).toBeVisible();
    await page.locator('input[data-name="b-group"]').uncheck();
    await expect(page.locator(".ic-slidegroup")).toHaveCount(0);
    await expect(cards).toHaveCount(total);
    await page
      .locator('[data-name="b-filter"] button[data-value="extra"]')
      .click();
    const extra = await cards.count();
    expect(extra).toBeLessThan(total);
    await page
      .locator('[data-name="b-filter"] button[data-value="all"]')
      .click();
    const before = await cards
      .first()
      .locator("svg")
      .first()
      .getAttribute("stroke-width");
    const trigger = page.locator('[data-name="b-preview"] .ic-select__trigger');
    await trigger.click();
    await page
      .locator('[data-name="b-preview"] [role="option"][data-value="A"]')
      .click();
    await expect(cards.first().locator("svg").first()).not.toHaveAttribute(
      "stroke-width",
      before || "",
    );
  });

  test("nama tak dikenal diberi saran dan bisa diperbaiki", async ({
    page,
  }) => {
    await open(page);
    const manifest = {
      format: "tib-manifest",
      version: 2,
      deck: { title: "Uji", slides: 1 },
      pack: { en: "Test", id: "Uji" },
      style: { family: "classic", mode: "A" },
      icons: [
        {
          id: "satu",
          name: { en: "One", id: "Satu" },
          main: "lu:umbrela",
          mod: "check",
          anchor: "BR",
          slides: [1],
        },
      ],
    };
    await page
      .locator('[data-name="manifest-text"]')
      .fill(JSON.stringify(manifest));
    await page.locator('[data-action="import-text"]').click();
    await expect(page.locator(".ic-iconcard .ic-flag")).toHaveText("masalah");
    await page.click(
      '[data-panel="builder-icon"] [role="tab"][data-value="manifest"]',
    );
    const fix = page.locator('[data-action="b-fix"]');
    await expect(fix).toContainText("lu:umbrella");
    await fix.click();
    await expect(page.locator(".ic-iconcard .ic-flag")).toHaveCount(0);
  });

  test("ubah id dan keluarkan ikon dari pack", async ({ page }) => {
    await open(page);
    await page.locator('[data-action="import-sample"]').click();
    const id = page.locator('[data-name="b-id"] input');
    await id.fill("Ikon Baru Uji");
    await id.press("Enter");
    await expect(
      page.locator('.ic-iconcard[aria-selected="true"] .ic-iconcard__id'),
    ).toHaveText("ikon-baru-uji");
    await page.locator('input[data-name="b-on"]').uncheck();
    await expect(
      page.locator('.ic-iconcard[aria-selected="true"] .ic-flag'),
    ).toHaveText("keluar");
  });

  test("langkah Ekspor: lembar Resource Page dan unduh ZIP", async ({
    page,
  }) => {
    await open(page);
    await page.locator('[data-action="import-sample"]').click();
    await page.locator('.ic-topbar [data-action="export"]').click();
    await expect(page.locator('.ic-step[aria-current="step"]')).toContainText(
      "Ekspor",
    );
    const cells = page.locator(".ic-sheet__cell");
    const included = await page
      .locator('.ic-sheet__cell[aria-pressed="true"]')
      .count();
    expect(included).toBeGreaterThan(0);
    await cells.first().click();
    await expect(
      page.locator('.ic-sheet__cell[aria-pressed="true"]'),
    ).toHaveCount(included - 1);
    await page.evaluate(() => {
      window.__zip = null;
      URL.createObjectURL = (blob) => {
        window.__zip = blob;
        return "blob:uji";
      };
      HTMLAnchorElement.prototype.click = () => {};
    });
    await openPanel(page, "builder-export");
    await page.locator('[data-action="b-export"]').click();
    await page
      .waitForFunction(() => window.__zip instanceof Blob, null, {
        timeout: 15000,
      })
      .catch(async () => {
        throw new Error(
          "ZIP tidak terbuat: " +
            (await page.locator('[data-role="export-status"]').textContent()),
        );
      });
    const names = await page.evaluate(async () =>
      Object.keys((await window.JSZip.loadAsync(window.__zip)).files),
    );
    for (const f of [
      "metadata.csv",
      "metadata-internal.csv",
      "submission-profile.json",
      "resource-page.html",
      "manifest-final.json",
      "LICENSES.txt",
    ])
      expect(names).toContain(f);
    expect(
      names.some((n) => n.startsWith("aksen/slot-deck/") && n.endsWith(".svg")),
    ).toBe(true);
    await expect(page.locator('[data-role="export-status"]')).toContainText(
      "diekspor",
    );
  });

  test("gaya Offset: pratinjau, flag info pengubah, dan ZIP direct fill tanpa stroke", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await open(page);
    const keys = ["house", "heart", "luggage", "mail", "calendar", "minus"];
    const manifest = {
      format: "tib-manifest",
      version: 2,
      deck: { title: "Uji Offset", slides: 1 },
      pack: { en: "Finance", id: "Keuangan" },
      style: { family: "offset", mode: "white", accent: "#B8405A" },
      icons: keys.map((k, i) => ({
        id: k,
        name: { en: k, id: k },
        main: `lu:${k}`,
        mod: i % 2 ? "none" : "check",
        anchor: "BR",
        slides: [1],
      })),
    };
    await page
      .locator('[data-name="manifest-text"]')
      .fill(JSON.stringify(manifest));
    await page.locator('[data-action="import-text"]').click();
    const cards = page.locator(".ic-iconcard[data-select]");
    await expect(cards).toHaveCount(keys.length);
    /* manifest family offset memilih pratinjau Offset */
    await expect(
      page.locator('[data-name="b-preview"] .ic-select__trigger'),
    ).toContainText("Offset");
    /* info pengubah tidak memberi lencana; tanpa pengubah tidak lagi err di offset.
       Hanya minus (tanpa bidang tertutup) yang perlu dicek. */
    await expect(page.locator(".ic-iconcard .ic-flag")).toHaveCount(1);
    await expect(
      page.locator('.ic-iconcard:has-text("minus") .ic-flag'),
    ).toHaveText("cek");
    await expect(
      page.locator('[data-name="b-filter"] button[data-value="bad"]'),
    ).toContainText("1");
    await cards.first().click();
    const iconPanel = page.locator('[data-panel="builder-icon"]');
    await expect(
      iconPanel.locator('.ic-alert[data-level="info"]'),
    ).toContainText("Pengubah tidak tersedia pada style ini");
    await expect(iconPanel.locator('[data-name="b-ofill"]')).toBeVisible();
    await expect(
      iconPanel.locator('[data-name="b-ofill"] [aria-pressed="true"]'),
    ).toHaveText("Putih");
    await page.click(
      '[data-panel="builder-rep"] [role="tab"][data-value="flag"]',
    );
    await expect(
      page.locator('[data-panel="builder-rep"] .ic-alert[data-level="info"]'),
    ).toContainText("Pengubah tidak tersedia pada style ini");

    await page.locator('.ic-topbar [data-action="export"]').click();
    const exportPanel = page.locator('[data-panel="builder-export"]');
    await expect(
      exportPanel.locator('[data-name="b-mode:O"] input'),
    ).toBeChecked();
    await expect(
      exportPanel.locator('.ic-alert[data-level="info"]'),
    ).toContainText("Pengubah 3 ikon diabaikan");
    await page.evaluate(() => {
      window.__zip = null;
      URL.createObjectURL = (blob) => {
        window.__zip = blob;
        return "blob:uji";
      };
      HTMLAnchorElement.prototype.click = () => {};
    });
    await openPanel(page, "builder-export");
    await page.locator('[data-action="b-export"]').click();
    await page
      .waitForFunction(() => window.__zip instanceof Blob, null, {
        timeout: 30000,
      })
      .catch(async () => {
        throw new Error(
          "ZIP tidak terbuat: " +
            (await page.locator('[data-role="export-status"]').textContent()),
        );
      });
    const zip = await page.evaluate(async () => {
      const z = await window.JSZip.loadAsync(window.__zip);
      /** @type {Record<string, string>} */
      const out = {};
      for (const n of Object.keys(z.files))
        if (!z.files[n].dir) out[n] = await z.files[n].async("string");
      return out;
    });
    const svgs = Object.keys(zip).filter((n) => n.endsWith(".svg"));
    expect(svgs.sort()).toEqual(
      keys.map((k) => `offset/slot-deck/${k}-offset.svg`).sort(),
    );
    const checks = await page.evaluate(
      (files) =>
        files.map(([name, svg]) => {
          const S = /** @type {any} */ (window).__iconStudio;
          const body = svg.replace(/^<\?xml[^>]*>\s*/, "");
          const root = new DOMParser().parseFromString(
            body,
            "image/svg+xml",
          ).documentElement;
          let again = null;
          try {
            S.directFillSvgFile(svg);
          } catch (e) {
            again = /** @type {Error} */ (e).message;
          }
          return {
            name,
            again,
            viewBox: root.getAttribute("viewBox"),
            children: [...new Set([...root.children].map((c) => c.localName))],
            colors: new Set(
              [...root.children].map((c) => c.getAttribute("fill")),
            ).size,
            stroke: /\sstroke(?:-|=)/.test(body),
            dash: /stroke-dasharray/.test(body),
            banned:
              /<g\b|\stransform=|<mask\b|\smask=|<clipPath|<style|\sstyle=|<use\b/.test(
                body,
              ),
          };
        }),
      svgs.map((n) => [n, zip[n]]),
    );
    for (const r of checks) {
      expect(r.again, r.name).toBeNull();
      expect(r.viewBox, r.name).toBe("0 0 48 48");
      expect(r.children, r.name).toEqual(["path"]);
      expect(r.colors, r.name).toBeGreaterThanOrEqual(1);
      expect(r.colors, r.name).toBeLessThanOrEqual(5);
      expect(r.stroke, r.name).toBe(false);
      expect(r.dash, r.name).toBe(false);
      expect(r.banned, r.name).toBe(false);
    }
    expect(zip["metadata.csv"]).toContain("House Finance Offset Style Icon");
    expect(zip["metadata-internal.csv"]).toContain('"offset"');
    expect(JSON.parse(zip["manifest-final.json"]).style).toMatchObject({
      family: "offset",
      mode: "white",
    });
    expect(JSON.parse(zip["submission-profile.json"]).offset_engine).toBe(
      "1.1.0",
    );
    expect(zip["LICENSES.txt"]).toContain("offset/");
  });
  test("gaya Sticker: pratinjau, slot 4 sudut, dan ZIP sticker/ direct fill ≤4 warna", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await open(page);
    /* pasangan tanpa nama gabungan di Lucide/Tabler (mis. house-plus), supaya tidak dilewati sebagai bermasalah */
    const keys = ["house", "heart", "luggage", "mail", "anchor", "minus"];
    const manifest = {
      format: "tib-manifest",
      version: 2,
      deck: { title: "Uji Sticker", slides: 1 },
      pack: { en: "Travel", id: "Wisata" },
      style: { family: "sticker", mode: "sticker", accent: "#5AA9F8" },
      icons: keys.map((k, i) => ({
        id: k,
        name: { en: k, id: k },
        main: `lu:${k}`,
        mod: i % 2 ? "lu:zap" : "lu:sun",
        anchor: i % 3 ? "TC" : "BL",
        slides: [1],
      })),
    };
    await page
      .locator('[data-name="manifest-text"]')
      .fill(JSON.stringify(manifest));
    await page.locator('[data-action="import-text"]').click();
    const cards = page.locator(".ic-iconcard[data-select]");
    await expect(cards).toHaveCount(keys.length);
    /* manifest family sticker memilih pratinjau Sticker */
    await expect(
      page.locator('[data-name="b-preview"] .ic-select__trigger'),
    ).toContainText("Sticker");
    /* halo putih, isi aksen manifest, isi pengubah kuning */
    const art = cards.first().locator("svg");
    await expect(art.locator('g[fill="#FFFFFF"]').first()).toBeAttached();
    await expect(art.locator('g[fill="#5AA9F8"]').first()).toBeAttached();
    await expect(art.locator('g[fill="#F9D84A"]').first()).toBeAttached();
    await cards.nth(1).click();
    const iconPanel = page.locator('[data-panel="builder-icon"]');
    await expect(iconPanel.locator('[data-name="b-sfill"]')).toBeVisible();
    await expect(
      iconPanel.locator('[data-name="b-sfill"] [aria-pressed="true"]'),
    ).toHaveText("Stiker");
    await expect(
      iconPanel.locator('.ic-alert[data-level="info"]', { hasText: "Posisi pengubah" }),
    ).toContainText("Posisi pengubah TC dipetakan ke TR");

    await page.locator('.ic-topbar [data-action="export"]').click();
    const exportPanel = page.locator('[data-panel="builder-export"]');
    await expect(
      exportPanel.locator('[data-name="b-mode:S"] input'),
    ).toBeChecked();
    await page.evaluate(() => {
      window.__zip = null;
      URL.createObjectURL = (blob) => {
        window.__zip = blob;
        return "blob:uji";
      };
      HTMLAnchorElement.prototype.click = () => {};
    });
    await openPanel(page, "builder-export");
    await page.locator('[data-action="b-export"]').click();
    await page
      .waitForFunction(() => window.__zip instanceof Blob, null, {
        timeout: 30000,
      })
      .catch(async () => {
        throw new Error(
          "ZIP tidak terbuat: " +
            (await page.locator('[data-role="export-status"]').textContent()),
        );
      });
    const zip = await page.evaluate(async () => {
      const z = await window.JSZip.loadAsync(window.__zip);
      /** @type {Record<string, string>} */
      const out = {};
      for (const n of Object.keys(z.files))
        if (!z.files[n].dir) out[n] = await z.files[n].async("string");
      return out;
    });
    const svgs = Object.keys(zip).filter((n) => n.endsWith(".svg"));
    expect(svgs.sort()).toEqual(
      keys.map((k) => `sticker/slot-deck/${k}-sticker.svg`).sort(),
    );
    for (const name of svgs) {
      const body = zip[name].replace(/^<\?xml[^>]*>\s*/, "");
      expect(body, name).toContain('viewBox="0 0 48 48"');
      expect(body, name).not.toMatch(/\sstroke(?:-|=)|stroke-dasharray|<g\b|\stransform=|<mask\b|\smask=|<clipPath|<style|\sstyle=|<use\b/);
      const fills = new Set([...body.matchAll(/<path [^>]*fill="([^"]+)"/g)].map((m) => m[1].toUpperCase()));
      expect(fills.size, name).toBeGreaterThanOrEqual(2);
      expect(fills.size, name).toBeLessThanOrEqual(4);
    }
    expect(zip["metadata.csv"]).toContain("House Travel Sticker Style Icon");
    expect(zip["metadata-internal.csv"]).toContain('"sticker"');
    expect(JSON.parse(zip["manifest-final.json"]).style).toMatchObject({
      family: "sticker",
      mode: "sticker",
    });
    expect(JSON.parse(zip["submission-profile.json"]).sticker_engine).toBe(
      "1.1.0",
    );
    expect(zip["LICENSES.txt"]).toContain("sticker/");
  });

  test("flag info Offset memakai varian info kit, bukan teks polos", async ({
    page,
  }) => {
    await open(page);
    const manifest = {
      format: "tib-manifest",
      version: 2,
      deck: { title: "Uji info", slides: 1 },
      style: { family: "offset", mode: "white", accent: "#B8405A" },
      icons: [{ id: "house", name: { en: "house", id: "rumah" }, main: "lu:house", mod: "check", anchor: "BR", slides: [1] }],
    };
    await page
      .locator('[data-name="manifest-text"]')
      .fill(JSON.stringify(manifest));
    await page.locator('[data-action="import-text"]').click();
    await page.locator(".ic-iconcard[data-select]").first().click();
    await page.click(
      '[data-panel="builder-rep"] [role="tab"][data-value="flag"]',
    );
    /** @param {import("@playwright/test").Locator} panel */
    const styleOf = (panel) =>
      panel.locator('.ic-alert[data-level="info"]').first().evaluate((el) => {
        const cs = getComputedStyle(el);
        const dot = el.querySelector('.ic-dot[data-level="info"]');
        const root = getComputedStyle(document.documentElement);
        return {
          bg: cs.backgroundColor,
          shadow: cs.boxShadow,
          color: cs.color,
          dot: dot ? getComputedStyle(dot).backgroundColor : "",
          card: root.getPropertyValue("--ic-bg-card").trim(),
        };
      });
    const flag = await styleOf(page.locator('[data-panel="builder-rep"]'));
    /* teks polos: latar transparan, tanpa garis, titik tidak berwarna */
    expect(flag.bg).toBe("rgb(34, 34, 34)");
    expect(flag.card.toUpperCase()).toBe("#222222");
    expect(flag.shadow).not.toBe("none");
    expect(flag.dot).not.toBe("rgba(0, 0, 0, 0)");
    expect(flag.color).toBe("rgb(207, 207, 207)");

    await page.locator('.ic-topbar [data-action="export"]').click();
    const exp = await styleOf(page.locator('[data-panel="builder-export"]'));
    expect(exp).toEqual(flag);
  });
  test("gaya Hand-writing: pratinjau, flag objek bawaan, dan ZIP direct fill tanpa stroke", async ({ page }) => {
    test.setTimeout(90_000);
    await open(page);
    const keys = ["house", "heart", "luggage", "mail", "calendar", "pizza"];
    const manifest = {
      format: "tib-manifest",
      version: 2,
      deck: { title: "Uji Hand-writing", slides: 1 },
      pack: { en: "Finance", id: "Keuangan" },
      style: { family: "coret", accent: "#F28B82", ink: "#2B1D2E" },
      icons: [
        ...keys.map((k, i) => ({ id: k, name: { en: k, id: k }, main: `lu:${k}`, mod: i % 2 ? "none" : "lu:sparkle", anchor: i % 3 ? "BR" : "TL", slides: [1] })),
        { id: "wajah", name: { en: "face", id: "wajah" }, main: "face", mod: "none", anchor: "BR", slides: [1] },
      ],
    };
    await page.locator('[data-name="manifest-text"]').fill(JSON.stringify(manifest));
    await page.locator('[data-action="import-text"]').click();
    const cards = page.locator(".ic-iconcard[data-select]");
    await expect(cards).toHaveCount(keys.length + 1);
    /* manifest family coret (lama) memilih pratinjau Hand-writing */
    await expect(page.locator('[data-name="b-preview"] .ic-select__trigger')).toContainText("Hand-writing");
    /* hanya objek bawaan yang bermasalah; tanpa pengubah bukan masalah di hand-writing */
    await expect(page.locator(".ic-iconcard .ic-flag")).toHaveCount(1);
    await expect(page.locator('.ic-iconcard:has-text("wajah") .ic-flag')).toHaveText("masalah");
    const svg = await cards.first().locator("svg").first().evaluate((el) => el.outerHTML);
    expect(svg).not.toMatch(/stroke-dasharray|pathLength/);
    expect(svg).toContain('fill="#F28B82"');
    await cards.first().click();
    await expect(page.locator('[data-panel="builder-icon"]')).toContainText("Gaya Hand-writing");

    await page.locator('.ic-topbar [data-action="export"]').click();
    const exportPanel = page.locator('[data-panel="builder-export"]');
    await expect(exportPanel.locator('[data-name="b-mode:H"] input')).toBeChecked();
    await page.evaluate(() => {
      window.__zip = null;
      URL.createObjectURL = (blob) => {
        window.__zip = blob;
        return "blob:uji";
      };
      HTMLAnchorElement.prototype.click = () => {};
    });
    await openPanel(page, "builder-export");
    await page.locator('[data-action="b-export"]').click();
    await page.waitForFunction(() => window.__zip instanceof Blob, null, { timeout: 30000 }).catch(async () => {
      throw new Error("ZIP tidak terbuat: " + (await page.locator('[data-role="export-status"]').textContent()));
    });
    const zip = await page.evaluate(async () => {
      const z = await window.JSZip.loadAsync(window.__zip);
      /** @type {Record<string, string>} */
      const out = {};
      for (const n of Object.keys(z.files)) if (!z.files[n].dir) out[n] = await z.files[n].async("string");
      return out;
    });
    const svgs = Object.keys(zip).filter((n) => n.endsWith(".svg"));
    /* objek bawaan dilewati (Lewati ikon bermasalah) */
    expect(svgs.sort()).toEqual(keys.map((k) => `hand-writing/slot-deck/${k}-hand-writing.svg`).sort());
    for (const n of svgs) {
      const body = zip[n].replace(/^<\?xml[^>]*>\s*/, "");
      expect(body, n).toContain('viewBox="0 0 48 48"');
      expect(/\sstroke(?:-|=)/.test(body), n).toBe(false);
      expect(/stroke-dasharray|<g\b|\stransform=|<mask\b|\smask=/.test(body), n).toBe(false);
      const colors = new Set([...body.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()));
      expect(colors.size, n).toBeGreaterThanOrEqual(1);
      expect(colors.size, n).toBeLessThanOrEqual(3);
    }
    expect(zip["metadata.csv"]).toContain("House Finance Hand-writing Style Icon");
    expect(zip["metadata-internal.csv"]).toContain('"hand-writing"');
    expect(zip["metadata-internal.csv"]).toContain('"lu:sparkle"');
    const final = JSON.parse(zip["manifest-final.json"]);
    expect(final.style).toMatchObject({ family: "hand-writing", engine: { "hand-writing": { acc: "#F28B82", ink: "#2B1D2E", gap: 9 } } });
    expect(final.icons[0].engine["hand-writing"]).toEqual({ ms: 0.5, blob: "auto", seed: 1 });
    expect(JSON.parse(zip["submission-profile.json"]).hand_writing_engine).toBe("2.0.0");
    expect(zip["LICENSES.txt"]).toContain("hand-writing/");
  });
});
