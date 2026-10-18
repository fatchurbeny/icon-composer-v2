// @ts-check
/**
 * Bagian kerangka yang dipakai lebih dari satu persona.
 */
import { get } from "@icon-studio/engines";
import { packColors } from "@icon-studio/export";
import { esc, icon, iconButton, panel } from "../ui.js";

/**
 * @typedef {{
 *   app: ReturnType<typeof import("../app-state.js").createAppState>,
 *   renderer: ReturnType<typeof import("../state/render.js").createRenderer>,
 *   route: import("../app-state.js").Route,
 *   doc: any,
 * }} Ctx
 */

/** Mesin yang tampil di kartu gaya (ADR-017: sticker menyusul di Fase 5). */
export const ENGINE_CARDS = [
  ["classic", "Klasik"],
  ["accent", "Aksen"],
  ["offset", "Offset"],
  ["hand-writing", "Hand-wr."],
];

/** @param {string} family */
export const engineInfo = (family) => {
  const engine = get(family);
  return `${({ classic: "Klasik", accent: "Aksen", offset: "Offset", "hand-writing": "Hand-writing" })[engine.id] || engine.label} ${engine.version}`;
};

/**
 * SVG satu ikon set Composer.
 * @param {Ctx} ctx
 * @param {any} it
 * @param {string} idp
 */
export const renderSet = (ctx, it, idp) => ctx.renderer.renderSetItem(it, ctx.doc.style, { idp }, ctx.doc.customs);

/**
 * Jumlah warna terlihat seluruh set (maks 5 untuk Canva).
 * @param {Ctx} ctx
 */
export function setColorCount(ctx) {
  if (!ctx.doc || !ctx.doc.items.length) return 0;
  return packColors(ctx.doc.items, (it) => renderSet(ctx, it, "cc")).size;
}

/**
 * Rakitan dobel: signature sama di set (packages/engines signature()).
 * @param {any} doc
 */
export function duplicateCount(doc) {
  if (!doc) return 0;
  const engine = get(doc.kind === "manifest" ? "classic" : doc.style.family);
  const seen = new Map();
  for (const it of doc.items) {
    const key = engine.signature(it);
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  return [...seen.values()].filter((n) => n > 1).reduce((a, n) => a + n, 0);
}

/**
 * Kartu pemilih mesin (panel Gaya).
 * @param {Ctx} ctx
 * @param {string} active
 */
export function engineCards(ctx, active) {
  const sample = { main: "face", mod: "check", slot: "BR" };
  return `<div class="ic-engines" data-ic="single" role="group" aria-label="Gaya ikon" data-name="engine">${ENGINE_CARDS.map(([id, label]) => {
    let pv = icon(id === "offset" ? "grid" : "edit", 20);
    if (id === "classic" || id === "accent") {
      const style = { ...ctx.doc.style, family: id };
      const it = ctx.app.sampleItem(sample);
      pv = ctx.renderer.renderSetItem(it, style, { idp: `pv${id}` });
    }
    return `<button type="button" class="ic-engine" data-value="${id}" ${active === id ? 'aria-pressed="true"' : 'aria-pressed="false"'}><span class="ic-engine__pv">${pv}</span>${esc(label)}</button>`;
  }).join("")}</div>`;
}

/**
 * Panel Repetisi | Navigator | Riwayat. Hanya rakitan dobel dari signature (ADR-017).
 * @param {Ctx} ctx
 * @param {string} prefix id unik panel
 */
export function repetitionPanel(ctx, prefix) {
  const dup = duplicateCount(ctx.doc);
  const colors = ctx.doc && ctx.doc.kind === "set" ? setColorCount(ctx) : 0;
  const n = ctx.doc ? ctx.doc.items.length : 0;
  const body = `<div class="ic-stats"><div class="ic-stat" data-level="${dup ? "err" : "ok"}"><div class="ic-stat__n">${dup}</div><div class="ic-stat__l">Rakitan dobel</div></div><div class="ic-stat"${colors > 5 ? ' data-level="err"' : ""}><div class="ic-stat__n">${colors}</div><div class="ic-stat__l">Warna maks</div></div><div class="ic-stat"><div class="ic-stat__n">${n}</div><div class="ic-stat__l">Ikon</div></div></div>`;
  return panel({
    id: `${prefix}-rep`,
    label: "Repetisi",
    tabs: [
      { id: "repetisi", label: "Repetisi", body },
      { id: "navigator", label: "Navigator", body: `<span class="ic-meta">Navigator kanvas menyusul.</span>` },
      { id: "riwayat", label: "Riwayat", body: `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>` },
    ],
  });
}

/** Tool rail Composer (DESIGN-HANDOFF 3.1). */
export const COMPOSER_TOOLS = [
  ["select", "Pilih"],
  ["move", "Geser"],
  "sep",
  ["add-main", "Objek utama"],
  ["add-mod", "Pengubah"],
  ["deco", "Dekorasi"],
  ["combine", "Kombinasi massal"],
  "sep",
  ["eyedropper", "Ambil warna"],
  ["hand", "Geser tampilan"],
  ["zoom", "Perbesar"],
];

/**
 * Bilah status: posisi + petunjuk.
 * @param {string} position
 * @param {string} hint markup petunjuk (kata kerja tebal)
 */
export const statusBar = (position, hint) =>
  `<span class="ic-field ic-mono studio-status-field">${esc(position)}</span><span class="ic-sep"></span><span>${hint}</span>`;

/** Tombol ikon Bantuan di bilah atas. */
export const helpButton = () => iconButton("help", "Bantuan", { size: 20, extra: "ic-iconbtn--help", action: "help" });

/**
 * Nama file dokumen di tab dokumen: `<nama>.icset` atau `<nama>.manifest`.
 * @param {any} doc
 */
export const docFileName = (doc) => `${doc.name}.${doc.kind === "set" ? "icset" : "manifest"}`;
