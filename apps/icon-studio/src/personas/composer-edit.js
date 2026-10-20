// @ts-check
/**
 * Persona Composer · Edit (DESIGN-HANDOFF 3.2): satu ikon di artboard 520 px.
 * Pilih lapisan dengan klik (panel Transform ikut terbuka), seret untuk memindah, seret pegangan sudut
 * untuk skala set, seret di luar sudut untuk memutar per ikon, panah 0,5 unit (Shift 2), [ ] memutar 15°,
 * Delete melepas pengubah atau dekorasi, Esc kembali ke ikhtisar. Logika dari editor Icon Composer 1.5.1.
 */
import { r2 } from "@icon-studio/core";
import { fillOfClassic, modeOfClassic } from "@icon-studio/engines/classic";
import { offsetParams } from "@icon-studio/engines/offset";
import { ROLES } from "@icon-studio/engines/shared";
import { FILL_OPTIONS, LINE_OPTIONS } from "../state/data/palettes.js";
import {
  LAYER_RANGE,
  ROT_RANGE,
  angleFromDrag,
  getRot,
  getXY,
  resetLayer,
  rotCenter,
  rotatePt,
  scaleFromDrag,
  scalePivot,
  setDeco,
  setPartRole,
  setRot,
  setSlot,
  setXY,
} from "../state/edit-ops.js";
import { clearLayer, setOffsetDeco, setStyleValue } from "../state/set-ops.js";
import { alert, aria, button, check, empty, esc, icon, number, panel, seg } from "../ui.js";
import { NO_MOD_TEXT, docFileName, engineFlags, engineInfo, isOffset, renderSet, setColorCount, statusBar } from "./common.js";
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

const ROLE_NAME = { ink: "Tinta", acc: "Aksen", fillA: "Isi aksen", fill: "Isi tinta" };
const UNDER_NAME = { none: "Tanpa", full: "Penuh", offset: "Geser", half: "Separuh" };
const ANCHORS = ["TL", "TC", "TR", "ML", "C", "MR", "BL", "BC", "BR"];

/** Lapisan terpilih di mode edit (sama dengan target klik pustaka). */
const layerOf = () => /** @type {import("../state/edit-ops.js").Layer} */ (libraryUi.target);

/** @param {import("./common.js").Ctx} ctx */
const classicCtx = (ctx) => ({ style: ctx.doc.style, PREFS: ctx.renderer.data.PREFS });

/** @param {import("./common.js").Ctx} ctx @param {any} it @param {string} layer */
const fillOf = (ctx, it, layer) => fillOfClassic(it, /** @type {any} */ (classicCtx(ctx)), layer);

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
 * @param {boolean} edit false untuk offset (tanpa rotasi per lapisan)
 */
const hitLayer = (it, boxes, edit) =>
  `<svg class="studio-hit" viewBox="0 0 48 48" aria-hidden="true">${/** @type {const} */ (["main", "mod", "deco"])
    .filter((l) => boxes[l].w)
    .map((l) => {
      const b = boxes[l],
        r = edit ? getRot(it, l) : 0,
        c = rotCenter(it, l, b);
      return `<rect data-hit="${l}" x="${r2(b.x - 1)}" y="${r2(b.y - 1)}" width="${r2(b.w + 2)}" height="${r2(b.h + 2)}"${r ? ` transform="rotate(${r} ${r2(c.x)} ${r2(c.y)})"` : ""}></rect>`;
    })
    .join("")}</svg>`;

/** @param {import("./common.js").Ctx} ctx @param {any} it */
const artSvg = (ctx, it) => ctx.renderer.renderSetItem(it, ctx.doc.style, { size: "100%", idp: "editart" }, ctx.doc.customs).replace("<svg ", '<svg class="ic-artboard__art" ');

/* ---------- panel ---------- */

