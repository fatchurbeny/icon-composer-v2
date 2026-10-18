/* eslint-disable -- Kode UI legacy dibekukan sampai Fase 2b. */
import { dedupeAttrs, partStr, r3 } from "@icon-studio/core";
import { get } from "@icon-studio/engines";
import { CLASSIC_ENGINE_VERSION, createClassicData, decoMarkupClassic, geomClassic, modeOfClassic, solidLineDiagnostic as solidLineDiagnosticClassic } from "@icon-studio/engines/classic";
import { rolesOf as rolesOfShared, ROLES, createLibraryShapes, setMeasureHost, svgParts, bbOf, measureNode, analyzeLibraryIcon, mainInfoOf, modShapeOf, autoRoles, isClosed, unionBB, inBB, touchBB, luPartSvg, intersectionRatio } from "@icon-studio/engines/shared";
import { modPreviewAccent as modPreviewAccentEngine } from "@icon-studio/engines/accent";
import { buildZip, createTagIndex, directFillSvgFile, metadataCsv, styleWord, titleCase, trID } from "@icon-studio/export";
import { MAIN_ALIAS, MOD_ALIAS, MOD_SYN, variantsOf, createIconSources, libNameOf } from "@icon-studio/icon-sources";
import { CAT_ID, ID_EN, LU_CATS, TB_CATS, TB_CAT_ID } from "@icon-studio/icon-sources/catalog";
import { CUSTOM_ICONS } from "@icon-studio/icon-sources/custom";
"use strict";
const $ = id => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

const esc = v => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* data bawaan classic (MAINS, PREFS, MODS, SLOT_GLYPH, SHIFT, DECOS): ada di packages/engines/classic/data.js */
const {MAINS, PREFS, MODS, SLOT_GLYPH, SHIFT, DECOS} = createClassicData();
const LINE_OPTS = [null, "#1A1A1A", "#3A3C44", "#1A73E8", "#E2552D", "#FFFFFF"];
const FILL_OPTS = [null, "#C3DC1E", "#5BA8FF", "#FFB547", "#F27BA8", "#E4E4DE"];
const LAYER_NAME = {main:"Objek utama", mod:"Pengubah", deco:"Dekorasi"};

/* ---------- pustaka ikon: logika ada di packages/icon-sources dan packages/engines/shared ---------- */
const CU_DATA = CUSTOM_ICONS;
const ICONS = createIconSources({getLucide: () => window.lucide, custom: CU_DATA});
const SOURCES = ICONS.SOURCES, LIB_RE = ICONS.LIB_RE;
const CU = SOURCES.cu.index();
const LIB = createLibraryShapes({MAINS, MODS, SOURCES, LIB_RE});
function luIndex(){ return SOURCES.lu.index(); }
function hgIndex(){ return SOURCES.hg.index(); }
function cuRoles(key, n){ return ICONS.customRoles(key, n, ROLES); }
function loadTabler(){ return ICONS.loadTabler(); }
function loadHugeicons(){ return ICONS.loadHugeicons(); }
function ensureLucide(key, kind){ return LIB.ensure(key, kind); }
let libSrc = "lu";

/* ---------- composition engine ---------- */
/* composition engine: logika ada di packages/engines/classic (varian TIB dengan solid) */
function classicCtx(){
  return {style, MAINS, MODS, PREFS, DECOS, customs, nextId: () => "k" + (++kid), decoStarFill: false, solidV145: true, infoOf: mainInfo};
}
function modeOf(it){ return modeOfClassic(it, classicCtx()); }
function geom(it){ return geomClassic(it, classicCtx()); }

/* ---------- dekorasi kilau (gaya aksen) ---------- */
Object.assign(DECOS, {
  star4:{n:"Kilau", star:true, d:"M0 -4C0.6 -1 1 -0.6 4 0C1 0.6 0.6 1 0 4C-0.6 1 -1 0.6 -4 0C-1 -0.6 -0.6 -1 0 -4Z", home:[9,9]},
  star4x2:{n:"Kilau ganda", star:true, d:"M-1 -2.5C-0.4 0.5 0 0.9 3 1.5C0 2.1 -0.4 2.5 -1 5.5C-1.6 2.5 -2 2.1 -5 1.5C-2 0.9 -1.6 0.5 -1 -2.5ZM4.5 -6C4.8 -4.5 5 -4.3 6.5 -4C5 -3.7 4.8 -3.5 4.5 -2C4.2 -3.5 4 -3.7 2.5 -4C4 -4.3 4.2 -4.5 4.5 -6Z", home:[9,10]}
});

/* ---------- gaya aksen bagian (Cara 3: isi bidang, Cara 4: penanda depan) ---------- */
const ROLE_NAME = {ink:"Tinta", acc:"Aksen", fillA:"Isi aksen", fill:"Isi tinta"};
const UNDER_NAME = {none:"Tanpa", full:"Penuh", offset:"Geser", half:"Separuh"};
const accCache = new Map();
/* bagian objek utama dalam satuan 48; k = 2 untuk Lucide/Tabler/Hugeicons (24 → 48) */
/* aturan otomatis: wadah tinta, isi di dalam wadah aksen (satu kelompok aksen) */
/* ---------- helper pengukuran & bentuk: logika ada di packages/engines/shared ---------- */
setMeasureHost(() => $("meas"));
function luAnalyze(key){ return LIB.analyze(key); }
function mainInfo(key){
  const M = MAINS[key], c = accCache.get("m|" + key);
  if (c && c.M === M) return c;
  const info = mainInfoOf(M, key, luAnalyze, k => LIB_RE.test(k));
  accCache.set("m|" + key, info);
  return info;
}
function modShape(key){
  const M = MODS[key], c = accCache.get("d|" + key);
  if (c && c.M === M) return c;
  const res = modShapeOf(M, key, luAnalyze);
  accCache.set("d|" + key, res);
  return res;
}
function rolesOf(it, info){ return rolesOfShared(it, info, cuRoles); }
/* bentuk pengubah sebagai penanda garis */
/* KO = warna silhouette: #000 di mask, #FFFFFF di mode latar putih */
/* ---------- accent engine: logika ada di packages/engines/accent ---------- */
const accentCtx = () => ({style, MODS, DECOS, nextId: () => "k" + (++kid), shapeOf: modShape, infoOf: mainInfo, rolesOf, decoMarkup});
function composeAccent(it, opt){ return get("accent").compose(it, style, {...(opt || {}), ctx: accentCtx()}); }
function modPreviewAccent(key, mstyle){ return modPreviewAccentEngine(key, mstyle, accentCtx()); }
/* gaya set per keluarga: setiap keluarga mengingat patokannya sendiri */
const FAMILY_DEFAULT = {
  classic:{sw:2, gap:2, cap:"butt", join:"miter", accent:"#C3DC1E", scale:{main:84, mod:100, deco:100}},
  accent:{sw:3.5, gap:1.25, cap:"round", join:"round", accent:"#F05A5A", scale:{main:88, mod:80, deco:100}}
};
function applyFamily(f){
  if (style.family === f && style.saved && style.saved[f]) return;
  style.saved = style.saved || {};
  const old = style.family || "classic";
  style.saved[old] = {sw:style.sw, gap:style.gap, cap:style.cap, join:style.join, accent:style.accent, scale:{...style.scale}};
  const p = style.saved[f] || FAMILY_DEFAULT[f];
  Object.assign(style, {family:f, sw:p.sw, gap:p.gap, cap:p.cap, join:p.join, accent:p.accent, scale:{...p.scale}});
}
const ACC_OPTS = ["#F05A5A", "#FF7A45", "#FFB547", "#C3DC1E", "#2EB67D", "#3A7BFF", "#8B5CF6", "#F27BA8"];
function partThumb(info, i, R){
  const ink = style.ink, acc = style.accent;
  const body = info.parts.map((p, j) => { const on = j === i, r = R[j], c = on ? ((r === "acc" || r === "fillA") ? acc : ink) : "#B4B6BD", f = on && (r === "fill" || r === "fillA") && p.closed ? c : "none";
    return `<g${p.k === 1 ? "" : ` transform="scale(${p.k})"`} fill="${f}" stroke="${c}" stroke-width="${r3(3.6/p.k)}">${p.svg.replace(/INK/g, c)}</g>`; });
  const order = body.filter((_, j) => j !== i).concat(body[i]);
  return `<svg viewBox="0 0 48 48" width="30" height="30" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${order.join("")}</svg>`;
}
function cycleRole(it, i){
  const info = mainInfo(it.main), R = rolesOf(it, info), p = info.parts[i]; if (!p) return;
  const seq = p.closed ? ROLES : ["ink","acc"];
  const nx = seq[(seq.indexOf(R[i]) + 1) % seq.length];
  it.parts = Object.fromEntries(R.map((r, j) => [j, r])); it.parts[i] = nx;
}


/* =================== Template Icon Builder =================== */
const TIB_VERSION = "1.6.0";
const OUTPUT_VERSION = "1.5.0"; // Lucide + Tabler + Hugeicons Free.
const STORE = "template-icon-builder-aksen-v1";
/* gaya terkunci: satu keluarga, dua varian */
/* gaya = patokan Icon Composer: garis 2, celah 2, ujung rata, tinta + aksen, 3 mode warna */
let style = {ink:"#1A1A1A", accent:"#C3DC1E", sw:2, gap:2, cap:"butt", join:"miter", pref:"A",
  colors:{main:{line:null, fill:null}, mod:{line:null, fill:null}, deco:{line:null, fill:null}},
  scale:{main:84, mod:100, deco:100}, fx:{mode:"none"}};
