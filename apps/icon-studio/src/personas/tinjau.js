// @ts-check
/**
 * Persona Tinjau · Lembar kontak & ekspor (DESIGN-HANDOFF 3.4) pada dokumen aktif.
 * Set Composer memakai logika Tinjau pack IC 1.5.1 (state/review-ops.js).
 * Dokumen Builder memakai logika ekspor TIB 1.6.0 (state/builder-ops.js).
 */
import { buildZip, directFillSvgFile } from "@icon-studio/export";
import { get } from "@icon-studio/engines";
import { MODE_INFO, dupMap, exportList, flagsOf, packOf } from "../state/builder-ops.js";
import { PREVIEW_BACKGROUNDS, SIZETEST_BACKGROUNDS } from "../state/data/preview-backgrounds.js";
import { BUILDER_MODES, kebab2 } from "../state/document.js";
import { buildSetZipFiles, exportSVG, fileNames, includedOf, loadTags, metaOf, reviewChecks, slug, spriteSVG } from "../state/review-ops.js";
import { duplicateGroups, nameOf } from "../state/set-ops.js";
import { alert, aria, button, check, empty, esc, icon, panel, seg, select } from "../ui.js";
import { builder } from "./builder.js";
import { docFileName, engineInfo, statusBar } from "./common.js";

const SIZE_COLS = { 128: 6, 64: 8, 32: 10 };

/** Status unduhan terakhir (bukan bagian dokumen). */
let downloadStatus = "";
/** Klik terakhir di lembar kontak, untuk klik dua kali (klik pertama merender ulang). */
let lastClick = { id: "", at: 0 };
/** Cache hasil direct fill per SVG sumber (mode Bandingkan). */
const directCache = new Map();

/** @param {import("./common.js").Ctx} ctx */
const isSet = (ctx) => !!ctx.doc && ctx.doc.kind === "set";
/** @param {import("./common.js").Ctx} ctx @param {(doc: any) => void} fn @param {string} [label] */
const mutate = (ctx, fn, label) => ctx.app.mutate(ctx.doc.id, fn, label);
/** @param {import("./common.js").Ctx} ctx */
const rerender = (ctx) => ctx.doc && mutate(ctx, () => {});
/** @param {import("./common.js").Ctx} ctx */
const builderDeps = (ctx) => ({ vocab: ctx.app.vocab, renderer: ctx.renderer, style: ctx.doc.style, mode: ctx.doc.pv });

/**
 * Ikon di lembar kontak beserta label, file, status ikut, dan lencana.
 * @param {import("./common.js").Ctx} ctx
 * @returns {{id: string, label: string, file: string, on: boolean, svg: string, badge: [string, string] | null}[]}
 */
function cellsOf(ctx) {
  const doc = ctx.doc;
  if (isSet(ctx)) {
    const dup = new Set(duplicateGroups(doc.items, (it) => get(doc.style.family).signature(it)).flat().map((it) => it.id));
    return fileNames(doc.items, ctx.renderer.lib, doc.style.family).map(({ it, file }, i) => ({
      id: it.id,
      label: nameOf(it, ctx.renderer.lib, doc.style.family),
      file,
      on: !doc.review.off[it.id],
      svg: exportSVG(ctx.renderer, doc, it, i).replace(/ko(\d+)/g, "tj$1"),
      badge: dup.has(it.id) ? ["err", "dobel"] : null,
    }));
  }
  const dm = dupMap(doc.items, doc.pv),
    d = builderDeps(ctx);
  const dir = /** @type {any} */ (MODE_INFO)[doc.pv].dir;
  return doc.items.map((/** @type {any} */ it) => {
    const fl = flagsOf(it, dm, d);
    const badge = fl.find((f) => f[1] === "Rakitan dobel di pack") ? ["err", "dobel"] : fl.some((f) => f[0] === "err") ? ["err", "masalah"] : fl.some((f) => f[0] !== "info") ? ["warn", "cek"] : null;
    return { id: it.uid, label: it.id, file: `${it.id}-${dir}.svg`, on: it.on, svg: ctx.renderer.renderManifestItem(it, doc.pv, doc.style, { idp: `tj${it.uid}` }), badge: /** @type {any} */ (badge) };
  });
}

/**
 * SVG direct fill untuk mode Bandingkan dan pemeriksaan (hanya pratinjau; ZIP Composer tetap SVG asli sampai Fase 5).
 * @param {string} svg
 * @returns {{svg: string, error: string | null}}
 */
