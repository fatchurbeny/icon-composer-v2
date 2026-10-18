// @ts-check
/**
 * Persona Composer · Set (DESIGN-HANDOFF 3.1) dan Composer · Edit (3.2).
 * Fase 2b langkah 3: Composer · Set lengkap (gaya, halaman, lapisan, pustaka, pool, repetisi, urutan).
 * Composer · Edit masih kerangka sampai langkah 4.
 */
import { get } from "@icon-studio/engines";
import { ACCENT_OPTIONS } from "../state/data/palettes.js";
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
  setStyleValue,
  sortedItems,
} from "../state/set-ops.js";
import { alert, aria, button, check, empty, esc, icon, iconButton, number, panel, select, seg } from "../ui.js";
import {
  COMPOSER_TOOLS,
  ENGINE_CARDS,
  docFileName,
  engineInfo,
  renderSet,
  setColorCount,
  statusBar,
} from "./common.js";
import { LICENSE_NOTE, libraryAction, libraryBody, libraryControl, libraryUi } from "./library-panel.js";

const LAYER_LABEL = { main: "Objek utama", mod: "Pengubah", deco: "Dekorasi" };

/** @param {import("./common.js").Ctx} ctx */
const itemsOf = (ctx) => (ctx.doc ? ctx.doc.items : []);
/** @param {import("./common.js").Ctx} ctx */
const selectedOf = (ctx) => {
  const id = ctx.doc ? ctx.app.selection[ctx.doc.id] : null;
  return itemsOf(ctx).find((it) => it.id === id) || null;
};
/** @param {import("./common.js").Ctx} ctx @param {any} it */
const labelOf = (ctx, it) => nameOf(it, ctx.renderer.lib);
/** @param {import("./common.js").Ctx} ctx */
const dupGroupsOf = (ctx) => duplicateGroups(itemsOf(ctx), (it) => get(ctx.doc.style.family).signature(it));
/** @param {import("./common.js").Ctx} ctx */
const flaggedOf = (ctx) => new Set(dupGroupsOf(ctx).flat().map((it) => it.id));
/** @param {import("./common.js").Ctx} ctx @param {(doc: any) => void} fn @param {string} label */
const mutate = (ctx, fn, label) => ctx.app.mutate(ctx.doc.id, fn, label);
/** @param {import("./common.js").Ctx} ctx */
const rerender = (ctx) => ctx.app.mutate(ctx.doc.id, () => {});

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

/** @param {import("./common.js").Ctx} ctx */
function engineCards(ctx) {
  const family = ctx.doc.style.family;
  const sample = ctx.app.sampleItem({ main: "face", mod: "check", slot: "BR" });
  return `<div class="ic-engines" data-ic="single" role="group" aria-label="Gaya ikon" data-name="engine">${ENGINE_CARDS.map(([id, label]) => {
    const ready = id === "classic" || id === "accent";
    const pv = ready ? ctx.renderer.renderSetItem(sample, { ...ctx.doc.style, family: id }, { idp: `pv${id}` }) : icon(id === "offset" ? "grid" : "edit", 20);
    return `<button type="button" class="ic-engine" data-value="${id}" ${aria("aria-pressed", family === id)}${ready ? "" : ' disabled title="Tersedia setelah Fase 3 dan 4"'}><span class="ic-engine__pv">${pv}</span>${esc(label)}</button>`;
  }).join("")}</div>`;
}

