// @ts-check
/**
 * Penyimpanan Icon Studio di satu kunci localStorage `icon-studio-v1` (ADR-017).
 * Semua akses dibungkus try/catch: penyimpanan bisa kosong atau ditolak (jendela privat, file://).
 * Migrasi dari kunci app lama dikerjakan di Fase 2b langkah 8 (`state/migrations/`).
 */

export const STORE_KEY = "icon-studio-v1";
export const SCHEMA_VERSION = 1;

/** Maksimal warna di Preset saya (berlaku untuk semua set). */
export const PRESET_LIMIT = 16;

/**
 * `migrations` mencatat migrasi yang sudah dijalankan pada state ini (mis. `002-from-offset`).
 * `colorPresets` (Preset saya) dan `swatchSource` berlaku untuk seluruh app, bukan per dokumen,
 * dan tidak ikut urungkan. State lama tanpa field ini tetap terbaca dengan nilai bawaan.
 * @typedef {"bawaan" | "preset"} SwatchSource
 * @typedef {{schemaVersion: number, documents: any[], activeId: string | null, migrations: string[], colorPresets: string[], swatchSource: SwatchSource}} StudioState
 */

/** @returns {StudioState} */
export function emptyState() {
  return { schemaVersion: SCHEMA_VERSION, documents: [], activeId: null, migrations: [], colorPresets: [], swatchSource: "bawaan" };
}

/**
 * Rapikan Preset saya: hanya hex `#RRGGBB` huruf besar, tanpa ganda, maks PRESET_LIMIT.
 * @param {unknown} list
 * @returns {string[]}
 */
export function normColorPresets(list) {
  if (!Array.isArray(list)) return [];
  /** @type {string[]} */
  const out = [];
  for (const c of list) {
    const hex = /^#?[0-9a-f]{6}$/i.test(String(c)) ? `#${String(c).replace("#", "").toUpperCase()}` : null;
    if (hex && !out.includes(hex)) out.push(hex);
  }
  return out.slice(0, PRESET_LIMIT);
}

/** @param {unknown} value @returns {SwatchSource} */
export const normSwatchSource = (value) => (value === "preset" ? "preset" : "bawaan");

/** Akses localStorage bisa melempar (data: URL, jendela privat), jadi selalu dibungkus. */
function defaultStorage() {
  return globalThis.localStorage;
}

/**
 * Apakah `icon-studio-v1` sudah pernah disimpan (penentu migrasi sekali jalan).
 * @param {Pick<Storage, "getItem">} [storage]
 */
export function hasState(storage) {
  try {
    storage = storage || defaultStorage();
    return !!(storage && storage.getItem(STORE_KEY));
  } catch {
    return false;
  }
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
    const migrations = Array.isArray(data.migrations)
      ? data.migrations.filter((/** @type {any} */ m) => typeof m === "string")
      : [];
    return {
      schemaVersion: SCHEMA_VERSION,
      documents,
      activeId,
      migrations,
      colorPresets: normColorPresets(data.colorPresets),
      swatchSource: normSwatchSource(data.swatchSource),
    };
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
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        documents: state.documents,
        activeId: state.activeId,
        migrations: state.migrations || [],
        colorPresets: normColorPresets(state.colorPresets),
        swatchSource: normSwatchSource(state.swatchSource),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
