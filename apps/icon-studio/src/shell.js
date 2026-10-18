// @ts-check
/**
 * Kerangka Icon Studio (DESIGN-HANDOFF bagian 1–2): bilah atas, konteks, tool rail atau studio kiri,
 * tab dokumen, kanvas, studio kanan, dan bilah status. Isi tiap wilayah datang dari modul persona.
 * Routing memakai hash supaya file tunggal bisa dibuka dari file://.
 */
import { parseRoute, routeHash } from "./app-state.js";
import { builder } from "./personas/builder.js";
import { helpButton } from "./personas/common.js";
import { composerEdit, composerSet } from "./personas/composer.js";
import { kombinasi } from "./personas/kombinasi.js";
import { tinjau } from "./personas/tinjau.js";
import { SAMPLE_MANIFEST } from "./state/data/sample-manifest.js";
import { aria, esc, icon, iconButton } from "./ui.js";

const PERSONA_SPECS = { composer: composerSet, builder, tinjau, kombinasi };
const PERSONA_NAV = [
  ["composer", "Composer"],
  ["builder", "Builder"],
  ["tinjau", "Tinjau"],
  ["kombinasi", "Kombinasi"],
];

const LOGO = `<svg class="ic-logo" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="6" width="18" height="18" rx="5" fill="none" stroke="var(--ic-text-strong)" stroke-width="2.6"></rect><circle class="ic-logo__dot" cx="22" cy="8" r="6" stroke="var(--ic-bg-app)" stroke-width="2.4"></circle></svg>`;

/**
 * @param {{root: HTMLElement, app: ReturnType<typeof import("./app-state.js").createAppState>, renderer: any}} options
 */
