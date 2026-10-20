// @ts-check
/**
 * Model dokumen Icon Studio: set Composer (`kind: "set"`) dan dokumen Builder (`kind: "manifest"`).
 * Fungsi di sini murni (tanpa DOM dan localStorage) dan dipindah apa adanya dari
 * Icon Composer 1.5.1 (`normStyle`, `applyFamily`, `blankItem`, `normItem`, `PRESET`) dan
 * Template Icon Builder 1.6.0 (`toItem`, `normAcc`, `importManifest`, `applyManStyle`, `useStyle`).
 * Registry pustaka dan id acak disuntik lewat `deps`, supaya modul ini bisa dites tanpa browser.
 */
import { offsetParams } from "@icon-studio/engines/offset";
import { STICKER_PALETTE, stickerItem, stickerParams } from "@icon-studio/engines/sticker";
import { ROLES } from "@icon-studio/engines/shared";
import { DEFAULT_SET_STYLE, FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, defaultManifestStyle } from "./data/style-defaults.js";

export { DEFAULT_SET_STYLE, FAMILY_DEFAULT, OFFSET_COMPOSER_DEFAULT, defaultManifestStyle };

/** @typedef {{MAINS: Record<string, any>, MODS: Record<string, any>, DECOS: Record<string, any>, SHIFT: Record<string, number[]>, LIB_RE: RegExp, ensure: (key: string, kind: "main" | "mod") => boolean}} Library */

/** Id acak pendek. Bukan bagian mesin, jadi Math.random boleh dipakai di sini. */
export const randomUid = () => Math.random().toString(36).slice(2, 9);

/* ---------- set Composer ---------- */


/** Keluarga gaya yang bisa dipakai set Composer (hand-writing menyusul di Fase 4). */
export const SET_FAMILIES = ["classic", "accent", "offset", "sticker"];

/** Keluarga dengan parameter gaya sendiri di `style.engine.<id>`; field classic/accent tidak disentuh. */
export const ENGINE_PARAMS = {offset:offsetParams, sticker:stickerParams};
/** @param {string} f */
const isEngineFamily = (f) => Object.prototype.hasOwnProperty.call(ENGINE_PARAMS, f);

/**
 * Patokan set: warna lapisan, skala, tebal garis, celah knockout, dan ujung garis berlaku untuk semua ikon.
 * Parameter mesin baru disimpan di `style.engine.<id>` dan hanya ditulis bila sudah ada (gaya.json classic/accent tetap sama dengan IC 1.5.1).
 * @param {any} [o]
 */
export function normSetStyle(o){
  o = o || {}; const d = DEFAULT_SET_STYLE, oc = o.colors || {}, os = o.scale || {};
  const family = SET_FAMILIES.includes(o.family) ? o.family : "classic";
  /** @type {Record<string, any>} */
  const params = {};
  for (const [id, fn] of Object.entries(ENGINE_PARAMS)) if (family === id || (o.engine && o.engine[id])) params[id] = fn(o);
  const engine = Object.keys(params).length ? {engine:{...(o.engine || {}), ...params}} : {};
  const col = l => ({line:(oc[l] && oc[l].line) || null, fill:(oc[l] && oc[l].fill) || null});
  const num = (v, dflt, mn, mx) => (typeof v === "number" && isFinite(v)) ? Math.max(mn, Math.min(mx, v)) : dflt;
  return {...d, ...o, ...engine, family, saved:(o.saved && typeof o.saved === "object") ? o.saved : {}, colors:{main:col("main"), mod:col("mod"), deco:col("deco")},
    scale:{main:num(os.main, d.scale.main, 60, 100), mod:num(os.mod, d.scale.mod, 50, 150), deco:num(os.deco, d.scale.deco, 50, 200)},
    fx:{mode:["none","soft","shadow"].includes((o.fx || {}).mode) ? o.fx.mode : "none", color:/^#[0-9a-f]{6}$/i.test((o.fx || {}).color || "") ? o.fx.color.toUpperCase() : d.fx.color,
        dx:num((o.fx || {}).dx, d.fx.dx, -4, 4), dy:num((o.fx || {}).dy, d.fx.dy, -4, 4)}};
}


/**
 * Pindah keluarga gaya. Patokan keluarga lama disimpan di `style.saved`. Mengubah `style` langsung.
 * Offset dan sticker menyimpan parameternya sendiri di `style.engine.<id>`, jadi field classic/accent tidak
 * disentuh dan pulih apa adanya saat kembali.
 * @param {any} style
 * @param {"classic" | "accent" | "offset" | "sticker"} f
 */