function directFill(svg) {
  if (!directCache.has(svg)) {
    let out;
    try {
      out = { svg: directFillSvgFile(`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`).replace(/^<\?xml[^>]*>\s*/, ""), error: null };
    } catch (e) {
      out = { svg, error: (/** @type {Error} */ (e)).message };
    }
    directCache.set(svg, out);
  }
  return directCache.get(svg);
}

/* ---------- kanvas ---------- */

/**
 * Lencana sel: gagal direct fill (mode Bandingkan) lebih dulu, lalu flag ikon.
 * @param {any} r pilihan tinjau
 * @param {{svg: string, badge: [string, string] | null}} c
 */
function cellFlag(r, c) {
  const failed = r.compare === "direct" && directFill(c.svg).error;
  const badge = failed ? ["err", "gagal direct fill"] : r.flags ? c.badge : null;
  return badge ? `<span class="studio-cellflag"><span class="ic-flag" data-level="${badge[0]}">${esc(badge[1])}</span></span>` : "";
}

/** @param {import("./common.js").Ctx} ctx */
function canvas(ctx) {
  if (!ctx.doc || !ctx.doc.items.length) return `<div class="studio-center">${empty("Belum ada ikon untuk ditinjau.", "Tambah ikon di Composer atau impor manifest di Builder.")}</div>`;
  const r = ctx.doc.review;
  const bg = PREVIEW_BACKGROUNDS.find((b) => b.id === r.bg) || PREVIEW_BACKGROUNDS[0];
  const cells = cellsOf(ctx);
  const on = cells.filter((c) => c.on);
  const meta = isSet(ctx) ? `${engineInfo(ctx.doc.style.family).toLowerCase()} · ${cells.length} ikon · ${r.size} px` : `${/** @type {any} */ (MODE_INFO)[ctx.doc.pv].short} · ${cells.length} ikon · ${r.size} px`;
  const sheet = `<div class="ic-sheet" data-names="${r.names ? "on" : "off"}" style="--ic-sheet-bg: ${bg.color}; --ic-sheet-icon: ${r.size}px; --ic-cols: ${/** @type {any} */ (SIZE_COLS)[r.size] || 6}; color: ${bg.ink}; --ic-text-on-light-2: ${bg.ink2}; --ic-text-on-light-3: ${bg.ink3}"><div class="ic-sheet__head"><span class="ic-sheet__title">${esc(ctx.doc.name)}</span><span class="ic-sheet__meta">${esc(meta)}</span></div><div class="ic-sheet__grid">${cells
    .map(
      (c) =>
        `<button type="button" class="ic-sheet__cell" data-action="t-toggle" data-id="${esc(c.id)}" ${aria("aria-pressed", c.on)} aria-label="${esc(c.file)}${c.on ? ", ikut diunduh" : ", dikeluarkan"}"><span class="ic-sheet__badge">dikeluarkan</span>${cellFlag(r, c)}${r.compare === "direct" ? directFill(c.svg).svg : c.svg}<span class="ic-sheet__file">${esc(c.file)}</span></button>`,
    )
    .join("")}</div></div>`;
  const small = (/** @type {string} */ color) => `<div class="ic-sizetest__row" style="--ic-sizetest-bg: ${color}">${on.map((c) => c.svg.replace(/id="tj/g, `id="sm${color.slice(1)}`).replace(/url\(#tj/g, `url(#sm${color.slice(1)}`)).join("")}</div>`;
  const sizetest = `<div class="ic-sizetest"><div class="ic-sizetest__panel"><span class="ic-label">Uji 32 px di latar terang</span>${small(SIZETEST_BACKGROUNDS.light)}</div><div class="ic-sizetest__panel"><span class="ic-label">Uji 32 px di latar gelap</span>${small(SIZETEST_BACKGROUNDS.dark)}</div></div>`;
  const darkNote = r.bg === "dark" && isSet(ctx) ? alert("warn", "Tinta gelap kurang terlihat di latar gelap. Latar ini untuk memeriksa warna terang dan halo.") : "";
  return `<div class="studio-stack studio-review">${darkNote}${sheet}${sizetest}</div>`;
}

/* ---------- panel ---------- */

