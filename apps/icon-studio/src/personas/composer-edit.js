// @ts-check
/**
 * Persona Composer · Edit (DESIGN-HANDOFF 3.2): satu ikon di artboard 520 px.
 * Pilih lapisan dengan klik (daftar Lapisan ikut terbuka), seret untuk memindah, seret pegangan sudut
 * untuk skala set, seret di luar sudut untuk memutar per ikon, panah 0,5 unit (Shift 2), [ ] memutar 15°,
 * Delete melepas pengubah atau dekorasi, Esc kembali ke ikhtisar. Logika dari editor Icon Composer 1.5.1.
 */
import { r2 } from "@icon-studio/core";
import { modeOfClassic } from "@icon-studio/engines/classic";
import { ROLES } from "@icon-studio/engines/shared";
import { STICKER_PALETTE, STICKER_RANGES, STICKER_SLOTS, slot4, stickerItem } from "@icon-studio/engines/sticker";
import { FILL_OPTIONS, LINE_OPTIONS } from "../state/data/palettes.js";
import {
  ANCHOR_POINTS,
  DEFAULT_ANCHOR,
  ROT_RANGE,
  anchorRange,
  anchorXY,
  angleFromDrag,
  getRot,
  getXY,
  layerPaints,
  resetLayer,
  rotCenter,
  rotatePt,
  scaleFromDrag,
  scalePivot,
  scaleForSize,
  setAnchorXY,
  setDeco,
  setPartRole,
  setRot,
  setSlot,
  setXY,
  sizeRange,
} from "../state/edit-ops.js";
import { STICKER_SHIFT, clearLayer, resetStickerLayer, setOffsetDeco, setStickerSlot, setStickerValue, setStyleValue } from "../state/set-ops.js";
import { alert, aria, button, check, empty, esc, icon, number, panel, seg } from "../ui.js";
import { NO_MOD_TEXT, docFileName, engineFlags, engineInfo, isOffset, isSticker, renderSet, setColorCount, statusBar, stickerDecoLabel } from "./common.js";
import {
  LAYER_LABEL,
  actions as setActions,
  composerSet,
  control as setControl,
  itemsOf,
  labelOf,
  mutate,
  offsetDecoLabel,
  openTab,
  pageRows,
  rerender,
  selectedOf,
  stylePanel,
} from "./composer.js";
import { LICENSE_NOTE, libraryBody, libraryUi } from "./library-panel.js";
import { colorRow } from "./color-picker.js";

const ROLE_NAME = { ink: "Tinta", acc: "Aksen", fillA: "Isi aksen", fill: "Isi tinta" };
const UNDER_NAME = { none: "Tanpa", full: "Penuh", offset: "Geser", half: "Separuh" };
const ANCHORS = ["TL", "TC", "TR", "ML", "C", "MR", "BL", "BC", "BR"];

/** Lapisan terpilih di mode edit (sama dengan target klik pustaka). */
const layerOf = () => /** @type {import("../state/edit-ops.js").Layer} */ (libraryUi.target);

/** @param {any} it @param {string} layer */
const keyOf = (it, layer) => (layer === "main" ? it.main : layer === "mod" ? it.mod : it.deco.type);

/* ---------- kanvas ---------- */

/** @param {import("../state/edit-ops.js").Box} b */
const pct = (b) => `left: ${r2((b.x / 48) * 100)}%; top: ${r2((b.y / 48) * 100)}%; width: ${r2((b.w / 48) * 100)}%; height: ${r2((b.h / 48) * 100)}%`;

/** Pegangan kotak seleksi dan arahnya (derajat, 0 = kanan) untuk memilih kursor setelah rotasi. */
const HANDLES = /** @type {const} */ ([["nw", 225], ["n", 270], ["ne", 315], ["e", 0], ["se", 45], ["s", 90], ["sw", 135], ["w", 180]]);
const CURSORS = ["ew", "nwse", "ns", "nesw"];

/**
 * Posisi pegangan dalam satuan 48 sebelum rotasi.
 * @param {import("../state/edit-ops.js").Box} b
 * @param {string} at
 */
const handlePt = (b, at) => ({
  x: b.x + (at.includes("w") ? 0 : at.includes("e") ? b.w : b.w / 2),
  y: b.y + (at.includes("n") ? 0 : at.includes("s") ? b.h : b.h / 2),
});

/**
 * Kotak seleksi lapisan terpilih: 8 pegangan ubah ukuran dan 4 zona putar di luar sudut.
 * Kotak ikut diputar di pusat putar lapisan. Pegangan pengubah yang berimpit dengan titik tetap
 * slotnya disembunyikan, karena menyeretnya tidak mengubah jarak. Tanpa `edit` (offset) kotak polos.
 * @param {any} it
 * @param {import("../state/edit-ops.js").Layer} layer
 * @param {import("../state/edit-ops.js").Box} b
 * @param {boolean} edit
 */
function selbox(it, layer, b, edit) {
  if (!b.w) return "";
  if (!edit) return `<div class="ic-selbox" data-role="selbox" style="${pct(b)}"></div>`;
  const r = getRot(it, layer),
    c = rotCenter(it, layer, b);
  const pivot = layer === "mod" ? rotatePt(scalePivot(it, layer, b), c, -r) : null;
  const near = (/** @type {{x: number, y: number}} */ p) => !!pivot && Math.hypot(p.x - pivot.x, p.y - pivot.y) < Math.min(b.w, b.h) / 4;
  const origin = `${r2(((c.x - b.x) / b.w) * 100)}% ${r2(((c.y - b.y) / b.h) * 100)}%`;
  const hs = HANDLES.map(([at, deg]) => {
    const cur = CURSORS[((Math.round((deg + r) / 45) % 4) + 4) % 4];
    return `<span class="ic-selbox__h" data-at="${at}" data-cur="${cur}"${near(handlePt(b, at)) ? " hidden" : ""}></span>`;
  }).join("");
  const rot = ["nw", "ne", "se", "sw"].map((at) => `<span class="ic-selbox__rot" data-at="${at}"></span>`).join("");
  return `<div class="ic-selbox" data-role="selbox" style="${pct(b)}; --ic-selbox-r: ${r}deg; transform-origin: ${origin}">${rot}${hs}</div>`;
}

/**
 * Wilayah klik tiap lapisan (SVG transparan di atas artboard, seperti overlay IC), ikut diputar.
 * @param {any} it
 * @param {Record<string, import("../state/edit-ops.js").Box>} boxes
 * @param {boolean} edit false untuk offset dan sticker (tanpa rotasi per lapisan)
 * @param {readonly ("main" | "mod" | "deco")[]} [order] urutan tumpuk, yang terakhir paling atas
 */
