// @ts-check
/**
 * Ekspor Canva per mesin (docs/EXPORT-PIPELINE.md bagian 2, docs/ENGINE-CONTRACT.md bagian 6).
 * ZIP Composer diunduh lewat Tinjau dengan folder `svg-asli/` aktif. Sejak Fase 5 (ADR-011) SVG di akar ZIP
 * sudah direct fill, jadi tes memeriksa strukturnya langsung (hanya path fill, tanpa stroke, ≤ maxColors) dan
 * membandingkan pikselnya dengan SVG asli (render mask) di `svg-asli/`.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openPanel } from "./studio-panels.js";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");
const H = { "access-control-allow-origin": "*" };

/** 20 ikon Lucide: bidang tertutup tunggal, banyak, lewat titik ujung berimpit, dan tanpa bidang (minus). */
const KEYS = [
  "house",
  "mail",
  "heart",
  "luggage",
  "wallet",
  "calendar",
  "shopping-cart",
  "star",
  "circle",
  "square",
  "bell",
  "camera",
  "cloud",
  "lock",
  "map-pin",
  "message-circle",
  "minus",
  "package",
  "truck",
  "user",
];
const DECO_SETS = [
  "tick",
  "tick+ground",
  "ground",
  "cloud+ground",
  "grass+ground",
  "tick+cloud",
];

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
    if (url.includes("lucide-static@1.52.0/tags.json"))
      return route.fulfill({
        path: `${VENDOR}/lucide-tags.json`,
        contentType: "application/json",
        headers: H,
      });
    if (url.includes("@tabler/icons@3.49.0/icons.json"))
      return route.fulfill({
        path: `${VENDOR}/tabler-icons.json`,
        contentType: "application/json",
        headers: H,
      });
    return route.abort();
  });
  await page.goto(`${APP}#/composer`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/**
 * Simpan set offset uji lewat model dokumen app, lalu muat ulang.
 * @param {import("@playwright/test").Page} page
 * @param {{mode: string, dx: number, dy: number}} params
 */
async function seedOffsetSet(page, params) {
  await page.evaluate(
    ({ keys, decoSets, params }) => {
      const S = /** @type {any} */ (window).__iconStudio;
      const lib = S.renderer.lib;
      const items = keys.map(
        (/** @type {string} */ k, /** @type {number} */ i) => {
          const set = decoSets[i % decoSets.length].split("+");
          const deco = {
            tick: set.includes("tick"),
            tickPos: i % 2 ? "TL" : "TR",
            ground: set.includes("ground"),
            cloud: set.includes("cloud"),
            grass: set.includes("grass"),
          };
          return S.document.normItem(
            {
              main: `lu:${k}`,
              mod: i % 3 ? "none" : "lu:plus",
              mx: 0,
              my: 0,
              name: `Uji ${k}`,
              engine: { offset: { deco } },
            },
            lib,
            { uid: () => `u${i}` },
          );
        },
      );
      const doc = S.document.createSetDocument(
        {
          id: "set-offset",
          name: "Offset uji",
          style: { family: "offset", engine: { offset: params } },
          items,
        },
        () => "x",
      );
      doc.review = { asli: true };
      S.store.saveState({
        schemaVersion: 1,
        documents: [doc],
        activeId: doc.id,
      });
    },
    { keys: KEYS, decoSets: DECO_SETS, params },
  );
  await page.reload();
  await expect(page.locator(".ic-page__card[data-select]")).toHaveCount(
    KEYS.length,
  );
}

/**
 * Unduh ZIP Canva dari Tinjau dan kembalikan isi SVG-nya: `canva` di akar ZIP, `asli` di folder svg-asli/.
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<{canva: Record<string, string>, asli: Record<string, string>}>}
 */
async function downloadSvgs(page) {
  await page.locator('.ic-persona[href="#/tinjau"]').click();
  await expect(page.locator(".ic-sheet__cell").first()).toBeVisible();
  await page.evaluate(() => {
    /** @type {any} */ (window).__dl = null;
    URL.createObjectURL = (blob) => {
      /** @type {any} */ (window).__dl = blob;
      return "blob:uji";
    };
    HTMLAnchorElement.prototype.click = () => {};
  });
  await openPanel(page, "tinjau-zip");
  await page.locator('[data-action="t-download"]').click();
  await page.waitForFunction(
    () => /** @type {any} */ (window).__dl instanceof Blob,
  );
  return page.evaluate(async () => {
    const zip = await /** @type {any} */ (window).JSZip.loadAsync(
      /** @type {any} */ (window).__dl,
    );
    /** @type {{canva: Record<string, string>, asli: Record<string, string>}} */
    const out = { canva: {}, asli: {} };
    for (const name of Object.keys(zip.files))
      if (name.endsWith(".svg")) {
        const svg = await zip.files[name].async("string");
        if (name.startsWith("svg-asli/")) out.asli[name.slice(9)] = svg;
        else out.canva[name] = svg;
      }
    return out;
  });
}


/**
 * Ukur SVG Canva di halaman: warna, struktur, kotak gabungan, dan selisih piksel terhadap SVG asli.
 * @param {import("@playwright/test").Page} page
 * @param {{canva: Record<string, string>, asli: Record<string, string>}} files
 */
function checkDirectFill(page, files) {
  return page.evaluate(async ({ canva, asli }) => {
        const raster = (/** @type {string} */ svg) =>
      new Promise((done, fail) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = c.height = 192;
          const g = /** @type {CanvasRenderingContext2D} */ (
            c.getContext("2d")
          );
          g.fillStyle = "#ffffff";
          g.fillRect(0, 0, 192, 192);
          g.drawImage(img, 0, 0, 192, 192);
          done(g.getImageData(0, 0, 192, 192).data);
        };
        img.onerror = () => fail(new Error("SVG tidak bisa dirender"));
        img.src =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(
            svg
              .replace(/^<\?xml[^>]*>\s*/, "")
              .replace(
                /width="[^"]*" height="[^"]*"/,
                'width="192" height="192"',
              ),
          );
      });
    const out = [];
    for (const [name, flat] of Object.entries(canva)) {
      const svg = asli[name];
      /** @type {string | null} */
      const error = svg ? null : "SVG asli tidak ada di svg-asli/";
      if (error) {
        out.push({ name, error });
        continue;
      }
      const body = flat.replace(/^<\?xml[^>]*>\s*/, "");
      const doc = new DOMParser().parseFromString(body, "image/svg+xml");
      const root = doc.documentElement;
      const children = [...root.children].map((c) => c.localName);
      const colors = [
        ...new Set(
          [...root.children].map((c) =>
            String(c.getAttribute("fill")).toLowerCase(),
          ),
        ),
      ];
      /* kotak gabungan semua bidang setelah outline, diukur di DOM */
      const host = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      host.setAttribute("viewBox", "0 0 48 48");
      host.style.position = "absolute";
      host.innerHTML = [...root.children]
        .map((c) => new XMLSerializer().serializeToString(c))
        .join("");
      document.body.append(host);
      const boxes = [...host.children].map((c) =>
        /** @type {SVGGraphicsElement} */ (c).getBBox(),
      );
      host.remove();
      const x0 = Math.min(...boxes.map((b) => b.x)),
        y0 = Math.min(...boxes.map((b) => b.y)),
        x1 = Math.max(...boxes.map((b) => b.x + b.width)),
        y1 = Math.max(...boxes.map((b) => b.y + b.height));
      const a = /** @type {Uint8ClampedArray} */ (await raster(svg)),
        b = /** @type {Uint8ClampedArray} */ (await raster(body));
      let diff = 0;
      for (let i = 0; i < a.length; i += 4)
        if (
          Math.max(
            Math.abs(a[i] - b[i]),
            Math.abs(a[i + 1] - b[i + 1]),
            Math.abs(a[i + 2] - b[i + 2]),
          ) > 48
        )
          diff++;
      out.push({
        name,
        error,
        viewBox: root.getAttribute("viewBox"),
        children: [...new Set(children)],
        colors,
        stroke: /\sstroke(?:-|=)/.test(body),
        dash: /stroke-dasharray/.test(body),
        banned:
          /<g\b|\stransform=|<mask\b|\smask=|<clipPath|<style|\sstyle=|<use\b/.test(
            body,
          ),
        bbox: [x0, y0, x1, y1],
        diff: diff / (a.length / 4),
      });
    }
    return out;
  }, files);
}

