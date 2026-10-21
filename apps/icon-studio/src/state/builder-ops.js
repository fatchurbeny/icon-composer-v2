// @ts-check
/**
 * Logika Builder (Template Icon Builder 1.6.0) tanpa DOM: kosakata, validasi manifest, flag, daftar ekspor,
 * metadata, dan isi ZIP. UI ada di personas/builder.js. Keluaran ZIP harus identik dengan TIB 1.6.0 (golden).
 */
import { dedupeAttrs } from "@icon-studio/core";
import { CLASSIC_ENGINE_VERSION } from "@icon-studio/engines/classic";
import { createTagIndex, directFillSvgFile, metadataCsv, styleWord, titleCase, trID } from "@icon-studio/export";
import { MAIN_ALIAS, MOD_ALIAS, libNameOf, variantsOf } from "@icon-studio/icon-sources";
import { TB_CATS } from "@icon-studio/icon-sources/catalog";
import { resourceHTML } from "./data/export/resource-page.js";
import { MODES, kebab2 } from "./document.js";

export const TIB_VERSION = "1.6.0";
export const OUTPUT_VERSION = "1.5.0";
export const BRAND_KEY = "tib-canva-brand-id";

/* gaya terkunci: satu keluarga, dua varian */
export const MODE_INFO = {
  X:{label:"Aksen bagian · penanda di depan", short:"Aksen", dir:"aksen", en:["two tone icon", "accent icon", "line icon", "rounded icon"], id:["ikon dua warna", "ikon aksen", "ikon garis"]},
  A:{label:"Utama garis · pengubah solid", short:"Garis·solid", dir:"garis-solid", en:["two tone icon", "outline icon", "accent icon"], id:["ikon dua warna", "ikon garis", "ikon aksen"]},
  B:{label:"Utama solid · pengubah garis", short:"Solid·garis", dir:"solid-garis", en:["two tone icon", "solid icon", "filled icon"], id:["ikon dua warna", "ikon solid", "ikon isi"]},
  C:{label:"Keduanya garis", short:"Garis·garis", dir:"garis-garis", en:["outline icon", "line icon", "monoline icon"], id:["ikon garis", "ikon outline"]}
};
export const MOD_POOL = ["plus","minus","check","x","star","search","clock","timer","bell","lock","shield","heart","pencil","settings","cloud","share-2","download","upload","refresh-cw","triangle-alert","info","zap","eye","flag","bookmark","link","user","message-circle","gift","trophy","target","rocket","hourglass","thumbs-up","send","tag","map-pin","sun","leaf","music","coffee"];

export const LICENSES = `Ikon dalam pack ini dirakit dengan Template Icon Builder.\nSebagian bentuk dasar berasal dari:\n- Lucide (https://lucide.dev) — ISC License, © Lucide Contributors\n- Tabler Icons (https://tabler.io/icons) — MIT License, © Paweł Kuna\n- Hugeicons Free (https://hugeicons.com) — MIT License, © Hugeicons\nPaket Hugeicons Pro tidak digunakan.\n- Library Kustom (cu:) — digambar ulang sendiri, bukan dari pustaka pihak ketiga\nKonversi stroke ke shape menggunakan:\n- unstroke — MIT License, © Paweł Kuna\n- clipper-lib — Boost Software License\nSetiap ikon adalah gabungan objek + pengubah, digambar ulang dengan gaya Icon Composer:\n- aksen/: garis 3,5 ujung bulat, celah knockout 1,25, wadah tinta + bagian aksen, penanda di depan\n- garis-solid/ dan solid-garis/: garis 2, celah knockout 2, dua warna\n`;

/* kolom metadata: header tanpa kutip, sama dengan legacy 1.6.0 */
export const CANVA_COLUMNS = ["filename","title","keywords","Artist","locale","description"];
export const INTERNAL_COLUMNS = ["file","id","style","title_en","title_id","keywords_en","keywords_id","search","pack","slides","role","main","modifier"];
const ROLE_DIR = {slot:"slot-deck", extra:"ekstra"};

/** Pilihan ekspor bawaan (kontrol langkah Ekspor TIB). */
export function defaultExportOptions(doc) {
  const m = doc.manifest || {};
  return {modes: {...doc.exportModes}, slot: true, extra: true, split: true, skipBad: true, kw: 15, name: m.deck && m.deck.title ? m.deck.title + " Icons" : "Icon Pack", locale: "en", creator: "hashtagben", description: "", sheetCols: "auto"};
}

