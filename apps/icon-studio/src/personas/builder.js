// @ts-check
/**
 * Persona Builder · Periksa pack (DESIGN-HANDOFF 3.3): Impor → Periksa → Ekspor.
 * Logika validasi, flag, dan isi ZIP ada di state/builder-ops.js (dari Template Icon Builder 1.6.0).
 */
import { buildZip } from "@icon-studio/export";
import { ROLES } from "@icon-studio/engines/shared";
import {
  BRAND_KEY,
  MODE_INFO,
  buildExportFiles,
  dupMap,
  exportList,
  flagsOf,
  isBad,
  metaOf,
  packOf,
  sheetGrid,
} from "../state/builder-ops.js";
import { MODES, SPARKS, kebab2, sparkHome } from "../state/document.js";
import { setSlot } from "../state/edit-ops.js";
import { alert, aria, button, check, empty, esc, icon, panel, seg, select } from "../ui.js";
import { docFileName, statusBar } from "./common.js";
import { LICENSE_NOTE, libraryAction, libraryBody, libraryControl, libraryUi } from "./library-panel.js";

const ROLE_NAME = { ink: "Tinta", acc: "Aksen", fillA: "Isi aksen", fill: "Isi tinta" };
const UNDER_NAME = { none: "Tanpa", full: "Penuh", offset: "Geser", half: "Separuh" };
const ANCHORS = ["TL", "TC", "TR", "ML", "C", "MR", "BL", "BC", "BR"];
const PREVIEW_LABEL = { X: "Aksen", A: "Klasik · garis-solid", B: "Klasik · solid-garis" };

/** Status ekspor terakhir (bukan bagian dokumen). */
let exportStatus = "";

/** @returns {string} */
function brandId() {
  try {
    return (localStorage.getItem(BRAND_KEY) || "").trim();
  } catch {
    return "";
  }
}

/** @param {import("./common.js").Ctx} ctx */
const deps = (ctx) => ({ vocab: ctx.app.vocab, renderer: ctx.renderer, style: ctx.doc.style });
/** @param {import("./common.js").Ctx} ctx */
const selectedOf = (ctx) => (ctx.doc ? ctx.doc.items.find((/** @type {any} */ it) => it.uid === ctx.app.selection[ctx.doc.id]) || null : null);
/** @param {import("./common.js").Ctx} ctx @param {any} it @param {string} mode @param {string} idp @param {any} [size] */
const render = (ctx, it, mode, idp, size) => ctx.renderer.renderManifestItem(it, mode, ctx.doc.style, { idp, size });
/** @param {import("./common.js").Ctx} ctx @param {(doc: any) => void} fn @param {string} [label] */
const mutate = (ctx, fn, label) => ctx.app.mutate(ctx.doc.id, fn, label);
/** @param {import("./common.js").Ctx} ctx @param {(it: any) => void} fn @param {string} [label] */
const mutateItem = (ctx, fn, label) => {
  const it = selectedOf(ctx);
  if (it) mutate(ctx, () => fn(it), label);
};
/** @param {import("./common.js").Ctx} ctx */
const rerender = (ctx) => ctx.doc && mutate(ctx, () => {});

/**
 * Lencana kartu dari flag TIB: dobel, sama dengan pustaka, masalah, cek, atau dikeluarkan.
 * @param {any} it
 * @param {[string, string][]} fl
 * @returns {[string, string] | null}
 */
function badgeOf(it, fl) {
  if (!it.on) return ["info", "keluar"];
  const dup = fl.find((f) => f[1] === "Rakitan dobel di pack");
  if (dup) return ["err", "dobel"];
  const same = fl.find((f) => f[1].startsWith("Mirip "));
  if (same) return ["err", `= ${same[1].slice(6)}`];
  if (fl.some((f) => f[0] === "err")) return ["err", "masalah"];
  if (fl.length) return ["warn", "cek"];
  return null;
}

/** @param {import("./common.js").Ctx} ctx */
function filtered(ctx) {
  const dm = dupMap(ctx.doc.items),
    f = ctx.doc.view.filter;
  return ctx.doc.items.filter((/** @type {any} */ it) =>
    f === "bad" ? flagsOf(it, dm, deps(ctx)).length > 0 : f === "slot" ? it.role === "slot" : f === "extra" ? it.role === "extra" : f === "off" ? !it.on : true,
  );
}

/* ---------- konteks ---------- */

/** @param {import("./common.js").Ctx} ctx */
function steps(ctx) {
  const step = ctx.doc ? ctx.doc.view.step : "import";
  const st = (/** @type {string} */ id, /** @type {number} */ n, /** @type {string} */ label) => {
    const order = ["import", "check", "export"];
    const done = order.indexOf(id) < order.indexOf(step) || (id === "import" && !!ctx.doc && step !== "import");
    return `<li class="ic-step"${step === id ? ' aria-current="step"' : ""}${done ? ' data-state="done"' : ""}><button type="button" class="studio-steplink" data-action="b-step" data-step="${id}"${!ctx.doc && id !== "import" ? " disabled" : ""}><span class="ic-step__n">${done ? "✓" : n}</span>${label}</button></li>`;
  };
  return `<ol class="ic-steps" aria-label="Langkah Builder">${st("import", 1, "Impor")}<li class="ic-steps__line" aria-hidden="true"></li>${st("check", 2, "Periksa")}<li class="ic-steps__line" aria-hidden="true"></li>${st("export", 3, "Ekspor")}</ol>`;
}

