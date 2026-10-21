// @ts-check
/**
 * Titik masuk Icon Studio: memuat kit UI, membangun renderer mesin dan state app, lalu kerangka.
 */
import "@icon-studio/ui/tokens.css";
import "@icon-studio/ui/components.css";
import "@icon-studio/ui/components.js";
import "@icon-studio/ui/icons.js";
import "./style.css";
import "@icon-studio/export/vendor/icon-outline";
import { dedupeAttrs } from "@icon-studio/core";
import { directFillSvgFile } from "@icon-studio/export";
import { createAppState } from "./app-state.js";
import { createShell } from "./shell.js";
import * as builderOps from "./state/builder-ops.js";
import * as documentModel from "./state/document.js";
import * as reviewOps from "./state/review-ops.js";
import { SAMPLE_MANIFEST } from "./state/data/sample-manifest.js";
import { createRenderer } from "./state/render.js";
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
  builder: builderOps,
  review: reviewOps,
  store,
  SAMPLE_MANIFEST,
  directFillSvgFile,
  dedupeAttrs,
});

const app = createAppState({ renderer });
const shell = createShell({ root: /** @type {HTMLElement} */ (document.getElementById("app")), app, renderer });
shell.render();
const LEGACY_LABEL = /** @type {Record<string, string>} */ ({
  "icon-composer-aksen-v1": "set Icon Composer",
  "icon-composer-v2": "set Icon Composer",
  "icon-composer-meta-v1": "metadata Canva",
  "template-icon-builder-aksen-v1": "dokumen Builder",
});
if (app.migratedFrom.length) shell.toast(`Data lama diimpor: ${app.migratedFrom.map((k) => LEGACY_LABEL[k] || k).join(", ")}`);
void app.warmLibraries();
