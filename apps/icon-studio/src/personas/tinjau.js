// @ts-check
/**
 * Persona Tinjau · Lembar kontak & ekspor (DESIGN-HANDOFF 3.4) pada dokumen aktif.
 * Fase 2b langkah 2: kerangka. Lembar kontak, pemeriksaan, metadata, dan ZIP menyusul di langkah 6.
 */
import { check, empty, esc, icon, panel, seg } from "../ui.js";
import { PREVIEW_BACKGROUNDS } from "../state/data/preview-backgrounds.js";
import { renderSet, statusBar, docFileName } from "./common.js";


export const tinjau = {
  persona: "tinjau",
  layout: "rail",
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    if (!ctx.doc) return `<span class="ic-topbar__info">Belum ada dokumen</span>`;
    return `<span class="ic-topbar__info">${esc(ctx.doc.name)}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${ctx.doc.items.length} diunduh · 0 dikeluarkan</span>`;
  },
  action: () => `<button type="button" class="ic-actionbtn" data-action="export">Ekspor Canva ${icon("chevron-down", 13)}</button>`,
  context() {
    return `<span class="ic-label">Latar</span><div class="ic-swatches" data-ic="single" role="group" aria-label="Latar lembar kontak">${PREVIEW_BACKGROUNDS.map((bg, i) => `<button type="button" class="ic-swatch" data-value="${bg.id}" style="background: ${bg.color}" aria-pressed="${i === 0 ? "true" : "false"}" aria-label="${bg.label}"></button>`).join("")}</div><span class="ic-sep"></span><span class="ic-label">Ukuran</span>${seg("Ukuran pratinjau", [["128", "128"], ["64", "64"], ["32", "32"]], "128", { inline: true, name: "size" })}<span class="ic-sep"></span>${check("Nama file", true, { name: "names" })}${check("Tanda flag", true, { name: "flags" })}<span class="ic-spacer"></span><span class="ic-label">Bandingkan</span>${seg("Bandingkan", [["source", "SVG asli"], ["direct", "Direct fill"]], "source", { inline: true, name: "compare" })}`;
  },
  tools: [["select", "Pilih"], ["magnifier", "Perbesar ikon"], ["compare", "Bandingkan"], "sep", ["hand", "Geser tampilan"]],
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    if (!ctx.doc || !ctx.doc.items.length) return `<div class="studio-center">${empty("Belum ada ikon untuk ditinjau.", "Tambah ikon di Composer atau impor manifest di Builder.")}</div>`;
    if (ctx.doc.kind !== "set") return `<div class="studio-center">${empty(`${ctx.doc.items.length} ikon di manifest`, "Lembar kontak dokumen Builder tampil di sini pada tahap Tinjau.")}</div>`;
    return `<div class="ic-pagegrid">${ctx.doc.items.map((it) => `<div class="ic-page"><span class="ic-page__label">${esc(it.name || it.id)}</span><div class="ic-page__card">${renderSet(ctx, it, `tj${it.id}`)}</div></div>`).join("")}</div>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels: (ctx) => [
    panel({
      id: "tinjau-check",
      label: "Pemeriksaan",
      grow: true,
      tabs: [
        { id: "pemeriksaan", label: "Pemeriksaan", body: ctx.doc && ctx.doc.items.length ? `<span class="ic-meta">Pemeriksaan Canva tampil di sini pada tahap Tinjau.</span>` : empty("Belum ada ikon.") },
        { id: "riwayat", label: "Riwayat", body: `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>` },
      ],
    }),
    panel({
      id: "tinjau-meta",
      label: "Metadata Canva",
      tabs: [
        { id: "metadata", label: "Metadata Canva", body: `<div class="ic-formrow"><span class="ic-label">Artist</span>${seg("Artist", [["hashtagben", "hashtagben"], ["chital", "chital"]], "hashtagben", { name: "artist" })}</div><div class="ic-formrow"><span class="ic-label">Bahasa</span>${seg("Bahasa", [["en", "EN"], ["id", "ID"]], "en", { name: "locale" })}</div>` },
        { id: "kata-kunci", label: "Kata kunci", body: `<span class="ic-meta">15 kata kunci per ikon.</span>` },
      ],
    }),
    panel({
      id: "tinjau-zip",
      label: "Isi ZIP",
      tabs: [{ id: "zip", label: "Isi ZIP", body: `<span class="ic-meta">Pohon isi ZIP tampil di sini pada tahap Tinjau.</span>` }],
    }),
  ],
  /** @param {import("./common.js").Ctx} ctx */
  status: (ctx) => {
    const n = ctx.doc ? ctx.doc.items.length : 0;
    return statusBar(`${n} / ${n} diunduh`, "<b>Klik</b> ikon untuk mengeluarkan atau memasukkan kembali ke unduhan. <b>Klik dua kali</b> untuk mengedit di Composer.");
  },
  docTab: (ctx, doc) => (doc === ctx.doc ? `${docFileName(doc)} · Lembar kontak` : `${docFileName(doc)} @ 100%`),
};
