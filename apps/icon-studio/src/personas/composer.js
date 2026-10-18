// @ts-check
/**
 * Persona Composer · Set (DESIGN-HANDOFF 3.1) dan Composer · Edit (3.2).
 * Fase 2b langkah 2: kerangka, data set, dan seleksi. Pengeditan menyusul di langkah 3 dan 4.
 */
import { button, check, empty, esc, icon, iconButton, number, panel, select } from "../ui.js";
import {
  COMPOSER_TOOLS,
  docFileName,
  engineCards,
  engineInfo,
  renderSet,
  repetitionPanel,
  setColorCount,
  statusBar,
} from "./common.js";

const SLOT_NAME = { TL: "TL", TC: "TC", TR: "TR", ML: "ML", MR: "MR", BL: "BL", BC: "BC", BR: "BR" };

/** @param {import("./common.js").Ctx} ctx */
const itemsOf = (ctx) => (ctx.doc ? ctx.doc.items : []);
/** @param {import("./common.js").Ctx} ctx */
const selectedOf = (ctx) => {
  const id = ctx.doc ? ctx.app.selection[ctx.doc.id] : null;
  return itemsOf(ctx).find((it) => it.id === id) || null;
};
/** @param {any} it */
const labelOf = (it) => it.name || it.id;

/** @param {import("./common.js").Ctx} ctx */
function info(ctx) {
  const n = itemsOf(ctx).length;
  return `<span class="ic-topbar__info">${esc(engineInfo(ctx.doc.style.family))}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${n} ikon · 48 × 48 · ${setColorCount(ctx)} warna</span>`;
}

/** @param {import("./common.js").Ctx} ctx */
function pagesPanel(ctx) {
  const items = itemsOf(ctx),
    sel = selectedOf(ctx);
  const rows = items.length
    ? `<div class="ic-list" role="listbox" aria-label="Halaman set">${items
        .map(
          (it) =>
            `<div class="ic-row" role="option" tabindex="0" data-select="${esc(it.id)}" aria-selected="${sel === it ? "true" : "false"}"><span class="ic-row__thumb">${renderSet(ctx, it, `row${it.id}`)}</span><span class="ic-row__name">${esc(labelOf(it))}</span><span class="ic-meta">${esc(SLOT_NAME[it.slot] || it.slot)} · ${esc(it.main)}</span>${icon(it.vis && it.vis.main === false ? "eye-off" : "eye")}</div>`,
        )
        .join("")}</div>`
    : `<div class="studio-pad">${empty("Belum ada ikon.", "Pilih objek dari Pustaka atau buka Kombinasi.", button("Muat set contoh", { size: "sm", action: "load-preset" }))}</div>`;
  const foot = `${iconButton("plus", "Ikon baru", { disabled: true })}${iconButton("duplicate", "Duplikat", { disabled: !sel })}${iconButton("dice", "Acak ulang variasi", { disabled: true })}${iconButton("lock", "Kunci variasi", { disabled: true })}<span class="ic-spacer"></span>${iconButton("trash", "Hapus", { disabled: !sel })}`;
  return panel({
    id: "composer-pages",
    label: "Halaman",
    grow: true,
    foot,
    tabs: [
      { id: "halaman", label: "Halaman", body: rows, flush: true },
      { id: "lapisan", label: "Lapisan", body: sel ? layerRows(ctx, sel) : empty("Belum ada ikon terpilih."), flush: !!sel },
      { id: "pustaka", label: "Pustaka", body: empty("Pustaka ikon", "Lucide, Tabler, Hugeicons, dan Kustom tampil di sini pada tahap Composer · Set.") },
      { id: "pool", label: "Pool", body: empty("Pool kombinasi", "Objek dan pengubah untuk matriks Kombinasi tampil di sini.") },
    ],
  });
}

/**
 * Baris lapisan ikon terpilih, dari depan ke belakang.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 */
function layerRows(ctx, it) {
  const rows = [
    ["Pengubah", it.mod === "none" ? "tanpa" : `${it.mod} · ${it.slot}`, "add-mod"],
    ["Dekorasi", it.deco && it.deco.type !== "none" ? it.deco.type : "tanpa", "deco"],
    ["Objek utama", it.main, "add-main"],
  ];
  return `<div class="ic-list">${rows
    .map(
      ([name, meta, glyph]) =>
        `<div class="ic-row"><span class="ic-row__thumb">${icon(glyph, 20)}</span><span class="ic-row__name">${name}</span><span class="ic-meta">${esc(meta)}</span>${icon("eye")}</div>`,
    )
    .join("")}</div>`;
}