/** @param {import("./common.js").Ctx} ctx */
function stylePanel(ctx) {
  const s = ctx.doc.style,
    classic = s.family === "classic";
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
    `<div class="ic-formrow"><span class="ic-label">Aksen</span><div class="ic-swatches" data-ic="single" role="group" aria-label="Warna aksen" data-name="style:accent">${ACCENT_OPTIONS.map(
      (c) => `<button type="button" class="ic-swatch ic-swatch--round" data-value="${c}" style="background: ${c}" ${aria("aria-pressed", s.accent.toUpperCase() === c)} aria-label="Aksen ${c}"></button>`,
    ).join("")}</div></div>`,
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

/** @param {import("./common.js").Ctx} ctx */
function pageRows(ctx) {
  const items = itemsOf(ctx),
    sel = selectedOf(ctx),
    flagged = flaggedOf(ctx);
  if (!items.length)
    return `<div class="studio-pad">${empty("Belum ada ikon.", "Pilih objek dari Pustaka atau buka Kombinasi.", button("Muat set contoh", { size: "sm", action: "load-preset" }))}</div>`;
  return `<div class="ic-list" role="listbox" aria-label="Halaman set">${items
    .map(
      (it) =>
        `<div class="ic-row" role="option" tabindex="0" data-select="${esc(it.id)}" ${aria("aria-selected", sel === it)}><span class="ic-row__thumb">${renderSet(ctx, it, `row${it.id}`)}</span><span class="ic-row__name">${esc(labelOf(ctx, it))}</span>${flagged.has(it.id) ? '<span class="ic-flag" data-level="err">dobel</span>' : ""}<span class="ic-meta">${esc(it.slot)} · ${esc(it.mod === "none" ? "tanpa pengubah" : it.mod)}</span></div>`,
    )
    .join("")}</div>`;
}

/**
 * Baris lapisan ikon terpilih, dari depan ke belakang. Thumb = ikon dengan satu lapisan saja.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 */
function layerRows(ctx, it) {
  const rows = /** @type {const} */ ([
    ["mod", it.mod === "none" ? "tanpa" : `${it.mod} · ${it.slot}`, it.mod !== "none"],
    ["deco", it.deco && it.deco.type !== "none" ? it.deco.type : "tanpa", !!(it.deco && it.deco.type !== "none")],
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
      { id: "lapisan", label: "Lapisan", body: sel ? `${layerRows(ctx, sel)}<div class="studio-pad studio-stack">${layerScale(ctx)}<div class="studio-actions">${button("Lepas lapisan", { size: "sm", action: "layer-clear", disabled: libraryUi.target === "main" })}</div></div>` : empty("Belum ada ikon terpilih."), flush: !!sel },
      { id: "pustaka", label: "Pustaka", body: `${libraryBody(ctx, { target: true, cols: 5, pool })}${LICENSE_NOTE}` },
      { id: "pool", label: "Pool", body: poolBody(ctx), flush: true },
    ],
  });
}

/* ---------- panel Repetisi | Navigator | Riwayat ---------- */

