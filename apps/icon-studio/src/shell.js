// @ts-check
/**
 * Kerangka Icon Studio (DESIGN-HANDOFF bagian 1–2): bilah atas, konteks, tool rail atau studio kiri,
 * tab dokumen, kanvas, studio kanan, dan bilah status. Isi tiap wilayah datang dari modul persona.
 * Routing memakai hash supaya file tunggal bisa dibuka dari file://.
 */
import { parseRoute, routeHash } from "./app-state.js";
import { builder } from "./personas/builder.js";
import { helpButton } from "./personas/common.js";
import { colorActions, pickerExtra } from "./personas/color-picker.js";
import { composerSet } from "./personas/composer.js";
import { composerEdit } from "./personas/composer-edit.js";
import { kombinasi } from "./personas/kombinasi.js";
import { tinjau } from "./personas/tinjau.js";
import { createCanvasZoom, zoomLabel } from "./canvas-zoom.js";
import { libraryUi } from "./personas/library-panel.js";
import { TOOL_KEYS, TOOL_TIPS, tipId, toolTipMarkup } from "./tool-tips.js";
import { SAMPLE_MANIFEST } from "./state/data/sample-manifest.js";
import { aria, esc, icon, iconButton } from "./ui.js";

/** Tool mode (tetap aktif) dan padanannya di canvas-zoom; tool lain adalah perintah sekali klik. */
const MODE_TOOLS = /** @type {Record<string, string>} */ ({ select: "select", move: "select", hand: "hand", zoom: "zoom", magnifier: "zoom" });

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
  /* isi popover pemilih warna (Preset saya, palet kurasi, harmoni) dibaca dari state app saat dibuka */
  const ui = /** @type {any} */ (globalThis).ICUI;
  if (ui) ui.colorpickerExtra = (/** @type {{name: string, value: string}} */ info) => pickerExtra(app, info);
  /** tab panel studio yang terakhir dipilih, per id panel */
  const panelTabs = new Map();
  /** panel studio yang terbuka per kolom akordeon, kunci `persona[:edit]:label kolom` */
  const openPanels = new Map();
  /** ic-change dari pemulihan setelah render ulang tidak dicatat sebagai pilihan pengguna */
  let restoring = false;
  let toastTimer = 0,
    toastUntil = 0,
    toastMessage = "";
  /** @type {{id: string | null, at: number}} */
  let lastClick = { id: null, at: 0 };
  /** @type {import("./personas/common.js").Ctx | null} */
  let ctx = null;
  /** @type {any} */
  let spec = null;
  /** @type {string | null} */
  let lastEdit = null;
  /** zoom dan geser kanvas per tampilan (dokumen + persona) */
  const zoom = createCanvasZoom({
    root,
    keyOf: () => (ctx ? `${ctx.doc ? ctx.doc.id : "kosong"}:${ctx.route.persona}${ctx.route.edit ? ":edit" : ""}` : "awal"),
  });
  let currentTool = "select";

  function context() {
    const route = parseRoute(location.hash);
    const doc = app.documentFor(route.persona);
    if (doc && doc.id !== app.activeId) app.activate(doc.id, { silent: true });
    /* rute edit menentukan seleksi saat rute berubah; seleksi dari UI menyusul ke rute (replace) */
    if (route.edit && doc && doc.items.some((/** @type {any} */ it) => it.id === route.edit)) {
      const picked = app.selection[doc.id];
      if (route.edit !== lastEdit || !doc.items.some((/** @type {any} */ it) => it.id === picked)) app.selection[doc.id] = route.edit;
      else if (picked && picked !== route.edit) {
        history.replaceState(null, "", routeHash({ persona: "composer", edit: picked }));
        route.edit = picked;
      }
      lastEdit = route.edit;
    } else if (route.edit && doc) {
      /* ikon pada rute edit sudah dihapus: kembali ke ikhtisar */
      history.replaceState(null, "", routeHash({ persona: "composer", edit: null }));
      route.edit = null;
      lastEdit = null;
    } else if (doc && app.selection[doc.id] === undefined) app.selection[doc.id] = doc.items[0] ? (doc.kind === "manifest" ? doc.items[0].uid : doc.items[0].id) : null;
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
    return `<header class="ic-topbar">${LOGO}<nav class="ic-persona-group" aria-label="Persona">${nav}</nav>${iconButton("more", "Menu lain", { action: "more" })}${viewMode}<span class="ic-spacer"></span>${spec.info(c)}<span class="ic-sep"></span>${iconButton("undo", "Urungkan", { action: "undo", disabled: !(c.doc && c.app.canUndo(c.doc.id)) })}${iconButton("redo", "Ulangi", { action: "redo", disabled: !(c.doc && c.app.canRedo(c.doc.id)) })}${spec.action(c)}${helpButton()}</header>`;
  }

  /** @param {any} spec */
  function toolrail(spec) {
    const hasCurrent = spec.tools.some((/** @type {any} */ x) => x[0] === currentTool);
    const tools = spec.tools
      .map((/** @type {any} */ t, /** @type {number} */ i) => {
        if (t === "sep") return `<span class="ic-toolrail__sep"></span>`;
        const pressed = hasCurrent ? t[0] === currentTool : i === 0;
        const label = `${t[1]}${TOOL_KEYS[t[0]] ? ` (${TOOL_KEYS[t[0]]})` : ""}`;
        const tip = TOOL_TIPS[t[0]] ? ` data-tip="${tipId(t[0])}" aria-describedby="${tipId(t[0])}"` : "";
        return `<button type="button" class="ic-tool" aria-label="${esc(label)}" ${aria("aria-pressed", pressed)} data-value="${esc(t[0])}"${tip}>${icon(t[0], 20)}</button>`;
      })
      .join("");
    /* rich tooltip tool: elemen tersembunyi, ditampilkan dan diposisikan oleh components.js */
    const tips = spec.tools
      .filter((/** @type {any} */ t) => t !== "sep")
      .map((/** @type {any} */ t) => toolTipMarkup(t[0], t[1]))
      .join("");
    return `<aside class="ic-toolrail" aria-label="Alat" data-ic="single" data-name="tool">${tools}${tips}</aside>`;
  }

  /** @param {any} spec @param {import("./personas/common.js").Ctx} c */
  function doctabs(spec, c) {
    const tabs = c.app.documents
      .map(
        (/** @type {any} */ doc) =>
          `<button type="button" class="ic-doctab" role="tab" data-doc="${esc(doc.id)}" ${aria("aria-selected", doc === c.doc)}>${docTabLabel(spec, c, doc)}</button>`,
      )
      .join("");
    return `<div class="ic-doctabs" role="tablist" aria-label="Dokumen terbuka">${tabs}</div>`;
  }

  /**
   * Label tab dokumen; tab aktif menampilkan zoom kanvas saat ini.
   * @param {any} spec @param {import("./personas/common.js").Ctx} c @param {any} doc
   */
  function docTabLabel(spec, c, doc) {
    const label = esc(spec.docTab(c, doc));
    if (doc !== c.doc) return label;
    const z = `<span data-role="zoom-label">${zoomLabel(zoom.get())}</span>`;
    return label.includes("@ 100%") ? label.replace("@ 100%", `@ ${z}`) : `${label} @ ${z}`;
  }

  /** Kontrol zoom di ujung kanan bilah status. */
  const zoomBar = () =>
    `<span class="ic-spacer"></span><span class="studio-zoombar" role="group" aria-label="Zoom kanvas"><button type="button" class="studio-zoombtn" data-action="zoom-out" aria-label="Perkecil (⌘ −)" title="Perkecil (⌘ −)">${icon("zoom-out", 13)}</button><button type="button" class="studio-zoombtn studio-zoombtn--label" data-action="zoom-reset" aria-label="Zoom kanvas, klik untuk 100% (⌘ 1)" title="100% (⌘ 1)"><span data-role="zoom-label">${zoomLabel(zoom.get())}</span></button><button type="button" class="studio-zoombtn" data-action="zoom-in" aria-label="Perbesar (⌘ =)" title="Perbesar (⌘ =)">${icon("zoom", 13)}</button><button type="button" class="studio-zoombtn" data-action="zoom-fit" aria-label="Sesuaikan ke layar (⌘ 0)" title="Sesuaikan ke layar (⌘ 0)">${icon("zoom-fit", 13)}</button></span>`;

  /* render ulang bisa dipicu event blur/change saat innerHTML sedang diganti: tunda, jangan bersarang */
  let rendering = false,
    pendingRender = false;
  function render() {
    if (rendering) {
      pendingRender = true;
      return;
    }
    rendering = true;
    try {
      renderNow();
    } finally {
      rendering = false;
    }
    if (pendingRender) {
      pendingRender = false;
      queueMicrotask(render);
    }
  }

  function renderNow() {
    const c = (ctx = context());
    spec = c.route.edit ? composerEdit : PERSONA_SPECS[c.route.persona];
    const focused = /** @type {HTMLElement | null} */ (document.activeElement);
    const focusKey = focused && (focused.dataset.select || focused.dataset.doc) ? `[data-${focused.dataset.select ? "select" : "doc"}="${CSS.escape(focused.dataset.select || focused.dataset.doc || "")}"]` : null;
    /* fokus di kontrol bernama (mis. pencarian) dan posisi gulir ikut dipulihkan setelah render ulang */
    const named = focused && focused.closest ? /** @type {HTMLElement | null} */ (focused.closest("[data-name]")) : null;
    const focusName = named && root.contains(named) ? named.dataset.name : null;
    const caret = focused instanceof HTMLInputElement ? focused.selectionStart : null;
    const scrolls = [...root.querySelectorAll(".ic-canvas, [role=tabpanel][id], .ic-studio")].map((el, i) => [el.id || `#${i}`, el.scrollTop, el.scrollLeft]);
    const left = spec.layout === "left-studio";
    root.innerHTML = `<div class="ic-shell ic-app${left ? " ic-shell--left-studio" : ""}" data-persona="${c.route.persona}">
${topbar(spec, c)}
<div class="ic-context" role="toolbar" aria-label="Kontrol ${esc(c.route.persona)}">${spec.context(c)}</div>
${left ? `<aside class="ic-studio ic-studio--left" aria-label="Studio pustaka" data-ic="accordion">${spec.leftPanels(c).join("")}</aside>` : toolrail(spec)}
<main class="ic-workspace">${doctabs(spec, c)}<div class="ic-canvas" tabindex="-1" data-tool="${esc(currentTool)}"><div class="studio-zoom" style="zoom: ${zoom.get()}">${spec.canvas(c)}</div></div>${spec.canvasFoot ? spec.canvasFoot(c) : ""}</main>
<aside class="ic-studio" aria-label="Studio" data-ic="accordion">${spec.panels(c).join("")}</aside>
<footer class="ic-statusbar">${spec.status(c)}${zoomBar()}</footer>
<div class="ic-toast" role="status" hidden></div>
</div>`;
    const g = /** @type {any} */ (globalThis);
    g.ICONS_UI?.hydrateIcons(root);
    g.ICUI?.initUI(root);
    /* zoom dipasang sebelum posisi gulir dipulihkan, supaya ukuran isi yang di-zoom sudah benar.
       Persona tanpa tool aktif (mis. Kombinasi tanpa rail) memakai tool Pilih. */
    zoom.setTool(spec.tools.some((/** @type {any} */ t) => t[0] === currentTool) ? MODE_TOOLS[currentTool] || "select" : "select");
    zoom.attach();
    /* pulihkan tab panel dan panel terbuka dari render sebelumnya. Klik tab di panel tertutup ikut membuka
       panelnya (akordeon), jadi panel terbuka dipulihkan sesudahnya. Tanpa catatan, kit memilih panel awal. */
    restoring = true;
    root.querySelectorAll("[data-panel]").forEach((section) => {
      const tab = panelTabs.get(/** @type {HTMLElement} */ (section).dataset.panel || "");
      if (tab) /** @type {HTMLElement | null} */ (section.querySelector(`[role="tab"][data-value="${CSS.escape(tab)}"]`))?.click();
    });
    root.querySelectorAll('[data-ic="accordion"]').forEach((column) => {
      const id = openPanels.get(columnKey(/** @type {HTMLElement} */ (column)));
      const section = id && column.querySelector(`:scope > [data-panel="${CSS.escape(id)}"]`);
      if (section) g.ICUI?.openPanel(section);
    });
    restoring = false;
    if (focusKey) /** @type {HTMLElement | null} */ (root.querySelector(focusKey))?.focus();
    if (focusName) {
      const el = /** @type {HTMLElement | null} */ (root.querySelector(`[data-name="${CSS.escape(focusName)}"]`));
      const input = el && (el.matches("input, textarea") ? el : el.querySelector("input, textarea, .ic-select__trigger"));
      if (input) {
        /** @type {HTMLInputElement} */ (input).focus();
        if (caret != null && input instanceof HTMLInputElement && /^(text|search)$/.test(input.type)) input.setSelectionRange(caret, caret);
      }
    }
    const scrollEls = [...root.querySelectorAll(".ic-canvas, [role=tabpanel][id], .ic-studio")];
    for (const [key, top, leftPos] of scrolls) {
      const el = String(key).startsWith("#") ? scrollEls[Number(String(key).slice(1))] : root.querySelector(`#${CSS.escape(String(key))}`);
      if (el && top) el.scrollTop = Number(top);
      if (el && leftPos) el.scrollLeft = Number(leftPos);
    }
    showToast();
    /* popover pemilih warna di luar #app: cari pemicu barunya dan baca ulang warna setelah render */
    g.ICUI?.syncColorpicker?.();
    if (spec.mount) spec.mount(root, c, { toast, go, importText });
  }

  /** @param {string} message */
  function toast(message) {
    toastMessage = message;
    toastUntil = Date.now() + 1800;
    showToast();
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(showToast, 1810);
  }

  /** Pasang ulang toast yang masih aktif (render ulang mengganti seluruh kerangka). */
  function showToast() {
    const el = /** @type {HTMLElement | null} */ (root.querySelector(".ic-toast"));
    if (!el) return;
    const active = Date.now() < toastUntil;
    el.textContent = active ? toastMessage : "";
    el.hidden = !active;
  }

  /**
   * Urungkan atau ulangi satu langkah di dokumen aktif. Seleksi diperbaiki oleh app-state; mode Edit
   * dengan ikon yang hilang kembali ke ikhtisar lewat context().
   * @param {"undo" | "redo"} dir
   */
  function undoRedo(dir) {
    const doc = ctx && ctx.doc;
    if (!doc) return;
    const label = dir === "undo" ? app.undo(doc.id) : app.redo(doc.id);
    if (label != null) toast(`${dir === "undo" ? "Diurungkan" : "Diulang"}: ${label}`);
  }

  /** @param {import("./app-state.js").Route} route */
  const go = (route) => {
    const hash = routeHash(route);
    if (location.hash === hash) render();
    else location.hash = hash;
  };

  /** @param {string} text @param {{sample?: boolean}} [opts] */
  async function importText(text, opts = {}) {
    const message = /** @type {HTMLElement | null} */ (root.querySelector('[data-role="import-message"]'));
    /* gaya.json offset-composer 1.0.1 menjadi set Composer bergaya Offset */
    const offset = await app.importOffsetSet(text);
    if (offset) {
      if (offset.fatal) {
        if (message) message.textContent = offset.fatal;
        return;
      }
      go({ persona: "composer", edit: null });
      toast([`${offset.doc.items.length} ikon offset-composer diimpor`, ...(offset.warnings || [])].join(". "));
      return;
    }
    /* gaya.json sticker-composer menjadi set Composer bergaya Sticker */
    const sticker = await app.importStickerSet(text);
    if (sticker) {
      if (sticker.fatal) {
        if (message) message.textContent = sticker.fatal;
        return;
      }
      go({ persona: "composer", edit: null });
      toast([`${sticker.doc.items.length} ikon sticker-composer diimpor`, ...(sticker.warnings || [])].join(". "));
      return;
    }
    const result = await app.importManifest(text, opts);
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
    if (action === "zoom-in") return zoom.zoomIn();
    if (action === "zoom-out") return zoom.zoomOut();
    if (action === "zoom-reset") return zoom.reset();
    if (action === "zoom-fit") return zoom.fit();
    if (action === "undo" || action === "redo") return undoRedo(action);
    if (colorActions[action]) return colorActions[action](c, el, { toast });
    if (spec && spec.actions && spec.actions[action]) return spec.actions[action](c, el, { toast, go, importText });
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
    if (action === "import-sample") return void importText(JSON.stringify(SAMPLE_MANIFEST, null, 2), { sample: true });
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
  });

  root.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if ((event.key === "Enter" || event.key === " ") && target.dataset.select && target.getAttribute("role") === "option") {
      event.preventDefault();
      if (ctx && ctx.doc) app.select(ctx.doc.id, target.dataset.select);
    }
  });

  /** Tandai tool aktif di rail tanpa render ulang. */
  const paintRail = () =>
    root.querySelectorAll(".ic-toolrail .ic-tool").forEach((b) => b.setAttribute("aria-pressed", String(/** @type {HTMLElement} */ (b).dataset.value === currentTool)));

  /** @param {HTMLElement} column kolom akordeon `.ic-studio` */
  const columnKey = (column) => `${ctx ? ctx.route.persona + (ctx.route.edit ? ":edit" : "") : "awal"}:${column.getAttribute("aria-label")}`;

  /** @param {string} panelTab tab panel studio (data-value) yang dibuka; panelnya ikut terbuka (akordeon) */
  const openStudioTab = (panelTab) => /** @type {HTMLElement | null} */ (root.querySelector(`.ic-studio [role="tab"][data-value="${panelTab}"]`))?.click();

  /**
   * Tool perintah: dijalankan sekali, lalu rail kembali ke tool mode sebelumnya.
   * @type {Record<string, () => void>}
   */
  const COMMANDS = {
    "add-main": () => openLibrary("main"),
    "add-mod": () => openLibrary("mod"),
    swap: () => openLibrary("main"),
    combine: () => go({ persona: "kombinasi", edit: null }),
    deco: () => {
      if (!ctx) return;
      if (ctx.route.persona === "builder") return openStudioTab("ikon");
      libraryUi.target = "deco";
      render();
      openStudioTab(ctx.route.edit ? "transform" : "lapisan");
    },
    tag: () => {
      openStudioTab("ikon");
      /** @type {HTMLElement | null} */ (root.querySelector('[data-name="b-id"] input'))?.focus();
    },
    compare: () => {
      if (!ctx || !ctx.doc || !spec || !spec.control) return;
      spec.control(ctx, "t-compare", ctx.doc.review && ctx.doc.review.compare === "direct" ? "source" : "direct", root, { toast, go, importText });
    },
    eyedropper: () => toast("Ambil warna belum aktif di versi ini. Atur warna lewat panel Warna."),
  };

  /** @param {"main" | "mod"} target */
  function openLibrary(target) {
    libraryUi.target = target;
    render();
    openStudioTab("pustaka");
    /** @type {HTMLElement | null} */ (root.querySelector('[data-name="lib-query"] input'))?.focus();
  }

  /** @param {string} tool */
  function pickTool(tool) {
    if (MODE_TOOLS[tool]) {
      currentTool = tool;
      zoom.setTool(MODE_TOOLS[tool]);
      return paintRail();
    }
    paintRail();
    if (COMMANDS[tool]) COMMANDS[tool]();
  }

  /* pintasan tool: V pilih, H geser tampilan, Z perbesar (tanpa tombol pengubah, di luar isian) */
  document.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (event.metaKey || event.ctrlKey || event.altKey || (target.closest && target.closest("input, textarea"))) return;
    if (!spec) return;
    const tool = spec.tools.find((/** @type {any} */ t) => t !== "sep" && TOOL_KEYS[t[0]] && TOOL_KEYS[t[0]].toLowerCase() === event.key.toLowerCase());
    if (tool) pickTool(tool[0]);
  });

  /* ⌘/Ctrl+Z urungkan, ⌘/Ctrl+Shift+Z dan Ctrl+Y ulangi. Di isian teks, pintasan milik isian itu. */
  document.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    if (target.closest && target.closest("input, textarea, [contenteditable]")) return;
    const key = event.key.toLowerCase();
    const dir = key === "z" ? (event.shiftKey ? "redo" : "undo") : key === "y" && event.ctrlKey && !event.shiftKey ? "redo" : null;
    if (!dir) return;
    event.preventDefault();
    undoRedo(dir);
  });

  /* Esc dari mode edit kembali ke ikhtisar, juga saat fokus berada di luar #app */
  document.addEventListener("keydown", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (event.key === "Escape" && ctx && ctx.route.edit && !target.closest?.(".ic-select, .ic-colorpicker")) go({ persona: "composer", edit: null });
  });

  /**
   * Kontrol bernama (`data-name`) diteruskan ke persona: `spec.control(ctx, name, value, el)`.
   * @param {HTMLElement} el
   * @param {unknown} value
   */
  function control(el, value) {
    const named = /** @type {HTMLElement | null} */ (el.closest("[data-name]"));
    if (rendering || !named || !ctx || !spec || !spec.control) return;
    spec.control(ctx, named.dataset.name, value, named, { toast, go, importText });
  }

  root.addEventListener("change", async (event) => {
    const input = /** @type {HTMLInputElement} */ (event.target);
    if (input.dataset.action === "import-file" && input.files && input.files[0]) return void (await importText(await input.files[0].text()));
    if (input.type === "checkbox") return control(input, input.checked);
    /* slider dan angka: nilai diterapkan saat dilepas atau selesai diketik, supaya geser tidak terputus render */
    if (input.closest('[data-ic="slider"], [data-ic="number"]')) return control(input, Number(input.value));
    if (input.type === "text" || input.type === "search") return control(input, input.value);
  });

  root.addEventListener("ic-change", (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const section = /** @type {HTMLElement | null} */ (target.closest("[data-panel]"));
    if (target.dataset.ic === "accordion") {
      if (!restoring) openPanels.set(columnKey(target), String(/** @type {CustomEvent} */ (event).detail.value));
      return;
    }
    if (section && target === section) return void panelTabs.set(section.dataset.panel || "", String(/** @type {CustomEvent} */ (event).detail.value));
    /* slider memancarkan ic-change saat digeser; nilainya diterapkan lewat event change di atas */
    if (target.dataset.ic === "slider") return;
    if (target.dataset.name === "tool") return pickTool(String(/** @type {CustomEvent} */ (event).detail.value));
    if (target.dataset.name) control(target, /** @type {CustomEvent} */ (event).detail.value);
  });

  /* tombol di dalam popover pemilih warna (preset, palet, harmoni) dipancarkan dari pemicunya */
  root.addEventListener("ic-colorpicker-action", (event) => {
    const detail = /** @type {CustomEvent} */ (event).detail;
    if (detail && detail.action) runAction(String(detail.action), detail.el);
  });

  /* pencarian pustaka: ketik langsung memfilter tanpa menunggu Enter */
  let searchTimer = 0;
  root.addEventListener("input", (event) => {
    const input = /** @type {HTMLInputElement} */ (event.target);
    if (input.type !== "search" || !input.closest("[data-name]")) return;
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => control(input, input.value), 180);
  });

  window.addEventListener("hashchange", render);
  app.subscribe(render);
  return { render, toast };
}
