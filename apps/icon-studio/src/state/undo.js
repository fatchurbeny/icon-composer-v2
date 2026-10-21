// @ts-check
/**
 * @module undo
 * Urungkan dan ulangi per dokumen, hanya di memori (hilang saat app dimuat ulang).
 *
 * Tiap dokumen punya `base` (salinan isi saat pencatatan terakhir), `past` (maks `limit` langkah), dan
 * `future`. `commit` membandingkan isi dokumen dengan `base`: bila berbeda, `base` didorong ke `past`
 * dengan label perubahan. Karena pembandingnya `base`, perubahan langsung pada dokumen (mis. saat
 * menyeret lapisan) menjadi satu langkah ketika akhirnya dicatat dengan `commit`.
 *
 * Hanya field isi yang disalin (CONTENT_FIELDS, termasuk `meta` karena metadata Canva di Tinjau diubah di
 * sana). Tampilan (`view`), hasil validasi (`issues`), dan seleksi
 * tidak ikut, jadi urungkan tidak memindah tab, filter, atau zoom.
 */

/** Field isi dokumen yang ikut dicatat dan dipulihkan. */
export const CONTENT_FIELDS = /** @type {const} */ (["name", "items", "style", "customs", "pool", "combo", "review", "meta", "manifest", "export", "pv"]);

/** Batas bawaan langkah urungkan per dokumen. */
export const UNDO_LIMIT = 10;

/**
 * @typedef {Record<string, any>} Snapshot
 * @typedef {{snap: Snapshot, label: string}} Step
 * @typedef {{base: Snapshot, key: string, past: Step[], future: Step[], cleared: Step[] | null}} Track
 */

/**
 * Salinan field isi dokumen (structuredClone). Field yang tidak ada di dokumen tidak ikut.
 * @param {any} doc
 * @returns {Snapshot}
 */
export function snapshot(doc) {
  /** @type {Snapshot} */
  const out = {};
  for (const k of CONTENT_FIELDS) if (doc && doc[k] !== undefined) out[k] = structuredClone(doc[k]);
  return out;
}

/** @param {Snapshot} snap */
const keyOf = (snap) => JSON.stringify(snap);

/**
 * Tulis salinan ke dokumen. Field isi yang tidak ada di salinan dihapus dari dokumen.
 * @param {any} doc
 * @param {Snapshot} snap
 */
function apply(doc, snap) {
  for (const k of CONTENT_FIELDS) if (!(k in snap)) delete doc[k];
  Object.assign(doc, structuredClone(snap));
}

/**
 * @param {{limit?: number}} [options]
 */
export function createUndo(options = {}) {
  const limit = Math.max(1, options.limit || UNDO_LIMIT);
  /** @type {Map<string, Track>} */
  const tracks = new Map();

  /**
   * @param {string} docId
   * @param {any} doc
   */
  const track = (docId, doc) => {
    let t = tracks.get(docId);
    if (!t) {
      const base = snapshot(doc);
      t = { base, key: keyOf(base), past: [], future: [], cleared: null };
      tracks.set(docId, t);
    }
    return t;
  };

  return {
    limit,
    /** @param {string} docId */
    has: (docId) => tracks.has(docId),
    /**
     * Catat perubahan berlabel. Bila isi berbeda dari `base`, `base` lama menjadi satu langkah urungkan
     * dan riwayat ulangi dikosongkan.
     * @param {string} docId
     * @param {any} doc
     * @param {string} label
     * @returns {boolean} true bila langkah baru dibuat
     */
    commit(docId, doc, label) {
      const t = track(docId, doc);
      const snap = snapshot(doc),
        key = keyOf(snap);
      if (key === t.key) return false;
      t.past.push({ snap: t.base, label });
      if (t.past.length > limit) t.past.splice(0, t.past.length - limit);
      /* riwayat ulangi disimpan sampai langkah berikutnya, supaya `discard` bisa memulihkannya */
      t.cleared = t.future;
      t.future = [];
      t.base = snap;
      t.key = key;
      return true;
    },
    /**
     * Batalkan langkah terakhir seolah tidak pernah terjadi: dokumen kembali ke isi sebelum langkah itu,
     * langkah tidak masuk riwayat ulangi, dan riwayat ulangi yang dikosongkan oleh langkah itu dipulihkan.
     * Hanya berlaku bila langkah terakhir berlabel `label` dan isi dokumen belum berubah sejak langkah itu
     * dicatat. Dipakai untuk klik pertama dari klik dua kali yang ternyata bukan perubahan.
     * @param {string} docId
     * @param {any} doc
     * @param {string} label
     * @returns {boolean} true bila langkah dibatalkan
     */
    discard(docId, doc, label) {
      const t = tracks.get(docId);
      const step = t && t.past.at(-1);
      if (!t || !step || !t.cleared || step.label !== label || keyOf(snapshot(doc)) !== t.key) return false;
      t.past.pop();
      apply(doc, step.snap);
      t.base = step.snap;
      t.key = keyOf(step.snap);
      t.future = t.cleared;
      t.cleared = null;
      return true;
    },
    /**
     * Samakan `base` dengan isi dokumen sekarang tanpa membuat langkah.
     * @param {string} docId
     * @param {any} doc
     */
    sync(docId, doc) {
      const t = track(docId, doc);
      const snap = snapshot(doc),
        key = keyOf(snap);
      /* isi berubah di luar langkah: langkah terakhir tidak lagi bisa dibatalkan dengan `discard` */
      if (key !== t.key) t.cleared = null;
      t.base = snap;
      t.key = key;
    },
    /**
     * Kembalikan dokumen ke langkah sebelumnya.
     * @param {string} docId
     * @param {any} doc
     * @returns {string | null} label langkah yang diurungkan, null bila tidak ada
     */
    undo(docId, doc) {
      const t = tracks.get(docId);
      const step = t && t.past.pop();
      if (!t || !step) return null;
      t.cleared = null;
      t.future.push({ snap: t.base, label: step.label });
      apply(doc, step.snap);
      t.base = step.snap;
      t.key = keyOf(step.snap);
      return step.label;
    },
    /**
     * Terapkan lagi langkah yang terakhir diurungkan.
     * @param {string} docId
     * @param {any} doc
     * @returns {string | null} label langkah yang diulang, null bila tidak ada
     */
    redo(docId, doc) {
      const t = tracks.get(docId);
      const step = t && t.future.pop();
      if (!t || !step) return null;
      t.cleared = null;
      t.past.push({ snap: t.base, label: step.label });
      apply(doc, step.snap);
      t.base = step.snap;
      t.key = keyOf(step.snap);
      return step.label;
    },
    /** @param {string} docId */
    canUndo: (docId) => !!tracks.get(docId)?.past.length,
    /** @param {string} docId */
    canRedo: (docId) => !!tracks.get(docId)?.future.length,
    /**
     * Label langkah berikutnya untuk urungkan dan ulangi (untuk tooltip tombol).
     * @param {string} docId
     */
    peek(docId) {
      const t = tracks.get(docId);
      return { undo: t?.past.at(-1)?.label || null, redo: t?.future.at(-1)?.label || null };
    },
    /**
     * Lupakan riwayat dokumen (dokumen ditutup atau isinya diganti utuh).
     * @param {string} docId
     */
    reset(docId) {
      tracks.delete(docId);
    },
  };
}