/** @param {import("./common.js").Ctx} ctx */
function repetitionPanel(ctx) {
  const groups = dupGroupsOf(ctx);
  const dup = groups.reduce((a, g) => a + g.length, 0);
  const n = setColorCount(ctx);
  const stats = `<div class="ic-stats"><div class="ic-stat" data-level="${dup ? "err" : "ok"}"><div class="ic-stat__n">${dup}</div><div class="ic-stat__l">Rakitan dobel</div></div><div class="ic-stat"${n > 5 ? ' data-level="err"' : ""}><div class="ic-stat__n">${n}</div><div class="ic-stat__l">Warna maks</div></div><div class="ic-stat"><div class="ic-stat__n">${itemsOf(ctx).length}</div><div class="ic-stat__l">Ikon</div></div></div>`;
  const alerts = groups.map((g) => alert("err", g.map((it) => labelOf(ctx, it)).join(" = "), "dobel")).join("");
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
const openTab = (panelId, tab) => /** @type {HTMLElement | null} */ (document.querySelector(`[data-panel="${panelId}"] [role="tab"][data-value="${tab}"]`))?.click();

const actions = {
  /** @param {import("./common.js").Ctx} ctx */
  "new-icon"(ctx) {
    mutate(ctx, (doc) => (ctx.app.selection[doc.id] = addItem(doc, ctx.renderer.lib).id), "Ikon baru");
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
        if (sel) replaceLayer(sel, layer, key, ctx.renderer.lib);
        else {
          const it = addItem(doc, ctx.renderer.lib, layer === "main" ? { mod: "none", mx: 0, my: 0 } : {});
          replaceLayer(it, layer, key, ctx.renderer.lib);
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
function control(ctx, name, value) {
  if (libraryControl(ctx, name, value, () => rerender(ctx))) return;
  if (name === "engine") {
    if (value === "classic" || value === "accent") mutate(ctx, (doc) => setStyleValue(doc.style, "family", value), `Gaya ${value === "accent" ? "Aksen" : "Klasik"}`);
    return;
  }
  if (name.startsWith("style:")) {
    const key = name.slice(6);
    return mutate(ctx, (doc) => setStyleValue(doc.style, key, value), `Gaya: ${key} = ${value}`);
  }
  if (name.startsWith("pool:")) {
    const [, kind, ...rest] = name.split(":");
    const key = rest.join(":");
    return mutate(ctx, (doc) => {
      if (value) delete doc.pool.off[`${kind}|${key}`];
      else doc.pool.off[`${kind}|${key}`] = true;
    });
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
        return `<div class="ic-page" data-id="${esc(it.id)}"${draggable ? ' draggable="true"' : ""}><span class="ic-page__label">${esc(label)}</span><button type="button" class="ic-page__card" data-select="${esc(it.id)}" data-open="${esc(it.id)}" ${aria("aria-selected", sel === it)} aria-label="${esc(label)}${flagged.has(it.id) ? ", rakitan dobel" : ""}">${renderSet(ctx, it, `pg${it.id}`)}${flagged.has(it.id) ? '<span class="ic-flag" data-level="err">dobel</span>' : ""}</button></div>`;
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

/** Composer · Edit (kerangka; interaksi kanvas di langkah 4) */
export const composerEdit = {
  ...composerSet,
  viewMode: "single",
  mount: undefined,
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    const it = selectedOf(ctx);
    return `<span class="ic-topbar__info">${esc(engineInfo(ctx.doc.style.family))}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${esc(it ? labelOf(ctx, it) : "")} · 48 × 48 · ${setColorCount(ctx)} warna</span>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    const it = selectedOf(ctx);
    return `<span class="ic-label">Pengubah</span><label class="ic-field ic-field--mono"><input value="${esc(it ? it.mod : "")}" aria-label="Kunci pengubah" readonly></label>${button("Ganti…", { size: "sm", action: "layer-swap" })}<span class="ic-sep"></span><span class="ic-label">Posisi</span><span class="ic-meta">${esc(it ? it.slot : "")}</span><span class="ic-sep"></span>${check("Celah knockout", true, { name: "knockout", disabled: true })}<span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const it = selectedOf(ctx);
    if (!it) return `<div class="studio-center">${empty("Ikon tidak ditemukan.", "Kembali ke ikhtisar halaman untuk memilih ikon.")}</div>`;
    const film = itemsOf(ctx)
      .map((x) => `<button type="button" class="ic-filmstrip__item" role="option" data-select="${esc(x.id)}" ${aria("aria-selected", x === it)} aria-label="${esc(labelOf(ctx, x))}">${renderSet(ctx, x, `fs${x.id}`)}</button>`)
      .join("");
    return `<div class="studio-edit"><div class="ic-artboard-wrap"><span class="ic-artboard__label">${esc(labelOf(ctx, it))} <span class="ic-meta">· 48 × 48</span></span><div class="ic-artboard" data-grid="${ctx.doc.view.grid ? "on" : "off"}">${ctx.renderer.renderSetItem(it, ctx.doc.style, { size: "100%", idp: "editart" }, ctx.doc.customs).replace("<svg ", '<svg class="ic-artboard__art" ')}</div></div></div><div class="ic-filmstrip studio-filmstrip" role="listbox" aria-label="Ikon dalam set"><span class="ic-label">Set</span>${film}</div>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels(ctx) {
    const it = selectedOf(ctx);
    return [
      stylePanel(ctx),
      panel({
        id: "edit-layers",
        label: "Lapisan",
        tabs: [
          { id: "lapisan", label: "Lapisan", body: it ? layerRows(ctx, it) : empty("Belum ada ikon terpilih."), flush: !!it },
          { id: "halaman", label: "Halaman", body: pageRows(ctx), flush: true },
          { id: "pustaka", label: "Pustaka", body: `${libraryBody(ctx, { target: true, cols: 5 })}${LICENSE_NOTE}` },
        ],
      }),
      panel({
        id: "edit-transform",
        label: "Transform",
        grow: true,
        tabs: [
          { id: "transform", label: "Transform", body: it ? `<span class="ic-meta">Objek X ${it.mx} · Y ${it.my} · pengubah X ${it.nx} · Y ${it.ny}</span>` : "" },
          { id: "variasi", label: "Variasi", body: empty("Tidak ada sumbu variasi.", "Gaya Klasik dan Aksen belum punya sumbu variasi.") },
          { id: "riwayat", label: "Riwayat", body: `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>` },
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
      "<b>Seret</b> pengubah untuk memindah. <b>Shift</b> mengunci ke 4 sudut. <b>Esc</b> kembali ke ikhtisar halaman.",
    );
  },
  /** @param {import("./common.js").Ctx} ctx @param {any} doc */
  docTab(ctx, doc) {
    const it = selectedOf(ctx);
    return it && doc === ctx.doc ? `${docFileName(doc)} · ${labelOf(ctx, it)} @ 100%` : `${docFileName(doc)} @ 100%`;
  },
};
