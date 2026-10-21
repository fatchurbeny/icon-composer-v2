// @ts-check
/**
 * Mesin hand-writing (Fase 4): kontrak, keacakan sama dengan legacy coret-composer 1.0.0, dash dipanggang.
 * `compose` legacy dijalankan di `vm` dengan node Lucide 1.52.0 yang sama, lalu blob, rotasi, siluet
 * knockout, dan pola dash dibandingkan. Paritas piksel dicek di tests/e2e/hand-writing-parity.spec.js.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, test } from "vitest";
import { get, migrateFamily } from "@icon-studio/engines";
import {
  HAND_WRITING_DEFAULTS,
  cleanNode,
  boxesHandWriting,
  handWriting,
  handWritingItem,
  handWritingParams,
  migrateLegacy,
} from "@icon-studio/engines/hand-writing";
import { bakeDash, shapeToPath, subpaths } from "../../packages/engines/hand-writing/dash.js";

const root = path.resolve(import.meta.dirname, "../..");
const vendor = path.join(root, "tests/fixtures/vendor");

/** Node Lucide 1.52.0 dari fixture UMD (tanpa DOM). */
const LUCIDE = (() => {
  const box = /** @type {any} */ ({});
  box.window = box;
  box.self = box;
  box.globalThis = box;
  vm.runInNewContext(readFileSync(path.join(vendor, "lucide.min.js"), "utf8"), box);
  /** @type {Map<string, any[]>} */
  const map = new Map();
  for (const [k, v] of Object.entries(box.lucide.icons)) {
    const n = Array.isArray(v) && v[0] === "svg" ? v[2] : v;
    const kb = k
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
      .toLowerCase();
    if (!map.has(kb)) map.set(kb, n);
  }
  return map;
})();
const nodeOf = (/** @type {string} */ key) => LUCIDE.get(key.slice(3)) || null;
const ctx = { nodeOf };

/** `compose` asli coret-composer 1.0.0 (bagian sumber ikon + mesin), node disuntik ke `SRC.lu`. */
const LEGACY = (() => {
  const html = readFileSync(path.join(root, "legacy/style/coret-composer-v1.0.0.html"), "utf8");
  const start = html.indexOf("/* ---------- sumber ikon ---------- */");
  const end = html.indexOf("/* ---------- state ---------- */");
  const box = /** @type {any} */ ({});
  vm.runInNewContext(
    `${html.slice(start, end)}\nthis.compose = compose; this.SRC = SRC; this.clean = clean;`,
    box,
  );
  box.SRC.lu = Object.fromEntries([...LUCIDE].map(([k, v]) => [k, box.clean(v)]));
  return box;
})();

const LEGACY_S = { ...HAND_WRITING_DEFAULTS };
const style = (/** @type {any} */ o = {}) => ({ family: "hand-writing", engine: { "hand-writing": { ...LEGACY_S, ...o } } });
const item = (/** @type {string} */ main, /** @type {string} */ mod = "none", /** @type {any} */ extra = {}) => ({
  main,
  mod,
  slot: extra.slot || "BR",
  engine: { "hand-writing": { ms: 0.5, blob: "auto", seed: 1, ...extra } },
});
const ours = (/** @type {any} */ it, /** @type {any} */ s = style(), /** @type {any} */ opt = {}) =>
  handWriting.compose(handWriting.adapt(it), s, { idp: "t", ctx, ...opt });
const legacyOf = (/** @type {any} */ it, /** @type {any} */ S = LEGACY_S) => {
  const e = it.engine["hand-writing"];
  return LEGACY.compose({ main: it.main, mod: it.mod === "none" ? null : it.mod, anchor: it.slot, ms: e.ms, blob: e.blob, seed: e.seed }, S);
};

/** Pola dash legacy per elemen tinta, dalam urutan tampil. */
const legacyDashes = (/** @type {string} */ svg) =>
  [...svg.matchAll(/pathLength="100"[^>]*?(?:stroke-dasharray="([\d.]+) ([\d.]+)" stroke-dashoffset="([\d.]+)")?\/>/g)].map((m) =>
    m[1] ? [+m[1], +m[2], +m[3]] : null,
  );
/** Warna mask sama dengan legacy (#fff/#000), jadi markup dibandingkan apa adanya. */
const norm = (/** @type {string} */ s) => s;

