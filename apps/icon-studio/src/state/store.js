// @ts-check
/**
 * Penyimpanan Icon Studio di satu kunci localStorage `icon-studio-v1` (ADR-017).
 * Semua akses dibungkus try/catch: penyimpanan bisa kosong atau ditolak (jendela privat, file://).
 * Migrasi dari kunci app lama dikerjakan di Fase 2b langkah 8 (`state/migrations/`).
 */

export const STORE_KEY = "icon-studio-v1";
export const SCHEMA_VERSION = 1;

/**
 * @typedef {{schemaVersion: number, documents: any[], activeId: string | null}} StudioState
 */

/** @returns {StudioState} */
export function emptyState() {
  return { schemaVersion: SCHEMA_VERSION, documents: [], activeId: null };
}

/** Akses localStorage bisa melempar (data: URL, jendela privat), jadi selalu dibungkus. */
function defaultStorage() {
  return globalThis.localStorage;
}

/**
 * @param {Pick<Storage, "getItem">} [storage]
 * @returns {StudioState}
 */
export function loadState(storage) {
  try {
    storage = storage || defaultStorage();
    const raw = storage && storage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const data = JSON.parse(raw);
    if (!data || data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.documents))
      return emptyState();
    const documents = data.documents.filter(
      (/** @type {any} */ d) => d && typeof d.id === "string" && (d.kind === "set" || d.kind === "manifest"),
    );
    const activeId = documents.some((/** @type {any} */ d) => d.id === data.activeId)
      ? data.activeId
      : documents[0]?.id || null;
    return { schemaVersion: SCHEMA_VERSION, documents, activeId };
  } catch {
    return emptyState();
  }
}

/**
 * @param {StudioState} state
 * @param {Pick<Storage, "setItem">} [storage]
 * @returns {boolean} true bila tersimpan
 */
export function saveState(state, storage) {
  try {
    storage = storage || defaultStorage();
    if (!storage) return false;
    storage.setItem(
      STORE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, documents: state.documents, activeId: state.activeId }),
    );
    return true;
  } catch {
    return false;
  }
}