/* ---------- kanvas ---------- */

/** Area impor manifest (`.ic-dropzone`, DESIGN-HANDOFF bagian 7). */
const importArea = () =>
  `<div class="studio-center"><div class="ic-dropzone" data-dragover="false"><span class="ic-dropzone__title">Seret manifest JSON ke sini</span><span>Atau pilih file dari Claude Design. Builder memeriksa nama objek, pengubah, dan id ikon.</span><div class="ic-dropzone__actions"><label class="ic-btn ic-btn--primary">Pilih file…<input type="file" accept=".json,application/json" data-action="import-file"></label>${button("Muat contoh", { action: "import-sample" })}</div><label class="ic-field ic-field--area studio-stretch"><textarea rows="6" placeholder="Atau tempel JSON manifest di sini" aria-label="Tempel JSON manifest" data-name="manifest-text"></textarea></label>${button("Impor teks", { size: "sm", action: "import-text" })}<p class="ic-meta" data-role="import-message" role="status"></p></div></div>`;

/**
 * Kartu ikon Builder.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 * @param {Record<string, number>} dm
 */
function card(ctx, it, dm) {
  const fl = flagsOf(it, dm, deps(ctx));
  const badge = badgeOf(it, fl);
  const sel = selectedOf(ctx) === it;
  return `<button type="button" class="ic-iconcard" data-select="${esc(it.uid)}" ${aria("aria-selected", sel)}${badge && badge[0] === "err" ? ' data-level="err"' : ""} aria-label="${esc(it.id)}${fl.length ? ": " + esc(fl.map((f) => f[1]).join(", ")) : ""}"><span class="ic-iconcard__art">${render(ctx, it, ctx.doc.pv, `g${it.uid}`)}${badge ? `<span class="ic-flag" data-level="${badge[0]}">${esc(badge[1])}</span>` : ""}</span><span class="ic-iconcard__id">${esc(it.id)}</span></button>`;
}

/** @param {import("./common.js").Ctx} ctx */
function checkCanvas(ctx) {
  const items = filtered(ctx),
    dm = dupMap(ctx.doc.items);
  if (!items.length) return `<div class="studio-center">${empty("Tidak ada ikon di filter ini.")}</div>`;
  if (!ctx.doc.view.group) return `<div class="ic-cardgrid" style="--ic-cols: 8">${items.map((it) => card(ctx, it, dm)).join("")}</div>`;
  /** @type {Map<string, any[]>} */
  const groups = new Map();
  for (const it of items) {
    const key = it.role === "extra" ? "extra" : String(it.slides[0] || 0).padStart(2, "0");
    groups.set(key, [...(groups.get(key) || []), it]);
  }
  const keys = [...groups.keys()].sort((a, b) => (a === "extra" ? 1 : b === "extra" ? -1 : a.localeCompare(b)));
  return `<div class="ic-slidegrid">${keys
    .map((k) => {
      const list = groups.get(k) || [];
      const title = k === "extra" ? "Ekstra" : k === "00" ? "Tanpa slide" : `Slide ${Number(k)}`;
      return `<div class="ic-slidegroup"><div class="ic-slidegroup__head"><span class="ic-slidegroup__no">${k === "extra" ? "··" : k}</span><span class="ic-slidegroup__title">${title}</span><span class="ic-hsep"></span><span class="ic-meta">${list.length} ${k === "extra" ? "ikon" : "slot"}</span></div><div class="ic-cardgrid">${list.map((it) => card(ctx, it, dm)).join("")}</div></div>`;
    })
    .join("")}</div>`;
}

/** Pratinjau Resource Page di langkah Ekspor (klik sel mengeluarkan atau memasukkan ikon). @param {import("./common.js").Ctx} ctx */
function exportCanvas(ctx) {
  const list = exportList(ctx.doc, ctx.doc.export, deps(ctx));
  const all = ctx.doc.items;
  const cols = sheetGrid(list.length, ctx.doc.export.sheetCols);
  return `<div class="ic-sheet" style="--ic-sheet-icon: 72px; --ic-cols: ${cols}"><div class="ic-sheet__head"><span class="ic-sheet__title">Resource Page</span><span class="ic-sheet__meta">${list.length} ikon · ${esc(/** @type {any} */ (MODE_INFO)[ctx.doc.pv].short)}</span></div><div class="ic-sheet__grid">${all
    .map(
      (/** @type {any} */ it) =>
        `<button type="button" class="ic-sheet__cell" data-action="b-toggle-on" data-uid="${esc(it.uid)}" ${aria("aria-pressed", list.includes(it))} aria-label="${esc(it.id)}${list.includes(it) ? ", ikut diekspor" : ", tidak ikut"}"><span class="ic-sheet__badge">dikeluarkan</span>${render(ctx, it, ctx.doc.pv, `sh${it.uid}`)}<span class="ic-sheet__file">${esc(it.id)}</span></button>`,
    )
    .join("")}</div></div>`;
}