const hitLayer = (it, boxes, edit, order = /** @type {const} */ (["main", "mod", "deco"])) =>
  `<svg class="studio-hit" viewBox="0 0 48 48" aria-hidden="true">${order
    .filter((l) => boxes[l].w)
    .map((l) => {
      const b = boxes[l],
        r = edit ? getRot(it, l) : 0,
        c = rotCenter(it, l, b);
      return `<rect data-hit="${l}" x="${r2(b.x - 1)}" y="${r2(b.y - 1)}" width="${r2(b.w + 2)}" height="${r2(b.h + 2)}"${r ? ` transform="rotate(${r} ${r2(c.x)} ${r2(c.y)})"` : ""}></rect>`;
    })
    .join("")}</svg>`;

/** Sticker: cincin dekorasi hampir seluas kanvas, jadi paling bawah; pengubah paling atas (hit legacy). */
const STICKER_HIT_ORDER = /** @type {const} */ (["deco", "main", "mod"]);
/** @param {import("./common.js").Ctx} ctx */
const hitOrder = (ctx) => (isSticker(ctx.doc) ? STICKER_HIT_ORDER : undefined);

/** @param {import("./common.js").Ctx} ctx @param {any} it */
const artSvg = (ctx, it) => ctx.renderer.renderSetItem(it, ctx.doc.style, { size: "100%", idp: "editart" }, ctx.doc.customs).replace("<svg ", '<svg class="ic-artboard__art" ');

/* ---------- panel ---------- */

/** @param {import("./common.js").Ctx} ctx @param {any} it @param {any} doc */
const boxesOf = (ctx, it, doc = ctx.doc) => ctx.renderer.boxesOf(it, doc.style);

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function layerList(ctx, it) {
  const off = isOffset(ctx.doc),
    st = isSticker(ctx.doc);
  const meta = off
    ? { mod: NO_MOD_TEXT, deco: offsetDecoLabel(it), main: `${it.main} · 84%` }
    : st
      ? { mod: it.mod === "none" ? "tidak ada" : `${it.mod} · ${slot4(it.slot)}`, deco: stickerDecoLabel(ctx.doc.style), main: `${it.main} · skala ${stickerItem(it).main.s}` }
      : {
        mod: it.mod === "none" ? "tidak ada" : `${it.mod} · ${it.slot}`,
        deco: it.deco.type === "none" ? "tidak ada" : `${it.deco.type} · ${it.deco.x}, ${it.deco.y}`,
        main: `${it.main} · ${ctx.doc.style.scale.main}%`,
      };
  return `<div class="ic-list" role="listbox" aria-label="Lapisan ikon">${["mod", "deco", "main"]
    .map((l) => {
      const only = { ...it, vis: { main: l === "main", mod: l === "mod", deco: l === "deco" } };
      const present = l === "main" || (off ? l === "deco" && meta.deco !== "tanpa" : l === "mod" ? it.mod !== "none" : st || it.deco.type !== "none");
      return `<div class="ic-row" role="option" tabindex="0" data-action="layer-select" data-layer="${l}" ${aria("aria-selected", layerOf() === l)}><span class="ic-row__thumb">${present ? renderSet(ctx, only, `el${l}`) : ""}</span><span class="ic-row__name">${LAYER_LABEL[l]}<span class="ic-row__sub">${esc(meta[l])}</span></span><button type="button" class="ic-iconbtn" data-action="edit-eye" data-layer="${l}" ${aria("aria-pressed", it.vis[l])} aria-label="${it.vis[l] ? "Sembunyikan" : "Tampilkan"} ${LAYER_LABEL[l].toLowerCase()}">${icon(it.vis[l] ? "eye" : "eye-off")}</button></div>`;
    })
    .join("")}</div>`;
}

/**
 * Baris warna lapisan (berlaku untuk semua ikon di set, seperti IC): swatch bawaan atau Preset saya,
 * plus pemilih warna. Kosong = ikuti warna set.
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {string} label
 * @param {(string | null)[]} options
 * @param {string | null} current
 * @param {string} fallback warna set
 */
const colorSwatches = (ctx, name, label, options, current, fallback) => colorRow(ctx, { name, label, value: current, options, fallback, follow: true });

/** Penjaga batas Canva: peringatan bila set memakai lebih dari 5 warna. @param {import("./common.js").Ctx} ctx */
const colorCountNote = (ctx) => {
  const n = setColorCount(ctx);
  if (isSticker(ctx.doc)) return n > 5 ? alert("warn", `${n} warna di satu ikon`, "Canva maks 5") : `<span class="ic-meta">Maks ${n} warna per ikon · batas Canva 5</span>`;
  return n > 5 ? alert("warn", `${n} warna di set`, "Canva maks 5") : `<span class="ic-meta">${n} warna di set · maks 5 untuk Canva</span>`;
};

/** Rentang skala set lapisan (STYLE_RANGES), sama dengan kolom Skala di bilah konteks. */
const scaleRange = (/** @type {string} */ layer) => ({ min: layer === "main" ? 60 : 50, max: layer === "main" ? 100 : layer === "mod" ? 150 : 200 });

/** Opsi: buka daftar Lapisan saat lapisan dipilih (bawaan menyala, disimpan di `view.panel`). */
const autoPanelCheck = (/** @type {import("./common.js").Ctx} */ ctx) => check("Buka daftar Lapisan saat memilih lapisan", ctx.doc.view.panel !== false, { name: "edit-autopanel" });

/**
 * Pilih lapisan lalu buka tab Lapisan dengan baris lapisan itu tersorot. Tab Transform sepanel, satu klik
 * di sebelahnya. Memakai openTab supaya panel ikut terbuka bila sedang tertutup.
 * @param {import("./common.js").Ctx} ctx
 * @param {import("../state/edit-ops.js").Layer} layer
 */
function selectLayer(ctx, layer) {
  libraryUi.target = layer;
  rerender(ctx);
  if (ctx.doc.view.panel !== false) openTab("edit-layers", "lapisan");
}

/**
 * Transform untuk gaya offset: tanpa geser dan skala per lapisan; dekorasi diatur lewat sakelar.
 * Panel pengubah tetap terlihat tetapi nonaktif.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 */
