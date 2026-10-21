// @ts-check
/**
 * @module icon-sources/library
 * Pemuat pustaka ikon (Lucide, Tabler, Hugeicons, Kustom) dengan cache dan antrean tunggu.
 * Logika dipindah apa adanya dari Icon Composer 1.5.1 dan Template Icon Builder 1.6.0.
 * Paket ini tidak menyentuh `window`: objek Lucide global disuntik lewat `getLucide`.
 */
import sources from "./sources.json";
import { CAT_ID, LU_CATS, TB_CATS, TB_CAT_ID } from "./catalog.js";

/** URL CDN versi terkunci, dibaca dari sources.json. */
export const SOURCE_URLS = Object.freeze({
  tablerNodes: sources.tabler.cdn.nodes,
  tablerMeta: sources.tabler.cdn.meta,
  lucideTags: sources.lucide.cdn.tags,
  hugeicons: sources.hugeicons.cdn.esm,
});

/** @typedef {[string, Record<string, string>]} IconNode */
/** @typedef {Map<string, IconNode[]>} IconIndex */

/**
 * Nama ekspor PascalCase menjadi kebab-case (`Rocket01` → `rocket-01`).
 * @param {string} n
 */
export const kebab = (n) =>
  n
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();

/** Label tampilan dari nama ikon pustaka. @param {string} n */
export const luLabel = (n) => n.replace(/-/g, " ");

/**
 * Atribut Hugeicons (camelCase React) menjadi atribut SVG. Atribut garis dibuang
 * karena tebal garis diatur mesin, dan `currentColor` pada fill menjadi `INK`.
 * @param {Record<string, string>} a
 */
export function hgAttrs(a) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const [k, v] of Object.entries(a || {})) {
    const nk =
      {
        strokeWidth: "stroke-width",
        strokeLinecap: "stroke-linecap",
        strokeLinejoin: "stroke-linejoin",
        fillRule: "fill-rule",
        clipRule: "clip-rule",
      }[k] || k;
    if (
      nk === "key" ||
      nk === "stroke-width" ||
      nk === "stroke-linecap" ||
      nk === "stroke-linejoin"
    )
      continue;
    if (nk === "stroke" && (v === "currentColor" || v === "currentcolor"))
      continue;
    out[nk] =
      nk === "fill" && (v === "currentColor" || v === "currentcolor")
        ? "INK"
        : v;
  }
  return out;
}

/**
 * Nama di pustaka dari kunci item: kunci pustaka dibuang prefiksnya, kunci bawaan memakai alias.
 * @param {string} k
 * @param {"main" | "mod"} kind
 * @param {Record<string, string>} mainAlias
 * @param {Record<string, string>} modAlias
 */
export function libNameOf(k, kind, mainAlias, modAlias) {
  if (/^(lu|tb|hg|cu):/.test(k)) return k.slice(3);
  return (kind === "main" ? mainAlias : modAlias)[k] || k;
}

/**
 * Membuat pemuat pustaka ikon untuk satu app.
 * @param {{
 *   getLucide: () => any,
 *   custom?: {icons?: Record<string, {nodes: IconNode[], roles?: string[]}>} | null,
 *   fetch?: typeof fetch,
 *   importModule?: (url: string) => Promise<Record<string, unknown>>,
 * }} options
 */
