// @ts-check
/**
 * Pemilih warna di panel Composer, Composer · Edit, dan Builder (komponen kit `.ic-colorpicker`).
 * - Baris swatch: palet bawaan atau Preset saya (`app.swatchSource`), plus swatch "Warna lain…" yang membuka pemilih.
 * - Isi popover: Preset saya (global, di luar urungkan), palet kurasi, dan harmoni dari warna aktif.
 * - Perubahan warna dokumen selalu lewat mutate berlabel, jadi bisa diurungkan.
 */
import { STICKER_MODE, setStickerColor } from "../state/document.js";
import { applyStyleColors } from "../state/set-ops.js";
import { HARMONIES, harmony, normHex } from "../state/color-harmony.js";
import { CURATED_PALETTES } from "../state/data/palettes.js";
import { PRESET_LIMIT } from "../state/store.js";
import { aria, esc } from "../ui.js";

/** Swatch preset yang tampil di baris panel; sisanya ada di popover. */
const ROW_PRESETS = 8;

/**
 * @typedef {{
 *   name: string,
 *   label: string,
 *   value: string | null,
 *   options: (string | null)[],
 *   fallback: string,
 *   follow?: boolean,
 *   round?: boolean,
 * }} ColorRowSpec
 * name: nama kontrol (`data-name`), value: warna sekarang (null = ikuti warna set),
 * options: palet bawaan, fallback: warna set untuk swatch "ikuti", follow: tampilkan pilihan "ikuti warna set".
 */

/**
 * Daftar swatch yang tampil: Preset saya bila dipilih dan tidak kosong, selain itu palet bawaan.
 * @param {{swatchSource: string, colorPresets: string[]}} app
 * @param {(string | null)[]} options palet bawaan
 * @param {boolean} follow
 */
export function swatchOptions(app, options, follow) {
  if (app.swatchSource !== "preset" || !app.colorPresets.length) return options;
  return [...(follow ? [null] : []), ...app.colorPresets.slice(0, ROW_PRESETS)];
}

/**
 * Baris warna: label, swatch pilihan tunggal, dan pemicu pemilih warna.
 * @param {import("./common.js").Ctx} ctx
 * @param {ColorRowSpec} spec
 */
export function colorRow(ctx, spec) {
  const follow = !!spec.follow;
  const current = spec.value ? normHex(spec.value) : null;
  const options = swatchOptions(ctx.app, spec.options, follow);
  const round = spec.round ? " ic-swatch--round" : "";
  const custom = !!current && !options.includes(current);
  const swatches = options
    .map(
      (c) =>
        `<button type="button" class="ic-swatch${round}" data-value="${c || ""}" style="background: ${c || spec.fallback}" ${aria("aria-pressed", (current || null) === c)} aria-label="${c ? `${esc(spec.label)} ${c}` : `${esc(spec.label)} ikuti warna set`}"></button>`,
    )
    .join("");
  const trigger = `<button type="button" class="ic-swatch ic-swatch--custom${round}" data-ic="colorpicker" data-name="${spec.name}" data-value="${current || ""}" data-fallback="${esc(spec.fallback)}" data-label="${esc(spec.label)}" data-follow="${follow}"${custom ? ` style="background: ${current}"` : ""} ${aria("aria-pressed", custom)} aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(spec.label)}: warna lain${custom ? ` ${current}` : ""}" title="Warna lain…"></button>`;
  return `<div class="ic-formrow"><span class="ic-label">${esc(spec.label)}</span><div class="ic-swatches" data-ic="single" role="group" aria-label="${esc(spec.label)}" data-name="${spec.name}">${swatches}</div>${trigger}</div>`;
}

/** @param {string[]} colors @param {string} label */
const chips = (colors, label) =>
  `<span class="ic-colorpicker__chips" aria-hidden="true">${colors.map((c) => `<span class="ic-colorpicker__chip" style="background: ${c}" title="${esc(label)} ${c}"></span>`).join("")}</span>`;

/**
 * Isi popover pemilih warna (dipanggil `components.js` lewat `ICUI.colorpickerExtra`).
 * @param {{colorPresets: string[], swatchSource: string}} app
 * @param {{name: string, value: string}} info value: warna aktif di pemilih ("" = ikuti warna set)
 * @param {{stickerPack?: boolean}} [hint] stickerPack: dokumen aktif dokumen Builder dengan pratinjau Sticker
 */