/** @param {any} man */
export function packOf(man){ const p = man && man.pack; if (!p) return {en:"", id:""}; if (typeof p === "string") return {en:p, id:p}; return {en:String(p.en || p.id || ""), id:String(p.id || p.en || "")}; }

/** @param {any} it @param {any} man @param {string} brand */
export function searchOf(it, man, brand){ const b = brand, pk = packOf(man).en.toLowerCase().trim(); return [b ? "brand:" + b : "", it.id.replace(/-/g, " "), pk].filter(Boolean).join(" "); }

/** satu halaman Resource Page: kolom bertambah mengikuti jumlah ikon @param {number} n @param {string} sheetCols */
export function sheetGrid(n, sheetCols = "auto"){ if (sheetCols !== "auto") return +sheetCols; return n <= 12 ? 4 : n <= 24 ? 6 : n <= 40 ? 8 : n <= 60 ? 10 : n <= 96 ? 12 : 14; }

/** @param {string} a @param {string} b */
function lev(a, b){ const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({length:n+1}, (_, j) => j); for (let i = 1; i <= m; i++){ const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j-1] + 1, p[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); p = c; } return p[n]; }

/**
 * Kosakata pustaka untuk validasi: ada/tidaknya kunci, saran ejaan, dan tabrakan nama dengan ikon pustaka.
 * @param {any} renderer createRenderer
 */
export function createVocabulary(renderer) {
  const { SOURCES, LIB_RE, data } = renderer;
  const { MAINS, MODS } = data;
  const TB_NAMES = new Set(Object.values(TB_CATS).join(" ").split(" "));
  const names = (/** @type {string} */ src) => { const i = SOURCES[src] && SOURCES[src].index(); return i ? new Set(i.keys()) : new Set(); };
  const luNames = () => names("lu"), hgNames = () => names("hg"), cuNames = () => names("cu");
  /** @param {string} k @param {string} kind */
  function exists(k, kind){
    if (k === "none") return kind === "mod";
    if (/^lu:/.test(k)) return luNames().has(k.slice(3));
    if (/^tb:/.test(k)) return TB_NAMES.has(k.slice(3));
    if (/^hg:/.test(k)) return hgNames().has(k.slice(3));
    if (/^cu:/.test(k)) return cuNames().has(k.slice(3));
    return kind === "main" ? !!MAINS[k] && !String(k).includes(":") : !!MODS[k];
  }
  /** @param {string} k @param {string} kind */
  function suggest(k, kind){
    const name = LIB_RE.test(k) ? k.slice(3) : k;
    const al = /** @type {any} */ (MAIN_ALIAS)[name] || /** @type {any} */ (MOD_ALIAS)[name];
    if (al && luNames().has(al)) return "lu:" + al;
    const pools = [["lu:", [...luNames()]], ["tb:", [...TB_NAMES]], ["hg:", [...hgNames()]], ["cu:", [...cuNames()]], ["", Object.keys(kind === "main" ? MAINS : MODS).filter(x => !x.includes(":"))]];
    /** @type {{k: string, s: number} | null} */
    let best = null;
    for (const [pre, list] of /** @type {[string, string[]][]} */ (pools)) for (const n of list){
      let s = lev(name, n); if (n.startsWith(name) || name.startsWith(n)) s -= 1.5; if (n.includes(name)) s -= 1;
      if (!best || s < best.s) best = {k: pre + n, s};
    }
    return best && best.s <= Math.max(3, name.length * 0.45) ? best.k : null;
  }
  /** @param {string} k @param {"main" | "mod"} kind */
  const libName = (k, kind) => libNameOf(k, kind, MAIN_ALIAS, MOD_ALIAS);
  /** @param {any} it */
  function collisions(it){
    if (it.mod === "none") return [];
    const L = luNames(), H = hgNames(), hits = [];
    for (const a of variantsOf(libName(it.main, "main"), "main")) for (const b of variantsOf(libName(it.mod, "mod"), "mod")){
      for (const nm of [`${a}-${b}`, `${b}-${a}`]){
        if (L.has(nm)) hits.push("Lucide " + nm);
        if (TB_NAMES.has(nm)) hits.push("Tabler " + nm);
        if (H.has(nm)) hits.push("Hugeicons " + nm);
      }
    }
    return [...new Set(hits)];
  }
  return { exists, suggest, collisions, libName, TB_NAMES, luNames, hgNames, cuNames };
}

