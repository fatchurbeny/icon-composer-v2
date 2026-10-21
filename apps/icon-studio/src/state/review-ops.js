// @ts-check
/**
 * Logika persona Tinjau untuk set Composer (Tinjau pack Icon Composer 1.5.1): nama file, pemeriksaan,
 * metadata Canva, sprite, dan isi ZIP. Sejak Fase 5 (ADR-011) SVG di akar ZIP adalah direct fill untuk
 * Canva (semua stroke jadi outline); SVG asli IC 1.5.1 ikut di folder opsional `svg-asli/`. Isi lain
 * tetap identik dengan IC 1.5.1 (golden), kecuali header metadata.csv yang dikutip (ADR-016).
 */
import { get } from "@icon-studio/engines";
import { modeOfClassic } from "@icon-studio/engines/classic";
import { STICKER_HALO } from "@icon-studio/engines/sticker";
import { createTagIndex, directFillSvgFile, metadataCsv, packColors, styleWord, titleCase, trID } from "@icon-studio/export";
import { MAIN_ALIAS, MOD_ALIAS, libNameOf } from "@icon-studio/icon-sources";
import { SET_LICENSES, previewSheetHTML } from "./data/export/preview-sheet.js";
import { duplicateGroups, nameOf } from "./set-ops.js";

/** Metadata Canva bawaan (rMeta IC). */
export const DEFAULT_CANVA_META = { on: true, artist: "hashtagben", locale: "en", packEn: "", packId: "", kw: 15, desc: "", nm: "auto" };

/** Pilihan ZIP bawaan (rJson, rHtml, rKo, rFmt IC). `asli`: sertakan SVG asli di folder `svg-asli/` (ADR-011). */
export const DEFAULT_REVIEW = { json: true, html: true, ko: "mask", fmt: "zip", bg: "white", size: 128, names: true, flags: true, compare: "source", asli: false, off: {} };

/** Folder SVG asli (stroke, untuk Illustrator/Figma) di ZIP Composer. */
export const ORIGINAL_DIR = "svg-asli/";

/** @param {any} doc */
export function ensureReviewFields(doc) {
  doc.meta = doc.meta || {};
  doc.meta.canva = { ...DEFAULT_CANVA_META, ...(doc.meta.canva || {}) };
  const prev = doc.review || {};
  /* off disalin baru supaya objek bawaan tidak terbagi antardokumen */
  doc.review = { ...DEFAULT_REVIEW, ...prev, off: { ...(prev.off || {}) } };
  return doc;
}

/** @param {unknown} s */
export function slug(s){ return String(s || "ikon").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "ikon"; }

/**
 * Nama file per ikon, unik dalam satu daftar (fileNames IC).
 * @param {any[]} list
 * @param {any} lib registry {MAINS, MODS}
 * @param {string} [family] keluarga gaya set (offset: nama tanpa pengubah)
 */
export function fileNames(list, lib, family){ /** @type {Record<string, number>} */ const seen = {}; return list.map(it => { let s = slug(nameOf(it, lib, family)); seen[s] = (seen[s] || 0) + 1; if (seen[s] > 1) s += "-" + seen[s]; return {it, file:s + ".svg"}; }); }

/** @param {any} doc */
export const includedOf = (doc) => doc.items.filter((/** @type {any} */ it) => !doc.review.off[it.id]);

/**
 * SVG ekspor satu ikon (exportSVG IC): celah knockout lewat mask atau latar putih.
 * @param {any} renderer
 * @param {any} doc
 * @param {any} it
 * @param {number | null} i
 */
export function exportSVG(renderer, doc, it, i){ return renderer.renderSetItem(it, doc.style, {mode:doc.review.ko, idp:"ko" + (i == null ? "" : i)}, doc.customs).replace(/ width="48" height="48"/, ' width="48" height="48"'); }