function offsetTransformBody(ctx, it) {
  const layer = layerOf();
  const box = boxesOf(ctx, it)[layer];
  if (layer === "mod")
    return `${alert("info", NO_MOD_TEXT)}<div class="ic-formrow"><span class="ic-label">Posisi</span><span class="ic-meta">${esc(it.mod === "none" ? "tidak ada" : `${it.mod} · ${it.slot}, disimpan tetapi tidak dirender`)}</span></div>`;
  const out = [`<div class="ic-formrow"><span class="ic-label">W × H</span><span class="ic-meta">${r2(box.w)} × ${r2(box.h)}</span></div>`];
  if (layer === "deco") {
    const d = /** @type {any} */ ((it.engine && it.engine.offset && it.engine.offset.deco) || {});
    const on = (/** @type {string} */ k, /** @type {boolean} */ dflt) => (typeof d[k] === "boolean" ? d[k] : dflt);
    out.push(
      check("Garis kilat", on("tick", true), { name: "edit-odeco:tick" }),
      `<div class="ic-formrow"><span class="ic-label">Posisi kilat</span>${seg("Posisi kilat", [["TR", "Kanan atas"], ["TL", "Kiri atas"]], d.tickPos === "TL" ? "TL" : "TR", { name: "edit-odeco:tickPos" })}</div>`,
      check("Garis tanah", on("ground", true), { name: "edit-odeco:ground" }),
      check("Awan kecil", on("cloud", false), { name: "edit-odeco:cloud" }),
      check("Rumput", on("grass", false), { name: "edit-odeco:grass" }),
      `<span class="ic-meta">Dekorasi berlaku per ikon dan selalu di dalam viewBox.</span>`,
    );
  } else out.push(`<span class="ic-meta">Objek 84% di tengah kanvas. Geser isi, tebal garis, dan warna diatur di panel Gaya untuk seluruh set.</span>`);
  for (const [level, text] of engineFlags(ctx, it)) if (level !== "info") out.push(alert(/** @type {any} */ (level), text));
  out.push(autoPanelCheck(ctx));
  return out.join("");
}

/**
 * Slider sticker per ikon (`.ic-slider` + field angka). Nama kontrol `st:<lapisan>.<kunci>`.
 * @param {string} path
 * @param {string} label
 * @param {number} value
 * @param {number[]} range [min, max, langkah]
 */
function stickerSlider(path, label, value, range) {
  const [min, max, step] = range;
  return `<div class="ic-slider" data-ic="slider" data-name="st:${path}"><span class="ic-label">${esc(label)}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${esc(label)}"><label class="ic-field"><input value="${value}" aria-label="${esc(label)}, angka"></label></div>`;
}

/** Nama sudut pengubah sticker. */
const STICKER_SLOT_NAME = { TL: "kiri atas", TR: "kanan atas", BL: "kiri bawah", BR: "kanan bawah" };

/**
 * Pemilih 4 sudut pengubah sticker (`.ic-anchor` 3×3, hanya sudut yang aktif).
 * @param {any} it
 */
const stickerSlots = (it) =>
  `<div class="ic-anchor" data-ic="single" role="group" aria-label="Posisi pengubah" data-name="edit-slot">${ANCHORS.map((k) =>
    k in STICKER_SLOTS
      ? `<button type="button" data-value="${k}" ${aria("aria-pressed", slot4(it.slot) === k)} aria-label="Posisi ${/** @type {any} */ (STICKER_SLOT_NAME)[k]}" title="Posisi ${/** @type {any} */ (STICKER_SLOT_NAME)[k]}"></button>`
      : `<button type="button" disabled aria-label="Posisi ${k} tidak tersedia pada style ini"></button>`,
  ).join("")}</div>`;

/**
 * Transform untuk gaya sticker: warna isi, skala, isi, slot, dan geser per ikon (item.engine.sticker dan
 * posisi kanonik). Dekorasi: seed, skala, dan geser per ikon; sparkle, sinar, dan ikal di panel Gaya.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 */
function stickerTransformBody(ctx, it) {
  const layer = layerOf(),
    e = stickerItem(it),
    R = STICKER_RANGES;
  const out = [];
  if (layer === "main") {
    out.push(
      colorRow(ctx, { name: "st:main.c", label: "Isi objek", value: e.main.c, options: [...STICKER_PALETTE], fallback: e.main.c, round: true }),
      `<div class="ic-formrow"><span class="ic-label">Isi</span>${seg("Isi objek utama", [["auto", "Bentuk"], ["plate", "Lingkaran"], ["none", "Tanpa isi"]], e.main.fill, { name: "st:main.fill" })}</div>`,
      stickerSlider("main.s", "Skala", e.main.s, R.mainS),
      stickerSlider("main.x", "Geser X", it.mx || 0, [-STICKER_SHIFT.main, STICKER_SHIFT.main, 0.25]),
      stickerSlider("main.y", "Geser Y", it.my || 0, [-STICKER_SHIFT.main, STICKER_SHIFT.main, 0.25]),
    );
  } else if (layer === "mod") {
    if (it.mod === "none") out.push(`<div class="ic-formrow"><span class="ic-label">Pengubah</span><span class="ic-meta">tidak ada, pilih dari Pustaka</span></div>`);
    else
      out.push(
        colorRow(ctx, { name: "st:mod.c", label: "Isi pengubah", value: e.mod.c, options: [...STICKER_PALETTE], fallback: e.mod.c, round: true }),
        `<div class="ic-formrow"><span class="ic-label">Posisi</span>${stickerSlots(it)}</div>`,
        stickerSlider("mod.s", "Skala", e.mod.s, R.modS),
        stickerSlider("mod.x", "Geser X", it.nx || 0, [-STICKER_SHIFT.mod, STICKER_SHIFT.mod, 0.25]),
        stickerSlider("mod.y", "Geser Y", it.ny || 0, [-STICKER_SHIFT.mod, STICKER_SHIFT.mod, 0.25]),
      );
  } else {
    out.push(
      stickerSlider("deco.seed", "Acak", e.deco.seed, R.seed),
      stickerSlider("deco.s", "Skala", e.deco.s, R.decoS),
      stickerSlider("deco.x", "Geser X", e.deco.x, [-STICKER_SHIFT.deco, STICKER_SHIFT.deco, 0.5]),
      stickerSlider("deco.y", "Geser Y", e.deco.y, [-STICKER_SHIFT.deco, STICKER_SHIFT.deco, 0.5]),
      `<span class="ic-meta">Sparkle, sinar, dan ikal diatur di panel Gaya untuk seluruh set. Dekorasi menghindari sudut pengubah.</span>`,
    );
  }
  for (const [level, text] of engineFlags(ctx, it)) if (level !== "info" || layer !== "deco") out.push(alert(/** @type {any} */ (level), text));
  out.push(colorCountNote(ctx), `<div class="studio-actions">${button("Atur ulang posisi", { size: "sm", action: "edit-reset" })}</div>`, autoPanelCheck(ctx));
  return out.join("");
}

/** Titik acuan panel Transform (`view.anchor`, tidak ikut undo). */
const anchorOf = (/** @type {import("./common.js").Ctx} */ ctx) => (ANCHOR_POINTS.includes(ctx.doc.view.anchor) ? ctx.doc.view.anchor : DEFAULT_ANCHOR);

