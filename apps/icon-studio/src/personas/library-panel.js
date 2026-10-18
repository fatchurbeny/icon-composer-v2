// @ts-check
/**
 * Panel Pustaka (DESIGN-HANDOFF 3.1.1 dan 3.5): sumber, pencarian, filter Bentuk (ADR-015), dan tile.
 * Dipakai Composer · Set dan nanti Kombinasi. Pencarian meniru `luList` Icon Composer 1.5.1,
 * termasuk terjemahan kata Indonesia lewat `ID_EN`.
 */
import { partStr } from "@icon-studio/core";
import { ID_EN } from "@icon-studio/icon-sources/catalog";
import { alert, button, esc, seg } from "../ui.js";

const SOURCE_LABEL = { all: "Semua", lu: "Lucide", tb: "Tabler", hg: "Huge", cu: "Kustom" };
const PAGE = 40;

/** State tampilan pustaka (tidak disimpan). */
export const libraryUi = { src: "all", query: "", shape: "all", shown: PAGE, target: "main" };

/** Cache "punya bentuk tertutup" per kunci ikon (ADR-015). */
const fillable = new Map();

/**
 * @param {import("./common.js").Ctx} ctx
 * @param {string} key
 */
function isFillable(ctx, key) {
  if (!fillable.has(key)) {
    const A = ctx.renderer.shapes.analyze(key);
    fillable.set(key, !!(A && A.hasBody));
  }
  return fillable.get(key);
}

/**
 * Nama di satu sumber, diurutkan menurut kecocokan pencarian.
 * @param {any} S sumber dari createIconSources
 * @param {Map<string, any>} idx
 * @param {string} q
 */
function namesOf(S, idx, q) {
  if (!q) return String(S.cats()[S.dflt] || "").split(" ").filter((n) => idx.has(n));
  const terms = q.split(/[,\s]+/).filter(Boolean).map((t) => /** @type {any} */ (ID_EN)[t] || t);
  return [...idx.keys()]
    .map((n) => {
      let s = 0;
      for (const t of terms) {
        if (n === t) s += 10;
        else if (n.startsWith(t)) s += 6;
        else if (n.split("-").includes(t)) s += 5;
        else if (n.includes(t)) s += 2;
      }
      return /** @type {[string, number]} */ ([n, s]);
    })
    .filter((x) => x[1] > 0)
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)
    .map((x) => x[0]);
}

/**
 * Hasil pustaka untuk keadaan UI saat ini.
 * @param {import("./common.js").Ctx} ctx
 */
export function libraryResults(ctx) {
  const { SOURCES, icons } = ctx.renderer;
  const q = libraryUi.query.trim().toLowerCase();
  const wanted = libraryUi.src === "all" ? Object.keys(SOURCES) : [libraryUi.src];
  /** @type {string[]} */
  let keys = [];
  const loading = [],
    failed = [],
    idle = [];
  for (const src of wanted) {
    const S = SOURCES[src],
      idx = S && S.index();
    if (!idx) {
      const state = src === "tb" ? icons.tbState : src === "hg" ? icons.hgState : "ready";
      (state === "loading" ? loading : state === "error" ? failed : idle).push(src);
      continue;
    }
    keys = keys.concat(namesOf(S, idx, q).map((n) => `${src}:${n}`));
  }
  let more = false;
  if (libraryUi.shape !== "all") {
    const want = libraryUi.shape === "fill";
    const out = [];
    for (const key of keys) {
      if (out.length > libraryUi.shown) {
        more = true;
        break;
      }
      if (isFillable(ctx, key) === want) out.push(key);
    }
    keys = out;
  }
  return { keys, more: more || keys.length > libraryUi.shown, loading, failed, idle };
}

/**
 * Tile satu ikon pustaka: garis dari node mentah, penanda bentuk, dan tanda "di pool".
 * @param {import("./common.js").Ctx} ctx
 * @param {string} key
 * @param {{inPool?: boolean, action?: string}} [opts]
 */
