// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  createSetDocument,
  normItem,
} from "../../apps/icon-studio/src/state/document.js";
import {
  DEFAULT_POOL,
  addItem,
  clearLayer,
  duplicateGroups,
  duplicateItem,
  ensureSetFields,
  moveItem,
  nameOf,
  removeItem,
  replaceLayer,
  setOffsetDeco,
  setStyleValue,
  sortedItems,
} from "../../apps/icon-studio/src/state/set-ops.js";

function lib() {
  const data = createClassicData({ starDecos: true });
  return {
    ...data,
    LIB_RE: /^(lu|tb|hg|cu):/,
    ensure: (/** @type {string} */ key, /** @type {"main" | "mod"} */ kind) => {
      (kind === "main" ? data.MAINS : data.MODS)[key] = {
        n: key.slice(3),
        slot: "TR",
      };
      return true;
    },
  };
}

function setDoc(L) {
  let n = 0;
  const doc = ensureSetFields(createSetDocument({ name: "Uji" }, () => "s"));
  doc.items = [
    normItem({ name: "A", main: "face", mod: "bubble" }, L, {
      uid: () => `i${++n}`,
    }),
    normItem({ name: "B", main: "bell", mod: "mail" }, L, {
      uid: () => `i${++n}`,
    }),
    normItem({ name: "C", main: "cart", mod: "plus" }, L, {
      uid: () => `i${++n}`,
    }),
  ];
  return doc;
}

describe("Icon Studio set-ops", () => {
  test("ensureSetFields mengisi pool dan tampilan bawaan tanpa berbagi objek", () => {
    const a = ensureSetFields({}),
      b = ensureSetFields({});
    expect(a.pool).toEqual(DEFAULT_POOL);
    expect(a.pool).not.toBe(b.pool);
    expect(a.view).toEqual({ sort: "set", cols: 8, snap: true, grid: true, panel: true });
    expect(ensureSetFields({ view: { cols: 4 } }).view.cols).toBe(4);
  });

  test("nameOf memakai nama ikon atau nama objek + pengubah seperti IC", () => {
    const L = lib();
    expect(nameOf({ name: "X", main: "face", mod: "none" }, L)).toBe("X");
    expect(nameOf({ name: "", main: "face", mod: "bubble" }, L)).toBe(
      `${L.MAINS.face.n} + ${L.MODS.bubble.n.toLowerCase()}`,
    );
  });

  test("tambah, duplikat, hapus, pindah", () => {
    const L = lib(),
      doc = setDoc(L);
    const added = addItem(doc, L);
    expect(doc.items.at(-1)).toBe(added);
    const dup = duplicateItem(doc, "i2", L);
    expect(doc.items[2]).toBe(dup);
    expect(dup.name).toBe("B (2)");
    expect(dup.id).not.toBe("i2");
    expect(removeItem(doc, "i1")).toBe("i2");
    expect(removeItem(doc, "tidak-ada")).toBeNull();
    expect(moveItem(doc, "i3", 0)).toBe(true);
    expect(doc.items[0].id).toBe("i3");
  });

  test("ganti isi lapisan: pengubah ikut slot bawaan dan geser objek", () => {
    const L = lib(),
      [it] = setDoc(L).items;
    replaceLayer(it, "mod", "lu:heart", L);
    expect(it).toMatchObject({
      mod: "lu:heart",
      slot: "TR",
      nx: 0,
      ny: 0,
      mx: L.SHIFT.TR[0],
      my: L.SHIFT.TR[1],
    });
    replaceLayer(it, "main", "lu:coffee", L);
    expect(it).toMatchObject({ main: "lu:coffee", parts: null });
    clearLayer(it, "mod");
    expect(it).toMatchObject({ mod: "none", mx: 0, my: 0 });
  });

  test("setStyleValue membatasi angka dan memvalidasi pilihan", () => {
    const s = createSetDocument({}).style;
    setStyleValue(s, "sw", 9);
    expect(s.sw).toBe(4);
    setStyleValue(s, "scale.mod", 10);
    expect(s.scale.mod).toBe(50);
    setStyleValue(s, "cap", "round");
    expect([s.cap, s.join]).toEqual(["round", "round"]);
    setStyleValue(s, "pref", "Z");
    expect(s.pref).toBe("A");
    setStyleValue(s, "accent", "#abcdef");
    expect(s.accent).toBe("#ABCDEF");
    setStyleValue(s, "family", "accent");
    expect(s.family).toBe("accent");
    expect(s.saved.classic).toBeTruthy();
  });

  test("setStyleValue offset dan dekorasi offset per ikon", () => {
    const s = createSetDocument({}).style;
    setStyleValue(s, "family", "offset");
    setStyleValue(s, "offset.dx", 20);
    setStyleValue(s, "offset.mode", "white");
    setStyleValue(s, "offset.acc", "#2eb67d");
    setStyleValue(s, "offset.sw", "x");
    setStyleValue(s, "offset.size", 50);
    expect(s.engine.offset).toEqual({ mode: "white", acc: "#2EB67D", ink: "#1A1A1A", dx: 8, dy: 4, sw: 2.6, size: 100.8 });
    const it = { main: "lu:house", mod: "none", engine: { sticker: { seed: 1 } } };
    setOffsetDeco(it, "cloud", true);
    setOffsetDeco(it, "tickPos", "TL");
    expect(it.engine.sticker).toEqual({ seed: 1 });
    expect(/** @type {any} */ (it.engine).offset.deco).toEqual({ tick: true, tickPos: "TL", ground: true, cloud: true, grass: false });
  });

  test("urutan tampilan dan kelompok dobel", () => {
    const L = lib(),
      doc = setDoc(L);
    doc.items.push(
      normItem({ name: "D", main: "face", mod: "bubble" }, L, {
        uid: () => "i4",
      }),
    );
    const sig = (/** @type {any} */ it) => `${it.main}|${it.mod}`;
    const groups = duplicateGroups(doc.items, sig);
    expect(groups.map((g) => g.map((it) => it.id))).toEqual([["i1", "i4"]]);
    const flagged = new Set(groups.flat().map((it) => it.id));
    expect(
      sortedItems(doc.items, "flag", (it) => it.name, flagged)
        .slice(0, 2)
        .map((it) => it.id),
    ).toEqual(["i1", "i4"]);
    expect(
      sortedItems(doc.items, "name", (it) => it.name, flagged).map(
        (it) => it.name,
      ),
    ).toEqual(["A", "B", "C", "D"]);
    expect(sortedItems(doc.items, "set", (it) => it.name, flagged)).toBe(
      doc.items,
    );
  });
});
