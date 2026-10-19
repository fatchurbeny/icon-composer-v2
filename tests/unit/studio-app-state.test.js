// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  createAppState,
  parseRoute,
  routeHash,
} from "../../apps/icon-studio/src/app-state.js";
import { SAMPLE_MANIFEST } from "../../apps/icon-studio/src/state/data/sample-manifest.js";
import { STORE_KEY } from "../../apps/icon-studio/src/state/store.js";
import { readFileSync } from "node:fs";

const offsetFixture = JSON.parse(
  readFileSync(
    new URL("../fixtures/sets/offset-composer.json", import.meta.url),
    "utf8",
  ),
);

/** Renderer tiruan: registry classic tanpa DOM, pustaka langsung "termuat". */
function fakeRenderer() {
  const data = createClassicData({ starDecos: true });
  const ensure = (
    /** @type {string} */ key,
    /** @type {"main" | "mod"} */ kind,
  ) => {
    (kind === "main" ? data.MAINS : data.MODS)[key] = { lu: true };
    return true;
  };
  const LIB_RE = /^(lu|tb|hg|cu):/;
  return /** @type {any} */ ({
    lib: { ...data, LIB_RE, ensure },
    data,
    SOURCES: {},
    LIB_RE,
    solidLineDiagnostic: () => null,
    ensureManifestItem: (/** @type {any} */ it) => {
      if (LIB_RE.test(it.main)) ensure(it.main, "main");
      if (it.mod !== "none" && LIB_RE.test(it.mod)) ensure(it.mod, "mod");
    },
    loadTabler: async () => new Map(),
    loadHugeicons: async () => new Map(),
    dropMissing: () => {},
  });
}

function memoryStorage() {
  const map = new Map();
  return /** @type {any} */ ({
    getItem: (/** @type {string} */ k) => (map.has(k) ? map.get(k) : null),
    setItem: (/** @type {string} */ k, /** @type {string} */ v) =>
      void map.set(k, v),
    map,
  });
}

describe("Icon Studio routing", () => {
  test("hash dibaca menjadi persona dan id edit", () => {
    expect(parseRoute("")).toEqual({ persona: "composer", edit: null });
    expect(parseRoute("#/builder")).toEqual({ persona: "builder", edit: null });
    expect(parseRoute("#/composer/edit/abc%201")).toEqual({
      persona: "composer",
      edit: "abc 1",
    });
    expect(parseRoute("#/tinjau/edit/x")).toEqual({
      persona: "tinjau",
      edit: null,
    });
    expect(parseRoute("#/lain")).toEqual({ persona: "composer", edit: null });
  });

  test("routeHash kebalikan parseRoute", () => {
    for (const hash of [
      "#/composer",
      "#/builder",
      "#/tinjau",
      "#/kombinasi",
      "#/composer/edit/abc%201",
    ])
      expect(routeHash(parseRoute(hash))).toBe(hash);
  });
});

