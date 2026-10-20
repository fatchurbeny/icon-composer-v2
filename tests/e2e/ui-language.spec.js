// @ts-check
/**
 * DESIGN-HANDOFF bagian 9 butir 5: tidak ada string UI berbahasa Inggris selain nama gaya, nama pustaka,
 * dan kunci ikon. Tes ini mengunjungi setiap persona dan tab panel Icon Studio, mengumpulkan teks
 * (termasuk panel tab yang tersembunyi dan isi tooltip `.ic-tip`) serta atribut aria-label, title, dan
 * placeholder, lalu mencocokkannya dengan daftar kata Inggris umum. Pengecualian ditulis eksplisit di
 * `ALLOWED` dan sesempit mungkin.
 */
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const APP = pathToFileURL(resolve("dist/icon-studio/index.html")).href;
const VENDOR = resolve("tests/fixtures/vendor");

/** Kata Inggris umum di UI yang harus diterjemahkan. Dicocokkan per kata utuh, tanpa beda huruf besar. */
const ENGLISH = [
  "Settings",
  "Setting",
  "Export",
  "Import",
  "Delete",
  "Add",
  "Remove",
  "Save",
  "Cancel",
  "Close",
  "Open",
  "Search",
  "Loading",
  "Error",
  "Warning",
  "Preview",
  "Layer",
  "Layers",
  "Color",
  "Colors",
  "Colour",
  "Size",
  "Select",
  "Undo",
  "Redo",
  "Zoom in",
  "Zoom out",
  "None",
  "Default",
  "Custom",
  "Edit",
  "File",
  "Files",
  "Download",
  "Upload",
  "Reset",
  "Apply",
  "Done",
  "Back",
  "Next",
  "Show",
  "Hide",
  "Clear",
  "Copy",
  "Paste",
  "Duplicate",
  "Rename",
  "New",
  "Empty",
  "Width",
  "Height",
  "Style",
  "Styles",
  "Page",
  "Pages",
  "Library",
  "Review",
  "Check",
  "Fix",
  "Filter",
  "Sort",
  "All",
  "Help",
];

/**
 * Pengecualian, sesempit mungkin. Setiap entri menghapus `pattern` dari teks sebelum dicocokkan, dan
 * bila `where` diisi hanya berlaku untuk string yang lokasinya cocok. Nama gaya (Classic, Accent, Offset,
 * Hand-writing) dan nama pustaka (Lucide, Tabler, Hugeicons) tidak mengandung kata di `ENGLISH`, jadi
 * hanya gabungannya dengan kata Inggris yang perlu didaftar.
 * @type {{pattern: RegExp, where?: RegExp, why: string}[]}
 */
const ALLOWED = [
  /* kunci ikon */
  {
    pattern: /\b(?:Lucide|Tabler|Hugeicons|Huge) [a-z0-9]+(?:-[a-z0-9]+)*/g,
    why: "kunci ikon pustaka di flag `= <Pustaka> <nama>`",
  },
  {
    pattern: /\b(?:TL|TC|TR|ML|MR|BL|BC|BR) · [a-z0-9]+(?:-[a-z0-9]+)*/g,
    why: "slot dan kunci pengubah di meta lapisan",
  },
  {
    pattern: /\b[a-z]{2}:[a-z0-9]+(?:-[a-z0-9]+)*/g,
    why: "kunci ikon berprefiks sumber (lu:, tb:, hg:, cu:)",
  },
  {
    pattern: /\b[a-z0-9]+(?:-[a-z0-9]+)+\b/g,
    why: "kunci ikon dan nama file kebab-case (file-lock, resource-page.html)",
  },
  /* nama gaya di metadata ekspor */
  {
    pattern: /\bOffset Style\b/gi,
    why: "kata gaya metadata Offset (judul dan tag Canva), keluaran ekspor dijaga golden",
  },
  /* istilah yang sudah dipakai di dokumen */
  {
    pattern: /\bResource Page\b/g,
    why: "istilah glosarium (docs/GLOSSARY.md), nama slide di ZIP Builder",
  },
  {
    pattern: /\bmode edit\b/gi,
    why: "nama persona Composer · Edit (DESIGN-HANDOFF bagian 2 dan 3.1)",
  },
  {
    pattern: /\bfile\b/g,
    why: "kata 'file' huruf kecil dipakai ui-kit.html dan DESIGN-HANDOFF ('Pilih file…', 'Nama file')",
  },
  {
    pattern: /Pengubah tidak tersedia pada style ini/g,
    why: "teks flag tetap DESIGN-HANDOFF bagian 6 dan keputusan pemilik di DECISIONS.md",
  },
  /* nama tombol fisik keyboard */
  {
    pattern: /^Delete$/,
    where: /^(?:tooltip|statusbar) text <b /,
    why: "nama tombol keyboard di gestur tooltip dan petunjuk bilah status, seperti Shift dan Esc",
  },
];