/* ---------- panel ---------- */

/** @param {import("./common.js").Ctx} ctx @param {any} it */
function iconBody(ctx, it) {
  if (!it) return empty("Belum ada ikon terpilih.", "Klik ikon di kanvas.");
  const fl = flagsOf(it, dupMap(ctx.doc.items), deps(ctx));
  const field = (/** @type {string} */ label, /** @type {string} */ name, /** @type {string} */ value, mono = false) =>
    `<div class="ic-formrow"><span class="ic-label">${label}</span><label class="ic-field${mono ? " ic-field--mono" : ""} studio-grow" data-name="${name}"><input value="${esc(value)}" aria-label="${label}"></label></div>`;
  const out = [
    `<div class="ic-cardgrid" style="--ic-cols: 3">${MODES.map((m) => `<div class="ic-iconcard"><span class="ic-iconcard__art">${render(ctx, it, m, `d${m}`)}</span><span class="ic-iconcard__id">${esc(/** @type {any} */ (MODE_INFO)[m].short)}</span></div>`).join("")}</div>`,
    check("Masuk pack", it.on, { name: "b-on" }),
    fl.length ? fl.map(([lv, t]) => alert(/** @type {any} */ (lv), t)).join("") : alert("ok", "Rakitan unik, tidak ada nama serupa di Lucide, Tabler, atau Hugeicons."),
    field("id", "b-id", it.id, true),
    field("Nama EN", "b-en", it.name.en),
    field("Nama ID", "b-idn", it.name.id),
    `<div class="ic-formrow"><span class="ic-label">Objek</span><label class="ic-field ic-field--mono studio-grow"><input value="${esc(it.main)}" aria-label="Objek utama" readonly></label>${button("Ganti", { size: "sm", action: "b-swap", label: "Ganti objek utama" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Pengubah</span><label class="ic-field ic-field--mono studio-grow"><input value="${esc(it.mod)}" aria-label="Pengubah" readonly></label>${button("Ganti", { size: "sm", action: "b-swap-mod", label: "Ganti pengubah" })}${button("Lepas", { size: "sm", action: "b-mod-none", disabled: it.mod === "none" })}</div>`,
  ];
  if (it.mod !== "none")
    out.push(
      `<div class="ic-formrow"><span class="ic-label">Posisi</span><div class="ic-anchor" data-ic="single" role="group" aria-label="Posisi pengubah" data-name="b-slot">${ANCHORS.map((k) => (k === "C" ? '<button type="button" disabled aria-label="Tengah"></button>' : `<button type="button" data-value="${k}" ${aria("aria-pressed", it.slot === k)} aria-label="Posisi ${k}"></button>`)).join("")}</div></div>`,
    );
  out.push(`<div class="ic-formrow"><span class="ic-label">Kata kunci</span><div class="studio-tags">${[...it.keywords.en].map((k) => `<span class="ic-tag">${esc(k)}</span>`).join("") || '<span class="ic-meta">dari pustaka saat ekspor</span>'}</div></div>`);
  if (ctx.doc.pv === "X") {
    const info = ctx.renderer.mainInfo(it.main),
      roles = ctx.renderer.rolesOf(it, info),
      hasBody = info.parts.some((/** @type {any} */ p) => p.body);
    out.push(
      `<span class="ic-label">Gaya Aksen</span>`,
      ...info.parts.map(
        (/** @type {any} */ p, /** @type {number} */ i) =>
          `<div class="ic-formrow"><span class="ic-meta" aria-hidden="true">${i + 1}</span><div class="ic-seg studio-grow" data-ic="single" role="group" aria-label="Warna bagian ${i + 1}" data-name="b-part:${i}">${ROLES.map((r) => `<button type="button" data-value="${r}" ${aria("aria-pressed", roles[i] === r)}${!p.closed && r.startsWith("fill") ? " disabled" : ""}>${/** @type {any} */ (ROLE_NAME)[r]}</button>`).join("")}</div></div>`,
      ),
      `<div class="ic-formrow"><span class="ic-label">Isi bidang</span><div class="ic-seg" data-ic="single" role="group" aria-label="Isi bidang" data-name="b-under">${Object.entries(UNDER_NAME).map(([k, n]) => `<button type="button" data-value="${k}" ${aria("aria-pressed", it.under === k)}${!hasBody && k !== "none" ? " disabled" : ""}>${n}</button>`).join("")}</div></div>`,
      it.mod !== "none" ? `<div class="ic-formrow"><span class="ic-label">Penanda</span>${seg("Penanda", [["line", "Garis"], ["fill", "Isi"]], it.mstyle, { name: "b-mstyle" })}</div>` : "",
      `<div class="ic-formrow"><span class="ic-label">Kilau</span>${seg("Kilau", SPARKS.map((k) => /** @type {[string, string]} */ ([k, k === "none" ? "Tanpa" : ctx.renderer.data.DECOS[k].n])), (it.deco || {}).type || "none", { name: "b-spark" })}</div>`,
      `<div class="studio-actions">${button("Warna bagian otomatis", { size: "sm", action: "b-parts-auto", disabled: !it.parts })}</div>`,
    );
  }
  return out.join("");
}

