// @ts-check
/**
 * Pembantu markup Icon Studio. Semua markup memakai kelas `.ic-*` dari `packages/ui`,
 * state lewat ARIA, dan perilaku lewat `data-ic` (docs/design/UI-RULES.md).
 * Tidak ada kelas, warna, atau ikon baru di sini.
 */

/** @param {unknown} v */
export const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Ikon UI dari `packages/ui/icons.js`.
 * @param {string} name
 * @param {13 | 16 | 20} [size]
 */
export const icon = (name, size = 16) => /** @type {any} */ (globalThis).ICONS_UI.uiIcon(name, size);

/**
 * Atribut boolean ARIA.
 * @param {string} name
 * @param {boolean} on
 */
export const aria = (name, on) => `${name}="${on ? "true" : "false"}"`;

/**
 * @typedef {{id: string, label: string, body: string, flush?: boolean}} Tab
 * @typedef {{id: string, label: string, tabs: Tab[], grow?: boolean, foot?: string, selected?: string}} PanelSpec
 */

/**
 * Panel studio bertab yang bisa dilipat (pola `ui-kit.html` bagian "Panel bertab").
 * @param {PanelSpec} spec
 */
export function panel(spec) {
  const selected = spec.selected || spec.tabs[0].id;
  const tabs = spec.tabs
    .map(
      (t) =>
        `<button type="button" class="ic-tab" role="tab" id="${spec.id}-${t.id}-tab" data-value="${t.id}" ${aria("aria-selected", t.id === selected)} aria-controls="${spec.id}-${t.id}" tabindex="${t.id === selected ? 0 : -1}">${esc(t.label)}</button>`,
    )
    .join("");
  const bodies = spec.tabs
    .map(
      (t) =>
        `<div class="ic-tabpanel ic-panel__body${t.flush ? " ic-panel__body--flush" : ""}" role="tabpanel" id="${spec.id}-${t.id}" aria-labelledby="${spec.id}-${t.id}-tab"${t.id === selected ? "" : " hidden"}>${t.body}</div>`,
    )
    .join("");
  return `<section class="ic-panel${spec.grow ? " ic-panel--grow" : ""}" data-ic="tabs" data-panel="${spec.id}">
  <div class="ic-panel__head" role="tablist" aria-label="${esc(spec.label)}">${tabs}<button type="button" class="ic-panel__collapse" data-ic="collapse" aria-expanded="true" aria-controls="${spec.id}-body" aria-label="Lipat panel ${esc(spec.label)}">${icon("chevron-down", 13)}</button></div>
  <div class="studio-panel-body" id="${spec.id}-body">${bodies}</div>${spec.foot ? `<div class="ic-panel__foot">${spec.foot}</div>` : ""}
</section>`;
}

/**
 * Segmented pilihan tunggal.
 * @param {string} label nama grup untuk pembaca layar
 * @param {[string, string][]} options [nilai, teks]
 * @param {string} value
 * @param {{inline?: boolean, name?: string}} [opts]
 */
export function seg(label, options, value, opts = {}) {
  return `<div class="ic-seg${opts.inline ? " ic-seg--inline" : ""}" data-ic="single" role="group" aria-label="${esc(label)}"${opts.name ? ` data-name="${opts.name}"` : ""}>${options
    .map(([v, t]) => `<button type="button" data-value="${esc(v)}" ${aria("aria-pressed", v === value)}>${esc(t)}</button>`)
    .join("")}</div>`;
}

/**
 * Dropdown `.ic-select`.
 * @param {string} label
 * @param {[string, string][]} options
 * @param {string} value
 * @param {{width?: number, name?: string}} [opts]
 */
