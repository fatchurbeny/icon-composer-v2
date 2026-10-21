// @ts-check
/**
 * Migrasi 004: set sticker-composer (`sticker-composer-v1`) ke dokumen set Icon Studio bergaya Sticker.
 * Dijalankan sekali per state: app mencatat `004-from-sticker` di `migrations` milik `icon-studio-v1`,
 * jadi migrasi ini juga berjalan untuk pengguna yang sudah punya `icon-studio-v1`. Dokumen hasil
 * migrasi ditambahkan, tidak menimpa dokumen yang ada. Kunci lama dibaca, tidak diubah, tidak dihapus.
 * Id 003 dipakai migrasi coret-composer (Fase 4), yang berjalan lebih dulu.
 *
 * | Kunci lama | Menjadi |
 * |---|---|
 * | `sticker-composer-v1` (`{style, set, pools}`) | dokumen set "Set Sticker Composer", `style.family = "sticker"`, pool Kombinasi dari `pools` |
 */
import { randomUid, stickerSetFromComposer } from "../document.js";
import { readJson } from "./001-from-legacy.js";

export const STICKER_KEY = "sticker-composer-v1";
export const MIGRATION_ID = "004-from-sticker";

/**
 * @param {Pick<Storage, "getItem">} storage
 * @param {{lib: import("../document.js").Library, uid?: () => string}} deps registry pustaka untuk normItem
 * @returns {{documents: any[], sources: string[], warnings: string[]} | null} null bila tidak ada set sticker-composer
 */
export function migrateFromSticker(storage, deps) {
  const res = stickerSetFromComposer(readJson(storage, STICKER_KEY), deps.lib, { uid: deps.uid || randomUid });
  if (!res || "fatal" in res) return null;
  return { documents: [res.doc], sources: [STICKER_KEY], warnings: res.warnings };
}
