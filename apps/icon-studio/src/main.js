// @ts-check
import "@icon-studio/ui/tokens.css";
import "@icon-studio/ui/components.css";
import "@icon-studio/ui/components.js";
import "@icon-studio/ui/icons.js";
import "./style.css";
import "@icon-studio/export/vendor/icon-outline";
import { dedupeAttrs } from "@icon-studio/core";
import { directFillSvgFile } from "@icon-studio/export";
import * as documentModel from "./state/document.js";
import { createRenderer } from "./state/render.js";
import { SAMPLE_MANIFEST } from "./state/data/sample-manifest.js";
import * as store from "./state/store.js";

/* mesin dan pustaka: satu renderer untuk seluruh app */
const renderer = createRenderer({
  getLucide: () => /** @type {any} */ (window).lucide,
  measureHost: () => /** @type {SVGSVGElement | null} */ (/** @type {unknown} */ (document.getElementById("meas"))),
});

/* kait baca-saja untuk uji golden (tests/e2e/studio-golden.spec.js) dan debug */
/** @type {any} */ (window).__iconStudio = Object.freeze({
  renderer,
  document: documentModel,
  store,
  SAMPLE_MANIFEST,
  directFillSvgFile,
  dedupeAttrs,
});

const personas = [
  ["composer", "Composer", "composer"],
  ["builder", "Builder", "builder"],
  ["tinjau", "Tinjau", "tinjau"],
  ["kombinasi", "Kombinasi", "kombinasi"],
];