export function createShell({ root, app, renderer }) {
  /** tab panel studio yang terakhir dipilih, per id panel */
  const panelTabs = new Map();
  /** panel studio yang dilipat */
  const collapsed = new Set();
  let toastTimer = 0;
  /** @type {{id: string | null, at: number}} */
  let lastClick = { id: null, at: 0 };
  /** @type {import("./personas/common.js").Ctx | null} */
  let ctx = null;

  function context() {
    const route = parseRoute(location.hash);
    const doc = app.documentFor(route.persona);
    if (doc && doc.id !== app.activeId) app.activate(doc.id, { silent: true });
    if (route.edit && doc && doc.items.some((/** @type {any} */ it) => it.id === route.edit)) app.selection[doc.id] = route.edit;
    else if (doc && app.selection[doc.id] === undefined) app.selection[doc.id] = doc.items[0] ? (doc.kind === "manifest" ? doc.items[0].uid : doc.items[0].id) : null;
    return { app, renderer, route, doc };
  }

  /** @param {any} spec @param {import("./personas/common.js").Ctx} c */
  function topbar(spec, c) {
    const nav = PERSONA_NAV.map(
      ([key, label]) =>
        `<a class="ic-persona" href="#/${key}"${key === c.route.persona ? ' aria-current="page"' : ""}>${icon(key)}${label}</a>`,
    ).join("");
    const hasSelection = !!(c.doc && c.app.selection[c.doc.id]);
    const viewMode =
      spec.viewMode
        ? `<div class="ic-persona-group" role="group" aria-label="Mode tampilan">${iconButton("view-single", "Mode satu ikon", { pressed: spec.viewMode === "single", action: "view-single", disabled: !hasSelection })}${iconButton("view-pages", "Mode ikhtisar halaman", { pressed: spec.viewMode === "pages", action: "view-pages" })}</div>`
        : "";
    return `<header class="ic-topbar">${LOGO}<nav class="ic-persona-group" aria-label="Persona">${nav}</nav>${iconButton("more", "Menu lain", { action: "more" })}${viewMode}<span class="ic-spacer"></span>${spec.info(c)}<span class="ic-sep"></span>${iconButton("undo", "Urungkan", { disabled: true })}${spec.action(c)}${helpButton()}</header>`;
  }

  /** @param {any} spec */
  function toolrail(spec) {
    const tools = spec.tools
      .map((/** @type {any} */ t, /** @type {number} */ i) =>
        t === "sep"
          ? `<span class="ic-toolrail__sep"></span>`
          : `<button type="button" class="ic-tool" ${aria("aria-pressed", i === 0)} aria-label="${esc(t[1])}" data-value="${esc(t[0])}">${icon(t[0], 20)}</button>`,
      )
      .join("");
    return `<aside class="ic-toolrail" aria-label="Alat" data-ic="single">${tools}</aside>`;
  }

  /** @param {any} spec @param {import("./personas/common.js").Ctx} c */
  function doctabs(spec, c) {
    const tabs = c.app.documents
      .map(
        (/** @type {any} */ doc) =>
          `<button type="button" class="ic-doctab" role="tab" data-doc="${esc(doc.id)}" ${aria("aria-selected", doc === c.doc)}>${esc(spec.docTab(c, doc))}</button>`,
      )
      .join("");
    return `<div class="ic-doctabs" role="tablist" aria-label="Dokumen terbuka">${tabs}</div>`;
  }

  function render() {
    const c = (ctx = context());
    const spec = c.route.edit ? composerEdit : PERSONA_SPECS[c.route.persona];
    const focused = /** @type {HTMLElement | null} */ (document.activeElement);
    const focusKey = focused && (focused.dataset.select || focused.dataset.doc) ? `[data-${focused.dataset.select ? "select" : "doc"}="${CSS.escape(focused.dataset.select || focused.dataset.doc || "")}"]` : null;
    const left = spec.layout === "left-studio";
    root.innerHTML = `<div class="ic-shell ic-app${left ? " ic-shell--left-studio" : ""}" data-persona="${c.route.persona}">
${topbar(spec, c)}
<div class="ic-context" role="toolbar" aria-label="Kontrol ${esc(c.route.persona)}">${spec.context(c)}</div>
${left ? `<aside class="ic-studio ic-studio--left" aria-label="Studio pustaka">${spec.leftPanels(c).join("")}</aside>` : toolrail(spec)}
<main class="ic-workspace">${doctabs(spec, c)}<div class="ic-canvas" tabindex="-1">${spec.canvas(c)}</div></main>
<aside class="ic-studio" aria-label="Studio">${spec.panels(c).join("")}</aside>
<footer class="ic-statusbar">${spec.status(c)}</footer>
<div class="ic-toast" role="status" hidden></div>
</div>`;
    const g = /** @type {any} */ (globalThis);
    g.ICONS_UI?.hydrateIcons(root);
    g.ICUI?.initUI(root);
    /* pulihkan tab panel dan lipatan dari render sebelumnya */
    root.querySelectorAll("[data-panel]").forEach((section) => {
      const id = /** @type {HTMLElement} */ (section).dataset.panel || "";
      const tab = panelTabs.get(id);
      if (tab) /** @type {HTMLElement | null} */ (section.querySelector(`[role="tab"][data-value="${CSS.escape(tab)}"]`))?.click();
      if (collapsed.has(id)) /** @type {HTMLElement | null} */ (section.querySelector(".ic-panel__collapse"))?.click();
    });
    if (focusKey) /** @type {HTMLElement | null} */ (root.querySelector(focusKey))?.focus();
  }

  /** @param {string} message */
  function toast(message) {
    const el = /** @type {HTMLElement | null} */ (root.querySelector(".ic-toast"));
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (el.hidden = true), 1800);
  }

  /** @param {import("./app-state.js").Route} route */
  const go = (route) => {
    const hash = routeHash(route);
    if (location.hash === hash) render();
    else location.hash = hash;
  };

  /** @param {string} text */
  async function importText(text) {
    const result = await app.importManifest(text);
    const message = /** @type {HTMLElement | null} */ (root.querySelector('[data-role="import-message"]'));
    if (result.fatal) {
      if (message) message.textContent = result.fatal;
      return;
    }
    go({ persona: "builder", edit: null });
    toast(`${result.doc.items.length} ikon diimpor`);
  }

  /** @param {string} action @param {HTMLElement} el */
  function runAction(action, el) {
    const c = ctx;
    if (!c) return;
    const persona = c.route.persona;
    if (action === "view-pages") return go({ persona: "composer", edit: null });
    if (action === "view-single") {
      const id = c.doc && c.app.selection[c.doc.id];
      if (id) go({ persona: "composer", edit: id });
      return;
    }
    if (action === "export") {
      if (persona === "composer") return go({ persona: "tinjau", edit: null });
      return toast("Unduhan ZIP dibangun pada tahap berikutnya.");
    }
    if (action === "import-sample") return void importText(JSON.stringify(SAMPLE_MANIFEST, null, 2));
    if (action === "import-text") {
      const area = /** @type {HTMLTextAreaElement | null} */ (root.querySelector('[data-name="manifest-text"]'));
      return void importText(area ? area.value : "");
    }
    if (action === "import-file") return;
    if (action === "load-preset" && c.doc) return app.loadPreset(c.doc.id);
    void el;
    toast("Fitur ini dibangun pada tahap berikutnya.");
  }

  root.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const docTab = /** @type {HTMLElement | null} */ (target.closest("[data-doc]"));
    if (docTab) {
      const doc = app.byId(docTab.dataset.doc || "");
      if (!doc || !ctx) return;
      app.activate(doc.id, { silent: true });
      const persona = ctx.route.persona;
      if (persona === "composer" || persona === "builder" || persona === "kombinasi")
        return go({ persona: doc.kind === "manifest" ? "builder" : persona === "builder" ? "composer" : persona, edit: null });
      return render();
    }
    const selectable = /** @type {HTMLElement | null} */ (target.closest("[data-select]"));
    if (selectable && ctx && ctx.doc) {
      const id = selectable.dataset.select || null;
      /* klik dua kali dideteksi manual karena klik pertama merender ulang elemen */
      const now = Date.now();
      if (selectable.dataset.open && lastClick.id === id && now - lastClick.at < 450) {
        lastClick = { id: null, at: 0 };
        return go({ persona: "composer", edit: selectable.dataset.open });
      }
      lastClick = { id, at: now };
      if (app.selection[ctx.doc.id] !== id) app.select(ctx.doc.id, id);
      return;
    }
    const actionEl = /** @type {HTMLElement | null} */ (target.closest("[data-action]"));
    if (actionEl && !(/** @type {HTMLButtonElement} */ (actionEl).disabled)) runAction(actionEl.dataset.action || "", actionEl);
    const collapse = /** @type {HTMLElement | null} */ (target.closest(".ic-panel__collapse"));
    if (collapse && event.isTrusted) {
      const id = /** @type {HTMLElement | null} */ (collapse.closest("[data-panel]"))?.dataset.panel || "";
      if (collapse.getAttribute("aria-expanded") === "false") collapsed.add(id);
      else collapsed.delete(id);
    }
  });

  root.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if ((event.key === "Enter" || event.key === " ") && target.dataset.select && target.getAttribute("role") === "option") {
      event.preventDefault();
      if (ctx && ctx.doc) app.select(ctx.doc.id, target.dataset.select);
    }
  });

  /* Esc dari mode edit kembali ke ikhtisar, juga saat fokus berada di luar #app */
  document.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (event.key === "Escape" && ctx && ctx.route.edit && !target.closest?.(".ic-select")) go({ persona: "composer", edit: null });
  });

  root.addEventListener("change", async (event) => {
    const input = /** @type {HTMLInputElement} */ (event.target);
    if (input.dataset.action === "import-file" && input.files && input.files[0]) await importText(await input.files[0].text());
  });

  root.addEventListener("ic-change", (event) => {
    const section = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (event.target).closest("[data-panel]"));
    if (section && /** @type {HTMLElement} */ (event.target) === section) panelTabs.set(section.dataset.panel || "", String(/** @type {CustomEvent} */ (event).detail.value));
  });

  window.addEventListener("hashchange", render);
  app.subscribe(render);
  return { render, toast };
}
