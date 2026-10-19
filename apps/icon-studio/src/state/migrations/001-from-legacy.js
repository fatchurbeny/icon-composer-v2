// @ts-check
/**
 * Migrasi 001: data Icon Composer 1.5.1 dan Template Icon Builder 1.6.0 ke `icon-studio-v1` (ADR-017).
 * Dijalankan sekali, hanya bila `icon-studio-v1` belum ada. Kunci lama dibaca, tidak diubah, tidak dihapus.
 *
 * | Kunci lama | Menjadi |
 * |---|---|
 * | `icon-composer-aksen-v1` (atau `icon-composer-v2`) | dokumen set aktif; setiap pack tersimpan menjadi dokumen set sendiri |
 * | `icon-composer-meta-v1` | `meta.canva` dokumen set dari IC |
 * | `template-icon-builder-aksen-v1` | dokumen Builder (manifest, item, mode pratinjau, kolom Resource Page) |
 * | `tib-canva-brand-id` | tetap dipakai apa adanya oleh Builder |
 */
import { applyFamily, createManifestDocument, createSetDocument, defaultManifestStyle, manifestStyle, normAcc, normItem, normSetStyle, randomUid } from "../document.js";
import { SCHEMA_VERSION } from "../store.js";

export const LEGACY_KEYS = {
  composer: "icon-composer-aksen-v1",
  composerOld: "icon-composer-v2",
  composerMeta: "icon-composer-meta-v1",
  builder: "template-icon-builder-aksen-v1",
};

/**
 * @param {Pick<Storage, "getItem">} storage
 * @param {string} key
 */
export function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {Pick<Storage, "getItem">} storage
 * @param {{lib: any, uid?: () => string}} deps registry pustaka untuk normItem
 * @returns {{state: import("../store.js").StudioState, sources: string[]} | null} null bila tidak ada data lama
 */
export function migrateFromLegacy(storage, deps) {
  const uid = deps.uid || randomUid;
  /** @type {any[]} */
  const documents = [];
  const sources = [];
  let activeId = null;

  /* ---------- Icon Composer ---------- */
  let ic = readJson(storage, LEGACY_KEYS.composer);
  let fresh = false;
  if (!ic) {
    ic = readJson(storage, LEGACY_KEYS.composerOld);
    fresh = !!ic;
  }
  if (ic && typeof ic === "object") {
    const customs = Array.isArray(ic.customs) ? ic.customs.filter((/** @type {any} */ c) => c && c.id && Array.isArray(c.vb) && typeof c.inner === "string") : [];
    /* boot IC: data icon-composer-v2 memakai gaya Aksen bawaan */
    const style = normSetStyle(ic.style);
    if (fresh) applyFamily(style, "accent");
    const meta = readJson(storage, LEGACY_KEYS.composerMeta);
    const canva = meta && typeof meta === "object" ? meta : undefined;
    if (Array.isArray(ic.set) && ic.set.length) {
      const doc = createSetDocument({ name: "Set Icon Composer", style, customs, items: ic.set.map((/** @type {any} */ o) => normItem(o, deps.lib, { customs })) }, uid);
      if (canva) doc.meta = { canva: { ...canva } };
      documents.push(doc);
      activeId = doc.id;
    }
    for (const p of Array.isArray(ic.packs) ? ic.packs : []) {
      if (!p || !Array.isArray(p.set)) continue;
      const doc = createSetDocument({ name: [p.name || "Pack", p.version].filter(Boolean).join(" "), style: p.style, customs, items: p.set.map((/** @type {any} */ o) => normItem(o, deps.lib, { customs })) }, uid);
      doc.meta = { pack: { version: p.version, desc: p.desc, tags: p.tags, cover: p.cover, at: p.at }, ...(canva ? { canva: { ...canva } } : {}) };
      documents.push(doc);
    }
    sources.push(fresh ? LEGACY_KEYS.composerOld : LEGACY_KEYS.composer);
    if (canva) sources.push(LEGACY_KEYS.composerMeta);
  }

  /* ---------- Template Icon Builder ---------- */
  const tib = readJson(storage, LEGACY_KEYS.builder);
  if (tib && tib.man && Array.isArray(tib.items)) {
    const style = defaultManifestStyle();
    const { pv: manPv } = manifestStyle(tib.man, style);
    const pv = ["X", "A", "B"].includes(tib.pv) ? tib.pv : manPv;
    /* boot TIB: normAcc ulang; sebelum 1.5.1 ikon ekstra dinyalakan */
    const items = tib.items.map((/** @type {any} */ it) => {
      normAcc(it, null, deps.lib.DECOS);
      if (!tib.v151 && it.role === "extra") it.on = true;
      return it;
    });
    /* TIB menyalakan centang ekspor hanya untuk mode pratinjau (includePreviewStyleInExport) */
    const exportModes = { X: pv === "X", A: pv === "A", B: pv === "B" };
    const doc = createManifestDocument(/** @type {any} */ ({ manifest: tib.man, style, pv, exportModes, items }), uid);
    doc.isSample = !!tib.isSample;
    doc.export = { modes: exportModes, sheetCols: tib.sheetCols || "auto" };
    documents.push(doc);
    activeId = activeId || doc.id;
    sources.push(LEGACY_KEYS.builder);
  }

  if (!documents.length) return null;
  return { state: { schemaVersion: SCHEMA_VERSION, documents, activeId, migrations: [] }, sources };
}
