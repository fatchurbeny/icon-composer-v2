// @ts-check
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  LEGACY_KEYS,
  migrateFromLegacy,
} from "../../apps/icon-studio/src/state/migrations/001-from-legacy.js";
import { SAMPLE_MANIFEST } from "../../apps/icon-studio/src/state/data/sample-manifest.js";
import {
  handWritingSetFromComposer,
  importManifest,
  offsetSetFromComposer,
  stickerSetFromComposer,
} from "../../apps/icon-studio/src/state/document.js";
import {
  HAND_WRITING_LEGACY_KEY,
  MIGRATION_ID as HW_MIGRATION_ID,
  migrateFromHandWriting,
} from "../../apps/icon-studio/src/state/migrations/003-from-hand-writing.js";
import {
  MIGRATION_ID as STICKER_MIGRATION_ID,
  STICKER_KEY,
  migrateFromSticker,
} from "../../apps/icon-studio/src/state/migrations/004-from-sticker.js";
import {
  MIGRATION_ID,
  OFFSET_KEY,
  migrateFromOffset,
} from "../../apps/icon-studio/src/state/migrations/002-from-offset.js";
import {
  STORE_KEY,
  hasState,
  loadState,
  saveState,
} from "../../apps/icon-studio/src/state/store.js";

const mixed = JSON.parse(
  readFileSync(new URL("../fixtures/sets/mixed.json", import.meta.url), "utf8"),
);
const offsetFixture = JSON.parse(
  readFileSync(
    new URL("../fixtures/sets/offset-composer.json", import.meta.url),
    "utf8",
  ),
);
const hwFixture = JSON.parse(
  readFileSync(
    new URL("../fixtures/sets/coret-composer.json", import.meta.url),
    "utf8",
  ),
);
const stickerFixture = JSON.parse(
  readFileSync(
    new URL("../fixtures/sets/sticker-composer.json", import.meta.url),
    "utf8",
  ),
);
const data = createClassicData({ starDecos: true });
const lib = {
  ...data,
  LIB_RE: /^(lu|tb|hg|cu):/,
  ensure: (/** @type {string} */ k, /** @type {"main" | "mod"} */ kind) => (
    ((kind === "main" ? data.MAINS : data.MODS)[k] = {
      n: k,
      slot: "BL",
      missing: true,
    }),
    false
  ),
};

/** @param {Record<string, unknown>} entries */
function storage(entries = {}) {
  const map = new Map(
    Object.entries(entries).map(([k, v]) => [
      k,
      typeof v === "string" ? v : JSON.stringify(v),
    ]),
  );
  return /** @type {any} */ ({
    getItem: (/** @type {string} */ k) => (map.has(k) ? map.get(k) : null),
    setItem: (/** @type {string} */ k, /** @type {string} */ v) =>
      void map.set(k, v),
    map,
  });
}

const icStore = () => ({
  ...mixed.iconComposer.storage[LEGACY_KEYS.composer],
  packs: [
    {
      id: "p1",
      name: "Travel",
      version: "v1.2",
      desc: "uji",
      tags: ["a"],
      cover: [],
      style: { family: "accent" },
      set: [{ name: "Kopi", main: "face", mod: "check" }],
      at: 1,
    },
  ],
});
const tibStore = () => {
  const imp = /** @type {any} */ (
    importManifest(JSON.stringify(SAMPLE_MANIFEST), lib)
  );
  imp.items[2].on = false;
  return {
    man: SAMPLE_MANIFEST,
    items: imp.items,
    pv: "B",
    sheetCols: "6",
    isSample: true,
    v151: true,
  };
};

