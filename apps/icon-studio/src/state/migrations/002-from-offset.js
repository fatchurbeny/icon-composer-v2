// @ts-check
/**
 * Migrasi 002: set offset-composer 1.0.1 (`offset-composer-v1`) ke dokumen set Icon Studio bergaya Offset.
 * Dijalankan sekali per state: app mencatat `002-from-offset` di `migrations` milik `icon-studio-v1`,
 * jadi migrasi ini juga berjalan untuk pengguna yang sudah punya `icon-studio-v1`. Dokumen hasil
 * migrasi ditambahkan, tidak menimpa dokumen yang ada. Kunci lama dibaca, tidak diubah, tidak dihapus.
 *
 * | Kunci lama | Menjadi |
 * |---|---|
 * | `offset-composer-v1` (`{cur, set}`) | dokumen set "Set Offset Composer", `style.family = "offset"`; `cur` (ikon yang sedang diedit) tidak ikut |
 */
import { offsetSetFromComposer, randomUid } from "../document.js";
import { readJson } from "./001-from-legacy.js";

export const OFFSET_KEY = "offset-composer-v1";
export const MIGRATION_ID = "002-from-offset";

/**
 * @param {Pick<Storage, "getItem">} storage
 * @param {{lib: import("../document.js").Library, uid?: () => string}} deps registry pustaka untuk normItem
 * @returns {{documents: any[], sources: string[], warnings: string[]} | null} null bila tidak ada set offset-composer
 */
export function migrateFromOffset(storage, deps) {
  const res = offsetSetFromComposer(readJson(storage, OFFSET_KEY), deps.lib, { uid: deps.uid || randomUid });
  if (!res || "fatal" in res) return null;
  return { documents: [res.doc], sources: [OFFSET_KEY], warnings: res.warnings };
}