/** @param {import("./common.js").Ctx} ctx @param {any} it @param {any} doc */
const boxesOf = (ctx, it, doc = ctx.doc) => ctx.renderer.boxesOf(it, doc.style);

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function layerList(ctx, it) {
  const off = isOffset(ctx.doc);
  const meta = off
    ? { mod: NO_MOD_TEXT, deco: offsetDecoLabel(it), main: `${it.main} · 84%` }
    : {
        mod: it.mod === "none" ? "tidak ada" : `${it.mod} · ${it.slot}`,
        deco: it.deco.type === "none" ? "tidak ada" : `${it.deco.type} · ${it.deco.x}, ${it.deco.y}`,
        main: `${it.main} · ${ctx.doc.style.scale.main}%`,
      };
  return `<div class="ic-list" role="listbox" aria-label="Lapisan ikon">${["mod", "deco", "main"]
    .map((l) => {
      const only = { ...it, vis: { main: l === "main", mod: l === "mod", deco: l === "deco" } };
      const present = l === "main" || (off ? l === "deco" && meta.deco !== "tanpa" : l === "mod" ? it.mod !== "none" : it.deco.type !== "none");
      return `<div class="ic-row" role="option" tabindex="0" data-action="layer-select" data-layer="${l}" ${aria("aria-selected", layerOf() === l)}><span class="ic-row__thumb">${present ? renderSet(ctx, only, `el${l}`) : ""}</span><span class="ic-row__name">${LAYER_LABEL[l]}<span class="ic-row__sub">${esc(meta[l])}</span></span><button type="button" class="ic-iconbtn" data-action="edit-eye" data-layer="${l}" ${aria("aria-pressed", it.vis[l])} aria-label="${it.vis[l] ? "Sembunyikan" : "Tampilkan"} ${LAYER_LABEL[l].toLowerCase()}">${icon(it.vis[l] ? "eye" : "eye-off")}</button></div>`;
    })
    .join("")}</div>`;
}

/**
 * Swatch warna lapisan (berlaku untuk semua ikon di set, seperti IC).
 * @param {string} name
 * @param {string} label
 * @param {(string | null)[]} options
 * @param {string | null} current
 * @param {string} fallback warna set
 */
const colorSwatches = (name, label, options, current, fallback) =>
  `<div class="ic-formrow"><span class="ic-label">${esc(label)}</span><div class="ic-swatches" data-ic="single" role="group" aria-label="${esc(label)}" data-name="${name}">${options
    .map(
      (c) =>
        `<button type="button" class="ic-swatch" data-value="${c || ""}" style="background: ${c || fallback}" ${aria("aria-pressed", (current || null) === c)} aria-label="${c ? `${label} ${c}` : `${label} ikuti warna set`}"></button>`,
    )
    .join("")}</div></div>`;

/** Rentang skala set lapisan (STYLE_RANGES), sama dengan kolom Skala di bilah konteks. */
const scaleRange = (/** @type {string} */ layer) => ({ min: layer === "main" ? 60 : 50, max: layer === "main" ? 100 : layer === "mod" ? 150 : 200 });

/** Opsi: buka panel Transform saat lapisan dipilih (bawaan menyala, disimpan di `view.panel`). */
const autoPanelCheck = (/** @type {import("./common.js").Ctx} */ ctx) => check("Buka panel ini saat memilih lapisan", ctx.doc.view.panel !== false, { name: "edit-autopanel" });

/**
 * Pilih lapisan lalu buka panel yang berhubungan dengannya (tab Transform berisi kontrol lapisan terpilih).
 * Memakai openTab supaya perilaku lipat panel studio ikut berlaku.
 * @param {import("./common.js").Ctx} ctx
 * @param {import("../state/edit-ops.js").Layer} layer
 */