/** @param {import("@playwright/test").Page} page */
async function route(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*", (r) => {
    const url = r.request().url();
    if (url.startsWith("file:")) return r.continue();
    const json = (/** @type {string} */ file) =>
      r.fulfill({
        path: `${VENDOR}/${file}`,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("jszip"))
      return r.fulfill({
        path: `${VENDOR}/jszip.min.js`,
        contentType: "application/javascript",
      });
    if (url.includes("lucide.min.js"))
      return r.fulfill({
        path: `${VENDOR}/lucide.min.js`,
        contentType: "application/javascript",
      });
    if (url.includes("tabler-nodes-outline"))
      return json("tabler-nodes-outline.json");
    if (url.includes("core-free-icons"))
      return r.fulfill({
        path: `${VENDOR}/hugeicons.mjs`,
        contentType: "application/javascript",
        headers: { "access-control-allow-origin": "*" },
      });
    if (url.includes("lucide-static@1.52.0/tags.json"))
      return json("lucide-tags.json");
    if (url.includes("@tabler/icons@3.49.0/icons.json"))
      return json("tabler-icons.json");
    return r.abort();
  });
}

/**
 * Kumpulkan string UI di halaman: teks semua elemen di luar SVG/script/style (termasuk panel tab dan
 * tooltip tersembunyi), serta atribut aria-label, title, placeholder, dan alt.
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<{text: string, where: string}[]>}
 */
function collect(page) {
  return page.evaluate(() => {
    /** @type {{text: string, where: string}[]} */
    const out = [];
    const skip = (/** @type {Element | null} */ el) =>
      !!el?.closest("svg, script, style, template, noscript");
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (skip(el)) continue;
      const text = (n.textContent || "").trim();
      const tip = el?.closest(".ic-tip")
        ? "tooltip "
        : el?.closest(".ic-statusbar")
          ? "statusbar "
          : "";
      if (text)
        out.push({
          text,
          where: `${tip}text <${el?.tagName.toLowerCase()} class="${el?.className}">`,
        });
    }
    for (const el of document.querySelectorAll(
      "[aria-label], [title], [placeholder], [alt]",
    )) {
      if (el.closest("script, style, template")) continue;
      for (const attr of ["aria-label", "title", "placeholder", "alt"]) {
        const v = el.getAttribute(attr);
        if (v?.trim())
          out.push({
            text: v.trim(),
            where: `${attr} <${el.tagName.toLowerCase()} class="${el.getAttribute("class") || ""}">`,
          });
      }
    }
    for (const t of document.querySelectorAll("title"))
      if (!t.closest("svg") && t.textContent?.trim())
        out.push({ text: t.textContent.trim(), where: "document title" });
    return out;
  });
}

const WORDS = ENGLISH.map((w) => ({
  w,
  re: new RegExp(
    `(^|[^\\p{L}\\p{N}])${w.replace(" ", "\\s+")}(?=$|[^\\p{L}\\p{N}])`,
    "iu",
  ),
}));

/** @param {string} text @param {string} [where] */
function englishIn(text, where = "") {
  let rest = text;
  for (const a of ALLOWED)
    if (!a.where || a.where.test(where)) rest = rest.replace(a.pattern, " ");
  return WORDS.filter(({ re }) => re.test(rest)).map(({ w }) => w);
}

/**
 * Klik setiap tab di setiap panel bertab agar panel yang dirender saat tab dibuka ikut terkumpul.
 * @param {import("@playwright/test").Page} page
 * @param {string} state
 * @param {Map<string, Set<string>>} found
 */
async function sweep(page, state, found) {
  const record = async (/** @type {string} */ label) => {
    for (const { text, where } of await collect(page)) {
      const hits = englishIn(text, where);
      if (!hits.length) continue;
      const key = `${JSON.stringify(text)} · ${where}`;
      if (!found.has(key)) found.set(key, new Set());
      found.get(key)?.add(`${label} [${hits.join(", ")}]`);
    }
  };
  await record(state);
  const initial = await page
    .locator('.ic-panel [role="tab"][aria-selected="true"]')
    .evaluateAll((els) => els.map((el) => el.id));
  /* kolom studio akordeon: catat panel yang terbuka, karena klik tab di panel tertutup membukanya */
  const openPanels = await page
    .locator(
      '.ic-panel > .ic-panel__head > .ic-panel__collapse[aria-expanded="true"]',
    )
    .evaluateAll((els) =>
      els.map((el) => el.closest(".ic-panel")?.getAttribute("data-panel")),
    );
  const tabs = page.locator('.ic-panel [role="tab"]');
  const n = await tabs.count();
  for (let i = 0; i < n; i++) {
    const tab = tabs.nth(i);
    if (!(await tab.isVisible())) continue;
    const id = await tab.getAttribute("data-value");
    await tab.click();
    await record(`${state} · tab ${id}`);
  }
  /* kembalikan tab awal agar tombol di tab itu bisa diklik lagi */
  for (const id of initial) await page.locator(`[id="${id}"]`).click();
  for (const id of openPanels) {
    const btn = page.locator(
      `[data-panel="${id}"] > .ic-panel__head > .ic-panel__collapse`,
    );
    if ((await btn.getAttribute("aria-expanded")) === "false")
      await btn.click();
  }
}