export function createIconSources(options) {
  const fetchFn = options.fetch || ((url) => fetch(url));
  const importModule =
    options.importModule || ((url) => import(/* @vite-ignore */ url));

  /** @type {IconIndex | null} */
  let LU = null;
  function luIndex() {
    if (LU) return LU;
    const lucide = options.getLucide();
    if (!lucide || !lucide.icons) return null;
    LU = new Map();
    for (const [pn, node] of Object.entries(lucide.icons)) {
      if (!Array.isArray(node)) continue;
      const k = kebab(pn);
      if (!LU.has(k)) LU.set(k, node);
    }
    return LU;
  }

  /* Tabler Icons (MIT): node outline dimuat sekali, kategori Brand tidak disertakan. */
  /** @type {IconIndex | null} */
  let TB = null;
  let tbState = "idle";
  /** @type {((index: IconIndex | null) => void)[]} */
  const tbWaiters = [];
  /** @returns {Promise<IconIndex | null>} */
  function loadTabler() {
    if (TB) return Promise.resolve(TB);
    if (tbState === "loading") return new Promise((r) => tbWaiters.push(r));
    tbState = "loading";
    return fetchFn(SOURCE_URLS.tablerNodes)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        const allow = new Set(Object.values(TB_CATS).join(" ").split(" "));
        TB = new Map();
        for (const [k, node] of Object.entries(j))
          if (allow.has(k) && Array.isArray(node))
            TB.set(
              k,
              node.filter(([t, a]) => t && a && a.stroke !== "none"),
            );
        tbState = "ready";
      })
      .catch(() => {
        tbState = "error";
      })
      .then(() => {
        tbWaiters.splice(0).forEach((f) => f(TB));
        return TB;
      });
  }

  /* Hugeicons Free (MIT): paket core dimuat hanya saat dipakai. Node SVG 24 x 24. */
  /** @type {IconIndex | null} */
  let HG = null;
  /** @type {Record<string, string>} */
  let HG_CATS = {};
  let hgState = "idle";
  /** @type {((index: IconIndex | null) => void)[]} */
  const hgWaiters = [];
  /** @returns {Promise<IconIndex | null>} */
  function loadHugeicons() {
    if (HG) return Promise.resolve(HG);
    if (hgState === "loading") return new Promise((r) => hgWaiters.push(r));
    hgState = "loading";
    return importModule(SOURCE_URLS.hugeicons)
      .then((mod) => {
        const index = new Map();
        for (const [exportName, node] of Object.entries(mod)) {
          if (!exportName.endsWith("Icon") || !Array.isArray(node)) continue;
          const name = kebab(exportName.slice(0, -4));
          const clean = node
            .filter(
              (x) =>
                Array.isArray(x) && x.length >= 2 && typeof x[0] === "string",
            )
            .map(([t, a]) => [t, hgAttrs(a)]);
          if (clean.length && !index.has(name)) index.set(name, clean);
        }
        HG = index;
        HG_CATS = { library: [...index.keys()].join(" ") };
        hgState = "ready";
      })
      .catch(() => {
        hgState = "error";
      })
      .then(() => {
        hgWaiters.splice(0).forEach((f) => f(HG));
        return HG;
      });
  }

  /* Library Kustom (cu:): ikon niche hasil gambar ulang dari referensi. Node 24 x 24. */
  const customIcons = (options.custom && options.custom.icons) || null;
  /** @type {IconIndex | null} */
  const CU = customIcons
    ? new Map(Object.entries(customIcons).map(([k, v]) => [k, v.nodes]))
    : null;
  const CU_CATS = CU ? { library: [...CU.keys()].join(" ") } : {};

  /**
   * Peran bawaan per bagian ikon kustom, atau null kalau tidak lengkap.
   * @param {string} key
   * @param {number} n jumlah bagian hasil analisis
   * @param {readonly string[]} allowed daftar peran yang sah
   */
  function customRoles(key, n, allowed) {
    if (!customIcons || !/^cu:/.test(key)) return null;
    const v = customIcons[key.slice(3)];
    if (!v || !v.roles || !v.nodes || v.nodes.length !== n) return null;
    return v.nodes.map((_, i) =>
      allowed.includes(v.roles[i]) ? v.roles[i] : "ink",
    );
  }

  /** Bentuk sama dengan objek `SOURCES` di app lama. */
  const SOURCES = {
    lu: {
      label: "Lucide",
      lic: "Lucide berlisensi ISC.",
      index: luIndex,
      cats: () => LU_CATS,
      catName: (/** @type {string} */ k) => CAT_ID[k] || k,
      dflt: "communication",
    },
    tb: {
      label: "Tabler",
      lic: "Tabler Icons berlisensi MIT. Ikon merek tidak disertakan.",
      index: () => TB,
      cats: () => TB_CATS,
      catName: (/** @type {string} */ k) => TB_CAT_ID[k] || k,
      dflt: "communication",
    },
    /* urutan kunci mengikuti app lama: cu (kalau ada) sebelum hg */
    ...(CU
      ? {
          cu: {
            label: "Kustom",
            lic: "Library Kustom milik sendiri.",
            index: () => CU,
            cats: () => CU_CATS,
            catName: (/** @type {string} */ k) =>
              k === "library" ? "Semua Kustom" : k,
            dflt: "library",
          },
        }
      : {}),
    hg: {
      label: "Hugeicons",
      lic: "Hugeicons Free berlisensi MIT. Paket Pro tidak digunakan.",
      index: () => HG,
      cats: () => HG_CATS,
      catName: (/** @type {string} */ k) =>
        k === "library" ? "Semua Hugeicons" : k,
      dflt: "library",
    },
  };

  return {
    SOURCES,
    LIB_RE: CU ? /^(lu|tb|hg|cu):/ : /^(lu|tb|hg):/,
    loadTabler,
    loadHugeicons,
    customRoles,
    get tbState() {
      return tbState;
    },
    get hgState() {
      return hgState;
    },
  };
}