/** @param {import("./common.js").Ctx} ctx */
function manifestBody(ctx) {
  const doc = ctx.doc,
    dm = dupMap(doc.items);
  const slots = doc.items.filter((/** @type {any} */ i) => i.role === "slot").length;
  const bad = doc.items.filter((/** @type {any} */ i) => isBad(i, dm, deps(ctx))).length;
  const issues = doc.issues.length ? doc.issues : [["ok", "Semua nama objek dan pengubah dikenali."]];
  return [
    doc.isSample ? alert("warn", "Ini data contoh, bukan manifest Anda.", "contoh") : "",
    `<div class="ic-stats"><div class="ic-stat"><div class="ic-stat__n">${doc.items.length}</div><div class="ic-stat__l">Ikon</div></div><div class="ic-stat"><div class="ic-stat__n">${slots}</div><div class="ic-stat__l">Slot deck</div></div><div class="ic-stat"${bad ? ' data-level="err"' : ' data-level="ok"'}><div class="ic-stat__n">${bad}</div><div class="ic-stat__l">Perlu dicek</div></div></div>`,
    `<span class="ic-meta">${esc((doc.manifest.deck && doc.manifest.deck.title) || "Tanpa judul")} · tema pack ${esc(packOf(doc.manifest).en || "–")} · tinta ${esc(doc.style.ink)} · aksen ${esc(doc.style.accent)}</span>`,
    ...issues.map(([lv, t, fix], n) => `${alert(/** @type {any} */ (lv), t)}${fix ? button(`Pakai saran ${esc(fix.to)}`, { size: "sm", action: "b-fix", label: `Pakai saran ${fix.to}` }).replace("<button", `<button data-i="${n}"`) : ""}`),
    `<div class="studio-actions">${button("Impor manifest lain…", { size: "sm", action: "b-step", label: "Impor manifest lain" }).replace("<button", '<button data-step="import"')}</div>`,
  ].join("");
}

/** @param {import("./common.js").Ctx} ctx */
function repetitionBody(ctx) {
  const dm = dupMap(ctx.doc.items),
    d = deps(ctx);
  const dupIds = ctx.doc.items.filter((/** @type {any} */ it) => it.on && dm[it.main + "|" + it.mod] > 1);
  const same = ctx.doc.items.filter((/** @type {any} */ it) => ctx.app.vocab.collisions(it).length);
  const bad = ctx.doc.items.filter((/** @type {any} */ it) => it.on && isBad(it, dm, d));
  const groups = new Map();
  for (const it of dupIds) groups.set(it.main + "|" + it.mod, [...(groups.get(it.main + "|" + it.mod) || []), it.id]);
  return [
    `<div class="ic-stats"><div class="ic-stat" data-level="${dupIds.length ? "err" : "ok"}"><div class="ic-stat__n">${dupIds.length}</div><div class="ic-stat__l">Rakitan dobel</div></div><div class="ic-stat" data-level="${same.length ? "err" : "ok"}"><div class="ic-stat__n">${same.length}</div><div class="ic-stat__l">Sama dg pustaka</div></div><div class="ic-stat"${bad.length ? ' data-level="err"' : ""}><div class="ic-stat__n">${bad.length}</div><div class="ic-stat__l">Bermasalah</div></div></div>`,
    ...[...groups.values()].map((ids) => alert("err", ids.join(" = "), "dobel")),
    ...same.map((it) => alert("err", `${it.id} = ${ctx.app.vocab.collisions(it)[0]}`, "pustaka")),
    `<div class="studio-actions">${button("Ratakan variasi", { kind: "primary", disabled: true, label: "Ratakan variasi (Fase 6)" })}${button("Lewati bermasalah", { action: "b-skip-bad", disabled: !bad.length })}</div>`,
  ].join("");
}

/** Arti tanda (legend TIB). */
const LEGEND = [
  ["err", "Sama dengan ikon pustaka: nama gabungannya sudah ada di Lucide, Tabler, atau Hugeicons (mis. user-plus)."],
  ["warn", "Tanpa body: objek tanpa bidang tertutup. Mode Solid·garis memberi pelat bulat aksen."],
  ["err", "Tanpa pengubah: ikon pustaka tanpa tambahan sama saja dengan salinan."],
  ["warn", "Tidak dikenal: nama dari manifest tidak ada di kosakata. Pilih pengganti."],
];