describe("Icon Studio migrasi 001 dari IC dan TIB", () => {
  test("tanpa data lama tidak ada migrasi", () => {
    expect(migrateFromLegacy(storage(), { lib })).toBeNull();
  });

  test("set IC, pack tersimpan, dan metadata Canva menjadi dokumen set", () => {
    const meta = {
      on: false,
      artist: "chital",
      locale: "id",
      packEn: "Travel",
      packId: "Wisata",
      kw: 20,
      desc: "x",
      nm: "name",
    };
    const res = migrateFromLegacy(
      storage({
        [LEGACY_KEYS.composer]: icStore(),
        [LEGACY_KEYS.composerMeta]: meta,
      }),
      { lib, uid: () => "u" },
    );
    expect(res?.sources).toEqual([
      LEGACY_KEYS.composer,
      LEGACY_KEYS.composerMeta,
    ]);
    const [main, pack] = res?.state.documents || [];
    expect(main).toMatchObject({
      kind: "set",
      name: "Set Icon Composer",
      meta: { canva: meta },
    });
    expect(main.items.map((/** @type {any} */ it) => it.id)).toEqual([
      "mx-tabler",
      "mx-huge",
      "mx-lucide",
    ]);
    expect(main.style.family).toBe("classic");
    expect(pack).toMatchObject({
      kind: "set",
      name: "Travel v1.2",
      meta: { pack: { version: "v1.2", desc: "uji" } },
    });
    expect(pack.style.family).toBe("accent");
    expect(res?.state.activeId).toBe(main.id);
  });

  test("kunci icon-composer-v2 dipakai bila aksen-v1 tidak ada, dengan gaya Aksen bawaan", () => {
    const res = migrateFromLegacy(
      storage({
        [LEGACY_KEYS.composerOld]: {
          style: { family: "classic", sw: 3 },
          set: [{ main: "face", mod: "check" }],
        },
      }),
      { lib },
    );
    expect(res?.sources).toEqual([LEGACY_KEYS.composerOld]);
    expect(res?.state.documents[0].style.family).toBe("accent");
    expect(res?.state.documents[0].style.saved.classic.sw).toBe(3);
  });

  test("dokumen TIB: manifest, item, mode pratinjau, centang ekspor, kolom", () => {
    const res = migrateFromLegacy(
      storage({ [LEGACY_KEYS.builder]: tibStore() }),
      { lib },
    );
    const doc = res?.state.documents[0];
    expect(doc).toMatchObject({
      kind: "manifest",
      pv: "B",
      isSample: true,
      export: { modes: { X: false, A: false, B: true }, sheetCols: "6" },
    });
    expect(doc.items).toHaveLength(SAMPLE_MANIFEST.icons.length);
    expect(doc.items[2].on).toBe(false);
    expect(res?.sources).toEqual([LEGACY_KEYS.builder]);
  });

  test("data rusak di kunci lama dilewati tanpa melempar", () => {
    expect(
      migrateFromLegacy(
        storage({
          [LEGACY_KEYS.composer]: "{rusak",
          [LEGACY_KEYS.builder]: { man: null },
        }),
        { lib },
      ),
    ).toBeNull();
  });

  test("hasState membedakan icon-studio-v1 yang sudah ada", () => {
    expect(hasState(storage())).toBe(false);
    expect(
      hasState(storage({ [STORE_KEY]: { schemaVersion: 1, documents: [] } })),
    ).toBe(true);
  });
});