const route = () => {
  const [name, id] = location.hash.replace(/^#\/?/, "").split("/");
  return {
    name: personas.some(([key]) => key === name) ? name : "composer",
    id,
  };
};

function icon(name, size = 16) {
  return `<i data-icon="${name}" data-size="${size}"></i>`;
}

function personaNav(active) {
  return personas
    .map(
      ([key, label, glyph]) =>
        `<a class="ic-persona" href="#/${key}" aria-current="${key === active ? "page" : "false"}">${icon(glyph)}${label}</a>`,
    )
    .join("");
}

function panel(title, body, tabs = [title]) {
  const tabMarkup = tabs
    .map(
      (tab, i) =>
        `<button class="ic-tab" role="tab" aria-selected="${i === 0}" aria-controls="panel-${title}-${i}" tabindex="${i === 0 ? 0 : -1}">${tab}</button>`,
    )
    .join("");
  return `<section class="ic-panel"><div class="ic-panel__head" role="tablist" aria-label="${title}">${tabMarkup}<button class="ic-panel__collapse" data-ic="collapse" aria-expanded="true" aria-controls="body-${title}" aria-label="Lipat panel">${icon("chevron-down", 13)}</button></div><div id="body-${title}" class="ic-panel__body"><div class="ic-tabpanel" role="tabpanel" id="panel-${title}-0">${body}</div></div></section>`;
}

function personaBody(active) {
  const copy = {
    composer: [
      "Composer · Set",
      "Pilih halaman untuk mengatur set ikon.",
      "Ikhtisar set",
    ],
    builder: [
      "Builder · Periksa pack",
      "Impor manifest untuk memeriksa dan menyiapkan ekspor.",
      "Belum ada manifest",
    ],
    tinjau: [
      "Tinjau · Lembar kontak",
      "Periksa hasil sebelum mengunduh paket Canva.",
      "Belum ada ikon untuk ditinjau",
    ],
    kombinasi: [
      "Kombinasi · Matriks",
      "Pilih objek dan pengubah dari pustaka.",
      "Pustaka ikon siap digunakan",
    ],
  }[active];
  return `<div class="ic-empty">${icon(active === "kombinasi" ? "combine" : "view-pages", 20)}<strong>${copy[2]}</strong><span>${copy[1]}</span><button class="ic-btn ic-btn--primary">${active === "builder" ? "Impor manifest" : "Tambah ikon"}</button></div>`;
}

function render() {
  const { name: active, id } = route();
  document.querySelector("#app").innerHTML =
    `<div class="ic-shell ic-app" data-persona="${active}">
    <header class="ic-topbar"><svg class="ic-logo" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="6" width="18" height="18" rx="5" fill="none" stroke="var(--ic-text-strong)" stroke-width="2.6"></rect><circle class="ic-logo__dot" cx="22" cy="8" r="6" stroke="var(--ic-bg-app)" stroke-width="2.4"></circle></svg><nav class="ic-persona-group" aria-label="Persona">${personaNav(active)}</nav><span class="ic-spacer"></span><span class="ic-topbar__info">Icon Studio</span><span class="ic-sep"></span><span class="ic-topbar__info ic-mono">${id ? `Dokumen ${id}` : "Dokumen baru"}</span><button class="ic-actionbtn">Ekspor Canva ${icon("chevron-down", 13)}</button><button class="ic-iconbtn ic-iconbtn--help" aria-label="Bantuan">${icon("help", 20)}</button></header>
    <div class="ic-context"><span>${active[0].toUpperCase() + active.slice(1)}</span><span class="ic-sep"></span><button class="ic-btn ic-btn--sm">Patokan set…</button><span class="ic-spacer"></span><button class="ic-iconbtn" aria-label="Pengaturan">${icon("settings")}</button></div>
    <aside class="ic-toolrail" aria-label="Alat" data-ic="single"><button class="ic-tool" aria-pressed="true" aria-label="Pilih">${icon("select", 20)}</button><button class="ic-tool" aria-pressed="false" aria-label="Geser">${icon("move", 20)}</button><span class="ic-toolrail__sep"></span><button class="ic-tool" aria-pressed="false" aria-label="Objek utama">${icon("add-main", 20)}</button><button class="ic-tool" aria-pressed="false" aria-label="Pengubah">${icon("add-mod", 20)}</button><button class="ic-tool" aria-pressed="false" aria-label="Kombinasi massal">${icon("combine", 20)}</button></aside>
    <main class="ic-workspace"><div class="ic-doctabs" role="tablist"><button class="ic-doctab" role="tab" aria-selected="true">Dokumen baru @ 100%</button></div><div class="ic-canvas"><div class="studio-empty">${personaBody(active)}</div></div></main>
    <aside class="ic-studio" aria-label="Studio">${panel("Gaya", `<div class="ic-engines" data-ic="single"><button class="ic-engine" aria-pressed="true"><span class="ic-engine__pv">${icon("view-single", 20)}</span>Klasik</button><button class="ic-engine" aria-pressed="false"><span class="ic-engine__pv">${icon("kombinasi", 20)}</span>Aksen</button><button class="ic-engine" aria-pressed="false"><span class="ic-engine__pv">${icon("grid", 20)}</span>Offset</button><button class="ic-engine" aria-pressed="false"><span class="ic-engine__pv">${icon("edit", 20)}</span>Hand-writing</button></div><p class="ic-meta">Offset tidak memakai pengubah. Pengubah tidak tersedia pada style ini.</p>`, ["Gaya", "Warna"])}${panel("Halaman", `<div class="ic-meta">${active === "builder" ? "Impor manifest untuk memulai." : "Belum ada ikon."}</div>`, ["Halaman", "Lapisan", "Pustaka", "Pool"])}${panel("Repetisi", `<div class="ic-stats"><div class="ic-stat" data-level="ok"><div class="ic-stat__n">0</div><div class="ic-stat__l">Rakitan dobel</div></div><div class="ic-stat"><div class="ic-stat__n">0</div><div class="ic-stat__l">Mirip</div></div></div>`, ["Repetisi", "Riwayat"])}</aside>
    <footer class="ic-statusbar"><span class="ic-field ic-mono">0 dari 0</span><span class="ic-sep"></span><span><b>Pilih</b> persona untuk mulai bekerja.</span></footer>
  </div>`;
  globalThis.ICONS_UI?.hydrateIcons();
  globalThis.ICUI?.initUI();
}

window.addEventListener("hashchange", render);
render();