export function pickerExtra(app, info, hint = {}) {
  const value = normHex(info.value);
  const presets = app.colorPresets;
  const at = value ? presets.indexOf(value) : -1;
  const btn = (/** @type {string} */ text, /** @type {string} */ action, /** @type {string} */ attrs = "", disabled = false) =>
    `<button type="button" class="ic-btn ic-btn--sm" data-action="${action}"${attrs}${disabled ? " disabled" : ""}>${text}</button>`;
  const presetBody = [
    presets.length
      ? `<div class="ic-swatches" role="group" aria-label="Preset saya">${presets.map((c) => `<button type="button" class="ic-swatch" data-color="${c}" style="background: ${c}" ${aria("aria-pressed", c === value)} aria-label="Preset ${c}"></button>`).join("")}</div>`
      : `<span class="ic-meta">Belum ada preset. Pilih warna lalu tambahkan.</span>`,
    `<div class="ic-colorpicker__actions">${btn("Tambah warna aktif", "cp-preset-add", "", !value || at >= 0 || presets.length >= PRESET_LIMIT)}${btn("Hapus", "cp-preset-remove", ' aria-label="Hapus preset terpilih"', at < 0)}${btn("Geser kiri", "cp-preset-move", ' data-dir="-1" aria-label="Geser preset terpilih ke kiri"', at <= 0)}${btn("Geser kanan", "cp-preset-move", ' data-dir="1" aria-label="Geser preset terpilih ke kanan"', at < 0 || at >= presets.length - 1)}</div>`,
    `<div class="ic-formrow"><span class="ic-label">Swatch panel</span><div class="ic-seg" role="group" aria-label="Sumber swatch panel">${[
      ["bawaan", "Bawaan"],
      ["preset", "Preset saya"],
    ]
      .map(([v, t]) => `<button type="button" data-action="cp-source" data-value="${v}" ${aria("aria-pressed", app.swatchSource === v)}>${t}</button>`)
      .join("")}</div></div>`,
    `<span class="ic-meta">${presets.length}/${PRESET_LIMIT} warna · berlaku untuk semua set</span>`,
  ].join("");
  const paletteBody = CURATED_PALETTES.map(
    (p) =>
      `<button type="button" class="ic-colorpicker__row" data-action="cp-palette" data-id="${p.id}" aria-label="Terapkan palet ${esc(p.name)}: tinta ${p.ink}, aksen ${p.accent}, isi ${p.fill}">${chips([p.ink, p.accent, p.fill, p.bg], p.name)}${esc(p.name)}</button>`,
  ).join("") +
    (hint.stickerPack
      ? `<span class="ic-meta">Tinta dan aksen untuk seluruh pack. Isi objek sticker ikut aksen, isi palet jadi isi pengubah. Kolom terakhir hanya contoh latar.</span>`
      : `<span class="ic-meta">Tinta, aksen, dan isi objek utama untuk seluruh set. Kolom terakhir hanya contoh latar.</span>`);
  const harmonyBody = value
    ? HARMONIES.map(([kind, label]) => {
        const cols = harmony(value, kind);
        return `<div class="ic-colorpicker__group"><div class="ic-formrow"><span class="ic-label">${label}</span><span class="ic-spacer"></span>${btn("Terapkan", "cp-harmony", ` data-kind="${kind}" aria-label="Terapkan harmoni ${label.toLowerCase()} ke set"`)}</div><div class="ic-swatches" role="group" aria-label="Harmoni ${label.toLowerCase()}">${cols.map((c) => `<button type="button" class="ic-swatch" data-color="${c}" style="background: ${c}" ${aria("aria-pressed", c === value)} aria-label="${label} ${c}"></button>`).join("")}</div></div>`;
      }).join("") +
      (hint.stickerPack
        ? `<span class="ic-meta">Terapkan: warna pertama jadi aksen dan isi objek sticker, warna kedua jadi isi pengubah.</span>`
        : `<span class="ic-meta">Terapkan: warna pertama jadi aksen, warna kedua jadi isi objek utama.</span>`)
    : `<span class="ic-meta">Pilih satu warna dulu untuk melihat harmoninya.</span>`;
  const tabs = [
    ["preset", "Preset saya", presetBody],
    ["palet", "Palet", paletteBody],
    ["harmoni", "Harmoni", harmonyBody],
  ];
  return `<div data-ic="tabs" class="ic-colorpicker__group"><div class="ic-colorpicker__tabs" role="tablist" aria-label="Sumber warna">${tabs
    .map(([id, label], i) => `<button type="button" class="ic-tab" role="tab" id="cp-${id}-tab" data-value="${id}" ${aria("aria-selected", i === 0)} aria-controls="cp-${id}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`)
    .join("")}</div>${tabs
    .map(([id, , body], i) => `<div class="ic-tabpanel ic-colorpicker__group" role="tabpanel" id="cp-${id}" aria-labelledby="cp-${id}-tab"${i === 0 ? "" : " hidden"}>${body}</div>`)
    .join("")}</div>`;
}

/**
 * Terapkan palet ke dokumen aktif lewat satu langkah urungkan. Dokumen Builder hanya memakai tinta dan aksen.
 * @param {import("./common.js").Ctx} ctx
 * @param {{ink?: string, accent?: string, fill?: string}} colors
 * @param {string} label
 * @param {(message: string) => void} toast
 */
function applyColors(ctx, colors, label, toast) {
  if (!ctx.doc) return;
  const manifest = ctx.doc.kind === "manifest";
  /* Builder pratinjau Sticker: isi objek ikut aksen (pilihan pack dilepas), isi palet atau warna harmoni kedua jadi isi pengubah */
  const stickerPack = manifest && ctx.doc.pv === STICKER_MODE;
  let fill = false;
  ctx.app.mutate(ctx.doc.id, (doc) => {
    fill = applyStyleColors(doc.style, manifest ? { ink: colors.ink, accent: colors.accent } : colors).fill;
    if (stickerPack) {
      if (colors.accent) setStickerColor(doc.style, "main", null);
      if (colors.fill) {
        setStickerColor(doc.style, "mod", colors.fill);
        fill = true;
      }
    }
  }, label);
  toast(colors.fill && !fill ? `${label} diterapkan. Isi tidak dipakai pada gaya ini.` : `${label} diterapkan.`);
}

/** @param {HTMLElement} el */
const currentOf = (el) => normHex(el.dataset.current);

/**
 * Aksi tombol di dalam popover (diteruskan shell dari event `ic-colorpicker-action`).
 * @type {Record<string, (ctx: import("./common.js").Ctx, el: HTMLElement, tools: {toast: (m: string) => void}) => void>}
 */
export const colorActions = {
  "cp-preset-add"(ctx, el, { toast }) {
    const hex = currentOf(el),
      list = ctx.app.colorPresets;
    if (!hex) return;
    if (list.includes(hex)) return toast(`${hex} sudah ada di Preset saya.`);
    if (list.length >= PRESET_LIMIT) return toast(`Preset saya penuh (maks ${PRESET_LIMIT}). Hapus satu dulu.`);
    ctx.app.setColorPresets([...list, hex]);
    toast(`${hex} ditambahkan ke Preset saya.`);
  },
  "cp-preset-remove"(ctx, el, { toast }) {
    const hex = currentOf(el);
    if (!hex || !ctx.app.colorPresets.includes(hex)) return;
    ctx.app.setColorPresets(ctx.app.colorPresets.filter((c) => c !== hex));
    toast(`${hex} dihapus dari Preset saya.`);
  },
  "cp-preset-move"(ctx, el) {
    const hex = currentOf(el),
      list = [...ctx.app.colorPresets];
    const i = hex ? list.indexOf(hex) : -1,
      j = i + (Number(el.dataset.dir) < 0 ? -1 : 1);
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    ctx.app.setColorPresets(list);
  },
  "cp-source"(ctx, el, { toast }) {
    const source = el.dataset.value === "preset" ? "preset" : "bawaan";
    ctx.app.setSwatchSource(source);
    if (source === "preset" && !ctx.app.colorPresets.length) toast("Preset saya masih kosong, jadi panel tetap memakai palet bawaan.");
  },
  "cp-palette"(ctx, el, { toast }) {
    const p = CURATED_PALETTES.find((x) => x.id === el.dataset.id);
    if (p) applyColors(ctx, p, `Palet ${p.name}`, toast);
  },
  "cp-harmony"(ctx, el, { toast }) {
    const hex = currentOf(el),
      kind = /** @type {any} */ (el.dataset.kind);
    const entry = HARMONIES.find(([k]) => k === kind);
    if (!hex || !entry) return;
    const [accent, fill] = harmony(hex, kind);
    applyColors(ctx, { accent, fill }, `Harmoni ${entry[1].toLowerCase()}`, toast);
  },
};