const KEYS = ["lu:pizza", "lu:wallet", "lu:piggy-bank", "lu:alarm-clock", "lu:house", "lu:mail", "lu:camera", "lu:user", "lu:star", "lu:calendar"];
const MODS = ["lu:plus", "lu:sparkle", "lu:check", "lu:heart"];

describe("mesin hand-writing: kontrak", () => {
  test("terdaftar di registry dengan versi 2.0.0, coret dimigrasi", () => {
    expect(get("hand-writing")).toBe(get("coret"));
    expect(migrateFamily("coret")).toBe("hand-writing");
    expect(handWriting.version).toBe("2.0.0");
    expect(handWriting.supports).toEqual({ mod: true, deco: false, builtinMains: false, perItemColor: false, maxColors: 3 });
  });

  test("keluaran deterministik, viewBox 48, tanpa dasharray, pathLength, style, use, clipPath", () => {
    for (const k of KEYS) {
      const it = item(k, "lu:plus", { seed: 99 });
      const a = ours(it),
        b = ours(it);
      expect(a).toBe(b);
      expect(a).toContain('viewBox="0 0 48 48"');
      expect(a).not.toMatch(/stroke-dasharray|pathLength|<style|<use|<clipPath|\sstyle=/);
    }
  });

  test("id mask memakai opt.idp", () => {
    const svg = ours(item("lu:wallet", "lu:plus"), style(), { idp: "abc" });
    expect(svg).toContain('<mask id="abcko"');
    expect(svg).toContain('mask="url(#abcko)"');
  });

  test("mode white memakai siluet putih tanpa mask", () => {
    const svg = ours(item("lu:wallet", "lu:plus"), style(), { mode: "white" });
    expect(svg).not.toContain("<mask");
    expect(svg).toContain('fill="#FFFFFF" stroke="#FFFFFF"');
  });

  test("warna unik ≤ 3 (aksen dan tinta)", () => {
    for (const k of KEYS) {
      const svg = ours(item(k, "lu:plus")).replace(/<defs>.*<\/defs>/, "");
      const colors = new Set([...svg.matchAll(/(?:fill|stroke)="(#[0-9A-F]{6})"/gi)].map((m) => m[1].toUpperCase()));
      expect(colors.size).toBeLessThanOrEqual(3);
    }
  });

  test("objek bawaan: SVG kosong + flag err, pengubah bawaan: flag warn", () => {
    const svg = ours({ main: "face", mod: "check", slot: "BR" });
    expect(svg).toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"></svg>');
    expect(handWriting.flags({ main: "face", mod: "none" }, {}, ctx)).toContainEqual(["err", "Objek bawaan tidak didukung gaya Hand-writing"]);
    expect(handWriting.flags({ main: "lu:house", mod: "check" }, {}, ctx)).toContainEqual(["warn", "Pengubah bawaan tidak didukung gaya Hand-writing"]);
    expect(handWriting.flags({ main: "lu:house", mod: "lu:plus" }, {}, ctx)).toEqual([]);
  });

  test("signature mengikuti kontrak", () => {
    expect(handWriting.signature({ main: "lu:wallet", mod: "lu:circle-check", slot: "TL" })).toBe("hand-writing|wallet|ok|TL");
    expect(handWriting.signature({ main: "lu:wallet", mod: "none", slot: "TL" })).toBe("hand-writing|wallet|-|-");
  });

  test("normStyle dan parameter item dibatasi rentang legacy", () => {
    const s = handWriting.normStyle({ family: "coret", engine: { "hand-writing": { sw: 9, gap: -1, acc: "#abcdef", ink: "x" } } });
    expect(s.family).toBe("hand-writing");
    expect(s.engine["hand-writing"]).toMatchObject({ sw: 3.2, gap: 0, acc: "#ABCDEF", ink: "#2B1D2E" });
    expect(handWritingParams({})).toEqual(HAND_WRITING_DEFAULTS);
    expect(handWritingItem({ engine: { "hand-writing": { ms: 2, blob: "x", seed: "12" } } })).toMatchObject({ ms: 0.7, blob: "auto", seed: 12 });
  });

  test("cleanNode membuang atribut non-geometri dan kotak latar", () => {
    expect(cleanNode([["path", { d: "M0 0h24v24H0z", fill: "none" }], ["circle", { cx: 1, cy: 2, r: 3, key: "a", fill: "red" }]])).toEqual([["circle", { cx: 1, cy: 2, r: 3 }]]);
  });

  test("variasi var menggantikan miring dan fase dash secara deterministik", () => {
    const base = item("lu:wallet", "none", { seed: 5 });
    const tilted = { ...base, engine: { "hand-writing": { ...base.engine["hand-writing"], var: { tilt: -1, gapPhase: 2, gapPick: "A" } } } };
    const svg = ours(tilted);
    expect(svg).toContain(`rotate(${-HAND_WRITING_DEFAULTS.rot} 12 12)`);
    expect(svg).toBe(ours(tilted));
    expect(handWriting.axes().map((a) => a.id)).toEqual(["tilt", "gapPhase", "gapPick"]);
  });
});

