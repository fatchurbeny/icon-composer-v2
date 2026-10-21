// @ts-check
import { describe, expect, test } from "vitest";
import {
  dupMap,
  exportList,
  finalManifest,
  flagsOf,
  metaOf,
  packOf,
  pathOf,
  sheetGrid,
  validateManifest,
} from "../../apps/icon-studio/src/state/builder-ops.js";
import {
  HAND_WRITING_MODE,
  OFFSET_MODE,
  manifestHandWritingStyle,
  manifestOffsetStyle,
  manifestStyle,
} from "../../apps/icon-studio/src/state/document.js";

const vocab = /** @type {any} */ ({
  exists: (/** @type {string} */ k) => k !== "lu:salah",
  suggest: () => "lu:benar",
  collisions: () => [],
  libName: (/** @type {string} */ k) => k,
});

describe("Icon Studio builder-ops", () => {
  test("packOf menerima string atau {en, id}", () => {
    expect(packOf({ pack: "Tema" })).toEqual({ en: "Tema", id: "Tema" });
    expect(packOf({ pack: { id: "Uji" } })).toEqual({ en: "Uji", id: "Uji" });
    expect(packOf(null)).toEqual({ en: "", id: "" });
  });

  test("validateManifest memberi akhiran untuk id dobel dan saran untuk nama tak dikenal", () => {
    const doc = {
      manifest: { format: "lain" },
      items: [
        { uid: "a", id: "ikon", idRaw: "ikon", main: "face", mod: "none" },
        { uid: "b", id: "ikon", idRaw: "ikon", main: "lu:salah", mod: "none" },
      ],
    };
    const issues = validateManifest(doc, vocab);
    expect(doc.items[1].id).toBe("ikon-2");
    expect(issues.map((i) => i[0])).toEqual(["warn", "warn", "warn", "err"]);
    expect(issues.at(-1)?.[2]).toEqual({
      uid: "b",
      kind: "main",
      to: "lu:benar",
    });
  });

  test("dupMap, pathOf, sheetGrid", () => {
    const items = [
      { main: "a", mod: "b", on: true },
      { main: "a", mod: "b", on: true },
      { main: "a", mod: "b", on: false },
    ];
    expect(dupMap(items)).toEqual({ "a|b": 2 });
    expect(pathOf({ id: "x", role: "extra" }, "X", true)).toBe(
      "aksen/ekstra/x-aksen.svg",
    );
    expect(pathOf({ id: "x", role: "slot" }, "A", false)).toBe(
      "garis-solid/x-garis-solid.svg",
    );
    expect([
      sheetGrid(5),
      sheetGrid(30),
      sheetGrid(200),
      sheetGrid(5, "3"),
    ]).toEqual([4, 8, 14, 3]);
  });

  test("exportList: slot dulu lalu ekstra, sesuai centang peran", () => {
    const doc = {
      items: [
        { id: "e", role: "extra", on: true, main: "face", mod: "check" },
        { id: "s", role: "slot", on: true, main: "doc", mod: "plus" },
        { id: "o", role: "slot", on: false, main: "cart", mod: "plus" },
      ],
    };
    const deps = {
      vocab,
      renderer: {
        LIB_RE: /^(lu|tb|hg|cu):/,
        data: { MAINS: {} },
        solidLineDiagnostic: () => null,
      },
      style: {},
    };
    expect(
      exportList(doc, { slot: true, extra: true, skipBad: false }, deps).map(
        (i) => i.id,
      ),
    ).toEqual(["s", "e"]);
    expect(
      exportList(doc, { slot: false, extra: true, skipBad: false }, deps).map(
        (i) => i.id,
      ),
    ).toEqual(["e"]);
  });

  describe("gaya Offset (mode O)", () => {
    /** Renderer palsu: objek bawaan tanpa awalan pustaka diberi err seperti mesin offset. */
    const renderer = {
      LIB_RE: /^(lu|tb|hg|cu):/,
      data: { MAINS: {} },
      solidLineDiagnostic: () => null,
      flagsOf: (/** @type {any} */ it, /** @type {any} */ style) => {
        expect(style.family).toBe("offset");
        const f = [];
        if (!/^(lu|tb|hg|cu):/.test(it.main))
          f.push(["err", "Objek bawaan tidak didukung gaya Offset"]);
        if (it.mod !== "none")
          f.push(["info", "Pengubah tidak tersedia pada style ini"]);
        return f;
      },
    };
    const style = { ink: "#111111", accent: "#AA2244" };
    const deps = { vocab, renderer, style, mode: OFFSET_MODE };

    test("dupMap offset menghitung objek utama saja", () => {
      const items = [
        { main: "lu:wallet", mod: "plus", on: true },
        { main: "lu:wallet", mod: "check", on: true },
      ];
      expect(dupMap(items)).toEqual({
        "lu:wallet|plus": 1,
        "lu:wallet|check": 1,
      });
      expect(dupMap(items, OFFSET_MODE)).toEqual({ "lu:wallet": 2 });
    });

    test("flagsOf offset: info pengubah, tanpa flag pengubah TIB, err objek bawaan dan dobel", () => {
      const it = { main: "lu:wallet", mod: "plus", on: true };
      expect(flagsOf(it, dupMap([it], OFFSET_MODE), deps)).toEqual([
        ["info", "Pengubah tidak tersedia pada style ini"],
      ]);
      /* lu:wallet tanpa pengubah: di classic err "sama dengan ikon pustaka", di offset bersih */
      const bare = { main: "lu:wallet", mod: "none", on: true };
      expect(flagsOf(bare, null, { ...deps, mode: undefined })[0][0]).toBe(
        "err",
      );
      expect(flagsOf(bare, null, deps)).toEqual([]);
      expect(flagsOf({ main: "face", mod: "none" }, null, deps)).toEqual([
        ["err", "Objek bawaan tidak didukung gaya Offset"],
      ]);
      const twins = [it, { main: "lu:wallet", mod: "check", on: true }];
      expect(flagsOf(it, dupMap(twins, OFFSET_MODE), deps)).toContainEqual([
        "err",
        "Rakitan dobel di pack",
      ]);
    });

    test("exportList menilai ikon bermasalah per kelompok gaya yang dicentang", () => {
      const doc = {
        items: [
          { id: "pustaka", role: "slot", on: true, main: "lu:wallet", mod: "none" },
          { id: "bawaan", role: "slot", on: true, main: "face", mod: "plus" },
        ],
      };
      const base = { slot: true, extra: true, skipBad: true };
      const ids = (/** @type {any} */ modes) =>
        exportList(doc, { ...base, modes }, deps).map((i) => i.id);
      expect(ids({ A: true })).toEqual(["bawaan"]);
      expect(ids({ O: true })).toEqual(["pustaka"]);
      expect(ids({ A: true, O: true })).toEqual([]);
    });

    test("metaOf offset memakai kata gaya Offset Style tanpa tag pengubah", () => {
      const it = {
        id: "dompet",
        main: "lu:wallet",
        mod: "plus",
        name: { en: "Wallet", id: "Dompet" },
        keywords: { en: [], id: [] },
      };
      const tagsOf = (/** @type {string} */ k) => [k === "plus" ? "tambah" : "dompet"];
      const m = metaOf(it, OFFSET_MODE, 25, { man: { pack: "Finance" }, brand: "", tagsOf });
      expect(m.title_en).toBe("Wallet Finance Offset Style Icon");
      expect(m.title_id).toBe("Ikon dompet finance gaya offset");
      expect(m.keywords_en).toContain("offset style");
      expect(m.keywords_en).not.toContain("tambah");
    });

    test("manifest offset: impor memilih mode O, manifest akhir menulis family offset", () => {
      const st = { ink: "#111111", accent: "#AA2244" };
      const r = manifestStyle({ style: { family: "offset", mode: "white" } }, st);
      expect(r).toEqual({
        pv: "O",
        exportModes: { X: false, A: false, B: false, O: true, H: false, S: false },
      });
      expect(manifestOffsetStyle(st)).toEqual({
        family: "offset",
        engine: {
          offset: { mode: "white", acc: "#AA2244", ink: "#111111" },
        },
      });
      const fm = finalManifest(
        { manifest: { style: { family: "offset" } }, pv: "O", style: st },
        [],
        "2026-01-01",
      );
      expect(fm.style).toEqual({
        family: "offset",
        mode: "white",
        ink: "#111111",
        accent: "#AA2244",
      });
    });
  });
  describe("gaya Hand-writing (mode H)", () => {
    /** Renderer palsu: flag seperti mesin hand-writing (objek bawaan err, pengubah bawaan warn). */
    const renderer = {
      LIB_RE: /^(lu|tb|hg|cu):/,
      data: { MAINS: {} },
      solidLineDiagnostic: () => null,
      flagsOf: (/** @type {any} */ it, /** @type {any} */ style) => {
        expect(style.family).toBe("hand-writing");
        const f = [];
        if (!/^(lu|tb|hg|cu):/.test(it.main)) f.push(["err", "Objek bawaan tidak didukung gaya Hand-writing"]);
        if (it.mod !== "none" && !/^(lu|tb|hg|cu):/.test(it.mod)) f.push(["warn", "Pengubah bawaan tidak didukung gaya Hand-writing"]);
        return f;
      },
    };
    const style = { ink: "#111111", accent: "#AA2244" };
    const deps = { vocab, renderer, style, mode: HAND_WRITING_MODE };

    test("flagsOf hand-writing: tanpa pengubah bersih, objek bawaan err, pengubah bawaan warn, dobel per rakitan", () => {
      const bare = { main: "lu:wallet", mod: "none", on: true };
      expect(flagsOf(bare, null, deps)).toEqual([]);
      expect(flagsOf({ main: "face", mod: "none" }, null, deps)).toEqual([["err", "Objek bawaan tidak didukung gaya Hand-writing"]]);
      expect(flagsOf({ main: "lu:wallet", mod: "plus" }, null, deps)).toEqual([["warn", "Pengubah bawaan tidak didukung gaya Hand-writing"]]);
      const a = { main: "lu:wallet", mod: "lu:plus", on: true },
        b = { main: "lu:wallet", mod: "lu:check", on: true };
      expect(flagsOf(a, dupMap([a, b], HAND_WRITING_MODE), deps)).toEqual([]);
      expect(flagsOf(a, dupMap([a, { ...a }], HAND_WRITING_MODE), deps)).toContainEqual(["err", "Rakitan dobel di pack"]);
      const clash = { ...deps, vocab: { ...vocab, collisions: () => ["wallet-plus"] } };
      expect(flagsOf(a, null, clash)).toContainEqual(["err", "Mirip wallet-plus"]);
    });

    test("exportList mode H melewati objek bawaan saja", () => {
      const doc = {
        items: [
          { id: "pustaka", role: "slot", on: true, main: "lu:wallet", mod: "none" },
          { id: "bawaan", role: "slot", on: true, main: "face", mod: "plus" },
        ],
      };
      const ids = (/** @type {any} */ modes) => exportList(doc, { slot: true, extra: true, skipBad: true, modes }, deps).map((i) => i.id);
      expect(ids({ H: true })).toEqual(["pustaka"]);
      expect(ids({ A: true, H: true })).toEqual([]);
    });

    test("metaOf hand-writing memakai kata gaya Hand-writing Style dan tag pengubah", () => {
      const it = { id: "dompet", main: "lu:wallet", mod: "lu:plus", name: { en: "Wallet", id: "Dompet" }, keywords: { en: [], id: [] } };
      const tagsOf = (/** @type {string} */ k) => [k === "lu:plus" ? "tambah" : "dompet"];
      const m = metaOf(it, HAND_WRITING_MODE, 25, { man: { pack: "Finance" }, brand: "", tagsOf });
      expect(m.title_en).toBe("Wallet Finance Hand-writing Style Icon");
      expect(m.title_id).toBe("Ikon dompet finance gaya hand-writing");
      expect(m.keywords_en).toContain("hand-writing style");
      expect(m.keywords_en).toContain("tambah");
      expect(pathOf({ id: "dompet", role: "slot" }, HAND_WRITING_MODE, true)).toBe("hand-writing/slot-deck/dompet-hand-writing.svg");
    });

    test("manifest family hand-writing atau coret memilih mode H; manifest akhir menulis parameter mesin", () => {
      for (const family of ["hand-writing", "coret"]) {
        const st = { ink: "#111111", accent: "#AA2244" };
        expect(manifestStyle({ style: { family } }, st)).toEqual({ pv: "H", exportModes: { X: false, A: false, B: false, O: false, H: true, S: false } });
      }
      const st = { ink: "#111111", accent: "#AA2244" };
      expect(manifestHandWritingStyle(st).engine["hand-writing"]).toMatchObject({ acc: "#AA2244", ink: "#111111", gap: 9, sw: 2.3 });
      const fm = finalManifest(
        { manifest: { style: { family: "coret" } }, pv: "H", style: st },
        [{ id: "a", name: { en: "a", id: "a" }, main: "lu:wallet", mod: "lu:plus", slot: "TL", mx: 0, my: 0, nx: 0, ny: 0, under: "none", mstyle: "line", slides: [1], role: "slot", keywords: { en: [], id: [] }, engine: { "hand-writing": { seed: 7 } } }],
        "2026-01-01",
      );
      expect(fm.style).toMatchObject({ family: "hand-writing", ink: "#111111", accent: "#AA2244", engine: { "hand-writing": { acc: "#AA2244" } } });
      expect(fm.icons[0].engine).toEqual({ "hand-writing": { ms: 0.5, blob: "auto", seed: 7 } });
      /* mode lain tidak menulis engine (golden TIB 1.6.0) */
      const classic = finalManifest({ manifest: {}, pv: "A", style: st }, [], "2026-01-01");
      expect(classic.style.engine).toBeUndefined();
    });
  });
});
