// @ts-check
/**
 * Persona Kombinasi · Matriks + pustaka (DESIGN-HANDOFF 3.5), kerangka `.ic-shell--left-studio`.
 * Fase 2b langkah 2: kerangka. Pustaka, pool, dan matriks menyusul di langkah 7.
 */
import { button, check, empty, esc, panel, seg, select } from "../ui.js";
import { statusBar, docFileName } from "./common.js";

export const kombinasi = {
  persona: "kombinasi",
  layout: "left-studio",
  /** @param {import("./common.js").Ctx} ctx */
  info: (ctx) =>
    `<span class="ic-topbar__info">${esc(ctx.doc ? ctx.doc.name : "")}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">0 objek × 0 pengubah = 0 kombinasi</span>`,
  action: () => `<button type="button" class="ic-actionbtn ic-actionbtn--persona" data-action="add-combos" disabled>Tambahkan 0 ke set</button>`,
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    const family = ctx.doc ? ctx.doc.style.family : "classic";
    return `<span class="ic-label">Gaya</span>${select("Gaya", [["classic", "Klasik"], ["accent", "Aksen"], ["offset", "Offset"], ["hand-writing", "Hand-writing"]], family, { width: 130, name: "family" })}<span class="ic-sep"></span><span class="ic-label">Posisi pengubah</span>${seg("Posisi pengubah", [["mod", "Bawaan pengubah"], ["TR", "Paksa TR"], ["BR", "Paksa BR"]], "mod", { inline: true, name: "slot" })}<span class="ic-label">Warna pengubah</span>${seg("Warna pengubah", [["mod", "Dari pengubah"], ["main", "Ikut objek"]], "mod", { inline: true, name: "mod-color" })}${button("Pilih semua", { size: "sm", disabled: true })}${button("Lewati semua", { size: "sm", disabled: true })}<span class="ic-spacer"></span>${check("Lewati yang sudah ada", true, { name: "skip-existing" })}${check("Lewati yang mirip", true, { name: "skip-similar", disabled: true })}`;
  },
  tools: [],
  /** @param {import("./common.js").Ctx} ctx */
  canvas: (ctx) =>
    `<div class="studio-center">${ctx.doc && ctx.doc.kind === "set" ? empty("Matriks kombinasi masih kosong.", "Pilih objek dan pengubah dari Pustaka ke pool untuk menyusun matriks.") : empty("Kombinasi bekerja pada set Composer.", "Buka sebuah set di Composer lebih dulu.")}</div>`,
  leftPanels: () => [
    panel({
      id: "kombinasi-library",
      label: "Pustaka",
      grow: true,
      tabs: [
        { id: "pustaka", label: "Pustaka", body: empty("Pustaka ikon", "Lucide, Tabler, Hugeicons, dan Kustom tampil di sini pada tahap Kombinasi.") },
        { id: "kustom", label: "Kustom", body: empty("Belum ada ikon kustom.") },
        { id: "riwayat", label: "Riwayat", body: `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>` },
      ],
      foot: `<span class="ic-meta">Lucide ISC · Tabler MIT · Hugeicons Free MIT</span>`,
    }),
  ],
  panels: () => [
    panel({
      id: "kombinasi-pool",
      label: "Pool",
      grow: true,
      tabs: [
        { id: "pool", label: "Pool", body: empty("Pool masih kosong.", "Klik ikon di Pustaka untuk menambah objek atau pengubah.") },
        { id: "aturan", label: "Aturan", body: `<span class="ic-meta">Aturan kombinasi tampil di sini.</span>` },
      ],
    }),
    panel({
      id: "kombinasi-result",
      label: "Hasil",
      tabs: [{ id: "hasil", label: "Hasil", body: `<span class="ic-meta">0 dipilih · 0 sudah ada di set · 0 dilewati</span>${button("Tambahkan 0 ke set", { kind: "primary", block: true, disabled: true })}` }],
    }),
  ],
  status: () => statusBar("0 / 0 dipilih", "<b>Klik</b> sel untuk memilih atau melewati. <b>Klik</b> kepala baris/kolom untuk semua di baris/kolom itu. <b>Seret</b> ikon dari pustaka ke pool."),
  docTab: (ctx, doc) => (doc === ctx.doc ? `${docFileName(doc)} · Matriks kombinasi` : `${docFileName(doc)} @ 100%`),
};