/** @param {import("./common.js").Ctx} ctx */
function checksBody(ctx) {
  if (!ctx.doc || !ctx.doc.items.length) return empty("Belum ada ikon.");
  let rows;
  if (isSet(ctx)) {
    rows = reviewChecks(ctx.doc, includedOf(ctx.doc), ctx.renderer);
    const failed = cellsOf(ctx).filter((c) => c.on && directFill(c.svg).error);
    rows.splice(1, 0, { ok: failed.length === 0, text: "Semua stroke bisa jadi outline (direct fill)", meta: failed.length ? `${failed.length} gagal: ${failed[0].label}` : "siap" });
  }
  else {
    const d = builderDeps(ctx),
      list = exportList(ctx.doc, ctx.doc.export, d),
      dm = dupMap(ctx.doc.items, ctx.doc.pv);
    const bad = ctx.doc.items.filter((/** @type {any} */ it) => it.on && flagsOf(it, dm, d).some((f) => f[0] === "err")).length;
    const dup = ctx.doc.items.filter((/** @type {any} */ it) => it.on && dm[it.main + "|" + it.mod] > 1).length;
    rows = [
      { ok: true, text: "Semua stroke jadi outline (direct fill)", meta: "saat ekspor" },
      { ok: bad === 0, text: "Tidak ada ikon bermasalah", meta: `${bad}` },
      { ok: dup === 0, text: "Rakitan dobel dalam pack", meta: `${dup}` },
      { ok: list.length > 0, text: "Ikon yang ikut ZIP", meta: `${list.length}/${ctx.doc.items.length}` },
    ];
  }
  return `<div class="ic-list">${rows.map((c) => `<div class="ic-row ic-row--sm"><span class="ic-dot" data-level="${c.ok ? "ok" : "warn"}"></span><span class="ic-row__name">${esc(c.text)}</span><span class="ic-meta">${esc(c.meta || "")}</span></div>`).join("")}</div>`;
}

/** @param {import("./common.js").Ctx} ctx */
function metaBody(ctx) {
  if (!ctx.doc) return empty("Belum ada dokumen.");
  if (!isSet(ctx)) {
    const o = ctx.doc.export;
    return `${alert("info", `Metadata pack diatur di Builder · Metadata: ${o.creator} · ${o.locale.toUpperCase()} · ${o.kw} kata kunci · tema ${packOf(ctx.doc.manifest).en || "–"}.`)}${button("Buka Builder", { size: "sm", action: "t-open-builder" })}`;
  }
  const m = ctx.doc.meta.canva;
  const field = (/** @type {string} */ label, /** @type {string} */ name, /** @type {string} */ value) =>
    `<div class="ic-formrow"><span class="ic-label">${label}</span><label class="ic-field studio-grow" data-name="${name}"><input value="${esc(value)}" aria-label="${label}"></label></div>`;
  const first = includedOf(ctx.doc)[0];
  const ex = first ? metaOf(ctx.doc, first, ctx.renderer) : null;
  return [
    check("Sertakan metadata.csv", m.on, { name: "t-meta-on" }),
    `<div class="ic-formrow"><span class="ic-label">Artist</span>${seg("Artist", [["hashtagben", "hashtagben"], ["chital", "chital"]], m.artist, { name: "t-artist" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Bahasa</span>${seg("Bahasa metadata", [["en", "EN"], ["id", "ID"]], m.locale, { name: "t-locale" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Nama di judul</span>${seg("Nama di judul", [["auto", "Otomatis"], ["name", "Nama ikon"]], m.nm, { name: "t-nm" })}</div>`,
    field("Tema EN", "t-pack-en", m.packEn),
    field("Tema ID", "t-pack-id", m.packId),
    `<div class="ic-formrow"><span class="ic-label">Kata kunci</span>${select("Kata kunci per ikon", [["10", "10"], ["15", "15"], ["20", "20"], ["25", "25"]], String(m.kw), { width: 80, name: "t-kw" })}<span class="ic-meta">per ikon</span></div>`,
    `<label class="ic-field ic-field--area" data-name="t-desc"><textarea rows="3" aria-label="Deskripsi pack" placeholder="Deskripsi pack (opsional)">${esc(m.desc)}</textarea></label>`,
    ex ? `<div class="ic-alert" data-level="info"><span class="ic-dot" data-level="info"></span>Contoh judul: ${esc(ex.title)}</div>` : "",
  ].join("");
}