describe("Icon Studio migrasi 002 dari offset-composer", () => {
  test("tanpa kunci offset-composer-v1 atau set kosong tidak ada migrasi", () => {
    expect(migrateFromOffset(storage(), { lib })).toBeNull();
    expect(
      migrateFromOffset(
        storage({ [OFFSET_KEY]: { cur: { key: "lu:coffee" }, set: [] } }),
        { lib },
      ),
    ).toBeNull();
    expect(
      migrateFromOffset(storage({ [OFFSET_KEY]: "{rusak" }), { lib }),
    ).toBeNull();
  });

  test("set offset-composer menjadi dokumen set bergaya offset", () => {
    const res = migrateFromOffset(
      storage(offsetFixture.storage),
      { lib, uid: () => "o" },
    );
    expect(res?.sources).toEqual([OFFSET_KEY]);
    expect(res?.warnings).toEqual([]);
    const doc = res?.documents[0];
    expect(doc).toMatchObject({
      kind: "set",
      name: "Set Offset Composer",
      meta: {
        import: { format: "offset-composer", source: OFFSET_KEY, warnings: [] },
      },
    });
    expect(doc.style.family).toBe("offset");
    /* gaya dari ikon pertama; ukuran objek selalu 84% (ADR-012), bukan size lama */
    expect(doc.style.engine.offset).toEqual({
      mode: "white",
      acc: "#2F6FD0",
      ink: "#1A1A1A",
      dx: 3,
      dy: -2,
      sw: 3,
      size: 100.8,
    });
    expect(doc.items.map((/** @type {any} */ it) => [it.main, it.mod, it.name])).toEqual([
      ["lu:luggage", "none", "luggage"],
      ["lu:coffee", "none", "coffee"],
      ["tb:camera", "none", "kamera"],
    ]);
    expect(doc.items[1].engine.offset.deco).toEqual({
      tick: false,
      tickPos: "TL",
      ground: true,
      cloud: true,
      grass: false,
    });
    expect(doc.items[2].engine.offset.deco).toMatchObject({
      ground: false,
      grass: true,
    });
    /* cur (ikon yang sedang diedit) tidak ikut */
    expect(doc.items).toHaveLength(3);
  });

  test("gaya.json dari ZIP dikenali; gaya berbeda per ikon memberi peringatan", () => {
    const res = /** @type {any} */ (
      offsetSetFromComposer(offsetFixture.gayaJson, lib, { uid: () => "g" })
    );
    expect(res.warnings).toEqual(["Gaya diseragamkan mengikuti ikon pertama"]);
    expect(res.needTb).toBe(false);
    expect(res.doc.meta.import).toMatchObject({
      source: "gaya.json",
      version: "1.0.1",
    });
    expect(res.doc.style.engine.offset.acc).toBe("#B8405A");
    expect(res.doc.items.map((/** @type {any} */ it) => it.main)).toEqual([
      "lu:wallet",
      "lu:house",
    ]);
  });

  test("data lain bukan offset-composer; set tanpa ikon pustaka ditolak", () => {
    expect(offsetSetFromComposer(SAMPLE_MANIFEST, lib)).toBeNull();
    expect(offsetSetFromComposer(null, lib)).toBeNull();
    expect(
      offsetSetFromComposer(
        { format: "offset-composer", icons: [{ key: "face" }] },
        lib,
      ),
    ).toEqual({ fatal: "Set offset-composer tidak berisi ikon Lucide atau Tabler." });
  });

  test("catatan migrasi ikut tersimpan di icon-studio-v1", () => {
    const store = storage();
    expect(
      saveState(
        { schemaVersion: 1, documents: [], activeId: null, migrations: [MIGRATION_ID] },
        store,
      ),
    ).toBe(true);
    expect(loadState(store).migrations).toEqual([MIGRATION_ID]);
    /* state lama tanpa field migrations dibaca sebagai daftar kosong */
    store.setItem(STORE_KEY, JSON.stringify({ schemaVersion: 1, documents: [], activeId: null }));
    expect(loadState(store).migrations).toEqual([]);
  });
});

