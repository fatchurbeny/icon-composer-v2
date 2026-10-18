// @ts-check
/**
 * Satu pintu dari Icon Studio ke mesin. Membangun registry pustaka sekali per app dan `ctx`
 * classic/accent sesuai jenis dokumen (ADR-017):
 * - set Composer memakai varian IC 1.5.1 (bintang dekorasi terisi, tanpa aturan Solid·garis 1.4.5);
 * - dokumen Builder memakai varian TIB 1.6.0 (`solidV145`).
 * Urutan pemanggilan dan nilai `ctx` meniru kedua app lama supaya keluaran identik (golden).
 */
import { get } from "@icon-studio/engines";
import { createClassicData, decoMarkupClassic } from "@icon-studio/engines/classic";
import { modPreviewAccent as modPreviewAccentEngine } from "@icon-studio/engines/accent";
import {
  ROLES,
  createLibraryShapes,
  mainInfoOf,
  modShapeOf,
  rolesOf as rolesOfShared,
  setMeasureHost,
} from "@icon-studio/engines/shared";
import { createIconSources } from "@icon-studio/icon-sources";
import { CUSTOM_ICONS } from "@icon-studio/icon-sources/custom";
import { MODES, useStyle } from "./document.js";

/**
 * @param {{getLucide: () => any, measureHost?: SVGSVGElement | (() => SVGSVGElement | null)}} options
 */
export function createRenderer(options) {
  const data = createClassicData({ starDecos: true });
  const { MAINS, MODS, PREFS, DECOS } = data;
  const icons = createIconSources({ getLucide: options.getLucide, custom: CUSTOM_ICONS });
  const { SOURCES, LIB_RE } = icons;
  const shapes = createLibraryShapes({ MAINS, MODS, SOURCES, LIB_RE });
  if (options.measureHost) setMeasureHost(options.measureHost);

  /** Registry yang dipakai normItem dan importManifest. */
  const lib = { ...data, LIB_RE, ensure: shapes.ensure };

  let kid = 0;
  const nextId = () => "k" + ++kid;

  const accCache = new Map();
  /** @param {string} key */
  function mainInfo(key) {
    const M = MAINS[key],
      c = accCache.get("m|" + key);
    if (c && c.M === M) return c;
    const info = mainInfoOf(M, key, shapes.analyze, (/** @type {string} */ k) => LIB_RE.test(k));
    accCache.set("m|" + key, info);
    return info;
  }
  /** @param {string} key */
  function modShape(key) {
    const M = MODS[key],
      c = accCache.get("d|" + key);
    if (c && c.M === M) return c;
    const res = modShapeOf(M, key, shapes.analyze);
    accCache.set("d|" + key, res);
    return res;
  }
  /** @param {string} key @param {number} n */
  const customRoles = (key, n) => icons.customRoles(key, n, ROLES);
  /** @param {any} it @param {any} info */
  const rolesOf = (it, info) => rolesOfShared(it, info, customRoles);

  /**
   * @param {any} style
   * @param {"set" | "manifest"} kind
   * @param {any[]} [customs]
   */
  function classicCtx(style, kind, customs = []) {
    const base = { style, MAINS, MODS, PREFS, DECOS, customs, nextId };
    return kind === "manifest"
      ? { ...base, decoStarFill: false, solidV145: true, infoOf: mainInfo }
      : { ...base, decoStarFill: true };
  }
  /**
   * @param {any} style
   * @param {"set" | "manifest"} kind
   * @param {any[]} [customs]
   */
  function accentCtx(style, kind, customs = []) {
    return {
      style,
      MODS,
      DECOS,
      nextId,
      shapeOf: modShape,
      infoOf: mainInfo,
      rolesOf,
      decoMarkup: (/** @type {any} */ it) => decoMarkupClassic(it, classicCtx(style, kind, customs)),
    };
  }

  /**
   * Render ikon set Composer (compose IC): keluarga dari `style.family`.
   * @param {any} it
   * @param {any} style
   * @param {{size?: number | string, mode?: "mask" | "white", idp?: string}} [opt]
   * @param {any[]} [customs]
   */
  function renderSetItem(it, style, opt, customs = []) {
    if (style.family === "accent")
      return get("accent").compose(it, style, { ...(opt || {}), ctx: accentCtx(style, "set", customs) });
    return get("classic").compose(it, style, { ...(opt || {}), ctx: classicCtx(style, "set", customs) });
  }

  /**
   * Render ikon Builder untuk satu mode (render TIB). Gaya dokumen tidak diubah.
   * @param {any} it
   * @param {string} mode X | A | B | C
   * @param {any} style
   * @param {{size?: number | string, idp?: string}} [opt]
   */
  function renderManifestItem(it, mode, style, opt) {
    opt = opt || {};
    if (!MAINS[it.main])
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${opt.size || 48}" height="${opt.size || 48}"></svg>`;
    const s = useStyle({ ...style }, mode);
    if (mode === "X")
      return get("accent").compose(
        { ...it, vis: { main: true, mod: true, deco: true }, deco: it.deco || { type: "none" } },
        s,
        { size: opt.size || 48, idp: opt.idp, ctx: accentCtx(s, "manifest") },
      );
    return get("classic").compose(
      { ...it, pref: MODES.includes(mode) ? mode : "A", deco: { type: "none" } },
      s,
      { size: opt.size || 48, idp: opt.idp, ctx: classicCtx(s, "manifest") },
    );
  }

  /**
   * Pratinjau pengubah gaya aksen (panel Bentuk).
   * @param {string} key
   * @param {string} mstyle
   * @param {any} style
   */
  function modPreviewAccent(key, mstyle, style) {
    return modPreviewAccentEngine(key, mstyle, accentCtx(style, "set"));
  }

  /**
   * Daftarkan ikon pustaka item Builder (ensureItem TIB).
   * @param {any} it
   */
  function ensureManifestItem(it) {
    if (LIB_RE.test(it.main)) shapes.ensure(it.main, "main");
    if (it.mod !== "none" && LIB_RE.test(it.mod)) shapes.ensure(it.mod, "mod");
  }

  /**
   * Setelah pustaka termuat: buang placeholder "missing" milik prefiks itu supaya bisa didaftarkan ulang.
   * @param {"tb" | "hg"} prefix
   */
  function dropMissing(prefix) {
    for (const reg of [MAINS, MODS])
      for (const k of Object.keys(reg)) if (k.startsWith(prefix + ":") && reg[k].missing) delete reg[k];
  }

  return {
    lib,
    data,
    icons,
    SOURCES,
    LIB_RE,
    shapes,
    mainInfo,
    modShape,
    rolesOf,
    renderSetItem,
    renderManifestItem,
    modPreviewAccent,
    ensureManifestItem,
    dropMissing,
    loadTabler: icons.loadTabler,
    loadHugeicons: icons.loadHugeicons,
  };
}