/** @param {import("./common.js").Ctx} ctx */
function keywordsBody(ctx) {
  if (!isSet(ctx)) return `<span class="ic-meta">Kata kunci per ikon ada di Builder · Ikon.</span>`;
  const first = includedOf(ctx.doc)[0];
  if (!first) return empty("Belum ada ikon yang ikut diunduh.");
  const m = metaOf(ctx.doc, first, ctx.renderer);
  return `<span class="ic-label">${esc(nameOf(first, ctx.renderer.lib, ctx.doc.style.family))}</span><div class="studio-tags">${m.keywords
    .split(", ")
    .filter(Boolean)
    .map((k) => `<span class="ic-tag">${esc(k)}</span>`)
    .join("")}</div><span class="ic-meta">Tag pustaka dimuat saat ZIP dibuat. ${button("Muat tag sekarang", { size: "sm", action: "t-load-tags" })}</span>`;
}

/** @param {import("./common.js").Ctx} ctx */
function zipBody(ctx) {
  if (!ctx.doc || !ctx.doc.items.length) return empty("Belum ada ikon.");
  if (!isSet(ctx)) {
    const d = builderDeps(ctx),
      o = ctx.doc.export,
      list = exportList(ctx.doc, o, d);
    const styles = BUILDER_MODES.filter((m) => o.modes[m]);
    const tree = [`${kebab2(o.name) || "icon-pack"}.zip`, ...styles.map((s) => `├─ ${/** @type {any} */ (MODE_INFO)[s].dir}/  ${list.length} svg · direct fill`), "├─ metadata.csv", "├─ resource-page.html", "└─ manifest-final.json"].join("\n");
    return `<pre class="ic-meta studio-tree">${esc(tree)}</pre>${button("Unduh ZIP Canva", { kind: "primary", block: true, action: "t-download", disabled: !list.length || !styles.length })}<p class="ic-meta" role="status" data-role="export-status">${esc(downloadStatus)}</p>`;
  }
  const r = ctx.doc.review,
    inc = includedOf(ctx.doc);
  const files = fileNames(inc, ctx.renderer.lib, ctx.doc.style.family);
  const base = slug(ctx.doc.name || "set-ikon");
  const tree =
    r.fmt === "zip"
      ? [`${base}.zip`, ...files.slice(0, 2).map((f) => `├─ ${f.file}`), files.length > 2 ? `├─ … ${files.length - 2} file lain` : "", "├─ LICENSES.txt", r.json ? "├─ gaya.json" : "", r.html ? "├─ pratinjau.html" : "", ctx.doc.meta.canva.on ? "└─ metadata.csv" : ""].filter(Boolean).join("\n")
      : `${base}-sprite.svg\n└─ ${files.length} <symbol>`;
  return [
    `<div class="ic-formrow"><span class="ic-label">Format</span>${seg("Format unduhan", [["zip", "ZIP berisi SVG"], ["sprite", "Sprite SVG"]], r.fmt, { name: "t-fmt" })}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Celah knockout</span>${seg("Celah knockout", [["mask", "Mask, transparan"], ["white", "Latar putih"]], r.ko, { name: "t-ko" })}</div>`,
    check("Sertakan gaya.json", r.json, { name: "t-json" }),
    check("Sertakan lembar pratinjau HTML", r.html, { name: "t-html" }),
    `<pre class="ic-meta studio-tree">${esc(tree)}</pre>`,
    `<div class="studio-actions">${button(r.fmt === "zip" ? `Unduh ZIP Canva · ${inc.length}` : `Unduh sprite · ${inc.length}`, { kind: "primary", action: "t-download", disabled: !inc.length })}${button("Sprite SVG", { action: "t-sprite", disabled: !inc.length })}</div>`,
    `<p class="ic-meta" role="status" data-role="export-status">${esc(downloadStatus)}</p>`,
  ].join("");
}

/* ---------- aksi dan kontrol ---------- */

