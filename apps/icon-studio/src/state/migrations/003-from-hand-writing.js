// @ts-check
/**
 * Migrasi 003: set coret-composer 1.0.0 (kunci lama `coret-composer-v1`) ke dokumen set Icon Studio bergaya
 * Hand-writing. Dijalankan sekali per state: app mencatat `003-from-hand-writing` di `migrations` milik
 * `icon-studio-v1`, jadi migrasi ini juga berjalan untuk pengguna yang sudah punya `icon-studio-v1`. Dokumen
 * hasil migrasi ditambahkan, tidak menimpa dokumen yang ada. Kunci lama dibaca, tidak diubah, tidak dihapus.
 *
 * | Kunci lama | Menjadi |
 * |---|---|
 * | `coret-composer-v1` (`{S, set, cur}`) | dokumen set "Set Hand-writing", `style.family = "hand-writing"`, `S` → `style.engine["hand-writing"]`; `cur` tidak ikut |
 */
import { HAND_WRITING_LEGACY_KEY, handWritingSetFromComposer, randomUid } from "../document.js";
import { readJson } from "./001-from-legacy.js";

export { HAND_WRITING_LEGACY_KEY };
export const MIGRATION_ID = "003-from-hand-writing";

/**
 * @param {Pick<Storage, "getItem">} storage
 * @param {{lib: import("../document.js").Library, uid?: () => string}} deps registry pustaka untuk normItem
 * @returns {{documents: any[], sources: string[], warnings: string[]} | null} null bila tidak ada set coret-composer
 */
export function migrateFromHandWriting(storage, deps) {
  const res = handWritingSetFromComposer(readJson(storage, HAND_WRITING_LEGACY_KEY), deps.lib, { uid: deps.uid || randomUid });
  if (!res || "fatal" in res) return null;
  return { documents: [res.doc], sources: [HAND_WRITING_LEGACY_KEY], warnings: res.warnings };
}