describe("Icon Studio migrasi 003 dari coret-composer (gaya hand-writing)", () => {
  test("id migrasi dan kunci lama", () => {
    expect(HW_MIGRATION_ID).toBe("003-from-hand-writing");
    expect(HAND_WRITING_LEGACY_KEY).toBe("coret-composer-v1");
  });

  test("tanpa kunci lama, kunci rusak, atau set kosong tidak ada migrasi", () => {
    expect(migrateFromHandWriting(storage(), { lib })).toBeNull();
    expect(migrateFromHandWriting(storage({ [HAND_WRITING_LEGACY_KEY]: "{rusak" }), { lib })).toBeNull();
    expect(migrateFromHandWriting(storage({ [HAND_WRITING_LEGACY_KEY]: { S: {}, set: [], cur: 0 } }), { lib })).toBeNull();
  });

  test("set coret-composer menjadi dokumen set bergaya hand-writing", () => {
    let n = 0;
    const res = migrateFromHandWriting(storage(hwFixture.storage), { lib, uid: () => `h${++n}` });
    expect(res?.sources).toEqual([HAND_WRITING_LEGACY_KEY]);
    expect(res?.warnings).toEqual([]);
    const doc = /** @type {any} */ (res).documents[0];
    expect(doc).toMatchObject({
      kind: "set",
      name: "Set Hand-writing",
      meta: { import: { format: "coret-composer", source: HAND_WRITING_LEGACY_KEY, warnings: [] } },
    });
    expect(doc.style.family).toBe("hand-writing");
    expect(doc.style.engine["hand-writing"]).toEqual({ acc: "#7FC4BE", ink: "#141414", sw: 2.6, puff: 1.5, off: 1, gap: 12, rot: 4, ko: 1.5 });
    expect(doc.items.map((/** @type {any} */ it) => [it.name, it.main, it.mod, it.slot])).toEqual([
      ["pizza", "lu:pizza", "none", "BR"],
      ["wallet-plus-coret", "lu:wallet", "lu:plus", "TR"],
      ["backpack", "tb:backpack", "none", "BR"],
    ]);
    expect(doc.items.map((/** @type {any} */ it) => it.engine["hand-writing"])).toEqual([
      { ms: 0.5, blob: "auto", seed: 482910 },
      { ms: 0.56, blob: "circle", seed: 77 },
      { ms: 0.5, blob: "none", seed: 1203 },
    ]);
  });

  test("gaya.json family coret: ikon bukan pustaka dilewati dengan peringatan", () => {
    const res = /** @type {any} */ (handWritingSetFromComposer(hwFixture.gayaJson, lib, { uid: () => "g" }));
    expect(res.doc.style.family).toBe("hand-writing");
    expect(res.doc.style.engine["hand-writing"].acc).toBe("#F28B82");
    expect(res.doc.items).toHaveLength(2);
    expect(res.doc.items[0]).toMatchObject({ main: "lu:piggy-bank", mod: "lu:sparkle", slot: "BL" });
    expect(res.warnings).toEqual(["1 ikon dilewati: bukan ikon pustaka"]);
    expect(res.doc.meta.import).toMatchObject({ format: "coret-composer", version: "1.0.0", source: "gaya.json" });
  });

  test("data lain bukan coret-composer; set tanpa ikon pustaka ditolak", () => {
    expect(handWritingSetFromComposer(SAMPLE_MANIFEST, lib)).toBeNull();
    expect(handWritingSetFromComposer(offsetFixture.gayaJson, lib)).toBeNull();
    expect(handWritingSetFromComposer(null, lib)).toBeNull();
    expect(handWritingSetFromComposer({ family: "coret", icons: [{ main: "face" }] }, lib)).toEqual({
      fatal: "Set coret-composer tidak berisi ikon Lucide, Tabler, atau Hugeicons.",
    });
  });
});