/**
 * Validasi manifest (validateManifest TIB). Id dobel diberi akhiran -2, -3, dst. langsung di item.
 * @param {any} doc dokumen Builder
 * @param {ReturnType<typeof createVocabulary>} vocab
 * @returns {[string, string, any?][]}
 */
export function validateManifest(doc, vocab){
  const out = [];
  const man = doc.manifest;
  if (!man) return out;
  if (man.format !== "tib-manifest") out.push(["warn", "Kolom format bukan \"tib-manifest\". Tetap dibaca."]);
  if (!packOf(man).en) out.push(["warn", "Manifest tanpa \"pack\" (tema pack). Isi Tema pack di langkah Ekspor agar judul dan pencarian unik."]);
  /** @type {Record<string, boolean>} */
  const seen = {};
  doc.items.forEach((/** @type {any} */ it) => {
    if (it.idRaw && it.idRaw !== it.id) out.push(["warn", `id "${it.idRaw}" diubah menjadi "${it.id}" (huruf kecil, tanda hubung).`]);
    if (seen[it.id]){ let n = 2; while (seen[it.id + "-" + n]) n++; out.push(["warn", `id "${it.id}" dobel. Yang kedua menjadi "${it.id}-${n}".`]); it.id = it.id + "-" + n; }
    seen[it.id] = true;
    for (const kind of ["main", "mod"]){
      const k = it[kind];
      if (kind === "main" && !k){ out.push(["err", `${it.id}: objek utama kosong.`]); continue; }
      if (!vocab.exists(k, kind)){
        const s = vocab.suggest(k, kind);
        out.push(["err", `${it.id}: ${kind === "main" ? "objek utama" : "pengubah"} "${k}" tidak dikenal.${s ? ` Saran: ${s}` : ""}`, s ? {uid:it.uid, kind, to:s} : null]);
      }
    }
  });
  return out;
}

/** @param {any[]} items */
export function dupMap(items){ /** @type {Record<string, number>} */ const m = {}; items.filter(i => i.on).forEach(i => { const k = i.main + "|" + i.mod; m[k] = (m[k] || 0) + 1; }); return m; }

/**
 * Flag satu ikon (flagsOf TIB).
 * @param {any} it
 * @param {Record<string, number> | null} dm
 * @param {{vocab: ReturnType<typeof createVocabulary>, renderer: any, style: any}} deps
 * @returns {[string, string][]}
 */
export function flagsOf(it, dm, deps){
  const { vocab, renderer } = deps, LIB_RE = renderer.LIB_RE, MAINS = renderer.data.MAINS;
  /** @type {[string, string][]} */
  const f = [];
  if (!vocab.exists(it.main, "main")) f.push(["err", "Objek utama tidak dikenal"]);
  if (it.mod !== "none" && !vocab.exists(it.mod, "mod")) f.push(["err", "Pengubah tidak dikenal"]);
  if (it.mod === "none") { const pub = LIB_RE.test(it.main) && !/^cu:/.test(it.main); f.push([pub ? "err" : "warn", pub ? "Tanpa pengubah: sama dengan ikon pustaka" : "Tanpa pengubah"]); }
  const c = vocab.collisions(it); if (c.length) f.push(["err", "Mirip " + c[0]]);
  const key = it.main + "|" + it.mod;
  if (dm && dm[key] > 1) f.push(["err", "Rakitan dobel di pack"]);
  if (it.main === it.mod || vocab.libName(it.main, "main") === vocab.libName(it.mod, "mod")) f.push(["warn", "Objek dan pengubah sama"]);
  const M = MAINS[it.main]; if (M && M.missing) f.push(["warn", "Belum termuat"]);
  if (M && M.plate) f.push(["warn", "Tanpa body: mode Solid·garis memakai pelat bulat, isi bidang Aksen tidak tersedia"]);
  const solidCheck = renderer.solidLineDiagnostic(it, deps.style);
  if (solidCheck && solidCheck.message) f.push(["warn", solidCheck.message]);
  return f;
}

/** @param {any} it @param {Record<string, number>} dm @param {any} deps */
export const isBad = (it, dm, deps) => flagsOf(it, dm, deps).some(f => f[0] === "err");