describe("mesin hand-writing: kotak lapisan", () => {
  test("kotak objek dan pengubah di dalam viewBox 48; pengubah kecil di anchor; tanpa dekorasi", () => {
    const b = boxesHandWriting(item("lu:wallet", "lu:plus", { slot: "BR" }), style(), ctx);
    for (const k of /** @type {const} */ (["main", "mod"])) {
      expect(b[k].w, k).toBeGreaterThan(0);
      expect(b[k].x, k).toBeGreaterThanOrEqual(0);
      expect(b[k].y, k).toBeGreaterThanOrEqual(0);
      expect(b[k].x + b[k].w, k).toBeLessThanOrEqual(48);
      expect(b[k].y + b[k].h, k).toBeLessThanOrEqual(48);
    }
    /* pengubah ms 0,5: blob lingkaran r 9,2 → sisi ±15 unit 48, pusat dekat anchor BR (18,5 → 34,4) */
    expect(b.mod.w).toBeLessThan(18);
    expect(b.mod.x + b.mod.w / 2).toBeGreaterThan(30);
    expect(b.mod.y + b.mod.h / 2).toBeGreaterThan(30);
    expect(b.deco).toEqual({ x: 0, y: 0, w: 0, h: 0 });
    const tl = boxesHandWriting(item("lu:wallet", "lu:plus", { slot: "TL" }), style(), ctx);
    expect(tl.mod.x + tl.mod.w / 2).toBeLessThan(18);
    expect(boxesHandWriting(item("lu:wallet"), style(), ctx).mod.w).toBe(0);
    expect(boxesHandWriting({ main: "face", mod: "none" }, style(), ctx).main.w).toBe(0);
  });
});

describe("mesin hand-writing: setara legacy coret-composer 1.0.0", () => {
  const cases = KEYS.flatMap((k, i) => [
    item(k, "none", { seed: 11 + i }),
    item(k, MODS[i % MODS.length], { seed: 300 + i, slot: ["BR", "TL", "TR", "BL", "MR"][i % 5], ms: 0.5 + (i % 3) * 0.08, blob: ["auto", "circle", "none"][i % 3] }),
  ]);

  test("rotasi, blob, transform, dan siluet knockout identik", () => {
    for (const it of cases) {
      const old = norm(legacyOf(it));
      const svg = ours(it);
      const rot = (/** @type {string} */ s) => /rotate\(([-\d.]+) 12 12\)/.exec(s)?.[1];
      expect(rot(svg), it.main).toBe(rot(old));
      const blobs = (/** @type {string} */ s) => [...s.matchAll(/<g transform="translate\([-\d. ]+\)">(.*?)<\/g>/g)].map((m) => m[1]);
      expect(blobs(svg), it.main).toEqual(blobs(old));
      const mask = (/** @type {string} */ s) => /<mask [^>]*>(.*?)<\/mask>/.exec(s)?.[1].replace(/<rect[^>]*>/, "") || "";
      expect(mask(svg), it.main).toBe(mask(old));
      const tf = (/** @type {string} */ s) => [...s.matchAll(/transform="([^"]+)"/g)].map((m) => m[1]).filter((t) => t && !t.startsWith("matrix"));
      expect(tf(svg), it.main).toEqual(tf(old));
    }
  });

  test("bagian yang diberi celah dan pola dash sama dengan legacy; bagian lain tetap utuh", () => {
    let dashed = 0;
    for (const it of cases) {
      const old = legacyOf(it);
      const pattern = legacyDashes(old);
      const svg = ours(it);
      const inkOld = [...old.matchAll(/<(\w+)([^>]*?) pathLength="100"/g)].map((m) => [m[1], m[2]]);
      const inkNew = [...svg.matchAll(/<(\w+)([^>]*?) fill="none" stroke="#2B1D2E"/g)].map((m) => [m[1], m[2]]);
      expect(inkNew.length, it.main).toBe(inkOld.length);
      inkOld.forEach(([tag, attrs], i) => {
        const pat = pattern[i];
        if (!pat) {
          expect(inkNew[i], `${it.main} bagian ${i} utuh`).toEqual([tag, attrs]);
          return;
        }
        dashed++;
        const a = /** @type {any} */ ({});
        for (const m of attrs.matchAll(/(\w+)="([^"]*)"/g)) a[m[1]] = m[2];
        const d = bakeDash([tag, a], pat[0], pat[1], pat[2]);
        expect(inkNew[i], `${it.main} bagian ${i} dipanggang`).toEqual(["path", ` d="${d}"`]);
      });
    }
    expect(dashed).toBeGreaterThan(20);
  });
});

