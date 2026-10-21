// @ts-check
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { beforeAll, describe, expect, test } from "vitest";
import {
  FILL_SHAPE_SEED,
  createFillShapes,
  decodeFillShapes,
  fillShapeOf,
  fillShapeVersions,
  loadFillShapes,
} from "@icon-studio/icon-sources/fill-shapes";

const root = path.resolve(import.meta.dirname, "../..");
const dataFile = path.join(root, "packages/icon-sources/data/fill-shapes.json");

describe("pemuat bentuk isi (createFillShapes)", () => {
  const sample = { versions: { lucide: "1", tabler: "2" }, lu: { mail: "<rect/>" }, tb: { "ad-2": "~<path/>" } };

  test("sebelum termuat hanya seed yang terjawab; setelah termuat data dipakai", async () => {
    let calls = 0;
    const fs = createFillShapes(async () => (calls++, { default: sample }));
    expect(fs.state()).toBe("idle");
    expect(fs.ready("lu:mail")).toBe(false);
    expect(fs.fillShapeOf("lu:mail")).toBe("");
    expect(fs.ready("lu:luggage")).toBe(true);
    expect(fs.fillShapeOf("lu:luggage")).toBe(FILL_SHAPE_SEED["lu:luggage"]);
    /* kunci di luar lu:/tb: selalu final tanpa bentuk isi */
    expect(fs.ready("hg:home-01")).toBe(true);
    expect(fs.ready("face")).toBe(true);
    const a = fs.load(),
      b = fs.load();
    expect(fs.state()).toBe("loading");
    await Promise.all([a, b]);
    expect(calls).toBe(1);
    expect(fs.state()).toBe("ready");
    expect(fs.versions()).toEqual(sample.versions);
    expect(fs.ready("lu:mail")).toBe(true);
    expect(fs.fillShapeOf("lu:mail")).toBe("<rect/>");
    expect(fs.fillShapeOf("tb:ad-2")).toBe("<path/>");
    /* setelah termuat seed tidak dipakai lagi */
    expect(fs.fillShapeOf("lu:luggage")).toBe("");
    await fs.load();
    expect(calls).toBe(1);
  });

  test("format build {gz} (gzip base64 dari scripts/vite-fill-shapes.mjs) didekode sama dengan JSON", async () => {
    const gz = gzipSync(JSON.stringify(sample)).toString("base64");
    expect(await decodeFillShapes({ gz })).toEqual(sample);
    expect(await decodeFillShapes(sample)).toBe(sample);
    const fs = createFillShapes(async () => ({ default: { gz } }));
    await fs.load();
    expect(fs.fillShapeOf("lu:mail")).toBe("<rect/>");
  });

  test("gagal memuat: state error dan bisa dicoba lagi", async () => {
    let fail = true;
    const fs = createFillShapes(async () => {
      if (fail) throw new Error("x");
      return { default: sample };
    });
    await expect(fs.load()).rejects.toThrow("x");
    expect(fs.state()).toBe("error");
    fail = false;
    await fs.load();
    expect(fs.state()).toBe("ready");
  });

  test("plugin build menghasilkan modul {gz} yang terdekode sama persis dengan fill-shapes.json", async () => {
    const { fillShapesGzip } = await import("../../scripts/vite-fill-shapes.mjs");
    const plugin = /** @type {any} */ (fillShapesGzip());
    const importer = path.join(root, "packages/icon-sources/fill-shapes.js");
    expect(plugin.resolveId("./data/fill-shapes.json", path.join(root, "apps/lain.js"))).toBe(null);
    const id = plugin.resolveId("./data/fill-shapes.json", importer);
    const code = await plugin.load(id);
    const gz = /export default \{ gz: ("[^"]+") \};/.exec(code);
    expect(gz).not.toBe(null);
    const decoded = await decodeFillShapes({ gz: JSON.parse(/** @type {RegExpExecArray} */ (gz)[1]) });
    expect(decoded).toEqual(JSON.parse(await readFile(dataFile, "utf8")));
  });
});

describe("fill-shapes.json (scripts/build-icon-data.mjs)", () => {
  beforeAll(async () => {
    await loadFillShapes();
  });

  test("seed kartu Sticker sama persis dengan data", async () => {
    const data = JSON.parse(await readFile(dataFile, "utf8"));
    for (const [key, v] of Object.entries(FILL_SHAPE_SEED)) expect(v, key).toBe(String(data.lu[key.slice(3)] || "").replace(/^~/, ""));
  });

  test("versi data sama dengan sources.json yang terkunci", async () => {
    const sources = JSON.parse(await readFile(path.join(root, "packages/icon-sources/sources.json"), "utf8"));
    expect(fillShapeVersions()).toEqual({ lucide: sources.lucide.version, tabler: sources.tabler.version });
  });

  test("skrip menghasilkan file yang sama persis dengan yang di-commit", async () => {
    const before = await readFile(dataFile, "utf8");
    execFileSync(process.execPath, [path.join(root, "scripts/build-icon-data.mjs")], { stdio: "pipe" });
    expect(await readFile(dataFile, "utf8")).toBe(before);
  });

  test("Lucide: hanya bentuk tertutup", () => {
    expect(fillShapeOf("lu:mail")).toBe('<rect x="2" y="4" width="20" height="16" rx="2"/>');
    /* koper: badan Lucide path terbuka (titik ujung tidak berimpit), jadi hanya roda (sama dengan legacy) */
    expect(fillShapeOf("lu:luggage")).toBe('<circle cx="16" cy="20" r="2"/><circle cx="8" cy="20" r="2"/>');
    expect(fillShapeOf("lu:minus")).toBe("");
    expect(fillShapeOf("lu:arrow-right")).toBe("");
  });

  test("Lucide: path tanpa z yang titik ujungnya berimpit dihitung tertutup dan diberi z (ADR-019)", () => {
    /* Lucide 1.52.0 tidak lagi menutup path ini dengan z; legacy (0.460.0) punya bentuk isinya */
    expect(fillShapeOf("lu:heart")).toMatch(/^<path d="M2 9\.5a5\.5 5\.5 0 0 1 [^"]*z"\/>$/);
    expect(fillShapeOf("lu:apple")).toMatch(/^<path d="M18\.237 21A15 15 [^"]*z"\/>$/);
    /* map-pin: badan pin ikut menjadi bentuk isi, bukan hanya lingkaran dalam seperti legacy */
    expect(fillShapeOf("lu:map-pin")).toMatch(/^<path d="M20 10c[^"]*z"\/><circle cx="12" cy="10" r="3"\/>$/);
  });

  test("Tabler: filled resmi, fallback outline tertutup tanpa prefiks ~", () => {
    expect(fillShapeOf("tb:heart")).toMatch(/^<path d="M6\.979 3\.074/);
    const ad = fillShapeOf("tb:ad-2");
    expect(ad).toBe('<path d="M9 13h5v-4h-5v4z"/>');
    expect(ad.startsWith("~")).toBe(false);
  });

  test("tanpa bentuk isi: Hugeicons, Kustom, objek bawaan, merek", () => {
    for (const key of ["hg:home-01", "cu:rice-field", "face", "", "tb:brand-github", "lu:tidak-ada", "lu:constructor"])
      expect(fillShapeOf(key), key).toBe("");
  });

  test("path kosong Tabler dan atribut warna tidak ikut", async () => {
    const data = JSON.parse(await readFile(dataFile, "utf8"));
    const all = Object.values(data.tb).join("") + Object.values(data.lu).join("");
    expect(all).not.toContain("M0 0h24v24H0z");
    expect(all).not.toMatch(/\s(fill|stroke)=/);
    expect(Object.keys(data.tb).some((k) => k.startsWith("brand-"))).toBe(false);
  });
});