/** @param {import("./common.js").Ctx} ctx */
function stylePanel(ctx) {
  return panel({
    id: "composer-style",
    label: "Gaya",
    tabs: [
      { id: "gaya", label: "Gaya", body: engineCards(ctx, ctx.doc.style.family) },
      { id: "warna", label: "Warna", body: `<span class="ic-meta">Tinta ${esc(ctx.doc.style.ink)} · aksen ${esc(ctx.doc.style.accent)}</span>` },
    ],
  });
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
    const sel = selectedOf(ctx);
    return `<span>${sel ? "1 dipilih" : "0 dipilih"}</span><span class="ic-sep"></span>${check("Snap ke grid", true, { name: "snap" })}<span class="ic-sep"></span>${button("Patokan set…", { size: "sm", action: "baseline" })}${button("Pengaturan app…", { size: "sm", action: "app-settings" })}<span class="ic-sep"></span><span class="ic-label">Urut</span>${select("Urut", [["set", "Urutan set"], ["name", "Nama A–Z"], ["flag", "Per flag"]], "set", { width: 124, name: "sort" })}<span class="ic-label">Kolom</span>${number("Kolom", 8, { min: 2, max: 12, step: 1, name: "cols" })}<span class="ic-spacer"></span>${iconButton("grid", "Tampilkan grid")}${iconButton("settings", "Pengaturan")}`;
  },
  tools: COMPOSER_TOOLS,
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const sel = selectedOf(ctx);
    const pages = itemsOf(ctx)
      .map(
        (it) =>
          `<div class="ic-page"><span class="ic-page__label">${esc(labelOf(it))}</span><button type="button" class="ic-page__card" data-select="${esc(it.id)}" data-open="${esc(it.id)}" aria-selected="${sel === it ? "true" : "false"}" aria-label="${esc(labelOf(it))}">${renderSet(ctx, it, `pg${it.id}`)}</button></div>`,
      )
      .join("");
    return `<div class="ic-pagegrid">${pages}<div class="ic-page ic-page--new"><span class="ic-page__label">Ikon baru</span><button type="button" class="ic-page__card" aria-label="Tambah ikon baru" data-action="new-icon">${icon("plus", 20)}</button></div></div>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels: (ctx) => [stylePanel(ctx), pagesPanel(ctx), repetitionPanel(ctx, "composer")],
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    const items = itemsOf(ctx),
      sel = selectedOf(ctx);
    return statusBar(
      `${sel ? items.indexOf(sel) + 1 : 0} dari ${items.length}`,
      "<b>Klik</b> halaman untuk memilih. <b>Klik dua kali</b> untuk mengedit ikon. <b>Seret</b> untuk mengubah urutan set.",
    );
  },
  /** @param {import("./common.js").Ctx} ctx */
  docTab: (ctx, doc) => `${docFileName(doc)} @ 100%`,
};

/** Composer · Edit */
export const composerEdit = {
  ...composerSet,
  viewMode: "single",
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    const it = selectedOf(ctx);
    return `<span class="ic-topbar__info">${esc(engineInfo(ctx.doc.style.family))}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${esc(it ? labelOf(it) : "")} · 48 × 48 · ${setColorCount(ctx)} warna</span>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    const it = selectedOf(ctx);
    return `<span class="ic-label">Pengubah</span><label class="ic-field ic-field--mono"><input value="${esc(it ? it.mod : "")}" aria-label="Kunci pengubah" readonly></label>${button("Ganti…", { size: "sm", action: "replace-layer" })}<span class="ic-sep"></span><span class="ic-label">Posisi</span><span class="ic-meta">${esc(it ? it.slot : "")}</span><span class="ic-label">Skala</span>${number("Skala", "1.00", { min: 0.5, max: 1.5, step: 0.05, name: "scale" })}<span class="ic-sep"></span>${check("Celah knockout", true, { name: "knockout" })}<span class="ic-spacer"></span>${button("Acak ulang variasi", { size: "sm", disabled: true })}${button("Kunci variasi", { size: "sm", disabled: true })}`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    const it = selectedOf(ctx);
    if (!it) return empty("Ikon tidak ditemukan.", "Kembali ke ikhtisar halaman untuk memilih ikon.");
    return `<div class="studio-edit"><span class="ic-meta">${esc(labelOf(it))} · 48 × 48</span><div class="ic-page__card studio-edit__art">${renderSet(ctx, it, "editart")}</div></div>`;
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
          { id: "halaman", label: "Halaman", body: `<span class="ic-meta">${itemsOf(ctx).length} ikon di set.</span>` },
          { id: "pustaka", label: "Pustaka", body: empty("Pustaka ikon", "Tampil di sini pada tahap Composer · Set.") },
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
  /** @param {import("./common.js").Ctx} ctx */
  docTab(ctx, doc) {
    const it = selectedOf(ctx);
    return it && doc === ctx.doc ? `${docFileName(doc)} · ${labelOf(it)} @ 100%` : `${docFileName(doc)} @ 100%`;
  },
};
