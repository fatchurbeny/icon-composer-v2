/* eslint-disable -- Kode UI legacy dibekukan sampai Fase 2b. */
import { dedupeAttrs, partStr, r3 } from "@icon-studio/core";
import { get } from "@icon-studio/engines";
import { buildZip as buildZipFile, metadataCsv } from "@icon-studio/export";
import { decoMarkupClassic, geomClassic, modeOfClassic } from "@icon-studio/engines/classic";
import { rolesOf as rolesOfShared, ROLES, createLibraryShapes, setMeasureHost, svgParts, bbOf, measureNode, analyzeLibraryIcon, mainInfoOf, modShapeOf, autoRoles, isClosed, unionBB, inBB, touchBB, luPartSvg } from "@icon-studio/engines/shared";
import { modPreviewAccent as modPreviewAccentEngine } from "@icon-studio/engines/accent";
import { MAIN_ALIAS, MOD_ALIAS, createIconSources, libNameOf } from "@icon-studio/icon-sources";
import { CAT_ID, ID_EN, LU_CATS, TB_CATS, TB_CAT_ID } from "@icon-studio/icon-sources/catalog";
"use strict";
const $ = id => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

const esc = v => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* Mains: 48-unit grid. b = outer body (closed; stroked in outline mode, filled in solid mode), s = details (always ink). "INK" = solid ink fill. */
const MAINS = {
  face:{n:"Wajah", b:`<circle cx="24" cy="26" r="15"/>`, s:`<path d="M24 11V6.5"/><circle cx="19.5" cy="24" r="1.4" fill="INK" stroke="none"/><circle cx="28.5" cy="24" r="1.4" fill="INK" stroke="none"/><path d="M22.5 30H25.5"/>`},
  doc:{n:"Dokumen", b:`<path d="M12 5H30L38 13V43H12Z"/>`, s:`<path d="M30 5V13H38"/><path d="M18 21H32M18 27H32M18 33H26"/>`},
  clock:{n:"Jam", b:`<circle cx="24" cy="24" r="16"/>`, s:`<path d="M24 14V24H31"/>`},
  bell:{n:"Lonceng", b:`<path d="M13 34V22A11 11 0 0 1 35 22V34Z"/>`, s:`<path d="M8 34H40"/><path d="M24 7V11"/><path d="M20.5 38.5A3.5 3.5 0 0 0 27.5 38.5"/>`},
  cart:{n:"Troli", b:`<path d="M12.5 16H40.5L36.5 32H15.5Z"/>`, s:`<path d="M5 9H10.5L15.5 32"/><circle cx="18.5" cy="39" r="2.5"/><circle cx="33.5" cy="39" r="2.5"/>`},
  box:{n:"Kotak", b:`<path d="M8 18H32V41H8Z"/>`, s:`<path d="M8 18L14 11H38L32 18"/><path d="M38 11V34L32 41"/><path d="M17 11L11 18"/><path d="M20 23V27"/>`},
  truck:{n:"Truk", b:`<path d="M21 33H5V24L10 17H21Z"/>`, s:`<path d="M5 33H43"/><circle cx="12" cy="37" r="3.5"/><circle cx="34" cy="37" r="3.5"/><path d="M10 22V25H16"/>`},
  door:{n:"Pintu", b:`<path d="M13 42V6H35V42Z"/>`, s:`<path d="M6 42H42"/><path d="M18 22V26"/>`},
  heart:{n:"Hati", b:`<path d="M24 40L9.5 25.5A8.2 8.2 0 0 1 24 15.2A8.2 8.2 0 0 1 38.5 25.5Z"/>`, s:``},
  ticket:{n:"Tiket", b:`<path d="M5 13H43V20A4 4 0 0 0 43 28V35H5V28A4 4 0 0 0 5 20Z"/>`, s:`<path d="M31 16V32" stroke-dasharray="2.5 2.5"/>`},
  laptop:{n:"Laptop", b:`<path d="M10 11H38V31H10Z"/>`, s:`<path d="M4 36H44"/><path d="M21 36V34H27V36"/>`},
  chat:{n:"Obrolan", b:`<path d="M7 9H41V33H23L15 40V33H7Z"/>`, s:`<path d="M15 18H33M15 24H27"/>`},
  home:{n:"Rumah", b:`<path d="M11 41V19L24 8.5L37 19V41Z"/>`, s:`<path d="M7 22L24 8L41 22"/><path d="M20 41V31H28V41"/>`},
  pot:{n:"Panci", b:`<path d="M9 22H39V34A6 6 0 0 1 33 40H15A6 6 0 0 1 9 34Z"/>`, s:`<path d="M9 26H4V31H9M39 26H44V31H39"/><path d="M6 22H42"/>`},
  book:{n:"Buku", b:`<path d="M10 6H34V42H10Z"/>`, s:`<path d="M15 6V42"/><path d="M20 14H29M20 19H29M20 24H25"/>`},
  pin:{n:"Lokasi", b:`<path d="M24 42S11 29.5 11 20A13 13 0 0 1 37 20C37 29.5 24 42 24 42Z"/>`, s:`<circle cx="24" cy="20" r="4.5"/>`},
  user:{n:"Pengguna", b:`<circle cx="24" cy="16" r="8"/><path d="M8 41A16 16 0 0 1 40 41Z"/>`, s:``},
  calendar:{n:"Kalender", b:`<path d="M7 11H41V41H7Z"/>`, s:`<path d="M7 19H41"/><path d="M15 6V14M33 6V14"/><path d="M14 27H18M22 27H26M30 27H34M14 34H18M22 34H26"/>`},
  phone:{n:"Ponsel", b:`<path d="M14 4H34V44H14Z"/>`, s:`<path d="M14 10H34M14 37H34"/><path d="M22.5 40.5H25.5"/>`},
  store:{n:"Toko", b:`<path d="M9 17V41H39V17Z"/><path d="M6 17L10 7H38L42 17Z"/>`, s:`<path d="M19 41V29H29V41"/>`}
};
/* Color modes: which layer is outline, which is solid. */
const PREFS = {
  A:{main:"outline", mod:"solid", label:"Utama garis · pengubah solid"},
  B:{main:"solid", mod:"outline", label:"Utama solid · pengubah garis"},
  C:{main:"outline", mod:"outline", label:"Keduanya garis"}
};
/* Modifiers: local coords, sil = solid silhouette (accent, also knockout), det = ink details on top. */
const MODS = {
  bubble:{n:"Obrolan", w:24,h:20, slot:"BL", sil:`<path d="M1.5 0H22.5A1.5 1.5 0 0 1 24 1.5V13.5A1.5 1.5 0 0 1 22.5 15H8L3 20V15H1.5A1.5 1.5 0 0 1 0 13.5V1.5A1.5 1.5 0 0 1 1.5 0Z"/>`, det:`<circle cx="7.5" cy="7.5" r="1.25" fill="INK" stroke="none"/><circle cx="12" cy="7.5" r="1.25" fill="INK" stroke="none"/><circle cx="16.5" cy="7.5" r="1.25" fill="INK" stroke="none"/>`},
  card:{n:"Kartu", w:24,h:16, slot:"BL", sil:`<rect width="24" height="16" rx="1.2"/>`, det:`<rect y="4" width="24" height="3" fill="INK" stroke="none"/><path d="M14 11.5H19.5"/>`},
  doc:{n:"Dokumen", w:18,h:22, slot:"BL", sil:`<path d="M0 0H12L18 6V22H0Z"/>`, det:`<path d="M12 0V6H18"/><path d="M4 13H12M4 17H9"/>`},
  lock:{n:"Gembok", w:18,h:21, slot:"BL", sil:`<rect y="8.5" width="18" height="12.5" rx="1"/>`, det:`<path d="M4 8.5V5.5A5 5 0 0 1 14 5.5V8.5"/><circle cx="9" cy="13.5" r="1.7" fill="INK" stroke="none"/><rect x="8.25" y="14" width="1.5" height="3.5" fill="INK" stroke="none"/>`},
  mail:{n:"Amplop", w:24,h:16, slot:"BL", sil:`<rect width="24" height="16" rx="0.8"/>`, det:`<path d="M0.5 0.5L12 9L23.5 0.5"/>`},
  plus:{n:"Plus", w:14,h:14, slot:"TR", sil:`<circle cx="7" cy="7" r="7"/>`, det:`<path d="M7 3.5V10.5M3.5 7H10.5"/>`},
  check:{n:"Centang", w:14,h:14, slot:"TR", sil:`<circle cx="7" cy="7" r="7"/>`, det:`<path d="M3.8 7.2L6.1 9.5L10.3 4.9"/>`},
  cross:{n:"Silang", w:14,h:14, slot:"TR", sil:`<circle cx="7" cy="7" r="7"/>`, det:`<path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"/>`},
  parcel:{n:"Paket", w:20,h:16, slot:"BR", sil:`<rect width="20" height="16" rx="0.6"/>`, det:`<rect x="8.5" width="3" height="5" fill="INK" stroke="none"/>`},
  pinm:{n:"Pin", w:14,h:20, slot:"BL", sil:`<path d="M7 20S0 12.5 0 7A7 7 0 0 1 14 7C14 12.5 7 20 7 20Z"/>`, det:`<circle cx="7" cy="7" r="2.1" fill="INK" stroke="none"/>`},
  pencil:{n:"Pensil", w:20,h:20, slot:"BR", sil:`<path d="M2 14L14 2L18 6L6 18H2Z"/>`, det:`<path d="M2 18V15L5 18Z" fill="INK" stroke="none"/><path d="M11.5 4.5L15.5 8.5"/>`},
  cone:{n:"Kerucut", w:20,h:21, slot:"BL", sil:`<path d="M7 0H13L18 18H20V21H0V18H2Z"/>`, det:`<path d="M4.6 9.5H15.4M3.2 14.5H16.8"/>`},
  clockm:{n:"Jam", w:16,h:16, slot:"BL", sil:`<circle cx="8" cy="8" r="8"/>`, det:`<path d="M7 3.8V9H11.2"/>`},
  star:{n:"Bintang", w:18,h:17, slot:"TR", sil:`<path d="M9 0L11.6 5.6L17.6 6.3L13.2 10.5L14.3 16.5L9 13.6L3.7 16.5L4.8 10.5L0.4 6.3L6.4 5.6Z"/>`, det:``},
  heartm:{n:"Hati", w:18,h:16, slot:"BL", sil:`<path d="M9 16L1.6 8.6A4.6 4.6 0 0 1 9 3.2A4.6 4.6 0 0 1 16.4 8.6Z"/>`, det:``},
  bulb:{n:"Lampu", w:16,h:21, slot:"TR", sil:`<path d="M8 0A8 8 0 0 1 12.5 14.6V16H3.5V14.6A8 8 0 0 1 8 0Z"/>`, det:`<path d="M4.5 19H11.5"/><path d="M6.2 10L8 7.5L9.8 10V16"/>`}
};


const SLOT_GLYPH = {TL:"↖",TC:"↑",TR:"↗",ML:"←",C:"·",MR:"→",BL:"↙",BC:"↓",BR:"↘"};
const SHIFT = {TL:[3,3],TC:[0,3],TR:[-3,3],ML:[3,0],MR:[-3,0],BL:[3,-3],BC:[0,-3],BR:[-3,-3]};
const DECOS = {
  speed:{n:"Gerak", d:"M-3 -2.4H3M-1.5 2.4H3", home:[4.5,34]},
  spark:{n:"Percikan", dots:true, d:"M0 -3.4V-2.6M-2.6 1.2V2M2.6 1.2V2", home:[9,8]},
  base:{n:"Dasar", d:"M-6 0H-1.5M0.8 0H6", home:[10,46]},
  burst:{n:"Sinar", d:"M0 -3.5V-1M-3.6 -2.2L-2 -0.8M3.6 -2.2L2 -0.8", home:[24,4]},
  star4:{n:"Kilau", star:true, d:"M0 -4C0.6 -1 1 -0.6 4 0C1 0.6 0.6 1 0 4C-0.6 1 -1 0.6 -4 0C-1 -0.6 -0.6 -1 0 -4Z", home:[9,9]},
  star4x2:{n:"Kilau ganda", star:true, d:"M-1 -2.5C-0.4 0.5 0 0.9 3 1.5C0 2.1 -0.4 2.5 -1 5.5C-1.6 2.5 -2 2.1 -5 1.5C-2 0.9 -1.6 0.5 -1 -2.5ZM4.5 -6C4.8 -4.5 5 -4.3 6.5 -4C5 -3.7 4.8 -3.5 4.5 -2C4.2 -3.5 4 -3.7 2.5 -4C4 -4.3 4.2 -4.5 4.5 -6Z", home:[9,10]}
};
const LINE_OPTS = [null, "#1A1A1A", "#3A3C44", "#1A73E8", "#E2552D", "#FFFFFF"];
const FILL_OPTS = [null, "#C3DC1E", "#5BA8FF", "#FFB547", "#F27BA8", "#E4E4DE"];
const LAYER_NAME = {main:"Objek utama", mod:"Pengubah", deco:"Dekorasi"};

