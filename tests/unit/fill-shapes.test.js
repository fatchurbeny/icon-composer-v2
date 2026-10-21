// @ts-check
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { FILL_SHAPE_VERSIONS, fillShapeOf } from "@icon-studio/icon-sources/fill-shapes";

const root = path.resolve(import.meta.dirname, "../..");
const dataFile = path.join(root, "packages/icon-sources/data/fill-shapes.json");

describe("fill-shapes.json (scripts/build-icon-data.mjs)", () => {
  test("versi data sama dengan sources.json yang terkunci", async () => {
    const sources = JSON.parse(await readFile(path.join(root, "packages/icon-sources/sources.json"), "utf8"));
    expect(FILL_SHAPE_VERSIONS).toEqual({ lucide: sources.lucide.version, tabler: sources.tabler.version });
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