const ANCHOR_NAME = { TL: "kiri atas", TC: "tengah atas", TR: "kanan atas", ML: "kiri tengah", C: "tengah", MR: "kanan tengah", BL: "kiri bawah", BC: "tengah bawah", BR: "kanan bawah" };

/** Label dan kolom angka panel Transform, satu sel `.ic-tilegrid`. @param {string} label @param {string} control */
const cell = (label, control) => `<div class="studio-row"><span class="ic-label">${label}</span>${control}</div>`;

/**
 * Kolom geometri gaya Affinity: titik acuan 3×3 di kiri, X, Y, W, H, dan R di kanan. X/Y membaca dan
 * menulis titik acuan kotak lapisan (satuan 48). W/H mengubah skala set (rasio selalu terkunci,
 * karena mesin hanya mengenal skala seragam). R memutar lapisan untuk ikon ini.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 * @param {import("../state/edit-ops.js").Layer} layer
 */
function geometryFields(ctx, it, layer) {
  const name = LAYER_LABEL[layer].toLowerCase(),
    anchor = anchorOf(ctx),
    s0 = ctx.doc.style.scale[layer];
  const box = boxesOf(ctx, it)[layer];
  const [ax, ay] = anchorXY(box, anchor);
  const range = anchorRange(it, layer, box, anchor);
  const wr = sizeRange(layer, s0, box.w),
    hr = sizeRange(layer, s0, box.h);
  const empty = !box.w;
  const anchors = `<div class="ic-anchor" data-ic="single" role="group" aria-label="Titik acuan" data-name="edit-anchor">${ANCHOR_POINTS.map((k) => `<button type="button" data-value="${k}" ${aria("aria-pressed", anchor === k)} aria-label="Titik acuan ${ANCHOR_NAME[k]}" title="Titik acuan ${ANCHOR_NAME[k]}"></button>`).join("")}</div>`;
  const chain = `<button type="button" class="ic-iconbtn" ${aria("aria-pressed", true)} disabled aria-label="Rasio selalu terkunci" title="Rasio selalu terkunci: mesin hanya mengenal skala seragam">${icon("link")}</button>`;
  return `<div class="studio-row">${anchors}<div class="ic-tilegrid studio-grow" style="--ic-cols: 2">${[
    cell("X", number(`X ${name}`, r2(ax), { min: r2(range.x[0]), max: r2(range.x[1]), step: 0.5, name: "edit-x" })),
    cell("W", empty ? `<span class="ic-meta">0</span>` : number(`W ${name}`, r2(box.w), { min: r2(wr[0]), max: r2(wr[1]), step: 0.5, name: "edit-w" })),
    cell("Y", number(`Y ${name}`, r2(ay), { min: r2(range.y[0]), max: r2(range.y[1]), step: 0.5, name: "edit-y" })),
    cell("H", empty ? `<span class="ic-meta">0</span>` : number(`H ${name}`, r2(box.h), { min: r2(hr[0]), max: r2(hr[1]), step: 0.5, name: "edit-h" })),
    cell("R", number(`R ${name}`, getRot(it, layer), { min: ROT_RANGE[0], max: ROT_RANGE[1], step: 1, name: "edit-rot" })),
    cell("", chain),
  ].join("")}</div></div>`;
}

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function transformBody(ctx, it) {
  if (isOffset(ctx.doc)) return offsetTransformBody(ctx, it);
  if (isSticker(ctx.doc)) return stickerTransformBody(ctx, it);
  const layer = layerOf(),
    s = ctx.doc.style,
    accent = s.family === "accent";
  const out = [geometryFields(ctx, it, layer), `<span class="ic-meta">W dan H mengubah skala ${LAYER_LABEL[layer].toLowerCase()} untuk semua ikon di set (${s.scale[layer]}%). R hanya untuk ikon ini.</span>`];
  if (layer === "deco") {
    const D = ctx.renderer.data.DECOS;
    out.push(
      `<div class="ic-tilegrid" style="--ic-cols: 4" role="group" aria-label="Jenis dekorasi">${[...Object.entries(D), ["none", { n: "Tanpa" }]]
        .map(
          ([k, d]) =>
            `<button type="button" class="ic-tile" data-action="edit-deco" data-type="${k}" ${aria("aria-pressed", it.deco.type === k)} aria-label="${esc(d.n)}" title="${esc(d.n)}">${k === "none" ? icon("x", 20) : `<svg viewBox="-8 -8 16 16" ${d.star ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.4"'} aria-hidden="true"><path d="${d.d}"/></svg>`}</button>`,
        )
        .join("")}</div>`,
    );
  }
  if (accent && layer === "main") {
    const info = ctx.renderer.mainInfo(it.main),
      roles = ctx.renderer.rolesOf(it, info);
    const hasBody = info.parts.some((/** @type {any} */ p) => p.body);
    out.push(
      `<span class="ic-label">Warna bagian</span>`,
      ...info.parts.map(
        (/** @type {any} */ p, /** @type {number} */ i) =>
          `<div class="ic-formrow"><span class="ic-meta" aria-hidden="true">${i + 1}</span><div class="ic-seg studio-grow" data-ic="single" role="group" aria-label="Warna bagian ${i + 1}" data-name="edit-part:${i}">${ROLES.map((r) => `<button type="button" data-value="${r}" ${aria("aria-pressed", roles[i] === r)}${!p.closed && r.startsWith("fill") ? " disabled" : ""}>${/** @type {any} */ (ROLE_NAME)[r]}</button>`).join("")}</div></div>`,
      ),
      `<div class="ic-formrow"><span class="ic-label">Isi bidang</span><div class="ic-seg" data-ic="single" role="group" aria-label="Isi bidang" data-name="edit-under">${Object.entries(UNDER_NAME)
        .map(([k, n]) => `<button type="button" data-value="${k}" ${aria("aria-pressed", it.under === k)}${!hasBody && k !== "none" ? " disabled" : ""}>${n}</button>`)
        .join("")}</div></div>`,
      `<div class="studio-actions">${button("Warna bagian otomatis", { size: "sm", action: "edit-parts-auto", disabled: !it.parts })}</div>`,
    );
  }
  if (accent && layer === "mod" && it.mod !== "none")
    out.push(`<div class="ic-formrow"><span class="ic-label">Penanda</span>${seg("Gaya penanda", [["line", "Garis"], ["fill", "Isi"]], it.mstyle, { name: "edit-mstyle" })}</div>`);
  const c = s.colors[layer];
  out.push(
    `<span class="ic-label">Warna ${LAYER_LABEL[layer].toLowerCase()} · semua ikon di set</span>`,
    colorSwatches(ctx, "edit-line", accent ? "Tinta" : layer === "deco" ? "Warna" : "Garis", LINE_OPTIONS, c.line, s.ink),
    colorSwatches(ctx, "edit-fill", "Isian", FILL_OPTIONS, c.fill, s.accent),
    colorCountNote(ctx),
    `<div class="studio-actions">${button("Atur ulang posisi", { size: "sm", action: "edit-reset" })}${button("Warna ikut set", { size: "sm", action: "edit-color-reset", disabled: !c.line && !c.fill })}</div>`,
    autoPanelCheck(ctx),
  );
  return out.join("");
}