/* ---------- state ---------- */
const STORE = "icon-composer-aksen-v1", STORE_OLD = "icon-composer-v2";
const DEFAULT_STYLE = {family:"classic", ink:"#1A1A1A", accent:"#C3DC1E", sw:2, gap:2, cap:"butt", join:"miter", pref:"A",
  colors:{main:{line:null, fill:null}, mod:{line:null, fill:null}, deco:{line:null, fill:null}},
  scale:{main:84, mod:100, deco:100},
  fx:{mode:"none", color:"#FFF0B8", dx:1.5, dy:1.5}};
/* Patokan set: warna lapisan, skala, tebal garis, celah knockout dan ujung garis
   disimpan di level set dan dipakai oleh semua ikon (tunggal maupun kombinasi). */
function normStyle(o){
  o = o || {}; const d = DEFAULT_STYLE, oc = o.colors || {}, os = o.scale || {};
  const col = l => ({line:(oc[l] && oc[l].line) || null, fill:(oc[l] && oc[l].fill) || null});
  const num = (v, dflt, mn, mx) => (typeof v === "number" && isFinite(v)) ? Math.max(mn, Math.min(mx, v)) : dflt;
  return {...d, ...o, family:o.family === "accent" ? "accent" : "classic", saved:(o.saved && typeof o.saved === "object") ? o.saved : {}, colors:{main:col("main"), mod:col("mod"), deco:col("deco")},
    scale:{main:num(os.main, d.scale.main, 60, 100), mod:num(os.mod, d.scale.mod, 50, 150), deco:num(os.deco, d.scale.deco, 50, 200)},
    fx:{mode:["none","soft","shadow"].includes((o.fx || {}).mode) ? o.fx.mode : "none", color:/^#[0-9a-f]{6}$/i.test((o.fx || {}).color || "") ? o.fx.color.toUpperCase() : d.fx.color,
        dx:num((o.fx || {}).dx, d.fx.dx, -4, 4), dy:num((o.fx || {}).dy, d.fx.dy, -4, 4)}};
}
let style = normStyle();
let set = [];
let customs = [];   /* uploaded decorations: {id, name, vb:[x,y,w,h], inner, mono} */
let packs = [];
let luUsed = [];
let cur, editingId = null, sel = "mod", tab = "main", gridOn = true, luTarget = "main", view = "editor", mobilePanel = "components";
const uid = () => Math.random().toString(36).slice(2, 9);
function blankItem(){
  return {id:null, name:"", main:"face", mod:"bubble", slot:"BL", size:100, nx:0, ny:0, ms:84, mx:3, my:-3,
    deco:{type:"none", x:4.5, y:34, s:100, r:0, color:"ink"}, pref:"set", parts:null, under:"none", mstyle:"line",
    colors:{main:{line:null, fill:null}, mod:{line:null, fill:null}, deco:{line:null, fill:null}},
    vis:{main:true, mod:true, deco:true}};
}
function normItem(o){
  const b = blankItem();
  const it = {...b, ...o, deco:{...b.deco, ...(o.deco || {})}, vis:{...b.vis, ...(o.vis || {})},
    colors:{main:{...b.colors.main, ...((o.colors || {}).main || {})}, mod:{...b.colors.mod, ...((o.colors || {}).mod || {})}, deco:{...b.colors.deco, ...((o.colors || {}).deco || {})}}};
  if (LIB_RE.test(String(it.main))) ensureLucide(it.main, "main");
  if (LIB_RE.test(String(it.mod))) ensureLucide(it.mod, "mod");
  if (!MAINS[it.main]) it.main = "face";
  if (it.mod !== "none" && !MODS[it.mod]) it.mod = "none";
  if (!SHIFT[it.slot]) it.slot = "BL";
  if (!["none", ...Object.keys(DECOS)].includes(it.deco.type) && !(String(it.deco.type).startsWith("c:") && customs.some(c => "c:" + c.id === it.deco.type))) it.deco.type = "none";
  if (!["set","A","B","C"].includes(it.pref)) it.pref = "set";
  if (!["none","full","offset","half"].includes(it.under)) it.under = "none";
  if (!["line","fill"].includes(it.mstyle)) it.mstyle = "line";
  if (it.parts && typeof it.parts === "object"){ const p = {}; for (const [k, v] of Object.entries(it.parts)) if (/^\d+$/.test(k) && ROLES.includes(v)) p[k] = v; it.parts = Object.keys(p).length ? p : null; } else it.parts = null;
  it.name = String(it.name || "").slice(0, 60);
  it.id = it.id || uid();
  return it;
}
const clone = o => JSON.parse(JSON.stringify(o));
function persist(){ try { localStorage.setItem(STORE, JSON.stringify({style, set, customs, packs, luUsed})); } catch {} }
const PRESET = [
  {name:"Layanan obrolan", main:"face", mod:"bubble", slot:"BL"},
  {name:"Pembayaran terjadwal", main:"clock", mod:"card", slot:"BL"},
  {name:"Notifikasi surat", main:"bell", mod:"mail", slot:"BL", deco:{type:"speed", x:4.5, y:36}},
  {name:"Tambah ke troli", main:"cart", mod:"plus", slot:"TR", mx:-3, my:3},
  {name:"Pengiriman", main:"truck", mod:"parcel", slot:"TR", nx:-1, ny:5, mx:-3, my:3, deco:{type:"speed", x:20, y:15}},
  {name:"Paket di pintu", main:"door", mod:"parcel", slot:"BR", mx:-3, my:-3},
  {name:"Dokumen bermasalah", main:"doc", mod:"cone", slot:"BL"},
  {name:"Akun terkunci", main:"face", mod:"lock", slot:"BL"},
  {name:"Tiket berjangka", main:"ticket", mod:"clockm", slot:"BL"},
  {name:"Favorit baru", main:"heart", mod:"plus", slot:"TR", nx:-1, ny:2, mx:-3, my:3},
  {name:"Tulis catatan", main:"book", mod:"pencil", slot:"BR", mx:-3, my:-3},
  {name:"Lokasi pengguna", main:"face", mod:"pinm", slot:"BL", deco:{type:"base", x:9, y:46.5}},
  {name:"Selamat datang", main:"face", mod:"star", slot:"TR", mx:-3, my:3, deco:{type:"spark", x:9, y:9}},
  {name:"Konsultasi", main:"chat", mod:"check", slot:"TR", mx:-3, my:3}
];

/* ---------- pustaka ikon: logika ada di packages/icon-sources dan packages/engines/shared ---------- */
const ICONS = createIconSources({getLucide: () => window.lucide});
const SOURCES = ICONS.SOURCES, LIB_RE = ICONS.LIB_RE;
const LIB = createLibraryShapes({MAINS, MODS, SOURCES, LIB_RE});
function loadTabler(){ return ICONS.loadTabler(); }
function loadHugeicons(){ return ICONS.loadHugeicons(); }
function ensureLucide(key, kind){ return LIB.ensure(key, kind); }
let libSrc = "lu";
let libCat = "communication", libBodyFilter = "all";

/* ---------- composition engine ---------- */
/* ---------- composition engine: logika ada di packages/engines/classic ---------- */
let kid = 0;
const classicCtx = () => ({style, MAINS, MODS, PREFS, DECOS, customs, nextId: () => "k" + (++kid), decoStarFill: true});
function modeOf(it){ return modeOfClassic(it, classicCtx()); }
function geom(it){ return geomClassic(it, classicCtx()); }
function lineOf(it, l){ return style.colors[l].line || style.ink; }
function fillOf(it, l){ return style.colors[l].fill || style.accent; }
function compose(it, opt){
  if (style.family === "accent") return composeAccent(it, opt);
  return get("classic").compose(it, style, {...(opt || {}), ctx: classicCtx()});
}
function decoMarkup(it){ return decoMarkupClassic(it, classicCtx()); }

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
function rolesOf(it, info){ return rolesOfShared(it, info, null); }
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
function cycleRole(i){
  const info = mainInfo(cur.main), R = rolesOf(cur, info), p = info.parts[i]; if (!p) return;
  const seq = p.closed ? ROLES : ["ink","acc"];
  const nx = seq[(seq.indexOf(R[i]) + 1) % seq.length];
  cur.parts = Object.fromEntries(R.map((r, j) => [j, r])); cur.parts[i] = nx;
}

function boxes(it){
  const g = geom(it), ms = style.scale.main/100, d = it.deco, s = style.scale.deco/100;
  const z = {x:0, y:0, w:0, h:0};
  return {
    main: it.vis.main ? {x:24 + it.mx - 20*ms, y:24 + it.my - 20*ms, w:40*ms, h:40*ms} : z,
    mod: (g.md) ? {x:g.L, y:g.T, w:g.W, h:g.H} : z,
    deco: (it.vis.deco && d.type !== "none") ? (DECOS[d.type] && DECOS[d.type].star ? (d.type === "star4" ? {x:d.x - 4.5*s, y:d.y - 4.5*s, w:9*s, h:9*s} : {x:d.x - 5.5*s, y:d.y - 6.5*s, w:12.5*s, h:12.5*s}) : String(d.type).startsWith("c:") ? {x:d.x - 5*s, y:d.y - 5*s, w:10*s, h:10*s} : {x:d.x - 6.5*s, y:d.y - 4.5*s, w:13*s, h:9*s}) : z
  };
}
const nameOf = it => it.name || (MAINS[it.main].n + (it.mod !== "none" && MODS[it.mod] ? " + " + MODS[it.mod].n.toLowerCase() : ""));
function slug(s){ return String(s || "ikon").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "ikon"; }

/* ---------- editor rendering ---------- */
let binT;
/* hitung warna terlihat (di luar <mask>) — Canva hanya bisa mengedit maks 5 warna */
function svgColors(svg){
  const vis = svg.replace(/<mask[\s\S]*?<\/mask>/g, "");
  const set = new Set();
  for (const m of vis.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{3,8})"/g)) set.add(m[1].toUpperCase());
  return set;
}
function packColors(items){ const all = new Set(); for (const it of items) for (const c of svgColors(compose(it, {idp:"cc"}))) all.add(c); return all; }
function setChanged(){
  persist(); renderEditor();
  clearTimeout(binT); binT = setTimeout(renderBins, 120);
}
function setCurrent(it, id){ cur = clone(it); editingId = id || null; renderEditor(); }
function renderEditor(){
  $("art").innerHTML = compose(cur, {size:"100%", idp:"artmask"}).replace('width="100%" height="100%"', 'width="100%" height="100%" style="position:absolute;inset:0;width:100%;height:100%"');
  $("board").classList.toggle("grid", gridOn);
  $("iconName").textContent = nameOf(cur);
  $("metaLine").textContent = style.family === "accent" ? `garis ${style.sw} · celah ${style.gap} · aksen bagian` : `garis ${style.sw} · celah ${style.gap} · mode ${modeOf(cur)}`;
  if (document.activeElement !== $("nameIn")) $("nameIn").value = cur.name;
  renderOverlay(); renderLayers(); renderProps(); renderStrip(); renderStyleUI();
  $("crumb").textContent = ` · ${set.length} ikon di set · ${editingId ? "mengedit" : "ikon baru"}`;
  $("saveIcon").textContent = editingId ? "Perbarui di set" : "Simpan ke set";
  $("dupIcon").disabled = !editingId; $("delIcon").disabled = !editingId;
}
function renderOverlay(){
  const b = boxes(cur), sb = b[sel];
  let s = "";
  const hit = k => { const x = b[k]; return x.w ? `<rect data-layer="${k}" x="${r3(x.x-1)}" y="${r3(x.y-1)}" width="${r3(x.w+2)}" height="${r3(x.h+2)}" fill="transparent" style="cursor:move"/>` : ""; };
  s += hit("main");
  if (style.family === "accent" && sel === "main" && cur.vis.main){
    const info = mainInfo(cur.main), g = geom(cur);
    s += `<g transform="${g.mainT}">` + info.parts.map((p, i) => {
      const css = `style="fill:${p.closed ? "rgba(0,0,0,0)" : "none"};stroke:rgba(0,0,0,0);stroke-width:${r3(4/g.ms/p.k)}px;pointer-events:${p.closed ? "all" : "stroke"}"`;
      const el = p.svg.replace(/^<(\w+)/, `<$1 data-layer="main" data-part="${i}" class="hp${p.closed ? " cl" : ""}" ${css}`).replace(/ fill="INK"| stroke="none"/g, "");
      return `<g${p.k === 1 ? "" : ` transform="scale(${p.k})"`}><title>Bagian ${i + 1}: klik untuk ganti warna</title>${el}</g>`;
    }).join("") + `</g>`;
  }
  s += hit("mod") + hit("deco");
  if (sb.w){
    const lab = LAYER_NAME[sel], tw = lab.length*0.72 + 1.2, ty = sb.y - 2.4 < 0 ? sb.y + sb.h + 0.5 : sb.y - 2.4;
    s += `<rect x="${r3(sb.x)}" y="${r3(sb.y)}" width="${r3(sb.w)}" height="${r3(sb.h)}" fill="none" stroke="#3A57E8" stroke-width="0.22" stroke-dasharray="0.7 0.5" pointer-events="none"/>`;
    for (const [hx, hy] of [[sb.x, sb.y],[sb.x+sb.w, sb.y],[sb.x, sb.y+sb.h],[sb.x+sb.w, sb.y+sb.h]]) s += `<rect x="${r3(hx-0.55)}" y="${r3(hy-0.55)}" width="1.1" height="1.1" fill="#fff" stroke="#3A57E8" stroke-width="0.2" pointer-events="none"/>`;
    s += `<rect x="${r3(sb.x)}" y="${r3(ty)}" width="${r3(tw)}" height="1.9" rx="0.3" fill="#3A57E8" pointer-events="none"/><text x="${r3(sb.x+0.6)}" y="${r3(ty+1.38)}" font-size="1.25" font-family="Geist, sans-serif" font-weight="600" fill="#fff" pointer-events="none">${lab}</text>`;
  }
  $("ov").innerHTML = s;
}
const KEYS = {main:["mx","my","ms"], mod:["nx","ny","size"], deco:["x","y","s"]};
const RANGE = {main:[-12,12,60,100], mod:[-12,12,50,150], deco:[0,48,50,200]};
function getXY(layer){ const k = KEYS[layer]; return layer === "deco" ? [cur.deco.x, cur.deco.y, style.scale.deco] : [cur[k[0]], cur[k[1]], style.scale[layer]]; }
function setXY(layer, x, y){
  const R = RANGE[layer], sn = v => Math.max(R[0], Math.min(R[1], Math.round(v*2)/2));
  if (layer === "deco"){ cur.deco.x = sn(x); cur.deco.y = sn(y); } else { const k = KEYS[layer]; cur[k[0]] = sn(x); cur[k[1]] = sn(y); }
}
function setScale(layer, v){ style.scale[layer] = v; }
let drag = null;
$("ov").addEventListener("pointerdown", e => {
  const t = e.target.closest("[data-layer]"); if (!t) return;
  const layer = t.dataset.layer, rect = $("board").getBoundingClientRect(), xy = getXY(layer);
  drag = {layer, sx:e.clientX, sy:e.clientY, f:48/rect.width, x0:xy[0], y0:xy[1], part:t.dataset.part, moved:false};
  sel = layer; try { $("ov").setPointerCapture(e.pointerId); } catch {}
  renderEditor(); e.preventDefault();
});
$("ov").addEventListener("pointermove", e => { if (!drag) return; if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3 && !drag.moved) return; drag.moved = true; setXY(drag.layer, drag.x0 + (e.clientX - drag.sx)*drag.f, drag.y0 + (e.clientY - drag.sy)*drag.f); renderEditor(); });
["pointerup","pointercancel"].forEach(ev => $("ov").addEventListener(ev, e => {
  if (drag && ev === "pointerup" && !drag.moved && drag.part != null && style.family === "accent"){ cycleRole(+drag.part); drag = null; return renderEditor(); }
  drag = null;
}));
$("board").addEventListener("keydown", e => {});