test.describe("Ekspor Canva · offset", () => {
  /* geser 8, -8 mendorong isi ke dekat kilat, sehingga knockout dekorasi ikut teruji */
  const CASES = [
    { mode: "solid", dx: 4, dy: 4 },
    { mode: "white", dx: 4, dy: 4 },
    { mode: "line", dx: 4, dy: 4 },
    { mode: "white", dx: 8, dy: -8 },
  ];
  for (const params of CASES) {
    test(`ZIP Composer offset ${params.mode} geser ${params.dx},${params.dy}: direct fill valid, ≤3 warna, hanya fill, dekorasi di dalam viewBox`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await open(page);
      await seedOffsetSet(page, params);
      const files = await downloadSvgs(page);
      expect(Object.keys(files.canva)).toHaveLength(KEYS.length);
      expect(Object.keys(files.asli).sort()).toEqual(Object.keys(files.canva).sort());
      for (const svg of Object.values(files.asli)) {
        expect(svg).toContain('viewBox="0 0 48 48"');
        expect(svg).not.toContain("stroke-dasharray");
      }
      const results = await checkDirectFill(page, files);
      for (const r of results) {
        expect(r.error, r.name).toBeNull();
        expect(r.viewBox, r.name).toBe("0 0 48 48");
        expect(r.children, r.name).toEqual(["path"]);
        expect(r.colors.length, r.name).toBeGreaterThanOrEqual(1);
        expect(r.colors.length, r.name).toBeLessThanOrEqual(3);
        expect(r.stroke, r.name).toBe(false);
        expect(r.dash, r.name).toBe(false);
        expect(r.banned, r.name).toBe(false);
        const [x0, y0, x1, y1] = /** @type {number[]} */ (r.bbox);
        expect(x0, r.name).toBeGreaterThanOrEqual(0);
        expect(y0, r.name).toBeGreaterThanOrEqual(0);
        expect(x1, r.name).toBeLessThanOrEqual(48);
        expect(y1, r.name).toBeLessThanOrEqual(48);
        expect(
          r.diff,
          `${r.name} selisih piksel mask vs direct fill`,
        ).toBeLessThan(0.015);
      }
    });
  }
});

