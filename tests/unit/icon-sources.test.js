// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  SOURCE_URLS,
  createIconSources,
  hgAttrs,
  kebab,
  libNameOf,
  MAIN_ALIAS,
  MOD_ALIAS,
} from "@icon-studio/icon-sources";
import { TB_CATS } from "@icon-studio/icon-sources/catalog";
import { CUSTOM_ICONS } from "@icon-studio/icon-sources/custom";

const vendor = path.resolve(import.meta.dirname, "../fixtures/vendor");

/** fetch tiruan yang melayani fixture Tabler dan mencatat jumlah panggilan. */
function fixtureFetch() {
  const calls = [];
  /** @type {any} */
  const fn = async (/** @type {string} */ url) => {
    calls.push(url);
    const body = await readFile(
      path.join(vendor, "tabler-nodes-outline.json"),
      "utf8",
    );
    return { ok: true, json: async () => JSON.parse(body) };
  };
  return { fn, calls };
}

describe("@icon-studio/icon-sources", () => {
  test("kebab mengikuti penamaan legacy", () => {
    expect(kebab("Rocket01")).toBe("rocket-01");
    expect(kebab("ShoppingCart")).toBe("shopping-cart");
    expect(kebab("ABTesting")).toBe("ab-testing");
  });

  test("URL CDN berasal dari sources.json versi terkunci", () => {
    expect(SOURCE_URLS.tablerNodes).toContain("@tabler/icons@3.49.0");
    expect(SOURCE_URLS.hugeicons).toContain("core-free-icons@4.3.5");
    expect(SOURCE_URLS.lucideTags).toContain("lucide-static@1.52.0");
  });

  test("Tabler hanya memuat ikon kategori terpilih dan tanpa node stroke none", async () => {
    const { fn, calls } = fixtureFetch();
    const icons = createIconSources({ getLucide: () => null, fetch: fn });
    const [a, b] = await Promise.all([icons.loadTabler(), icons.loadTabler()]);
    expect(a).toBe(b);
    expect(calls).toHaveLength(1);
    expect(icons.tbState).toBe("ready");
    const allow = new Set(Object.values(TB_CATS).join(" ").split(" "));
    expect([...a.keys()].every((k) => allow.has(k))).toBe(true);
    expect(a.has("mail")).toBe(true);
    for (const node of a.values())
      expect(node.every(([, attrs]) => attrs.stroke !== "none")).toBe(true);
    expect(icons.SOURCES.tb.index()).toBe(a);
  });

  test("Tabler gagal dimuat menjadi state error tanpa melempar", async () => {
    const icons = createIconSources({
      getLucide: () => null,
      fetch: /** @type {any} */ (async () => ({ ok: false, status: 503 })),
    });
    expect(await icons.loadTabler()).toBeNull();
    expect(icons.tbState).toBe("error");
  });

  test("Hugeicons dinormalkan: nama kebab, atribut garis dibuang, currentColor fill jadi INK", async () => {
    const icons = createIconSources({
      getLucide: () => null,
      /* modul dimuat sebagai data URL tanpa komentar sourcemap, supaya Vitest tidak mencari berkas .map */
      importModule: async () => {
        const code = (
          await readFile(path.join(vendor, "hugeicons.mjs"), "utf8")
        ).replace(/\/\/# sourceMappingURL=.*$/m, "");
        return import(
          /* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
        );
      },
    });
    const index = await icons.loadHugeicons();
    expect(icons.hgState).toBe("ready");
    const rocket = index.get("rocket-01");
    expect(rocket.length).toBeGreaterThan(0);
    for (const [, attrs] of rocket) {
      expect(attrs).not.toHaveProperty("stroke-width");
      expect(attrs).not.toHaveProperty("key");
    }
    expect(icons.SOURCES.hg.cats().library.split(" ")).toContain("rocket-01");
    expect(
      hgAttrs({
        fill: "currentColor",
        strokeWidth: "1.5",
        fillRule: "evenodd",
      }),
    ).toEqual({
      fill: "INK",
      "fill-rule": "evenodd",
    });
  });

  test("Lucide diindeks dari objek global yang disuntik", () => {
    const icons = createIconSources({
      getLucide: () => ({
        icons: { MessageCircle: [["path", { d: "M0 0" }]], X: "bukan node" },
      }),
    });
    const index = icons.SOURCES.lu.index();
    expect([...index.keys()]).toEqual(["message-circle"]);
  });

  test("Library Kustom: sumber cu, LIB_RE, dan peran bawaan", () => {
    const plain = createIconSources({ getLucide: () => null });
    expect(plain.LIB_RE.test("cu:pour-over-dripper")).toBe(false);
    expect(Object.keys(plain.SOURCES)).toEqual(["lu", "tb", "hg"]);

    const icons = createIconSources({
      getLucide: () => null,
      custom: CUSTOM_ICONS,
    });
    expect(Object.keys(icons.SOURCES)).toEqual(["lu", "tb", "cu", "hg"]);
    expect(icons.LIB_RE.test("cu:pour-over-dripper")).toBe(true);
    const nodes = CUSTOM_ICONS.icons["pour-over-dripper"].nodes;
    const roles = icons.customRoles("cu:pour-over-dripper", nodes.length, [
      "ink",
      "acc",
      "fillA",
      "fill",
    ]);
    expect(roles).toHaveLength(nodes.length);
    expect(
      icons.customRoles("cu:pour-over-dripper", nodes.length + 1, ["ink"]),
    ).toBeNull();
    expect(icons.customRoles("lu:coffee", 1, ["ink"])).toBeNull();
  });

  test("libNameOf: prefiks pustaka dibuang, kunci bawaan memakai alias", () => {
    expect(libNameOf("tb:mail", "main", MAIN_ALIAS, MOD_ALIAS)).toBe("mail");
    expect(libNameOf("face", "main", MAIN_ALIAS, MOD_ALIAS)).toBe("mood-smile");
    expect(libNameOf("cross", "mod", MAIN_ALIAS, MOD_ALIAS)).toBe("x");
    expect(libNameOf("unknown", "mod", MAIN_ALIAS, MOD_ALIAS)).toBe("unknown");
  });
});