/**
 * Ikon yang ikut ekspor: aktif, perannya dicentang, dan bukan yang bermasalah (bila dilewati). Slot dulu, lalu ekstra.
 * @param {any} doc
 * @param {any} opts defaultExportOptions
 * @param {any} deps
 */
export function exportList(doc, opts, deps){
  const dm = dupMap(doc.items);
  const roleOk = (/** @type {any} */ i) => i.role === "extra" ? opts.extra : opts.slot;
  const L = doc.items.filter((/** @type {any} */ i) => i.on && roleOk(i) && !(opts.skipBad && isBad(i, dm, deps)));
  return [...L.filter((/** @type {any} */ i) => i.role !== "extra"), ...L.filter((/** @type {any} */ i) => i.role === "extra")];
}

/** @param {any} it @param {string} s @param {boolean} split */
export function pathOf(it, s, split){ const d = /** @type {any} */ (MODE_INFO)[s].dir; return `${d}/${split ? /** @type {any} */ (ROLE_DIR)[it.role === "extra" ? "extra" : "slot"] + "/" : ""}${it.id}-${d}.svg`; }

/** @param {string} kind */
const styleWordOf = (kind) => kind === "X" ? styleWord("accent") : styleWord("classic", kind);

/**
 * Metadata satu ikon untuk satu gaya (meta TIB).
 * @param {any} it
 * @param {string} kind
 * @param {number} N jumlah kata kunci
 * @param {{man: any, brand: string, tagsOf: (k: string, kind: "main" | "mod") => string[]}} o
 */
export function metaOf(it, kind, N, o){
  const MI = /** @type {any} */ (MODE_INFO)[kind];
  const styleEN = MI.en, styleID = MI.id;
  const mainT = o.tagsOf(it.main, "main"), modT = it.mod !== "none" ? o.tagsOf(it.mod, "mod") : [];
  const lc = (/** @type {any[]} */ a) => a.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const pk = packOf(o.man);
  const en = [...new Set([...lc(it.keywords.en), it.name.en.toLowerCase(), ...lc([pk.en]), ...mainT.slice(0, 6), ...modT.slice(0, 4), ...styleEN, "icon"])].slice(0, N);
  const idw = [...new Set([...lc(it.keywords.id), it.name.id.toLowerCase(), ...lc([pk.id]), ...[...mainT.slice(0, 6), ...modT.slice(0, 4)].map(trID).filter(Boolean), ...styleID, "ikon"])].slice(0, N);
  const nid = it.name.id.charAt(0).toLowerCase() + it.name.id.slice(1);
  return {
    title_en: [titleCase(it.name.en), titleCase(pk.en), styleWordOf(kind).en, "Icon"].filter(Boolean).join(" "),
    title_id: ["Ikon", nid, pk.id.toLowerCase(), styleWordOf(kind).id].filter(Boolean).join(" "),
    keywords_en: en.join(", "), keywords_id: idw.join(", "), search: searchOf(it, o.man, o.brand)
  };
}

/**
 * Manifest akhir di ZIP (finalManifest TIB).
 * @param {any} doc
 * @param {any[]} list
 * @param {string} exportedAt
 */
export function finalManifest(doc, list, exportedAt){
  const man = doc.manifest, pv = doc.pv, style = doc.style;
  return {...(man || {}), format:"tib-manifest", /* TIB menulis version:1 lalu version:2; nilai dan urutan kunci hasilnya sama */ version:2, generator:{name:"Template Icon Builder", version:OUTPUT_VERSION, exported_at:exportedAt},
    style:{...((man && man.style) || {}), family: pv === "X" ? "accent" : "classic", mode: pv === "X" ? ((man && man.style && man.style.mode) || "A") : pv, ink:style.ink, accent:style.accent},
    icons: list.map(it => ({id:it.id, name:it.name, main:it.main, mod:it.mod, anchor:it.slot, offset:{main:[it.mx, it.my], mod:[it.nx, it.ny]},
      accent:{fill:it.under, marker:it.mstyle, spark:(it.deco || {}).type || "none", ...((it.deco || {}).type && it.deco.type !== "none" ? {spark_pos:[it.deco.x, it.deco.y]} : {}), parts:it.parts || "auto"},
      slides:it.slides, role:it.role, keywords:it.keywords}))};
}

/** Indeks tag dibagi seluruh app (dimuat sekali). */
const TAGS = createTagIndex();

