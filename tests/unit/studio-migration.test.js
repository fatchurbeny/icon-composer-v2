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
  importManifest,
  offsetSetFromComposer,
} from "../../apps/icon-studio/src/state/document.js";
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