test.describe("Ekspor Canva · classic dan accent diputar dan diskalakan", () => {
  for (const family of ["classic", "accent"]) {
    test(`ZIP Composer ${family} dengan rotasi per lapisan dan skala set: direct fill valid, ≤5 warna, hanya fill`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await open(page);
      await page.evaluate((family) => {
        const S = /** @type {any} */ (window).__iconStudio;
        const lib = S.renderer.lib;
        const rows = [
          {
            main: "face",
            mod: "bubble",
            slot: "BL",
            mr: 30,
            nr: -45,
            deco: { type: "spark", x: 9, y: 9, r: 60 },
          },
          {
            main: "clock",
            mod: "card",
            slot: "BR",
            mr: -90,
            mx: -3,
            my: -3,
            deco: { type: "star4", x: 40, y: 8, r: 15 },
          },
          { main: "bell", mod: "mail", slot: "TR", nr: 120, mx: -3, my: 3 },
          {
            main: "heart",
            mod: "plus",
            slot: "TL",
            mr: 180,
            nr: 90,
            deco: { type: "speed", x: 6, y: 36, r: -30 },
          },
        ];
        const items = rows.map((o, i) =>
          S.document.normItem({ ...o, name: `Putar ${i}` }, lib, {
            uid: () => `p${i}`,
          }),
        );
        const doc = S.document.createSetDocument(
          {
            id: "set-putar",
            name: "Putar uji",
            style: { family, scale: { main: 70, mod: 120, deco: 150 } },
            items,
          },
          () => "x",
        );
        doc.review = { asli: true };
        S.store.saveState({
          schemaVersion: 1,
          documents: [doc],
          activeId: doc.id,
        });
      }, family);
      await page.reload();
      await expect(page.locator(".ic-page__card[data-select]")).toHaveCount(4);
      const files = await downloadSvgs(page);
      expect(Object.keys(files.canva)).toHaveLength(4);
      for (const svg of Object.values(files.asli)) expect(svg).toContain("rotate(");
      const results = await checkDirectFill(page, files);
      for (const r of results) {
        expect(r.error, r.name).toBeNull();
        expect(r.children, r.name).toEqual(["path"]);
        expect(r.colors.length, r.name).toBeLessThanOrEqual(5);
        expect(r.stroke, r.name).toBe(false);
        expect(r.dash, r.name).toBe(false);
        expect(r.banned, r.name).toBe(false);
        expect(
          r.diff,
          `${r.name} selisih piksel mask vs direct fill`,
        ).toBeLessThan(0.02);
      }
    });
  }
});