/** @param {any} renderer @param {any} doc @param {any[]} list */
export function spriteSVG(renderer, doc, list){
  const files = fileNames(list, renderer.lib, doc.style.family);
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n` + files.map(({it, file}, i) => { const s = exportSVG(renderer, doc, it, i); return `<symbol id="${file.replace(/\.svg$/, "")}" viewBox="0 0 48 48">${s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</symbol>`; }).join("\n") + `\n</svg>`;
}

/* ---------- metadata Canva (metaOf IC, diambil dari Builder 1.6.0) ---------- */

/** @param {string} k @param {"main" | "mod"} kind */
const libName = (k, kind) => libNameOf(k, kind, MAIN_ALIAS, MOD_ALIAS);
const libWords = (/** @type {string} */ k, /** @type {"main" | "mod"} */ kind) => libName(k, kind).replace(/-\d+$/, "").replace(/-/g, " ");
/** @param {any} it @param {boolean} [noMod] gaya tanpa pengubah */
function baseNameEN(it, noMod){ return [libWords(it.main, "main"), it.mod !== "none" && !noMod ? libWords(it.mod, "mod") : ""].filter(Boolean).join(" "); }

/** @param {any} doc @param {any} it @param {any} PREFS */
function styleMeta(doc, it, PREFS){
  if (doc.style.family === "accent") return {...styleWord("accent"), ken:["accent icon", "line icon", "two tone icon"], kid:["ikon aksen", "ikon garis", "ikon dua warna"]};
  if (doc.style.family === "offset") return {...styleWord("offset"), ken:["offset style", "line icon", "two tone icon"], kid:["gaya offset", "ikon garis", "ikon dua warna"]};
  if (doc.style.family === "hand-writing") return {...styleWord("hand-writing"), ken:["hand-writing style", "hand drawn icon", "doodle icon"], kid:["gaya hand-writing", "ikon gambar tangan", "ikon doodle"]};
  if (doc.style.family === "sticker") return {...styleWord("sticker"), ken:["sticker style", "sticker", "colorful icon"], kid:["gaya sticker", "stiker", "ikon berwarna"]};
  const m = modeOfClassic(it, /** @type {any} */ ({ style: doc.style, PREFS }));
  if (m === "B") return {...styleWord("classic", "B"), ken:["solid icon", "two tone icon"], kid:["ikon solid", "ikon dua warna"]};
  if (m === "C") return {...styleWord("classic", "C"), ken:["outline icon", "line icon"], kid:["ikon garis", "ikon outline"]};
  return {...styleWord("classic", "A"), ken:["two tone icon", "outline icon"], kid:["ikon dua warna", "ikon garis"]};
}

const TAGS = createTagIndex();

/**
 * Judul dan kata kunci satu ikon. Judul: [nama ikon] [tema pack] [gaya] Icon.
 * @param {any} doc
 * @param {any} it
 * @param {any} renderer
 */
export function metaOf(doc, it, renderer){
  const rMeta = doc.meta.canva;
  const N = rMeta.kw, sm = styleMeta(doc, it, renderer.data.PREFS), nm = String(it.name || "").trim();
  const tagsOf = (/** @type {string} */ k, /** @type {"main" | "mod"} */ kind) => TAGS.tagsOf(libName(k, kind));
  const lc = (/** @type {any[]} */ a) => a.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const first = (/** @type {string} */ s) => String(s || "").split(",")[0].trim();
  const noMod = doc.style.family === "offset";
  const mainT = tagsOf(it.main, "main"), modT = it.mod !== "none" && !noMod ? tagsOf(it.mod, "mod") : [];
  if (rMeta.locale === "id"){
    const n = nm || nameOf(it, renderer.lib, doc.style.family);
    return {title:["Ikon", n.charAt(0).toLowerCase() + n.slice(1), first(rMeta.packId).toLowerCase(), sm.id].filter(Boolean).join(" "),
      keywords:[...new Set([n.toLowerCase(), ...lc(rMeta.packId.split(",")), ...[...mainT.slice(0, 6), ...modT.slice(0, 4)].map(trID).filter(Boolean), ...sm.kid, "ikon"])].slice(0, N).join(", ")};
  }
  const n = (rMeta.nm === "name" && nm) ? nm : baseNameEN(it, noMod);
  return {title:[titleCase(n), titleCase(first(rMeta.packEn)), sm.en, "Icon"].filter(Boolean).join(" "),
    keywords:[...new Set([n.toLowerCase(), ...lc(rMeta.packEn.split(",")), ...mainT.slice(0, 6), ...modT.slice(0, 4), ...sm.ken, "icon"])].slice(0, N).join(", ")};
}

/* format yang dibaca Chrome extension (mode CSV): dicocokkan per nama file SVG */
export const META_COLUMNS = ["filename","title","keywords","Artist","locale","description"];

/** @param {any} doc @param {any[]} list @param {any} renderer @param {Set<string>} [skip] file yang tidak ikut ZIP Canva */
export function metadataCSV(doc, list, renderer, skip){
  const rMeta = doc.meta.canva;
  const rows = fileNames(list, renderer.lib, doc.style.family).filter(({file}) => !skip || !skip.has(file)).map(({it, file}) => { const m = metaOf(doc, it, renderer); return {filename:file, title:m.title, keywords:m.keywords, Artist:rMeta.artist, locale:rMeta.locale, description:rMeta.desc.trim()}; });
  return metadataCsv(rows, META_COLUMNS);
}

/** Muat tag pustaka untuk kata kunci metadata. */
export const loadTags = () => TAGS.loadTags();

/**
 * SVG Canva satu ikon: render mask (knockout tanpa latar) lalu direct fill, satu path fill per warna.
 * Pilihan Celah knockout hanya berlaku untuk SVG asli dan sprite.
 * @param {any} renderer
 * @param {any} doc
 * @param {any} it
 * @param {number} i
 * @param {(svg: string) => string} directFill
 */
export function canvaSVG(renderer, doc, it, i, directFill = directFillSvgFile){
  const source = renderer.renderSetItem(it, doc.style, {mode:"mask", idp:"ko" + i}, doc.customs);
  return directFill(`<?xml version="1.0" encoding="UTF-8"?>\n${source}`);
}

/**
 * Isi ZIP Composer (buildZip IC) beserta ikon yang gagal direct fill. SVG di akar = direct fill Canva;
 * `svg-asli/` = SVG asli IC bila `review.asli`. Ikon yang gagal direct fill (mis. objek bawaan "ticket" yang
 * memakai garis putus-putus) tidak masuk akar ZIP dan metadata.csv, karena Canva hanya menerima bidang fill;
 * SVG aslinya tetap ikut `svg-asli/`.
 * @param {any} doc
 * @param {any[]} list
 * @param {any} renderer
 * @param {{directFill?: (svg: string) => string}} [opts] direct fill tiruan untuk tes tanpa browser
 * @returns {Promise<{files: Record<string, string>, failed: {file: string, error: string}[]}>}
 */
export async function buildSetZip(doc, list, renderer, opts = {}){
  const directFill = opts.directFill || directFillSvgFile;
  /** @type {Record<string, string>} */
  const files = {};
  /** @type {{file: string, error: string}[]} */
  const failed = [];
  const names = fileNames(list, renderer.lib, doc.style.family);
  names.forEach(({it, file}, i) => {
    try { files[file] = canvaSVG(renderer, doc, it, i, directFill); }
    catch (e) { failed.push({file, error:(/** @type {Error} */ (e)).message}); }
  });
  if (doc.review.asli) names.forEach(({it, file}, i) => { files[ORIGINAL_DIR + file] = exportSVG(renderer, doc, it, i); });
  files["LICENSES.txt"] = SET_LICENSES;
  if (doc.review.json) files["gaya.json"] = JSON.stringify({grid:48, ...doc.style, export:doc.review.ko, icons:list.map((it) => { const r = {...it}; delete r.id; return r; })}, null, 2);
  if (doc.review.html) files["pratinjau.html"] = previewSheetHTML(fileNames(list, renderer.lib, doc.style.family).map(({it, file}, i) => ({label: nameOf(it, renderer.lib, doc.style.family), file, svg: exportSVG(renderer, doc, it, i)})));
  if (doc.meta.canva.on){
    await loadTags();
    const bad = new Set(failed.map(f => f.file));
    files["metadata.csv"] = metadataCSV(doc, list, renderer, bad);
  }
  return {files, failed};
}

/**
 * Isi ZIP Composer saja (lihat `buildSetZip`).
 * @param {any} doc
 * @param {any[]} list
 * @param {any} renderer
 * @param {{directFill?: (svg: string) => string}} [opts]
 */
export async function buildSetZipFiles(doc, list, renderer, opts = {}){
  return (await buildSetZip(doc, list, renderer, opts)).files;
}

/**
 * Pemeriksaan sebelum unduh (rChecks IC + nama file unik + rakitan dobel).
 * @param {any} doc
 * @param {any[]} inc ikon yang ikut diunduh
 * @param {any} renderer
 * @returns {{ok: boolean, text: string, meta?: string}[]}
 */
export function reviewChecks(doc, inc, renderer){
  const style = doc.style, PREFS = renderer.data.PREFS;
  const out = [];
  const pc = packColors(inc, (it) => renderer.renderSetItem(it, style, { idp: "cc" }, doc.customs));
  const offset = style.family === "offset", hw = style.family === "hand-writing", sticker = style.family === "sticker";
  /* sticker: warna isi per ikon, jadi batas Canva dicek per file; jumlah isi di pack hanya saran (legacy: > 6 terasa ramai) */
  if (sticker) {
    const ink = String((style.engine && style.engine.sticker && style.engine.sticker.ink) || "").toUpperCase();
    const fills = [...pc].filter(c => c !== STICKER_HALO && c !== ink).length;
    out.push({ ok: fills <= 6, text: "Warna isi di seluruh pack (lebih dari 6 terasa ramai)", meta: `${fills} warna isi` });
  } else out.push({ ok: pc.size <= 5, text: "Maksimal 5 warna di seluruh pack", meta: `${pc.size} warna` });
  if (offset || hw || sticker) {
    const bad = inc.filter(it => renderer.flagsOf(it, style).some((/** @type {any} */ f) => f[0] === "err")).length;
    out.push({ ok: bad === 0, text: `Objek didukung gaya ${get(style.family).label} (bukan objek bawaan)`, meta: `${inc.length - bad}/${inc.length}` });
  }
  if (hw) {
    const bad = inc.filter(it => renderer.flagsOf(it, style).some((/** @type {any} */ f) => f[1].startsWith("Pengubah bawaan"))).length;
    out.push({ ok: bad === 0, text: "Pengubah dari pustaka (pengubah bawaan tidak dirender)", meta: `${inc.length - bad}/${inc.length}` });
  }
  if (sticker) {
    const most = Math.max(0, ...inc.map(it => packColors([it], (x) => renderer.renderSetItem(x, style, { idp: "cs" }, doc.customs)).size));
    out.push({ ok: most <= 4, text: "Maksimal 4 warna per ikon sticker", meta: `${most} warna` });
  }
  if (!offset) {
    const noMod = inc.filter(it => it.mod === "none").length;
    out.push({ ok: noMod === 0, text: "Setiap ikon punya pengubah", meta: `${inc.length - noMod}/${inc.length}` });
  }
  if (style.family === "classic") {
    const dual = inc.filter(it => modeOfClassic(it, /** @type {any} */ ({ style, PREFS })) !== style.pref).length;
    out.push({ ok: dual === 0, text: "Semua ikon mengikuti mode warna set", meta: dual ? `${dual} beda` : "" });
  }
  const edge = inc.filter(it => { const b = renderer.boxesOf(it, style); return ["main","mod","deco"].some(k => /** @type {any} */ (b)[k].w && (/** @type {any} */ (b)[k].x < 0.5 || /** @type {any} */ (b)[k].y < 0.5 || /** @type {any} */ (b)[k].x + /** @type {any} */ (b)[k].w > 47.5 || /** @type {any} */ (b)[k].y + /** @type {any} */ (b)[k].h > 47.5)); });
  out.push({ ok: edge.length === 0, text: "Elemen di dalam viewBox 0–48", meta: edge.length ? `${edge.length} ikon menyentuh tepi` : `${inc.length}/${inc.length}` });
  const renamed = fileNames(inc, renderer.lib, style.family).filter(({it, file}) => file !== slug(nameOf(it, renderer.lib, style.family)) + ".svg").length;
  out.push({ ok: renamed === 0, text: "Nama file unik", meta: renamed ? `${renamed} diberi akhiran` : `${inc.length}/${inc.length}` });
  const dup = duplicateGroups(inc, (it) => get(style.family).signature(it)).reduce((a, g) => a + g.length, 0);
  out.push({ ok: dup === 0, text: "Rakitan dobel dalam gaya ini", meta: String(dup) });
  return out;
}
