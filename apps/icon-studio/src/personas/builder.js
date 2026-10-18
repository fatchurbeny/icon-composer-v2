// @ts-check
/**
 * Persona Builder · Periksa pack (DESIGN-HANDOFF 3.3).
 * Fase 2b langkah 2: kerangka, impor manifest ke dokumen, dan keadaan "manifest belum diimpor".
 * Kartu per slide, flag, dan ekspor menyusul di langkah 5.
 */
import { button, check, empty, esc, icon, panel, select } from "../ui.js";
import { docFileName, repetitionPanel, statusBar } from "./common.js";

const MODE_LABEL = { X: "Aksen", A: "Klasik · garis-solid", B: "Klasik · solid-garis" };

/** @param {import("./common.js").Ctx} ctx */
const steps = (ctx) => {
  const imported = !!ctx.doc;
  const step = (n, label, state) =>
    `<li class="ic-step"${state === "current" ? ' aria-current="step"' : ""}${state === "done" ? ' data-state="done"' : ""}><span class="ic-step__n">${state === "done" ? "✓" : n}</span>${label}</li>`;
  return `<ol class="ic-steps" aria-label="Langkah Builder">${step(1, "Impor", imported ? "done" : "current")}<li class="ic-steps__line" aria-hidden="true"></li>${step(2, "Periksa", imported ? "current" : "")}<li class="ic-steps__line" aria-hidden="true"></li>${step(3, "Ekspor", "")}</ol>`;
};

/** Area impor manifest (DESIGN-HANDOFF bagian 7). */
const importArea = () =>
  `<div class="studio-center">${empty(
    "Belum ada manifest",
    "Impor manifest JSON dari Claude Design untuk memeriksa pack dan menyiapkan ekspor.",
    `<div class="studio-actions"><label class="ic-btn ic-btn--primary">Impor manifest…<input type="file" accept=".json,application/json" class="studio-file" data-action="import-file"></label>${button("Muat contoh", { action: "import-sample" })}</div><label class="ic-field studio-paste"><textarea rows="6" placeholder="Atau tempel JSON manifest di sini" aria-label="Tempel JSON manifest" data-name="manifest-text"></textarea></label>${button("Impor teks", { size: "sm", action: "import-text" })}<p class="ic-meta" data-role="import-message" role="status"></p>`,
  )}</div>`;

export const builder = {
  persona: "builder",
  layout: "rail",
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    if (!ctx.doc) return `<span class="ic-topbar__info">Belum ada manifest</span>`;
    const m = ctx.doc.manifest || {};
    const slides = (m.deck && m.deck.slides) || 0;
    return `<span class="ic-topbar__info">${esc(ctx.doc.name)}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${esc(m.format || "manifest")} v${esc(m.version || 1)} · ${slides} slide · ${ctx.doc.items.length} ikon${m.skill_version ? ` · skill ${esc(m.skill_version)}` : ""}</span>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  action: (ctx) => `<button type="button" class="ic-actionbtn" data-action="export"${ctx.doc ? "" : " disabled"}>Ekspor pack ZIP ${icon("chevron-down", 13)}</button>`,
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    const n = ctx.doc ? ctx.doc.items.length : 0;
    const extra = ctx.doc ? ctx.doc.items.filter((it) => it.role === "extra").length : 0;
    const chips = `<div class="studio-row" data-ic="single" role="group" aria-label="Saring ikon"><button type="button" class="ic-chip" aria-pressed="true" data-value="all">Semua <span class="ic-meta">${n}</span></button><button type="button" class="ic-chip" aria-pressed="false" data-value="bad">Bermasalah</button><button type="button" class="ic-chip" aria-pressed="false" data-value="slot">Slot deck <span class="ic-meta">${n - extra}</span></button><button type="button" class="ic-chip" aria-pressed="false" data-value="extra">Ekstra <span class="ic-meta">${extra}</span></button></div>`;
    const pv = ctx.doc ? ctx.doc.pv : "A";
    return `${steps(ctx)}<span class="ic-sep"></span>${chips}<span class="ic-spacer"></span><span class="ic-label">Pratinjau</span>${select("Pratinjau", Object.entries(MODE_LABEL), pv, { width: 170, name: "preview" })}${check("Kelompokkan per slide", true, { name: "group-slide" })}`;
  },
  tools: [["select", "Pilih"], ["swap", "Ganti objek"], "sep", ["add-main", "Objek utama"], ["add-mod", "Pengubah"], ["deco", "Kilau"], ["tag", "Kata kunci"], "sep", ["hand", "Geser tampilan"], ["zoom", "Perbesar"]],
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    if (!ctx.doc) return importArea();
    return `<div class="studio-center">${empty(`${ctx.doc.items.length} ikon diimpor`, "Kartu ikon per slide, flag, dan pemeriksaan tampil di sini pada tahap Builder.")}</div>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels(ctx) {
    const it = ctx.doc ? ctx.doc.items.find((x) => x.uid === ctx.app.selection[ctx.doc.id]) || ctx.doc.items[0] : null;
    const iconBody = it
      ? `<div class="ic-formrow"><span class="ic-label">id</span><label class="ic-field ic-field--mono studio-grow"><input value="${esc(it.id)}" aria-label="id ikon" readonly></label></div><div class="ic-formrow"><span class="ic-label">Nama EN</span><label class="ic-field studio-grow"><input value="${esc(it.name.en)}" aria-label="Nama EN" readonly></label></div><div class="ic-formrow"><span class="ic-label">Nama ID</span><label class="ic-field studio-grow"><input value="${esc(it.name.id)}" aria-label="Nama ID" readonly></label></div>`
      : empty("Belum ada ikon.", "Impor manifest untuk memulai.");
    return [
      panel({
        id: "builder-icon",
        label: "Ikon",
        grow: true,
        tabs: [
          { id: "ikon", label: "Ikon", body: iconBody },
          { id: "manifest", label: "Manifest", body: ctx.doc ? `<span class="ic-meta">${esc(ctx.doc.manifest.format || "")} · ${ctx.doc.items.length} ikon</span>` : empty("Belum ada manifest.") },
          { id: "pustaka", label: "Pustaka", body: empty("Pustaka ikon", "Tampil di sini pada tahap Builder.") },
        ],
      }),
      repetitionPanel(ctx, "builder"),
      panel({
        id: "builder-export",
        label: "Gaya ekspor",
        tabs: [
          { id: "gaya", label: "Gaya ekspor", body: `<span class="ic-meta">Aksen · Klasik garis-solid · Klasik solid-garis</span>` },
          { id: "metadata", label: "Metadata", body: `<span class="ic-meta">Metadata Canva diatur di tahap Builder.</span>` },
        ],
      }),
    ];
  },
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    const n = ctx.doc ? ctx.doc.items.length : 0;
    return statusBar(
      ctx.doc ? `1 dari ${n}` : "0 dari 0",
      ctx.doc
        ? "<b>Klik</b> ikon untuk melihat detail. <b>Klik dua kali</b> untuk membuka di Composer."
        : "<b>Impor</b> manifest untuk memulai pemeriksaan pack.",
    );
  },
  docTab: (_ctx, doc) => `${docFileName(doc)} @ 100%`,
};
