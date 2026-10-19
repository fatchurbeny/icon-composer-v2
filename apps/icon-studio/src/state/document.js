// @ts-check
/**
 * Model dokumen Icon Studio: set Composer (`kind: "set"`) dan dokumen Builder (`kind: "manifest"`).
 * Fungsi di sini murni (tanpa DOM dan localStorage) dan dipindah apa adanya dari
 * Icon Composer 1.5.1 (`normStyle`, `applyFamily`, `blankItem`, `normItem`, `PRESET`) dan
 * Template Icon Builder 1.6.0 (`toItem`, `normAcc`, `importManifest`, `applyManStyle`, `useStyle`).
 * Registry pustaka dan id acak disuntik lewat `deps`, supaya modul ini bisa dites tanpa browser.
 */
import { offsetParams } from "@icon-studio/engines/offset";
import { ROLES } from "@icon-studio/engines/shared";
import { DEFAULT_SET_STYLE, FAMILY_DEFAULT, defaultManifestStyle } from "./data/style-defaults.js";

export { DEFAULT_SET_STYLE, FAMILY_DEFAULT, defaultManifestStyle };

/** @typedef {{MAINS: Record<string, any>, MODS: Record<string, any>, DECOS: Record<string, any>, SHIFT: Record<string, number[]>, LIB_RE: RegExp, ensure: (key: string, kind: "main" | "mod") => boolean}} Library */

/** Id acak pendek. Bukan bagian mesin, jadi Math.random boleh dipakai di sini. */
export const randomUid = () => Math.random().toString(36).slice(2, 9);

/* ---------- set Composer ---------- */


/** Keluarga gaya yang bisa dipakai set Composer (hand-writing menyusul di Fase 4). */
export const SET_FAMILIES = ["classic", "accent", "offset"];

/**
 * Patokan set: warna lapisan, skala, tebal garis, celah knockout, dan ujung garis berlaku untuk semua ikon.
 * Parameter mesin baru disimpan di `style.engine.<id>` dan hanya ditulis bila sudah ada (gaya.json classic/accent tetap sama dengan IC 1.5.1).
 * @param {any} [o]
 */
export function normSetStyle(o){
  o = o || {}; const d = DEFAULT_SET_STYLE, oc = o.colors || {}, os = o.scale || {};
  const family = SET_FAMILIES.includes(o.family) ? o.family : "classic";
  const engine = family === "offset" || (o.engine && o.engine.offset) ? {engine:{...(o.engine || {}), offset:offsetParams(o)}} : {};
  const col = l => ({line:(oc[l] && oc[l].line) || null, fill:(oc[l] && oc[l].fill) || null});
  const num = (v, dflt, mn, mx) => (typeof v === "number" && isFinite(v)) ? Math.max(mn, Math.min(mx, v)) : dflt;
  return {...d, ...o, ...engine, family, saved:(o.saved && typeof o.saved === "object") ? o.saved : {}, colors:{main:col("main"), mod:col("mod"), deco:col("deco")},
    scale:{main:num(os.main, d.scale.main, 60, 100), mod:num(os.mod, d.scale.mod, 50, 150), deco:num(os.deco, d.scale.deco, 50, 200)},
    fx:{mode:["none","soft","shadow"].includes((o.fx || {}).mode) ? o.fx.mode : "none", color:/^#[0-9a-f]{6}$/i.test((o.fx || {}).color || "") ? o.fx.color.toUpperCase() : d.fx.color,
        dx:num((o.fx || {}).dx, d.fx.dx, -4, 4), dy:num((o.fx || {}).dy, d.fx.dy, -4, 4)}};
}


/**
 * Pindah keluarga gaya. Patokan keluarga lama disimpan di `style.saved`. Mengubah `style` langsung.
 * Offset menyimpan parameternya sendiri di `style.engine.offset`, jadi field classic/accent tidak disentuh
 * dan pulih apa adanya saat kembali.
 * @param {any} style
 * @param {"classic" | "accent" | "offset"} f
 */
export function applyFamily(style, f){
  if (style.family === f && style.saved && style.saved[f]) return style;
  style.saved = style.saved || {};
  const old = style.family || "classic";
  if (f === "offset"){
    if (old !== "offset") style.saved[old] = {sw:style.sw, gap:style.gap, cap:style.cap, join:style.join, accent:style.accent, scale:{...style.scale}};
    style.family = "offset";
    style.engine = {...(style.engine || {}), offset:offsetParams(style)};
    return style;
  }
  if (old !== "offset") style.saved[old] = {sw:style.sw, gap:style.gap, cap:style.cap, join:style.join, accent:style.accent, scale:{...style.scale}};
  const p = style.saved[f] || FAMILY_DEFAULT[f];
  Object.assign(style, {family:f, sw:p.sw, gap:p.gap, cap:p.cap, join:p.join, accent:p.accent, scale:{...p.scale}});
  return style;
}

