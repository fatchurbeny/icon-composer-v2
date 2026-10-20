// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import { createAppState } from "../../apps/icon-studio/src/app-state.js";
import {
  harmony,
  hexToHsl,
  hexToHsv,
  hslToHex,
  hslToHsv,
  hsvToHex,
  hsvToHsl,
  normHex,
} from "../../apps/icon-studio/src/state/color-harmony.js";
import { CURATED_PALETTES } from "../../apps/icon-studio/src/state/data/palettes.js";
import { applyStyleColors } from "../../apps/icon-studio/src/state/set-ops.js";
import {
  PRESET_LIMIT,
  STORE_KEY,
  loadState,
  normColorPresets,
  saveState,
} from "../../apps/icon-studio/src/state/store.js";
import { swatchOptions } from "../../apps/icon-studio/src/personas/color-picker.js";

/** Renderer tiruan: registry classic tanpa DOM. */
function fakeRenderer() {
  const data = createClassicData({ starDecos: true });
  const LIB_RE = /^(lu|tb|hg|cu):/;
  return /** @type {any} */ ({
    lib: { ...data, LIB_RE, ensure: () => true },
    data,
    LIB_RE,
    ensureManifestItem: () => {},
    loadTabler: async () => new Map(),
    loadHugeicons: async () => new Map(),
    dropMissing: () => {},
  });
}

function memoryStorage() {
  const map = new Map();
  return /** @type {any} */ ({
    getItem: (/** @type {string} */ k) => (map.has(k) ? map.get(k) : null),
    setItem: (/** @type {string} */ k, /** @type {string} */ v) => void map.set(k, v),
    map,
  });
}

/** Warna uji: primer, sekunder, abu-abu, dan warna palet bawaan. */
const SAMPLES = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#808080", "#3A7BFF", "#C3DC1E", "#B8405A", "#F27BA8", "#1A1A1A", "#E4E4DE"];

describe("konversi warna", () => {
  test("normHex menerima 3/6 digit, dengan atau tanpa #, dan menolak sisanya", () => {
    expect(normHex("3a7bff")).toBe("#3A7BFF");
    expect(normHex(" #abc ")).toBe("#AABBCC");
    expect(normHex("#12345")).toBeNull();
    expect(normHex("#3A7BFF80")).toBeNull();
    expect(normHex(null)).toBeNull();
  });

  test("hex → HSL → hex kembali sama", () => {
    for (const hex of SAMPLES) expect(hslToHex(hexToHsl(hex))).toBe(hex);
    expect(hexToHsl("#FF0000")).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToHex({ h: 120, s: 100, l: 25 })).toBe("#008000");
    expect(hslToHex({ h: 480, s: 100, l: 50 })).toBe(hslToHex({ h: 120, s: 100, l: 50 }));
  });

  test("hex → HSV → hex kembali sama, dan HSL ↔ HSV konsisten", () => {
    for (const hex of SAMPLES) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
      expect(hsvToHex(hslToHsv(hexToHsl(hex)))).toBe(hex);
      expect(hslToHex(hsvToHsl(hexToHsv(hex)))).toBe(hex);
    }
    expect(hexToHsv("#FFFFFF")).toEqual({ h: 0, s: 0, v: 1 });
  });

  test("konversi di components.js (popover) sama dengan color-harmony.js", async () => {
    await import("../../packages/ui/components.js");
    const kit = /** @type {any} */ (globalThis).ICUI.color;
    for (const hex of SAMPLES) {
      expect(kit.norm(hex.toLowerCase())).toBe(hex);
      expect(kit.fromHsv(hexToHsv(hex))).toBe(hex);
      const a = kit.toHsv(hex),
        b = hexToHsv(hex);
      expect(a.h).toBeCloseTo(b.h, 6);
      expect(a.s).toBeCloseTo(b.s, 6);
      expect(a.v).toBeCloseTo(b.v, 6);
      expect(kit.hsvToHsl(b).l).toBeCloseTo(hexToHsl(hex).l, 6);
    }
  });
});

describe("harmoni warna", () => {
  test("komplementer, analog, triadik dari warna dasar", () => {
    expect(harmony("#FF0000", "complementary")).toEqual(["#FF0000", "#00FFFF"]);
    expect(harmony("#FF0000", "triadic")).toEqual(["#FF0000", "#00FF00", "#0000FF"]);
    expect(harmony("#FF0000", "analogous")).toEqual(["#FF0000", "#FF8000", "#FF0080"]);
  });

  test("warna dasar selalu pertama dan tidak berubah; saturasi dan kecerahan tetap", () => {
    for (const kind of /** @type {const} */ (["complementary", "analogous", "triadic"])) {
      const cols = harmony("#3a7bff", kind);
      expect(cols[0]).toBe("#3A7BFF");
      const base = hexToHsl("#3A7BFF");
      for (const c of cols.slice(1)) {
        expect(Math.abs(hexToHsl(c).s - base.s)).toBeLessThan(1.5);
        expect(Math.abs(hexToHsl(c).l - base.l)).toBeLessThan(1.5);
      }
    }
    expect(harmony("bukan warna", "triadic")).toEqual([]);
  });
});