/* ---------- aksi, kontrol, interaksi kanvas ---------- */

/** @param {import("./common.js").Ctx} ctx @param {(it: any) => void} fn @param {string} [label] */
const mutateItem = (ctx, fn, label) => {
  const it = selectedOf(ctx);
  if (it) mutate(ctx, () => fn(it), label || "");
};

const editActions = {
  ...setActions,
  "edit-item": (/** @type {any} */ _ctx, /** @type {HTMLElement} */ el, /** @type {any} */ { go }) => go({ persona: "composer", edit: el.dataset.id }),
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "edit-eye"(ctx, el) {
    const l = /** @type {import("../state/edit-ops.js").Layer} */ (el.dataset.layer);
    mutateItem(ctx, (it) => (it.vis[l] = !it.vis[l]), `${LAYER_LABEL[l]} ${el.getAttribute("aria-pressed") === "true" ? "disembunyikan" : "ditampilkan"}`);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "layer-select"(ctx, el) {
    selectLayer(ctx, /** @type {any} */ (el.dataset.layer));
  },
  "layer-swap"() {
    if (layerOf() === "deco") return openTab("edit-layers", "transform");
    openTab("edit-layers", "pustaka");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "edit-colors"(ctx) {
    if (isOffset(ctx.doc)) return openTab("composer-style", "warna");
    openTab("edit-layers", "transform");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "edit-reset"(ctx) {
    if (isSticker(ctx.doc)) return mutateItem(ctx, (it) => resetStickerLayer(it, layerOf()), `Atur ulang posisi ${LAYER_LABEL[layerOf()].toLowerCase()}`);
    mutateItem(ctx, (it) => resetLayer(it, layerOf(), ctx.renderer.data), `Atur ulang posisi ${LAYER_LABEL[layerOf()].toLowerCase()}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "edit-color-reset"(ctx) {
    mutate(ctx, (doc) => (doc.style.colors[layerOf()] = { line: null, fill: null }), "Warna lapisan ikut set");
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "edit-deco"(ctx, el) {
    const type = el.dataset.type || "none";
    mutateItem(ctx, (it) => (type === "none" ? clearLayer(it, "deco") : setDeco(it, type, ctx.renderer.data.DECOS)), `Dekorasi ${type}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "edit-parts-auto"(ctx) {
    mutateItem(ctx, (it) => (it.parts = null), "Warna bagian otomatis");
  },
};

/**
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {any} value
 * @param {HTMLElement} el
 * @param {any} tools
 */
function editControl(ctx, name, value, el, tools) {
  const layer = layerOf();
  if (name.startsWith("edit-odeco:")) {
    const key = /** @type {any} */ (name.slice(11));
    return mutateItem(ctx, (it) => setOffsetDeco(it, key, value), `Dekorasi offset ${key}`);
  }
  if (name.startsWith("st:")) {
    const path = name.slice(3);
    const what = /** @type {Record<string, string>} */ ({ "main.c": "Isi objek", "mod.c": "Isi pengubah", "main.fill": "Isi objek", "main.s": "Skala objek", "mod.s": "Skala pengubah", "deco.seed": "Acak dekorasi", "deco.s": "Skala dekorasi" })[path] || `Geser ${LAYER_LABEL[/** @type {"main" | "mod" | "deco"} */ (path.split(".")[0])].toLowerCase()}`;
    return mutateItem(ctx, (it) => setStickerValue(it, path, value), `${what} ${value}`);
  }
  if (name === "edit-slot" && isSticker(ctx.doc)) return mutateItem(ctx, (it) => setStickerSlot(it, String(value)), `Posisi pengubah ${value}`);
  if (name === "edit-slot") return mutateItem(ctx, (it) => setSlot(it, String(value), ctx.renderer.data.SHIFT), `Posisi pengubah ${value}`);
  if (name === "edit-scale") return mutate(ctx, (doc) => setStyleValue(doc.style, `scale.${layer}`, value), `Skala ${LAYER_LABEL[layer].toLowerCase()} ${value}`);
  if (name === "edit-anchor") return mutate(ctx, (doc) => (doc.view.anchor = String(value)), "");
  if (name === "edit-x" || name === "edit-y")
    return mutateItem(ctx, (it) => {
      const box = boxesOf(ctx, it)[layer],
        anchor = anchorOf(ctx);
      const [ax, ay] = anchorXY(box, anchor);
      setAnchorXY(it, layer, box, anchor, name === "edit-x" ? Number(value) : ax, name === "edit-y" ? Number(value) : ay, { snap: ctx.doc.view.snap });
    }, `Geser ${LAYER_LABEL[layer].toLowerCase()}`);
  if (name === "edit-w" || name === "edit-h") {
    const it = selectedOf(ctx);
    if (!it) return;
    const box = boxesOf(ctx, it)[layer],
      s0 = ctx.doc.style.scale[layer];
    const v = scaleForSize(layer, s0, name === "edit-w" ? box.w : box.h, Number(value));
    return mutate(ctx, (doc) => setStyleValue(doc.style, `scale.${layer}`, v), `Skala ${LAYER_LABEL[layer].toLowerCase()} ${v}`);
  }
  if (name === "edit-rot")
    return mutateItem(ctx, (it) => setRot(it, layer, Math.max(ROT_RANGE[0], Math.min(ROT_RANGE[1], Number(value)))), `Putar ${LAYER_LABEL[layer].toLowerCase()} ${r2(Number(value)) || 0}°`);
  if (name === "edit-autopanel") return mutate(ctx, (doc) => (doc.view.panel = !!value), "");
  if (name === "edit-line" || name === "edit-fill")
    return mutate(ctx, (doc) => (doc.style.colors[layer] = { ...doc.style.colors[layer], [name === "edit-line" ? "line" : "fill"]: value || null }), `Warna ${LAYER_LABEL[layer].toLowerCase()}`);
  if (name === "edit-under") return mutateItem(ctx, (it) => (it.under = value), `Isi bidang ${value}`);
  if (name === "edit-mstyle") return mutateItem(ctx, (it) => (it.mstyle = value === "fill" ? "fill" : "line"), `Penanda ${value}`);
  if (name.startsWith("edit-part:"))
    return mutateItem(ctx, (it) => {
      const info = ctx.renderer.mainInfo(it.main);
      setPartRole(it, info, ctx.renderer.rolesOf(it, info), Number(name.slice(10)), String(value));
    }, "Warna bagian");
  return setControl(ctx, name, value, el, tools);
}

/** ctx terbaru untuk pendengar keyboard global (dipasang sekali). */
let liveCtx = /** @type {import("./common.js").Ctx | null} */ (null);
let keyboardBound = false;

/** @param {KeyboardEvent} e */
function onKey(e) {
  const ctx = liveCtx;
  if (!ctx || !ctx.route.edit || !ctx.doc || isOffset(ctx.doc)) return;
  const target = /** @type {HTMLElement} */ (e.target);
  if (target.closest && target.closest("input, textarea, .ic-select, [role=tab], [role=option]")) return;
  const layer = layerOf();
  const sticker = isSticker(ctx.doc);
  /* sticker: tanpa rotasi; dekorasi digeser lewat slider, Delete menyembunyikannya */
  if (sticker && layer === "deco" && (e.key === "Delete" || e.key === "Backspace")) {
    e.preventDefault();
    return mutateItem(ctx, (it) => (it.vis.deco = false), "Sembunyikan dekorasi");
  }
  if (sticker && (layer === "deco" || e.code === "BracketLeft" || e.code === "BracketRight")) return;
  const step = e.shiftKey ? 2 : 0.5;
  const map = /** @type {Record<string, [number, number]>} */ ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] });
  if (map[e.key]) {
    e.preventDefault();
    const it = selectedOf(ctx);
    if (!it) return;
    const [x, y] = getXY(it, layer);
    if (sticker)
      return mutateItem(ctx, (item) => {
        setStickerValue(item, `${layer}.x`, x + map[e.key][0]);
        setStickerValue(item, `${layer}.y`, y + map[e.key][1]);
      }, `Geser ${LAYER_LABEL[layer].toLowerCase()}`);
    mutateItem(ctx, (item) => setXY(item, layer, x + map[e.key][0], y + map[e.key][1], { snap: true }), `Geser ${LAYER_LABEL[layer].toLowerCase()}`);
  } else if (e.code === "BracketLeft" || e.code === "BracketRight") {
    e.preventDefault();
    const it = selectedOf(ctx);
    if (!it) return;
    const d = (e.code === "BracketLeft" ? -1 : 1) * (e.shiftKey ? 1 : 15);
    mutateItem(ctx, (item) => setRot(item, layer, getRot(item, layer) + d, { snap: !e.shiftKey }), `Putar ${LAYER_LABEL[layer].toLowerCase()} ${getRot(it, layer) + d}°`);
  } else if ((e.key === "Delete" || e.key === "Backspace") && (layer === "mod" || layer === "deco")) {
    e.preventDefault();
    mutateItem(ctx, (it) => clearLayer(it, layer), `Lepas ${LAYER_LABEL[layer].toLowerCase()}`);
  }
}

/**
 * Interaksi artboard: seret lapisan untuk memindah, seret pegangan untuk skala set, seret zona putar
 * untuk rotasi per ikon. Selama menyeret, hanya gambar, wilayah klik, kotak seleksi, dan tooltip yang
 * diperbarui; dokumen disimpan saat dilepas. Esc saat menyeret membatalkan. Koordinat pointer diubah ke
 * satuan 48 lewat getBoundingClientRect, sehingga tetap benar saat kanvas di-zoom (CSS zoom).
 * @param {HTMLElement} root
 * @param {import("./common.js").Ctx} ctx
 */
function mount(root, ctx) {
  liveCtx = ctx;
  if (!keyboardBound) {
    document.addEventListener("keydown", onKey);
    keyboardBound = true;
  }
  const board = /** @type {HTMLElement | null} */ (root.querySelector(".ic-artboard"));
  const it = selectedOf(ctx);
  if (!board || !it) return;
  const style = ctx.doc.style;
  /** @param {PointerEvent} e */
  const toBoard = (e) => {
    const rect = board.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) * 48) / rect.width, y: ((e.clientY - rect.top) * 48) / rect.height };
  };
  /**
   * @typedef {{kind: "move" | "scale" | "rotate", layer: any, p0: {x: number, y: number}, sx: number, sy: number,
   *   x0: number, y0: number, s0: number, r0: number, pivot: {x: number, y: number}, c: {x: number, y: number},
   *   undo: {item: any, scale: any}, moved: boolean, id: number}} Drag
   */
  /** @type {Drag | null} */
  let drag = null;
  const tip = () => /** @type {HTMLElement | null} */ (board.querySelector('[data-role="tooltip"]'));
  /** @param {any} layer @param {string} [text] */
  const repaint = (layer, text) => {
    const art = board.querySelector(".ic-artboard__art");
    if (art) art.outerHTML = artSvg(ctx, it);
    const boxes = boxesOf(ctx, it);
    const hit = board.querySelector(".studio-hit");
    const editable = !isSticker(ctx.doc);
    if (hit) hit.outerHTML = hitLayer(it, boxes, editable, hitOrder(ctx));
    const sb = board.querySelector('[data-role="selbox"]');
    if (sb) sb.outerHTML = selbox(it, layer, boxes[layer], editable);
    const t = tip(),
      b = boxes[layer];
    if (t && text) {
      t.hidden = false;
      t.textContent = text;
      t.style.left = `${r2(((b.x + b.w) / 48) * 100)}%`;
      t.style.top = `${r2(((b.y + b.h) / 48) * 100)}%`;
    }
  };
  /** Esc saat menyeret: kembalikan item dan skala set ke keadaan awal. @param {KeyboardEvent} e */
  const onEsc = (e) => {
    if (e.key !== "Escape" || !drag) return;
    e.preventDefault();
    e.stopPropagation();
    const d = drag;
    drag = null;
    document.removeEventListener("keydown", onEsc, true);
    for (const k of Object.keys(it)) if (!(k in d.undo.item)) delete it[k];
    Object.assign(it, d.undo.item);
    style.scale = d.undo.scale;
    rerender(ctx);
  };
  board.addEventListener("pointerdown", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const handle = /** @type {HTMLElement | null} */ (target.closest(".ic-selbox__h, .ic-selbox__rot"));
    const hit = /** @type {HTMLElement | null} */ (target.closest("[data-hit]"));
    if (!handle && !hit) return;
    const layer = /** @type {any} */ (handle ? layerOf() : /** @type {HTMLElement} */ (hit).dataset.hit);
    if (!handle && libraryUi.target !== layer) return selectLayer(ctx, layer);
    /* offset: posisi lapisan mengikuti patokan gaya, jadi lapisan hanya bisa dipilih.
       sticker: objek dan pengubah bisa diseret, dekorasi diatur lewat slider, tanpa pegangan skala dan putar */
    if (isOffset(ctx.doc) || (isSticker(ctx.doc) && (handle || layer === "deco"))) return;
    const box = boxesOf(ctx, it)[layer];
    const [x0, y0] = getXY(it, layer);
    drag = {
      kind: !handle ? "move" : handle.classList.contains("ic-selbox__rot") ? "rotate" : "scale",
      layer,
      p0: toBoard(e),
      sx: e.clientX,
      sy: e.clientY,
      x0,
      y0,
      s0: style.scale[layer],
      r0: getRot(it, layer),
      pivot: scalePivot(it, layer, box),
      c: rotCenter(it, layer, box),
      undo: { item: structuredClone(it), scale: { ...style.scale } },
      moved: false,
      id: e.pointerId,
    };
    document.addEventListener("keydown", onEsc, true);
    board.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  board.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3) return;
    drag.moved = true;
    const p = toBoard(e);
    if (drag.kind === "scale") {
      const v = scaleFromDrag(drag.layer, drag.s0, drag.pivot, drag.p0, p, { snap: e.shiftKey });
      style.scale = { ...style.scale, [drag.layer]: v };
      return repaint(drag.layer, `${v}% · semua ikon`);
    }
    if (drag.kind === "rotate") {
      setRot(it, drag.layer, angleFromDrag(drag.r0, drag.c, drag.p0, p), { snap: e.shiftKey });
      return repaint(drag.layer, `${getRot(it, drag.layer)}°`);
    }
    if (isSticker(ctx.doc)) {
      const sn = (/** @type {number} */ v) => (ctx.doc.view.snap ? Math.round(v * 2) / 2 : v);
      setStickerValue(it, `${drag.layer}.x`, sn(drag.x0 + p.x - drag.p0.x));
      setStickerValue(it, `${drag.layer}.y`, sn(drag.y0 + p.y - drag.p0.y));
    } else setXY(it, drag.layer, drag.x0 + p.x - drag.p0.x, drag.y0 + p.y - drag.p0.y, { snap: ctx.doc.view.snap });
    const b = boxesOf(ctx, it)[drag.layer];
    repaint(drag.layer, `X ${r2(b.x)}  Y ${r2(b.y)}`);
  });
  const end = (/** @type {PointerEvent} */ e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { moved, layer, kind } = drag;
    drag = null;
    document.removeEventListener("keydown", onEsc, true);
    if (!moved) return;
    const name = LAYER_LABEL[layer].toLowerCase();
    const label = kind === "scale" ? `Skala ${name} ${style.scale[layer]}% · semua ikon` : kind === "rotate" ? `Putar ${name} ${getRot(it, layer)}°` : `Geser ${name}`;
    mutate(ctx, () => {}, label);
  };
  board.addEventListener("pointerup", end);
  board.addEventListener("pointercancel", end);
}