export function blankItem(){
  return {id:null, name:"", main:"face", mod:"bubble", slot:"BL", size:100, nx:0, ny:0, ms:84, mx:3, my:-3,
    deco:{type:"none", x:4.5, y:34, s:100, r:0, color:"ink"}, pref:"set", parts:null, under:"none", mstyle:"line",
    colors:{main:{line:null, fill:null}, mod:{line:null, fill:null}, deco:{line:null, fill:null}},
    vis:{main:true, mod:true, deco:true}};
}

/**
 * Normalisasi item set. Ikon pustaka didaftarkan ke registry lewat `lib.ensure`.
 * @param {any} o
 * @param {Library} lib
 * @param {{customs?: any[], uid?: () => string}} [opts]
 */
export function normItem(o, lib, opts = {}){
  const {MAINS, MODS, DECOS, SHIFT, LIB_RE} = lib, customs = opts.customs || [], uid = opts.uid || randomUid;
  const b = blankItem();
  const it = {...b, ...o, deco:{...b.deco, ...(o.deco || {})}, vis:{...b.vis, ...(o.vis || {})},
    colors:{main:{...b.colors.main, ...((o.colors || {}).main || {})}, mod:{...b.colors.mod, ...((o.colors || {}).mod || {})}, deco:{...b.colors.deco, ...((o.colors || {}).deco || {})}}};
  if (LIB_RE.test(String(it.main))) lib.ensure(it.main, "main");
  if (LIB_RE.test(String(it.mod))) lib.ensure(it.mod, "mod");
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

/** Set contoh saat set kosong. */
export const PRESET = [
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

/* ---------- dokumen Builder (manifest) ---------- */

/** Mode pratinjau dan ekspor Builder: X = aksen, A = garis·solid, B = solid·garis. */
export const MODES = ["X", "A", "B"];


/** Patokan per mode: X memakai patokan aksen, A/B/C patokan classic. */
export const STY = {X:{sw:3.5, gap:1.25, cap:"round", join:"round", scale:{main:88, mod:80, deco:100}}, C:{sw:2, gap:2, cap:"butt", join:"miter", scale:{main:84, mod:100, deco:100}}};

/**
 * Gaya untuk satu mode Builder. Mengubah `style` langsung, sama seperti TIB.
 * @param {any} style
 * @param {string} kind
 */
export function useStyle(style, kind){ const s = STY[kind === "X" ? "X" : "C"]; Object.assign(style, s, {scale:{...s.scale}}); return style; }

export const ANCHORS = ["TL","TC","TR","ML","C","MR","BL","BC","BR"];
export const FILLS = ["none","full","offset","half"], SPARKS = ["none","star4","star4x2"];

/** @param {string} slot @param {string} type @param {Record<string, any>} DECOS */
export function sparkHome(slot, type, DECOS){ const h = (DECOS[type] || {home:[9, 9]}).home; return slot === "TL" || slot === "ML" ? [48 - h[0], h[1]] : [h[0], h[1]]; }

/**
 * Blok `accent` manifest ke field item (isi, penanda, bagian, kilau).
 * @param {any} it
 * @param {any} a
 * @param {Record<string, any>} DECOS
 */
export function normAcc(it, a, DECOS){
  a = a || {};
  it.under = FILLS.includes(a.fill) ? a.fill : (FILLS.includes(it.under) ? it.under : "none");
  it.mstyle = a.marker === "fill" || a.marker === "line" ? a.marker : (it.mstyle === "fill" ? "fill" : "line");
  const pr = a.parts !== undefined ? a.parts : it.parts;
  if (pr && typeof pr === "object"){ const p = {}; for (const [k, v] of Object.entries(pr)) if (/^\d+$/.test(k) && ROLES.includes(v)) p[k] = v; it.parts = Object.keys(p).length ? p : null; } else it.parts = null;
  const sp = a.spark !== undefined ? a.spark : (it.deco && it.deco.type);
  if (SPARKS.includes(sp) && sp !== "none"){
    const pos = Array.isArray(a.spark_pos) && a.spark_pos.length === 2 && a.spark_pos.every(v => Number.isFinite(+v)) ? a.spark_pos.map(v => Math.max(0, Math.min(48, +v))) : (it.deco && it.deco.type === sp && Number.isFinite(it.deco.x) ? [it.deco.x, it.deco.y] : sparkHome(it.slot, sp, DECOS));
    it.deco = {type:sp, x:pos[0], y:pos[1], r:0, color:"accent"};
  } else it.deco = {type:"none", x:9, y:9, r:0, color:"accent"};
  it.vis = {main:true, mod:true, deco:true};
  return it;
}

export const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** @param {unknown} s */
export function kebab2(s){ return String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 48); }

/**
 * Satu ikon manifest menjadi item kerja Builder.
 * @param {any} o
 * @param {number} i
 * @param {Record<string, number[]>} SHIFT
 * @param {() => string} [rand] akhiran uid acak
 */
export function toItem(o, i, SHIFT, rand = () => Math.random().toString(36).slice(2, 6)){
  const slot = ANCHORS.includes(o.anchor) && o.anchor !== "C" ? o.anchor : "BR";
  const mod = o.mod ? String(o.mod) : "none";
  const off = o.offset || {}, num = v => Number.isFinite(+v) ? Math.max(-12, Math.min(12, +v)) : null;
  const sh0 = mod !== "none" ? (SHIFT[slot] || [0, 0]) : [0, 0];
  const sh = Array.isArray(off.main) && off.main.length === 2 && num(off.main[0]) != null ? [num(off.main[0]), num(off.main[1]) || 0] : sh0;
  const mo = Array.isArray(off.mod) && off.mod.length === 2 && num(off.mod[0]) != null ? [num(off.mod[0]), num(off.mod[1]) || 0] : [0, 0];
  const name = typeof o.name === "string" ? {en:o.name, id:o.name} : (o.name || {});
  const kw = o.keywords || {};
  return {
    uid: "i" + i + "-" + rand(),
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

/**
 * Gaya dan mode pratinjau dari blok `style` manifest (applyManStyle TIB, tanpa DOM).
 * @param {any} man
 * @param {any} style diubah langsung (ink, accent)
 * @returns {{pv: string, exportModes: Record<string, boolean>}}
 */
export function manifestStyle(man, style){
  const st = (man && man.style) || {};
  if (/^#[0-9a-f]{6}$/i.test(st.ink || "")) style.ink = st.ink.toUpperCase();
  if (/^#[0-9a-f]{6}$/i.test(st.accent || "")) style.accent = st.accent.toUpperCase();
  const fam = st.family === "classic" ? "classic" : "accent";
  const pv = fam === "classic" ? (["A", "B"].includes(st.mode) ? st.mode : "A") : "X";
  return {pv, exportModes:{X:fam === "accent", A:pv === "A", B:pv === "B"}};
}

/**
 * Baca teks manifest menjadi dokumen Builder. Ikon pustaka didaftarkan setelah pustaka dimuat (lihat render.js).
 * @param {string} text
 * @param {{SHIFT: Record<string, number[]>, DECOS: Record<string, any>}} lib
 * @param {{rand?: () => string}} [opts]
 */
export function importManifest(text, lib, opts = {}){
  let j;
  try { j = JSON.parse(text); } catch (e){ return {fatal:"JSON tidak valid: " + (/** @type {Error} */ (e)).message}; }
  if (!j || !Array.isArray(j.icons)) return {fatal:"Manifest harus punya daftar \"icons\"."};
  const style = defaultManifestStyle();
  const {pv, exportModes} = manifestStyle(j, style);
  const items = j.icons.map((o, i) => toItem(o, i, lib.SHIFT, opts.rand)).map(it => { const a = it._acc; delete it._acc; return normAcc(it, a, lib.DECOS); });
  const needTb = items.some(it => /^tb:/.test(it.main) || /^tb:/.test(it.mod));
  const needHg = items.some(it => /^hg:/.test(it.main) || /^hg:/.test(it.mod));
  return {manifest:j, style, pv, exportModes, items, needTb, needHg};
}

/* ---------- dokumen ---------- */

/**
 * @param {{id?: string, name?: string, style?: any, items?: any[], customs?: any[], meta?: any}} [init]
 * @param {() => string} [uid]
 */
export function createSetDocument(init = {}, uid = randomUid){
  return {id: init.id || "set-" + uid(), kind: "set", name: init.name || "", style: normSetStyle(init.style), items: init.items || [], customs: init.customs || [], meta: init.meta || {}};
}

/**
 * @param {ReturnType<typeof importManifest> & {manifest: any}} imported
 * @param {() => string} [uid]
 */
export function createManifestDocument(imported, uid = randomUid){
  const m = imported.manifest || {};
  return {id: "manifest-" + uid(), kind: "manifest", name: String((m.deck && m.deck.title) || "Manifest"), manifest: m, style: imported.style, pv: imported.pv, exportModes: imported.exportModes, items: imported.items, customs: [], meta: {}};
}