describe("Icon Studio app state", () => {
  test("app baru punya satu set kosong yang aktif", () => {
    const app = createAppState({
      renderer: fakeRenderer(),
      storage: memoryStorage(),
    });
    expect(app.documents).toHaveLength(1);
    expect(app.documents[0]).toMatchObject({
      kind: "set",
      name: "Set baru",
      items: [],
    });
    expect(app.activeId).toBe(app.documents[0].id);
    expect(app.documentFor("builder")).toBeNull();
    expect(app.documentFor("composer")).toBe(app.documents[0]);
  });

  test("impor manifest menambah dokumen Builder aktif dan tersimpan", async () => {
    const storage = memoryStorage();
    const app = createAppState({ renderer: fakeRenderer(), storage });
    const result = await app.importManifest(JSON.stringify(SAMPLE_MANIFEST));
    expect(result.doc).toBeTruthy();
    expect(app.documentFor("builder")).toBe(result.doc);
    expect(app.documentFor("tinjau")).toBe(result.doc);
    expect(app.documentFor("composer")?.kind).toBe("set");
    expect(JSON.parse(storage.map.get(STORE_KEY)).documents).toHaveLength(2);

    const again = createAppState({ renderer: fakeRenderer(), storage });
    expect(again.documents.map((d) => d.kind)).toEqual(["set", "manifest"]);
    expect(again.activeId).toBe(result.doc.id);
  });

  test("migrasi offset-composer berjalan sekali dan tidak menimpa dokumen yang ada", async () => {
    const storage = memoryStorage();
    const first = createAppState({ renderer: fakeRenderer(), storage });
    const { doc: manifest } = await first.importManifest(
      JSON.stringify(SAMPLE_MANIFEST),
    );
    /* pengguna lama: icon-studio-v1 tersimpan sebelum migrasi 002 dikenal */
    const saved = JSON.parse(storage.map.get(STORE_KEY));
    delete saved.migrations;
    storage.setItem(STORE_KEY, JSON.stringify(saved));
    storage.setItem(
      "offset-composer-v1",
      JSON.stringify(offsetFixture.storage["offset-composer-v1"]),
    );

    const app = createAppState({ renderer: fakeRenderer(), storage });
    expect(app.migratedFrom).toEqual(["offset-composer-v1"]);
    expect(app.documents.map((d) => d.kind)).toEqual(["set", "manifest", "set"]);
    expect(app.documents[2]).toMatchObject({
      name: "Set Offset Composer",
      style: { family: "offset" },
    });
    expect(app.documents[2].items).toHaveLength(3);
    expect(app.documents[2].pool).toBeTruthy();
    /* dokumen aktif pengguna tidak diganti */
    expect(app.activeId).toBe(manifest.id);
    expect(JSON.parse(storage.map.get(STORE_KEY)).migrations).toEqual([
      "002-from-offset",
    ]);

    const again = createAppState({ renderer: fakeRenderer(), storage });
    expect(again.migratedFrom).toEqual([]);
    expect(again.documents).toHaveLength(3);
  });

  test("tanpa icon-studio-v1, set offset-composer menjadi dokumen aktif", () => {
    const storage = memoryStorage();
    storage.setItem(
      "offset-composer-v1",
      JSON.stringify(offsetFixture.storage["offset-composer-v1"]),
    );
    const app = createAppState({ renderer: fakeRenderer(), storage });
    expect(app.documents).toHaveLength(1);
    expect(app.documents[0].style.family).toBe("offset");
    expect(app.activeId).toBe(app.documents[0].id);
  });

  test("impor gaya.json offset-composer menambah set aktif; teks lain dilewatkan", async () => {
    const storage = memoryStorage();
    const app = createAppState({ renderer: fakeRenderer(), storage });
    expect(await app.importOffsetSet(JSON.stringify(SAMPLE_MANIFEST))).toBeNull();
    expect(await app.importOffsetSet("{")).toBeNull();
    const res = await app.importOffsetSet(
      JSON.stringify(offsetFixture.gayaJson),
    );
    expect(res?.warnings).toEqual(["Gaya diseragamkan mengikuti ikon pertama"]);
    expect(app.activeId).toBe(res?.doc.id);
    expect(app.documentFor("composer")).toBe(res?.doc);
    expect(app.selection[res?.doc.id]).toBe(res?.doc.items[0].id);
    expect(JSON.parse(storage.map.get(STORE_KEY)).documents).toHaveLength(2);
  });

  test("impor manifest rusak tidak menambah dokumen", async () => {
    const app = createAppState({
      renderer: fakeRenderer(),
      storage: memoryStorage(),
    });
    expect((await app.importManifest("{")).fatal).toMatch(/JSON tidak valid/);
    expect(app.documents).toHaveLength(1);
  });

  test("set contoh hanya mengisi set kosong", () => {
    const app = createAppState({
      renderer: fakeRenderer(),
      storage: memoryStorage(),
    });
    const doc = app.documents[0];
    app.loadPreset(doc.id);
    expect(doc.items.length).toBeGreaterThan(10);
    expect(doc.name).toBe("Set contoh");
    expect(app.selection[doc.id]).toBe(doc.items[0].id);
    const n = doc.items.length;
    app.loadPreset(doc.id);
    expect(doc.items).toHaveLength(n);
  });

  test("activate senyap tidak memanggil pendengar, menutup dokumen terakhir menyisakan set", async () => {
    const app = createAppState({
      renderer: fakeRenderer(),
      storage: memoryStorage(),
    });
    const { doc } = await app.importManifest(JSON.stringify(SAMPLE_MANIFEST));
    let calls = 0;
    app.subscribe(() => calls++);
    app.activate(app.documents[0].id, { silent: true });
    expect(calls).toBe(0);
    app.activate(doc.id);
    expect(calls).toBe(1);
    app.close(app.documents[0].id);
    app.close(doc.id);
    expect(app.documents).toHaveLength(1);
    expect(app.documents[0].kind).toBe("set");
  });

  test("migrasi data IC lama sekali saat icon-studio-v1 belum ada", () => {
    const storage = memoryStorage();
    storage.setItem(
      "icon-composer-aksen-v1",
      JSON.stringify({
        style: { family: "accent" },
        set: [{ id: "a", main: "face", mod: "check" }],
      }),
    );
    const app = createAppState({ renderer: fakeRenderer(), storage });
    expect(app.migratedFrom).toEqual(["icon-composer-aksen-v1"]);
    expect(app.documents).toHaveLength(1);
    expect(app.documents[0]).toMatchObject({
      kind: "set",
      name: "Set Icon Composer",
    });
    expect(app.documents[0].style.family).toBe("accent");
    expect(storage.map.has(STORE_KEY)).toBe(true);
    expect(storage.map.has("icon-composer-aksen-v1")).toBe(true);
    const again = createAppState({ renderer: fakeRenderer(), storage });
    expect(again.migratedFrom).toEqual([]);
    expect(again.documents.map((d) => d.id)).toEqual(
      app.documents.map((d) => d.id),
    );
  });
});
