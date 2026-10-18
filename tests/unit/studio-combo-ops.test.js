// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  activePool,
  addCombos,
  comboItem,
  comboMatrix,
  setSkip,
  togglePool,
} from "../../apps/icon-studio/src/state/combo-ops.js";
import {
  createSetDocument,
  normItem,
} from "../../apps/icon-studio/src/state/document.js";
import { ensureSetFields } from "../../apps/icon-studio/src/state/set-ops.js";

const data = createClassicData();
const lib = { ...data, LIB_RE: /^(lu|tb|hg|cu):/, ensure: () => true };
const signature = (/** @type {any} */ it) => `${it.main}|${it.mod}|${it.slot}`;

function doc() {
  const d = ensureSetFields(createSetDocument({ name: "Uji" }, () => "s"));
  d.pool = {
    mains: ["face", "doc"],
    mods: ["bubble", "lock", "plus"],
    off: {},
  };
  return d;
}

describe("Icon Studio combo-ops", () => {
  test("activePool membuang yang dimatikan, togglePool menambah dan mengeluarkan", () => {
    const d = doc();
    d.pool.off["mod|lock"] = true;
    expect(activePool(d.pool)).toEqual({
      mains: ["face", "doc"],
      mods: ["bubble", "plus"],
    });
    expect(togglePool(d.pool, "mod", "lock")).toBe(false);
    expect(d.pool.off["mod|lock"]).toBeUndefined();
    expect(togglePool(d.pool, "main", "lu:coffee")).toBe(true);
    expect(d.pool.mains).toContain("lu:coffee");
  });

  test("comboItem memakai slot bawaan pengubah atau slot paksa", () => {
    const it = comboItem("face", "plus", { pos: "default" }, null, lib);
    expect(it).toMatchObject({
      slot: data.MODS.plus.slot,
      mx: data.SHIFT[data.MODS.plus.slot][0],
      pref: "set",
    });
    expect(comboItem("face", "plus", { pos: "BR" }, "B", lib)).toMatchObject({
      slot: "BR",
      pref: "B",
    });
  });

  test("status sel: library, exists, skipped, on", () => {
    const d = doc();
    d.items.push(
      normItem(comboItem("face", "bubble", d.combo, null, lib), lib),
    );
    setSkip(d, [["doc", "lock"]], true);
    const collisions = (/** @type {any} */ it) =>
      it.main === "doc" && it.mod === "plus" ? ["Lucide file-plus"] : [];
    const mx = comboMatrix(d, { lib, signature, collisions });
    const states = Object.fromEntries(
      mx.rows.flatMap((r) =>
        r.cells.map((c) => [`${r.main}|${c.mod}`, c.state]),
      ),
    );
    expect(states).toEqual({
      "face|bubble": "exists",
      "face|lock": "on",
      "face|plus": "on",
      "doc|bubble": "on",
      "doc|lock": "skipped",
      "doc|plus": "library",
    });
    expect(mx.count).toEqual({ on: 3, skipped: 1, exists: 1, library: 1 });
    d.combo.skipExisting = false;
    expect(comboMatrix(d, { lib, signature, collisions }).count.on).toBe(4);
  });

  test("addCombos menambah sel on, tiga kali untuk mode semua", () => {
    const d = doc();
    const deps = { lib, signature, collisions: () => [] };
    expect(addCombos(d, deps).added).toHaveLength(6);
    expect(comboMatrix(d, deps).count.exists).toBe(6);
    const d2 = doc();
    d2.combo.mode = "all";
    const { added } = addCombos(d2, deps);
    expect(added).toHaveLength(18);
    expect(added.slice(0, 3).map((it) => it.pref)).toEqual(["A", "B", "C"]);
  });

  test("sel yang dilewati tidak terbagi antardokumen baru", () => {
    const a = doc();
    setSkip(a, [["face", "plus"]], true);
    expect(doc().combo.skip).toEqual({});
  });
});