let customs = [];
const MODES = ["X", "A", "B"];
/* patokan tiap keluarga gaya; keduanya sama dengan Icon Composer */
const STY = {X:{sw:3.5, gap:1.25, cap:"round", join:"round", scale:{main:88, mod:80, deco:100}}, C:{sw:2, gap:2, cap:"butt", join:"miter", scale:{main:84, mod:100, deco:100}}};
function useStyle(kind){ const s = STY[kind === "X" ? "X" : "C"]; Object.assign(style, s, {scale:{...s.scale}}); }
function includePreviewStyleInExport(kind){
  MODES.forEach(mode => { const checkbox = $("ex" + mode); if (checkbox) checkbox.checked = mode === kind; });
}
const FILLS = ["none","full","offset","half"], SPARKS = ["none","star4","star4x2"];
function sparkHome(slot, type){ const h = (DECOS[type] || {home:[9, 9]}).home; return slot === "TL" || slot === "ML" ? [48 - h[0], h[1]] : [h[0], h[1]]; }
function normAcc(it, a){
  a = a || {};
  it.under = FILLS.includes(a.fill) ? a.fill : (FILLS.includes(it.under) ? it.under : "none");
  it.mstyle = a.marker === "fill" || a.marker === "line" ? a.marker : (it.mstyle === "fill" ? "fill" : "line");
  const pr = a.parts !== undefined ? a.parts : it.parts;
  if (pr && typeof pr === "object"){ const p = {}; for (const [k, v] of Object.entries(pr)) if (/^\d+$/.test(k) && ROLES.includes(v)) p[k] = v; it.parts = Object.keys(p).length ? p : null; } else it.parts = null;
  const sp = a.spark !== undefined ? a.spark : (it.deco && it.deco.type);
  if (SPARKS.includes(sp) && sp !== "none"){
    const pos = Array.isArray(a.spark_pos) && a.spark_pos.length === 2 && a.spark_pos.every(v => Number.isFinite(+v)) ? a.spark_pos.map(v => Math.max(0, Math.min(48, +v))) : (it.deco && it.deco.type === sp && Number.isFinite(it.deco.x) ? [it.deco.x, it.deco.y] : sparkHome(it.slot, sp));
    it.deco = {type:sp, x:pos[0], y:pos[1], r:0, color:"accent"};
  } else it.deco = {type:"none", x:9, y:9, r:0, color:"accent"};
  it.vis = {main:true, mod:true, deco:true};
  return it;
}
const MODE_INFO = {
  X:{label:"Aksen bagian · penanda di depan", short:"Aksen", dir:"aksen", en:["two tone icon", "accent icon", "line icon", "rounded icon"], id:["ikon dua warna", "ikon aksen", "ikon garis"]},
  A:{label:"Utama garis · pengubah solid", short:"Garis·solid", dir:"garis-solid", en:["two tone icon", "outline icon", "accent icon"], id:["ikon dua warna", "ikon garis", "ikon aksen"]},
  B:{label:"Utama solid · pengubah garis", short:"Solid·garis", dir:"solid-garis", en:["two tone icon", "solid icon", "filled icon"], id:["ikon dua warna", "ikon solid", "ikon isi"]},
  C:{label:"Keduanya garis", short:"Garis·garis", dir:"garis-garis", en:["outline icon", "line icon", "monoline icon"], id:["ikon garis", "ikon outline"]}
};
function applyManStyle(){
  const st = (man && man.style) || {};
  if (/^#[0-9a-f]{6}$/i.test(st.ink || "")) style.ink = st.ink.toUpperCase();
  if (/^#[0-9a-f]{6}$/i.test(st.accent || "")) style.accent = st.accent.toUpperCase();
  const fam = st.family === "classic" ? "classic" : "accent";
  pv = fam === "classic" ? (["A", "B"].includes(st.mode) ? st.mode : "A") : "X";
  $("exX").checked = fam === "accent"; $("exA").checked = pv === "A"; $("exB").checked = pv === "B";
}
const ANCHORS = ["TL","TC","TR","ML","C","MR","BL","BC","BR"];

/* MAIN_ALIAS, MOD_ALIAS, MOD_SYN, dan variantsOf kini berasal dari @icon-studio/icon-sources */
const MOD_POOL = ["plus","minus","check","x","star","search","clock","timer","bell","lock","shield","heart","pencil","settings","cloud","share-2","download","upload","refresh-cw","triangle-alert","info","zap","eye","flag","bookmark","link","user","message-circle","gift","trophy","target","rocket","hourglass","thumbs-up","send","tag","map-pin","sun","leaf","music","coffee"];


/* ---------- state ---------- */
let man = null;          /* manifest asli (diperbarui saat ekspor) */
let items = [];          /* ikon kerja */
let issuesG = [];        /* masalah tingkat manifest */
let layer = "main", drag = null;
let view = "import", pv = "A", sel = null, filter = "all", pickTarget = "main", pickSrc = "lu", pickQ = "", pickBodyFilter = "all", sheetCols = "auto";
let isSample = false;
function persist(){ try { localStorage.setItem(STORE, JSON.stringify({man, items, pv, sheetCols, isSample, v151:true})); } catch {} }

/* ---------- vocabulary ---------- */
function keyLabel(k){ if (LIB_RE.test(k)) return k.slice(3); return (MAINS[k] || MODS[k] || {n:k}).n; }
function srcOf(k){ return /^lu:/.test(k) ? "Lucide" : /^tb:/.test(k) ? "Tabler" : /^hg:/.test(k) ? "Hugeicons" : /^cu:/.test(k) ? "Kustom" : "Bawaan"; }
const TB_NAMES = new Set(Object.values(TB_CATS).join(" ").split(" "));
function luNames(){ const i = luIndex(); return i ? new Set(i.keys()) : new Set(); }
function hgNames(){ const i = hgIndex(); return i ? new Set(i.keys()) : new Set(); }
function cuNames(){ return new Set(CU.keys()); }
function exists(k, kind){
  if (k === "none") return kind === "mod";
  if (/^lu:/.test(k)) return luNames().has(k.slice(3));
  if (/^tb:/.test(k)) return TB_NAMES.has(k.slice(3));
  if (/^hg:/.test(k)) return hgNames().has(k.slice(3));
  if (/^cu:/.test(k)) return cuNames().has(k.slice(3));
  return kind === "main" ? !!MAINS[k] && !String(k).includes(":") : !!MODS[k];
}
function lev(a, b){ const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({length:n+1}, (_, j) => j); for (let i = 1; i <= m; i++){ const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j-1] + 1, p[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); p = c; } return p[n]; }
function suggest(k, kind){
  const name = LIB_RE.test(k) ? k.slice(3) : k;
  const al = MAIN_ALIAS[name] || MOD_ALIAS[name];
  if (al && luNames().has(al)) return "lu:" + al;
  const pools = [["lu:", [...luNames()]], ["tb:", [...TB_NAMES]], ["hg:", [...hgNames()]], ["cu:", [...cuNames()]], ["", Object.keys(kind === "main" ? MAINS : MODS).filter(x => !x.includes(":"))]];
  let best = null;
  for (const [pre, list] of pools) for (const n of list){
    let s = lev(name, n); if (n.startsWith(name) || name.startsWith(n)) s -= 1.5; if (n.includes(name)) s -= 1;
    if (!best || s < best.s) best = {k: pre + n, s};
  }
  return best && best.s <= Math.max(3, name.length * 0.45) ? best.k : null;
}

/* ---------- normalisasi manifest ---------- */
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function kebab2(s){ return String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 48); }
function toItem(o, i){
  const slot = ANCHORS.includes(o.anchor) && o.anchor !== "C" ? o.anchor : "BR";
  const mod = o.mod ? String(o.mod) : "none";
  const off = o.offset || {}, num = v => Number.isFinite(+v) ? Math.max(-12, Math.min(12, +v)) : null;
  const sh0 = mod !== "none" ? (SHIFT[slot] || [0, 0]) : [0, 0];
  const sh = Array.isArray(off.main) && off.main.length === 2 && num(off.main[0]) != null ? [num(off.main[0]), num(off.main[1]) || 0] : sh0;
  const mo = Array.isArray(off.mod) && off.mod.length === 2 && num(off.mod[0]) != null ? [num(off.mod[0]), num(off.mod[1]) || 0] : [0, 0];
  const name = typeof o.name === "string" ? {en:o.name, id:o.name} : (o.name || {});
  const kw = o.keywords || {};
  return {
    uid: "i" + i + "-" + Math.random().toString(36).slice(2, 6),
    id: ID_RE.test(o.id || "") ? o.id : kebab2(o.id || name.en || ("icon-" + (i + 1))),
    idRaw: o.id || "",
    name: {en: String(name.en || name.id || o.id || "").slice(0, 60), id: String(name.id || name.en || o.id || "").slice(0, 60)},
    main: String(o.main || ""), mod, slot, nx:mo[0], ny:mo[1], mx:sh[0], my:sh[1],
    slides: Array.isArray(o.slides) ? o.slides.filter(n => Number.isFinite(+n)).map(Number) : [],
    role: o.role === "extra" ? "extra" : "slot",
    keywords: {en: (kw.en || []).map(String).slice(0, 20), id: (kw.id || []).map(String).slice(0, 20)},
    on: true, vis:{main:true, mod:true, deco:true}, deco:{type:"none"}, _acc:o.accent
  };
}
function ensureItem(it){
  if (LIB_RE.test(it.main)) ensureLucide(it.main, "main");
  if (it.mod !== "none" && LIB_RE.test(it.mod)) ensureLucide(it.mod, "mod");
}
function importManifest(text){
  let j;
  try { j = JSON.parse(text); } catch (e){ return {fatal:"JSON tidak valid: " + e.message}; }
  if (!j || !Array.isArray(j.icons)) return {fatal:"Manifest harus punya daftar \"icons\"."};
  man = j;
  applyManStyle();
  items = j.icons.map(toItem).map(it => { const a = it._acc; delete it._acc; return normAcc(it, a); });
  /* hanya ikon yang dipakai di slide: ekstra dikeluarkan otomatis, bisa dimasukkan lagi per ikon */
  /* v1.5.1: ekstra tidak dikeluarkan otomatis; dipilih di langkah Ekspor */
  const needTb = items.some(it => /^tb:/.test(it.main) || /^tb:/.test(it.mod));
  const needHg = items.some(it => /^hg:/.test(it.main) || /^hg:/.test(it.mod));
  return {needTb, needHg};
}
function validateManifest(){
  const out = [];
  if (!man) return out;
  if (man.format !== "tib-manifest") out.push(["warn", "Kolom format bukan \"tib-manifest\". Tetap dibaca."]);
  if (!packOf().en) out.push(["warn", "Manifest tanpa \"pack\" (tema pack). Isi Tema pack di langkah Ekspor agar judul dan pencarian unik."]);
  const seen = {};
  items.forEach(it => {
    if (it.idRaw && it.idRaw !== it.id) out.push(["warn", `id "${it.idRaw}" diubah menjadi "${it.id}" (huruf kecil, tanda hubung).`]);
    if (seen[it.id]){ let n = 2; while (seen[it.id + "-" + n]) n++; out.push(["warn", `id "${it.id}" dobel. Yang kedua menjadi "${it.id}-${n}".`]); it.id = it.id + "-" + n; }
    seen[it.id] = true;
    for (const kind of ["main", "mod"]){
      const k = it[kind];
      if (kind === "main" && !k){ out.push(["err", `${it.id}: objek utama kosong.`]); continue; }
      if (!exists(k, kind)){
        const s = suggest(k, kind);
        out.push(["err", `${it.id}: ${kind === "main" ? "objek utama" : "pengubah"} "${k}" tidak dikenal.${s ? ` Saran: ${s}` : ""}`, s ? {uid:it.uid, kind, to:s} : null]);
      }
    }
  });
  return out;
}

/* ---------- pemeriksaan keunikan ---------- */
function libName(k, kind){ return libNameOf(k, kind, MAIN_ALIAS, MOD_ALIAS); }
function collisions(it){
  if (it.mod === "none") return [];
  const L = luNames(), hits = [];
  for (const a of variantsOf(libName(it.main, "main"), "main")) for (const b of variantsOf(libName(it.mod, "mod"), "mod")){
    for (const nm of [`${a}-${b}`, `${b}-${a}`]){
      if (L.has(nm)) hits.push("Lucide " + nm);
      if (TB_NAMES.has(nm)) hits.push("Tabler " + nm);
      if (hgNames().has(nm)) hits.push("Hugeicons " + nm);
    }
  }
  return [...new Set(hits)];
}
function flagsOf(it, dupMap){
  const f = [];
  if (!exists(it.main, "main")) f.push(["err", "Objek utama tidak dikenal"]);
  if (it.mod !== "none" && !exists(it.mod, "mod")) f.push(["err", "Pengubah tidak dikenal"]);
  if (it.mod === "none") { const pub = LIB_RE.test(it.main) && !/^cu:/.test(it.main); f.push([pub ? "err" : "warn", pub ? "Tanpa pengubah: sama dengan ikon pustaka" : "Tanpa pengubah"]); }
  const c = collisions(it); if (c.length) f.push(["err", "Mirip " + c[0]]);
  const key = it.main + "|" + it.mod;
  if (dupMap && dupMap[key] > 1) f.push(["err", "Rakitan dobel di pack"]);
  if (it.main === it.mod || libName(it.main, "main") === libName(it.mod, "mod")) f.push(["warn", "Objek dan pengubah sama"]);
  const M = MAINS[it.main]; if (M && M.missing) f.push(["warn", "Belum termuat"]);
  if (M && M.plate) f.push(["warn", "Tanpa body: mode Solid·garis memakai pelat bulat, isi bidang Aksen tidak tersedia"]);
  const solidCheck = typeof solidLineDiagnostic === "function" ? solidLineDiagnostic(it) : null;
  if (solidCheck && solidCheck.message) f.push(["warn", solidCheck.message]);
  return f;
}
function dupMap(){ const m = {}; items.filter(i => i.on).forEach(i => { const k = i.main + "|" + i.mod; m[k] = (m[k] || 0) + 1; }); return m; }
const isBad = (it, dm) => flagsOf(it, dm).some(f => f[0] === "err");

/* ---------- render ikon: mesin Icon Composer ---------- */
/* mesin classic 1.4.5 (kotak pengubah adaptif Solid·garis, diagnostik): ada di packages/engines/classic/solid.js */
let kid = 0;
function solidLineDiagnostic(it){ return solidLineDiagnosticClassic(it, classicCtx()); }

function compose(it, opt){ return get("classic").compose(it, style, {...(opt || {}), ctx: classicCtx()}); }
function decoMarkup(it){ return decoMarkupClassic(it, classicCtx()); }