describe("Icon Studio migrasi 004 dari sticker-composer", () => {
  test("tanpa kunci sticker-composer-v1 atau set kosong tidak ada migrasi", () => {
    expect(STICKER_MIGRATION_ID).toBe("004-from-sticker");
    expect(migrateFromSticker(storage(), { lib })).toBeNull();
    expect(
      migrateFromSticker(storage({ [STICKER_KEY]: { style: {}, set: [] } }), { lib }),
    ).toBeNull();
    /* data offset-composer ({cur, set}) bukan sticker-composer */
    expect(migrateFromSticker(storage({ [STICKER_KEY]: offsetFixture.storage["offset-composer-v1"] }), { lib })).toBeNull();
  });

  test("set sticker-composer menjadi dokumen set bergaya sticker", () => {
    const res = /** @type {any} */ (
      migrateFromSticker(storage(stickerFixture.storage), { lib, uid: () => "s" })
    );
    expect(res.sources).toEqual([STICKER_KEY]);
    expect(res.warnings).toEqual([]);
    const doc = res.documents[0];
    expect(doc).toMatchObject({
      kind: "set",
      name: "Set Sticker Composer",
      meta: { import: { format: "sticker-composer", source: STICKER_KEY, warnings: [] } },
    });
    expect(doc.style.family).toBe("sticker");
    expect(doc.style.engine.sticker).toEqual({ mode: "fill", sw: 2.8, halo: 3.25, off: 1.2, spk: 4, rays: false, curl: true, ink: "#2B3A67" });
    const [a, b, c] = doc.items;
    expect(a).toMatchObject({ name: "Koper siap", main: "lu:luggage", mod: "tb:circle-check", slot: "TR", mx: 0, my: 0.75, nx: 0, ny: 0 });
    expect(a.engine.sticker).toEqual({
      main: { c: "#E5484D", s: 1.8, fill: "auto" },
      mod: { c: "#6BD88A", s: 0.9 },
      deco: { seed: 7, s: 1, x: 0, y: 0 },
    });
    /* posisi 64 → 48, deco.on dan vis legacy ke vis kanonik */
    expect(b).toMatchObject({ main: "tb:camera", mod: "tb:heart", slot: "BL", mx: -3, my: 1.5, nx: 1.5, ny: -1.5 });
    expect(b.vis).toEqual({ main: true, mod: false, deco: false });
    expect(b.engine.sticker.main.fill).toBe("plate");
    expect(b.engine.sticker.deco).toEqual({ seed: 33, s: 1.2, x: 4, y: -4 });
    /* nilai tidak sah dirapikan, pengubah kosong = none */
    expect(c.mod).toBe("none");
    expect(c.engine.sticker.main).toMatchObject({ s: 2.3, fill: "auto" });
    expect(c.engine.sticker.main.c).toMatch(/^#[0-9A-F]{6}$/);
    expect(c.engine.sticker.deco.seed).toBe(60);
    /* pool Kombinasi dari pools legacy */
    expect(doc.pool).toEqual({
      mains: ["lu:luggage", "tb:camera"],
      mods: ["tb:circle-plus", "tb:sun"],
      off: { "main|tb:camera": true, "mod|tb:sun": true },
    });
  });

  test("gaya.json dari ZIP: ikon tanpa objek pustaka dilewati dengan peringatan", () => {
    const res = /** @type {any} */ (stickerSetFromComposer(stickerFixture.gayaJson, lib, { uid: () => "g" }));
    expect(res.doc.meta.import.source).toBe("gaya.json");
    expect(res.doc.items).toHaveLength(1);
    expect(res.doc.items[0]).toMatchObject({ main: "tb:umbrella", mod: "tb:sun", slot: "TR" });
    expect(res.warnings).toEqual(["1 ikon tanpa objek Lucide atau Tabler dilewati"]);
    expect(res.needTb).toBe(true);
  });

  test("data lain bukan sticker-composer; set tanpa ikon pustaka ditolak", () => {
    expect(stickerSetFromComposer(SAMPLE_MANIFEST, lib)).toBeNull();
    expect(stickerSetFromComposer(offsetFixture.gayaJson, lib)).toBeNull();
    expect(stickerSetFromComposer(null, lib)).toBeNull();
    expect(stickerSetFromComposer({ kanvas: 64, ikon: [{ main: { k: "face" } }] }, lib)).toEqual({
      fatal: "Set sticker-composer tidak berisi ikon Lucide atau Tabler.",
    });
  });
});
