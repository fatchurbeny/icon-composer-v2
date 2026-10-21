// @ts-check
/**
 * Persona Composer · Set (DESIGN-HANDOFF 3.1) dan Composer · Edit (3.2).
 * Fase 2b langkah 3: Composer · Set lengkap (gaya, halaman, lapisan, pustaka, pool, repetisi, urutan).
 * Composer · Edit ada di ./composer-edit.js.
 */
import { get } from "@icon-studio/engines";
import { STICKER_INKS, slot4 } from "@icon-studio/engines/sticker";
import { ACCENT_OPTIONS, HAND_WRITING_ACCENT_OPTIONS, HAND_WRITING_INK_OPTIONS, INK_OPTIONS, OFFSET_ACCENT_OPTIONS } from "../state/data/palettes.js";
import { colorRow } from "./color-picker.js";
import {
  STYLE_RANGES,
  addItem,
  clearLayer,
  duplicateGroups,
  duplicateItem,
  moveItem,
  nameOf,
  removeItem,
  replaceLayer,
  setOffsetDeco,
  setStyleValue,
  sortedItems,
} from "../state/set-ops.js";
import { alert, aria, button, check, empty, esc, icon, iconButton, number, panel, select, seg } from "../ui.js";
import {
  COMPOSER_TOOLS,
  ENGINE_CARDS,
  ENGINE_NAMES,
  NO_MOD_TEXT,
  READY_ENGINES,
  docFileName,
  engineFlags,
  engineInfo,
  NO_DECO_TEXT,
  isFixedLayout,
  isHandWriting,
  isOffset,
  isSticker,
  renderSet,
  setColorCount,
  statusBar,
  stickerDecoLabel,
} from "./common.js";
import { LICENSE_NOTE, libraryAction, libraryBody, libraryControl, libraryUi } from "./library-panel.js";

export const LAYER_LABEL = { main: "Objek utama", mod: "Pengubah", deco: "Dekorasi" };

/** Objek awal ikon baru bergaya hand-writing (sampel coret-composer 1.0.0); objek bawaan tidak didukung. */
const HAND_WRITING_NEW_MAIN = "lu:pizza";

/** @param {import("./common.js").Ctx} ctx */
export const itemsOf = (ctx) => (ctx.doc ? ctx.doc.items : []);
/** @param {import("./common.js").Ctx} ctx */
export const selectedOf = (ctx) => {
  const id = ctx.doc ? ctx.app.selection[ctx.doc.id] : null;
  return itemsOf(ctx).find((it) => it.id === id) || null;
};
/** @param {import("./common.js").Ctx} ctx @param {any} it */
export const labelOf = (ctx, it) => nameOf(it, ctx.renderer.lib, ctx.doc && ctx.doc.style.family);
/** @param {import("./common.js").Ctx} ctx */
const dupGroupsOf = (ctx) => duplicateGroups(itemsOf(ctx), (it) => get(ctx.doc.style.family).signature(it));
/** @param {import("./common.js").Ctx} ctx */
export const flaggedOf = (ctx) => new Set(dupGroupsOf(ctx).flat().map((it) => it.id));
/** @param {import("./common.js").Ctx} ctx @param {(doc: any) => void} fn @param {string} label */
export const mutate = (ctx, fn, label) => ctx.app.mutate(ctx.doc.id, fn, label);
/** @param {import("./common.js").Ctx} ctx */
export const rerender = (ctx) => ctx.app.mutate(ctx.doc.id, () => {});

/** @param {import("./common.js").Ctx} ctx */
function info(ctx) {
  const n = itemsOf(ctx).length;
  return `<span class="ic-topbar__info">${esc(engineInfo(ctx.doc.style.family))}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${n} ikon · 48 × 48 · ${setColorCount(ctx)} warna</span>`;
}

/* ---------- panel Gaya | Warna ---------- */

/**
 * Slider gaya set (`.ic-slider` + field angka).
 * @param {string} key kunci STYLE_RANGES
 * @param {string} label
 * @param {number} value
 */
function styleSlider(key, label, value) {
  const [min, max, step] = /** @type {any} */ (STYLE_RANGES)[key];
  return `<div class="ic-slider" data-ic="slider" data-name="style:${key}"><span class="ic-label">${esc(label)}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${esc(label)}"><label class="ic-field"><input value="${value}" aria-label="${esc(label)}, angka"></label></div>`;
}