/** @param {string} filename @param {Blob | string} data */
function saveFile(filename, data) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: filename.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream" });
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
  "t-toggle"(ctx, el, /** @type {any} */ { go }) {
    const id = el.dataset.id || "";
    const now = Date.now();
    if (isSet(ctx) && lastClick.id === id && now - lastClick.at < 450) {
      lastClick = { id: "", at: 0 };
      /* klik dua kali: kembalikan status klik pertama, lalu buka di Composer · Edit */
      mutate(ctx, (doc) => (doc.review.off[id] ? delete doc.review.off[id] : (doc.review.off[id] = true)));
      ctx.app.select(ctx.doc.id, id);
      return go({ persona: "composer", edit: id });
    }
    lastClick = { id, at: now };
    if (isSet(ctx)) mutate(ctx, (doc) => (doc.review.off[id] ? delete doc.review.off[id] : (doc.review.off[id] = true)), "Ubah isi unduhan");
    else {
      const it = ctx.doc.items.find((/** @type {any} */ x) => x.uid === id);
      if (it) mutate(ctx, () => (it.on = !it.on), `${it.id} ${it.on ? "dikeluarkan" : "dimasukkan"}`);
    }
  },
  "t-open-builder": (/** @type {any} */ _ctx, /** @type {any} */ _el, /** @type {any} */ { go }) => go({ persona: "builder", edit: null }),
  /** @param {import("./common.js").Ctx} ctx */
  async "t-load-tags"(ctx) {
    await loadTags();
    rerender(ctx);
  },
  /** @param {import("./common.js").Ctx} ctx */
  async "t-sprite"(ctx) {
    const inc = includedOf(ctx.doc);
    saveFile(`${slug(ctx.doc.name || "set-ikon")}-sprite.svg`, spriteSVG(ctx.renderer, ctx.doc, inc));
    downloadStatus = `Sprite berisi ${inc.length} ikon diunduh.`;
    rerender(ctx);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el @param {any} tools */
  async "t-download"(ctx, el, tools) {
    if (!isSet(ctx)) {
      await builder.actions["b-export"](ctx, el, tools);
      return;
    }
    const doc = ctx.doc,
      inc = includedOf(doc),
      base = slug(doc.name || "set-ikon");
    if (!inc.length) return;
    try {
      if (doc.review.fmt === "sprite") saveFile(`${base}-sprite.svg`, spriteSVG(ctx.renderer, doc, inc));
      else {
        const JSZip = /** @type {any} */ (window).JSZip;
        if (!JSZip) throw new Error("Pembuat ZIP tidak termuat.");
        downloadStatus = "Menyusun ZIP…";
        rerender(ctx);
        saveFile(`${base}.zip`, await buildZip(JSZip, await buildSetZipFiles(doc, inc, ctx.renderer)));
      }
      downloadStatus = `${inc.length} ikon diunduh${doc.items.length - inc.length ? `, ${doc.items.length - inc.length} dikeluarkan` : ""}.`;
      tools.toast("Unduhan dibuat");
    } catch (e) {
      downloadStatus = (/** @type {Error} */ (e)).message || "Unduhan gagal dibuat.";
    }
    rerender(ctx);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el @param {any} tools */
  export: (ctx, el, tools) => actions["t-download"](ctx, el, tools),
};

/**
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {any} value
 */
function control(ctx, name, value) {
  if (!ctx.doc) return;
  const map = /** @type {Record<string, (doc: any) => void>} */ ({
    "t-bg": (doc) => (doc.review.bg = value),
    "t-size": (doc) => (doc.review.size = [128, 64, 32].includes(Number(value)) ? Number(value) : 128),
    "t-names": (doc) => (doc.review.names = !!value),
    "t-flags": (doc) => (doc.review.flags = !!value),
    "t-compare": (doc) => (doc.review.compare = value === "direct" ? "direct" : "source"),
    "t-fmt": (doc) => (doc.review.fmt = value === "sprite" ? "sprite" : "zip"),
    "t-ko": (doc) => (doc.review.ko = value === "white" ? "white" : "mask"),
    "t-json": (doc) => (doc.review.json = !!value),
    "t-html": (doc) => (doc.review.html = !!value),
    "t-meta-on": (doc) => (doc.meta.canva.on = !!value),
    "t-artist": (doc) => (doc.meta.canva.artist = value === "chital" ? "chital" : "hashtagben"),
    "t-locale": (doc) => (doc.meta.canva.locale = value === "id" ? "id" : "en"),
    "t-nm": (doc) => (doc.meta.canva.nm = value === "name" ? "name" : "auto"),
    "t-pack-en": (doc) => (doc.meta.canva.packEn = String(value).slice(0, 60)),
    "t-pack-id": (doc) => (doc.meta.canva.packId = String(value).slice(0, 60)),
    "t-kw": (doc) => (doc.meta.canva.kw = [10, 15, 20, 25].includes(Number(value)) ? Number(value) : 15),
    "t-desc": (doc) => (doc.meta.canva.desc = String(value)),
  });
  /** Nama pengaturan untuk Riwayat dan urungkan. */
  const label = /** @type {Record<string, string>} */ ({
    "t-bg": "Latar lembar kontak",
    "t-size": "Ukuran pratinjau",
    "t-names": "Nama file",
    "t-flags": "Tanda flag",
    "t-compare": "Bandingkan",
    "t-fmt": "Format unduhan",
    "t-ko": "Celah knockout",
    "t-json": "Sertakan gaya.json",
    "t-html": "Sertakan lembar pratinjau",
    "t-meta-on": "Sertakan metadata.csv",
    "t-artist": "Artis",
    "t-locale": "Bahasa metadata",
    "t-nm": "Nama di judul",
    "t-pack-en": "Nama pack EN",
    "t-pack-id": "Nama pack ID",
    "t-kw": "Jumlah kata kunci",
    "t-desc": "Deskripsi pack",
  });
  if (map[name]) mutate(ctx, map[name], label[name]);
}

/* ---------- persona ---------- */

export const tinjau = {
  persona: "tinjau",
  layout: "rail",
  actions,
  control,
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    if (!ctx.doc) return `<span class="ic-topbar__info">Belum ada dokumen</span>`;
    const cells = ctx.doc.items.length ? cellsOf(ctx) : [];
    const on = cells.filter((c) => c.on).length;
    return `<span class="ic-topbar__info">${esc(ctx.doc.name)}${isSet(ctx) ? ` · ${esc(engineInfo(ctx.doc.style.family))}` : ""}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${on} diunduh · ${cells.length - on} dikeluarkan</span>`;
  },
  action: () => `<button type="button" class="ic-actionbtn" data-action="export">Ekspor Canva ${icon("chevron-down", 13)}</button>`,
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    if (!ctx.doc) return "";
    const r = ctx.doc.review;
    return `<span class="ic-label">Latar</span><div class="ic-swatches" data-ic="single" role="group" aria-label="Latar lembar kontak" data-name="t-bg">${PREVIEW_BACKGROUNDS.map((bg) => `<button type="button" class="ic-swatch" data-value="${bg.id}" style="background: ${bg.color}" ${aria("aria-pressed", r.bg === bg.id)} aria-label="${bg.label}"></button>`).join("")}</div><span class="ic-sep"></span><span class="ic-label">Ukuran</span>${seg("Ukuran pratinjau", [["128", "128"], ["64", "64"], ["32", "32"]], String(r.size), { inline: true, name: "t-size" })}<span class="ic-sep"></span>${check("Nama file", r.names, { name: "t-names" })}${check("Tanda flag", r.flags, { name: "t-flags" })}<span class="ic-spacer"></span><span class="ic-label">Bandingkan</span>${seg("Bandingkan", [["source", "SVG asli"], ["direct", "Direct fill"]], r.compare, { inline: true, name: "t-compare" })}`;
  },
  tools: [["select", "Pilih"], ["magnifier", "Perbesar ikon"], ["compare", "Bandingkan"], "sep", ["hand", "Geser tampilan"]],
  canvas,
  /** @param {import("./common.js").Ctx} ctx */
  panels: (ctx) => [
    panel({
      id: "tinjau-check",
      label: "Pemeriksaan",
      grow: true,
      tabs: [
        { id: "pemeriksaan", label: "Pemeriksaan", body: checksBody(ctx), flush: true },
        {
          id: "riwayat",
          label: "Riwayat",
          body: ctx.doc && (ctx.app.history[ctx.doc.id] || []).length ? `<div class="ic-list">${ctx.app.history[ctx.doc.id].slice(0, 30).map((h) => `<div class="ic-row ic-row--sm"><span class="ic-row__name">${esc(h.label)}</span></div>`).join("")}</div>` : `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>`,
        },
      ],
    }),
    panel({
      id: "tinjau-meta",
      label: "Metadata Canva",
      tabs: [
        { id: "metadata", label: "Metadata Canva", body: metaBody(ctx) },
        { id: "kata-kunci", label: "Kata kunci", body: ctx.doc ? keywordsBody(ctx) : "" },
      ],
    }),
    panel({ id: "tinjau-zip", label: "Isi ZIP", tabs: [{ id: "zip", label: "Isi ZIP", body: zipBody(ctx) }] }),
  ],
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    const cells = ctx.doc && ctx.doc.items.length ? cellsOf(ctx) : [];
    const on = cells.filter((c) => c.on).length;
    return statusBar(`${on} / ${cells.length} diunduh`, `<b>Klik</b> ikon untuk mengeluarkan atau memasukkan kembali ke unduhan.${isSet(ctx) ? " <b>Klik dua kali</b> untuk mengedit di Composer." : ""}`);
  },
  docTab: (/** @type {any} */ ctx, /** @type {any} */ doc) => (doc === ctx.doc ? `${docFileName(doc)} · Lembar kontak` : `${docFileName(doc)} @ 100%`),
};
