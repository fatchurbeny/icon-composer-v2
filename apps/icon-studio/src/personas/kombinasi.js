// @ts-check
/**
 * Persona Kombinasi · Matriks + pustaka (DESIGN-HANDOFF 3.5), kerangka `.ic-shell--left-studio`.
 * Studio kiri: pustaka untuk mengisi pool. Kanvas: matriks objek × pengubah. Studio kanan: pool dan hasil.
 * Logika di state/combo-ops.js (kombinasi massal Icon Composer 1.5.1).
 */
import { get } from "@icon-studio/engines";
import { activePool, addCombos, comboMatrix, comboPrefs, libraryOnly, matrixMains, matrixMods, objectsOnly, setSkip, togglePool } from "../state/combo-ops.js";
import { setStyleValue } from "../state/set-ops.js";
import { alert, button, check, empty, esc, panel, seg, select } from "../ui.js";
import { ENGINE_NAMES, NO_MOD_TEXT, READY_ENGINES, docFileName, engineInfo, statusBar } from "./common.js";
import { LICENSE_NOTE, libraryAction, libraryBody, libraryControl, libraryTile, libraryUi } from "./library-panel.js";

/** Status tambah terakhir (bukan bagian dokumen). */
let addStatus = "";

/** @param {import("./common.js").Ctx} ctx */
const isSet = (ctx) => !!ctx.doc && ctx.doc.kind === "set";
/** @param {import("./common.js").Ctx} ctx @param {(doc: any) => void} fn @param {string} [label] */
const mutate = (ctx, fn, label) => ctx.app.mutate(ctx.doc.id, fn, label);
/** @param {import("./common.js").Ctx} ctx */
const rerender = (ctx) => ctx.doc && mutate(ctx, () => {});
/** @param {import("./common.js").Ctx} ctx */
const deps = (ctx) => ({
  lib: ctx.renderer.lib,
  signature: (/** @type {any} */ it) => get(ctx.doc.style.family).signature(it),
  collisions: (/** @type {any} */ it) => ctx.app.vocab.collisions(it),
});
/** @param {import("./common.js").Ctx} ctx */
const matrixOf = (ctx) => comboMatrix(ctx.doc, deps(ctx));

/**
 * Ikon garis kecil untuk kepala baris/kolom: objek atau pengubah saja.
 * @param {import("./common.js").Ctx} ctx
 * @param {string} key
 * @param {"main" | "mod"} kind
 */
function headIcon(ctx, key, kind) {
  if (ctx.renderer.LIB_RE.test(key)) {
    const A = ctx.renderer.shapes.analyze(key);
    if (A) return libraryTile(ctx, key).match(/<svg[\s\S]*?<\/svg>/)?.[0] || "";
  }
  const it = ctx.app.sampleItem(kind === "main" ? { main: key, mod: "none", mx: 0, my: 0 } : { main: "face", mod: key, vis: { main: false, mod: true, deco: false } });
  /* garis mengikuti warna teks UI supaya terbaca di studio gelap (bukan pratinjau ekspor) */
  const plain = { main: { line: null, fill: null }, mod: { line: null, fill: null }, deco: { line: null, fill: null } };
  return ctx.renderer.renderSetItem(it, { ...ctx.doc.style, family: "classic", pref: "C", ink: "currentColor", accent: "currentColor", colors: plain, fx: { mode: "none" } }, { idp: `kh${kind}${key.replace(/\W/g, "")}` });
}

/* ---------- kanvas ---------- */