function renderLayers(){
  const P = PREFS[modeOf(cur)], ACC = style.family === "accent";
  const meta = {
    deco: cur.deco.type === "none" ? "tidak ada" : (DECOS[cur.deco.type] ? DECOS[cur.deco.type].n.toLowerCase() : ((customs.find(c => "c:" + c.id === cur.deco.type) || {}).name || "dekorasi") + " (svg)") + ` · ${cur.deco.x}, ${cur.deco.y}`,
    mod: cur.mod === "none" ? "tidak ada" : `${MODS[cur.mod].n.toLowerCase()} · ${P.mod === "solid" ? "solid" : "garis"} · jangkar ${cur.slot}`,
    main: `${MAINS[cur.main].n.toLowerCase()} · ${P.main === "solid" ? "solid" : "garis"} · ${style.scale.main}%`
  };
  const chip = l => l === "deco" ? `border:1.5px dashed ${lineOf(cur,"deco")};background:#EDEDEF` : ((l === "main" ? P.main : P.mod) === "solid" ? `background:${fillOf(cur,l)}` : `border:2px solid ${lineOf(cur,l)};background:#EDEDEF`);
  if (ACC){
    meta.mod = cur.mod === "none" ? "tidak ada" : `${MODS[cur.mod].n.toLowerCase()} · penanda ${cur.mstyle === "fill" ? "isi" : "garis"} · jangkar ${cur.slot}`;
    meta.main = `${MAINS[cur.main].n.toLowerCase()} · ${cur.parts ? "warna bagian manual" : "warna bagian otomatis"}${cur.under !== "none" ? " · isi " + UNDER_NAME[cur.under].toLowerCase() : ""}`;
  }
  const chipA = l => l === "main" ? `border:2px solid ${lineOf(cur,"main")};background:linear-gradient(135deg,#EDEDEF 55%,${fillOf(cur,"main")} 55%)` : l === "mod" ? (cur.mstyle === "fill" ? `background:${fillOf(cur,"mod")}` : `border:2px solid ${fillOf(cur,"mod")};background:#EDEDEF`) : `border:1.5px dashed ${fillOf(cur,"deco")};background:#EDEDEF`;
  $("layers").innerHTML = ["deco","mod","main"].map(l => `<div class="layer${sel === l ? " on" : ""}${cur.vis[l] ? "" : " off"}">
    <button class="eye" data-eye="${l}" aria-pressed="${cur.vis[l]}" aria-label="${cur.vis[l] ? "Sembunyikan" : "Tampilkan"} ${LAYER_NAME[l].toLowerCase()}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cur.vis[l] ? '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>' : '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>'}</svg></button>
    <button class="lpick" data-sel="${l}" aria-pressed="${sel === l}"><span class="chip" style="${ACC ? chipA(l) : chip(l)}"></span><span class="lname"><b>${LAYER_NAME[l]}</b><span>${esc(meta[l])}</span></span></button></div>`).join("");
}
function renderProps(){
  $("propTitle").textContent = LAYER_NAME[sel];
  $("propMod").hidden = sel !== "mod"; $("propDeco").hidden = sel !== "deco"; $("pRbox").hidden = sel !== "deco";
  const ACC = style.family === "accent";
  $("propAccMain").hidden = !(ACC && sel === "main"); $("propAccMod").hidden = !(ACC && sel === "mod" && cur.mod !== "none");
  if (ACC && sel === "main"){
    const info = mainInfo(cur.main), R = rolesOf(cur, info);
    $("plist").innerHTML = info.parts.map((p, i) => `<div class="prow"><span class="pt">${partThumb(info, i, R)}</span><div class="seg" role="group" aria-label="Warna bagian ${i + 1}">${ROLES.map(r => `<button data-prole="${i}:${r}" aria-pressed="${R[i] === r}" ${!p.closed && r.startsWith("fill") ? "disabled" : ""}>${ROLE_NAME[r]}</button>`).join("")}</div></div>`).join("");
    const hasBody = info.parts.some(p => p.body);
    $("underSeg").innerHTML = Object.entries(UNDER_NAME).map(([k, n]) => `<button data-under="${k}" aria-pressed="${cur.under === k}" ${!hasBody && k !== "none" ? "disabled" : ""}>${n}</button>`).join("");
    $("underHint").textContent = !hasBody ? "Objek ini tidak punya bidang tertutup, jadi isi bidang tidak tersedia." : cur.under === "none" ? "Bidang objek diisi warna aksen di bawah garis tinta, dengan celah." : cur.under === "offset" ? "Isi digeser ke kanan bawah, garis tinta tetap di tempat." : cur.under === "half" ? "Hanya separuh bawah bidang yang diisi." : "Seluruh bidang diisi aksen. Bagian otomatis menjadi tinta semua.";
  }
  if (ACC && sel === "mod") document.querySelectorAll("[data-mstyle]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mstyle === cur.mstyle)));
  if (sel === "mod"){
    $("slots").innerHTML = ["TL","TC","TR","ML","C","MR","BL","BC","BR"].map(k => `<button data-slot="${k}" ${k === "C" ? "disabled" : ""} aria-pressed="${cur.mod !== "none" && cur.slot === k}" aria-label="${k === "C" ? "Tengah" : "Jangkar " + k}">${SLOT_GLYPH[k]}</button>`).join("");
  }
  if (sel === "deco"){
    const on = t => cur.deco.type === t;
    let h = Object.entries(DECOS).map(([k, d]) => `<button class="dt" data-dtype="${k}" aria-pressed="${on(k)}"><svg viewBox="-8 -8 16 16" width="22" height="22" ${d.star ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.4"'} aria-hidden="true"><path d="${d.d}"/></svg><span>${d.n}</span></button>`).join("");
    h += customs.map(c => `<button class="dt" data-dtype="c:${c.id}" aria-pressed="${on("c:" + c.id)}" title="${esc(c.name)}"><svg viewBox="${c.vb.join(" ")}" width="22" height="22" fill="currentColor" stroke="currentColor" color="currentColor" aria-hidden="true">${c.mono}</svg><span>${esc(c.name)}</span></button>`).join("");
    h += `<button class="dt" data-dtype="none" aria-pressed="${on("none")}"><svg viewBox="-8 -8 16 16" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle r="5"/><path d="M-3.5 3.5L3.5 -3.5"/></svg><span>Tanpa</span></button>`;
    h += `<button class="dt up" id="openDeco"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg><span>Unggah SVG</span></button>`;
    $("dtypes").innerHTML = h;
    $("dcolorBox").hidden = !String(cur.deco.type).startsWith("c:");
    document.querySelectorAll("[data-dcol]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.dcol === cur.deco.color)));
  }
  const xy = getXY(sel), R = RANGE[sel];
  for (const [id, v, mn, mx] of [["pX", xy[0], R[0], R[1]], ["pY", xy[1], R[0], R[1]], ["pS", xy[2], R[2], R[3]]]){ const el = $(id); el.min = mn; el.max = mx; if (document.activeElement !== el) el.value = v; $(id + "v").textContent = id === "pS" ? v + "%" : v; }
  $("pR").value = cur.deco.r; $("pRv").textContent = cur.deco.r + "°";
  /* colors */
  const P = PREFS[modeOf(cur)];
  const c = style.colors[sel];
  const sw = (k, v, dflt) => { const on = c[k] === v, shown = v || dflt, light = ["#FFFFFF","#E4E4DE","#C3DC1E","#FFB547","#F27BA8","#5BA8FF"].includes(String(shown).toUpperCase()); return `<button class="sw" data-col="${k}" data-v="${v || ""}" aria-pressed="${on}" aria-label="${v || "Ikuti warna set"}" title="${v || "Ikuti warna set"}" style="background:${shown};${v ? "width:26px" : "width:40px"};color:${light ? "#1A1A1A" : "#FFFFFF"}">${v ? "" : "Set"}</button>`; };
  $("lineSw").innerHTML = LINE_OPTS.map(v => sw("line", v, style.ink)).join("") + `<label class="sr" for="colLine">Warna garis lain</label><input class="colorin" id="colLine" type="color" value="${lineOf(cur, sel)}">`;
  $("fillSw").innerHTML = FILL_OPTS.map(v => sw("fill", v, style.accent)).join("") + `<label class="sr" for="colFill">Warna isian lain</label><input class="colorin" id="colFill" type="color" value="${fillOf(cur, sel)}">`;
  $("lineLbl").textContent = sel === "deco" ? "Warna" : "Garis";
  $("fillRow").hidden = sel === "deco" && !(String(cur.deco.type).startsWith("c:") && cur.deco.color === "accent");
  const lm = sel === "main" ? P.main : sel === "mod" ? P.mod : null;
  if (ACC){ $("lineLbl").textContent = "Tinta"; $("fillRow").hidden = false; $("colHint").textContent = sel === "main" ? "Tinta untuk garis wadah, isian untuk bagian aksen dan isi bidang." : sel === "mod" ? "Penanda memakai warna isian (aksen)." : "Kilau memakai isian, dekorasi garis memakai tinta."; return; }
  $("colHint").textContent = sel === "deco" ? "Warna dekorasi. Untuk SVG unggahan, isian dipakai saat warnanya diatur ke Isian." : (lm === "solid" ? "Lapisan ini solid: isian mengisi body, garis dipakai untuk detail." : "Lapisan ini garis: isian baru dipakai saat lapisan dibuat solid lewat mode warna.");
}
function renderStrip(){
  $("setCount").textContent = `${set.length} ikon`;
  $("strip").innerHTML = set.map((it, i) => `<button class="st" data-open="${it.id}" aria-label="Edit ${esc(nameOf(it))}" aria-current="${it.id === editingId}" title="${esc(nameOf(it))}">${compose(it, {size:44, idp:"s" + i})}</button>`).join("") || `<p class="hint">Set masih kosong. Susun ikon lalu tekan Simpan ke set.</p>`;
}
function prefMini(m){
  const ink = style.ink, acc = style.accent;
  if (m === "A") return `<svg viewBox="0 0 48 48" fill="none" stroke="${ink}" stroke-width="2.4"><defs><mask id="pmA" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/><rect x="2" y="30" width="24" height="16" rx="1.2" fill="#000" stroke="#000" stroke-width="4"/></mask></defs><g mask="url(#pmA)"><circle cx="27" cy="21" r="13.4"/><path d="M27 12.6V21H32.9"/></g><rect x="2" y="30" width="24" height="16" rx="1.2" fill="${acc}" stroke="none"/><rect x="2" y="34" width="24" height="3" fill="${ink}" stroke="none"/></svg>`;
  if (m === "B") return `<svg viewBox="0 0 48 48" fill="none" stroke="${ink}" stroke-width="2.4"><defs><mask id="pmB" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/><rect x="2" y="30" width="24" height="16" rx="1.2" fill="#000" stroke="#000" stroke-width="6.4"/></mask></defs><g mask="url(#pmB)"><circle cx="27" cy="21" r="14.4" fill="${acc}" stroke="none"/><path d="M27 12.6V21H32.9"/></g><rect x="2" y="30" width="24" height="16" rx="1.2"/><rect x="2" y="34" width="24" height="3" fill="${ink}" stroke="none"/></svg>`;
  return `<svg viewBox="0 0 48 48" fill="none" stroke="${ink}" stroke-width="2.4"><defs><mask id="pmC" maskUnits="userSpaceOnUse" x="-8" y="-8" width="64" height="64"><rect x="-8" y="-8" width="64" height="64" fill="#fff"/><rect x="2" y="30" width="24" height="16" rx="1.2" fill="#000" stroke="#000" stroke-width="6.4"/></mask></defs><g mask="url(#pmC)"><circle cx="27" cy="21" r="13.4"/><path d="M27 12.6V21H32.9"/></g><rect x="2" y="30" width="24" height="16" rx="1.2"/><rect x="2" y="34" width="24" height="3" fill="${ink}" stroke="none"/></svg>`;
}
function renderStyleUI(){
  const ACC = style.family === "accent";
  document.querySelectorAll("[data-family]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.family === style.family)));
  $("classicOnly").hidden = ACC; $("accOnly").hidden = !ACC;
  $("famHint").textContent = ACC ? "Wadah tinta, isi atau bidang aksen, penanda di depan dengan celah. Garis, celah, ujung dan skala diingat terpisah untuk tiap gaya." : "Mode warna garis dan solid seperti versi sebelumnya.";
  if (ACC){
    $("accSw").innerHTML = ACC_OPTS.map(c => `<button data-acc="${c}" aria-pressed="${style.accent.toUpperCase() === c}" style="background:${c}" aria-label="Aksen ${c}" title="${c}"></button>`).join("") + `<label class="sr" for="accIn">Warna aksen lain</label><input class="colorin" id="accIn" type="color" value="${style.accent}">`;
    const n = packColors(set.length ? set : [cur]).size;
    $("accCount").textContent = `${n} warna di set${n > 5 ? " · lebih dari 5" : ""}`; $("accCount").style.color = n > 5 ? "var(--warn)" : "";
  }
  const short = {A:"Garis · solid", B:"Solid · garis", C:"Garis · garis"};
  $("prefs").innerHTML = ["A","B","C"].map(m => `<button class="pref" data-pref="${m}" aria-pressed="${style.pref === m}" title="${PREFS[m].label}"><span class="pv">${prefMini(m)}</span><span>${short[m]}</span></button>`).join("");
  $("sSw").value = style.sw; $("sSwV").textContent = style.sw; $("sGap").value = style.gap; $("sGapV").textContent = style.gap;
  document.querySelectorAll("[data-cap]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cap === style.cap)));
  document.querySelectorAll("[data-fx]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.fx === style.fx.mode)));
  $("fxColBox").hidden = style.fx.mode === "none";
  $("fxCol").value = style.fx.color; $("fxColV").textContent = "Warna efek " + style.fx.color;
  $("fxHint").textContent = style.fx.mode === "soft" ? "Body objek utama diisi warna muda di bawah garis. Hanya berlaku saat objek utama garis." : style.fx.mode === "shadow" ? "Siluet body digeser 1,5 ke kanan bawah. Objek tanpa body tidak diberi bayangan." : "";
  const n = packColors(set.length ? set : [cur]).size;
  $("fxCount").textContent = `${n} warna di set${n > 5 ? " · lebih dari 5" : ""}`;
  $("fxCount").style.color = n > 5 ? "var(--warn)" : "";
}
function renderBins(){
  const P = PREFS[style.pref];
  const used = (kind, k) => !LIB_RE.test(k) || luUsed.includes(kind + "|" + k);
  $("mainBin").innerHTML = Object.entries(MAINS).filter(([k]) => used("main", k)).map(([k, m]) => `<button class="tile" data-main="${k}" aria-pressed="${cur.main === k}" title="${esc(m.n)}">${compose({...blankItem(), main:k, mod:"none", mx:0, my:0, ms:92, pref:"C"}, {idp:"bm" + k.replace(/\W/g, "")})}<span>${esc(m.n)}</span></button>`).join("");
  $("modBin").innerHTML = Object.entries(MODS).filter(([k]) => used("mod", k)).map(([k, m]) => `<button class="tile" data-mod="${k}" aria-pressed="${cur.mod === k}" title="${esc(m.n)}">${modPreview(k)}<span>${esc(m.n)}</span></button>`).join("");
  document.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
  $("tabMain").hidden = tab !== "main"; $("tabMod").hidden = tab !== "mod"; $("tabLu").hidden = tab !== "lu";
  void P;
}
function modPreview(key){
  if (style.family === "accent") return modPreviewAccent(key, cur && cur.mstyle);
  const md = MODS[key], sc = Math.min(30/md.w, 30/md.h), W = md.w*sc, H = md.h*sc;
  return `<svg viewBox="0 0 48 48" fill="none" stroke="${style.ink}" stroke-width="${style.sw}" stroke-linecap="${style.cap}" stroke-linejoin="${style.join}"><g transform="translate(${r3(24-W/2)} ${r3(24-H/2)}) scale(${r3(sc)})"><g fill="${style.accent}" stroke="none">${md.sil}</g><g stroke-width="${r3(style.sw*(md.badge ? 0.75 : 1)/(sc*(md.kd || 1)))}">${md.det.replace(/INK/g, style.ink)}</g></g></svg>`;
}

/* ---------- Lucide browser + pick dialog ---------- */
let luShown = 48;
function quickHasBody(node){
  return (node || []).some(([tag, attrs]) => ["circle","rect","ellipse","polygon"].includes(tag) || (tag === "path" && /[zZ]/.test((attrs && attrs.d) || "")));
}
function luList(){
  const S = SOURCES[libSrc], idx = S.index(); if (!idx) return [];
  const cat = libCat || "all", q = $("luQ").value.trim().toLowerCase();
  let names = (cat === "all" || q) ? [...idx.keys()] : (S.cats()[cat] || "").split(" ").filter(n => idx.has(n));
  if (q){
    const terms = q.split(/[,\s]+/).filter(Boolean).map(t => ID_EN[t] || t);
    names = names.map(n => { let s = 0; for (const t of terms){ if (n === t) s += 10; else if (n.startsWith(t)) s += 6; else if (n.split("-").includes(t)) s += 5; else if (n.includes(t)) s += 2; } return [n, s]; })
      .filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).map(x => x[0]);
  }
  if (libBodyFilter !== "all") names = names.filter(n => quickHasBody(idx.get(n)) === (libBodyFilter === "body"));
  return names;
}
function fillCats(){
  const S = SOURCES[libSrc], C = S.cats();
  const cats = Object.keys(C).sort((a, b) => S.catName(a).localeCompare(S.catName(b), "id"));
  if (libCat !== "all" && !C[libCat]) libCat = C[S.dflt] ? S.dflt : "all";
  const idx = S.index(), fallbackNames = new Set(Object.values(C).join(" ").split(" ").filter(Boolean));
  const options = [["all", "Semua kategori", idx ? idx.size : fallbackNames.size], ...cats.map(k => [k, S.catName(k), C[k].split(" ").filter(Boolean).length])];
  $("luCatMenu").innerHTML = options.map(([k, label, count]) => `<button type="button" role="option" data-lucat="${k}" aria-selected="${libCat === k}"><span>${esc(label)}</span><small>${count.toLocaleString("id-ID")}</small></button>`).join("");
  const current = options.find(([k]) => k === libCat) || options[0];
  $("luCatText").textContent = current ? `${current[1]} · ${current[2].toLocaleString("id-ID")}` : "Memuat kategori…";
  document.querySelectorAll("[data-libsrc]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.libsrc === libSrc)));
  document.querySelectorAll("[data-bodyfilter]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.bodyfilter === libBodyFilter)));
  $("libLic").textContent = "Klik ikon untuk melihat cara ikon diubah sebelum dipasang. " + S.lic;
  $("luQ").setAttribute("aria-label", "Cari ikon " + S.label);
}
function renderLu(){
  const S = SOURCES[libSrc], idx = S.index();
  if (!idx){
    $("luBin").innerHTML = ""; $("luMore").hidden = true;
    if (libSrc === "tb" && ICONS.tbState !== "error"){ $("luCount").textContent = "Memuat Tabler…"; loadTabler().then(() => { if (libSrc === "tb") renderLu(); }); }
    else if (libSrc === "hg" && ICONS.hgState !== "error"){ $("luCount").textContent = "Memuat Hugeicons…"; loadHugeicons().then(() => { if (libSrc === "hg"){ fillCats(); renderLu(); } }); }
    else $("luCount").textContent = `${S.label} tidak termuat. Periksa koneksi internet.`;
    return;
  }
  const names = luList();
  const filterLabel = libBodyFilter === "body" ? "punya body" : libBodyFilter === "line" ? "hanya garis" : "ikon";
  $("luCount").textContent = `${names.length.toLocaleString("id-ID")} ${filterLabel}`;
  $("luBin").innerHTML = names.slice(0, luShown).map(n => {
    const A = luAnalyze(libSrc + ":" + n);
    const hasBody = quickHasBody(A.node);
    return `<button class="tile" data-lu="${libSrc}:${n}" title="${n}"><svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${A.node.map(([t,a]) => partStr({tag:t, attrs:a})).join("")}</svg><span>${n}</span>${hasBody ? '<i class="dot"></i>' : ""}</button>`;
  }).join("") || `<p class="hint" style="grid-column:1/-1">Tidak ada ikon yang cocok. Coba kata Inggris atau kategori lain.</p>`;
  $("luMore").hidden = names.length <= luShown;
}
let lpName = null, lpRole = "main";
function openLucide(key){ lpName = LIB_RE.test(key) ? key : "lu:" + key; lpRole = sel === "mod" ? "mod" : "main"; renderLucidePick(); openModal("mLucide"); }
function renderLucidePick(){
  const A = luAnalyze(lpName); if (!A) return;
  $("lpTitle").textContent = `${A.name} · ${SOURCES[A.src].label}`;
  $("lpChip").innerHTML = A.hasBody ? `<span class="pill" style="background:var(--ok-bg);color:var(--ok);border-color:transparent">Body ditemukan</span>` : `<span class="pill" style="background:var(--warn-bg);color:var(--warn);border-color:transparent">Tanpa body · pakai pelat</span>`;
  $("lpDesc").textContent = A.hasBody ? `Bentuk tertutup terbesar menjadi body, jadi bisa diisi warna saat solid. ${A.parts.length - A.body.length} bagian lain menjadi detail tinta.` : "Ikon ini tidak punya bidang tertutup yang cukup besar. Saat solid, ikon memakai pelat bulat di belakang garisnya.";
  const raw = A.node.map(([t,a]) => partStr({tag:t, attrs:a})).join("");
  $("lpOrig").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${raw}</svg>`;
  const bodyS = A.body.map(p => partStr(p)).join(""), detS = A.parts.filter(p => !A.body.includes(p)).map(p => partStr(p)).join("");
  $("lpRead").innerHTML = `<svg viewBox="0 0 24 24" style="position:absolute;inset:17%;width:66%;height:66%" fill="none" stroke-linecap="round" stroke-linejoin="round">${A.hasBody ? `<g fill="${style.accent}" fill-opacity="0.55" stroke="#7E9410" stroke-width="0.6" stroke-dasharray="1 0.7">${bodyS}</g>` : `<circle cx="12" cy="12" r="11.5" stroke="#B9862A" stroke-width="0.6" stroke-dasharray="1 0.7"/>`}<g stroke="#1A1A1A" stroke-width="2">${detS}</g></svg>`;
  const key = lpName; ensureLucide(key, lpRole);
  const demo = lpRole === "main" ? {...blankItem(), main:key, mod:"bubble", slot:"BL"} : {...blankItem(), main:"face", mod:key, slot:"BL"};
  $("lpResult").innerHTML = compose(normItem(demo), {idp:"lpres"});
  $("lpResTitle").textContent = lpRole === "main" ? "3 · Sebagai objek utama" : "3 · Sebagai pengubah";
  $("lpResHint").textContent = lpRole === "main" ? "Dengan pengubah obrolan sebagai contoh" : (A.hasBody ? "Body diisi warna, detail tetap tinta" : "Garis di atas pelat bulat");
  document.querySelectorAll("[data-lpr]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lpr === lpRole)));
  $("lpPartN").textContent = `${A.parts.length} bagian`;
  const rows = A.parts.map(p => { const isB = A.body.includes(p); return `<div style="display:flex;align-items:center;gap:10px;min-height:38px;padding:4px 8px;border-radius:9px;border:1px solid var(--line);background:var(--raised)"><span class="chip" style="width:14px;height:14px;${isB ? "background:" + style.accent : "border:2px solid #EDEDEF"}"></span><span style="flex:1;min-width:0" class="lname"><b class="mono" style="font-size:12px">${p.tag}</b><span>${p.closed ? "tertutup" : p.fill ? "hampir tertutup" : "terbuka"} · ${r3(p.bb.w)}×${r3(p.bb.h)}</span></span><span class="pill" style="${isB ? "background:" + style.accent + ";color:#1A1A1A;border-color:transparent" : ""}">${isB ? "Body" : "Detail"}</span></div>`; }).join("");
  $("lpParts").innerHTML = rows + (A.hasBody ? "" : `<div style="display:flex;align-items:center;gap:10px;min-height:38px;padding:4px 8px;border-radius:9px;border:1px dashed #5C4A1A"><span class="chip" style="width:14px;height:14px;border:1.5px dashed #D9A441;border-radius:50%"></span><span style="flex:1" class="lname"><b class="mono" style="font-size:12px">circle</b><span>pelat otomatis</span></span><span class="pill" style="color:var(--warn)">Pelat</span></div>`);
  $("lpModes").innerHTML = ["Garis · solid","Solid · garis","Garis · garis"].map((t, i) => `<span class="pill" style="${(!A.hasBody && ((lpRole === "main" && i === 1) || (lpRole === "mod" && i === 0))) ? "border-style:dashed;color:var(--warn)" : ""}">${t}</span>`).join("");
  $("lpUse").textContent = lpRole === "main" ? "Pasang sebagai objek utama" : "Pasang sebagai pengubah";
}
$("lpUse").onclick = () => {
  const key = lpName; ensureLucide(key, lpRole);
  const tag = lpRole + "|" + key; if (!luUsed.includes(tag)) luUsed.push(tag);
  if (lpRole === "main"){ cur.main = key; cur.parts = null; } else { cur.mod = key; cur.slot = "BL"; cur.nx = 0; cur.ny = 0; cur.mx = 3; cur.my = -3; cur.vis.mod = true; }
  closeModal("mLucide"); persist(); renderBins(); renderEditor(); toast("Dipasang: " + key.slice(3));
};
document.querySelectorAll("[data-lpr]").forEach(b => b.onclick = () => { lpRole = b.dataset.lpr; renderLucidePick(); });

/* ---------- SVG upload (decoration) ---------- */
const OK_EL = new Set(["g","path","rect","circle","ellipse","line","polyline","polygon"]);
const GEO = ["d","x","y","width","height","rx","ry","cx","cy","r","x1","y1","x2","y2","points","transform"];
const PAINT = ["fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","fill-rule","opacity","fill-opacity","stroke-opacity"];
function cleanSvg(text){
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const root = doc.documentElement;
  if (!root || root.localName !== "svg" || doc.querySelector("parsererror")) throw new Error("File itu bukan SVG yang bisa dibaca.");
  let vb = (root.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some(v => !isFinite(v)) || vb[2] <= 0 || vb[3] <= 0){ const w = parseFloat(root.getAttribute("width")) || 24, h = parseFloat(root.getAttribute("height")) || 24; vb = [0, 0, w, h]; }
  const report = {paths:0, removed:0, colors:new Set()};
  const rootFill = root.getAttribute("fill"), rootStroke = root.getAttribute("stroke"), rootSW = root.getAttribute("stroke-width");
  const out = document.implementation.createDocument(NS, "svg", null), mono = document.implementation.createDocument(NS, "svg", null);
  const walk = (src, dst, dstM) => {
    for (const ch of src.children){
      const tag = ch.localName;
      if (!OK_EL.has(tag)){ report.removed++; continue; }
      const a = out.createElementNS(NS, tag), b = mono.createElementNS(NS, tag);
      for (const k of GEO){ const v = ch.getAttribute(k); if (v != null && /^[\d\s.,eE+\-a-zA-Z()#%]*$/.test(v) && !/url|script|expression/i.test(v)){ a.setAttribute(k, v); b.setAttribute(k, v); } }
      const st = ch.getAttribute("style") || "";
      const fromStyle = k => { const m = st.match(new RegExp("(?:^|;)\\s*" + k + "\\s*:\\s*([^;]+)")); return m ? m[1].trim() : null; };
      for (const k of PAINT){
        const v = ch.getAttribute(k) || fromStyle(k);
        if (v == null || /url|script|expression/i.test(v)) continue;
        a.setAttribute(k, v);
        if (k === "fill" || k === "stroke"){ if (v !== "none"){ report.colors.add(v.toLowerCase()); b.setAttribute(k, "currentColor"); } else b.setAttribute(k, "none"); }
        else if (!/opacity/.test(k)) b.setAttribute(k, v);
      }
      if (tag !== "g") report.paths++;
      dst.append(a); dstM.append(b);
      if (tag === "g") walk(ch, a, b);
    }
  };
  walk(root, out.documentElement, mono.documentElement);
  if (!report.paths) throw new Error("Tidak ada bentuk yang bisa dipakai di file ini.");
  const ser = n => [...n.childNodes].map(c => new XMLSerializer().serializeToString(c)).join("").replace(/ xmlns="[^"]*"/g, "");
  const wrapAttrs = (fill, stroke) => `${fill != null ? ` fill="${esc(fill)}"` : ""}${stroke != null ? ` stroke="${esc(stroke)}"` : ""}${rootSW ? ` stroke-width="${esc(rootSW)}"` : ""}`;
  const inner = `<g${wrapAttrs(rootFill, rootStroke)}>${ser(out.documentElement)}</g>`;
  const monoInner = `<g${wrapAttrs(rootFill === "none" ? "none" : null, rootStroke && rootStroke !== "none" ? "currentColor" : (rootStroke === "none" ? "none" : null))}>${ser(mono.documentElement)}</g>`;
  if (rootFill && rootFill !== "none") report.colors.add(rootFill.toLowerCase());
  if (rootStroke && rootStroke !== "none") report.colors.add(rootStroke.toLowerCase());
  return {vb, inner, mono:monoInner, report};
}
let pending = null, pendingColor = "ink";
function adShow(ready){ $("adEmpty").hidden = ready; $("adReady").hidden = !ready; $("adReset").hidden = !ready; $("adAdd").disabled = !ready; }
async function adLoad(file){
  $("adErr").textContent = "";
  if (!file) return;
  if (!/\.svg$/i.test(file.name) && file.type !== "image/svg+xml"){ $("adErr").textContent = "File harus berformat .svg."; return; }
  if (file.size > 100000){ $("adErr").textContent = "File terlalu besar. Batasnya 100 KB."; return; }
  try {
    const res = cleanSvg(await file.text());
    pending = {...res, name:file.name.replace(/\.svg$/i, "").slice(0, 24) || "dekorasi", size:file.size};
    pendingColor = "ink"; $("adName").value = pending.name; adRender(); adShow(true);
  } catch(e){ $("adErr").textContent = e.message || "File tidak bisa dibaca."; }
}
function adRender(){
  const p = pending; if (!p) return;
  $("adInfo").textContent = `${(p.size/1024).toFixed(1)} KB · viewBox ${p.vb.map(v => r3(v)).join(" ")}`;
  const col = pendingColor === "accent" ? style.accent : style.ink;
  $("adPrev").innerHTML = `<svg viewBox="${p.vb.join(" ")}" style="position:absolute;inset:15%;width:70%;height:70%" ${pendingColor === "orig" ? "" : `fill="${col}" stroke="${col}" color="${col}"`}>${pendingColor === "orig" ? p.inner : p.mono}</svg>`;
  document.querySelectorAll("[data-adc]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.adc === pendingColor)));
  const tmpId = "__pending";
  customs = customs.filter(c => c.id !== tmpId); customs.push({id:tmpId, name:p.name, vb:p.vb, inner:p.inner, mono:p.mono});
  const samples = (set.length ? set.slice(0, 3) : PRESET.slice(0, 3).map(normItem));
  $("adTry").innerHTML = samples.map((it, i) => `<div class="prev">${compose({...clone(it), deco:{type:"c:" + tmpId, x:9, y:9, s:100, r:0, color:pendingColor}, vis:{main:true, mod:true, deco:true}}, {idp:"adt" + i})}</div>`).join("");
  customs = customs.filter(c => c.id !== tmpId);
  const n = p.report.colors.size;
  const row = (ok, t) => `<div class="check-row"><span class="ci ${ok ? "ok" : "warn"}">${ok ? "✓" : "!"}</span><span>${t}</span></div>`;
  $("adReport").innerHTML = row(true, `${p.report.paths} bentuk terbaca`) + row(true, p.report.removed ? `${p.report.removed} elemen tidak aman atau tidak didukung dibuang` : "Tidak ada elemen yang perlu dibuang") + row(true, "Ukuran dinormalkan ke kotak 10 unit di kanvas") + (pendingColor === "orig" ? row(n <= 1, n > 1 ? `${n} warna asli dipertahankan` : "Warna asli dipertahankan") : row(n <= 1, n > 1 ? `${n} warna asli diganti satu warna ${pendingColor === "accent" ? "aksen" : "tinta"}` : `Warna asli diganti warna ${pendingColor === "accent" ? "aksen" : "tinta"} set`));
}
$("adFile").onchange = e => { adLoad(e.target.files[0]); e.target.value = ""; };
["dragenter","dragover"].forEach(ev => $("adDrop").addEventListener(ev, e => { e.preventDefault(); $("adDrop").classList.add("over"); }));
["dragleave","drop"].forEach(ev => $("adDrop").addEventListener(ev, e => { e.preventDefault(); $("adDrop").classList.remove("over"); }));
$("adDrop").addEventListener("drop", e => { if (e.dataTransfer && e.dataTransfer.files[0]) adLoad(e.dataTransfer.files[0]); });
document.querySelectorAll("[data-adc]").forEach(b => b.onclick = () => { pendingColor = b.dataset.adc; adRender(); });
$("adReset").onclick = () => { pending = null; adShow(false); };
$("adAdd").onclick = () => {
  if (!pending) return;
  const id = uid(); customs.push({id, name:($("adName").value.trim() || pending.name).slice(0, 24), vb:pending.vb, inner:pending.inner, mono:pending.mono});
  cur.deco = {type:"c:" + id, x:9, y:9, s:100, r:0, color:pendingColor}; cur.vis.deco = true; sel = "deco";
  pending = null; closeModal("mDeco"); persist(); renderEditor(); toast("Dekorasi ditambahkan");
};

/* ---------- batch ---------- */
let bSel = {mains:["face","doc","cart"], mods:["bubble","lock","plus","card"]}, bOff = {}, bPos = "default", bMode = "set";
function renderBatch(){
  const usedOK = (kind, k) => !LIB_RE.test(k) || luUsed.includes(kind + "|" + k);
  $("bMains").innerHTML = Object.entries(MAINS).filter(([k]) => usedOK("main", k)).map(([k, m]) => `<label><input type="checkbox" data-bm="${k}" ${bSel.mains.includes(k) ? "checked" : ""}><span style="flex:1">${esc(m.n)}</span><span class="sub">${m.lu ? "lucide" : "bawaan"}</span></label>`).join("");
  $("bMods").innerHTML = Object.entries(MODS).filter(([k]) => usedOK("mod", k)).map(([k, m]) => `<label><input type="checkbox" data-bd="${k}" ${bSel.mods.includes(k) ? "checked" : ""}><span style="flex:1">${esc(m.n)}</span><span class="sub">${SLOT_GLYPH[m.slot]}</span></label>`).join("");
  $("bMainN").textContent = `${bSel.mains.length} dipilih`; $("bModN").textContent = `${bSel.mods.length} dipilih`;
  $("bTitle").textContent = `${bSel.mains.length} objek × ${bSel.mods.length} pengubah`;
  const cols = bSel.mods.length;
  let h = `<div></div>` + bSel.mods.map(d => `<div class="mhead"><span class="chip" style="width:14px;height:14px;background:${fillOf(null, "mod")}"></span>${esc(MODS[d].n)}</div>`).join("");
  let picked = 0;
  for (const m of bSel.mains){
    h += `<div class="mhead">${esc(MAINS[m].n)}</div>`;
    for (const d of bSel.mods){
      const key = m + "|" + d, on = !bOff[key]; if (on) picked++;
      h += `<button class="mcell" data-cell="${key}" aria-pressed="${on}" aria-label="${esc(MAINS[m].n)} + ${esc(MODS[d].n)}">${on ? '<span class="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7"/></svg></span>' : ""}${compose(batchItem(m, d, null), {idp:"bx" + m.replace(/\W/g,"") + d.replace(/\W/g,"")})}</button>`;
    }
  }
  $("matrix").style.gridTemplateColumns = `96px repeat(${cols}, minmax(110px, 170px))`;
  $("matrix").innerHTML = cols && bSel.mains.length ? h : `<p class="hint">Pilih minimal satu objek utama dan satu pengubah.</p>`;
  const mult = bMode === "all" && style.family !== "accent" ? 3 : 1, add = picked*mult;
  $("bPicked").textContent = `${picked} dari ${bSel.mains.length*cols} dipilih`;
  $("bAdd").textContent = `${add} ikon`; $("bAfter").textContent = `${set.length + add} ikon`;
  $("bModeHint").textContent = style.family === "accent" ? "Gaya aksen bagian: warna bagian otomatis, penanda garis. Atur per ikon di editor." : bMode === "set" ? `Semua kombinasi memakai mode warna set (${PREFS[style.pref].label.toLowerCase()}).` : "Setiap kombinasi dibuat 3 kali: garis · solid, solid · garis, dan garis · garis.";
  document.querySelectorAll("[data-bpos]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.bpos === bPos)));
  document.querySelectorAll("[data-bmode]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.bmode === bMode)));
}
function batchItem(m, d, pref){
  const slot = bPos === "default" ? MODS[d].slot : "BL";
  return normItem({main:m, mod:d, slot, mx:SHIFT[slot][0], my:SHIFT[slot][1], pref:pref || "set", name:`${MAINS[m].n} + ${MODS[d].n.toLowerCase()}${pref ? " (" + pref + ")" : ""}`});
}
$("bGo").onclick = () => {
  const prefs = bMode === "all" && style.family !== "accent" ? ["A","B","C"] : [null];
  const exists = new Set(set.map(it => it.main + "|" + it.mod + "|" + (it.pref || "set")));
  let n = 0, skipped = 0;
  for (const m of bSel.mains) for (const d of bSel.mods){
    if (bOff[m + "|" + d]) continue;
    for (const p of prefs){
      if ($("bSkip").checked && exists.has(m + "|" + d + "|" + (p || "set"))){ skipped++; continue; }
      set.push(batchItem(m, d, p)); n++;
    }
  }
  persist(); renderBatch(); $("bStatus").textContent = `${n} ikon ditambahkan${skipped ? `, ${skipped} dilewati karena sudah ada` : ""}.`; toast(`${n} ikon ditambahkan`);
};

/* ---------- review + export ---------- */
let rBg = "#FFFFFF", rSize = 64, rNames = true, rOff = {}, rFmt = "zip", rKo = "mask";
function fileNames(list){ const seen = {}; return list.map(it => { let s = slug(nameOf(it)); seen[s] = (seen[s] || 0) + 1; if (seen[s] > 1) s += "-" + seen[s]; return {it, file:s + ".svg"}; }); }
function included(){ return set.filter(it => !rOff[it.id]); }
function renderReview(){
  const dark = rBg === "#1A1B1F", cell = Math.max(96, rSize + 48);
  $("rSheet").style.background = rBg;
  $("rSheet").style.gridTemplateColumns = `repeat(auto-fill, minmax(${cell}px, 1fr))`;
  const names = fileNames(set);
  $("rSheet").innerHTML = names.map(({it, file}, i) => `<button class="rtile" data-rt="${it.id}" aria-pressed="${!!rOff[it.id]}" aria-label="${esc(nameOf(it))}" style="min-height:${cell}px;${rOff[it.id] ? "" : ""}">${compose(it, {size:rSize, idp:"rv" + i})}${rNames ? `<span class="fn" style="color:${dark ? "#A3A5AE" : "#5E6068"}">${file}</span>` : ""}</button>`).join("") || `<p class="hint">Set masih kosong.</p>`;
  $("rWarn").hidden = !dark;
  document.querySelectorAll("[data-rbg]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.rbg === rBg)));
  document.querySelectorAll("[data-rsz]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.rsz === rSize)));
  document.querySelectorAll("[data-rfmt]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.rfmt === rFmt)));
  document.querySelectorAll("[data-rko]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.rko === rKo)));
  $("rNames").setAttribute("aria-pressed", String(rNames));
  const inc = included();
  $("rCount").textContent = inc.length; $("rSkip").textContent = set.length - inc.length;
  $("rPills").innerHTML = [`grid 48`, `garis ${style.sw}`, `celah ${style.gap}`, (style.family === "accent" ? "gaya aksen bagian" : `mode ${PREFS[style.pref].label.toLowerCase()}`)].map(t => `<span class="pill">${t}</span>`).join("") + `<span class="pill" style="display:flex;gap:5px;align-items:center"><span style="width:9px;height:9px;border-radius:50%;background:${style.ink};border:1px solid #4A4C54"></span><span style="width:9px;height:9px;border-radius:50%;background:${style.accent}"></span>2 warna set</span>`;
  const checks = [];
  const multiMods = inc.filter(it => it.mod === "none").length;
  checks.push([multiMods === 0, multiMods === 0 ? "Semua ikon memakai pengubah" : `${multiMods} ikon tanpa pengubah`]);
  const dual = inc.filter(it => modeOf(it) !== style.pref).length;
  checks.push([dual === 0, dual === 0 ? "Semua ikon mengikuti mode warna set" : `${dual} ikon memakai mode warna sendiri`]);
  const pc = packColors(inc);
  checks.push([pc.size <= 5, pc.size <= 5 ? `${pc.size} warna di seluruh pack — bisa diedit di Canva (maks 5)` : `${pc.size} warna di seluruh pack — Canva hanya bisa mengedit 5 warna`]);
  checks.push([true, `Semua ikon memakai patokan set: skala ${style.scale.main}/${style.scale.mod}/${style.scale.deco}%, garis ${style.sw}, celah ${style.gap}, ujung ${style.cap === "round" ? "bulat" : "rata"}`]);
  const edge = inc.filter(it => { const b = boxes(it); return ["main","mod","deco"].some(k => b[k].w && (b[k].x < 0.5 || b[k].y < 0.5 || b[k].x + b[k].w > 47.5 || b[k].y + b[k].h > 47.5)); });
  checks.push([edge.length === 0, edge.length === 0 ? "Semua lapisan di dalam kanvas" : `${edge.map(nameOf).slice(0, 2).join(", ")}${edge.length > 2 ? " dan lainnya" : ""}: lapisan menyentuh tepi kanvas`]);
  $("rChecks").innerHTML = checks.map(([ok, t]) => `<div class="check-row"><span class="ci ${ok ? "ok" : "warn"}">${ok ? "✓" : "!"}</span><span>${esc(t)}</span></div>`).join("");
  $("rKoHint").textContent = rKo === "mask" ? "Rapi di browser dan Illustrator. Latar tetap transparan." : "Aman untuk Figma dan Canva, tapi ikon harus di atas latar putih.";
  const files = fileNames(inc);
  const base = slug($("spName").value || "set-ikon");
  $("rTree").innerHTML = rFmt === "zip"
    ? [`<span style="color:var(--fg)">${base}.zip</span>`, ...files.slice(0, 2).map(f => `<span>├─ ${f.file}</span>`), files.length > 2 ? `<span>├─ … ${files.length - 2} file lain</span>` : "", $("rJson").checked ? "<span>├─ gaya.json</span>" : "", $("rHtml").checked ? "<span>├─ pratinjau.html</span>" : "", rMeta.on ? "<span>└─ metadata.csv</span>" : ""].join("")
    : `<span style="color:var(--fg)">${base}-sprite.svg</span><span>└─ ${files.length} &lt;symbol&gt;</span>`;
  syncMetaUI(inc);
  $("rDownload").textContent = `Unduh ${inc.length} SVG`;
  $("rDownload").disabled = !inc.length;
}
/* ---------- metadata Canva untuk Chrome extension (v1.5.1, diambil dari Builder v1.6.0) ---------- */
const LU_TAGS_URL = "https://cdn.jsdelivr.net/npm/lucide-static@1.52.0/tags.json";
const TB_TAGS_URL = "https://cdn.jsdelivr.net/npm/@tabler/icons@3.49.0/icons.json";
const EN_ID = (() => {
  const d = {}; for (const [id, en] of Object.entries(ID_EN)) if (!d[en]) d[en] = id;
  return Object.assign(d, {plus:"tambah", add:"tambah", minus:"kurang", check:"centang", done:"selesai", x:"silang", close:"tutup", star:"bintang", favorite:"favorit", search:"cari", find:"temukan", clock:"jam", time:"waktu", timer:"pengatur waktu", hourglass:"jam pasir", bell:"lonceng", notification:"notifikasi", alert:"peringatan", lock:"gembok", security:"keamanan", secure:"aman", shield:"perisai", protection:"perlindungan", heart:"hati", love:"cinta", like:"suka", pencil:"pensil", edit:"sunting", write:"tulis", settings:"pengaturan", cloud:"awan", share:"bagikan", download:"unduh", upload:"unggah", refresh:"muat ulang", info:"informasi", sparkles:"kilau", magic:"ajaib", zap:"kilat", energy:"energi", eye:"mata", view:"lihat", flag:"bendera", goal:"tujuan", bookmark:"penanda", link:"tautan", user:"pengguna", users:"pengguna", person:"orang", people:"orang", team:"tim", group:"grup", message:"pesan", chat:"obrolan", comment:"komentar", gift:"hadiah", trophy:"piala", award:"penghargaan", target:"target", rocket:"roket", launch:"peluncuran", lightbulb:"bola lampu", idea:"ide", creative:"kreatif", calendar:"kalender", schedule:"jadwal", date:"tanggal", event:"acara", money:"uang", payment:"pembayaran", tag:"label", location:"lokasi", map:"peta", send:"kirim", mail:"surat", email:"email", file:"berkas", document:"dokumen", paper:"kertas", box:"kotak", package:"paket", cart:"troli", shopping:"belanja", home:"rumah", house:"rumah", phone:"telepon", book:"buku", read:"baca", learning:"belajar", education:"pendidikan", school:"sekolah", teacher:"guru", student:"siswa", presentation:"presentasi", meeting:"rapat", workshop:"lokakarya", work:"kerja", office:"kantor", tool:"alat", tools:"peralatan", build:"membangun", hammer:"palu", coffee:"kopi", break:"istirahat", sun:"matahari", morning:"pagi", leaf:"daun", nature:"alam", music:"musik", thumbs:"jempol", feedback:"umpan balik", rating:"penilaian", list:"daftar", task:"tugas", note:"catatan", sticky:"tempel", wall:"dinding", table:"meja", chair:"kursi", door:"pintu", welcome:"selamat datang", hand:"tangan", wave:"lambaian", cut:"potong", scissors:"gunting", tape:"selotip", print:"cetak", printer:"printer", outline:"garis", icon:"ikon", line:"garis", filled:"solid", solid:"solid", glyph:"glif"});
})();
let LU_TAGS = null, TB_TAGS = null;
function libName(k, kind){ return libNameOf(k, kind, MAIN_ALIAS, MOD_ALIAS); }
const SMALL = new Set(["a","an","the","and","or","of","for","to","in","on","at","by","with","vs"]);
function titleCase(s){ return String(s || "").trim().split(/\s+/).map((w, i) => i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }
async function loadTags(){
  const get = u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!LU_TAGS) LU_TAGS = await get(LU_TAGS_URL) || {};
  if (!TB_TAGS){ const j = await get(TB_TAGS_URL); TB_TAGS = {}; if (j) for (const [k, v] of Object.entries(j)) if (v && v.category !== "Brand") TB_TAGS[k] = v.tags || []; }
}
function tagsOf(k, kind){
  const n = libName(k, kind), base = n.replace(/-\d+$/, "");
  const t = [...(LU_TAGS && LU_TAGS[n] || []), ...(TB_TAGS && TB_TAGS[n] || []), ...(TB_TAGS && TB_TAGS[base] || [])];
  const STOP = new Set(["logo","brand","social","emoji","overview","projects","ui","app","web3","crypto","nft"]);
  return [...new Set([...base.split("-").filter(w => w.length > 1 && !/^\d+$/.test(w)), ...t.map(x => String(x).toLowerCase())])].filter(w => !STOP.has(w));
}
function trID(w){ if (EN_ID[w]) return EN_ID[w]; const parts = w.split(/[\s-]+/); const tr = parts.map(p => EN_ID[p]); return tr.every(Boolean) ? tr.join(" ") : null; }
const csvCell = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
const META_KEY = "icon-composer-meta-v1";
const rMeta = {on:true, artist:"hashtagben", locale:"en", packEn:"", packId:"", kw:15, desc:"", nm:"auto"};
try { Object.assign(rMeta, JSON.parse(localStorage.getItem(META_KEY) || "{}")); } catch {}
function saveMeta(){ try { localStorage.setItem(META_KEY, JSON.stringify(rMeta)); } catch {} }
function styleMeta(it){
  if (style.family === "accent") return {en:"Accent Line", id:"garis aksen", ken:["accent icon", "line icon", "two tone icon"], kid:["ikon aksen", "ikon garis", "ikon dua warna"]};
  const m = modeOf(it);
  if (m === "B") return {en:"Solid Two Tone", id:"solid dua warna", ken:["solid icon", "two tone icon"], kid:["ikon solid", "ikon dua warna"]};
  if (m === "C") return {en:"Outline", id:"garis", ken:["outline icon", "line icon"], kid:["ikon garis", "ikon outline"]};
  return {en:"Two Tone", id:"dua warna", ken:["two tone icon", "outline icon"], kid:["ikon dua warna", "ikon garis"]};
}
const libWords = (k, kind) => libName(k, kind).replace(/-\d+$/, "").replace(/-/g, " ");
function baseNameEN(it){ return [libWords(it.main, "main"), it.mod !== "none" ? libWords(it.mod, "mod") : ""].filter(Boolean).join(" "); }
/* judul: [nama ikon] [tema pack] [gaya] Icon. Nama ikon dipakai apa adanya; kosong = nama objek pustaka */
function metaOf(it){
  const N = rMeta.kw, sm = styleMeta(it), nm = String(it.name || "").trim();
  const lc = a => a.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const first = s => String(s || "").split(",")[0].trim();
  const mainT = tagsOf(it.main, "main"), modT = it.mod !== "none" ? tagsOf(it.mod, "mod") : [];
  if (rMeta.locale === "id"){
    const n = nm || nameOf(it);
    return {title:["Ikon", n.charAt(0).toLowerCase() + n.slice(1), first(rMeta.packId).toLowerCase(), sm.id].filter(Boolean).join(" "),
      keywords:[...new Set([n.toLowerCase(), ...lc(rMeta.packId.split(",")), ...[...mainT.slice(0, 6), ...modT.slice(0, 4)].map(trID).filter(Boolean), ...sm.kid, "ikon"])].slice(0, N).join(", ")};
  }
  const n = (rMeta.nm === "name" && nm) ? nm : baseNameEN(it);
  return {title:[titleCase(n), titleCase(first(rMeta.packEn)), sm.en, "Icon"].filter(Boolean).join(" "),
    keywords:[...new Set([n.toLowerCase(), ...lc(rMeta.packEn.split(",")), ...mainT.slice(0, 6), ...modT.slice(0, 4), ...sm.ken, "icon"])].slice(0, N).join(", ")};
}
/* format yang dibaca Chrome extension (mode CSV): dicocokkan per nama file SVG */
const META_COLUMNS = ["filename","title","keywords","Artist","locale","description"];
function metadataCSV(list){
  const rows = fileNames(list).map(({it, file}) => { const m = metaOf(it); return {filename:file, title:m.title, keywords:m.keywords, Artist:rMeta.artist, locale:rMeta.locale, description:rMeta.desc.trim()}; });
  return metadataCsv(rows, META_COLUMNS);
}
function syncMetaUI(inc){
  $("rMetaOn").checked = rMeta.on; $("rMetaBox").hidden = !rMeta.on;
  document.querySelectorAll("[data-mart]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mart === rMeta.artist)));
  document.querySelectorAll("[data-mloc]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mloc === rMeta.locale)));
  document.querySelectorAll("[data-mkw]").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.mkw === rMeta.kw)));
  document.querySelectorAll("[data-mnm]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.mnm === rMeta.nm)));
  for (const [id, k] of [["rPackEn", "packEn"], ["rPackId", "packId"], ["rDesc", "desc"]]) if (document.activeElement !== $(id)) $(id).value = rMeta[k];
  const f = fileNames(inc)[0];
  $("rMetaHint").innerHTML = f ? `Contoh: <span class="mono">${esc(f.file)}</span> → <b>${esc(metaOf(f.it).title)}</b><br>${rMeta.locale === "en" && rMeta.nm === "auto" ? "Otomatis (en): judul memakai nama objek pustaka dalam bahasa Inggris, karena nama ikon di set biasanya berbahasa Indonesia. Pilih <b>Nama ikon</b> bila nama sudah ditulis dalam bahasa Inggris." : rMeta.locale === "id" ? "Bahasa id: judul memakai nama ikon di set." : "Nama ikon dipakai apa adanya; nama kosong memakai nama objek pustaka."}` : "";
}

function exportSVG(it, i){ return compose(it, {mode:rKo, idp:"ko" + (i == null ? "" : i)}).replace(/ width="48" height="48"/, ' width="48" height="48"'); }
function spriteSVG(list){
  const files = fileNames(list);
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n` + files.map(({it, file}, i) => { const s = exportSVG(it, i); return `<symbol id="${file.replace(/\.svg$/, "")}" viewBox="0 0 48 48">${s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</symbol>`; }).join("\n") + `\n</svg>`;
}
function sheetHTML(list){
  const cells = fileNames(list).map(({it, file}, i) => `<figure>${exportSVG(it, i)}<figcaption>${esc(nameOf(it))}<small>${file}</small></figcaption></figure>`).join("\n");
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Set ikon</title><style>body{font-family:system-ui,sans-serif;margin:0;padding:32px 16px;background:#F6F6F3;color:#17181C}main{max-width:960px;margin:0 auto}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}figure{margin:0;background:#fff;border:1px solid #DDD;border-radius:10px;padding:20px 12px 12px;display:flex;flex-direction:column;align-items:center;gap:10px}figure svg{width:72px;height:72px}figcaption{font-size:13px;font-weight:600;text-align:center;display:flex;flex-direction:column}small{font-weight:400;color:#888;font-family:ui-monospace,monospace;font-size:11px}</style></head><body><main><h1>Set ikon</h1><div class="g">\n${cells}\n</div></main></body></html>`;
}
async function buildZip(list, base){
  if (!window.JSZip) throw new Error("Pembuat ZIP tidak termuat.");
  const files = {};
  fileNames(list).forEach(({it, file}, i) => { files[file] = exportSVG(it, i); });
  files["LICENSES.txt"] = `Sebagian bentuk dasar ikon berasal dari:\n- Lucide (https://lucide.dev) — ISC License, © Lucide Contributors\n- Tabler Icons (https://tabler.io/icons) — MIT License, © Paweł Kuna\n- Hugeicons Free (https://hugeicons.com) — MIT License, © Hugeicons\n\nPaket Hugeicons Pro tidak digunakan. Ikon dirakit ulang melalui Icon Composer.\n`;
  if ($("rJson").checked) files["gaya.json"] = JSON.stringify({grid:48, ...style, export:rKo, icons:list.map(({id, ...r}) => r)}, null, 2);
  if ($("rHtml").checked) files["pratinjau.html"] = sheetHTML(list);
  if (rMeta.on){ await loadTags(); files["metadata.csv"] = metadataCSV(list); }
  return buildZipFile(JSZip, files);
}
async function download(){
  const inc = included(); if (!inc.length) return;
  const base = slug($("spName").value || "set-ikon");
  try {
    if (rFmt === "sprite") await saveFile(base + "-sprite.svg", spriteSVG(inc));
    else await saveFile(base + ".zip", await buildZip(inc, base));
    $("rStatus").textContent = "";
  } catch(e){ $("rStatus").textContent = e.message || "Unduhan gagal dibuat."; }
}

/* ---------- save pack ---------- */
let spCover = [];
function openPack(){
  if (!$("spName").value) $("spName").value = "Set ikon";
  spCover = set.slice(0, 4).map(it => it.id);
  $("spMsg").textContent = "";
  renderPack(); openModal("mPack");
}
function renderPack(){
  $("spCover").innerHTML = set.map((it, i) => `<button type="button" class="tile" data-cov="${it.id}" aria-pressed="${spCover.includes(it.id)}" aria-label="${esc(nameOf(it))}" style="padding:2px">${compose(it, {idp:"spc" + i})}</button>`).join("");
  $("spCoverN").textContent = `${spCover.length} / 4 dipilih`;
  const covers = [0,1,2,3].map(i => set.find(it => it.id === spCover[i]));
  $("spMosaic").innerHTML = covers.map((it, i) => `<div style="background:#fff;display:grid;place-items:center">${it ? compose(it, {size:64, idp:"spm" + i}) : '<span class="sub" style="color:#9A9CA3">kosong</span>'}</div>`).join("");
  $("spCardName").textContent = $("spName").value || "Pack tanpa nama";
  $("spCardVer").textContent = $("spVer").value;
  $("spCardMeta").textContent = `${set.length} ikon · grid 48 · garis ${style.sw} · ${style.family === "accent" ? "aksen bagian" : "mode " + style.pref}`;
  $("spPackN").textContent = `${packs.length} pack`;
  $("spPacks").innerHTML = packs.map((p, i) => `<div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--panel)"><span style="width:40px;height:40px;border-radius:9px;background:#fff;flex:none;display:grid;place-items:center">${p.set[0] ? compose(normItem(p.set[0]), {size:30, idp:"pk" + i}) : ""}</span><span class="lname" style="flex:1"><b>${esc(p.name)}</b><span>${p.set.length} ikon · ${esc(p.version)} · ${new Date(p.at).toLocaleDateString("id-ID")}</span></span><button type="button" class="btn sm" data-pkopen="${i}">Buka</button><button type="button" class="btn sm ghost" data-pkdel="${i}" aria-label="Hapus pack ${esc(p.name)}">✕</button></div>`).join("") || `<p class="hint">Belum ada pack tersimpan.</p>`;
}
$("spForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!set.length){ $("spMsg").textContent = "Set masih kosong."; return; }
  const name = $("spName").value.trim() || "Set ikon";
  const p = {id:uid(), name, version:$("spVer").value.trim() || "v1.0", desc:$("spDesc").value.trim(), tags:$("spTags").value.split(",").map(t => t.trim()).filter(Boolean), cover:spCover.slice(), style:{...style}, set:clone(set), at:Date.now()};
  const i = packs.findIndex(x => x.name === p.name && x.version === p.version);
  if (i >= 0) packs[i] = p; else packs.unshift(p);
  persist(); renderPack();
  $("spMsg").textContent = `${name} ${p.version} tersimpan di Pack saya.`;
  toast("Pack tersimpan");
  if ($("spZip").checked){ try { await saveFile(slug(name) + ".zip", await buildZip(set, slug(name))); } catch(err){ $("spMsg").textContent += " ZIP gagal dibuat: " + (err.message || ""); } }
});
["spName","spVer"].forEach(id => $(id).addEventListener("input", renderPack));

/* ---------- io ---------- */
let downloads = null;
async function saveFile(filename, data){
  if (downloads){ try { await downloads.save({filename, data}); toast("Tersimpan: " + filename); } catch(e){ if (!e || e.code !== "declined") toast("Unduhan tidak bisa dibuat di sini"); } return; }
  const blob = data instanceof Blob ? data : new Blob([data], {type: filename.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("Tersimpan: " + filename);
}
async function copyText(t, msg){
  try { await navigator.clipboard.writeText(t); toast(msg); }
  catch { const ta = document.createElement("textarea"); ta.value = t; document.body.append(ta); ta.select(); try { document.execCommand("copy"); toast(msg); } catch { toast("Gagal menyalin"); } ta.remove(); }
}
let toastT; function toast(m){ const t = $("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 1800); }
let lastFocus = null;
function openModal(id){ lastFocus = document.activeElement; $(id).hidden = false; const f = $(id).querySelector("button,input,select"); if (f) f.focus(); }
function closeModal(id){ $(id).hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
document.querySelectorAll(".modal").forEach(m => {
  m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m.id); });
  m.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(m.id); });
});
function showView(v){
  view = v;
  $("vEditor").hidden = v !== "editor"; $("vBatch").hidden = v !== "batch"; $("vReview").hidden = v !== "review";
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
  document.querySelectorAll(".mobile-nav [data-mpanel]").forEach(b => b.setAttribute("aria-selected", String(v === "editor" && b.dataset.mpanel === mobilePanel)));
  document.querySelectorAll(".mobile-nav [data-view]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.view === v)));
  if (v === "editor"){ renderBins(); renderEditor(); }
  if (v === "batch") renderBatch();
  if (v === "review") renderReview();
}

/* ---------- wiring ---------- */
function setCatOpen(open){
  const root = $("luCatDrop"), menu = $("luCatMenu"), button = $("luCatBtn");
  root.classList.toggle("open", open); menu.hidden = !open; button.setAttribute("aria-expanded", String(open));
}
document.addEventListener("click", e => {
  const t = e.target.closest("button,[data-open]"); if (!t) return;
  const d = t.dataset;
  if (t.id !== "luCatBtn" && !d.lucat) setCatOpen(false);
  if (d.mpanel){ mobilePanel = d.mpanel; document.body.dataset.mobilePanel = mobilePanel; showView("editor"); window.scrollTo({top:0, behavior:"smooth"}); return; }
  if (d.view) return showView(d.view);
  if (d.tab){ tab = d.tab; renderBins(); if (tab === "lu") renderLu(); return; }
  if (d.main){ cur.main = d.main; cur.parts = null; cur.vis.main = true; renderBins(); return renderEditor(); }
  if (d.mod){ cur.mod = d.mod; const s = MODS[d.mod].slot; cur.slot = s; cur.nx = 0; cur.ny = 0; cur.mx = SHIFT[s][0]; cur.my = SHIFT[s][1]; cur.vis.mod = true; renderBins(); return renderEditor(); }
  if (d.lu) return openLucide(d.lu);
  if (t.id === "luCatBtn"){ setCatOpen($("luCatMenu").hidden); return; }
  if (d.lucat){ libCat = d.lucat; luShown = 48; setCatOpen(false); fillCats(); return renderLu(); }
  if (d.bodyfilter){ libBodyFilter = d.bodyfilter; luShown = 48; fillCats(); return renderLu(); }
  if (d.libsrc){ libSrc = d.libsrc; libCat = SOURCES[libSrc].dflt; luShown = 48; $("luQ").value = ""; fillCats(); return renderLu(); }
  if (d.eye){ cur.vis[d.eye] = !cur.vis[d.eye]; return renderEditor(); }
  if (d.sel){ sel = d.sel; return renderEditor(); }
  if (d.slot){ cur.slot = d.slot; cur.nx = 0; cur.ny = 0; cur.mx = SHIFT[d.slot][0]; cur.my = SHIFT[d.slot][1]; return renderEditor(); }
  if (d.dtype){ const h = DECOS[d.dtype] ? DECOS[d.dtype].home : [9, 9]; cur.deco = {...cur.deco, type:d.dtype, x:h[0], y:h[1], r:0}; cur.vis.deco = true; return renderEditor(); }
  if (t.id === "openDeco"){ pending = null; adShow(false); $("adErr").textContent = ""; return openModal("mDeco"); }
  if (d.dcol){ cur.deco.color = d.dcol; return renderEditor(); }
  if (d.nudge){ const [dx, dy] = d.nudge.split(",").map(Number), xy = getXY(sel); setXY(sel, xy[0] + dx, xy[1] + dy); return renderEditor(); }
  if (d.col){ style.colors[sel][d.col] = d.v || null; return setChanged(); }
  if (d.pref){ style.pref = d.pref; persist(); renderBins(); return renderEditor(); }
  if (d.fx){ style.fx.mode = d.fx; return setChanged(); }
  if (d.family){ applyFamily(d.family); renderBins(); return setChanged(); }
  if (d.acc){ style.accent = d.acc; renderBins(); return setChanged(); }
  if (d.prole){ const [i, r] = d.prole.split(":"); const info = mainInfo(cur.main); cur.parts = Object.fromEntries(rolesOf(cur, info).map((x, j) => [j, x])); cur.parts[i] = r; return renderEditor(); }
  if (d.under){ cur.under = d.under; return renderEditor(); }
  if (d.mstyle){ cur.mstyle = d.mstyle; renderBins(); return renderEditor(); }
  if (d.cap){ style.cap = d.cap; style.join = d.cap === "round" ? "round" : "miter"; return setChanged(); }
  if (d.open){ const it = set.find(x => x.id === d.open); if (it) setCurrent(it, it.id); return; }
  if (d.cell){ bOff[d.cell] = !bOff[d.cell]; return renderBatch(); }
  if (d.bpos){ bPos = d.bpos; return renderBatch(); }
  if (d.bmode){ bMode = d.bmode; return renderBatch(); }
  if (d.rbg){ rBg = d.rbg; return renderReview(); }
  if (d.rsz){ rSize = +d.rsz; return renderReview(); }
  if (d.rt){ rOff[d.rt] = !rOff[d.rt]; return renderReview(); }
  if (d.rfmt){ rFmt = d.rfmt; return renderReview(); }
  if (d.rko){ rKo = d.rko; return renderReview(); }
  if (d.cov){ const i = spCover.indexOf(d.cov); if (i >= 0) spCover.splice(i, 1); else { if (spCover.length >= 4) spCover.shift(); spCover.push(d.cov); } return renderPack(); }
  if (d.pkopen){ const p = packs[+d.pkopen]; if (p){ set = p.set.map(normItem); style = normStyle(p.style); $("spName").value = p.name; $("spVer").value = p.version; persist(); closeModal("mPack"); setCurrent(set[0] || normItem(blankItem()), set[0] ? set[0].id : null); showView("editor"); toast("Pack dibuka: " + p.name); } return; }
  if (d.pkdel){ packs.splice(+d.pkdel, 1); persist(); return renderPack(); }
});
document.addEventListener("pointerdown", e => { if (!e.target.closest("#luCatDrop")) setCatOpen(false); });
document.addEventListener("input", e => {
  const id = e.target.id;
  if (id === "accIn"){ style.accent = e.target.value.toUpperCase(); setChanged(); }
  if (id === "fxCol"){ style.fx.color = e.target.value.toUpperCase(); setChanged(); }
  if (id === "colLine"){ style.colors[sel].line = e.target.value.toUpperCase(); setChanged(); }
  if (id === "colFill"){ style.colors[sel].fill = e.target.value.toUpperCase(); setChanged(); }
});
$("pX").addEventListener("input", e => { const xy = getXY(sel); setXY(sel, +e.target.value, xy[1]); renderEditor(); });
$("pY").addEventListener("input", e => { const xy = getXY(sel); setXY(sel, xy[0], +e.target.value); renderEditor(); });
$("pS").addEventListener("input", e => { setScale(sel, +e.target.value); setChanged(); });
$("pR").addEventListener("input", e => { cur.deco.r = +e.target.value; renderEditor(); });
$("nameIn").addEventListener("input", e => { cur.name = e.target.value.slice(0, 60); $("iconName").textContent = nameOf(cur); });
$("resetLayer").onclick = () => {
  if (sel === "main"){ const s = cur.mod !== "none" ? SHIFT[cur.slot] : [0, 0]; cur.mx = s[0]; cur.my = s[1]; }
  else if (sel === "mod"){ cur.nx = 0; cur.ny = 0; }
  else { const h = DECOS[cur.deco.type] ? DECOS[cur.deco.type].home : [9, 9]; Object.assign(cur.deco, {x:h[0], y:h[1], s:100, r:0}); }
  renderEditor();
};
$("pAuto").onclick = () => { cur.parts = null; renderEditor(); };
$("colReset").onclick = () => { style.colors[sel] = {line:null, fill:null}; setChanged(); };
$("swapModes").onclick = () => { style.pref = style.pref === "A" ? "B" : "A"; persist(); renderEditor(); };
$("sSw").addEventListener("input", e => { style.sw = +e.target.value; setChanged(); });
$("sGap").addEventListener("input", e => { style.gap = +e.target.value; setChanged(); });
$("modNone").onclick = () => { cur.mod = "none"; cur.mx = 0; cur.my = 0; renderBins(); renderEditor(); };
$("saveIcon").onclick = () => {
  const it = normItem({...clone(cur), id:editingId});
  const i = set.findIndex(x => x.id === editingId);
  if (i >= 0) set[i] = it; else set.push(it);
  editingId = it.id; cur = clone(it); persist(); renderEditor(); toast(i >= 0 ? "Ikon diperbarui" : "Ditambahkan ke set");
};
$("newIcon").onclick = () => { setCurrent(normItem(blankItem()), null); };
$("dupIcon").onclick = () => { const it = normItem({...clone(cur), id:null, name:nameOf(cur) + " (2)"}); set.push(it); setCurrent(it, it.id); persist(); toast("Diduplikat"); };
$("delIcon").onclick = () => { const i = set.findIndex(x => x.id === editingId); if (i < 0) return; set.splice(i, 1); persist(); const nx = set[Math.min(i, set.length - 1)]; setCurrent(nx || normItem(blankItem()), nx ? nx.id : null); toast("Dihapus dari set"); };
$("copySvg").onclick = () => copyText(compose(cur, {mode:"mask", idp:"ko"}), "Kode SVG disalin");
$("goExport").onclick = () => showView("review");
$("rDownload").onclick = download;
$("rSavePack").onclick = openPack;
$("rNames").onclick = () => { rNames = !rNames; renderReview(); };
["rJson","rHtml"].forEach(id => $(id).addEventListener("change", renderReview));
$("rMetaOn").addEventListener("change", e => { rMeta.on = e.target.checked; saveMeta(); renderReview(); });
$("rMetaBox").addEventListener("click", e => { const x = e.target.closest("[data-mart],[data-mloc],[data-mkw],[data-mnm]"); if (!x) return; if (x.dataset.mnm) rMeta.nm = x.dataset.mnm; if (x.dataset.mart) rMeta.artist = x.dataset.mart; if (x.dataset.mloc) rMeta.locale = x.dataset.mloc; if (x.dataset.mkw) rMeta.kw = +x.dataset.mkw; saveMeta(); renderReview(); });
[["rPackEn", "packEn"], ["rPackId", "packId"], ["rDesc", "desc"]].forEach(([id, k]) => $(id).addEventListener("input", e => { rMeta[k] = e.target.value; saveMeta(); renderReview(); }));
$("bAll").onclick = () => { bOff = {}; renderBatch(); };
$("bNone").onclick = () => { bOff = {}; for (const m of bSel.mains) for (const d of bSel.mods) bOff[m + "|" + d] = true; renderBatch(); };
document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.bm){ bSel.mains = t.checked ? [...new Set([...bSel.mains, t.dataset.bm])] : bSel.mains.filter(x => x !== t.dataset.bm); renderBatch(); }
  if (t.dataset.bd){ bSel.mods = t.checked ? [...new Set([...bSel.mods, t.dataset.bd])] : bSel.mods.filter(x => x !== t.dataset.bd); renderBatch(); }
});
let luT; $("luQ").addEventListener("input", () => { clearTimeout(luT); luT = setTimeout(() => { luShown = 48; renderLu(); }, 180); });
$("luMore").onclick = () => { luShown += 48; renderLu(); };
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("luCatMenu").hidden){ setCatOpen(false); $("luCatBtn").focus(); return; }
  if (view !== "editor" || !$("mLucide").hidden || !$("mDeco").hidden || !$("mPack").hidden) return;
  if (["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) return;
  const step = e.shiftKey ? 2 : 0.5, map = {ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step]};
  if (map[e.key]){ const xy = getXY(sel); setXY(sel, xy[0] + map[e.key][0], xy[1] + map[e.key][1]); renderEditor(); e.preventDefault(); }
});

/* ---------- boot ---------- */
(function boot(){
  fillCats();
  try {
    let j = JSON.parse(localStorage.getItem(STORE) || "null"), fresh = false;
    if (!j){ j = JSON.parse(localStorage.getItem(STORE_OLD) || "null"); fresh = true; }
    if (fresh){ if (j && j.style) style = normStyle(j.style); applyFamily("accent"); if (j) j.style = null; }
    if (j){
      if (j.style) style = normStyle(j.style);
      if (Array.isArray(j.customs)) customs = j.customs.filter(c => c && c.id && Array.isArray(c.vb) && typeof c.inner === "string");
      if (Array.isArray(j.luUsed)) luUsed = j.luUsed.filter(t => /^(main|mod)\|(lu|tb|hg):[a-z0-9-]+$/.test(t)).slice(0, 160);
      if (Array.isArray(j.packs)) packs = j.packs.filter(p => p && Array.isArray(p.set));
      luUsed.forEach(t => { const [kind, key] = t.split("|"); ensureLucide(key, kind); });
      if (Array.isArray(j.set)) set = j.set.map(normItem);
    }
  } catch {}
  if (!set.length) set = PRESET.map(p => normItem(p));
  persist();
  cur = clone(set[0]); editingId = set[0].id;
  renderBins(); showView("editor");
  const needTb = luUsed.some(t => t.includes("|tb:")) || set.some(it => /^tb:/.test(it.main) || /^tb:/.test(it.mod));
  if (needTb) loadTabler().then(() => {
    if (!SOURCES.tb.index()) return toast("Tabler tidak termuat. Ikon Tabler tampil sebagai garis putus-putus.");
    for (const reg of [MAINS, MODS]) for (const k of Object.keys(reg)) if (/^tb:/.test(k) && reg[k].missing) delete reg[k];
    luUsed.forEach(t => { const [kind, key] = t.split("|"); ensureLucide(key, kind); });
    set.forEach(it => { if (/^tb:/.test(it.main)) ensureLucide(it.main, "main"); if (/^tb:/.test(it.mod)) ensureLucide(it.mod, "mod"); });
    if (/^tb:/.test(cur.main)) ensureLucide(cur.main, "main"); if (/^tb:/.test(cur.mod)) ensureLucide(cur.mod, "mod");
    renderBins(); renderEditor();
  });
  const needHg = luUsed.some(t => t.includes("|hg:")) || set.some(it => /^hg:/.test(it.main) || /^hg:/.test(it.mod));
  if (needHg) loadHugeicons().then(() => {
    if (!SOURCES.hg.index()) return toast("Hugeicons tidak termuat. Ikon Hugeicons tampil sebagai garis putus-putus.");
    for (const reg of [MAINS, MODS]) for (const k of Object.keys(reg)) if (/^hg:/.test(k) && reg[k].missing) delete reg[k];
    luUsed.forEach(t => { const [kind, key] = t.split("|"); ensureLucide(key, kind); });
    set.forEach(it => { if (/^hg:/.test(it.main)) ensureLucide(it.main, "main"); if (/^hg:/.test(it.mod)) ensureLucide(it.mod, "mod"); });
    if (/^hg:/.test(cur.main)) ensureLucide(cur.main, "main"); if (/^hg:/.test(cur.mod)) ensureLucide(cur.mod, "mod");
    renderBins(); renderEditor();
  });
  (async () => { if (window.claude && window.claude.use){ try { downloads = await window.claude.use("downloads"); } catch {} } })();
})();