/**
 * Kartu pemilih mesin. Pratinjau dirender mesin sungguhan; offset, hand-writing, dan sticker memakai ikon pustaka
 * karena objek bawaan tidak didukung ketiga gaya itu.
 * @param {import("./common.js").Ctx} ctx
 */
function engineCards(ctx) {
  const family = ctx.doc.style.family;
  const samples = {
    classic: { main: "face", mod: "check", slot: "BR" },
    accent: { main: "face", mod: "check", slot: "BR" },
    offset: { main: "lu:luggage", mod: "none", mx: 0, my: 0 },
    "hand-writing": { main: "lu:wallet", mod: "lu:plus", slot: "BR" },
    sticker: { main: "lu:luggage", mod: "lu:circle-check", slot: "TR", mx: 0, my: 0 },
  };
  return `<div class="ic-engines" data-ic="single" role="group" aria-label="Gaya ikon" data-name="engine">${ENGINE_CARDS.map(([id, label]) => {
    const ready = READY_ENGINES.includes(id);
    const pv = ready ? ctx.renderer.renderSetItem(ctx.app.sampleItem(/** @type {any} */ (samples)[id]), { ...ctx.doc.style, family: id }, { idp: `pv${id}` }) : icon("edit", 20);
    return `<button type="button" class="ic-engine" data-value="${id}" ${aria("aria-pressed", family === id)}${ready ? "" : " disabled"}><span class="ic-engine__pv">${pv}</span>${esc(label)}</button>`;
  }).join("")}</div>`;
}

/**
 * Panel Gaya | Warna untuk gaya offset: parameter berlaku untuk seluruh set (docs/engines/offset.md).
 * @param {import("./common.js").Ctx} ctx
 */
function offsetStyleTabs(ctx) {
  const o = /** @type {any} */ (ctx.doc.style.engine || {}).offset || {};
  const gaya = [
    engineCards(ctx),
    `<div class="ic-formrow"><span class="ic-label">Isi warna</span>${seg("Isi warna offset", [["solid", "Bidang"], ["white", "Putih"], ["line", "Garis"]], o.mode, { name: "style:offset.mode" })}</div>`,
    styleSlider("offset.dx", "Geser X", o.dx),
    styleSlider("offset.dy", "Geser Y", o.dy),
    styleSlider("offset.sw", "Tebal garis", o.sw),
    `<span class="ic-meta">Objek 84% kanvas. ${NO_MOD_TEXT}.</span>`,
  ].join("");
  const n = setColorCount(ctx);
  const warna = [
    colorRow(ctx, { name: "style:offset.ink", label: "Tinta", value: o.ink, options: INK_OPTIONS, fallback: o.ink, round: true }),
    colorRow(ctx, { name: "style:offset.acc", label: "Aksen", value: o.acc, options: OFFSET_ACCENT_OPTIONS, fallback: o.acc, round: true }),
    n > 5 ? alert("warn", `${n} warna di set`, "Canva maks 5") : `<span class="ic-meta">${n} warna di set · maks 5 untuk Canva</span>`,
  ].join("");
  return { gaya, warna };
}

/**
 * Panel Gaya | Warna untuk gaya hand-writing: parameter berlaku untuk seluruh set (docs/engines/hand-writing.md).
 * @param {import("./common.js").Ctx} ctx
 */
function handWritingStyleTabs(ctx) {
  const o = /** @type {any} */ (ctx.doc.style.engine || {})["hand-writing"] || {};
  const gaya = [
    engineCards(ctx),
    styleSlider("hand-writing.sw", "Tebal tinta", o.sw),
    styleSlider("hand-writing.puff", "Gemuk blob", o.puff),
    styleSlider("hand-writing.off", "Geser blob", o.off),
    styleSlider("hand-writing.gap", "Celah goresan (%)", o.gap),
    styleSlider("hand-writing.rot", "Miring acak (°)", o.rot),
    styleSlider("hand-writing.ko", "Celah knockout pengubah", o.ko),
    `<span class="ic-meta">Celah goresan dipanggang menjadi potongan garis, jadi tetap terlihat di file Canva.</span>`,
  ].join("");
  const n = setColorCount(ctx);
  const warna = [
    colorRow(ctx, { name: "style:hand-writing.ink", label: "Tinta", value: o.ink, options: HAND_WRITING_INK_OPTIONS, fallback: o.ink, round: true }),
    colorRow(ctx, { name: "style:hand-writing.acc", label: "Aksen", value: o.acc, options: HAND_WRITING_ACCENT_OPTIONS, fallback: o.acc, round: true }),
    n > 5 ? alert("warn", `${n} warna di set`, "Canva maks 5") : `<span class="ic-meta">${n} warna di set · maks 5 untuk Canva</span>`,
  ].join("");
  return { gaya, warna };
}