/** @param {import("./common.js").Ctx} ctx */
function canvas(ctx) {
  if (!isSet(ctx)) return `<div class="studio-center">${empty("Kombinasi bekerja pada set Composer.", "Buka sebuah set di Composer lebih dulu.")}</div>`;
  const mx = matrixOf(ctx);
  if (!mx.mains.length || !mx.mods.length)
    return `<div class="studio-center">${empty("Matriks kombinasi masih kosong.", objectsOnly(ctx.doc) ? "Gaya Offset memakai objek dari pustaka. Tambahkan objek dari Pustaka di kiri." : libraryOnly(ctx.doc) ? "Gaya Hand-writing memakai objek dan pengubah dari pustaka. Tambahkan dari Pustaka di kiri." : "Pilih minimal satu objek utama dan satu pengubah di Pool, atau tambahkan dari Pustaka di kiri.")}</div>`;
  const head = mx.mods
    .map((d) => {
      if (d === "none")
        return `<button type="button" class="studio-mhead studio-mhead--col" data-action="k-col" data-key="none" aria-label="Pilih atau lewati semua objek"><span class="ic-mono">objek saja</span><span class="ic-meta">${esc(NO_MOD_TEXT)}</span></button>`;
      const D = ctx.renderer.lib.MODS[d];
      return `<button type="button" class="studio-mhead studio-mhead--col" data-action="k-col" data-key="${esc(d)}" aria-label="Pilih atau lewati semua dengan pengubah ${esc(d)}">${headIcon(ctx, d, "mod")}<span class="ic-mono">${esc(d)}</span><span class="ic-meta">${esc(ctx.doc.combo.pos === "default" ? (D && D.slot) || "BL" : ctx.doc.combo.pos)}</span></button>`;
    })
    .join("");
  const rows = mx.rows
    .map(
      (r) =>
        `<button type="button" class="studio-mhead studio-mhead--row" data-action="k-row" data-key="${esc(r.main)}" aria-label="Pilih atau lewati semua dengan objek ${esc(r.main)}">${headIcon(ctx, r.main, "main")}<span class="ic-mono">${esc(r.main)}</span></button>${r.cells
          .map((c) => {
            const fixed = c.state === "exists" || c.state === "library";
            return `<button type="button" class="ic-cell" data-state="${c.state}" data-action="k-cell" data-main="${esc(r.main)}" data-mod="${esc(c.mod)}"${fixed ? " disabled" : ""} aria-label="${esc(r.main)}${c.mod === "none" ? "" : ` + ${esc(c.mod)}`}: ${{ on: "akan ditambahkan", skipped: "dilewati", exists: "sudah ada di set", library: "sama dengan ikon pustaka" }[c.state]}">${ctx.renderer.renderSetItem(c.item, ctx.doc.style, { idp: `kx${r.main.replace(/\W/g, "")}${c.mod.replace(/\W/g, "")}` }, ctx.doc.customs)}${c.flag ? `<span class="ic-flag"${c.state === "library" ? ' data-level="err"' : ""} title="${esc(c.flag)}"><span class="studio-ellipsis">${esc(c.flag)}</span></span>` : ""}</button>`;
          })
          .join("")}`,
    )
    .join("");
  return `<div class="ic-matrix" style="--ic-cols: ${mx.mods.length}" role="group" aria-label="Matriks kombinasi"><span></span>${head}${rows}</div>`;
}

/* ---------- panel ---------- */

