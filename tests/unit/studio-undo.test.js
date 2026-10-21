// @ts-check
import { describe, expect, test } from "vitest";
import {
  CONTENT_FIELDS,
  createUndo,
  snapshot,
} from "../../apps/icon-studio/src/state/undo.js";

/** Dokumen set kecil untuk tes. */
const makeDoc = () => ({
  id: "set-a",
  kind: "set",
  name: "Set",
  style: { family: "classic", scale: { main: 84 } },
  items: [{ id: "i1", main: "home", mx: 0 }],
  customs: [],
  view: { grid: true, panel: true },
  issues: [],
});

describe("undo Icon Studio", () => {
  test("snapshot hanya menyalin field isi, bukan view atau issues", () => {
    const doc = makeDoc();
    const snap = snapshot(doc);
    expect(
      Object.keys(snap).every((k) =>
        /** @type {readonly string[]} */ (CONTENT_FIELDS).includes(k),
      ),
    ).toBe(true);
    expect(snap).not.toHaveProperty("view");
    expect(snap).not.toHaveProperty("issues");
    snap.items[0].mx = 9;
    expect(doc.items[0].mx).toBe(0);
  });

  test("batas 10 langkah: 11 perubahan hanya bisa diurungkan 10 kali", () => {
    const u = createUndo({ limit: 10 });
    const doc = makeDoc();
    u.sync(doc.id, doc);
    for (let i = 1; i <= 11; i++) {
      doc.items[0].mx = i;
      u.commit(doc.id, doc, `Geser ${i}`);
    }
    let n = 0;
    while (u.undo(doc.id, doc) != null) n++;
    expect(n).toBe(10);
    expect(doc.items[0].mx).toBe(1);
    expect(u.canUndo(doc.id)).toBe(false);
  });

  test("redo hilang setelah perubahan baru", () => {
    const u = createUndo();
    const doc = makeDoc();
    u.sync(doc.id, doc);
    doc.name = "A";
    u.commit(doc.id, doc, "Nama A");
    expect(u.undo(doc.id, doc)).toBe("Nama A");
    expect(u.canRedo(doc.id)).toBe(true);
    doc.name = "B";
    u.commit(doc.id, doc, "Nama B");
    expect(u.canRedo(doc.id)).toBe(false);
    expect(u.redo(doc.id, doc)).toBeNull();
  });

  test("perubahan langsung beberapa kali lalu satu commit menjadi satu langkah", () => {
    const u = createUndo();
    const doc = makeDoc();
    u.sync(doc.id, doc);
    /* seperti seret: posisi diubah berkali-kali tanpa mutate, lalu dicatat saat dilepas */
    for (let i = 1; i <= 20; i++) doc.items[0].mx = i / 2;
    doc.style.scale.main = 70;
    expect(u.commit(doc.id, doc, "Geser objek utama")).toBe(true);
    expect(u.undo(doc.id, doc)).toBe("Geser objek utama");
    expect(doc.items[0].mx).toBe(0);
    expect(doc.style.scale.main).toBe(84);
    expect(u.canUndo(doc.id)).toBe(false);
  });

  test("mutate tanpa label (sync) bukan langkah, commit tanpa perubahan juga bukan", () => {
    const u = createUndo();
    const doc = makeDoc();
    u.sync(doc.id, doc);
    doc.name = "Tanpa label";
    u.sync(doc.id, doc);
    expect(u.canUndo(doc.id)).toBe(false);
    expect(u.commit(doc.id, doc, "Tidak berubah")).toBe(false);
    expect(u.canUndo(doc.id)).toBe(false);
    doc.name = "Berlabel";
    u.commit(doc.id, doc, "Nama");
    u.undo(doc.id, doc);
    expect(doc.name).toBe("Tanpa label");
  });

  test("view tidak dipulihkan oleh urungkan", () => {
    const u = createUndo();
    const doc = makeDoc();
    u.sync(doc.id, doc);
    doc.items[0].main = "mail";
    u.commit(doc.id, doc, "Objek utama = mail");
    doc.view.grid = false;
    doc.view.panel = false;
    u.undo(doc.id, doc);
    expect(doc.items[0].main).toBe("home");
    expect(doc.view).toEqual({ grid: false, panel: false });
  });

  test("urungkan dan ulangi berpasangan dan mengembalikan label", () => {
    const u = createUndo();
    const doc = makeDoc();
    u.sync(doc.id, doc);
    const states = [];
    for (const [i, family] of /** @type {const} */ ([
      [1, "accent"],
      [2, "offset"],
      [3, "classic"],
    ])) {
      doc.style.family = family;
      doc.items.push({ id: `n${i}`, main: "star", mx: i });
      u.commit(doc.id, doc, `Langkah ${i}`);
      states.push(JSON.stringify(snapshot(doc)));
    }
    expect(u.peek(doc.id)).toEqual({ undo: "Langkah 3", redo: null });
    expect(u.undo(doc.id, doc)).toBe("Langkah 3");
    expect(u.undo(doc.id, doc)).toBe("Langkah 2");
    expect(JSON.stringify(snapshot(doc))).toBe(states[0]);
    expect(u.peek(doc.id)).toEqual({ undo: "Langkah 1", redo: "Langkah 2" });
    expect(u.redo(doc.id, doc)).toBe("Langkah 2");
    expect(u.redo(doc.id, doc)).toBe("Langkah 3");
    expect(JSON.stringify(snapshot(doc))).toBe(states[2]);
    expect(u.canRedo(doc.id)).toBe(false);
  });

  test("field isi yang tidak ada di salinan dihapus saat dipulihkan; reset melupakan riwayat", () => {
    const u = createUndo();
    const doc = /** @type {any} */ (makeDoc());
    u.sync(doc.id, doc);
    doc.pool = { mains: ["home"], mods: [], off: {} };
    u.commit(doc.id, doc, "Pool");
    u.undo(doc.id, doc);
    expect(doc).not.toHaveProperty("pool");
    u.reset(doc.id);
    expect(u.canRedo(doc.id)).toBe(false);
    expect(u.has(doc.id)).toBe(false);
  });

  test("discard membatalkan langkah terakhir tanpa jejak dan memulihkan riwayat ulangi", () => {
    const u = createUndo();
    const doc = /** @type {any} */ (makeDoc());
    u.sync(doc.id, doc);
    const start = JSON.stringify(snapshot(doc));
    doc.name = "A";
    u.commit(doc.id, doc, "Nama");
    u.undo(doc.id, doc);
    expect(u.canRedo(doc.id)).toBe(true);
    doc.items[0].mx = 5;
    u.commit(doc.id, doc, "Geser");
    expect(u.canRedo(doc.id)).toBe(false);
    /* render ulang tanpa perubahan isi tidak menghalangi discard */
    u.sync(doc.id, doc);
    expect(u.discard(doc.id, doc, "Geser")).toBe(true);
    expect(JSON.stringify(snapshot(doc))).toBe(start);
    expect(u.canUndo(doc.id)).toBe(false);
    expect(u.peek(doc.id)).toEqual({ undo: null, redo: "Nama" });
    expect(u.redo(doc.id, doc)).toBe("Nama");
    expect(doc.name).toBe("A");
  });

  test("discard ditolak bila label beda, isi sudah berubah, atau setelah urungkan", () => {
    const u = createUndo();
    const doc = /** @type {any} */ (makeDoc());
    u.sync(doc.id, doc);
    expect(u.discard(doc.id, doc, "Geser")).toBe(false);
    doc.items[0].mx = 5;
    u.commit(doc.id, doc, "Geser");
    expect(u.discard(doc.id, doc, "Nama")).toBe(false);
    doc.items[0].mx = 6;
    expect(u.discard(doc.id, doc, "Geser")).toBe(false);
    u.sync(doc.id, doc);
    expect(u.discard(doc.id, doc, "Geser")).toBe(false);
    expect(u.canUndo(doc.id)).toBe(true);
    doc.name = "B";
    u.commit(doc.id, doc, "Nama");
    u.undo(doc.id, doc);
    u.redo(doc.id, doc);
    expect(u.discard(doc.id, doc, "Nama")).toBe(false);
    expect(u.peek(doc.id).undo).toBe("Nama");
  });
});
