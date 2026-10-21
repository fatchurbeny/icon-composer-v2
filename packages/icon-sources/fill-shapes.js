// @ts-check
/**
 * @module icon-sources/fill-shapes
 * Bentuk isi (lapisan warna) mesin sticker, dibangun `scripts/build-icon-data.mjs` dari versi pustaka
 * terkunci (docs/engines/sticker.md).
 *
 * Data ±0,9 MB dimuat malas: `loadFillShapes()` mengimpor `fill-shapes.json` secara dinamis, sehingga app yang
 * tidak memakai gaya Sticker tidak pernah mengurai data itu. Pada build Icon Studio, plugin
 * `scripts/vite-fill-shapes.mjs` mengganti JSON itu dengan `{gz}` (gzip base64) yang didekode di sini; di dev
 * dan Vitest JSON dimuat apa adanya. `fillShapeOf` tetap sinkron dan memakai data yang sudah termuat.
 */

/** @typedef {{versions: {lucide: string, tabler: string}, lu: Record<string, string>, tb: Record<string, string>}} FillShapeData */
/** @typedef {"idle" | "loading" | "ready" | "error"} FillShapeState */

const KEY_RE = /^(lu|tb):(.+)$/;

/**
 * Bentuk isi ikon contoh kartu gaya Sticker (pratinjau di panel Gaya), tersedia sebelum data termuat supaya
 * membuka app tanpa Sticker tidak memuat data. Dijaga sama persis dengan `fill-shapes.json` oleh
 * `tests/unit/fill-shapes.test.js`; perbarui bila skrip data mengubah kedua ikon ini.
 * @type {Readonly<Record<string, string>>}
 */
export const FILL_SHAPE_SEED = Object.freeze({
  "lu:luggage": '<circle cx="16" cy="20" r="2"/><circle cx="8" cy="20" r="2"/>',
  "lu:circle-check": '<circle cx="12" cy="12" r="10"/>',
});

/**
 * Dekode isi modul data: objek JSON apa adanya, atau `{gz}` (string base64 gzip dari plugin build).
 * @param {any} raw
 * @returns {Promise<FillShapeData>}
 */
export async function decodeFillShapes(raw) {
  if (!raw || typeof raw.gz !== "string") return raw;
  const bin = atob(raw.gz);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(stream).text());
}

/**
 * Pemuat bentuk isi dengan state sendiri. App memakai instans bawaan di bawah; tes membuat instans baru
 * dengan `importer` tiruan.
 * @param {() => Promise<any>} importer mengembalikan modul data (`default` berisi JSON atau `{gz}`)
 */
export function createFillShapes(importer) {
  /** @type {FillShapeData | null} */
  let data = null;
  /** @type {FillShapeState} */
  let state = "idle";
  /** @type {Promise<FillShapeData> | null} */
  let pending = null;

  /**
   * Muat data sekali; panggilan berikutnya memakai janji yang sama. Gagal: state "error" dan boleh dicoba lagi.
   * @returns {Promise<FillShapeData>}
   */
  function load() {
    if (data) return Promise.resolve(data);
    if (!pending) {
      state = "loading";
      pending = importer()
        .then((mod) => decodeFillShapes(mod && "default" in mod ? mod.default : mod))
        .then(
          (d) => {
            data = d;
            state = "ready";
            return d;
          },
          (e) => {
            state = "error";
            pending = null;
            throw e;
          },
        );
    }
    return pending;
  }

  /**
   * Apakah `fillShapeOf(key)` sudah memberi jawaban final untuk kunci ini. Selain `lu:`/`tb:` selalu final
   * (tanpa bentuk isi); `lu:`/`tb:` final bila data termuat atau kuncinya ada di seed.
   * @param {string} key
   */
  function ready(key) {
    return !!data || !KEY_RE.test(String(key || "")) || Object.prototype.hasOwnProperty.call(FILL_SHAPE_SEED, key);
  }

  /**
   * Markup bentuk isi untuk kunci ikon (`lu:` atau `tb:`), tanpa prefiks `~`. Ikon tanpa bentuk isi
   * (termasuk Hugeicons, Kustom, dan objek bawaan) menghasilkan string kosong; mesin lalu memakai `plate`.
   * Sebelum data termuat hanya kunci seed yang terjawab; periksa `ready(key)` dulu.
   * @param {string} key
   * @returns {string}
   */
  function fillShapeOf(key) {
    const m = KEY_RE.exec(String(key || ""));
    if (!m) return "";
    if (!data) return FILL_SHAPE_SEED[/** @type {string} */ (key)] || "";
    const table = /** @type {Record<string, string> | undefined} */ (/** @type {any} */ (data)[m[1]]);
    const v = (table && Object.prototype.hasOwnProperty.call(table, m[2]) && table[m[2]]) || "";
    return v[0] === "~" ? v.slice(1) : v;
  }

  return {
    load,
    ready,
    fillShapeOf,
    /** @returns {FillShapeState} */
    state: () => state,
    /** Versi pustaka sumber data (sama dengan sources.json), null sebelum termuat. */
    versions: () => (data ? data.versions : null),
  };
}

const shared = createFillShapes(() => import("./data/fill-shapes.json"));

/** Muat data bentuk isi (sekali per halaman). */
export const loadFillShapes = shared.load;
/** State pemuatan: idle, loading, ready, atau error. */
export const fillShapesState = shared.state;
/** Apakah jawaban `fillShapeOf(key)` sudah final. @type {(key: string) => boolean} */
export const fillShapeReady = shared.ready;
/** Bentuk isi satu kunci dari data yang sudah termuat (lihat `createFillShapes`). @type {(key: string) => string} */
export const fillShapeOf = shared.fillShapeOf;
/** Versi pustaka sumber data setelah termuat. */
export const fillShapeVersions = shared.versions;