describe("palet kurasi", () => {
  test("8 sampai 12 palet bernama, id unik, maks 5 warna, semua hex sah", () => {
    expect(CURATED_PALETTES.length).toBeGreaterThanOrEqual(8);
    expect(CURATED_PALETTES.length).toBeLessThanOrEqual(12);
    expect(new Set(CURATED_PALETTES.map((p) => p.id)).size).toBe(CURATED_PALETTES.length);
    for (const p of CURATED_PALETTES) {
      const cols = [p.ink, p.accent, p.fill, p.bg];
      expect(cols.length).toBeLessThanOrEqual(5);
      for (const c of cols) expect(normHex(c)).toBe(c);
    }
  });

  test("applyStyleColors memetakan peran per gaya", () => {
    const classic = { family: "classic", ink: "#1A1A1A", accent: "#C3DC1E", colors: { main: { line: null, fill: null }, mod: { line: null, fill: null } } };
    expect(applyStyleColors(classic, { ink: "#111111", accent: "#3a7bff", fill: "#ffb547" })).toEqual({ fill: true });
    expect(classic).toMatchObject({ ink: "#111111", accent: "#3A7BFF", colors: { main: { fill: "#FFB547" }, mod: { fill: null } } });

    const offset = /** @type {any} */ ({ family: "offset", ink: "#1A1A1A", accent: "#C3DC1E", engine: {} });
    expect(applyStyleColors(offset, { ink: "#222222", accent: "#E2552D", fill: "#FFB547" })).toEqual({ fill: false });
    expect(offset.engine.offset).toMatchObject({ ink: "#222222", acc: "#E2552D" });
    expect(offset.ink).toBe("#1A1A1A");

    const keep = { family: "accent", ink: "#1A1A1A", accent: "#C3DC1E", colors: { main: { line: null, fill: null } } };
    applyStyleColors(keep, { accent: "bukan" });
    expect(keep.accent).toBe("#C3DC1E");
  });
});

describe("Preset saya dan sumber swatch", () => {
  test("normColorPresets: hex rapi, tanpa ganda, maks batas", () => {
    expect(normColorPresets(["#3a7bff", "3A7BFF", "#abc", "x", 5, "#C3DC1E"])).toEqual(["#3A7BFF", "#C3DC1E"]);
    const many = Array.from({ length: 30 }, (_, i) => `#0000${i.toString(16).padStart(2, "0")}`);
    expect(normColorPresets(many)).toHaveLength(PRESET_LIMIT);
    expect(normColorPresets("bukan daftar")).toEqual([]);
  });

  test("state lama tanpa field preset tetap terbaca dengan nilai bawaan (migrasi)", () => {
    const storage = memoryStorage();
    storage.setItem(STORE_KEY, JSON.stringify({ schemaVersion: 1, documents: [{ id: "a", kind: "set", items: [] }], activeId: "a", migrations: [] }));
    const state = loadState(storage);
    expect(state.documents).toHaveLength(1);
    expect(state.colorPresets).toEqual([]);
    expect(state.swatchSource).toBe("bawaan");
  });

  test("simpan dan muat Preset saya", () => {
    const storage = memoryStorage();
    saveState({ schemaVersion: 1, documents: [], activeId: null, migrations: [], colorPresets: ["#3a7bff", "#3A7BFF", "#E2552D"], swatchSource: "preset" }, storage);
    expect(loadState(storage)).toMatchObject({ colorPresets: ["#3A7BFF", "#E2552D"], swatchSource: "preset" });
    storage.setItem(STORE_KEY, JSON.stringify({ ...JSON.parse(storage.getItem(STORE_KEY)), swatchSource: "aneh" }));
    expect(loadState(storage).swatchSource).toBe("bawaan");
  });

  test("preset app-level tersimpan, bertahan saat app dibuka ulang, dan tidak masuk urungkan", () => {
    const storage = memoryStorage();
    const app = createAppState({ renderer: fakeRenderer(), storage });
    const doc = app.documents[0];
    app.setColorPresets(["#3A7BFF", "#E2552D"]);
    app.setSwatchSource("preset");
    expect(app.canUndo(doc.id)).toBe(false);
    const again = createAppState({ renderer: fakeRenderer(), storage });
    expect(again.colorPresets).toEqual(["#3A7BFF", "#E2552D"]);
    expect(again.swatchSource).toBe("preset");
    expect(again.setColorPresets(Array.from({ length: PRESET_LIMIT + 1 }, (_, i) => `#0000${i.toString(16).padStart(2, "0")}`))).toBe(false);
    expect(again.colorPresets).toHaveLength(PRESET_LIMIT);
  });

  test("swatch panel memakai preset bila dipilih dan tidak kosong", () => {
    const base = [null, "#1A1A1A"];
    expect(swatchOptions({ swatchSource: "bawaan", colorPresets: ["#3A7BFF"] }, base, true)).toBe(base);
    expect(swatchOptions({ swatchSource: "preset", colorPresets: [] }, base, true)).toBe(base);
    expect(swatchOptions({ swatchSource: "preset", colorPresets: ["#3A7BFF"] }, base, true)).toEqual([null, "#3A7BFF"]);
    expect(swatchOptions({ swatchSource: "preset", colorPresets: ["#3A7BFF"] }, ["#1A1A1A"], false)).toEqual(["#3A7BFF"]);
  });
});