export function libraryTile(ctx, key, opts = {}) {
  const A = ctx.renderer.shapes.analyze(key);
  const art = A
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${A.node.map(([t, a]) => partStr({ tag: t, attrs: a })).join("").replace(/INK/g, "currentColor")}</svg>`
    : "";
  return `<button type="button" class="ic-tile" data-action="${opts.action || "lib-pick"}" data-key="${esc(key)}" aria-label="${esc(key)}" title="${esc(key)}"${opts.inPool ? ' data-in-pool="true"' : ""}>${art}<span class="ic-tile__kind" data-kind="${isFillable(ctx, key) ? "fill" : "line"}"></span>${opts.inPool ? '<span class="ic-tile__check" aria-hidden="true">✓</span>' : ""}</button>`;
}

/**
 * Isi tab Pustaka.
 * @param {import("./common.js").Ctx} ctx
 * @param {{cols?: number, target?: boolean, targetLabel?: string, pool?: Set<string>, sources?: string[]}} [opts]
 */
export function libraryBody(ctx, opts = {}) {
  const sources = Object.keys(ctx.renderer.SOURCES);
  const srcSeg = seg("Sumber pustaka", [["all", "Semua"], ...sources.map((k) => /** @type {[string, string]} */ ([k, /** @type {any} */ (SOURCE_LABEL)[k]]))], libraryUi.src, { name: "lib-src" });
  const r = libraryResults(ctx);
  const count = r.loading.length ? "Memuat pustaka…" : `${r.keys.length}${r.more ? "+" : ""} ikon`;
  const search = `<label class="ic-field ic-field--search" data-name="lib-query">${/** @type {any} */ (globalThis).ICONS_UI.uiIcon("search", 13)}<input type="search" value="${esc(libraryUi.query)}" placeholder="Cari ikon di pustaka" aria-label="Cari ikon di pustaka"><span class="ic-meta">${count}</span></label>`;
  const shape = `<div class="ic-formrow"><span class="ic-label">Bentuk</span>${seg("Bentuk ikon", [["all", "Semua"], ["line", "Garis"], ["fill", "Isi"]], libraryUi.shape, { name: "lib-shape" })}</div>`;
  const target = opts.target
    ? `<div class="ic-formrow"><span class="ic-label">${esc(opts.targetLabel || "Klik mengganti")}</span>${seg(opts.targetLabel || "Klik mengganti lapisan", [["main", opts.targetLabel ? "Objek" : "Objek utama"], ["mod", "Pengubah"]], libraryUi.target === "mod" ? "mod" : "main", { name: "lib-target" })}</div>`
    : "";
  let grid;
  if (r.failed.length && !r.keys.length)
    grid = `${alert("err", "Gagal memuat pustaka. Periksa koneksi internet.")}${button("Coba lagi", { size: "sm", action: "lib-retry" })}`;
  else if (r.loading.length && !r.keys.length)
    grid = `<div class="ic-tilegrid" style="--ic-cols: ${opts.cols || 5}" aria-busy="true">${'<span class="ic-tile" aria-hidden="true"></span>'.repeat(10)}</div>`;
  else if (!r.keys.length)
    grid = `<span class="ic-meta">${r.idle.length && libraryUi.src !== "all" ? "Pustaka belum dimuat." : "Tidak ada ikon yang cocok. Coba kata Inggris atau sumber lain."}</span>`;
  else
    grid = `<div class="ic-tilegrid" style="--ic-cols: ${opts.cols || 5}">${r.keys
      .slice(0, libraryUi.shown)
      .map((key) => libraryTile(ctx, key, { inPool: opts.pool && opts.pool.has(key) }))
      .join("")}</div>${r.more ? button("Muat lagi", { size: "sm", action: "lib-more" }) : ""}`;
  const idleNote =
    libraryUi.src === "all" && r.idle.length
      ? `<span class="ic-meta">${r.idle.map((s) => /** @type {any} */ (SOURCE_LABEL)[s]).join(" dan ")} dimuat saat sumbernya dipilih.</span>`
      : "";
  return `${srcSeg}${search}${shape}${target}${grid}${idleNote}`;
}

/** Keterangan lisensi untuk kaki panel. */
export const LICENSE_NOTE = `<span class="ic-meta">Lucide ISC · Tabler MIT · Hugeicons Free MIT</span>`;

/**
 * Terapkan kontrol pustaka. Mengembalikan true bila kontrol dikenali.
 * @param {import("./common.js").Ctx} ctx
 * @param {string} name
 * @param {any} value
 * @param {() => void} rerender
 */
export function libraryControl(ctx, name, value, rerender) {
  if (name === "lib-src") {
    libraryUi.src = String(value);
    libraryUi.shown = PAGE;
    const loader = value === "tb" ? ctx.renderer.loadTabler : value === "hg" ? ctx.renderer.loadHugeicons : null;
    if (loader) loader().then(() => rerender());
  } else if (name === "lib-query") {
    libraryUi.query = String(value);
    libraryUi.shown = PAGE;
  } else if (name === "lib-shape") {
    libraryUi.shape = String(value);
    libraryUi.shown = PAGE;
  } else if (name === "lib-target") libraryUi.target = value === "mod" ? "mod" : "main";
  else return false;
  rerender();
  return true;
}

/**
 * Aksi pustaka umum (muat lagi, coba lagi).
 * @param {import("./common.js").Ctx} ctx
 * @param {string} action
 * @param {() => void} rerender
 */
export function libraryAction(ctx, action, rerender) {
  if (action === "lib-more") {
    libraryUi.shown += PAGE;
    rerender();
    return true;
  }
  if (action === "lib-retry") {
    const jobs = [];
    if (ctx.renderer.icons.tbState === "error") jobs.push(ctx.renderer.loadTabler());
    if (ctx.renderer.icons.hgState === "error") jobs.push(ctx.renderer.loadHugeicons());
    rerender();
    Promise.all(jobs).then(rerender);
    return true;
  }
  return false;
}
