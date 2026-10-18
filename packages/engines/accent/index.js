// @ts-check
/** @module engines/accent */
import { concept } from "@icon-studio/icon-sources";
import { composeAccent } from "./compose.js";

export const accent = {
  id: "accent",
  version: "1.0.0",
  label: "Aksen bagian",
  canvas: 48,
  supports: {
    mod: true,
    deco: true,
    builtinMains: true,
    perItemColor: false,
    maxColors: 5,
  },
  defaults: {
    sw: 3.5,
    gap: 1.25,
    cap: "round",
    join: "round",
    accent: "#F05A5A",
    scale: { main: 88, mod: 80, deco: 100 },
  },
  normStyle(style = {}) {
    return {
      ...this.defaults,
      ...style,
      scale: { ...this.defaults.scale, ...(style.scale || {}) },
    };
  },
  adapt(item) {
    return item;
  },
  compose(params, _style, options = {}) {
    return options.ctx
      ? composeAccent(params, options.ctx, options)
      : emptySvg(options.size);
  },
  axes(item) {
    return [
      {
        id: "under",
        values: ["none", "full", "offset", "half"],
        blockedBy: () => item.under != null,
      },
      {
        id: "mstyle",
        values: ["line", "fill"],
        blockedBy: () => item.mstyle != null,
      },
    ];
  },
  signature(item) {
    return `accent|${concept(item.main)}|${concept(item.mod, "mod")}|${item.slot}`;
  },
};

const emptySvg = (size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"></svg>`;
export { composeAccent, decoAccent, modAccent, modPreviewAccent } from "./compose.js";