/* ---------- persona ---------- */

/**
 * Swatch warna lapisan di bilah konteks, sesuai peran lapisan di mode warna aktif (layerPaints):
 * lapisan garis menampilkan "Garis", lapisan solid "Isi", lapisan garis dan isi keduanya.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 * @param {import("../state/edit-ops.js").Layer} layer
 */
function paintSwatches(ctx, it, layer) {
  const D = ctx.renderer.data;
  const info = ctx.doc.style.family === "accent" && layer === "main" ? ctx.renderer.mainInfo(it.main) : null;
  const paints = layerPaints(it, layer, ctx.doc.style, {
    PREFS: D.PREFS,
    DECOS: D.DECOS,
    roles: info ? ctx.renderer.rolesOf(it, info) : undefined,
    bodies: info ? info.parts.some((/** @type {any} */ p) => p.body) : false,
  });
  const name = LAYER_LABEL[layer].toLowerCase();
  return paints
    .map((p) => `<span class="ic-label">${p.label}</span><button type="button" class="ic-swatch" data-action="edit-colors" data-slot="${p.slot}" style="background: ${p.color}" aria-label="${p.label} ${name} ${p.color}, ubah warna"></button>`)
    .join("");
}

export const composerEdit = {
  ...composerSet,
  viewMode: "single",
  actions: editActions,
  control: editControl,
  mount,
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    const it = selectedOf(ctx);
    return `<span class="ic-topbar__info">${esc(engineInfo(ctx.doc.style.family))}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${esc(it ? labelOf(ctx, it) : "")} · 48 × 48 · ${setColorCount(ctx)} warna</span>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    const it = selectedOf(ctx);
    if (!it) return "";
    const layer = layerOf();
    if (isOffset(ctx.doc)) {
      const key = layer === "mod" ? "" : layer === "main" ? it.main : offsetDecoLabel(it);
      return `<span class="ic-label">${LAYER_LABEL[layer]}</span>${layer === "mod" ? `<span class="ic-meta">${NO_MOD_TEXT}</span>` : `<label class="ic-field ic-field--mono"><input value="${esc(key)}" aria-label="Kunci ${LAYER_LABEL[layer].toLowerCase()}" readonly></label>${layer === "main" ? button("Ganti…", { size: "sm", action: "layer-swap" }) : ""}`}${paintSwatches(ctx, it, layer)}<span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
    }
    if (isSticker(ctx.doc)) {
      const e = stickerItem(it);
      const paint = layer === "deco" ? "" : `<span class="ic-label">Isi</span><button type="button" class="ic-swatch" data-action="edit-colors" style="background: ${layer === "main" ? e.main.c : e.mod.c}" aria-label="Isi ${LAYER_LABEL[layer].toLowerCase()} ${layer === "main" ? e.main.c : e.mod.c}, ubah warna"></button>`;
      const key = layer === "deco" ? stickerDecoLabel(ctx.doc.style) : keyOf(it, layer);
      return `<span class="ic-label">${LAYER_LABEL[layer]}</span><label class="ic-field ic-field--mono"><input value="${esc(key)}" aria-label="Kunci ${LAYER_LABEL[layer].toLowerCase()}" readonly></label>${layer === "deco" ? "" : button("Ganti…", { size: "sm", action: "layer-swap" })}${layer === "mod" && it.mod !== "none" ? `<span class="ic-sep"></span><span class="ic-label">Posisi</span>${stickerSlots(it)}` : ""}<span class="ic-sep"></span>${paint}<span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
    }
    const anchor =
      layer === "mod" && it.mod !== "none"
        ? `<span class="ic-sep"></span><span class="ic-label">Posisi</span><div class="ic-anchor" data-ic="single" role="group" aria-label="Posisi pengubah" data-name="edit-slot">${ANCHORS.map((k) => (k === "C" ? '<button type="button" disabled aria-label="Tengah"></button>' : `<button type="button" data-value="${k}" ${aria("aria-pressed", it.slot === k)} aria-label="Posisi ${k}"></button>`)).join("")}</div>`
        : "";
    return `<span class="ic-label">${LAYER_LABEL[layer]}</span><label class="ic-field ic-field--mono"><input value="${esc(keyOf(it, layer))}" aria-label="Kunci ${LAYER_LABEL[layer].toLowerCase()}" readonly></label>${button("Ganti…", { size: "sm", action: "layer-swap" })}${anchor}<span class="ic-sep"></span><span class="ic-label">Skala</span>${number(`Skala ${LAYER_LABEL[layer].toLowerCase()}`, ctx.doc.style.scale[layer], { ...scaleRange(layer), step: 1, name: "edit-scale" })}${paintSwatches(ctx, it, layer)}<span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const it = selectedOf(ctx);
    if (!it) return `<div class="studio-center">${empty("Ikon tidak ditemukan.", "Kembali ke ikhtisar halaman untuk memilih ikon.")}</div>`;
    const boxes = boxesOf(ctx, it);
    return `<div class="studio-edit"><div class="ic-artboard-wrap"><span class="ic-artboard__label">${esc(labelOf(ctx, it))} <span class="ic-meta">· 48 × 48${ctx.doc.style.family === "classic" ? ` · mode ${esc(modeOfClassic(it, /** @type {any} */ ({ style: ctx.doc.style, PREFS: ctx.renderer.data.PREFS })))}` : isOffset(ctx.doc) ? " · offset" : isSticker(ctx.doc) ? " · sticker" : ""}</span></span><div class="ic-artboard" data-grid="${ctx.doc.view.grid ? "on" : "off"}" role="img" aria-label="${esc(labelOf(ctx, it))}">${artSvg(ctx, it)}${hitLayer(it, boxes, !isOffset(ctx.doc) && !isSticker(ctx.doc), hitOrder(ctx))}${selbox(it, layerOf(), boxes[layerOf()], !isOffset(ctx.doc) && !isSticker(ctx.doc))}<span class="ic-tooltip" data-role="tooltip" hidden></span></div></div></div>`;
  },
  /**
   * Filmstrip set di bawah kanvas, di luar area zoom.
   * @param {import("./common.js").Ctx} ctx
   */
  canvasFoot(ctx) {
    const it = selectedOf(ctx);
    if (!it) return "";
    const film = itemsOf(ctx)
      .map((x) => `<button type="button" class="ic-filmstrip__item" role="option" data-action="edit-item" data-id="${esc(x.id)}" ${aria("aria-selected", x === it)} aria-label="${esc(labelOf(ctx, x))}">${renderSet(ctx, x, `fs${x.id}`)}</button>`)
      .join("");
    return `<div class="ic-filmstrip" role="listbox" aria-label="Ikon dalam set"><span class="ic-label">Set</span>${film}</div>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels(ctx) {
    const it = selectedOf(ctx);
    const log = (ctx.app.history[ctx.doc.id] || []).slice(0, 30);
    const halaman = pageRows(ctx).replace(/data-select="([^"]+)"/g, 'data-action="edit-item" data-id="$1"');
    return [
      stylePanel(ctx),
      panel({
        id: "edit-layers",
        label: "Lapisan",
        grow: true,
        tabs: [
          { id: "lapisan", label: "Lapisan", body: it ? layerList(ctx, it) : empty("Belum ada ikon terpilih."), flush: !!it },
          { id: "transform", label: "Transform", body: it ? transformBody(ctx, it) : "" },
          { id: "pustaka", label: "Pustaka", body: `${libraryBody(ctx, { target: true, cols: 5 })}${LICENSE_NOTE}` },
        ],
      }),
      panel({
        id: "edit-pages",
        label: "Halaman",
        tabs: [
          { id: "halaman", label: "Halaman", body: halaman, flush: true },
          {
            id: "variasi",
            label: "Variasi",
            body: isOffset(ctx.doc)
              ? empty("Sumbu variasi offset: posisi kilat dan kombinasi dekorasi.", "Acak ulang dan kunci variasi menyusul bersama planner variasi.")
              : isSticker(ctx.doc)
                ? empty("Sumbu variasi sticker: arah sinar, sisi ikal, pola sparkle, dan pasangan warna.", "Acak ulang dan kunci variasi menyusul bersama planner variasi.")
              : empty("Tidak ada sumbu variasi.", "Gaya Klasik dan Aksen belum punya sumbu variasi."),
          },
          {
            id: "riwayat",
            label: "Riwayat",
            body: log.length ? `<div class="ic-list">${log.map((h) => `<div class="ic-row ic-row--sm"><span class="ic-row__name">${esc(h.label)}</span></div>`).join("")}</div>` : `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>`,
            flush: log.length > 0,
          },
        ],
      }),
    ];
  },
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    const items = itemsOf(ctx),
      it = selectedOf(ctx);
    if (isSticker(ctx.doc))
      return statusBar(
        `${it ? items.indexOf(it) + 1 : 0} dari ${items.length}`,
        "<b>Klik</b> lapisan untuk memilih. <b>Seret</b> objek atau pengubah untuk memindah. <b>Panah</b> menggeser 0,5 (Shift 2). Skala, warna isi, dan dekorasi diatur di tab Transform. <b>Delete</b> melepas pengubah atau menyembunyikan dekorasi. <b>Esc</b> kembali ke ikhtisar halaman.",
      );
    return statusBar(
      `${it ? items.indexOf(it) + 1 : 0} dari ${items.length}`,
      "<b>Klik</b> lapisan untuk memilih. <b>Seret</b> untuk memindah. <b>Seret sudut</b> mengubah skala set (Shift 5%). <b>Seret di luar sudut</b> memutar ikon ini (Shift 15°). <b>Panah</b> menggeser 0,5 (Shift 2). <b>[ ]</b> memutar 15°. <b>Delete</b> melepas pengubah atau dekorasi. <b>Esc</b> kembali ke ikhtisar halaman.",
    );
  },
  /** @param {import("./common.js").Ctx} ctx @param {any} doc */
  docTab(ctx, doc) {
    const it = selectedOf(ctx);
    return it && doc === ctx.doc ? `${docFileName(doc)} · ${labelOf(ctx, it)} @ 100%` : `${docFileName(doc)} @ 100%`;
  },
};