export function select(label, options, value, opts = {}) {
  const current = options.find(([v]) => v === value) || options[0];
  return `<div class="ic-select" data-ic="select"${opts.name ? ` data-name="${opts.name}"` : ""}${opts.width ? ` style="width: ${opts.width}px"` : ""}><button type="button" class="ic-select__trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(label)}"><span data-label>${esc(current[1])}</span></button><ul class="ic-menu" role="listbox" aria-label="${esc(label)}" hidden>${options
    .map(([v, t]) => `<li class="ic-menu__item" role="option" data-value="${esc(v)}" ${aria("aria-selected", v === current[0])}>${esc(t)}</li>`)
    .join("")}</ul></div>`;
}

/**
 * Checkbox `.ic-check`.
 * @param {string} label
 * @param {boolean} checked
 * @param {{name?: string, disabled?: boolean}} [opts]
 */
export const check = (label, checked, opts = {}) =>
  `<label class="ic-check"><input type="checkbox"${checked ? " checked" : ""}${opts.disabled ? " disabled" : ""}${opts.name ? ` data-name="${opts.name}"` : ""}>${esc(label)}</label>`;

/**
 * Angka + stepper `.ic-number`.
 * @param {string} label
 * @param {number | string} value
 * @param {{min?: number, max?: number, step?: number, name?: string}} [opts]
 */
export const number = (label, value, opts = {}) =>
  `<div class="ic-number" data-ic="number"${opts.name ? ` data-name="${opts.name}"` : ""}><input type="text" inputmode="decimal" value="${esc(value)}" aria-label="${esc(label)}"${opts.min != null ? ` min="${opts.min}"` : ""}${opts.max != null ? ` max="${opts.max}"` : ""}${opts.step != null ? ` step="${opts.step}"` : ""}><button type="button" data-step="-1" aria-label="Kurangi ${esc(label)}">−</button><button type="button" data-step="1" aria-label="Tambah ${esc(label)}">+</button></div>`;

/**
 * Tombol `.ic-btn`.
 * @param {string} text
 * @param {{kind?: "primary", size?: "sm" | "lg", block?: boolean, action?: string, disabled?: boolean, label?: string}} [opts]
 */
export const button = (text, opts = {}) =>
  `<button type="button" class="ic-btn${opts.kind ? ` ic-btn--${opts.kind}` : ""}${opts.size ? ` ic-btn--${opts.size}` : ""}${opts.block ? " ic-btn--block" : ""}"${opts.action ? ` data-action="${opts.action}"` : ""}${opts.disabled ? " disabled" : ""}${opts.label ? ` aria-label="${esc(opts.label)}"` : ""}>${text}</button>`;

/**
 * Tombol ikon `.ic-iconbtn`.
 * @param {string} name ikon
 * @param {string} label aria-label wajib
 * @param {{action?: string, disabled?: boolean, pressed?: boolean, size?: 13 | 16 | 20, extra?: string}} [opts]
 */
export const iconButton = (name, label, opts = {}) =>
  `<button type="button" class="ic-iconbtn${opts.extra ? ` ${opts.extra}` : ""}" aria-label="${esc(label)}"${opts.pressed != null ? ` ${aria("aria-pressed", opts.pressed)}` : ""}${opts.action ? ` data-action="${opts.action}"` : ""}${opts.disabled ? " disabled" : ""}>${icon(name, opts.size || 16)}</button>`;

/**
 * Keadaan kosong `.ic-empty`.
 * @param {string} title
 * @param {string} [body]
 * @param {string} [actions] markup tombol
 */
export const empty = (title, body = "", actions = "") =>
  `<div class="ic-empty"><strong>${esc(title)}</strong>${body ? `<span>${esc(body)}</span>` : ""}${actions}</div>`;

/**
 * Peringatan `.ic-alert`.
 * @param {"ok" | "warn" | "err" | "info"} level
 * @param {string} text
 * @param {string} [meta]
 */
export const alert = (level, text, meta = "") =>
  `<div class="ic-alert" data-level="${level}"><span class="ic-dot" data-level="${level}"></span>${esc(text)}${meta ? `<span class="ic-alert__meta">${esc(meta)}</span>` : ""}</div>`;