/**
 * Tunggu sampai kerangka persona tujuan selesai dirender. Rute berubah lewat hash, dan shell baru merender
 * saat event hashchange (asinkron), jadi URL bisa sudah berganti sementara DOM masih milik persona lama.
 * @param {import("@playwright/test").Page} page
 * @param {string} persona
 * @param {boolean} [edit] Composer · Edit (artboard tampil)
 */
async function rendered(page, persona, edit = false) {
  await expect(
    page.locator(`.ic-shell[data-persona="${persona}"]`),
  ).toHaveCount(1);
  if (edit) await expect(page.locator(".ic-artboard")).toBeVisible();
  else await expect(page.locator(".ic-artboard")).toHaveCount(0);
}

test.describe("Icon Studio · teks UI berbahasa Indonesia", () => {
  test("tidak ada kata Inggris umum di semua persona dan tab panel", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await route(page);
    /** @type {Map<string, Set<string>>} */
    const found = new Map();

    /* Composer kosong, lalu set contoh */
    await page.goto(`${APP}#/composer`);
    await rendered(page, "composer");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await sweep(page, "composer kosong", found);
    await page.click('[data-action="load-preset"]');
    await sweep(page, "composer set contoh", found);

    /* Composer · Edit */
    await page.locator(".ic-page__card[data-open]").nth(2).dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await rendered(page, "composer", true);
    await sweep(page, "composer edit", found);

    /* Kombinasi dan Tinjau dari set contoh */
    await page.goto(`${APP}#/kombinasi`);
    await rendered(page, "kombinasi");
    await sweep(page, "kombinasi", found);
    await page.goto(`${APP}#/tinjau`);
    await rendered(page, "tinjau");
    await sweep(page, "tinjau set", found);

    /* Gaya Offset di Composer, Edit, Kombinasi, dan Tinjau */
    await page.goto(`${APP}#/composer`);
    await rendered(page, "composer");
    await page
      .locator('[data-panel="composer-style"] [role="tab"][data-value="gaya"]')
      .click();
    await page.locator('.ic-engine[data-value="offset"]').click();
    await expect(
      page.locator('.ic-engine[data-value="offset"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await sweep(page, "composer offset", found);
    await page.locator(".ic-page__card[data-open]").first().dblclick();
    await expect(page).toHaveURL(/#\/composer\/edit\//);
    await rendered(page, "composer", true);
    await sweep(page, "composer edit offset", found);
    await page.goto(`${APP}#/kombinasi`);
    await rendered(page, "kombinasi");
    await sweep(page, "kombinasi offset", found);
    await page.goto(`${APP}#/tinjau`);
    await rendered(page, "tinjau");
    await sweep(page, "tinjau offset", found);

    /* Builder: kosong, manifest contoh, lalu setiap langkah */
    await page.goto(`${APP}#/builder`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await sweep(page, "builder kosong", found);
    await page.locator('[data-action="import-sample"]').click();
    await sweep(page, "builder manifest contoh", found);
    for (const step of ["import", "check", "export"]) {
      await page
        .locator(`.ic-steps [data-action="b-step"][data-step="${step}"]`)
        .click();
      await sweep(page, `builder langkah ${step}`, found);
    }
    await page.goto(`${APP}#/tinjau`);
    await rendered(page, "tinjau");
    await sweep(page, "tinjau manifest", found);

    const report = [...found].map(
      ([key, where]) =>
        `${key}\n    di: ${[...where].slice(0, 2).join(" | ")}${where.size > 2 ? ` (+${where.size - 2})` : ""}`,
    );
    expect(report, `Teks UI berbahasa Inggris:\n${report.join("\n")}`).toEqual(
      [],
    );
  });

  test("pencocok menangkap kata Inggris dan menghormati pengecualian", () => {
    expect(englishIn("Export ZIP")).toEqual(["Export"]);
    expect(englishIn("Ekspor ZIP")).toEqual([]);
    expect(englishIn("Zoom in")).toContain("Zoom in");
    expect(englishIn("Additional")).toEqual([]);
    expect(englishIn("= Lucide file-lock")).toEqual([]);
    expect(englishIn("Delete", 'tooltip text <b class="">')).toEqual([]);
    expect(englishIn("Delete", 'statusbar text <b class="">')).toEqual([]);
    expect(englishIn("Delete", "text <button>")).toEqual(["Delete"]);
    expect(englishIn("Pilih File")).toEqual(["File"]);
    expect(englishIn("Edit ikon")).toEqual(["Edit"]);
  });
});