function render(it, kind, opt){
  opt = opt || {};
  if (!MAINS[it.main]) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${opt.size || 48}" height="${opt.size || 48}"></svg>`;
  useStyle(kind);
  if (kind === "X") return composeAccent({...it, vis:{main:true, mod:true, deco:true}, deco:it.deco || {type:"none"}}, {size: opt.size || 48, idp: opt.idp});
  return compose({...it, pref: MODES.includes(kind) ? kind : "A", deco:{type:"none"}}, {size: opt.size || 48, idp: opt.idp});
}
function thumbKey(k, kind){
  if (kind === "mod" && k === "none") return `<svg viewBox="0 0 24 24" fill="none" stroke="#8B8D96" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M6.5 17.5 17.5 6.5"/></svg>`;
  if (LIB_RE.test(k)){ const A = luAnalyze(k); if (!A) return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#8B8D96" stroke-dasharray="2 2"/></svg>`; return `<svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${A.node.map(([t, a]) => partStr({tag:t, attrs:a})).join("")}</svg>`; }
  if (kind === "main" && MAINS[k]) return render({main:k, mod:"none", slot:"BR", nx:0, ny:0, mx:0, my:0, vis:{main:true, mod:false, deco:false}}, "C", {idp:"th" + k});
  const md = MODS[k]; if (!md) return "";
  const sc = Math.min(30/md.w, 30/md.h), W = md.w*sc, H = md.h*sc;
  return `<svg viewBox="0 0 48 48" fill="none" stroke="#1A1A1A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(${r3(24-W/2)} ${r3(24-H/2)}) scale(${r3(sc)})"><g stroke-width="${r3(2.4/sc)}">${md.sil}</g><g stroke-width="${r3(2.4*(md.badge ? .75 : 1)/(sc*(md.kd || 1)))}">${md.det.replace(/INK/g, "#1A1A1A")}</g></g></svg>`;
}

/* ---------- views ---------- */
function showView(v){
  if (v !== "import" && !items.length) v = "import";
  view = v;
  $("vImport").hidden = v !== "import"; $("vReview").hidden = v !== "review"; $("vExport").hidden = v !== "export";
  document.querySelectorAll("[data-view]").forEach(b => { b.setAttribute("aria-pressed", String(b.dataset.view === v)); if (b.dataset.view !== "import") b.disabled = !items.length; });
  document.querySelectorAll("[data-pv]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pv === pv)));
  const deck = man && man.deck && man.deck.title ? man.deck.title : "manifest → pack Canva";
  $("crumb").textContent = items.length ? `${deck}${isSample ? " (data contoh)" : ""} · ${items.filter(i => i.on).length} ikon` : deck;
  if (v === "import") renderImport();
  if (v === "review") renderReview();
  if (v === "export") renderExport();
}
function renderImport(){
  if (!man){ $("impSum").innerHTML = `<p class="hint">Belum ada manifest.</p>`; $("impIssues").innerHTML = ""; $("goReview").hidden = true; return; }
  const slots = items.filter(i => i.role === "slot").length, extra = items.length - slots;
  const dm = dupMap(), bad = items.filter(i => isBad(i, dm)).length;
  $("impSum").innerHTML = `<div class="stats"><div class="stat"><b>${items.length}</b><span>ikon</span></div><div class="stat"><b>${slots}</b><span>slot deck</span></div><div class="stat"><b>${extra}</b><span>ekstra</span></div><div class="stat"><b>${bad}</b><span>perlu dicek</span></div></div>
    <p class="hint" style="margin-top:8px">${esc((man.deck && man.deck.title) || "Tanpa judul")} · tema pack ${esc(packOf().en || "–")} · mode deck ${esc(MODE_INFO[pv].short)} · tinta ${esc(style.ink)} · aksen ${esc(style.accent)}</p>`;
  const nEx = items.filter(i => i.role === "extra").length;
  if (isSample) $("impSum").innerHTML = `<div class="iss" style="border-color:var(--warn,#E0A100)"><span class="dot warn">!</span><span class="t"><b>Ini data contoh, bukan manifest Anda.</b><br><span class="hint">Tempel atau unggah manifest dari Claude Design, lalu tekan Impor manifest.</span></span></div>` + $("impSum").innerHTML;
  const list = [...(issuesG.length ? issuesG : [["ok", "Semua nama objek dan pengubah dikenali."]]), ...(nEx ? [["warn", `${nEx} ikon ekstra (tidak dipakai di slide). Pilih ikut diekspor atau tidak di langkah Ekspor.`]] : [])];
  $("impIssues").innerHTML = list.map(([lv, t, fix], n) => `<div class="iss"><span class="dot ${lv}">${lv === "ok" ? "✓" : "!"}</span><span class="t">${esc(t)}</span>${fix ? `<button class="btn sm" data-fixi="${n}">Pakai saran</button>` : ""}</div>`).join("");
  $("goReview").hidden = false;
}
function filtered(){
  const dm = dupMap();
  return items.filter(it => filter === "all" ? true : filter === "bad" ? isBad(it, dm) || flagsOf(it, dm).length > 0 : filter === "slot" ? it.role === "slot" : filter === "extra" ? it.role === "extra" : filter === "off" ? !it.on : true);
}
function boxesT(it){
  useStyle(pv);
  const g = geom(it), ms = style.scale.main/100, d = it.deco || {type:"none"};
  const deco = pv === "X" && d.type !== "none" ? (d.type === "star4" ? {x:d.x - 4.5, y:d.y - 4.5, w:9, h:9} : {x:d.x - 5.5, y:d.y - 6.5, w:12.5, h:12.5}) : null;
  return {main:{x:24 + it.mx - 20*ms, y:24 + it.my - 20*ms, w:40*ms, h:40*ms}, mod: g.md ? {x:g.L, y:g.T, w:g.W, h:g.H} : null, deco};
}
const LAYER_LAB = {main:"Objek utama", mod:"Pengubah", deco:"Kilau"};
const curIt = () => items.find(i => i.uid === sel);
function renderReview(){
  if (!curIt() && items.length) sel = items[0].uid;
  if (layer === "mod" && curIt() && curIt().mod === "none" && pickTarget !== "mod") layer = "main";
  pickTarget = layer === "deco" ? "main" : layer;
  const dm = dupMap();
  const nBad = items.filter(i => i.on && flagsOf(i, dm).length).length;
  $("rvSub").textContent = `${items.filter(i => i.on).length} ikon aktif · ${nBad} perlu dicek`;
  const F = [["all", "Semua", items.length], ["bad", "Perlu dicek", items.filter(i => flagsOf(i, dm).length).length], ["slot", "Slot deck", items.filter(i => i.role === "slot").length], ["extra", "Ekstra", items.filter(i => i.role === "extra").length], ["off", "Dikeluarkan", items.filter(i => !i.on).length]];
  $("filters").innerHTML = F.map(([k, t, n]) => `<button class="chipb" data-filter="${k}" aria-pressed="${filter === k}">${t} · ${n}</button>`).join("");
  $("grid").innerHTML = filtered().map(it => {
    const fl = flagsOf(it, dm), lv = fl.some(f => f[0] === "err") ? "err" : fl.length ? "warn" : "ok";
    return `<button class="ic${it.on ? "" : " off"}" data-sel="${it.uid}" aria-pressed="${sel === it.uid}" title="${esc(it.name.en)}${fl.length ? " · " + esc(fl.map(f => f[1]).join(", ")) : ""}"><span class="one">${render(it, pv, {idp:"g" + it.uid})}</span><span class="id">${esc(it.id)}</span><span class="badges"><span class="bdg ${lv}">${lv === "ok" ? "unik" : lv === "err" ? "masalah" : "cek"}</span><span class="bdg">${it.role === "slot" ? "slide " + (it.slides.join(",") || "–") : "ekstra"}</span></span></button>`;
  }).join("") || `<div class="empty" style="grid-column:1/-1">Tidak ada ikon di filter ini.</div>`;
  renderBoard(); renderLib(); renderDetail();
}
function renderBoard(){
  const it = curIt();
  if (!it){ $("bArt").innerHTML = ""; $("bOv").innerHTML = ""; return; }
  $("bArt").innerHTML = render(it, pv, {size:"100%", idp:"bd"});
  $("bName").textContent = `${it.id} · ${it.name.en}`;
  $("bMeta").textContent = `utama ${it.mx}, ${it.my} · pengubah ${it.mod === "none" ? "–" : it.nx + ", " + it.ny}`;
  $("bMode").textContent = MODE_INFO[pv].label + (pv === "X" ? " · klik bagian untuk ganti warna" : "");
  if (layer === "deco" && !(pv === "X" && it.deco && it.deco.type !== "none")) layer = "main";
  const b = boxesT(it), sb = b[layer];
  let o = "";
  const hit = k => { const x = b[k]; return x ? `<rect data-layer="${k}" x="${r3(x.x - 1)}" y="${r3(x.y - 1)}" width="${r3(x.w + 2)}" height="${r3(x.h + 2)}" fill="transparent" style="cursor:move"/>` : ""; };
  o += hit("main");
  if (pv === "X" && layer === "main"){
    useStyle("X"); const info = mainInfo(it.main), g = geom(it);
    o += `<g transform="${g.mainT}">` + info.parts.map((p, i) => {
      const css = `style="fill:${p.closed ? "rgba(0,0,0,0)" : "none"};stroke:rgba(0,0,0,0);stroke-width:${r3(4/g.ms/p.k)}px;pointer-events:${p.closed ? "all" : "stroke"}"`;
      const el = p.svg.replace(/^<(\w+)/, `<$1 data-layer="main" data-part="${i}" class="hp${p.closed ? " cl" : ""}" ${css}`).replace(/ fill="INK"| stroke="none"/g, "");
      return `<g${p.k === 1 ? "" : ` transform="scale(${p.k})"`}><title>Bagian ${i + 1}: klik untuk ganti warna</title>${el}</g>`;
    }).join("") + `</g>`;
  }
  o += hit("mod") + hit("deco");
  if (sb){
    const lab = LAYER_LAB[layer], tw = lab.length*0.72 + 1.2, ty = sb.y - 2.4 < 0 ? sb.y + sb.h + 0.5 : sb.y - 2.4;
    o += `<rect x="${r3(sb.x)}" y="${r3(sb.y)}" width="${r3(sb.w)}" height="${r3(sb.h)}" fill="none" stroke="#3A57E8" stroke-width="0.22" stroke-dasharray="0.7 0.5" pointer-events="none"/>`;
    for (const [hx, hy] of [[sb.x, sb.y], [sb.x + sb.w, sb.y], [sb.x, sb.y + sb.h], [sb.x + sb.w, sb.y + sb.h]]) o += `<rect x="${r3(hx - 0.55)}" y="${r3(hy - 0.55)}" width="1.1" height="1.1" fill="#fff" stroke="#3A57E8" stroke-width="0.2" pointer-events="none"/>`;
    o += `<rect x="${r3(sb.x)}" y="${r3(ty)}" width="${r3(tw)}" height="1.9" rx="0.3" fill="#3A57E8" pointer-events="none"/><text x="${r3(sb.x + 0.6)}" y="${r3(ty + 1.38)}" font-size="1.25" font-family="Geist, sans-serif" font-weight="600" fill="#fff" pointer-events="none">${lab}</text>`;
  }
  $("bOv").innerHTML = o;
}
function renderLib(){
  const it = curIt();
  $("lib").innerHTML = `
    <div class="hd"><span class="cap">Pustaka</span><span class="hint">klik untuk mengganti</span></div>
    <div class="seg" role="group" aria-label="Yang diganti"><button data-pt="main" aria-pressed="${pickTarget === "main"}">Objek utama</button><button data-pt="mod" aria-pressed="${pickTarget === "mod"}">Pengubah</button></div>
    <div class="seg psources" role="group" aria-label="Sumber"><button data-psrc="lu" aria-pressed="${pickSrc === "lu"}">Lucide</button><button data-psrc="tb" aria-pressed="${pickSrc === "tb"}">Tabler</button><button data-psrc="hg" aria-pressed="${pickSrc === "hg"}">Hugeicons</button><button data-psrc="cu" aria-pressed="${pickSrc === "cu"}">Kustom</button><button data-psrc="in" aria-pressed="${pickSrc === "in"}">Bawaan</button>${pickTarget === "mod" ? `<button data-psrc="pool" aria-pressed="${pickSrc === "pool"}">Saran</button>` : ""}</div>
    <input class="inp" id="pQ" placeholder="cari: clock, star, lampu…" value="${esc(pickQ)}" aria-label="Cari ikon">
    ${["lu","tb","hg","cu"].includes(pickSrc) ? `<div class="seg pbody" role="group" aria-label="Filter struktur ikon"><button data-pbody="all" aria-pressed="${pickBodyFilter === "all"}">Semua</button><button data-pbody="body" aria-pressed="${pickBodyFilter === "body"}">Punya body</button><button data-pbody="line" aria-pressed="${pickBodyFilter === "line"}">Hanya garis</button></div>` : ""}
    ${it ? `<div class="part"><span class="th">${thumbKey(it[pickTarget], pickTarget)}</span><span class="tx"><span class="hint">${pickTarget === "main" ? "Objek utama" : "Pengubah"} sekarang · ${it[pickTarget] === "none" ? "–" : srcOf(it[pickTarget])}</span><b>${it[pickTarget] === "none" ? "Tanpa" : esc(keyLabel(it[pickTarget]))}</b></span>${pickTarget === "mod" && it.mod !== "none" ? `<button class="btn sm" data-setnone="1">Lepas</button>` : ""}</div>` : ""}
    <div class="pgrid" id="pGrid"></div>
    <p class="hint">Kotak bergaris merah = rakitan itu sudah ada sebagai ikon pustaka.</p>`;
  renderPick();
}
function renderDetail(){
  const it = curIt();
  if (!it){ $("detail").innerHTML = `<span class="cap">Detail</span><p class="hint">Pilih ikon di panel Pack.</p>${legend()}`; return; }
  const dm = dupMap(), fl = flagsOf(it, dm), col = collisions(it);
  if (layer === "deco" && !(pv === "X" && it.deco && it.deco.type !== "none")) layer = "main";
  const pos = posOf(it, layer), R0 = layer === "deco" ? [0, 48] : [-12, 12];
  $("detail").innerHTML = `
    <div class="hd"><span class="cap">Detail ikon</span><label class="optrow" style="min-height:0;gap:8px"><span class="hint">Masuk pack</span><input type="checkbox" id="dOn" ${it.on ? "checked" : ""}></label></div>
    <div class="big">${MODES.map(m => `<figure><div class="pv">${render(it, m, {idp:"d" + m})}</div><figcaption>${MODE_INFO[m].short}</figcaption></figure>`).join("")}</div>
    <div class="issues">${fl.length ? fl.map(([lv, t]) => `<div class="iss"><span class="dot ${lv}">!</span><span class="t">${esc(t)}${t.startsWith("Mirip") ? `<br><span class="hint">Ganti pengubah supaya element Anda unik.${col.length > 1 ? " Juga: " + esc(col.slice(1, 3).join(", ")) : ""}</span>` : ""}</span></div>`).join("") : `<div class="iss"><span class="dot ok">✓</span><span class="t">Rakitan unik, tidak ada nama serupa di Lucide/Tabler/Hugeicons.</span></div>`}</div>
    <label class="f">id · nama file &amp; label Resource Page<input class="inp mono" id="dId" value="${esc(it.id)}"></label>
    <div class="two"><label class="f">Nama (EN)<input class="inp" id="dEn" value="${esc(it.name.en)}"></label><label class="f">Nama (ID)<input class="inp" id="dIdn" value="${esc(it.name.id)}"></label></div>
    <span class="cap">Lapisan</span>
    <div class="two">
      <button class="part" data-pt="main" style="text-align:left" aria-pressed="${layer === "main"}"><span class="th">${thumbKey(it.main, "main")}</span><span class="tx"><span class="hint">Objek utama</span><b>${esc(keyLabel(it.main))}</b></span></button>
      <button class="part" data-pt="mod" style="text-align:left" aria-pressed="${layer === "mod"}"><span class="th">${thumbKey(it.mod, "mod")}</span><span class="tx"><span class="hint">Pengubah</span><b>${it.mod === "none" ? "Tanpa" : esc(keyLabel(it.mod))}</b></span></button>
    </div>
    ${pv === "X" && it.deco && it.deco.type !== "none" ? `<button class="part" data-pt="deco" style="text-align:left" aria-pressed="${layer === "deco"}"><span class="th"><svg viewBox="-8 -8 16 16"><path d="${DECOS[it.deco.type].d}" fill="${style.accent}"/></svg></span><span class="tx"><span class="hint">Dekorasi</span><b>${DECOS[it.deco.type].n}</b></span></button>` : ""}
    ${layer === "mod" && it.mod !== "none" ? `<div style="display:flex;gap:14px;align-items:center"><div class="slots" role="group" aria-label="Jangkar pengubah">${ANCHORS.map(a => `<button data-anchor="${a}" ${a === "C" ? "disabled" : ""} aria-pressed="${it.slot === a}" aria-label="${a}">${SLOT_GLYPH[a]}</button>`).join("")}</div><p class="hint">Jangkar menempelkan pengubah ke sudut. Objek utama ikut bergeser menjauh.</p></div>` : ""}
    ${layer === "main" || it.mod !== "none" ? `<div class="two"><div class="rng"><div class="hd"><label for="dX">X</label><span class="sub">${pos[0]}</span></div><input type="range" id="dX" min="${R0[0]}" max="${R0[1]}" step="0.5" value="${pos[0]}"></div><div class="rng"><div class="hd"><label for="dY">Y</label><span class="sub">${pos[1]}</span></div><input type="range" id="dY" min="${R0[0]}" max="${R0[1]}" step="0.5" value="${pos[1]}"></div></div>
    <div class="hd"><span class="hint">Geser 0,5</span><div class="nudge"><button data-nudge="l" aria-label="Kiri">←</button><button data-nudge="u" aria-label="Atas">↑</button><button data-nudge="d" aria-label="Bawah">↓</button><button data-nudge="r" aria-label="Kanan">→</button><button class="btn sm" data-resetpos="1" style="width:auto">Atur ulang</button></div></div>` : ""}
    ${accPanel(it)}
    <p class="hint">Skala, tebal garis, celah knockout dan warna mengikuti patokan Icon Composer untuk semua ikon. Yang bisa diubah per ikon: objek, pengubah, posisi, dan pengaturan Aksen.</p>`;
}
function posOf(it, l){ return l === "main" ? [it.mx, it.my] : l === "mod" ? [it.nx, it.ny] : [it.deco.x, it.deco.y]; }
function accPanel(it){
  if (pv !== "X") return `<div class="accbox"><span class="cap">Gaya aksen</span><p class="hint">Warna bagian, isi bidang, penanda dan kilau diatur di pratinjau Aksen.</p><button class="btn sm" data-pv="X">Buka pratinjau Aksen</button></div>`;
  useStyle("X");
  const info = mainInfo(it.main), R = rolesOf(it, info), hasBody = info.parts.some(p => p.body);
  const rows = info.parts.map((p, i) => `<div class="prow"><span class="pt2">${partThumb(info, i, R)}</span><div class="seg" role="group" aria-label="Warna bagian ${i + 1}">${ROLES.map(r => `<button data-prole="${i}:${r}" aria-pressed="${R[i] === r}" ${!p.closed && r.startsWith("fill") ? "disabled" : ""}>${ROLE_NAME[r]}</button>`).join("")}</div></div>`).join("");
  return `<div class="accbox">
    <div class="hd"><span class="cap">Gaya aksen</span><button class="btn sm" data-pauto="1">${it.parts ? "Kembali ke otomatis" : "Otomatis"}</button></div>
    <p class="hint">Klik bagian ikon di kanvas untuk berganti warna, atau pilih di sini. Satu kelompok aksen per ikon.</p>
    <div class="plist">${rows}</div>
    <span>Isi bidang <span class="sub">· Cara 3</span></span>
    <div class="seg sm" role="group" aria-label="Isi bidang">${FILLS.map(k => `<button data-under="${k}" aria-pressed="${it.under === k}" ${!hasBody && k !== "none" ? "disabled" : ""}>${UNDER_NAME[k]}</button>`).join("")}</div>
    ${it.mod !== "none" ? `<span>Penanda <span class="sub">· Cara 4, di depan dengan celah</span></span>
    <div class="seg sm" role="group" aria-label="Penanda"><button data-mstyle="line" aria-pressed="${it.mstyle === "line"}">Garis</button><button data-mstyle="fill" aria-pressed="${it.mstyle === "fill"}">Isi</button></div>` : ""}
    <span>Kilau</span>
    <div class="seg sm" role="group" aria-label="Kilau">${SPARKS.map(k => `<button data-spark="${k}" aria-pressed="${(it.deco || {}).type === k}">${k === "none" ? "Tanpa" : DECOS[k].n}</button>`).join("")}</div>
  </div>`;
}
function setPos(it, which, x, y){
  const c = v => Math.max(-12, Math.min(12, Math.round(v*2)/2)), c2 = v => Math.max(0, Math.min(48, Math.round(v*2)/2));
  if (which === "deco"){ it.deco.x = c2(x); it.deco.y = c2(y); return; }
  if (which === "main"){ it.mx = c(x); it.my = c(y); } else { it.nx = c(x); it.ny = c(y); }
}
function legend(){ return `<span class="cap">Arti tanda</span><div class="issues">
  <div class="iss"><span class="dot err">!</span><span class="t"><b>Mirip ikon pustaka</b><br><span class="hint">Nama gabungannya sudah ada di Lucide/Tabler/Hugeicons (mis. user-plus). Element seperti ini berisiko dianggap tidak orisinal.</span></span></div>
  <div class="iss"><span class="dot warn">!</span><span class="t"><b>Tanpa body</b><br><span class="hint">Objek pustaka tanpa bidang tertutup. Di mode Solid·garis, objek ini diberi pelat bulat aksen. Ganti objek bila ingin bentuk solid asli.</span></span></div>
  <div class="iss"><span class="dot err">!</span><span class="t"><b>Tanpa pengubah</b><br><span class="hint">Ikon pustaka tanpa tambahan sama saja dengan salinan.</span></span></div>
  <div class="iss"><span class="dot ok">✓</span><span class="t"><b>Gaya Aksen</b><br><span class="hint">Wadah tinta, isi atau bidang aksen, penanda pengubah di depan dengan celah. Warna bagian otomatis bisa diubah dengan klik bagian di kanvas.</span></span></div>
  <div class="iss"><span class="dot warn">!</span><span class="t"><b>Tidak dikenal</b><br><span class="hint">Nama dari manifest tidak ada di kosakata. Pilih pengganti.</span></span></div></div>`; }
function quickHasBody(node){ return (node || []).some(([tag, attrs]) => ["circle","rect","ellipse","polygon"].includes(tag) || (tag === "path" && /[zZ]/.test((attrs && attrs.d) || ""))); }
function pickList(){
  const q = pickQ.trim().toLowerCase(); const terms = q ? q.split(/[,\s]+/).filter(Boolean).map(t => ID_EN[t] || t) : [];
  const score = n => { if (!terms.length) return 1; let s = 0; for (const t of terms){ if (n === t) s += 10; else if (n.startsWith(t)) s += 6; else if (n.split("-").includes(t)) s += 5; else if (n.includes(t)) s += 2; } return s; };
  let names;
  if (pickSrc === "pool") names = MOD_POOL.filter(n => luNames().has(n)).map(n => "lu:" + n);
  else if (pickSrc === "in") names = Object.keys(pickTarget === "main" ? MAINS : MODS).filter(k => !k.includes(":")).map(k => [k, score(k + " " + (pickTarget === "main" ? MAINS : MODS)[k].n.toLowerCase())]).filter(x => x[1] > 0).map(x => x[0]);
  else {
    const all = pickSrc === "lu" ? [...luNames()] : pickSrc === "tb" ? [...TB_NAMES] : pickSrc === "cu" ? [...cuNames()] : [...hgNames()];
    const cuText = n => { const v = CU_DATA.icons[n] || {}, tg = v.tags || {}, nm = v.name || {}; return [n, nm.en, nm.id, ...(tg.en || []), ...(tg.id || [])].filter(Boolean).join(" ").toLowerCase(); };
    names = terms.length ? all.map(n => [n, pickSrc === "cu" ? score(cuText(n)) : score(n)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).map(x => x[0]) : all;
    if (pickBodyFilter !== "all"){
      const idx = SOURCES[pickSrc].index();
      names = names.filter(n => quickHasBody(idx && idx.get(n)) === (pickBodyFilter === "body"));
    }
    names = names.slice(0, 60).map(n => pickSrc + ":" + n);
  }
  return names.slice(0, 60);
}
function renderPick(){
  const g = $("pGrid"); if (!g) return;
  const it = items.find(i => i.uid === sel); if (!it) return;
  if (pickSrc === "tb" && !SOURCES.tb.index()){ g.innerHTML = `<p class="hint" style="grid-column:1/-1">Memuat Tabler…</p>`; loadTabler().then(() => { if (sel === it.uid) renderPick(); }); return; }
  if (pickSrc === "hg" && !SOURCES.hg.index()){ g.innerHTML = `<p class="hint" style="grid-column:1/-1">Memuat Hugeicons…</p>`; loadHugeicons().then(() => { if (sel === it.uid) renderPick(); }); return; }
  const list = pickList();
  g.innerHTML = list.map(k => {
    const trial = {...it, [pickTarget]: k};
    const hit = collisions(trial).length > 0;
    return `<button class="pt${hit ? " hit" : ""}" data-pick="${k}" title="${esc(keyLabel(k))}${hit ? " · sudah ada di pustaka" : ""}">${thumbKey(k, pickTarget)}<span>${esc(keyLabel(k))}</span></button>`;
  }).join("") || `<p class="hint" style="grid-column:1/-1">Tidak ada hasil.</p>`;
}
/* satu halaman Resource Page: kolom bertambah mengikuti jumlah ikon */
function sheetGrid(n){ if (sheetCols !== "auto") return +sheetCols; return n <= 12 ? 4 : n <= 24 ? 6 : n <= 40 ? 8 : n <= 60 ? 10 : n <= 96 ? 12 : 14; }
function roleOk(i){ return i.role === "extra" ? $("exExtra").checked : $("exSlot").checked; }
function exportList(){ const dm = dupMap(); const L = items.filter(i => i.on && roleOk(i) && !($("exSkipBad").checked && isBad(i, dm))); return [...L.filter(i => i.role !== "extra"), ...L.filter(i => i.role === "extra")]; }
const ROLE_DIR = {slot:"slot-deck", extra:"ekstra"};
function pathOf(it, s){ const d = MODE_INFO[s].dir; return `${d}/${$("exSplit").checked ? ROLE_DIR[it.role === "extra" ? "extra" : "slot"] + "/" : ""}${it.id}-${d}.svg`; }
function renderExport(){
  const list = exportList(), cols = sheetGrid(list.length), styles = MODES.filter(m => $("ex" + m).checked);
  document.querySelectorAll("[data-cols]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cols === sheetCols)));
  $("sheet").innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:22px"><div><div style="font-size:30px;font-weight:600;letter-spacing:-.02em">Resource Page</div><div style="color:#5E6068;margin-top:4px">${esc((man && man.resource && man.resource.description) || "Use these icons to add clarity to your presentation.")}</div></div><div class="mono" style="font-size:11px;color:#8B8D96">${list.length} icons · ${MODE_INFO[pv].short}</div></div>
    ${[["slot", "Used in this deck"], ["extra", "Extra icons in the same set"]].map(([r, lab]) => { const g = list.filter(i => (i.role === "extra" ? "extra" : "slot") === r); if (!g.length) return ""; return `${list.some(i => i.role === "extra") ? `<div style="font-size:13px;font-weight:600;color:#5E6068;margin:14px 0 10px;border-top:1px solid #E4E4DE;padding-top:8px">${lab} · ${g.length}</div>` : ""}<div class="rg" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${g.map((it, i) => `<div class="cell">${render(it, pv, {idp:"sh" + r + i})}<span>${esc(it.id)}</span></div>`).join("")}</div>`; }).join("")}`;
  const nS = items.filter(i => i.on && i.role !== "extra").length, nE = items.filter(i => i.on && i.role === "extra").length;
  $("exSlotN").textContent = `· ${nS}`; $("exExtraN").textContent = `· ${nE}`; $("exExtra").disabled = !nE;
  const dm = dupMap(), flagged = items.filter(i => i.on && flagsOf(i, dm).length).length;
  $("exIcons").textContent = list.length; $("exFiles").textContent = list.length * styles.length; $("exFlags").textContent = flagged;
  if (!$("exName").value) $("exName").value = (man && man.deck && man.deck.title) ? man.deck.title + " Icons" : "Icon Pack";
  const pk = packOf(); if (document.activeElement !== $("exPackEn")) $("exPackEn").value = pk.en; if (document.activeElement !== $("exPackId")) $("exPackId").value = pk.id;
  if (document.activeElement !== $("exBrand")) $("exBrand").value = brandId();
  const b0 = brandId(), okB = !b0 || /^BA[A-Za-z0-9_-]{6,}$/.test(b0);
  if (list[0]){ const m0 = meta(list[0], styles[0] || pv, 15); $("exSearchEx").innerHTML = `Judul: <b>${esc(m0.title_en)}</b><br>Cari di Elements: <span class="mono">${esc(m0.search)}</span>${!pk.en ? "<br>Tema pack kosong: judul tidak memuat tema." : ""}${!b0 ? "<br>ID brand kosong: kolom search tanpa filter brand." : okB ? "" : "<br>ID brand biasanya diawali BA. Periksa lagi."}`; }
  const base = kebab2($("exName").value) || "icon-pack";
  const ex = list.slice(0, 2).map(i => i.id);
  $("exTree").textContent = `${base}.zip\n` + styles.map(s => `├─ ${MODE_INFO[s].dir}/\n` + ($("exSplit").checked ? [list.some(i => i.role !== "extra") ? `│  ├─ slot-deck/   ${list.filter(i => i.role !== "extra").length} svg` : "", list.some(i => i.role === "extra") ? `│  ├─ ekstra/      ${list.filter(i => i.role === "extra").length} svg` : ""].filter(Boolean).join("\n") : `│  └─ ${list.length} svg`)).join("\n") + `\n├─ metadata.csv (Canva)\n├─ metadata-internal.csv\n├─ submission-profile.json\n├─ resource-page.html\n├─ manifest-final.json\n└─ LICENSES.txt`;
  $("exGo").disabled = !list.length || !styles.length;
  void ex;
}

/* ---------- metadata ---------- */
/* judul & pencarian: [nama ikon] [tema pack] [gaya] Icon, dicari dengan brand:<ID> [id] [tema pack] */
const BRAND_KEY = "tib-canva-brand-id";
function brandId(){ try { return (localStorage.getItem(BRAND_KEY) || "").trim(); } catch { return ""; } }
function packOf(){ const p = man && man.pack; if (!p) return {en:"", id:""}; if (typeof p === "string") return {en:p, id:p}; return {en:String(p.en || p.id || ""), id:String(p.id || p.en || "")}; }
function searchOf(it){ const b = brandId(), pk = packOf().en.toLowerCase().trim(); return [b ? "brand:" + b : "", it.id.replace(/-/g, " "), pk].filter(Boolean).join(" "); }
const TAGS = createTagIndex();
const loadTags = TAGS.loadTags;
function tagsOf(k, kind){ return TAGS.tagsOf(libName(k, kind)); }
/* kata gaya judul: satu sumber di packages/export (STYLE_WORDS) */
function styleWordOf(kind){ return kind === "X" ? styleWord("accent") : styleWord("classic", kind); }
function meta(it, kind, N){
  const styleEN = MODE_INFO[kind].en, styleID = MODE_INFO[kind].id;
  const mainT = tagsOf(it.main, "main"), modT = it.mod !== "none" ? tagsOf(it.mod, "mod") : [];
  const lc = a => a.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const pk = packOf();
  const en = [...new Set([...lc(it.keywords.en), it.name.en.toLowerCase(), ...lc([pk.en]), ...mainT.slice(0, 6), ...modT.slice(0, 4), ...styleEN, "icon"])].slice(0, N);
  const idw = [...new Set([...lc(it.keywords.id), it.name.id.toLowerCase(), ...lc([pk.id]), ...[...mainT.slice(0, 6), ...modT.slice(0, 4)].map(trID).filter(Boolean), ...styleID, "ikon"])].slice(0, N);
  const nid = it.name.id.charAt(0).toLowerCase() + it.name.id.slice(1);
  return {
    title_en: [titleCase(it.name.en), titleCase(pk.en), styleWordOf(kind).en, "Icon"].filter(Boolean).join(" "),
    title_id: ["Ikon", nid, pk.id.toLowerCase(), styleWordOf(kind).id].filter(Boolean).join(" "),
    keywords_en: en.join(", "), keywords_id: idw.join(", "), search: searchOf(it)
  };
}

/* ---------- ekspor ---------- */
/* pengaman ekspor: buang atribut ganda di tiap tag agar file selalu XML valid */

function svgFile(it, kind, i){ return `<?xml version="1.0" encoding="UTF-8"?>\n` + dedupeAttrs(render(it, kind, {size:480, idp:"k" + kind + i})); }
function finalManifest(list){
  return {...(man || {}), format:"tib-manifest", version:1, generator:{name:"Template Icon Builder", version:OUTPUT_VERSION, exported_at:new Date().toISOString()},
    version:2, style:{...((man && man.style) || {}), family: pv === "X" ? "accent" : "classic", mode: pv === "X" ? ((man && man.style && man.style.mode) || "A") : pv, ink:style.ink, accent:style.accent},
    icons: list.map(it => ({id:it.id, name:it.name, main:it.main, mod:it.mod, anchor:it.slot, offset:{main:[it.mx, it.my], mod:[it.nx, it.ny]},
      accent:{fill:it.under, marker:it.mstyle, spark:(it.deco || {}).type || "none", ...((it.deco || {}).type && it.deco.type !== "none" ? {spark_pos:[it.deco.x, it.deco.y]} : {}), parts:it.parts || "auto"},
      slides:it.slides, role:it.role, keywords:it.keywords}))};
}
function resourceHTML(list){
  const cols = sheetGrid(list.length);
  const cell = (it, i) => `<figure>${render(it, pv, {idp:"rp" + it.uid})}<figcaption>${esc(it.id)}<small>${esc(searchOf(it))}</small></figcaption></figure>`;
  const grp = [["slot", "Used in this deck"], ["extra", "Extra icons in the same set"]].map(([r, lab]) => { const g = list.filter(i => (i.role === "extra" ? "extra" : "slot") === r); return g.length ? `${list.some(i => i.role === "extra") ? `<h2>${lab} · ${g.length}</h2>` : ""}<div class="g">${g.map(cell).join("")}</div>` : ""; }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resource Page</title><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#141414}main{padding:40px}h1{font-size:40px;margin:0 0 6px;font-weight:600}p{color:#5E6068;margin:0 0 28px}.g{display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:22px 14px}figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:8px}svg{width:72px;height:72px}figcaption{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#5E6068;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}small{font-size:9px;color:#8B8D96}h2{font-size:16px;color:#5E6068;margin:28px 0 14px;font-weight:600}</style></head><body><main><h1>Resource Page</h1><p>${esc((man && man.resource && man.resource.description) || "Use these icons to add clarity to your presentation.")}</p>${grp}</main></body></html>`;
}
const LICENSES = `Ikon dalam pack ini dirakit dengan Template Icon Builder.\nSebagian bentuk dasar berasal dari:\n- Lucide (https://lucide.dev) — ISC License, © Lucide Contributors\n- Tabler Icons (https://tabler.io/icons) — MIT License, © Paweł Kuna\n- Hugeicons Free (https://hugeicons.com) — MIT License, © Hugeicons\nPaket Hugeicons Pro tidak digunakan.\n- Library Kustom (cu:) — digambar ulang sendiri, bukan dari pustaka pihak ketiga\nKonversi stroke ke shape menggunakan:\n- unstroke — MIT License, © Paweł Kuna\n- clipper-lib — Boost Software License\nSetiap ikon adalah gabungan objek + pengubah, digambar ulang dengan gaya Icon Composer:\n- aksen/: garis 3,5 ujung bulat, celah knockout 1,25, wadah tinta + bagian aksen, penanda di depan\n- garis-solid/ dan solid-garis/: garis 2, celah knockout 2, dua warna\n`;
/* kolom metadata: header tanpa kutip, sama dengan legacy 1.6.0 */
const CANVA_COLUMNS = ["filename","title","keywords","Artist","locale","description"];
const INTERNAL_COLUMNS = ["file","id","style","title_en","title_id","keywords_en","keywords_id","search","pack","slides","role","main","modifier"];
async function doExport(){
  const list = exportList();
  const styles = MODES.filter(m => $("ex" + m).checked);
  if (!list.length || !styles.length) return;
  if (!window.JSZip){ $("exStatus").textContent = "JSZip tidak termuat. Periksa koneksi internet."; return; }
  $("exStatus").textContent = "Mengambil tag pustaka untuk kata kunci…";
  await loadTags();
  const N = +$("exKw").value, files = {}, base = kebab2($("exName").value) || "icon-pack", outline = true;
  const locale = $("exLocale").value === "id" ? "id" : "en";
  const artist = $("exCreator").value === "chital" ? "chital" : "hashtagben", description = $("exDescription").value.trim();
  const canvaRows = [];
  const filenames = new Set();
  for (const it of list) for (const s of styles){
    const filename = `${it.id}-${MODE_INFO[s].dir}.svg`;
    if (filenames.has(filename)){
      $("exStatus").textContent = `Ekspor dibatalkan: nama file duplikat ${filename}. Ubah ID ikon sebelum mengekspor.`;
      return;
    }
    filenames.add(filename);
  }
  const rows = [];
  try {
    list.forEach((it, i) => styles.forEach(s => {
      const f = pathOf(it, s);
      const sourceSvg = svgFile(it, s, i);
      files[f] = directFillSvgFile(sourceSvg);
      const m = meta(it, s, N);
      canvaRows.push({filename:`${it.id}-${MODE_INFO[s].dir}.svg`, title:m["title_" + locale], keywords:m["keywords_" + locale], Artist:artist, locale, description});
      rows.push({file:f, id:it.id, style:MODE_INFO[s].dir, title_en:m.title_en, title_id:m.title_id, keywords_en:m.keywords_en, keywords_id:m.keywords_id, search:m.search, pack:packOf().en, slides:it.slides.join(" "), role:it.role, main:it.main, modifier:it.mod});
    }));
  } catch (error){
    $("exStatus").textContent = `Ekspor outline dibatalkan: ${error.message}`;
    return;
  }
  files["metadata.csv"] = metadataCsv(canvaRows, CANVA_COLUMNS, {quoteHeader:false});
  files["submission-profile.json"] = JSON.stringify({format:"icon-composer-submission-profile", version:1, creator_profile_id:artist, artist, stroke_output:"direct-fill", output_version:OUTPUT_VERSION, classic_engine:typeof CLASSIC_ENGINE_VERSION === "string" ? CLASSIC_ENGINE_VERSION : TIB_VERSION, svg_structure:"one-path-per-color", fill_rule:"nonzero", updates:["Overlap satu warna tidak menjadi lubang", "Stroke otomatis menjadi fill", "Mask diratakan", "Transform dan group dihapus", "Satu path per warna"]}, null, 2);
  files["metadata-internal.csv"] = metadataCsv(rows, INTERNAL_COLUMNS, {quoteHeader:false});
  files["resource-page.html"] = resourceHTML(list);
  files["manifest-final.json"] = JSON.stringify(finalManifest(list), null, 2);
  files["LICENSES.txt"] = LICENSES;
  const blob = await buildZip(window.JSZip, files);
  await saveFile(base + ".zip", blob);
  const dropped = items.filter(i => !list.includes(i)).map(i => i.id);
  $("exStatus").textContent = `${list.length} ikon × ${styles.length} gaya diekspor.` + (outline ? ` ${list.length * styles.length} SVG dikonversi menjadi shape.` : "") + (dropped.length ? ` Tidak ikut: ${dropped.join(", ")}. Hapus juga dari Resource Page di deck.` : "");
}

/* ---------- ekspor skill ---------- */
function vocabulary(){
  return {
    generator:{name:"Template Icon Builder", version:TIB_VERSION},
    style:{families:{accent:{stroke:STY.X.sw, gap:STY.X.gap, cap:STY.X.cap, fill:FILLS, marker:["line","fill"], spark:SPARKS}, classic:{stroke:STY.C.sw, gap:STY.C.gap, cap:STY.C.cap, modes:{A:MODE_INFO.A.label, B:MODE_INFO.B.label}}}, grid:48, colors:{ink:style.ink, accent:style.accent}},
    anchors:ANCHORS.filter(a => a !== "C"),
    builtin_main:Object.fromEntries(Object.entries(MAINS).filter(([k]) => !k.includes(":")).map(([k, v]) => [k, v.n])),
    builtin_mod:Object.fromEntries(Object.entries(MODS).filter(([k]) => !k.includes(":")).map(([k, v]) => [k, v.n])),
    modifier_suggestions:MOD_POOL.filter(n => luNames().has(n)).map(n => "lu:" + n),
    lucide:[...luNames()].sort(),
    tabler:[...TB_NAMES].sort(),
    hugeicons:[...hgNames()].sort(),
    custom:Object.fromEntries([...cuNames()].sort().map(n => [n, {name:(CU_DATA.icons[n].name || {}), tags:(CU_DATA.icons[n].tags || {})}]))
  };
}
function skillMd(){ return SKILL_TEMPLATE.replace(/\{\{VERSION\}\}/g, TIB_VERSION)
  .replace("{{BUILTIN_MAIN}}", Object.entries(MAINS).filter(([k]) => !k.includes(":")).map(([k, v]) => `\`${k}\` (${v.n})`).join(", "))
  .replace("{{BUILTIN_MOD}}", Object.entries(MODS).filter(([k]) => !k.includes(":")).map(([k, v]) => `\`${k}\` (${v.n})`).join(", "))
  .replace("{{MOD_POOL}}", MOD_POOL.filter(n => luNames().has(n)).map(n => "`lu:" + n + "`").join(", "))
  .replace("{{STROKE}}", String(style.sw)); }
async function exportSkill(){
  if (!window.JSZip) return toast("JSZip tidak termuat");
  const files = {
    "deck-icon-slots/SKILL.md": skillMd(),
    "deck-icon-slots/references/vocabulary.json": JSON.stringify(vocabulary()),
    "deck-icon-slots/references/example-manifest.json": JSON.stringify(SAMPLE, null, 2)
  };
  await saveFile("deck-icon-slots-skill-v" + TIB_VERSION + ".zip", await buildZip(window.JSZip, files));
}
const SKILL_TEMPLATE = "---\nname: deck-icon-slots\ndescription: Gunakan saat membuat deck presentasi atau template di Claude Design yang ikonnya akan dibuat dengan Template Icon Builder, untuk menandai slot ikon, menambah slide Resource Page, dan menulis icon-manifest.json.\n---\n\n# Deck Icon Slots · v{{VERSION}}\n\nSkill ini membuat deck siap dilengkapi ikon buatan sendiri. Ada tiga keluaran wajib:\n\n1. **Slot ikon** di slide konten: kotak kosong bertanda `data-icon` dengan label id yang terlihat, tanpa gambar ikon.\n2. **Slide Resource Page** di akhir deck: semua ikon pack dalam **satu halaman**, sebagai kotak kosong + id-nya.\n3. **`<judul-deck>-icon-manifest.json`**: resep setiap ikon untuk Template Icon Builder, termasuk tema pack untuk judul dan pencarian element. Disimpan sebagai file **dan** ditempel sebagai blok kode JSON di jawaban akhir.\n\nIkon tidak digambar di sini. Template Icon Builder merakit SVG-nya dari manifest. Gaya bawaannya **Aksen bagian**:\n- garis 3,5 dengan ujung bulat dan celah knockout 1,25;\n- wadah berwarna tinta, isi atau bidang berwarna aksen;\n- pengubah tampil sebagai penanda aksen di depan objek, dengan celah.\n\nGaya klasik (garis 2, mode Garis·solid dan Solid·garis) tetap tersedia. Setelah itu ikon di-submit sebagai element Canva. Karena itu setiap ikon harus **unik** dan **tidak menyerupai ikon yang sudah ada**.\n\n## 1. Kapan sebuah tempat diberi ikon\n\nIkon dipakai untuk **isi konten**, bukan untuk kerangka halaman. Beri ikon pada:\n- kartu fitur, tujuan, langkah, atau poin bernomor;\n- angka statistik (peserta, durasi, jumlah, metrik);\n- label persona, peran, kategori di dalam kartu;\n- item daftar yang setara dan berdiri sendiri (misalnya 3–6 keunggulan);\n- baris kontak (email, situs, telepon).\n\nJangan beri ikon pada:\n- **label bagian, eyebrow, atau kicker**, yaitu teks kecil di atas atau di samping judul slide. Contoh: \"Our product\", \"About us\", \"The problem\", \"Meshwork\". Teks seperti ini cukup tetap sebagai teks;\n- judul slide, judul besar, dan subjudul;\n- paragraf penjelasan atau pengantar halaman;\n- nama brand, logo, dan nomor halaman;\n- checklist dan tabel yang sudah punya kotak centang;\n- formulir isian dan skala nilai;\n- kutipan;\n- foto atau placeholder gambar.\n\nSatu kartu = paling banyak satu ikon. Kalau ragu, tanyakan: \"apakah ikon ini membantu membedakan isi konten dari isi konten lain di slide yang sama?\" Kalau tidak, jangan pasang.\n\n## 2. Menandai slot\n\nSetiap slot adalah kotak persegi kosong **dengan label id yang terlihat**. Label memberi tahu designer ikon mana yang dipasang di tempat itu:\n\n```html\n<div class=\"icon-slot\" data-icon=\"scan-market\" aria-label=\"Scan the market\"\n     style=\"position:relative;flex:none;width:56px;height:56px;box-sizing:border-box;border:2px dashed currentColor;border-radius:8px\">\n  <span class=\"icon-slot-label\"\n        style=\"position:absolute;left:0;top:100%;margin-top:4px;padding:0 4px;white-space:nowrap;font-family:'Courier New',monospace;font-size:12px;line-height:16px;color:#FFFFFF;background:#E2552D;border-radius:4px\">scan-market</span>\n</div>\n```\n\n- **Setiap slot wajib punya label** `icon-slot-label` berisi id yang **persis sama** dengan `data-icon`. Tanpa label, designer tidak tahu ikon mana yang dipasang di slot itu.\n- Label menempel di bawah slot (`position:absolute`), jadi tidak menggeser tata letak. Beri jarak minimal 24px antara slot dan teks di bawahnya agar label tidak menimpa teks.\n- Warna label: teks `#FFFFFF` di atas warna aksen deck (hex), supaya jelas terbaca sebagai penanda kerja, bukan isi template.\n- Label dan slot adalah penanda sementara. Saat ikon asli dipasang di Canva, designer menghapus keduanya.\n- Tidak ada SVG, emoji, atau huruf lain di dalam kotak slot selain label.\n- Ukuran slot mengikuti peran:\n  - 32 atau 40px di baris tabel atau chip;\n  - 48, 56, atau 64px di kartu;\n  - 72, 80, atau 96px di kartu besar.\n- **Konsep yang sama memakai id yang sama** di semua slide. Contoh: \"Idea sprint\" di slide 2, 6, dan 7 tetap `idea-sprint`, dan labelnya juga sama.\n- Garis slot mengikuti warna teks deck (`currentColor`).\n\n**Peta slot di jawaban akhir.** Setelah deck selesai, tulis daftar singkat di jawaban, satu baris per slide, misalnya:\n\n```\nSlide 2: scan-market, name-pain, build-mix, time-launch, project-goal\nSlide 7: product-fit, price-tag, place-reach, promo-push\n```\n\n## 3. Merakit ikon: objek utama + pengubah\n\nSetiap ikon adalah gabungan:\n- **objek utama**: kata benda, misalnya kalender, lampu, atau pengguna;\n- **pengubah**: aksi atau status, misalnya jam, plus, atau centang. Di gaya Aksen, pengubah menjadi penanda aksen di sudut, di depan objek.\n\n**Kosakata:**\n- Objek bawaan: {{BUILTIN_MAIN}}\n- Pengubah bawaan: {{BUILTIN_MOD}}\n- Lucide: `lu:<nama-kebab>`, contoh `lu:lightbulb`, `lu:users`, `lu:hammer`\n- Tabler (tanpa ikon merek): `tb:<nama-kebab>`, contoh `tb:presentation`, `tb:armchair`\n- Hugeicons Free: `hg:<nama-kebab>`, contoh `hg:analytics-01`, `hg:warehouse`, `hg:user-add-01`\n- Saran pengubah yang terbaca baik di ukuran kecil: {{MOD_POOL}}\n- Daftar lengkap ada di `references/vocabulary.json` bila tersedia. Kalau ragu sebuah nama ada atau tidak, pakai nama yang umum. Builder akan menyarankan nama terdekat.\n\n**Memilih bentuk untuk gaya Aksen:**\n- Objek utama terbaik punya **wadah tertutup** (layar, dokumen, kotak, kalender, lingkaran) dengan isi di dalamnya. Builder otomatis memberi tinta pada wadah dan aksen pada isi.\n- Pengubah terbaik adalah **glif garis sederhana**: panah, plus, centang, gembok, jam, muat ulang. Hindari pengubah yang rumit atau penuh detail.\n- Untuk konsep \"baru\", \"istimewa\", atau \"peluncuran\", pakai kilau (`accent.spark`), bukan `lu:sparkles` sebagai pengubah.\n- Jangan menumpuk pengubah pada objek yang sudah penuh detail.\n\n**Aturan keunikan (wajib):**\n1. Setiap ikon **harus punya pengubah**. Ikon pustaka tanpa pengubah sama dengan salinan.\n2. **Hindari gabungan yang sudah ada sebagai ikon pustaka.** Contoh yang dilarang: `user-plus`, `user-star`, `user-check`, `calendar-search`, `calendar-clock`, `calendar-star`, `globe-lock`, `file-check`, `mail-heart`, `heart-plus`, `message-plus`. Pilih pengubah yang menambah makna khusus konsep. Contoh: kalender + jam pasir untuk \"jadwal sesi\", bukan kalender + jam.\n3. Tidak boleh ada dua ikon dengan objek dan pengubah yang sama dalam satu pack.\n4. Objek utama dan pengubah tidak boleh benda yang sama.\n5. Dilarang memakai logo merek, huruf, atau angka sebagai objek utama.\n\n**Posisi pengubah (`anchor`):** default `BR` (kanan bawah). Pakai `TR`, `BL`, atau `TL` hanya bila detail penting objek utama ada di kanan bawah.\n\n## 4. Jumlah ikon: slot deck, ekstra hanya jika diminta\n\n**Bawaan: manifest hanya berisi ikon slot**, yaitu ikon yang benar-benar dipakai di slide konten.\n- Ikon slot: `\"role\": \"slot\"`, minimal satu nomor di `slides`.\n- Tidak ada batas jumlah ikon slot, asalkan setiap ikon bermakna, lolos aturan keunikan, dan semuanya muat di satu slide Resource Page.\n- Konsep yang muncul di beberapa slide tetap satu ikon dengan satu id.\n\n**Ikon ekstra hanya dibuat kalau prompt memintanya secara jelas**, misalnya \"tambahkan 20 ikon ekstra\". Kalau tidak diminta, jangan buat ekstra.\n- Ikon ekstra: `\"role\": \"extra\"`, `\"slides\": []`, satu tema dengan deck, dan tetap lolos aturan keunikan.\n- Ekstra **tidak dipasang di slide konten**. Ekstra hanya muncul di manifest dan di kelompok kedua Resource Page.\n- Buat sejumlah yang diminta, tidak lebih.\n\n## 5. Slide Resource Page (slide terakhir, satu halaman)\n\nTambahkan **satu** slide setelah slide konten terakhir. Contoh: deck 12 slide menjadi 13.\n\n- Ikuti gaya visual deck: latar, font, warna, aksen.\n- Judul \"Resource Page\" dan satu kalimat deskripsi (bahasa Inggris), misalnya \"Use these icons to add clarity and visual impact to your presentation.\"\n- Isi slide adalah **grid semua id di manifest**. Kalau ada ekstra, bagi dua kelompok berlabel kecil: \"Used in this deck\" (slot) lalu \"Extra icons in the same set\" (ekstra). Setiap sel berisi:\n  - kotak kosong `data-icon=\"<id>\"`, ukuran sama di semua sel;\n  - di bawahnya, caption id dengan huruf monospace kecil, misalnya `idea-sprint`.\n- Urutan: ikon slot sesuai kemunculan pertama di deck, lalu ekstra.\n- **Semua ikon harus muat di satu slide.** Kolom dan ukuran sel menyesuaikan jumlah ikon (slide 1920 × 1080):\n\n| Jumlah ikon | Kolom | Kotak ikon | Caption |\n|---|---|---|---|\n| ≤ 12 | 4 | 72px | 18px |\n| ≤ 24 | 6 | 64px | 16px |\n| ≤ 40 | 8 | 56px | 16px |\n| ≤ 60 | 10 | 48px | 14px |\n| ≤ 96 | 12 | 40px | 12px |\n| lebih dari 96 | 14 | 32px | 12px |\n\n  Kecilkan jarak antarbaris dan padding slide sebelum mengecilkan kotak. Jangan membuat \"Resource Page (2)\".\n- Caption harus **persis sama** dengan id di manifest, karena id dipakai sebagai nama file SVG dan baris metadata.\n\n## 6. Manifest ikon (`<judul-deck>-icon-manifest.json`)\n\nKeluarkan manifest dengan **dua cara sekaligus**:\n1. Simpan sebagai file di proyek dengan nama **`<judul-deck>-icon-manifest.json`**: judul deck dalam huruf kecil, kebab-case, ASCII. Contoh: deck \"Marketing Process Flow\" menjadi `marketing-process-flow-icon-manifest.json`. Nama ini mencegah manifest dari deck berbeda tertukar.\n2. **Tempel isinya utuh** sebagai satu blok kode ```json di bagian paling akhir jawaban, setelah peta slot. File di proyek tidak selalu bisa diunduh langsung, jadi blok kode ini yang disalin ke Template Icon Builder (langkah Impor, tempel di kotak teks).\n\nBlok kode harus JSON valid dan lengkap: semua ikon di manifest, tanpa dipotong, tanpa komentar, tanpa `...`.\n\n```json\n{\n  \"format\": \"tib-manifest\",\n  \"version\": 2,\n  \"skill_version\": \"{{VERSION}}\",\n  \"deck\": { \"title\": \"Creative Workshop Planner\", \"slides\": 13, \"resource_slide\": 13, \"file\": \"creative-workshop-planner-icon-manifest.json\" },\n  \"pack\": { \"en\": \"Creative Workshop\", \"id\": \"Lokakarya Kreatif\" },\n  \"style\": { \"family\": \"accent\", \"ink\": \"#141414\", \"accent\": \"#FECC33\" },\n  \"resource\": { \"description\": \"Use these icons to add clarity and visual impact to your presentation.\" },\n  \"icons\": [\n    {\n      \"id\": \"idea-sprint\",\n      \"name\": { \"en\": \"Idea sprint\", \"id\": \"Sprint ide\" },\n      \"main\": \"lu:lightbulb\",\n      \"mod\": \"lu:timer\",\n      \"anchor\": \"BR\",\n      \"accent\": { \"fill\": \"none\", \"marker\": \"line\", \"spark\": \"none\" },\n      \"slides\": [2, 6, 7],\n      \"role\": \"slot\",\n      \"keywords\": {\n        \"en\": [\"idea\", \"brainstorm\", \"sprint\", \"workshop\", \"creativity\"],\n        \"id\": [\"ide\", \"curah gagasan\", \"sprint\", \"lokakarya\", \"kreativitas\"]\n      }\n    }\n  ]\n}\n```\n\nIsi setiap kolom:\n- `pack`: **tema pack**, dipakai Builder untuk judul element dan teks pencarian Canva agar ikon pack ini tidak tercampur dengan pack lain.\n  - `pack.en`: 1 sampai 3 kata bahasa Inggris, Title Case, menggambarkan niche deck. Contoh: `Startup Pitch`, `Creative Workshop`, `Wedding Planner`.\n  - `pack.id`: terjemahan bahasa Indonesia, misalnya `Pitch Startup`.\n  - Jangan memakai nama brand atau perusahaan di deck (nama Canva Ipsum), nama alat, atau kata umum seperti `Presentation` saja.\n  - Satu tema untuk semua ikon di manifest.\n  - Builder membentuk judul `[nama ikon] [tema pack] [gaya] Icon`, misalnya `Hire Engineers Startup Pitch Accent Line Icon`, dan teks pencarian `hire engineers startup pitch`. ID brand Canva diisi di Builder, tidak ditulis di sini.\n- `deck.title`: judul utama deck, **persis sama** dengan judul di slide sampul (misalnya `Marketing Process Flow`). Builder memakainya untuk nama ZIP dan judul pack.\n- `deck.slides`: jumlah slide termasuk Resource Page. `deck.resource_slide`: nomor slide Resource Page.\n- `deck.file`: nama file manifest ini, misalnya `marketing-process-flow-icon-manifest.json`.\n- `id`: bahasa Inggris, huruf kecil, kebab-case, ASCII, unik, maksimal 40 karakter. Pakai kata yang jelas karena id juga menjadi teks pencarian, misalnya `hire-engineers`, bukan `he-01`.\n- `name.en` dan `name.id`: nama singkat dalam bahasa Inggris dan Indonesia.\n- `main`, `mod`: dari kosakata di bagian 3.\n- `anchor`: `TL`, `TC`, `TR`, `ML`, `MR`, `BL`, `BC`, atau `BR`.\n- `accent` (opsional, untuk gaya Aksen). Kalau tidak diisi, semua bernilai default.\n  - `fill`: isi bidang wadah dengan warna aksen (Cara 3).\n    - `none` (default): hanya bagian isi yang beraksen.\n    - `full`: seluruh bidang diisi.\n    - `offset`: isi digeser ke kanan bawah.\n    - `half`: separuh bawah diisi.\n    - Hanya untuk objek berwadah tertutup. Pakai di sekitar 20–30% ikon agar pack bervariasi tapi tetap satu keluarga.\n  - `marker`: bentuk penanda pengubah (Cara 4).\n    - `line` (default): glif garis.\n    - `fill`: lingkaran atau bentuk solid dengan glif dilubangi. Cocok untuk status seperti centang, peringatan, atau kunci.\n  - `spark`: kilau bintang 4 sudut, `none` (default), `star4`, atau `star4x2`. Pakai hemat, untuk konsep baru, istimewa, prestasi, atau peluncuran.\n  - `parts` dan `spark_pos` diisi oleh Builder setelah ikon disunting. Jangan ditulis di sini.\n- `offset` (opsional): geseran manual `{\"main\":[x,y],\"mod\":[x,y]}` dalam satuan grid 48. Biasanya tidak diisi. Builder menuliskannya ke `manifest-final.json` setelah ikon digeser.\n- `slides`: nomor slide tempat slot muncul. Wajib terisi untuk slot; `[]` untuk ekstra.\n- `role`: `\"slot\"` (bawaan) atau `\"extra\"` (hanya jika diminta).\n- `keywords`: 5–10 kata per bahasa, **khusus konsep ini**. Builder sudah menambahkan kata umum seperti \"icon\", \"outline\", dan nama objek.\n- `style.family`: `accent` (default) atau `classic`.\n  - Untuk `classic`, tambahkan `style.mode`: `A` (objek garis, pengubah solid) atau `B` (objek solid, pengubah garis).\n- `style.ink`: warna teks tergelap di deck.\n- `style.accent`: warna aksen utama deck, yaitu warna sorotan atau highlight paling menonjol.\n\nManifest versi 1 (tanpa `family` dan `accent`) tetap bisa dibaca Builder.\n\n## 7. Cek sebelum selesai\n\n- [ ] Tidak ada slot ikon di label bagian, eyebrow, judul, atau paragraf penjelasan.\n- [ ] Setiap slot di slide konten punya label `icon-slot-label` yang sama persis dengan `data-icon`, dan label tidak menimpa teks.\n- [ ] Setiap `data-icon` di slide ada di manifest, dan sebaliknya.\n- [ ] Jawaban akhir memuat peta slot per slide.\n- [ ] File manifest bernama `<judul-deck>-icon-manifest.json`, dan `deck.title` sama persis dengan judul sampul.\n- [ ] Jawaban akhir ditutup dengan blok kode ```json berisi manifest yang utuh dan valid.\n- [ ] Slide Resource Page hanya satu, memuat semua id, dengan caption yang sama persis.\n- [ ] Setiap ikon punya `mod`, tidak ada gabungan yang dilarang, dan tidak ada yang dobel.\n- [ ] Nilai `accent` hanya dari daftar di bagian 6, dan `fill` hanya dipakai pada objek berwadah.\n- [ ] Manifest punya `pack` (en dan id) yang spesifik ke niche deck, tanpa nama brand.\n- [ ] Nama dan kata kunci ada dalam dua bahasa.\n- [ ] Setiap ikon `slot` muncul di minimal satu slide konten. Ikon `extra` hanya ada kalau prompt memintanya, dengan `slides: []`, dan jumlahnya sesuai permintaan.\n";
const SAMPLE = {"format": "tib-manifest", "version": 2, "skill_version": "1.4.0", "deck": {"title": "Creative Workshop Planner", "slides": 13, "resource_slide": 13, "file": "creative-workshop-planner-icon-manifest.json"}, "pack": {"en": "Creative Workshop", "id": "Lokakarya Kreatif"}, "style": {"family": "accent", "ink": "#141414", "accent": "#FECC33", "mode": "A"}, "resource": {"description": "Use these icons to add clarity and visual impact to your presentation."}, "icons": [{"id": "workshop-objectives", "name": {"en": "Workshop objectives", "id": "Tujuan lokakarya"}, "main": "lu:target", "mod": "lu:check", "anchor": "BR", "slides": [1, 2], "role": "slot", "keywords": {"en": ["objectives", "goals", "workshop", "aim", "outcome"], "id": ["tujuan", "sasaran", "lokakarya", "target", "hasil"]}, "accent": {"spark": "star4"}}, {"id": "participant-personas", "name": {"en": "Participant personas", "id": "Persona peserta"}, "main": "lu:users", "mod": "lu:heart", "anchor": "BR", "slides": [1, 4], "role": "slot", "keywords": {"en": ["personas", "participants", "audience", "people", "empathy"], "id": ["persona", "peserta", "audiens", "orang", "empati"]}}, {"id": "session-schedule", "name": {"en": "Session schedule", "id": "Jadwal sesi"}, "main": "calendar", "mod": "lu:hourglass", "anchor": "BR", "slides": [1, 6], "role": "slot", "keywords": {"en": ["schedule", "agenda", "session", "timeline", "plan"], "id": ["jadwal", "agenda", "sesi", "linimasa", "rencana"]}, "accent": {"fill": "half"}}, {"id": "material-kit", "name": {"en": "Material kit", "id": "Perlengkapan bahan"}, "main": "box", "mod": "lu:scissors", "anchor": "TR", "slides": [1, 9], "role": "slot", "keywords": {"en": ["materials", "supplies", "kit", "craft", "checklist"], "id": ["bahan", "perlengkapan", "kit", "kerajinan", "daftar"]}, "accent": {"fill": "offset"}}, {"id": "session-feedback", "name": {"en": "Session feedback", "id": "Umpan balik sesi"}, "main": "chat", "mod": "lu:thumbs-up", "anchor": "BR", "slides": [1, 11], "role": "slot", "keywords": {"en": ["feedback", "review", "opinion", "survey", "evaluation"], "id": ["umpan balik", "ulasan", "pendapat", "survei", "evaluasi"]}}, {"id": "idea-sprint", "name": {"en": "Idea sprint", "id": "Sprint ide"}, "main": "lu:lightbulb", "mod": "lu:timer", "anchor": "BR", "slides": [2, 6, 7], "role": "slot", "keywords": {"en": ["idea", "brainstorm", "sprint", "creativity", "fast"], "id": ["ide", "curah gagasan", "sprint", "kreativitas", "cepat"]}, "accent": {"fill": "full"}}, {"id": "build-session", "name": {"en": "Build session", "id": "Sesi membuat"}, "main": "box", "mod": "lu:hammer", "anchor": "TR", "slides": [2, 6, 7], "role": "slot", "keywords": {"en": ["build", "prototype", "make", "model", "craft"], "id": ["membangun", "purwarupa", "membuat", "model", "kerajinan"]}}, {"id": "share-and-improve", "name": {"en": "Share and improve", "id": "Bagikan dan perbaiki"}, "main": "chat", "mod": "pencil", "anchor": "BR", "slides": [2, 6, 7], "role": "slot", "keywords": {"en": ["share", "improve", "presentation", "iterate", "comment"], "id": ["bagikan", "perbaiki", "presentasi", "iterasi", "komentar"]}}, {"id": "participant-count", "name": {"en": "Participants", "id": "Jumlah peserta"}, "main": "lu:users", "mod": "lu:hash", "anchor": "BR", "slides": [3], "role": "slot", "keywords": {"en": ["participants", "attendees", "headcount", "group", "people"], "id": ["peserta", "hadirin", "jumlah orang", "grup", "orang"]}}, {"id": "session-duration", "name": {"en": "Duration", "id": "Durasi"}, "main": "lu:hourglass", "mod": "lu:sun", "anchor": "BR", "slides": [3], "role": "slot", "keywords": {"en": ["duration", "hours", "morning", "time", "length"], "id": ["durasi", "jam", "pagi", "waktu", "lama"]}}, {"id": "exercise-count", "name": {"en": "Exercises", "id": "Jumlah latihan"}, "main": "lu:sticky-note", "mod": "lu:list-checks", "anchor": "BR", "slides": [3], "role": "slot", "keywords": {"en": ["exercises", "activities", "blocks", "tasks", "program"], "id": ["latihan", "kegiatan", "blok", "tugas", "program"]}}, {"id": "facilitator", "name": {"en": "Facilitator", "id": "Fasilitator"}, "main": "user", "mod": "lu:flag", "anchor": "BR", "slides": [3], "role": "slot", "keywords": {"en": ["facilitator", "host", "lead", "moderator", "guide"], "id": ["fasilitator", "tuan rumah", "pemimpin", "moderator", "pemandu"]}}, {"id": "marketing-lead", "name": {"en": "Marketing lead", "id": "Pimpinan pemasaran"}, "main": "lu:megaphone", "mod": "lu:user", "anchor": "BR", "slides": [4], "role": "slot", "keywords": {"en": ["marketing", "lead", "promotion", "campaign", "brand"], "id": ["pemasaran", "pimpinan", "promosi", "kampanye", "merek"]}}, {"id": "software-engineer", "name": {"en": "Software engineer", "id": "Insinyur perangkat lunak"}, "main": "laptop", "mod": "lu:wrench", "anchor": "BR", "slides": [4], "role": "slot", "keywords": {"en": ["engineer", "developer", "software", "code", "technology"], "id": ["insinyur", "pengembang", "perangkat lunak", "kode", "teknologi"]}}, {"id": "teacher", "name": {"en": "Teacher", "id": "Guru"}, "main": "book", "mod": "lu:graduation-cap", "anchor": "TR", "slides": [4], "role": "slot", "keywords": {"en": ["teacher", "education", "class", "school", "learning"], "id": ["guru", "pendidikan", "kelas", "sekolah", "belajar"]}}, {"id": "welcome", "name": {"en": "Welcome", "id": "Sambutan"}, "main": "door", "mod": "lu:hand", "anchor": "BR", "slides": [6], "role": "slot", "keywords": {"en": ["welcome", "opening", "greeting", "arrival", "start"], "id": ["sambutan", "pembukaan", "salam", "kedatangan", "mulai"]}}, {"id": "warm-up", "name": {"en": "Warm up", "id": "Pemanasan"}, "main": "lu:pen-tool", "mod": "lu:timer", "anchor": "BR", "slides": [6], "role": "slot", "keywords": {"en": ["warm up", "drawing", "icebreaker", "sketch", "activity"], "id": ["pemanasan", "menggambar", "pencair suasana", "sketsa", "kegiatan"]}}, {"id": "tea-break", "name": {"en": "Break", "id": "Istirahat"}, "main": "lu:coffee", "mod": "lu:clock", "anchor": "BR", "slides": [6], "role": "slot", "keywords": {"en": ["break", "tea", "coffee", "rest", "pause"], "id": ["istirahat", "teh", "kopi", "rehat", "jeda"]}}, {"id": "group-tables", "name": {"en": "Group tables", "id": "Meja kelompok"}, "main": "lu:users", "mod": "tb:armchair", "anchor": "BR", "slides": [8], "role": "slot", "keywords": {"en": ["tables", "groups", "seating", "room setup", "teams"], "id": ["meja", "kelompok", "tempat duduk", "tata ruang", "tim"]}}, {"id": "idea-wall", "name": {"en": "Idea wall", "id": "Dinding ide"}, "main": "tb:presentation", "mod": "lu:sticky-note", "anchor": "BR", "slides": [8], "role": "slot", "keywords": {"en": ["idea wall", "board", "sticky notes", "display", "pin up"], "id": ["dinding ide", "papan", "catatan tempel", "pajangan", "tempel"]}}, {"id": "supply-station", "name": {"en": "Supply station", "id": "Meja perlengkapan"}, "main": "box", "mod": "lu:map-pin", "anchor": "TR", "slides": [8], "role": "slot", "keywords": {"en": ["supplies", "station", "materials", "table", "setup"], "id": ["perlengkapan", "pos", "bahan", "meja", "persiapan"]}}, {"id": "visible-timer", "name": {"en": "Timer in view", "id": "Penanda waktu"}, "main": "clock", "mod": "lu:eye", "anchor": "BR", "slides": [8], "role": "slot", "keywords": {"en": ["timer", "clock", "visible", "time keeping", "countdown"], "id": ["pengatur waktu", "jam", "terlihat", "penjaga waktu", "hitung mundur"]}, "accent": {"marker": "fill"}}, {"id": "confirm-group", "name": {"en": "Confirm the group", "id": "Konfirmasi peserta"}, "main": "lu:users", "mod": "lu:send", "anchor": "BR", "slides": [10], "role": "slot", "keywords": {"en": ["confirm", "invite", "rsvp", "group", "registration"], "id": ["konfirmasi", "undangan", "rsvp", "grup", "pendaftaran"]}}, {"id": "order-and-print", "name": {"en": "Order and print", "id": "Pesan dan cetak"}, "main": "lu:printer", "mod": "lu:shopping-cart", "anchor": "BR", "slides": [10], "role": "slot", "keywords": {"en": ["order", "print", "purchase", "handouts", "prepare"], "id": ["pesan", "cetak", "beli", "lembar bagi", "persiapan"]}}, {"id": "thank-you-note", "name": {"en": "Thank you note", "id": "Ucapan terima kasih"}, "main": "lu:mail", "mod": "lu:smile", "anchor": "BR", "slides": [10], "role": "slot", "keywords": {"en": ["thank you", "appreciation", "follow up", "email", "gratitude"], "id": ["terima kasih", "apresiasi", "tindak lanjut", "email", "syukur"]}, "accent": {"fill": "full"}}, {"id": "contact-email", "name": {"en": "Email", "id": "Email"}, "main": "lu:at-sign", "mod": "lu:send", "anchor": "BR", "slides": [12], "role": "slot", "keywords": {"en": ["email", "contact", "address", "message", "inbox"], "id": ["email", "kontak", "alamat", "pesan", "kotak masuk"]}}, {"id": "contact-website", "name": {"en": "Website", "id": "Situs web"}, "main": "lu:globe", "mod": "lu:mouse-pointer-2", "anchor": "BR", "slides": [12], "role": "slot", "keywords": {"en": ["website", "web", "online", "internet", "link"], "id": ["situs web", "web", "daring", "internet", "tautan"]}}, {"id": "contact-phone", "name": {"en": "Phone", "id": "Telepon"}, "main": "phone", "mod": "lu:message-circle", "anchor": "BR", "slides": [12], "role": "slot", "keywords": {"en": ["phone", "call", "contact", "mobile", "hotline"], "id": ["telepon", "panggilan", "kontak", "ponsel", "layanan"]}}]};

/* ---------- io ---------- */
let downloads = null;
async function saveFile(filename, data){
  if (downloads){ try { await downloads.save({filename, data}); toast("Tersimpan: " + filename); } catch (e){ if (!e || e.code !== "declined") toast("Unduhan tidak bisa dibuat di sini"); } return; }
  const blob = data instanceof Blob ? data : new Blob([data]);
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("Tersimpan: " + filename);
}
let toastT; function toast(m){ const t = $("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 1800); }

/* ---------- wiring ---------- */
async function runImport(text){
  const r = importManifest(text);
  if (r.fatal){ issuesG = [["err", r.fatal]]; man = null; items = []; renderImport(); $("impIssues").innerHTML = `<div class="iss"><span class="dot err">!</span><span class="t">${esc(r.fatal)}</span></div>`; showView("import"); return; }
  if (r.needTb){ $("impIssues").innerHTML = `<div class="iss"><span class="dot warn">…</span><span class="t">Memuat Tabler…</span></div>`; await loadTabler(); }
  if (r.needHg){ $("impIssues").innerHTML = `<div class="iss"><span class="dot warn">…</span><span class="t">Memuat Hugeicons…</span></div>`; await loadHugeicons(); }
  items.forEach(ensureItem);
  issuesG = validateManifest();
  sel = items[0] ? items[0].uid : null; filter = "all";
  $("exName").value = ""; $("exStatus").textContent = "";
  persist(); showView("import"); toast(`${items.length} ikon diimpor`);
}
function setKey(it, kind, k){
  it[kind] = k;
  if (k !== "none" && LIB_RE.test(k)) ensureLucide(k, kind);
  if (kind === "mod"){ const sh = k === "none" ? [0, 0] : (SHIFT[it.slot] || [0, 0]); it.mx = sh[0]; it.my = sh[1]; }
  issuesG = validateManifest(); persist();
}
function closeCreatorMenu(){
  const root = $("exCreatorSelect"), menu = $("exCreatorMenu"), trigger = root.querySelector(".creator-trigger");
  root.classList.remove("open"); menu.hidden = true; trigger.setAttribute("aria-expanded", "false");
}
function setCreator(value){
  const creator = value === "chital" ? "chital" : "hashtagben";
  $("exCreator").value = creator; $("exArtist").value = creator; $("exCreatorLabel").textContent = creator === "chital" ? "Chital" : "hashtagben";
  $("exCreatorMenu").querySelectorAll("[data-creator]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.creator === creator)));
  closeCreatorMenu();
}
function closeLocaleMenu(){
  const root = $("exLocaleSelect"), menu = $("exLocaleMenu"), trigger = root.querySelector(".creator-trigger");
  root.classList.remove("open"); menu.hidden = true; trigger.setAttribute("aria-expanded", "false");
}
function setLocale(value){
  const locale = value === "id" ? "id" : "en";
  $("exLocale").value = locale; $("exLocaleLabel").textContent = locale === "id" ? "Indonesia (id)" : "English (en)";
  $("exLocaleMenu").querySelectorAll("[data-locale]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.locale === locale)));
  closeLocaleMenu();
}
function closeKwMenu(){
  const root = $("exKwSelect"), menu = $("exKwMenu"), trigger = root.querySelector(".creator-trigger");
  root.classList.remove("open"); menu.hidden = true; trigger.setAttribute("aria-expanded", "false");
}
function setKw(value){
  const kw = ["10", "15", "20", "25"].includes(String(value)) ? String(value) : "15";
  $("exKw").value = kw; $("exKwLabel").textContent = kw;
  $("exKwMenu").querySelectorAll("[data-kw]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.kw === kw)));
  closeKwMenu();
}
$("exCreatorSelect").querySelector(".creator-trigger").addEventListener("keydown", e => {
  if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) return;
  e.preventDefault(); const menu = $("exCreatorMenu"); menu.hidden = false; $("exCreatorSelect").classList.add("open"); e.currentTarget.setAttribute("aria-expanded", "true");
  (menu.querySelector('[aria-selected="true"]') || menu.querySelector("button")).focus();
});
$("exCreatorMenu").addEventListener("keydown", e => {
  const options = [...e.currentTarget.querySelectorAll("button")], index = options.indexOf(document.activeElement);
  if (e.key === "Escape"){ e.preventDefault(); closeCreatorMenu(); $("exCreatorSelect").querySelector(".creator-trigger").focus(); }
  if (e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); options[(index + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus(); }
});
$("exLocaleSelect").querySelector(".creator-trigger").addEventListener("keydown", e => {
  if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) return;
  e.preventDefault(); const menu = $("exLocaleMenu"); menu.hidden = false; $("exLocaleSelect").classList.add("open"); e.currentTarget.setAttribute("aria-expanded", "true");
  (menu.querySelector('[aria-selected="true"]') || menu.querySelector("button")).focus();
});
$("exLocaleMenu").addEventListener("keydown", e => {
  const options = [...e.currentTarget.querySelectorAll("button")], index = options.indexOf(document.activeElement);
  if (e.key === "Escape"){ e.preventDefault(); closeLocaleMenu(); $("exLocaleSelect").querySelector(".creator-trigger").focus(); }
  if (e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); options[(index + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus(); }
});
$("exKwSelect").querySelector(".creator-trigger").addEventListener("keydown", e => {
  if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) return;
  e.preventDefault(); const menu = $("exKwMenu"); menu.hidden = false; $("exKwSelect").classList.add("open"); e.currentTarget.setAttribute("aria-expanded", "true");
  (menu.querySelector('[aria-selected="true"]') || menu.querySelector("button")).focus();
});
$("exKwMenu").addEventListener("keydown", e => {
  const options = [...e.currentTarget.querySelectorAll("button")], index = options.indexOf(document.activeElement);
  if (e.key === "Escape"){ e.preventDefault(); closeKwMenu(); $("exKwSelect").querySelector(".creator-trigger").focus(); }
  if (e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); options[(index + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus(); }
});
document.addEventListener("pointerdown", e => { if (!e.target.closest("#exCreatorSelect")) closeCreatorMenu(); if (!e.target.closest("#exLocaleSelect")) closeLocaleMenu(); if (!e.target.closest("#exKwSelect")) closeKwMenu(); });
document.addEventListener("click", e => {
  const t = e.target.closest("button,[data-sel]"); if (!t) return;
  const d = t.dataset;
  if (d.creatorToggle !== undefined){ const menu = $("exCreatorMenu"), open = menu.hidden; closeCreatorMenu(); if (open){ menu.hidden = false; $("exCreatorSelect").classList.add("open"); t.setAttribute("aria-expanded", "true"); } return; }
  if (d.creator){ setCreator(d.creator); $("exCreatorSelect").querySelector(".creator-trigger").focus(); return; }
  if (d.localeToggle !== undefined){ const menu = $("exLocaleMenu"), open = menu.hidden; closeLocaleMenu(); if (open){ menu.hidden = false; $("exLocaleSelect").classList.add("open"); t.setAttribute("aria-expanded", "true"); } return; }
  if (d.locale){ setLocale(d.locale); $("exLocaleSelect").querySelector(".creator-trigger").focus(); return; }
  if (d.kwToggle !== undefined){ const menu = $("exKwMenu"), open = menu.hidden; closeKwMenu(); if (open){ menu.hidden = false; $("exKwSelect").classList.add("open"); t.setAttribute("aria-expanded", "true"); } return; }
  if (d.kw){ setKw(d.kw); $("exKwSelect").querySelector(".creator-trigger").focus(); return; }
  if (d.view) return showView(d.view);
  if (d.pv){ pv = d.pv; includePreviewStyleInExport(pv); persist(); return showView(view); }
  if (d.prole){ const it = curIt(); if (it){ const [i, r] = d.prole.split(":"); useStyle("X"); const info = mainInfo(it.main); it.parts = Object.fromEntries(rolesOf(it, info).map((x, j) => [j, x])); it.parts[i] = r; persist(); renderReview(); } return; }
  if (d.pauto){ const it = curIt(); if (it){ it.parts = null; persist(); renderReview(); } return; }
  if (d.under){ const it = curIt(); if (it){ it.under = d.under; persist(); renderReview(); } return; }
  if (d.mstyle){ const it = curIt(); if (it){ it.mstyle = d.mstyle; persist(); renderReview(); } return; }
  if (d.spark){ const it = curIt(); if (it){ const h = sparkHome(it.slot, d.spark); it.deco = d.spark === "none" ? {type:"none", x:9, y:9, r:0, color:"accent"} : {type:d.spark, x:(it.deco && it.deco.type !== "none") ? it.deco.x : h[0], y:(it.deco && it.deco.type !== "none") ? it.deco.y : h[1], r:0, color:"accent"}; if (d.spark === "none" && layer === "deco") layer = "main"; persist(); renderReview(); } return; }
  if (d.filter){ filter = d.filter; return renderReview(); }
  if (d.sel){ sel = d.sel; return renderReview(); }
  if (d.pt === "deco"){ layer = "deco"; renderBoard(); return renderDetail(); }
  if (d.pt){ layer = pickTarget = d.pt; pickQ = ""; if (pickTarget === "mod" && pickSrc === "in") pickSrc = "pool"; if (pickTarget === "main" && pickSrc === "pool") pickSrc = "lu"; renderBoard(); renderLib(); return renderDetail(); }
  if (d.psrc){ pickSrc = d.psrc; return renderLib(); }
  if (d.pbody){ pickBodyFilter = d.pbody; return renderLib(); }
  if (d.nudge){ const it = curIt(); if (it){ const p = posOf(it, layer); const dx = {l:-0.5, r:0.5}[d.nudge] || 0, dy = {u:-0.5, d:0.5}[d.nudge] || 0; setPos(it, layer, p[0] + dx, p[1] + dy); persist(); renderReview(); } return; }
  if (d.resetpos){ const it = curIt(); if (it){ if (layer === "main"){ const sh = it.mod !== "none" ? (SHIFT[it.slot] || [0, 0]) : [0, 0]; it.mx = sh[0]; it.my = sh[1]; } else if (layer === "deco"){ const h = sparkHome(it.slot, it.deco.type); it.deco.x = h[0]; it.deco.y = h[1]; } else { it.nx = 0; it.ny = 0; } persist(); renderReview(); } return; }
  if (d.pick){ const it = items.find(i => i.uid === sel); if (it){ setKey(it, pickTarget, d.pick); renderReview(); } return; }
  if (d.setnone){ const it = items.find(i => i.uid === sel); if (it){ setKey(it, "mod", "none"); renderReview(); } return; }
  if (d.anchor){ const it = items.find(i => i.uid === sel); if (it){ it.slot = d.anchor; it.nx = 0; it.ny = 0; const sh = SHIFT[d.anchor] || [0, 0]; it.mx = sh[0]; it.my = sh[1]; persist(); renderReview(); } return; }
  if (d.fixi){ const f = issuesG[+d.fixi]; if (f && f[2]){ const it = items.find(i => i.uid === f[2].uid); if (it) setKey(it, f[2].kind, f[2].to); renderImport(); } return; }
  if (d.cols){ sheetCols = d.cols; persist(); return renderExport(); }
});
document.addEventListener("input", e => {
  const id = e.target.id, it = items.find(i => i.uid === sel);
  if (id === "exBrand"){ try { localStorage.setItem(BRAND_KEY, e.target.value.trim()); } catch {} renderExport(); return; }
  if (id === "exPackEn" || id === "exPackId"){ if (man){ const p = packOf(); man.pack = {en: id === "exPackEn" ? e.target.value : p.en, id: id === "exPackId" ? e.target.value : p.id}; persist(); } renderExport(); return; }
  if (id === "pQ"){ pickQ = e.target.value; clearTimeout(window.__pq); window.__pq = setTimeout(renderPick, 160); return; }
  if (!it) return;
  if (id === "dX" || id === "dY"){ const p = posOf(it, layer); if (id === "dX") p[0] = +e.target.value; else p[1] = +e.target.value; setPos(it, layer, p[0], p[1]); persist(); renderBoard(); const sp = e.target.parentElement.querySelector(".sub"); if (sp) sp.textContent = e.target.value; return; }
  if (id === "dId"){ it.id = kebab2(e.target.value) || it.id; persist(); const c = document.querySelector(`[data-sel="${it.uid}"] .id`); if (c) c.textContent = it.id; }
  if (id === "dEn"){ it.name.en = e.target.value.slice(0, 60); persist(); }
  if (id === "dIdn"){ it.name.id = e.target.value.slice(0, 60); persist(); }
});
document.addEventListener("change", e => {
  const id = e.target.id;
  if (id === "dX" || id === "dY"){ renderReview(); return; }
  if (id === "dOn"){ const it = items.find(i => i.uid === sel); if (it){ it.on = e.target.checked; persist(); renderReview(); } }
  if (["exX", "exA", "exB", "exSlot", "exExtra", "exSplit", "exSkipBad", "exName"].includes(id)) renderExport();
  if (id === "dId"){ e.target.value = (items.find(i => i.uid === sel) || {}).id || ""; }
});
$("bOv").addEventListener("pointerdown", e => {
  const t = e.target.closest("[data-layer]"), it = curIt(); if (!t || !it) return;
  layer = t.dataset.layer; pickTarget = layer === "deco" ? "main" : layer;
  const r = $("board").getBoundingClientRect(), p = posOf(it, layer);
  drag = {sx:e.clientX, sy:e.clientY, f:48/r.width, x0:p[0], y0:p[1], part:t.dataset.part, moved:false};
  try { $("bOv").setPointerCapture(e.pointerId); } catch {}
  renderBoard(); renderLib(); renderDetail(); e.preventDefault();
});
$("bOv").addEventListener("pointermove", e => { const it = curIt(); if (!drag || !it) return; if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3) return; drag.moved = true; setPos(it, layer, drag.x0 + (e.clientX - drag.sx)*drag.f, drag.y0 + (e.clientY - drag.sy)*drag.f); renderBoard(); });
["pointerup", "pointercancel"].forEach(ev => $("bOv").addEventListener(ev, () => {
  if (!drag) return;
  const it = curIt();
  if (ev === "pointerup" && !drag.moved && drag.part != null && pv === "X" && it) cycleRole(it, +drag.part);
  drag = null; persist(); renderReview();
}));
$("doImport").onclick = async () => { isSample = false; await runImport($("src").value); };
$("loadSample").onclick = async () => { $("src").value = JSON.stringify(SAMPLE, null, 2); await runImport($("src").value); isSample = true; persist(); showView("import"); };
$("goReview").onclick = () => showView("review");
$("exGo").onclick = doExport;
$("skillBtn").onclick = exportSkill;
$("drop").addEventListener("click", () => $("file").click());
$("drop").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); $("file").click(); } });
$("file").addEventListener("change", async e => { const f = e.target.files[0]; if (f){ const t = await f.text(); $("src").value = t; isSample = false; runImport(t); } e.target.value = ""; });
["dragover", "dragenter"].forEach(ev => $("drop").addEventListener(ev, e => { e.preventDefault(); $("drop").classList.add("on"); }));
["dragleave", "drop"].forEach(ev => $("drop").addEventListener(ev, e => { e.preventDefault(); $("drop").classList.remove("on"); }));
$("drop").addEventListener("drop", async e => { const f = e.dataTransfer.files[0]; if (f){ const t = await f.text(); $("src").value = t; isSample = false; runImport(t); } });

/* ---------- boot ---------- */
(function boot(){
  try {
    const j = JSON.parse(localStorage.getItem(STORE) || "null");
    if (j && j.man && Array.isArray(j.items)){
      man = j.man; items = j.items; sheetCols = j.sheetCols || "auto"; isSample = !!j.isSample;
      applyManStyle(); pv = MODES.includes(j.pv) ? j.pv : pv; includePreviewStyleInExport(pv);
      $("src").value = JSON.stringify(man, null, 2);
      const needTb = items.some(it => /^tb:/.test(it.main) || /^tb:/.test(it.mod));
      const needHg = items.some(it => /^hg:/.test(it.main) || /^hg:/.test(it.mod));
      items.forEach(ensureItem); items.forEach(it => normAcc(it, null)); if (!j.v151){ items.forEach(it => { if (it.role === "extra") it.on = true; }); } issuesG = validateManifest(); sel = items[0] && items[0].uid;
      if (needTb) loadTabler().then(() => {
        for (const reg of [MAINS, MODS]) for (const k of Object.keys(reg)) if (/^tb:/.test(k) && reg[k].missing) delete reg[k];
        items.forEach(ensureItem); issuesG = validateManifest(); showView(view);
      });
      if (needHg) loadHugeicons().then(() => {
        for (const reg of [MAINS, MODS]) for (const k of Object.keys(reg)) if (/^hg:/.test(k) && reg[k].missing) delete reg[k];
        items.forEach(ensureItem); issuesG = validateManifest(); showView(view);
      });
    }
  } catch {}
  showView(items.length ? "review" : "import");
  (async () => { if (window.claude && window.claude.use){ try { downloads = await window.claude.use("downloads"); } catch {} } })();
})();