/**
 * Panel Gaya | Warna untuk gaya sticker. Mode, garis, halo, geser isi, sparkle, sinar, ikal, dan tinta berlaku
 * untuk seluruh set; warna isi objek dan pengubah diatur per ikon di Composer · Edit (docs/engines/sticker.md).
 * @param {import("./common.js").Ctx} ctx
 */
function stickerStyleTabs(ctx) {
  const o = /** @type {any} */ (ctx.doc.style.engine || {}).sticker || {};
  const gaya = [
    engineCards(ctx),
    `<div class="ic-formrow"><span class="ic-label">Mode warna</span>${seg("Mode warna sticker", [["sticker", "Stiker"], ["fill", "Isi"], ["line", "Garis"]], o.mode, { name: "style:sticker.mode" })}</div>`,
    styleSlider("sticker.sw", "Tebal garis", o.sw),
    styleSlider("sticker.halo", "Halo", o.halo),
    styleSlider("sticker.off", "Geser isi", o.off),
    styleSlider("sticker.spk", "Sparkle", o.spk),
    `<div class="studio-row">${check("Sinar", o.rays !== false, { name: "style:sticker.rays" })}${check("Ikal", o.curl !== false, { name: "style:sticker.curl" })}</div>`,
    `<span class="ic-meta">Pengubah memakai 4 sudut. Halo putih hanya di mode Stiker.</span>`,
  ].join("");
  const n = setColorCount(ctx);
  const warna = [
    colorRow(ctx, { name: "style:sticker.ink", label: "Tinta", value: o.ink, options: [...STICKER_INKS], fallback: o.ink, round: true }),
    `<span class="ic-meta">Warna isi objek dan pengubah diatur per ikon di mode edit. Per ikon maks 4 warna: tinta, isi objek, isi pengubah, dan putih halo.</span>`,
    n > 5 ? alert("warn", `${n} warna di satu ikon`, "Canva maks 5") : `<span class="ic-meta">Maks ${n} warna per ikon · batas Canva 5</span>`,
  ].join("");
  return { gaya, warna };
}

/** @param {import("./common.js").Ctx} ctx */
export function stylePanel(ctx) {
  const s = ctx.doc.style,
    classic = s.family === "classic";
  if (isOffset(ctx.doc) || isHandWriting(ctx.doc) || isSticker(ctx.doc)) {
    const t = isSticker(ctx.doc) ? stickerStyleTabs(ctx) : isHandWriting(ctx.doc) ? handWritingStyleTabs(ctx) : offsetStyleTabs(ctx);
    return panel({
      id: "composer-style",
      label: "Gaya",
      tabs: [
        { id: "gaya", label: "Gaya", body: t.gaya },
        { id: "warna", label: "Warna", body: t.warna },
      ],
    });
  }
  const gaya = [
    engineCards(ctx),
    styleSlider("sw", "Tebal garis", s.sw),
    styleSlider("gap", "Celah knockout", s.gap),
    `<div class="ic-formrow"><span class="ic-label">Ujung garis</span>${seg("Ujung garis", [["butt", "Rata"], ["round", "Bulat"]], s.cap, { name: "style:cap" })}</div>`,
  ].join("");
  const n = setColorCount(ctx);
  const warna = [
    classic
      ? `<div class="ic-formrow"><span class="ic-label">Mode warna</span>${seg("Mode warna", [["A", "Garis·solid"], ["B", "Solid·garis"], ["C", "Garis·garis"]], s.pref, { name: "style:pref" })}</div>`
      : "",
    colorRow(ctx, { name: "style:ink", label: "Tinta", value: s.ink, options: INK_OPTIONS, fallback: s.ink, round: true }),
    colorRow(ctx, { name: "style:accent", label: "Aksen", value: s.accent, options: ACCENT_OPTIONS, fallback: s.accent, round: true }),
    classic
      ? `<div class="ic-formrow"><span class="ic-label">Efek</span>${seg("Efek objek utama", [["none", "Tanpa"], ["soft", "Isian lembut"], ["shadow", "Bayangan"]], s.fx.mode, { name: "style:fx" })}</div>`
      : "",
    n > 5 ? alert("warn", `${n} warna di set`, "Canva maks 5") : `<span class="ic-meta">${n} warna di set · maks 5 untuk Canva</span>`,
  ].join("");
  return panel({
    id: "composer-style",
    label: "Gaya",
    tabs: [
      { id: "gaya", label: "Gaya", body: gaya },
      { id: "warna", label: "Warna", body: warna },
    ],
  });
}