test.describe("Ekspor Canva · sticker", () => {
  /* gaya bawaan, mode isi dan garis, dan nilai ekstrem: halo 5 + geser isi 2,5 menguji isi yang keluar dari halo */
  const CASES = [
    { mode: "sticker" },
    { mode: "fill", ink: "#2B3A67" },
    { mode: "line", sw: 3.6, spk: 6 },
    { mode: "sticker", sw: 1.4, halo: 5, off: 2.5, rays: false },
  ];
  const MODS = ["lu:plus", "lu:star", "lu:heart", "none"];
  const SLOTS = ["TR", "TC", "BL", "MR", "BR", "ML", "TL", "BC"];
  const FILLS = ["#E5484D", "#5AA9F8", "#6BD88A", "#F9D84A", "#F09A3E", "#FFFFFF"];
  for (const params of CASES) {
    test(`ZIP Composer sticker ${JSON.stringify(params)}: direct fill valid, ≤4 warna, hanya fill, di dalam viewBox`, async ({
      page,
    }) => {
      test.setTimeout(150_000);
      await open(page);
      await page.evaluate(
        ({ keys, params, mods, slots, fills }) => {
          const S = /** @type {any} */ (window).__iconStudio;
          const lib = S.renderer.lib;
          const items = keys.map((/** @type {string} */ k, /** @type {number} */ i) =>
            S.document.normItem(
              {
                main: `lu:${k}`,
                mod: mods[i % mods.length],
                slot: slots[i % slots.length],
                mx: (i % 3) - 1,
                my: 0.75,
                nx: i % 2 ? 0.75 : 0,
                ny: 0,
                name: `Uji ${k}`,
                engine: {
                  sticker: {
                    main: { c: fills[i % fills.length], s: 1.6 + (i % 4) * 0.1, fill: i % 7 === 3 ? "plate" : "auto" },
                    mod: { c: fills[(i + 2) % fills.length] },
                    deco: { seed: 3 + i * 7 },
                  },
                },
              },
              lib,
              { uid: () => `s${i}` },
            ),
          );
          const doc = S.document.createSetDocument(
            { id: "set-sticker", name: "Sticker uji", style: { family: "sticker", engine: { sticker: params } }, items },
            () => "x",
          );
          doc.review = { asli: true };
          S.store.saveState({ schemaVersion: 1, documents: [doc], activeId: doc.id });
        },
        { keys: KEYS, params, mods: MODS, slots: SLOTS, fills: FILLS },
      );
      await page.reload();
      await expect(page.locator(".ic-page__card[data-select]")).toHaveCount(KEYS.length);
      const files = await downloadSvgs(page);
      expect(Object.keys(files.canva)).toHaveLength(KEYS.length);
      for (const svg of Object.values(files.asli)) {
        expect(svg).toContain('viewBox="0 0 48 48"');
        expect(svg).not.toContain("stroke-dasharray");
      }
      const results = await checkDirectFill(page, files);
      for (const r of results) {
        expect(r.error, r.name).toBeNull();
        expect(r.viewBox, r.name).toBe("0 0 48 48");
        expect(r.children, r.name).toEqual(["path"]);
        expect(r.colors.length, r.name).toBeGreaterThanOrEqual(1);
        expect(r.colors.length, r.name).toBeLessThanOrEqual(4);
        expect(r.stroke, r.name).toBe(false);
        expect(r.dash, r.name).toBe(false);
        expect(r.banned, r.name).toBe(false);
        const [x0, y0, x1, y1] = /** @type {number[]} */ (r.bbox);
        expect(x0, r.name).toBeGreaterThanOrEqual(0);
        expect(y0, r.name).toBeGreaterThanOrEqual(0);
        expect(x1, r.name).toBeLessThanOrEqual(48);
        expect(y1, r.name).toBeLessThanOrEqual(48);
        expect(r.diff, `${r.name} selisih piksel mask vs direct fill`).toBeLessThan(0.015);
      }
    });
  }
});

test.describe("Ekspor Canva · set contoh lengkap (termasuk ticket bergaris putus-putus)", () => {
  for (const family of ["classic", "accent"]) {
    test(`ZIP Composer ${family} set contoh: semua ikon direct fill, dash ticket dipanggang jadi geometri`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await open(page);
      const n = await page.evaluate((family) => {
        const S = /** @type {any} */ (window).__iconStudio;
        const lib = S.renderer.lib;
        const items = S.document.PRESET.map((/** @type {any} */ o, /** @type {number} */ i) =>
          S.document.normItem(o, lib, { uid: () => `c${i}` }),
        );
        const doc = S.document.createSetDocument({ id: "set-contoh", name: "Set contoh", style: { family }, items }, () => "x");
        doc.review = { asli: true };
        S.store.saveState({ schemaVersion: 1, documents: [doc], activeId: doc.id });
        return items.length;
      }, family);
      await page.reload();
      await expect(page.locator(".ic-page__card[data-select]")).toHaveCount(n);
      const files = await downloadSvgs(page);
      /* semua ikon masuk ZIP Canva, termasuk ticket */
      expect(Object.keys(files.canva)).toHaveLength(n);
      const ticket = Object.keys(files.asli).find((f) => files.asli[f].includes("stroke-dasharray"));
      expect(ticket, "set contoh berisi ikon bergaris putus-putus").toBeTruthy();
      expect(files.canva[/** @type {string} */ (ticket)]).not.toContain("stroke-dasharray");
      const results = await checkDirectFill(page, files);
      for (const r of results) {
        expect(r.error, r.name).toBeNull();
        expect(r.children, r.name).toEqual(["path"]);
        expect(r.colors.length, r.name).toBeLessThanOrEqual(5);
        expect(r.stroke, r.name).toBe(false);
        expect(r.dash, r.name).toBe(false);
        expect(r.banned, r.name).toBe(false);
        expect(r.diff, `${r.name} selisih piksel mask vs direct fill`).toBeLessThan(0.015);
      }
    });
  }
});