/** @param {import("./common.js").Ctx} ctx */
function poolBody(ctx) {
  const pool = ctx.doc.pool;
  const act = activePool(pool);
  const only = objectsOnly(ctx.doc);
  const libOnly = libraryOnly(ctx.doc),
    styleName = /** @type {any} */ (ENGINE_NAMES)[ctx.doc.style.family];
  const builtin = libOnly ? act.mains.filter((k) => !ctx.renderer.LIB_RE.test(k)).length : 0;
  const builtinMods = libOnly && !only ? act.mods.filter((k) => !ctx.renderer.LIB_RE.test(k)).length : 0;
  const row = (/** @type {"main" | "mod"} */ kind, /** @type {string} */ key) => {
    const src = /^(lu|tb|hg|cu):/.exec(key);
    const D = kind === "mod" ? ctx.renderer.lib.MODS[key] : null;
    return `<div class="ic-row ic-row--sm"><label class="ic-check" data-name="pool:${kind}:${esc(key)}"><input type="checkbox"${pool.off[`${kind}|${key}`] ? "" : " checked"} aria-label="${esc(key)} ikut kombinasi"></label>${src ? `<span class="ic-src" data-src="${src[1]}">${src[1]}</span>` : '<span class="ic-src">IC</span>'}<span class="ic-row__name ic-mono">${esc(key)}</span>${D ? `<span class="ic-meta">${esc(D.slot)}</span>` : ""}<button type="button" class="ic-iconbtn" data-action="k-pool-remove" data-kind="${kind}" data-key="${esc(key)}" aria-label="Keluarkan ${esc(key)} dari pool">${/** @type {any} */ (globalThis).ICONS_UI.uiIcon("x", 13)}</button></div>`;
  };
  return `<div class="ic-panel__sub"><span class="ic-label">Objek utama</span><span class="ic-meta">${act.mains.length} dari ${pool.mains.length} aktif</span></div>${builtin ? `<div class="studio-pad">${alert("err", `${builtin} objek bawaan dilewati: tidak didukung gaya ${styleName}.`)}</div>` : ""}${pool.mains.map((k) => row("main", k)).join("") || '<div class="studio-pad"><span class="ic-meta">Belum ada objek. Tambahkan dari Pustaka.</span></div>'}<div class="ic-panel__sub"><span class="ic-label">Pengubah</span><span class="ic-meta">${only ? "tidak dipakai" : `${act.mods.length} dari ${pool.mods.length} aktif`}</span></div>${builtinMods ? `<div class="studio-pad">${alert("err", `${builtinMods} pengubah bawaan dilewati: tidak didukung gaya ${styleName}.`)}</div>` : ""}${only ? `<div class="studio-pad">${alert("info", `${NO_MOD_TEXT}. Kombinasi memakai daftar objek saja.`)}</div>` : pool.mods.map((k) => row("mod", k)).join("") || '<div class="studio-pad"><span class="ic-meta">Belum ada pengubah. Tambahkan dari Pustaka.</span></div>'}`;
}

/** Arti status sel (DESIGN-HANDOFF 3.5). */
const RULES = [
  ["info", "Dipilih: akan ditambahkan ke set. Klik untuk melewati."],
  ["info", "Dilewati: tidak ditambahkan. Klik untuk memilih lagi."],
  ["warn", "Sudah ada di set: rakitan dengan signature sama sudah ada. Tidak bisa dipilih selama Lewati yang sudah ada aktif."],
  ["err", "Sama dengan ikon pustaka: nama gabungannya sudah ada di Lucide, Tabler, atau Hugeicons. Tidak bisa dipilih."],
  ["info", "Mirip di gaya ini (sidik jari) menyusul di Fase 6."],
];

/** @param {import("./common.js").Ctx} ctx */
function resultBody(ctx) {
  const mx = matrixOf(ctx);
  const line = (/** @type {string} */ level, /** @type {string} */ text, /** @type {number} */ n) => `<div class="ic-row ic-row--sm"><span class="ic-dot" data-level="${level}"></span><span class="ic-row__name">${text}</span><span class="ic-meta">${n}</span></div>`;
  const prefs = comboPrefs(ctx.doc).length;
  return `<div class="ic-list">${line("ok", "Dipilih", mx.count.on)}${line("info", "Sudah ada di set", mx.count.exists)}${line("err", "Sama dengan ikon pustaka", mx.count.library)}${line("info", "Dilewati manual", mx.count.skipped)}</div><div class="studio-pad studio-stack">${prefs > 1 ? `<span class="ic-meta">Setiap kombinasi dibuat ${prefs} kali (Garis·solid, Solid·garis, Garis·garis).</span>` : ""}${check("Ratakan variasi setelah ditambah", false, { name: "k-even", disabled: true })}${button(`Tambahkan ${mx.add} ke set`, { kind: "primary", block: true, action: "k-add", disabled: !mx.add })}<p class="ic-meta" role="status">${esc(addStatus)}</p></div>`;
}