/* ---------- panel Halaman | Lapisan | Pustaka | Pool ---------- */

/**
 * Objek tidak bisa dirender gaya aktif (offset: objek bawaan).
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 */
export const unsupported = (ctx, it) => engineFlags(ctx, it).some((f) => f[0] === "err");

/**
 * Ringkasan dekorasi offset satu ikon untuk daftar lapisan.
 * @param {any} it
 */
export function offsetDecoLabel(it) {
  const d = (it.engine && it.engine.offset && it.engine.offset.deco) || { tick: true, tickPos: "TR", ground: true };
  const on = [d.tick !== false ? `kilat ${d.tickPos === "TL" ? "TL" : "TR"}` : "", d.ground !== false ? "tanah" : "", d.cloud ? "awan" : "", d.grass ? "rumput" : ""].filter(Boolean);
  return on.length ? on.join(" + ") : "tanpa";
}

/** @param {import("./common.js").Ctx} ctx */
export function pageRows(ctx) {
  const items = itemsOf(ctx),
    sel = selectedOf(ctx),
    flagged = flaggedOf(ctx);
  if (!items.length)
    return `<div class="studio-pad">${empty("Belum ada ikon.", "Pilih objek dari Pustaka atau buka Kombinasi.", button("Muat set contoh", { size: "sm", action: "load-preset" }))}</div>`;
  return `<div class="ic-list" role="listbox" aria-label="Halaman set">${items
    .map(
      (it) =>
        `<div class="ic-row" role="option" tabindex="0" data-select="${esc(it.id)}" ${aria("aria-selected", sel === it)}><span class="ic-row__thumb">${renderSet(ctx, it, `row${it.id}`)}</span><span class="ic-row__name">${esc(labelOf(ctx, it))}</span>${flagged.has(it.id) ? '<span class="ic-flag" data-level="err">dobel</span>' : unsupported(ctx, it) ? '<span class="ic-flag" data-level="err">bawaan</span>' : ""}<span class="ic-meta">${isOffset(ctx.doc) || (isHandWriting(ctx.doc) && it.mod === "none") ? "tanpa pengubah" : `${esc(isSticker(ctx.doc) && it.mod !== "none" ? slot4(it.slot) : it.slot)} · ${esc(it.mod === "none" ? "tanpa pengubah" : it.mod)}`}</span></div>`,
    )
    .join("")}</div>`;
}

/**
 * Baris lapisan ikon terpilih, dari depan ke belakang. Thumb = ikon dengan satu lapisan saja.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 */
function layerRows(ctx, it) {
  const off = isOffset(ctx.doc),
    hw = isHandWriting(ctx.doc),
    st = isSticker(ctx.doc);
  const rows = /** @type {const} */ ([
    ["mod", off ? NO_MOD_TEXT : it.mod === "none" ? "tanpa" : `${it.mod} · ${st ? slot4(it.slot) : it.slot}`, !off && it.mod !== "none"],
    off
      ? ["deco", offsetDecoLabel(it), offsetDecoLabel(it) !== "tanpa"]
      : hw
        ? ["deco", NO_DECO_TEXT, false]
        : st
          ? ["deco", it.vis.deco ? stickerDecoLabel(ctx.doc.style) : "tersembunyi", it.vis.deco]
          : ["deco", it.deco && it.deco.type !== "none" ? it.deco.type : "tanpa", !!(it.deco && it.deco.type !== "none")],
    ["main", it.main, true],
  ]);
  return `<div class="ic-list" role="listbox" aria-label="Lapisan ikon">${rows
    .map(([layer, meta, present]) => {
      const only = { ...it, vis: { main: layer === "main", mod: layer === "mod", deco: layer === "deco" } };
      return `<div class="ic-row" role="option" tabindex="0" data-action="layer-select" data-layer="${layer}" ${aria("aria-selected", libraryUi.target === layer)}><span class="ic-row__thumb">${present ? renderSet(ctx, only, `ly${layer}${it.id}`) : ""}</span><span class="ic-row__name">${LAYER_LABEL[layer]}<span class="ic-row__sub">${esc(meta)}</span></span></div>`;
    })
    .join("")}</div>`;
}

