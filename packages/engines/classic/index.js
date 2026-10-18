// @ts-check
/** @module engines/classic */
import { concept } from "@icon-studio/icon-sources";
import { composeClassic } from "./compose.js";

export const classic = {
  id: "classic",
  version: "1.4.5",
  label: "Klasik",
  canvas: 48,
  supports: {
    mod: true,
    deco: true,
    builtinMains: true,
    perItemColor: false,
    maxColors: 5,
  },
  defaults: {
    sw: 2,
    gap: 2,
    cap: "butt",
    join: "miter",
    accent: "#C3DC1E",
    scale: { main: 84, mod: 100, deco: 100 },
    pref: "A",
    fx: { mode: "none" },
  },
  normStyle(style = {}) {
    return {
      ...this.defaults,
      ...style,
      scale: { ...this.defaults.scale, ...(style.scale || {}) },
      fx: { ...this.defaults.fx, ...(style.fx || {}) },
    };
  },
  adapt(item) {
    return item;
  },
  compose(params, _style, options = {}) {
    return options.ctx
      ? composeClassic(params, options.ctx, options)
      : emptySvg(options.size);
  },
  axes() {
    return [];
  },
  signature(item) {
    return `classic|${concept(item.main)}|${concept(item.mod, "mod")}|${item.slot}`;
  },
};

const emptySvg = (size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"></svg>`;
export { composeClassic, decoMarkupClassic, geomClassic, modeOfClassic } from "./compose.js";