/* ---------- aksi dan kontrol ---------- */

const actions = {
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "k-cell"(ctx, el) {
    const m = el.dataset.main || "",
      d = el.dataset.mod || "";
    const skip = !ctx.doc.combo.skip[`${m}|${d}`];
    mutate(ctx, (doc) => setSkip(doc, [[m, d]], skip), `${skip ? "Lewati" : "Pakai"} ${m} + ${d}`);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "k-row"(ctx, el) {
    const m = el.dataset.key || "";
    const mx = matrixOf(ctx);
    const row = mx.rows.find((r) => r.main === m);
    if (!row) return;
    const cells = row.cells.filter((c) => c.state === "on" || c.state === "skipped");
    const allOn = cells.every((c) => c.state === "on");
    mutate(ctx, (doc) => setSkip(doc, cells.map((c) => /** @type {[string, string]} */ ([m, c.mod])), allOn), `${allOn ? "Lewati" : "Pakai"} baris ${m}`);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "k-col"(ctx, el) {
    const d = el.dataset.key || "";
    const mx = matrixOf(ctx);
    const cells = mx.rows.map((r) => ({ m: r.main, c: r.cells.find((c) => c.mod === d) })).filter((x) => x.c && (x.c.state === "on" || x.c.state === "skipped"));
    const allOn = cells.every((x) => x.c && x.c.state === "on");
    mutate(ctx, (doc) => setSkip(doc, cells.map((x) => /** @type {[string, string]} */ ([x.m, d])), allOn), `${allOn ? "Lewati" : "Pakai"} kolom ${d}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "k-all"(ctx) {
    const mains = matrixMains(ctx.doc),
      mods = matrixMods(ctx.doc);
    mutate(ctx, (doc) => setSkip(doc, mains.flatMap((m) => mods.map((d) => /** @type {[string, string]} */ ([m, d]))), false), "Pakai semua kombinasi");
  },
  /** @param {import("./common.js").Ctx} ctx */
  "k-none"(ctx) {
    const mains = matrixMains(ctx.doc),
      mods = matrixMods(ctx.doc);
    mutate(ctx, (doc) => setSkip(doc, mains.flatMap((m) => mods.map((d) => /** @type {[string, string]} */ ([m, d]))), true), "Lewati semua kombinasi");
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "k-pool-remove"(ctx, el) {
    const kind = el.dataset.kind === "mod" ? "mod" : "main",
      key = el.dataset.key || "";
    mutate(ctx, (doc) => togglePool(doc.pool, kind, key), `Keluarkan ${key} dari pool`);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el */
  "lib-pick"(ctx, el, /** @type {any} */ { toast }) {
    const key = el.dataset.key;
    if (!key || !isSet(ctx)) return;
    const kind = libraryUi.target === "mod" ? "mod" : "main";
    if (ctx.renderer.LIB_RE.test(key)) ctx.renderer.lib.ensure(key, kind);
    const list = kind === "main" ? ctx.doc.pool.mains : ctx.doc.pool.mods;
    const adding = !list.includes(key);
    const where = `pool ${kind === "main" ? "objek" : "pengubah"}`;
    mutate(ctx, (doc) => togglePool(doc.pool, kind, key), `${adding ? "Tambah" : "Keluarkan"} ${key} ${where}`);
    toast(`${key} ${adding ? "masuk" : "keluar dari"} ${where}`);
  },
  /** @param {import("./common.js").Ctx} ctx */
  "lib-more": (ctx) => libraryAction(ctx, "lib-more", () => rerender(ctx)),
  /** @param {import("./common.js").Ctx} ctx */
  "lib-retry": (ctx) => libraryAction(ctx, "lib-retry", () => rerender(ctx)),
  /** @param {import("./common.js").Ctx} ctx */
  "k-add"(ctx, /** @type {any} */ _el, /** @type {any} */ { toast }) {
    if (!isSet(ctx)) return;
    let n = 0;
    mutate(
      ctx,
      (doc) => {
        const { added } = addCombos(doc, deps(ctx));
        n = added.length;
        if (added[0]) ctx.app.selection[doc.id] = added[0].id;
      },
      "Tambah kombinasi",
    );
    addStatus = `${n} ikon ditambahkan ke ${ctx.doc.name}.`;
    toast(`${n} ikon ditambahkan`);
    rerender(ctx);
  },
  /** @param {import("./common.js").Ctx} ctx @param {HTMLElement} el @param {any} tools */
  "add-combos": (ctx, el, tools) => actions["k-add"](ctx, el, tools),
};

/**
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {any} value
 */
function control(ctx, name, value) {
  if (!isSet(ctx)) return;
  if (libraryControl(ctx, name, value, () => rerender(ctx))) return;
  if (name === "k-family" && READY_ENGINES.includes(value)) return mutate(ctx, (doc) => setStyleValue(doc.style, "family", value), `Gaya ${/** @type {any} */ (ENGINE_NAMES)[value]}`);
  if (name === "k-pos") return mutate(ctx, (doc) => (doc.combo.pos = ["default", "BL", "TR", "BR"].includes(value) ? value : "default"), "Posisi pengubah kombinasi");
  if (name === "k-mode") return mutate(ctx, (doc) => (doc.combo.mode = value === "all" ? "all" : "set"), "Cakupan kombinasi");
  if (name === "k-skip-existing") return mutate(ctx, (doc) => (doc.combo.skipExisting = !!value), "Lewati yang sudah ada");
  if (name.startsWith("pool:")) {
    const [, kind, ...rest] = name.split(":");
    const key = rest.join(":");
    return mutate(ctx, (doc) => {
      if (value) delete doc.pool.off[`${kind}|${key}`];
      else doc.pool.off[`${kind}|${key}`] = true;
    }, `Pool ${key} ${value ? "aktif" : "nonaktif"}`);
  }
}

/* ---------- persona ---------- */

export const kombinasi = {
  persona: "kombinasi",
  layout: "left-studio",
  actions,
  control,
  /** @param {import("./common.js").Ctx} ctx */
  info(ctx) {
    if (!isSet(ctx)) return `<span class="ic-topbar__info">${esc(ctx.doc ? ctx.doc.name : "")}</span>`;
    const mx = matrixOf(ctx);
    const sum = objectsOnly(ctx.doc) ? `${mx.mains.length} objek, tanpa pengubah` : `${mx.mains.length} objek × ${mx.mods.length} pengubah = ${mx.mains.length * mx.mods.length} kombinasi`;
    return `<span class="ic-topbar__info">${esc(ctx.doc.name)} · ${esc(engineInfo(ctx.doc.style.family))}</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono studio-info-mono">${sum}</span>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  action(ctx) {
    const n = isSet(ctx) ? matrixOf(ctx).add : 0;
    return `<button type="button" class="ic-actionbtn ic-actionbtn--persona" data-action="add-combos"${n ? "" : " disabled"}>Tambahkan ${n} ke set</button>`;
  },
  /** @param {import("./common.js").Ctx} ctx */
  context(ctx) {
    if (!isSet(ctx)) return "";
    const c = ctx.doc.combo,
      family = ctx.doc.style.family;
    const pos = objectsOnly(ctx.doc)
      ? `<span class="ic-meta">${NO_MOD_TEXT}</span>`
      : `<span class="ic-label">Posisi pengubah</span>${seg("Posisi pengubah", [["default", "Bawaan"], ["BL", "Paksa BL"], ["TR", "Paksa TR"], ["BR", "Paksa BR"]], c.pos, { inline: true, name: "k-pos" })}`;
    return `<span class="ic-label">Gaya</span>${select("Gaya", READY_ENGINES.map((id) => [id, /** @type {any} */ (ENGINE_NAMES)[id]]), family, { width: 120, name: "k-family" })}<span class="ic-sep"></span>${pos}${family === "classic" ? `<span class="ic-label">Mode warna</span>${seg("Mode warna kombinasi", [["set", "Ikuti set"], ["all", "Semua 3 mode"]], c.mode, { inline: true, name: "k-mode" })}` : ""}<span class="ic-sep"></span>${button("Pilih semua", { size: "sm", action: "k-all" })}${button("Lewati semua", { size: "sm", action: "k-none" })}<span class="ic-spacer"></span>${check("Lewati yang sudah ada", c.skipExisting, { name: "k-skip-existing" })}${check("Lewati yang mirip", false, { name: "k-skip-similar", disabled: true })}`;
  },
  tools: [],
  canvas,
  /** @param {import("./common.js").Ctx} ctx */
  leftPanels(ctx) {
    const pool = isSet(ctx) ? new Set([...ctx.doc.pool.mains, ...ctx.doc.pool.mods]) : new Set();
    const cu = ctx.renderer.SOURCES.cu && ctx.renderer.SOURCES.cu.index();
    const custom = cu && cu.size ? `<div class="ic-tilegrid" style="--ic-cols: 4">${[...cu.keys()].map((n) => libraryTile(ctx, `cu:${n}`, { inPool: pool.has(`cu:${n}`) })).join("")}</div>` : empty("Belum ada ikon kustom.", "", button("Impor dari Figma…", { size: "sm", disabled: true }));
    const log = ctx.doc ? (ctx.app.history[ctx.doc.id] || []).slice(0, 30) : [];
    return [
      panel({
        id: "kombinasi-library",
        label: "Pustaka",
        grow: true,
        tabs: [
          { id: "pustaka", label: "Pustaka", body: isSet(ctx) ? libraryBody(ctx, { target: true, targetLabel: "Klik menambah ke", cols: 4, pool }) : empty("Buka set Composer lebih dulu.") },
          { id: "kustom", label: "Kustom", body: custom },
          { id: "riwayat", label: "Riwayat", body: log.length ? `<div class="ic-list">${log.map((h) => `<div class="ic-row ic-row--sm"><span class="ic-row__name">${esc(h.label)}</span></div>`).join("")}</div>` : `<span class="ic-meta">Belum ada perubahan di sesi ini.</span>`, flush: log.length > 0 },
        ],
        foot: LICENSE_NOTE,
      }),
    ];
  },
  /** @param {import("./common.js").Ctx} ctx */
  panels(ctx) {
    if (!isSet(ctx)) return [panel({ id: "kombinasi-pool", label: "Pool", grow: true, tabs: [{ id: "pool", label: "Pool", body: empty("Buka set Composer lebih dulu.") }] })];
    return [
      panel({
        id: "kombinasi-pool",
        label: "Pool",
        grow: true,
        tabs: [
          { id: "pool", label: "Pool", body: poolBody(ctx), flush: true },
          { id: "aturan", label: "Aturan", body: RULES.map(([lv, t]) => alert(/** @type {any} */ (lv), t)).join("") },
        ],
      }),
      panel({ id: "kombinasi-result", label: "Hasil", tabs: [{ id: "hasil", label: "Hasil", body: resultBody(ctx), flush: true }] }),
    ];
  },
  /** @param {import("./common.js").Ctx} ctx */
  status(ctx) {
    if (!isSet(ctx)) return statusBar("0 / 0 dipilih", "<b>Buka</b> set Composer untuk menyusun kombinasi.");
    const mx = matrixOf(ctx);
    return statusBar(`${mx.count.on} / ${mx.mains.length * mx.mods.length} dipilih`, "<b>Klik</b> sel untuk memilih atau melewati. <b>Klik</b> kepala baris/kolom untuk semua di baris/kolom itu. <b>Klik</b> ikon di pustaka untuk menambah ke pool.");
  },
  docTab: (/** @type {any} */ ctx, /** @type {any} */ doc) => (doc === ctx.doc ? `${docFileName(doc)} · Matriks kombinasi` : `${docFileName(doc)} @ 100%`),
};

