// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  FAMILY_DEFAULT,
  PRESET,
  applyFamily,
  createManifestDocument,
  createSetDocument,
  importManifest,
  normItem,
  normSetStyle,
  useStyle,
} from "../../apps/icon-studio/src/state/document.js";
import { SAMPLE_MANIFEST } from "../../apps/icon-studio/src/state/data/sample-manifest.js";
import {
  STORE_KEY,
  emptyState,
  loadState,
  saveState,
} from "../../apps/icon-studio/src/state/store.js";

/** Registry tiruan: ikon pustaka selalu "terdaftar" sebagai placeholder. */
function fakeLib() {
  const data = createClassicData({ starDecos: true });
  const ensured = [];
  return {
    ensured,
    lib: {
      ...data,
      LIB_RE: /^(lu|tb|hg|cu):/,
      ensure: (
        /** @type {string} */ key,
        /** @type {"main" | "mod"} */ kind,
      ) => {
        ensured.push(`${kind}|${key}`);
        (kind === "main" ? data.MAINS : data.MODS)[key] = { missing: true };
        return false;
      },
    },
  };
}

/** localStorage tiruan. */
function memoryStorage() {
  const map = new Map();
  return {
    getItem: (/** @type {string} */ k) => (map.has(k) ? map.get(k) : null),
    setItem: (/** @type {string} */ k, /** @type {string} */ v) =>
      void map.set(k, v),
    map,
  };
}

describe("Icon Studio state/document", () => {
  test("normSetStyle membatasi nilai dan hanya mengenal classic/accent", () => {
    const s = normSetStyle({
      family: "offset",
      scale: { main: 10, mod: 999 },
      fx: { mode: "glow", color: "#abcdef" },
    });
    expect(s.family).toBe("classic");
    expect(s.scale).toEqual({ main: 60, mod: 150, deco: 100 });
    expect(s.fx.mode).toBe("none");
    expect(s.fx.color).toBe("#ABCDEF");
  });

  test("applyFamily menyimpan patokan keluarga lama dan memulihkannya", () => {
    const s = normSetStyle();
    s.sw = 3;
    applyFamily(s, "accent");
    expect(s.sw).toBe(FAMILY_DEFAULT.accent.sw);
    expect(s.saved.classic.sw).toBe(3);
    applyFamily(s, "classic");
    expect(s.sw).toBe(3);
  });

  test("normItem mengisi bawaan, mendaftarkan ikon pustaka, dan membuang nilai tak dikenal", () => {
    const { lib, ensured } = fakeLib();
    const it = normItem(
      {
        main: "tb:mail",
        mod: "nope",
        slot: "XX",
        deco: { type: "laser" },
        pref: "Z",
        parts: { 0: "acc", x: "ink", 1: "bad" },
      },
      lib,
      { uid: () => "u1" },
    );
    expect(ensured).toEqual(["main|tb:mail"]);
    expect(it).toMatchObject({
      id: "u1",
      main: "tb:mail",
      mod: "none",
      slot: "BL",
      pref: "set",
      parts: { 0: "acc" },
    });
    expect(it.deco.type).toBe("none");
    expect(normItem({ main: "unknown" }, lib).main).toBe("face");
  });

  test("PRESET menghasilkan item valid", () => {
    const { lib } = fakeLib();
    const items = PRESET.map((p) => normItem(p, lib));
    expect(items.length).toBe(PRESET.length);
    expect(items.every((it) => lib.MAINS[it.main])).toBe(true);
  });

  test("importManifest: contoh manifest terbaca, mode dari blok style", () => {
    const { lib } = fakeLib();
    const imp = importManifest(JSON.stringify(SAMPLE_MANIFEST), lib, {
      rand: () => "r",
    });
    expect(imp.fatal).toBeUndefined();
    expect(imp.items.length).toBe(SAMPLE_MANIFEST.icons.length);
    expect(imp.items[0].uid).toBe("i0-r");
    const fam = SAMPLE_MANIFEST.style.family;
    expect(imp.pv).toBe(
      fam === "classic" ? SAMPLE_MANIFEST.style.mode || "A" : "X",
    );
    const doc = createManifestDocument(imp, () => "d1");
    expect(doc).toMatchObject({
      id: "manifest-d1",
      kind: "manifest",
      name: SAMPLE_MANIFEST.deck.title,
    });
  });

  test("importManifest menolak JSON rusak dan manifest tanpa icons", () => {
    const { lib } = fakeLib();
    expect(importManifest("{", lib).fatal).toMatch(/^JSON tidak valid/);
    expect(importManifest("{}", lib).fatal).toBe(
      'Manifest harus punya daftar "icons".',
    );
  });

  test("toItem lewat importManifest: offset dibatasi, id dirapikan, kilau ditempatkan", () => {
    const { lib } = fakeLib();
    const imp = importManifest(
      JSON.stringify({
        style: { family: "classic", mode: "B", ink: "#abcdef" },
        icons: [
          {
            id: "Ikon Baru!",
            main: "face",
            mod: "check",
            anchor: "TL",
            offset: { main: [40, -40] },
            accent: { spark: "star4" },
          },
        ],
      }),
      lib,
    );
    const [it] = imp.items;
    expect(imp.pv).toBe("B");
    expect(imp.style.ink).toBe("#ABCDEF");
    expect(it.id).toBe("ikon-baru");
    expect([it.mx, it.my]).toEqual([12, -12]);
    expect(it.deco.type).toBe("star4");
    expect(it.deco.x).toBe(48 - lib.DECOS.star4.home[0]);
  });

  test("useStyle memakai patokan aksen untuk X dan classic untuk mode lain", () => {
    expect(useStyle({}, "X").sw).toBe(3.5);
    expect(useStyle({}, "B").sw).toBe(2);
  });

  test("createSetDocument menormalkan gaya", () => {
    const doc = createSetDocument({ style: { family: "accent" } }, () => "s1");
    expect(doc).toMatchObject({ id: "set-s1", kind: "set", items: [] });
    expect(doc.style.family).toBe("accent");
  });
});

describe("Icon Studio state/store", () => {
  test("simpan lalu muat dari icon-studio-v1", () => {
    const storage = memoryStorage();
    const state = {
      ...emptyState(),
      documents: [createSetDocument({}, () => "a")],
      activeId: "set-a",
    };
    expect(saveState(state, storage)).toBe(true);
    expect(storage.map.has(STORE_KEY)).toBe(true);
    expect(loadState(storage)).toEqual(state);
  });

  test("data rusak, versi lain, atau penyimpanan ditolak menghasilkan state kosong", () => {
    const storage = memoryStorage();
    storage.setItem(STORE_KEY, "{rusak");
    expect(loadState(storage)).toEqual(emptyState());
    storage.setItem(
      STORE_KEY,
      JSON.stringify({ schemaVersion: 99, documents: [] }),
    );
    expect(loadState(storage)).toEqual(emptyState());
    const denied = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    };
    expect(loadState(denied)).toEqual(emptyState());
    expect(saveState(emptyState(), denied)).toBe(false);
  });

  test("dokumen tak dikenal dibuang dan activeId dipulihkan", () => {
    const storage = memoryStorage();
    storage.setItem(
      STORE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        documents: [
          { id: "x", kind: "lain" },
          { id: "y", kind: "set" },
        ],
        activeId: "x",
      }),
    );
    expect(loadState(storage)).toMatchObject({
      documents: [{ id: "y" }],
      activeId: "y",
    });
  });
});