describe("dash dipanggang", () => {
  test("bentuk dasar menjadi path dengan titik awal dan arah seperti browser", () => {
    expect(shapeToPath(["circle", { cx: 12, cy: 12, r: 10 }])).toMatch(/^M22 12A10 10 0 0 1 12 22/);
    expect(shapeToPath(["rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }])).toMatch(/^M4 4H20A2 2 0 0 1 22 6V18/);
    expect(shapeToPath(["line", { x1: 1, y1: 2, x2: 3, y2: 4 }])).toBe("M1 2L3 4");
    expect(shapeToPath(["polygon", { points: "1,1 5,1 3,4" }])).toBe("M1 1L5 1L3 4Z");
  });

  test("garis lurus: celah berada di posisi pola dash dengan pathLength 100", () => {
    /* panjang 20: garis 0..18 terlihat lalu celah 18..20, offset 10 menggeser pola 2 unit */
    expect(bakeDash(["path", { d: "M0 0L20 0" }], 90, 10, 0)).toBe("M0 0L18 0");
    expect(bakeDash(["path", { d: "M0 0L20 0" }], 90, 10, 10)).toBe("M0 0L16 0M18 0L20 0");
    expect(bakeDash(["path", { d: "M0 0L20 0" }], 90, 10, 95)).toBe("M1 0L19 0");
  });

  test("pola dimulai ulang di setiap sub-path dan panjang memakai total semua sub-path", () => {
    /* total 40 → satuan 0,4; celah 25 = 10 unit; tiap sub-path panjang 20 dimulai dari garis */
    expect(bakeDash(["path", { d: "M0 0L20 0M0 5L20 5" }], 75, 25, 0)).toBe("M0 0L20 0M0 5L20 5");
    expect(bakeDash(["path", { d: "M0 0L20 0M0 5L20 5" }], 25, 75, 0)).toBe("M0 0L10 0M0 5L10 5");
  });

  test("kurva disampel rapat (jarak ≤ 0,5)", () => {
    for (const pl of subpaths(shapeToPath(["circle", { cx: 12, cy: 12, r: 10 }])))
      for (let i = 1; i < pl.length; i++) expect(Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1])).toBeLessThanOrEqual(0.5);
  });
});

describe("migrasi payload coret", () => {
  test("gaya.json coret-composer menjadi item kanonik hand-writing", () => {
    const m = migrateLegacy({
      family: "coret",
      version: "1.0.0",
      style: { acc: "#7FC4BE", ink: "#141414", sw: 2, puff: 1, off: 1, gap: 12, rot: 3, ko: 1 },
      icons: [
        { name: "wallet-plus", main: "lu:wallet", mod: "lu:plus", anchor: "TL", ms: 0.6, blob: "circle", seed: 42 },
        { name: "pizza", main: "lu:pizza", mod: null, anchor: "BR", ms: 0.5, blob: "zzz" },
      ],
    });
    expect(m.family).toBe("hand-writing");
    expect(m.style).toEqual({ acc: "#7FC4BE", ink: "#141414", sw: 2, puff: 1, off: 1, gap: 12, rot: 3, ko: 1 });
    expect(m.icons[0]).toMatchObject({ slot: "TL", mod: "lu:plus", engine: { "hand-writing": { ms: 0.6, blob: "circle", seed: 42 } } });
    expect(m.icons[1]).toMatchObject({ slot: "BR", mod: "none", engine: { "hand-writing": { blob: "auto", seed: 2 } } });
  });
});