function selectLayer(ctx, layer) {
  libraryUi.target = layer;
  rerender(ctx);
  if (ctx.doc.view.panel !== false) openTab("edit-transform", "transform");
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

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function transformBody(ctx, it) {
  if (isOffset(ctx.doc)) return offsetTransformBody(ctx, it);
  const layer = layerOf(),
    s = ctx.doc.style,
    accent = s.family === "accent";
  const [x, y] = getXY(it, layer);
  const [min, max] = LAYER_RANGE[layer];
  const box = boxesOf(ctx, it)[layer];
  const out = [
    `<div class="ic-formrow"><span class="ic-label">X</span>${number(`X ${LAYER_LABEL[layer].toLowerCase()}`, x, { min, max, step: 0.5, name: "edit-x" })}<span class="ic-label">Y</span>${number(`Y ${LAYER_LABEL[layer].toLowerCase()}`, y, { min, max, step: 0.5, name: "edit-y" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">W × H</span><span class="ic-meta">${r2(box.w)} × ${r2(box.h)}</span></div>`,
    `<div class="ic-formrow"><span class="ic-label">Skala</span>${number(`Skala ${LAYER_LABEL[layer].toLowerCase()} semua ikon`, s.scale[layer], { ...scaleRange(layer), step: 1, name: "edit-scale" })}<span class="ic-label">Rotasi</span>${number(`Rotasi ${LAYER_LABEL[layer].toLowerCase()}`, getRot(it, layer), { min: ROT_RANGE[0], max: ROT_RANGE[1], step: 1, name: "edit-rot" })}</div>`,
    `<span class="ic-meta">Skala berlaku untuk semua ikon di set. Rotasi hanya untuk ikon ini.</span>`,
  ];
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
    colorSwatches("edit-line", accent ? "Tinta" : layer === "deco" ? "Warna" : "Garis", LINE_OPTIONS, c.line, s.ink),
    colorSwatches("edit-fill", "Isian", FILL_OPTIONS, c.fill, s.accent),
    `<div class="studio-actions">${button("Reset posisi", { size: "sm", action: "edit-reset" })}${button("Warna ikut set", { size: "sm", action: "edit-color-reset", disabled: !c.line && !c.fill })}</div>`,
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
    if (layerOf() === "deco") return openTab("edit-transform", "transform");
    openTab("edit-layers", "pustaka");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "edit-colors"(ctx) {
    if (isOffset(ctx.doc)) return openTab("composer-style", "warna");
    openTab("edit-transform", "transform");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "edit-reset"(ctx) {
    mutateItem(ctx, (it) => resetLayer(it, layerOf(), ctx.renderer.data), `Reset posisi ${LAYER_LABEL[layerOf()].toLowerCase()}`);
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
  if (name === "edit-slot") return mutateItem(ctx, (it) => setSlot(it, String(value), ctx.renderer.data.SHIFT), `Posisi pengubah ${value}`);
  if (name === "edit-scale") return mutate(ctx, (doc) => setStyleValue(doc.style, `scale.${layer}`, value), `Skala ${LAYER_LABEL[layer].toLowerCase()} ${value}`);
  if (name === "edit-x" || name === "edit-y")
    return mutateItem(ctx, (it) => {
      const [x, y] = getXY(it, layer);
      setXY(it, layer, name === "edit-x" ? Number(value) : x, name === "edit-y" ? Number(value) : y, { snap: ctx.doc.view.snap });
    }, `Geser ${LAYER_LABEL[layer].toLowerCase()}`);
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
  const step = e.shiftKey ? 2 : 0.5;
  const map = /** @type {Record<string, [number, number]>} */ ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] });
  if (map[e.key]) {
    e.preventDefault();
    const it = selectedOf(ctx);
    if (!it) return;
    const [x, y] = getXY(it, layer);
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
    if (hit) hit.outerHTML = hitLayer(it, boxes, true);
    const sb = board.querySelector('[data-role="selbox"]');
    if (sb) sb.outerHTML = selbox(it, layer, boxes[layer], true);
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
    /* offset: posisi lapisan mengikuti patokan gaya, jadi lapisan hanya bisa dipilih */
    if (isOffset(ctx.doc)) return;
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
    setXY(it, drag.layer, drag.x0 + p.x - drag.p0.x, drag.y0 + p.y - drag.p0.y, { snap: ctx.doc.view.snap });
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
      const acc = offsetParams(ctx.doc.style).acc;
      const key = layer === "mod" ? "" : layer === "main" ? it.main : offsetDecoLabel(it);
      return `<span class="ic-label">${LAYER_LABEL[layer]}</span>${layer === "mod" ? `<span class="ic-meta">${NO_MOD_TEXT}</span>` : `<label class="ic-field ic-field--mono"><input value="${esc(key)}" aria-label="Kunci ${LAYER_LABEL[layer].toLowerCase()}" readonly></label>${layer === "main" ? button("Ganti…", { size: "sm", action: "layer-swap" }) : ""}`}<span class="ic-sep"></span><span class="ic-label">Isi</span><button type="button" class="ic-swatch" data-action="edit-colors" style="background: ${acc}" aria-label="Aksen offset ${acc}, ubah warna"></button><span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
    }
    const anchor =
      layer === "mod" && it.mod !== "none"
        ? `<span class="ic-sep"></span><span class="ic-label">Posisi</span><div class="ic-anchor" data-ic="single" role="group" aria-label="Posisi pengubah" data-name="edit-slot">${ANCHORS.map((k) => (k === "C" ? '<button type="button" disabled aria-label="Tengah"></button>' : `<button type="button" data-value="${k}" ${aria("aria-pressed", it.slot === k)} aria-label="Posisi ${k}"></button>`)).join("")}</div>`
        : "";
    const fill = fillOf(ctx, it, layer);
    return `<span class="ic-label">${LAYER_LABEL[layer]}</span><label class="ic-field ic-field--mono"><input value="${esc(keyOf(it, layer))}" aria-label="Kunci ${LAYER_LABEL[layer].toLowerCase()}" readonly></label>${button("Ganti…", { size: "sm", action: "layer-swap" })}${anchor}<span class="ic-sep"></span><span class="ic-label">Skala</span>${number(`Skala ${LAYER_LABEL[layer].toLowerCase()}`, ctx.doc.style.scale[layer], { ...scaleRange(layer), step: 1, name: "edit-scale" })}<span class="ic-label">Isi</span><button type="button" class="ic-swatch" data-action="edit-colors" style="background: ${fill}" aria-label="Isi ${LAYER_LABEL[layer].toLowerCase()} ${fill}, ubah warna"></button><span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const it = selectedOf(ctx);
    if (!it) return `<div class="studio-center">${empty("Ikon tidak ditemukan.", "Kembali ke ikhtisar halaman untuk memilih ikon.")}</div>`;
    const boxes = boxesOf(ctx, it);
    return `<div class="studio-edit"><div class="ic-artboard-wrap"><span class="ic-artboard__label">${esc(labelOf(ctx, it))} <span class="ic-meta">· 48 × 48${ctx.doc.style.family === "classic" ? ` · mode ${esc(modeOfClassic(it, /** @type {any} */ ({ style: ctx.doc.style, PREFS: ctx.renderer.data.PREFS })))}` : isOffset(ctx.doc) ? " · offset" : ""}</span></span><div class="ic-artboard" data-grid="${ctx.doc.view.grid ? "on" : "off"}" role="img" aria-label="${esc(labelOf(ctx, it))}">${artSvg(ctx, it)}${hitLayer(it, boxes, !isOffset(ctx.doc))}${selbox(it, layerOf(), boxes[layerOf()], !isOffset(ctx.doc))}<span class="ic-tooltip" data-role="tooltip" hidden></span></div></div></div>`;
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
        tabs: [
          { id: "lapisan", label: "Lapisan", body: it ? layerList(ctx, it) : empty("Belum ada ikon terpilih."), flush: !!it },
          { id: "halaman", label: "Halaman", body: halaman, flush: true },
          { id: "pustaka", label: "Pustaka", body: `${libraryBody(ctx, { target: true, cols: 5 })}${LICENSE_NOTE}` },
        ],
      }),
      panel({
        id: "edit-transform",
        label: "Transform",
        grow: true,
        tabs: [
          { id: "transform", label: "Transform", body: it ? transformBody(ctx, it) : "" },
          {
            id: "variasi",
            label: "Variasi",
            body: isOffset(ctx.doc)
              ? empty("Sumbu variasi offset: posisi kilat dan kombinasi dekorasi.", "Acak ulang dan kunci variasi menyusul bersama planner variasi.")
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