/**
 * Skala lapisan terpilih untuk semua ikon di set (pS IC 1.5.1).
 * @param {import("./common.js").Ctx} ctx
 */
function layerScale(ctx) {
  const layer = libraryUi.target;
  return styleSlider(`scale.${layer}`, `Skala ${LAYER_LABEL[layer].toLowerCase()}`, ctx.doc.style.scale[layer]);
}

/** @param {import("./common.js").Ctx} ctx */
function poolBody(ctx) {
  const pool = ctx.doc.pool;
  const row = (/** @type {"main" | "mod"} */ kind, /** @type {string} */ key) => {
    const on = !pool.off[`${kind}|${key}`];
    const src = /^(lu|tb|hg|cu):/.exec(key);
    return `<div class="ic-row ic-row--sm"><label class="ic-check" data-name="pool:${kind}:${esc(key)}"><input type="checkbox"${on ? " checked" : ""} aria-label="${esc(key)} ikut kombinasi"></label>${src ? `<span class="ic-src" data-src="${src[1]}">${src[1]}</span>` : '<span class="ic-src">IC</span>'}<span class="ic-row__name ic-mono">${esc(key)}</span></div>`;
  };
  const mains = pool.mains.filter((k) => !pool.off[`main|${k}`]).length,
    mods = pool.mods.filter((k) => !pool.off[`mod|${k}`]).length;
  return `<div class="ic-panel__sub"><span class="ic-label">Objek utama</span><span class="ic-meta">${pool.mains.length}</span></div>${pool.mains.map((k) => row("main", k)).join("")}<div class="ic-panel__sub"><span class="ic-label">Pengubah</span><span class="ic-meta">${pool.mods.length}</span></div>${pool.mods.map((k) => row("mod", k)).join("")}<div class="studio-pad">${button(`Buka matriks Kombinasi · ${mains * mods}`, { block: true, action: "open-kombinasi" })}</div>`;
}

/** @param {import("./common.js").Ctx} ctx */
function pagesPanel(ctx) {
  const sel = selectedOf(ctx);
  const pool = new Set([...ctx.doc.pool.mains, ...ctx.doc.pool.mods]);
  return panel({
    id: "composer-pages",
    label: "Halaman",
    grow: true,
    foot: `${iconButton("plus", "Ikon baru", { action: "new-icon" })}${iconButton("duplicate", "Duplikat", { action: "dup-icon", disabled: !sel })}${iconButton("dice", "Acak ulang variasi", { disabled: true })}${iconButton("lock", "Kunci variasi", { disabled: true })}<span class="ic-spacer"></span>${iconButton("edit", "Buka mode edit", { action: "open-edit", disabled: !sel })}${iconButton("swap", "Ganti isi lapisan", { action: "layer-swap", disabled: !sel })}${iconButton("trash", "Hapus ikon", { action: "delete-icon", disabled: !sel })}`,
    tabs: [
      { id: "halaman", label: "Halaman", body: pageRows(ctx), flush: true },
      { id: "lapisan", label: "Lapisan", body: sel ? `${layerRows(ctx, sel)}<div class="studio-pad studio-stack">${isFixedLayout(ctx.doc) || isSticker(ctx.doc) ? "" : layerScale(ctx)}<div class="studio-actions">${button("Lepas lapisan", { size: "sm", action: "layer-clear", disabled: libraryUi.target === "main" || (isOffset(ctx.doc) && libraryUi.target === "mod") || (isHandWriting(ctx.doc) && libraryUi.target === "deco") })}</div></div>` : empty("Belum ada ikon terpilih."), flush: !!sel },
      { id: "pustaka", label: "Pustaka", body: `${libraryBody(ctx, { target: true, cols: 5, pool })}${LICENSE_NOTE}` },
      { id: "pool", label: "Pool", body: poolBody(ctx), flush: true },
    ],
  });
}

/* ---------- panel Repetisi | Navigator | Riwayat ---------- */

/**
 * Ringkasan flag mesin di set (offset: objek bawaan, tanpa bidang tertutup, pengubah tidak dipakai).
 * @param {import("./common.js").Ctx} ctx
 */
function engineAlerts(ctx) {
  /** @type {Map<string, {level: string, n: number}>} */
  const by = new Map();
  for (const it of itemsOf(ctx))
    for (const [level, text] of engineFlags(ctx, it)) {
      const cur = by.get(text) || { level, n: 0 };
      cur.n++;
      by.set(text, cur);
    }
  return [...by].map(([text, f]) => alert(/** @type {any} */ (f.level), text, `${f.n} ikon`)).join("");
}