/** @param {import("./common.js").Ctx} ctx */
function exportBody(ctx) {
  const doc = ctx.doc,
    o = doc.export,
    d = deps(ctx);
  const list = exportList(doc, o, d);
  const styles = MODES.filter((m) => o.modes[m]);
  const nS = doc.items.filter((/** @type {any} */ i) => i.on && i.role !== "extra").length,
    nE = doc.items.filter((/** @type {any} */ i) => i.on && i.role === "extra").length;
  const sample = selectedOf(ctx) || doc.items[0];
  const rows = MODES.map(
    (m) =>
      `<div class="ic-row ic-row--sm"><label class="ic-check" data-name="b-mode:${m}"><input type="checkbox"${o.modes[m] ? " checked" : ""} aria-label="Ekspor ${esc(/** @type {any} */ (PREVIEW_LABEL)[m])}"></label><span class="ic-row__thumb">${sample ? render(ctx, sample, m, `ex${m}`) : ""}</span><span class="ic-row__name">${esc(/** @type {any} */ (PREVIEW_LABEL)[m])}</span><span class="ic-meta">${esc(/** @type {any} */ (MODE_INFO)[m].dir)}/</span></div>`,
  ).join("");
  const base = kebab2(o.name) || "icon-pack";
  const tree = [`${base}.zip`, ...styles.map((s) => `├─ ${/** @type {any} */ (MODE_INFO)[s].dir}/  ${list.length} svg`), "├─ metadata.csv (Canva)", "├─ metadata-internal.csv", "├─ submission-profile.json", "├─ resource-page.html", "├─ manifest-final.json", "└─ LICENSES.txt"].join("\n");
  return `${rows}<div class="studio-pad studio-stack">${check(`Ikon slot deck · ${nS}`, o.slot, { name: "b-ex:slot" })}${check(`Ikon ekstra · ${nE}`, o.extra, { name: "b-ex:extra", disabled: !nE })}${check("Pisahkan folder slot deck dan ekstra", o.split, { name: "b-ex:split" })}${check("Lewati ikon yang masih bermasalah", o.skipBad, { name: "b-ex:skipBad" })}<pre class="ic-meta studio-tree">${esc(tree)}</pre>${alert("ok", "SVG fill langsung untuk Canva: semua stroke jadi outline, satu path per warna.")}${button(`Unduh ZIP · ${list.length * styles.length} SVG`, { kind: "primary", block: true, action: "b-export", disabled: !list.length || !styles.length })}<p class="ic-meta" role="status" data-role="export-status">${esc(exportStatus)}</p></div>`;
}

/** @param {import("./common.js").Ctx} ctx */
function metadataBody(ctx) {
  const doc = ctx.doc,
    o = doc.export,
    pk = packOf(doc.manifest),
    brand = brandId();
  const list = exportList(doc, o, deps(ctx));
  const field = (/** @type {string} */ label, /** @type {string} */ name, /** @type {string} */ value) =>
    `<div class="ic-formrow"><span class="ic-label">${label}</span><label class="ic-field studio-grow" data-name="${name}"><input value="${esc(value)}" aria-label="${label}"></label></div>`;
  const first = list[0];
  const ex = first ? metaOf(first, MODES.find((m) => o.modes[m]) || doc.pv, 15, { man: doc.manifest, brand, tagsOf: () => [] }) : null;
  return [
    field("Nama pack", "b-name", o.name),
    field("Tema EN", "b-pack-en", pk.en),
    field("Tema ID", "b-pack-id", pk.id),
    field("ID brand", "b-brand", brand),
    `<div class="ic-formrow"><span class="ic-label">Artist</span>${seg("Artist", [["hashtagben", "hashtagben"], ["chital", "chital"]], o.creator, { name: "b-creator" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Bahasa</span>${seg("Bahasa metadata", [["en", "EN"], ["id", "ID"]], o.locale, { name: "b-locale" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Kata kunci</span>${select("Kata kunci per bahasa", [["10", "10"], ["15", "15"], ["20", "20"], ["25", "25"]], String(o.kw), { width: 80, name: "b-kw" })}<span class="ic-meta">per ikon</span></div>`,
    `<label class="ic-field ic-field--area" data-name="b-desc"><textarea rows="3" aria-label="Deskripsi pack" placeholder="Deskripsi pack (opsional), diterapkan ke semua ikon">${esc(o.description)}</textarea></label>`,
    ex ? `<span class="ic-meta">Contoh judul: ${esc(ex.title_en)}<br>Cari di Elements: ${esc(ex.search)}</span>` : "",
    brand && !/^BA[A-Za-z0-9_-]{6,}$/.test(brand) ? alert("warn", "ID brand biasanya diawali BA. Periksa lagi.") : "",
  ].join("");
}

/* ---------- aksi dan kontrol ---------- */

