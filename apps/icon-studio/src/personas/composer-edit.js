// @ts-check
/**
 * Persona Composer · Edit (DESIGN-HANDOFF 3.2): satu ikon di artboard 520 px.
 * Pilih lapisan dengan klik, seret untuk memindah, panah 0,5 unit (Shift 2), Delete melepas
 * pengubah atau dekorasi, Esc kembali ke ikhtisar. Logika dari editor Icon Composer 1.5.1.
 */
import { r2 } from "@icon-studio/core";
import { fillOfClassic, modeOfClassic } from "@icon-studio/engines/classic";
import { ROLES } from "@icon-studio/engines/shared";
import { FILL_OPTIONS, LINE_OPTIONS } from "../state/data/palettes.js";
import { LAYER_RANGE, getXY, layerBoxes, resetLayer, setDeco, setPartRole, setSlot, setXY } from "../state/edit-ops.js";
import { clearLayer, setStyleValue } from "../state/set-ops.js";
import { aria, button, empty, esc, icon, number, panel, seg } from "../ui.js";
import { docFileName, engineInfo, renderSet, setColorCount, statusBar } from "./common.js";
import {
  LAYER_LABEL,
  actions as setActions,
  composerSet,
  control as setControl,
  itemsOf,
  labelOf,
  mutate,
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

/**
 * Kotak seleksi dengan 8 handle untuk lapisan terpilih.
 * @param {import("../state/edit-ops.js").Box} b
 */
const selbox = (b) =>
  b.w
    ? `<div class="ic-selbox" data-role="selbox" style="${pct(b)}">${["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((h) => `<span class="ic-selbox__h" data-at="${h}"></span>`).join("")}</div>`
    : "";

/**
 * Wilayah klik tiap lapisan (SVG transparan di atas artboard, seperti overlay IC).
 * @param {Record<string, import("../state/edit-ops.js").Box>} boxes
 */
const hitLayer = (boxes) =>
  `<svg class="studio-hit" viewBox="0 0 48 48" aria-hidden="true">${["main", "mod", "deco"]
    .filter((l) => boxes[l].w)
    .map((l) => `<rect data-hit="${l}" x="${r2(boxes[l].x - 1)}" y="${r2(boxes[l].y - 1)}" width="${r2(boxes[l].w + 2)}" height="${r2(boxes[l].h + 2)}"></rect>`)
    .join("")}</svg>`;

/** @param {import("./common.js").Ctx} ctx @param {any} it */
const artSvg = (ctx, it) => ctx.renderer.renderSetItem(it, ctx.doc.style, { size: "100%", idp: "editart" }, ctx.doc.customs).replace("<svg ", '<svg class="ic-artboard__art" ');

/* ---------- panel ---------- */

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function layerList(ctx, it) {
  const meta = {
    mod: it.mod === "none" ? "tidak ada" : `${it.mod} · ${it.slot}`,
    deco: it.deco.type === "none" ? "tidak ada" : `${it.deco.type} · ${it.deco.x}, ${it.deco.y}`,
    main: `${it.main} · ${ctx.doc.style.scale.main}%`,
  };
  return `<div class="ic-list" role="listbox" aria-label="Lapisan ikon">${["mod", "deco", "main"]
    .map((l) => {
      const only = { ...it, vis: { main: l === "main", mod: l === "mod", deco: l === "deco" } };
      const present = l === "main" || (l === "mod" ? it.mod !== "none" : it.deco.type !== "none");
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

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function transformBody(ctx, it) {
  const layer = layerOf(),
    s = ctx.doc.style,
    accent = s.family === "accent";
  const [x, y] = getXY(it, layer);
  const [min, max] = LAYER_RANGE[layer];
  const box = layerBoxes(it, s, ctx.renderer.data)[layer];
  const out = [
    `<div class="ic-formrow"><span class="ic-label">X</span>${number(`X ${LAYER_LABEL[layer].toLowerCase()}`, x, { min, max, step: 0.5, name: "edit-x" })}<span class="ic-label">Y</span>${number(`Y ${LAYER_LABEL[layer].toLowerCase()}`, y, { min, max, step: 0.5, name: "edit-y" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">W × H</span><span class="ic-meta">${r2(box.w)} × ${r2(box.h)}</span></div>`,
  ];
  if (layer === "deco") {
    const D = ctx.renderer.data.DECOS;
    out.push(
      `<div class="ic-formrow"><span class="ic-label">Rotasi</span>${number("Rotasi dekorasi", it.deco.r || 0, { min: -180, max: 180, step: 15, name: "edit-rot" })}</div>`,
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
  "layer-swap"() {
    if (layerOf() === "deco") return openTab("edit-transform", "transform");
    openTab("edit-layers", "pustaka");
  },
  "edit-colors"() {
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
  if (name === "edit-slot") return mutateItem(ctx, (it) => setSlot(it, String(value), ctx.renderer.data.SHIFT), `Posisi pengubah ${value}`);
  if (name === "edit-scale") return mutate(ctx, (doc) => setStyleValue(doc.style, `scale.${layer}`, value), `Skala ${LAYER_LABEL[layer].toLowerCase()} ${value}`);
  if (name === "edit-x" || name === "edit-y")
    return mutateItem(ctx, (it) => {
      const [x, y] = getXY(it, layer);
      setXY(it, layer, name === "edit-x" ? Number(value) : x, name === "edit-y" ? Number(value) : y, { snap: ctx.doc.view.snap });
    }, `Geser ${LAYER_LABEL[layer].toLowerCase()}`);
  if (name === "edit-rot") return mutateItem(ctx, (it) => (it.deco.r = Math.max(-180, Math.min(180, Math.round(Number(value) / 15) * 15) || 0)), "Rotasi dekorasi");
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
  if (!ctx || !ctx.route.edit || !ctx.doc) return;
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
  } else if ((e.key === "Delete" || e.key === "Backspace") && (layer === "mod" || layer === "deco")) {
    e.preventDefault();
    mutateItem(ctx, (it) => clearLayer(it, layer), `Lepas ${LAYER_LABEL[layer].toLowerCase()}`);
  }
}

/**
 * Seret lapisan di artboard. Selama menyeret, hanya gambar, kotak seleksi, dan tooltip yang diperbarui;
 * dokumen disimpan saat dilepas.
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
  /** @type {{layer: any, sx: number, sy: number, f: number, x0: number, y0: number, moved: boolean, id: number} | null} */
  let drag = null;
  board.addEventListener("pointerdown", (e) => {
    const hit = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-hit]"));
    if (!hit) return;
    const layer = /** @type {any} */ (hit.dataset.hit);
    const [x0, y0] = getXY(it, layer);
    drag = { layer, sx: e.clientX, sy: e.clientY, f: 48 / board.getBoundingClientRect().width, x0, y0, moved: false, id: e.pointerId };
    if (libraryUi.target !== layer) {
      libraryUi.target = layer;
      drag = null;
      return rerender(ctx);
    }
    board.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  board.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3) return;
    drag.moved = true;
    setXY(it, drag.layer, drag.x0 + (e.clientX - drag.sx) * drag.f, drag.y0 + (e.clientY - drag.sy) * drag.f, { snap: ctx.doc.view.snap });
    const art = board.querySelector(".ic-artboard__art");
    if (art) art.outerHTML = artSvg(ctx, it);
    const b = layerBoxes(it, ctx.doc.style, ctx.renderer.data)[drag.layer];
    const sb = /** @type {HTMLElement | null} */ (board.querySelector('[data-role="selbox"]'));
    if (sb) sb.setAttribute("style", pct(b));
    const tip = /** @type {HTMLElement | null} */ (board.querySelector('[data-role="tooltip"]'));
    if (tip) {
      tip.hidden = false;
      tip.textContent = `X ${r2(b.x)}  Y ${r2(b.y)}`;
      tip.style.left = `${r2(((b.x + b.w) / 48) * 100)}%`;
      tip.style.top = `${r2(((b.y + b.h) / 48) * 100)}%`;
    }
  });
  const end = (/** @type {PointerEvent} */ e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved,
      layer = drag.layer;
    drag = null;
    if (moved) mutate(ctx, () => {}, `Geser ${LAYER_LABEL[layer].toLowerCase()}`);
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
    const anchor =
      layer === "mod" && it.mod !== "none"
        ? `<span class="ic-sep"></span><span class="ic-label">Posisi</span><div class="ic-anchor" data-ic="single" role="group" aria-label="Posisi pengubah" data-name="edit-slot">${ANCHORS.map((k) => (k === "C" ? '<button type="button" disabled aria-label="Tengah"></button>' : `<button type="button" data-value="${k}" ${aria("aria-pressed", it.slot === k)} aria-label="Posisi ${k}"></button>`)).join("")}</div>`
        : "";
    const fill = fillOf(ctx, it, layer);
    return `<span class="ic-label">${LAYER_LABEL[layer]}</span><label class="ic-field ic-field--mono"><input value="${esc(keyOf(it, layer))}" aria-label="Kunci ${LAYER_LABEL[layer].toLowerCase()}" readonly></label>${button("Ganti…", { size: "sm", action: "layer-swap" })}${anchor}<span class="ic-sep"></span><span class="ic-label">Skala</span>${number(`Skala ${LAYER_LABEL[layer].toLowerCase()}`, ctx.doc.style.scale[layer], { min: layer === "main" ? 60 : 50, max: layer === "main" ? 100 : layer === "mod" ? 150 : 200, step: 1, name: "edit-scale" })}<span class="ic-label">Isi</span><button type="button" class="ic-swatch" data-action="edit-colors" style="background: ${fill}" aria-label="Isi ${LAYER_LABEL[layer].toLowerCase()} ${fill}, ubah warna"></button><span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const it = selectedOf(ctx);
    if (!it) return `<div class="studio-center">${empty("Ikon tidak ditemukan.", "Kembali ke ikhtisar halaman untuk memilih ikon.")}</div>`;
    const boxes = layerBoxes(it, ctx.doc.style, ctx.renderer.data);
    return `<div class="studio-edit"><div class="ic-artboard-wrap"><span class="ic-artboard__label">${esc(labelOf(ctx, it))} <span class="ic-meta">· 48 × 48${ctx.doc.style.family === "classic" ? ` · mode ${esc(modeOfClassic(it, /** @type {any} */ ({ style: ctx.doc.style, PREFS: ctx.renderer.data.PREFS })))}` : ""}</span></span><div class="ic-artboard" data-grid="${ctx.doc.view.grid ? "on" : "off"}" role="img" aria-label="${esc(labelOf(ctx, it))}">${artSvg(ctx, it)}${hitLayer(boxes)}${selbox(boxes[layerOf()])}<span class="ic-tooltip" data-role="tooltip" hidden></span></div></div></div>`;
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
          { id: "variasi", label: "Variasi", body: empty("Tidak ada sumbu variasi.", "Gaya Klasik dan Aksen belum punya sumbu variasi.") },
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
      "<b>Klik</b> lapisan untuk memilih. <b>Seret</b> untuk memindah. <b>Panah</b> menggeser 0,5 (Shift 2). <b>Delete</b> melepas pengubah atau dekorasi. <b>Esc</b> kembali ke ikhtisar halaman.",
    );
  },
  /** @param {import("./common.js").Ctx} ctx @param {any} doc */
  docTab(ctx, doc) {
    const it = selectedOf(ctx);
    return it && doc === ctx.doc ? `${docFileName(doc)} · ${labelOf(ctx, it)} @ 100%` : `${docFileName(doc)} @ 100%`;
  },
};