/** @param {import("./common.js").Ctx} ctx */
function repetitionPanel(ctx) {
  const groups = dupGroupsOf(ctx);
  const dup = groups.reduce((a, g) => a + g.length, 0);
  const n = setColorCount(ctx);
  const stats = `<div class="ic-stats"><div class="ic-stat" data-level="${dup ? "err" : "ok"}"><div class="ic-stat__n">${dup}</div><div class="ic-stat__l">Rakitan dobel</div></div><div class="ic-stat"${n > 5 ? ' data-level="err"' : ""}><div class="ic-stat__n">${n}</div><div class="ic-stat__l">Warna maks</div></div><div class="ic-stat"><div class="ic-stat__n">${itemsOf(ctx).length}</div><div class="ic-stat__l">Ikon</div></div></div>`;
  const alerts = groups.map((g) => alert("err", g.map((it) => labelOf(ctx, it)).join(" = "), "dobel")).join("") + engineAlerts(ctx);
  const log = (ctx.app.history[ctx.doc.id] || []).slice(0, 30);
  return panel({
    id: "composer-rep",
    label: "Repetisi",
    tabs: [
      { id: "repetisi", label: "Repetisi", body: stats + alerts },
      { id: "navigator", label: "Navigator", body: `<span class="ic-meta">Navigator kanvas menyusul.</span>` },
      {
        id: "riwayat",
        label: "Riwayat",
        body: log.length
          ? `<div class="ic-list">${log.map((h) => `<div class="ic-row ic-row--sm"><span class="ic-row__name">${esc(h.label)}</span><span class="ic-meta">${new Date(h.at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></div>`).join("")}</div>`
          : `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>`,
        flush: log.length > 0,
      },
    ],
  });
}

/* ---------- aksi dan kontrol ---------- */

/**
 * Pilih tab panel studio secara terprogram.
 * @param {string} panelId
 * @param {string} tab
 */
export const openTab = (panelId, tab) => /** @type {HTMLElement | null} */ (document.querySelector(`[data-panel="${panelId}"] [role="tab"][data-value="${tab}"]`))?.click();

export const actions = {
  /** @param {import("./common.js").Ctx} ctx */
  "new-icon"(ctx) {
    /* offset, hand-writing, dan sticker: ikon baru tanpa pengubah bawaan; hand-writing memakai objek pustaka */
    const init = isFixedLayout(ctx.doc) || isSticker(ctx.doc) ? { mod: "none", mx: 0, my: 0 } : {};
    mutate(ctx, (doc) => {
      const it = addItem(doc, ctx.renderer.lib, init);
      if (isHandWriting(doc)) replaceLayer(it, "main", HAND_WRITING_NEW_MAIN, ctx.renderer.lib);
      ctx.app.selection[doc.id] = it.id;
    }, "Ikon baru");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "dup-icon"(ctx) {
    const sel = selectedOf(ctx);
    if (sel) mutate(ctx, (doc) => (ctx.app.selection[doc.id] = duplicateItem(doc, sel.id, ctx.renderer.lib)?.id || sel.id), `Duplikat ${labelOf(ctx, sel)}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "delete-icon"(ctx, _el, { toast }) {
    const sel = selectedOf(ctx);
    if (!sel) return;
    mutate(ctx, (doc) => (ctx.app.selection[doc.id] = removeItem(doc, sel.id)), `Hapus ${labelOf(ctx, sel)}`);
    toast("Dihapus dari set");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "lib-pick"(ctx, el, { toast }) {
    const key = el.dataset.key;
    if (!key) return;
    const layer = libraryUi.target === "mod" ? "mod" : "main";
    const sel = selectedOf(ctx);
    mutate(
      ctx,
      (doc) => {
        if (sel) replaceLayer(sel, layer, key, ctx.renderer.lib, doc.style.family);
        else {
          const it = addItem(doc, ctx.renderer.lib, layer === "main" || isSticker(doc) ? { mod: "none", mx: 0, my: 0 } : {});
          replaceLayer(it, layer, key, ctx.renderer.lib, doc.style.family);
          ctx.app.selection[doc.id] = it.id;
        }
      },
      `${LAYER_LABEL[layer]} = ${key}`,
    );
    toast(`${LAYER_LABEL[layer]} diganti ${key}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "lib-more": (ctx) => libraryAction(ctx, "lib-more", () => rerender(ctx)),
  /** @param {import("./common.js").Ctx} ctx */
  "lib-retry": (ctx) => libraryAction(ctx, "lib-retry", () => rerender(ctx)),
  "layer-select"(/** @type {any} */ ctx, /** @type {HTMLElement} */ el) {
    libraryUi.target = /** @type {any} */ (el.dataset.layer);
    rerender(ctx);
  },
  "layer-swap"() {
    if (libraryUi.target === "deco") libraryUi.target = "main";
    openTab("composer-pages", "pustaka");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "layer-clear"(ctx) {
    const sel = selectedOf(ctx),
      layer = libraryUi.target;
    if (sel && isSticker(ctx.doc) && layer === "deco") return mutate(ctx, () => (sel.vis.deco = false), "Sembunyikan dekorasi");
    if (sel && isOffset(ctx.doc)) {
      if (layer === "deco") mutate(ctx, () => ["tick", "ground", "cloud", "grass"].forEach((k) => setOffsetDeco(sel, /** @type {any} */ (k), false)), "Lepas dekorasi offset");
      return;
    }
    if (sel && isHandWriting(ctx.doc) && layer === "deco") return;
    if (sel && (layer === "mod" || layer === "deco")) mutate(ctx, () => clearLayer(sel, layer), `Lepas ${LAYER_LABEL[layer].toLowerCase()}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "open-edit"(ctx, _el, { go }) {
    const sel = selectedOf(ctx);
    if (sel) go({ persona: "composer", edit: sel.id });
  },
  "open-kombinasi": (/** @type {any} */ _ctx, /** @type {any} */ _el, /** @type {any} */ { go }) => go({ persona: "kombinasi", edit: null }),
  baseline() {
    openTab("composer-style", "gaya");
    /** @type {HTMLElement | null} */ (document.querySelector('[data-panel="composer-style"] input[type="range"]'))?.focus();
  },
  "app-settings": (/** @type {any} */ _ctx, /** @type {any} */ _el, /** @type {any} */ { toast }) => toast("Pengaturan app menyusul."),
  /** @param {import("./common.js").Ctx} ctx */
  "toggle-grid"(ctx) {
    mutate(ctx, (doc) => (doc.view.grid = !doc.view.grid));
  },
};

/**
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {any} value
 */
export function control(ctx, name, value) {
  if (libraryControl(ctx, name, value, () => rerender(ctx))) return;
  if (name === "engine") {
    if (READY_ENGINES.includes(value)) mutate(ctx, (doc) => setStyleValue(doc.style, "family", value), `Gaya ${/** @type {any} */ (ENGINE_NAMES)[value]}`);
    return;
  }
  if (name.startsWith("style:")) {
    const key = name.slice(6);
    const colorName = /** @type {Record<string, string>} */ ({ ink: "tinta", accent: "aksen", "offset.ink": "tinta", "offset.acc": "aksen", "hand-writing.ink": "tinta", "hand-writing.acc": "aksen", "sticker.ink": "tinta" })[key];
    return mutate(ctx, (doc) => setStyleValue(doc.style, key, value), colorName ? `Warna ${colorName} ${value}` : `Gaya: ${key} = ${value}`);
  }
  if (name.startsWith("pool:")) {
    const [, kind, ...rest] = name.split(":");
    const key = rest.join(":");
    return mutate(ctx, (doc) => {
      if (value) delete doc.pool.off[`${kind}|${key}`];
      else doc.pool.off[`${kind}|${key}`] = true;
    }, `Pool ${key} ${value ? "aktif" : "nonaktif"}`);
  }
  if (name === "view-sort") return mutate(ctx, (doc) => (doc.view.sort = value));
  if (name === "view-cols") return mutate(ctx, (doc) => (doc.view.cols = Math.max(2, Math.min(12, Math.round(Number(value)) || 8))));
  if (name === "view-snap") return mutate(ctx, (doc) => (doc.view.snap = !!value));
}

/**
 * Seret untuk mengubah urutan set, dan Alt + panah sebagai jalan keyboard.
 * @param {HTMLElement} root
 * @param {import("./common.js").Ctx} ctx
 */
function mount(root, ctx) {
  if (!ctx.doc || ctx.doc.view.sort !== "set") return;
  let dragId = /** @type {string | null} */ (null);
  root.querySelectorAll(".ic-page[data-id]").forEach((page) => {
    const el = /** @type {HTMLElement} */ (page);
    el.addEventListener("dragstart", (e) => {
      dragId = el.dataset.id || null;
      e.dataTransfer?.setData("text/plain", dragId || "");
    });
    el.addEventListener("dragover", (e) => e.preventDefault());
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = el.dataset.id;
      if (!dragId || dragId === target) return;
      const to = itemsOf(ctx).findIndex((it) => it.id === target);
      const id = dragId;
      mutate(ctx, (doc) => moveItem(doc, id, to), "Ubah urutan set");
    });
  });
  root.querySelectorAll(".ic-page__card[data-select]").forEach((card) =>
    card.addEventListener("keydown", (event) => {
      const e = /** @type {KeyboardEvent} */ (event);
      if (!e.altKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      const id = /** @type {HTMLElement} */ (card).dataset.select || "";
      const i = itemsOf(ctx).findIndex((it) => it.id === id);
      mutate(ctx, (doc) => moveItem(doc, id, i + (e.key === "ArrowRight" ? 1 : -1)), "Ubah urutan set");
    }),
  );
}

/** Composer · Set */
export const composerSet = {
  persona: "composer",
  layout: "rail",
  viewMode: "pages",
  info,
  action: () => `<button type="button" class="ic-actionbtn" data-action="export">Ekspor Canva ${icon("chevron-down", 13)}</button>`,
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    const sel = selectedOf(ctx),
      v = ctx.doc.view;
    return `<span>${sel ? "1 dipilih" : "0 dipilih"}</span><span class="ic-sep"></span>${check("Snap ke grid", v.snap, { name: "view-snap" })}<span class="ic-sep"></span>${button("Patokan set…", { size: "sm", action: "baseline" })}${button("Pengaturan app…", { size: "sm", action: "app-settings" })}<span class="ic-sep"></span><span class="ic-label">Urut</span>${select("Urut", [["set", "Urutan set"], ["name", "Nama A–Z"], ["flag", "Per flag"]], v.sort, { width: 124, name: "view-sort" })}<span class="ic-label">Kolom</span>${number("Kolom", v.cols, { min: 2, max: 12, step: 1, name: "view-cols" })}<span class="ic-spacer"></span>${iconButton("grid", "Grid artboard", { pressed: v.grid, action: "toggle-grid" })}${iconButton("settings", "Pengaturan", { action: "app-settings" })}`;
  },
  tools: COMPOSER_TOOLS,
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const sel = selectedOf(ctx),
      flagged = flaggedOf(ctx),
      v = ctx.doc.view;
    const items = sortedItems(itemsOf(ctx), v.sort, (it) => labelOf(ctx, it), flagged);
    const draggable = v.sort === "set";
    const pages = items
      .map((it) => {
        const label = labelOf(ctx, it);
        const bad = !flagged.has(it.id) && unsupported(ctx, it);
        return `<div class="ic-page" data-id="${esc(it.id)}"${draggable ? ' draggable="true"' : ""}><span class="ic-page__label">${esc(label)}</span><button type="button" class="ic-page__card" data-select="${esc(it.id)}" data-open="${esc(it.id)}" ${aria("aria-selected", sel === it)} aria-label="${esc(label)}${flagged.has(it.id) ? ", rakitan dobel" : bad ? `, objek bawaan tidak didukung gaya ${/** @type {any} */ (ENGINE_NAMES)[ctx.doc.style.family]}` : ""}">${renderSet(ctx, it, `pg${it.id}`)}${flagged.has(it.id) ? '<span class="ic-flag" data-level="err">dobel</span>' : bad ? '<span class="ic-flag" data-level="err">bawaan</span>' : ""}</button></div>`;
      })
      .join("");
    return `<div class="ic-pagegrid" style="max-width: calc(${v.cols} * 116px + ${v.cols - 1} * 22px)">${pages}<div class="ic-page ic-page--new"><span class="ic-page__label">Ikon baru</span><button type="button" class="ic-page__card" aria-label="Tambah ikon baru" data-action="new-icon">${icon("plus", 20)}</button></div></div>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels: (ctx) => [stylePanel(ctx), pagesPanel(ctx), repetitionPanel(ctx)],
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    const items = itemsOf(ctx),
      sel = selectedOf(ctx);
    return statusBar(
      `${sel ? items.indexOf(sel) + 1 : 0} dari ${items.length}`,
      "<b>Klik</b> halaman untuk memilih. <b>Klik dua kali</b> untuk mengedit ikon. <b>Seret</b> untuk mengubah urutan set.",
    );
  },
  actions,
  control,
  mount,
  docTab: (/** @type {any} */ _ctx, /** @type {any} */ doc) => `${docFileName(doc)} @ 100%`,
};