/**
 * Ganti objek atau pengubah (setKey TIB): pengubah baru menggeser objek utama ke slotnya.
 * @param {import("./common.js").Ctx} ctx
 * @param {any} it
 * @param {"main" | "mod"} kind
 * @param {string} k
 */
function setKey(ctx, it, kind, k) {
  it[kind] = k;
  if (k !== "none" && ctx.renderer.LIB_RE.test(k)) ctx.renderer.lib.ensure(k, kind);
  if (kind === "mod") [it.mx, it.my] = k === "none" ? [0, 0] : ctx.renderer.data.SHIFT[it.slot] || [0, 0];
  ctx.app.revalidate(ctx.doc);
}

/** @param {string} panelId @param {string} tab */
const openTab = (panelId, tab) => /** @type {HTMLElement | null} */ (document.querySelector(`[data-panel="${panelId}"] [role="tab"][data-value="${tab}"]`))?.click();

/**
 * Unduh blob lewat tautan sementara (saveFile TIB).
 * @param {string} filename
 * @param {Blob} blob
 */
function saveFile(filename, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const actions = {
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "b-step"(ctx, el) {
    const step = el.dataset.step || "check";
    if (!ctx.doc) return;
    mutate(ctx, (doc) => (doc.view.step = step));
  },
  /** @param {import("./common.js").Ctx} ctx */
  export(ctx) {
    if (ctx.doc) mutate(ctx, (doc) => (doc.view.step = "export"));
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "b-toggle-on"(ctx, el) {
    const it = ctx.doc.items.find((/** @type {any} */ x) => x.uid === el.dataset.uid);
    if (it) mutate(ctx, () => (it.on = !it.on), `${it.id} ${it.on ? "dikeluarkan" : "dimasukkan"}`);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "b-fix"(ctx, el) {
    const f = ctx.doc.issues[Number(el.dataset.i)];
    const fix = f && f[2];
    const it = fix && ctx.doc.items.find((/** @type {any} */ x) => x.uid === fix.uid);
    if (it) mutate(ctx, () => setKey(ctx, it, fix.kind, fix.to), `Saran ${fix.to}`);
  },
  "b-swap"() {
    libraryUi.target = "main";
    openTab("builder-icon", "pustaka");
  },
  "b-swap-mod"() {
    libraryUi.target = "mod";
    openTab("builder-icon", "pustaka");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "b-mod-none"(ctx) {
    mutateItem(ctx, (it) => setKey(ctx, it, "mod", "none"), "Lepas pengubah");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "b-parts-auto"(ctx) {
    mutateItem(ctx, (it) => (it.parts = null), "Warna bagian otomatis");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "b-skip-bad"(ctx) {
    const dm = dupMap(ctx.doc.items),
      d = deps(ctx);
    mutate(ctx, (doc) => doc.items.forEach((/** @type {any} */ it) => isBad(it, dm, d) && (it.on = false)), "Lewati bermasalah");
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "lib-pick"(ctx, el, /** @type {any} */ { toast }) {
    const key = el.dataset.key;
    const kind = libraryUi.target === "mod" ? "mod" : "main";
    if (key) mutateItem(ctx, (it) => setKey(ctx, it, kind, key), `${kind === "main" ? "Objek" : "Pengubah"} = ${key}`);
    toast(`${kind === "main" ? "Objek utama" : "Pengubah"} diganti ${key}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "lib-more": (ctx) => libraryAction(ctx, "lib-more", () => rerender(ctx)),
  /** @param {import("./common.js").Ctx} ctx */
  "lib-retry": (ctx) => libraryAction(ctx, "lib-retry", () => rerender(ctx)),
  /** @param {import("./common.js").Ctx} ctx */
  async "b-export"(ctx, /** @type {any} */ _el, /** @type {any} */ { toast }) {
    const doc = ctx.doc;
    const JSZip = /** @type {any} */ (window).JSZip;
    if (!JSZip) {
      exportStatus = "JSZip tidak termuat. Periksa koneksi internet.";
      return rerender(ctx);
    }
    exportStatus = "Mengambil tag pustaka untuk kata kunci…";
    rerender(ctx);
    const result = await buildExportFiles(doc, doc.export, { renderer: ctx.renderer, vocab: ctx.app.vocab, brand: brandId() });
    if (result.error || !result.files) {
      exportStatus = result.error || "Ekspor gagal.";
      return rerender(ctx);
    }
    saveFile(`${result.base}.zip`, await buildZip(JSZip, result.files));
    const dropped = doc.items.filter((/** @type {any} */ i) => !result.list.includes(i)).map((/** @type {any} */ i) => i.id);
    exportStatus = `${result.list.length} ikon × ${result.styles.length} gaya diekspor. ${result.list.length * result.styles.length} SVG dikonversi menjadi shape.` + (dropped.length ? ` Tidak ikut: ${dropped.join(", ")}. Hapus juga dari Resource Page di deck.` : "");
    toast("ZIP diunduh");
    mutate(ctx, () => {}, "Ekspor ZIP");
  },
};

/**
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {any} value
 */
function control(ctx, name, value) {
  if (!ctx.doc) return;
  if (libraryControl(ctx, name, value, () => rerender(ctx))) return;
  const doc = ctx.doc;
  if (name === "b-filter") return mutate(ctx, () => (doc.view.filter = value));
  if (name === "b-preview") return mutate(ctx, () => (doc.pv = MODES.includes(value) ? value : doc.pv));
  if (name === "b-group") return mutate(ctx, () => (doc.view.group = !!value));
  if (name === "b-on") return mutateItem(ctx, (it) => (it.on = !!value), value ? "Masuk pack" : "Dikeluarkan dari pack");
  if (name === "b-id") return mutateItem(ctx, (it) => (it.id = kebab2(value) || it.id), "Ubah id");
  if (name === "b-en") return mutateItem(ctx, (it) => (it.name.en = String(value).slice(0, 60)), "Ubah nama EN");
  if (name === "b-idn") return mutateItem(ctx, (it) => (it.name.id = String(value).slice(0, 60)), "Ubah nama ID");
  if (name === "b-slot") return mutateItem(ctx, (it) => setSlot(it, String(value), ctx.renderer.data.SHIFT), `Posisi ${value}`);
  if (name === "b-under") return mutateItem(ctx, (it) => (it.under = value), "Isi bidang");
  if (name === "b-mstyle") return mutateItem(ctx, (it) => (it.mstyle = value === "fill" ? "fill" : "line"), "Penanda");
  if (name === "b-spark")
    return mutateItem(ctx, (it) => {
      const h = sparkHome(it.slot, value, ctx.renderer.data.DECOS);
      it.deco =
        value === "none"
          ? { type: "none", x: 9, y: 9, r: 0, color: "accent" }
          : { type: value, x: it.deco && it.deco.type !== "none" ? it.deco.x : h[0], y: it.deco && it.deco.type !== "none" ? it.deco.y : h[1], r: 0, color: "accent" };
    }, "Kilau");
  if (name.startsWith("b-part:"))
    return mutateItem(ctx, (it) => {
      const info = ctx.renderer.mainInfo(it.main),
        roles = ctx.renderer.rolesOf(it, info),
        i = Number(name.slice(7)),
        p = info.parts[i];
      if (!p || (!p.closed && String(value).startsWith("fill"))) return;
      it.parts = Object.fromEntries(roles.map((/** @type {string} */ r, /** @type {number} */ j) => [j, r]));
      it.parts[i] = value;
    }, "Warna bagian");
  if (name.startsWith("b-mode:")) return mutate(ctx, () => (doc.export.modes[name.slice(7)] = !!value));
  if (name.startsWith("b-ex:")) return mutate(ctx, () => (doc.export[name.slice(5)] = !!value));
  if (name === "b-name") return mutate(ctx, () => (doc.export.name = String(value).slice(0, 60)));
  if (name === "b-pack-en" || name === "b-pack-id")
    return mutate(ctx, () => {
      const p = packOf(doc.manifest);
      doc.manifest.pack = { en: name === "b-pack-en" ? String(value) : p.en, id: name === "b-pack-id" ? String(value) : p.id };
    }, "Tema pack");
  if (name === "b-brand") {
    try {
      localStorage.setItem(BRAND_KEY, String(value).trim());
    } catch {
      /* penyimpanan ditolak: ID brand hanya berlaku di sesi ini */
    }
    return rerender(ctx);
  }
  if (name === "b-creator") return mutate(ctx, () => (doc.export.creator = value === "chital" ? "chital" : "hashtagben"));
  if (name === "b-locale") return mutate(ctx, () => (doc.export.locale = value === "id" ? "id" : "en"));
  if (name === "b-kw") return mutate(ctx, () => (doc.export.kw = ["10", "15", "20", "25"].includes(String(value)) ? Number(value) : 15));
  if (name === "b-desc") return mutate(ctx, () => (doc.export.description = String(value)));
}

/**
 * Seret file ke area impor.
 * @param {HTMLElement} root
 * @param {import("./common.js").Ctx} _ctx
 * @param {any} tools
 */
function mount(root, _ctx, tools) {
  const zone = /** @type {HTMLElement | null} */ (root.querySelector(".ic-dropzone"));
  if (!zone) return;
  const on = (/** @type {boolean} */ v) => zone.setAttribute("data-dragover", String(v));
  zone.addEventListener("dragenter", (e) => (e.preventDefault(), on(true)));
  zone.addEventListener("dragover", (e) => (e.preventDefault(), on(true)));
  zone.addEventListener("dragleave", () => on(false));
  zone.addEventListener("drop", async (e) => {
    e.preventDefault();
    on(false);
    const f = e.dataTransfer && e.dataTransfer.files[0];
    if (f) await tools.importText(await f.text());
  });
}

/* ---------- persona ---------- */

export const builder = {
  persona: "builder",
  layout: "rail",
  actions,
  control,
  mount,
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    if (!ctx.doc) return `<span class="ic-topbar__info">Belum ada manifest</span>`;
    const m = ctx.doc.manifest || {};
    const slides = (m.deck && m.deck.slides) || 0;
    return `<span class="ic-topbar__info">${esc(ctx.doc.name)}${ctx.doc.isSample ? " (contoh)" : ""}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${esc(m.format || "manifest")} v${esc(m.version || 1)} · ${slides} slide · ${ctx.doc.items.length} ikon${m.skill_version ? ` · skill ${esc(m.skill_version)}` : ""}</span>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  action: (ctx) => `<button type="button" class="ic-actionbtn" data-action="export"${ctx.doc ? "" : " disabled"}>Ekspor pack ZIP ${icon("chevron-down", 13)}</button>`,
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    if (!ctx.doc) return steps(ctx);
    const doc = ctx.doc,
      dm = dupMap(doc.items),
      d = deps(ctx);
    const count = (/** @type {(it: any) => boolean} */ f) => doc.items.filter(f).length;
    const F = [
      ["all", "Semua", doc.items.length],
      ["bad", "Bermasalah", count((it) => flagsOf(it, dm, d).length > 0)],
      ["slot", "Slot deck", count((it) => it.role === "slot")],
      ["extra", "Ekstra", count((it) => it.role === "extra")],
      ["off", "Dikeluarkan", count((it) => !it.on)],
    ];
    const chips = `<div class="studio-row" data-ic="single" role="group" aria-label="Saring ikon" data-name="b-filter">${F.map(([k, t, n]) => `<button type="button" class="ic-chip" data-value="${k}" ${aria("aria-pressed", doc.view.filter === k)}>${t} <span class="ic-meta">${n}</span></button>`).join("")}</div>`;
    return `${steps(ctx)}<span class="ic-sep"></span>${chips}<span class="ic-spacer"></span><span class="ic-label">Pratinjau</span>${select("Pratinjau", Object.entries(PREVIEW_LABEL), doc.pv, { width: 170, name: "b-preview" })}${check("Kelompokkan per slide", doc.view.group, { name: "b-group" })}`;
  },
  tools: [["select", "Pilih"], ["swap", "Ganti objek"], "sep", ["add-main", "Objek utama"], ["add-mod", "Pengubah"], ["deco", "Kilau"], ["tag", "Kata kunci"], "sep", ["hand", "Geser tampilan"], ["zoom", "Perbesar"]],
  /** @param {import("./common.js").Ctx} ctx */
  canvas(ctx) {
    if (!ctx.doc || ctx.doc.view.step === "import") return importArea();
    if (ctx.doc.view.step === "export") return exportCanvas(ctx);
    return checkCanvas(ctx);
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels(ctx) {
    if (!ctx.doc)
      return [
        panel({ id: "builder-icon", label: "Ikon", grow: true, tabs: [{ id: "ikon", label: "Ikon", body: empty("Belum ada manifest.", "Impor manifest untuk memulai.") }] }),
      ];
    return [
      panel({
        id: "builder-icon",
        label: "Ikon",
        grow: true,
        tabs: [
          { id: "ikon", label: "Ikon", body: iconBody(ctx, selectedOf(ctx)) },
          { id: "manifest", label: "Manifest", body: manifestBody(ctx) },
          { id: "pustaka", label: "Pustaka", body: `${libraryBody(ctx, { target: true, cols: 5 })}${LICENSE_NOTE}` },
        ],
      }),
      panel({
        id: "builder-rep",
        label: "Repetisi",
        tabs: [
          { id: "repetisi", label: "Repetisi", body: repetitionBody(ctx) },
          { id: "flag", label: "Flag", body: LEGEND.map(([lv, t]) => alert(/** @type {any} */ (lv), t)).join("") },
        ],
      }),
      panel({
        id: "builder-export",
        label: "Gaya ekspor",
        tabs: [
          { id: "gaya", label: "Gaya ekspor", body: exportBody(ctx), flush: true },
          { id: "metadata", label: "Metadata", body: metadataBody(ctx) },
        ],
      }),
    ];
  },
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    if (!ctx.doc) return statusBar("0 dari 0", "<b>Impor</b> manifest untuk memulai pemeriksaan pack.");
    const items = filtered(ctx),
      it = selectedOf(ctx);
    return statusBar(
      `${it && items.includes(it) ? items.indexOf(it) + 1 : 0} dari ${items.length}`,
      ctx.doc.view.step === "export"
        ? "<b>Klik</b> ikon untuk mengeluarkan atau memasukkan kembali ke ZIP. <b>Unduh ZIP</b> di panel Gaya ekspor."
        : "<b>Klik</b> ikon untuk melihat detail. Lencana merah: dobel atau sama dengan pustaka. Lencana kuning: perlu dicek.",
    );
  },
  docTab: (/** @type {any} */ _ctx, /** @type {any} */ doc) => `${docFileName(doc)} @ 100%`,
};