/**
 * Susun isi ZIP Builder (doExport TIB). Mengembalikan `error` bila ekspor harus dibatalkan.
 * @param {any} doc dokumen Builder
 * @param {any} opts defaultExportOptions
 * @param {{renderer: any, vocab: ReturnType<typeof createVocabulary>, brand: string, now?: () => string}} deps
 */
export async function buildExportFiles(doc, opts, deps){
  const flagDeps = { vocab: deps.vocab, renderer: deps.renderer, style: doc.style };
  const list = exportList(doc, opts, flagDeps);
  const styles = MODES.filter(m => opts.modes[m]);
  if (!list.length || !styles.length) return { error: "Tidak ada ikon atau gaya yang dipilih untuk diekspor.", list, styles };
  await TAGS.loadTags();
  const tagsOf = (/** @type {string} */ k, /** @type {"main" | "mod"} */ kind) => TAGS.tagsOf(deps.vocab.libName(k, kind));
  const N = +opts.kw, files = /** @type {Record<string, string>} */ ({}), base = kebab2(opts.name) || "icon-pack";
  const locale = opts.locale === "id" ? "id" : "en";
  const artist = opts.creator === "chital" ? "chital" : "hashtagben", description = String(opts.description || "").trim();
  const canvaRows = [];
  const filenames = new Set();
  for (const it of list) for (const s of styles){
    const filename = `${it.id}-${/** @type {any} */ (MODE_INFO)[s].dir}.svg`;
    if (filenames.has(filename)) return { error: `Ekspor dibatalkan: nama file duplikat ${filename}. Ubah ID ikon sebelum mengekspor.`, list, styles };
    filenames.add(filename);
  }
  const rows = [];
  const render = (/** @type {any} */ it, /** @type {string} */ kind, /** @type {any} */ opt) => deps.renderer.renderManifestItem(it, kind, doc.style, opt);
  try {
    list.forEach((it, i) => styles.forEach(s => {
      const f = pathOf(it, s, opts.split);
      const sourceSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + dedupeAttrs(render(it, s, {size:480, idp:"k" + s + i}));
      files[f] = directFillSvgFile(sourceSvg);
      const m = metaOf(it, s, N, {man: doc.manifest, brand: deps.brand, tagsOf});
      canvaRows.push({filename:`${it.id}-${/** @type {any} */ (MODE_INFO)[s].dir}.svg`, title:/** @type {any} */ (m)["title_" + locale], keywords:/** @type {any} */ (m)["keywords_" + locale], Artist:artist, locale, description});
      rows.push({file:f, id:it.id, style:/** @type {any} */ (MODE_INFO)[s].dir, title_en:m.title_en, title_id:m.title_id, keywords_en:m.keywords_en, keywords_id:m.keywords_id, search:m.search, pack:packOf(doc.manifest).en, slides:it.slides.join(" "), role:it.role, main:it.main, modifier:it.mod});
    }));
  } catch (error){
    return { error: `Ekspor outline dibatalkan: ${/** @type {Error} */ (error).message}`, list, styles };
  }
  files["metadata.csv"] = metadataCsv(canvaRows, CANVA_COLUMNS, {quoteHeader:false});
  files["submission-profile.json"] = JSON.stringify({format:"icon-composer-submission-profile", version:1, creator_profile_id:artist, artist, stroke_output:"direct-fill", output_version:OUTPUT_VERSION, classic_engine:CLASSIC_ENGINE_VERSION, svg_structure:"one-path-per-color", fill_rule:"nonzero", updates:["Overlap satu warna tidak menjadi lubang", "Stroke otomatis menjadi fill", "Mask diratakan", "Transform dan group dihapus", "Satu path per warna"]}, null, 2);
  files["metadata-internal.csv"] = metadataCsv(rows, INTERNAL_COLUMNS, {quoteHeader:false});
  files["resource-page.html"] = resourceHTML(list, {man: doc.manifest, cols: sheetGrid(list.length, opts.sheetCols), render: (it, idp) => render(it, doc.pv, {idp}), searchOf: (it) => searchOf(it, doc.manifest, deps.brand)});
  files["manifest-final.json"] = JSON.stringify(finalManifest(doc, list, deps.now ? deps.now() : new Date().toISOString()), null, 2);
  files["LICENSES.txt"] = LICENSES;
  return { files, base, list, styles };
}