export function applyFamily(style, f){
  if (style.family === f && style.saved && style.saved[f]) return style;
  style.saved = style.saved || {};
  const old = style.family || "classic";
  if (isEngineFamily(f)){
    if (!isEngineFamily(old)) style.saved[old] = {sw:style.sw, gap:style.gap, cap:style.cap, join:style.join, accent:style.accent, scale:{...style.scale}};
    style.family = f;
    style.engine = {...(style.engine || {}), [f]:/** @type {any} */ (ENGINE_PARAMS)[f](style)};
    return style;
  }
  if (!isEngineFamily(old)) style.saved[old] = {sw:style.sw, gap:style.gap, cap:style.cap, join:style.join, accent:style.accent, scale:{...style.scale}};
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
  /* rotasi per ikon objek utama (mr) dan pengubah (nr): hanya disimpan bila tidak 0 */
  for (const k of ["mr", "nr"]) { const v = Number(it[k]); if (Number.isFinite(v) && v) it[k] = Math.max(-180, Math.min(180, v)); else delete it[k]; }
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

/** Mode Builder bergaya offset (Fase 3). Pengubah tidak dirender. */
export const OFFSET_MODE = "O";
/** Mode Builder bergaya sticker (Fase 5). Pengubah dirender di 4 sudut. */
export const STICKER_MODE = "S";
/** Semua mode Builder: classic/accent (golden TIB 1.6.0), offset, lalu sticker. */
export const BUILDER_MODES = [...MODES, OFFSET_MODE, STICKER_MODE];
export const OFFSET_FILLS = ["solid", "white", "line"];
export const STICKER_FILLS = ["sticker", "fill", "line"];

/**
 * Gaya set sticker dari gaya dokumen Builder: tinta manifest, mode warna dari `style.engine.sticker.mode`.
 * Garis, halo, geser isi, dan dekorasi memakai bawaan mesin. Gaya dokumen tidak diubah.
 * @param {any} style gaya dokumen Builder
 */
export function manifestStickerStyle(style){
  const e = (style && style.engine && style.engine.sticker) || {};
  return {family:"sticker", engine:{sticker:stickerParams({mode:STICKER_FILLS.includes(e.mode) ? e.mode : "sticker", ink:style.ink})}};
}

/**
 * Item Builder untuk mesin sticker: isi objek = aksen manifest, isi pengubah kuning sticker
 * (digeser +3 di palet bila sama dengan aksen, aturan legacy). Seed dekorasi dari id ikon (stabil per ikon).
 * @param {any} it item Builder
 * @param {any} style gaya dokumen Builder
 */
export function manifestStickerItem(it, style){
  const acc = /^#[0-9a-f]{6}$/i.test(style.accent || "") ? String(style.accent).toUpperCase() : STICKER_PALETTE[0];
  const i = STICKER_PALETTE.indexOf(acc);
  const mod = acc === "#F9D84A" ? STICKER_PALETTE[((i < 0 ? 3 : i) + 3) % 8] : "#F9D84A";
  return {...it, mx:0, my:0, nx:0, ny:0, vis:{main:true, mod:true, deco:true}, engine:{...(it.engine || {}), sticker:{main:{c:acc}, mod:{c:mod}}}};
}

/**
 * Gaya set offset dari gaya dokumen Builder: tinta dan aksen manifest, isi warna dari `style.engine.offset.mode`.
 * Geser dan tebal garis memakai bawaan mesin. Gaya dokumen tidak diubah.
 * @param {any} style gaya dokumen Builder
 */
export function manifestOffsetStyle(style){
  const e = (style && style.engine && style.engine.offset) || {};
  return {family:"offset", engine:{offset:{...e, mode:OFFSET_FILLS.includes(e.mode) ? e.mode : "solid", acc:style.accent, ink:style.ink}}};
}


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
 * `family: "offset"` memilih mode O; `mode` berisi isi warna offset (solid, white, line).
 * `family: "sticker"` memilih mode S; `mode` berisi mode warna sticker (sticker, fill, line).
 * @param {any} man
 * @param {any} style diubah langsung (ink, accent, engine.offset)
 * @returns {{pv: string, exportModes: Record<string, boolean>}}
 */
export function manifestStyle(man, style){
  const st = (man && man.style) || {};
  if (/^#[0-9a-f]{6}$/i.test(st.ink || "")) style.ink = st.ink.toUpperCase();
  if (/^#[0-9a-f]{6}$/i.test(st.accent || "")) style.accent = st.accent.toUpperCase();
  if (st.family === "offset"){
    style.engine = {...(style.engine || {}), offset:{mode:OFFSET_FILLS.includes(st.mode) ? st.mode : "solid"}};
    return {pv:OFFSET_MODE, exportModes:{X:false, A:false, B:false, O:true}};
  }
  if (st.family === "sticker"){
    style.engine = {...(style.engine || {}), sticker:{mode:STICKER_FILLS.includes(st.mode) ? st.mode : "sticker"}};
    return {pv:STICKER_MODE, exportModes:{X:false, A:false, B:false, O:false, S:true}};
  }
  const fam = st.family === "classic" ? "classic" : "accent";
  const pv = fam === "classic" ? (["A", "B"].includes(st.mode) ? st.mode : "A") : "X";
  return {pv, exportModes:{X:fam === "accent", A:pv === "A", B:pv === "B", O:false}};
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

/* ---------- impor set offset-composer 1.0.1 ---------- */

/** Field gaya offset-composer yang di Icon Studio berlaku untuk seluruh set. `size` tidak ikut (ADR-012). */
export const OFFSET_STYLE_FIELDS = ["mode", "acc", "ink", "dx", "dy", "sw"];

/** Ukuran objek offset di Icon Studio (84% kanvas 120, ADR-012). */
export const OFFSET_SIZE = 100.8;

/**
 * Kenali data offset-composer: isi localStorage `offset-composer-v1` (`{cur, set}`)
 * atau `gaya.json` dari ZIP (`{format: "offset-composer", version, icons}`).
 * @param {any} data
 * @returns {{icons: any[], version: string, source: "offset-composer-v1" | "gaya.json"} | null}
 */
export function offsetComposerSource(data){
  if (!data || typeof data !== "object") return null;
  if (data.format === "offset-composer" && Array.isArray(data.icons)) return {icons:data.icons, version:String(data.version || ""), source:"gaya.json"};
  if (Array.isArray(data.set) && "cur" in data) return {icons:data.set, version:"", source:"offset-composer-v1"};
  return null;
}

/**
 * Ubah set offset-composer menjadi dokumen set Icon Studio bergaya `family: "offset"`.
 * Parameter gaya diambil dari ikon pertama. Bila ikon lain berbeda, `warnings` berisi
 * "Gaya diseragamkan mengikuti ikon pertama" (DATA-MODEL bagian 5).
 * @param {any} data
 * @param {Library} lib
 * @param {{uid?: () => string}} [opts]
 * @returns {{doc: any, warnings: string[], needTb: boolean} | {fatal: string} | null} null bila bukan data offset-composer
 */
export function offsetSetFromComposer(data, lib, opts = {}){
  const src = offsetComposerSource(data);
  if (!src) return null;
  const uid = opts.uid || randomUid, D = OFFSET_COMPOSER_DEFAULT;
  const icons = src.icons.filter(o => o && typeof o === "object" && /^(lu|tb):[a-z0-9-]+$/.test(String(o.key))).map(o => ({...D, ...o}));
  if (!icons.length) return {fatal:"Set offset-composer tidak berisi ikon Lucide atau Tabler."};
  const first = icons[0];
  const num = (/** @type {any} */ v, /** @type {number} */ dflt) => (typeof v === "number" && isFinite(v)) ? v : dflt;
  const hex = (/** @type {any} */ v, /** @type {string} */ dflt) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v).toUpperCase() : dflt;
  const style = normSetStyle({family:"offset"});
  style.engine = {offset:{mode:["solid", "white", "line"].includes(first.mode) ? first.mode : D.mode, acc:hex(first.acc, D.acc), ink:hex(first.ink, D.ink),
    dx:num(first.dx, D.dx), dy:num(first.dy, D.dy), sw:num(first.sw, D.sw), size:OFFSET_SIZE}};
  const warnings = icons.some(o => OFFSET_STYLE_FIELDS.some(k => String(o[k]).toUpperCase() !== String(first[k]).toUpperCase())) ? ["Gaya diseragamkan mengikuti ikon pertama"] : [];
  const items = icons.map(o => normItem({name:String(o.name || o.key.split(":")[1]), main:o.key, mod:"none",
    engine:{offset:{deco:{tick:!!o.dTick, tickPos:o.tickPos === "TL" ? "TL" : "TR", ground:!!o.dGround, cloud:!!o.dCloud, grass:!!o.dGrass}}}}, lib, {uid}));
  const doc = createSetDocument({name:"Set Offset Composer", style, items, meta:{import:{format:"offset-composer", version:src.version, source:src.source, warnings}}}, uid);
  return {doc, warnings, needTb:items.some(it => String(it.main).startsWith("tb:"))};
}

/* ---------- impor set sticker-composer ---------- */

/** Faktor kanvas sticker-composer 64 → kanvas kanonik 48. */
const STICKER_K = 48 / 64;

/**
 * Kenali data sticker-composer: isi localStorage `sticker-composer-v1` (`{style, set, pools}`)
 * atau `gaya.json` dari ZIP (`{kanvas: 64, style, ikon}`).
 * @param {any} data
 * @returns {{icons: any[], style: any, pools: any, source: "sticker-composer-v1" | "gaya.json"} | null}
 */
export function stickerComposerSource(data){
  if (!data || typeof data !== "object") return null;
  if (data.kanvas === 64 && Array.isArray(data.ikon)) return {icons:data.ikon, style:data.style || {}, pools:null, source:"gaya.json"};
  if (Array.isArray(data.set) && !("cur" in data) && data.set.every((/** @type {any} */ o) => o && typeof o === "object" && o.main && typeof o.main === "object"))
    return {icons:data.set, style:data.style || {}, pools:data.pools || null, source:"sticker-composer-v1"};
  return null;
}

/**
 * Ubah set sticker-composer menjadi dokumen set Icon Studio bergaya `family: "sticker"` (DATA-MODEL bagian 4.5).
 * Gaya set legacy sudah berlaku untuk seluruh set, jadi tidak ada peringatan penyeragaman. Posisi 64 diskalakan
 * ke kanvas kanonik 48 (`mx/my`, `nx/ny`); warna, skala, isi, dan dekorasi ke `item.engine.sticker`.
 * @param {any} data
 * @param {Library} lib
 * @param {{uid?: () => string}} [opts]
 * @returns {{doc: any, warnings: string[], needTb: boolean} | {fatal: string} | null} null bila bukan data sticker-composer
 */
export function stickerSetFromComposer(data, lib, opts = {}){
  const src = stickerComposerSource(data);
  if (!src) return null;
  const uid = opts.uid || randomUid;
  const KEY = /^(lu|tb):[a-z0-9-]+$/;
  const icons = src.icons.filter(o => o && o.main && KEY.test(String(o.main.k)));
  if (!icons.length) return {fatal:"Set sticker-composer tidak berisi ikon Lucide atau Tabler."};
  const warnings = icons.length < src.icons.length ? [`${src.icons.length - icons.length} ikon tanpa objek Lucide atau Tabler dilewati`] : [];
  const style = normSetStyle({family:"sticker", engine:{sticker:stickerParams(src.style)}});
  const n = (/** @type {any} */ v) => (typeof v === "number" && isFinite(v) ? Math.round(v * STICKER_K * 10000) / 10000 : 0);
  const items = icons.map(o => {
    const m = o.main, d = o.mod || {}, dc = o.deco || {}, vis = o.vis || {};
    const mod = KEY.test(String(d.k)) ? d.k : "none";
    const it = normItem({
      name:String(o.name || ""), main:m.k, mod, slot:["TL", "TR", "BL", "BR"].includes(d.slot) ? d.slot : "TR",
      mx:n(m.x), my:n(m.y), nx:n(d.x), ny:n(d.y),
      vis:{main:vis.main !== false, mod:vis.mod !== false, deco:dc.on !== false},
      engine:{sticker:{main:{c:m.c, s:m.s, fill:m.fill}, mod:{c:d.c, s:d.s}, deco:{seed:dc.seed, s:dc.s, x:dc.x, y:dc.y}}},
    }, lib, {uid});
    /* nilai di luar rentang atau warna tidak sah dirapikan seperti saat dirender */
    const e = stickerItem(it);
    it.engine.sticker = {main:e.main, mod:e.mod, deco:e.deco};
    return it;
  });
  const doc = createSetDocument({name:"Set Sticker Composer", style, items, meta:{import:{format:"sticker-composer", version:"", source:src.source, warnings}}}, uid);
  const pools = src.pools;
  if (pools && Array.isArray(pools.main) && Array.isArray(pools.mod)) {
    const keys = (/** @type {any[]} */ list) => list.filter(p => p && KEY.test(String(p.k)));
    /** @type {Record<string, boolean>} */
    const off = {};
    for (const p of keys(pools.main)) if (!p.on) off[`main|${p.k}`] = true;
    for (const p of keys(pools.mod)) if (!p.on) off[`mod|${p.k}`] = true;
    doc.pool = {mains:keys(pools.main).map(p => p.k), mods:keys(pools.mod).map(p => p.k), off};
  }
  return {doc, warnings, needTb:items.some(it => String(it.main).startsWith("tb:") || String(it.mod).startsWith("tb:"))};
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
