// @ts-check
/**
 * Satu pintu dari Icon Studio ke mesin. Membangun registry pustaka sekali per app dan `ctx`
 * classic/accent sesuai jenis dokumen (ADR-017):
 * - set Composer memakai varian IC 1.5.1 (bintang dekorasi terisi, tanpa aturan Solid·garis 1.4.5);
 * - dokumen Builder memakai varian TIB 1.6.0 (`solidV145`).
 * Urutan pemanggilan dan nilai `ctx` meniru kedua app lama supaya keluaran identik (golden).
 */
import { get } from "@icon-studio/engines";
import { createClassicData, decoMarkupClassic, solidLineDiagnostic as solidLineDiagnosticClassic } from "@icon-studio/engines/classic";
import { modPreviewAccent as modPreviewAccentEngine } from "@icon-studio/engines/accent";
import { boxesOffset } from "@icon-studio/engines/offset";
import { boxesSticker, stickerShapes } from "@icon-studio/engines/sticker";
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
import { fillShapeOf } from "@icon-studio/icon-sources/fill-shapes";
import { MODES, OFFSET_MODE, STICKER_MODE, manifestOffsetStyle, manifestStickerItem, manifestStickerStyle, useStyle } from "./document.js";
import { layerBoxes } from "./edit-ops.js";

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
   * Node mentah ikon pustaka untuk mesin yang membaca bagian ikon langsung (offset, sticker).
   * Objek bawaan dan ikon yang belum termuat menghasilkan null.
   * @param {string} key
   */
  function nodeOf(key) {
    if (!LIB_RE.test(String(key))) return null;
    const src = /** @type {any} */ (SOURCES)[key.slice(0, 2)],
      idx = src && src.index();
    return (idx && idx.get(key.slice(3))) || null;
  }
  /** `ctx` mesin yang membaca node pustaka: offset memakai `nodeOf`, sticker juga bentuk isi (`fillShapeOf`). */
  const offsetCtx = { nodeOf, fillShapeOf };

  /**
   * Kotak lapisan ikon set dalam satuan 48 (wilayah klik editor dan cek tepi viewBox).
   * @param {any} it
   * @param {any} style
   */
  function boxesOf(it, style) {
    if (style.family === "offset") return boxesOffset(it, style, offsetCtx);
    if (style.family === "sticker") return boxesSticker(it);
    return layerBoxes(it, style, data);
  }

  /**
   * Flag khusus mesin untuk satu ikon set (offset: objek bawaan, tanpa bidang tertutup, pengubah;
   * sticker: objek bawaan, tanpa bentuk isi, slot dipetakan).
   * @param {any} it
   * @param {any} style
   * @returns {[string, string][]}
   */
  function flagsOf(it, style) {
    const engine = /** @type {any} */ (get(style.family));
    return engine.flags ? engine.flags(it, style, offsetCtx) : [];
  }

  /**
   * Render ikon set Composer (compose IC): keluarga dari `style.family`.
   * @param {any} it
   * @param {any} style
   * @param {{size?: number | string, mode?: "mask" | "white", idp?: string}} [opt]
   * @param {any[]} [customs]
   */
  function renderSetItem(it, style, opt, customs = []) {
    if (style.family === "offset" || style.family === "sticker") {
      const engine = get(style.family);
      return engine.compose(engine.adapt(it, style), style, { ...(opt || {}), ctx: offsetCtx });
    }
    if (style.family === "accent")
      return get("accent").compose(it, style, { ...(opt || {}), ctx: accentCtx(style, "set", customs) });
    return get("classic").compose(it, style, { ...(opt || {}), ctx: classicCtx(style, "set", customs) });
  }

  /**
   * Render ikon Builder untuk satu mode (render TIB). Gaya dokumen tidak diubah.
   * Mode O memakai mesin offset: pengubah tidak dirender, dekorasi dari `offsetDeco` (bawaan kilat + tanah).
   * Mode S memakai mesin sticker: isi objek = aksen manifest (`manifestStickerItem`), slot dipetakan ke 4 sudut.
   * @param {any} it
   * @param {string} mode X | A | B | C | O
   * @param {any} style
   * @param {{size?: number | string, idp?: string}} [opt]
   */
  function renderManifestItem(it, mode, style, opt) {
    opt = opt || {};
    if (!MAINS[it.main])
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${opt.size || 48}" height="${opt.size || 48}"></svg>`;
    if (mode === OFFSET_MODE) {
      const engine = get("offset");
      return engine.compose(engine.adapt(it, style), manifestOffsetStyle(style), { size: opt.size || 48, idp: opt.idp, ctx: offsetCtx });
    }
    if (mode === STICKER_MODE) {
      const engine = get("sticker");
      return engine.compose(engine.adapt(manifestStickerItem(it, style), style), manifestStickerStyle(style), { size: opt.size || 48, idp: opt.idp, ctx: offsetCtx });
    }
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

  /**
   * Diagnostik Solid·garis 1.4.5 untuk flag Builder (solidLineDiagnostic TIB).
   * @param {any} it
   * @param {any} style
   */
  function solidLineDiagnostic(it, style) {
    return solidLineDiagnosticClassic(it, /** @type {any} */ (classicCtx(style, "manifest")));
  }

  return {
    lib,
    solidLineDiagnostic,
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
    nodeOf,
    fillShapeOf,
    /** Markup outline dan bentuk isi sticker satu kunci (uji paritas legacy). @param {string} key */
    stickerShapes: (key) => stickerShapes(key, offsetCtx),
    boxesOf,
    flagsOf,
    modPreviewAccent,
    ensureManifestItem,
    dropMissing,
    loadTabler: icons.loadTabler,
    loadHugeicons: icons.loadHugeicons,
  };
}
