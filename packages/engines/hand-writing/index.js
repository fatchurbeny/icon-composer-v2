// @ts-check
/** @module engines/hand-writing */
import { hash, rng } from "@icon-studio/core";
import { concept } from "@icon-studio/icon-sources";

const EMPTY = (size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" width="${size}" height="${size}"></svg>`;
const ANCHORS = {
  TL: [5.5, 5.5],
  TC: [12, 4.5],
  TR: [18.5, 5.5],
  ML: [4.5, 12],
  MR: [19.5, 12],
  BL: [5.5, 18.5],
  BC: [12, 19.5],
  BR: [18.5, 18.5],
};
const esc = (value) => String(value).replaceAll('"', "&quot;");
const attrs = (a = {}) =>
  Object.entries(a)
    .filter(([key]) => key !== "d")
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join("");
const part = ([tag, a = {}], extra = "") =>
  `<${tag}${attrs(a)}${extra}${a.d ? ` d="${esc(a.d)}"` : ""}/>`;

function normStyle(style = {}) {
  const s = style.engine?.["hand-writing"] || style;
  return {
    ...style,
    family: "hand-writing",
    engine: {
      ...style.engine,
      "hand-writing": {
        acc: s.acc || "#FDBF57",
        ink: s.ink || "#2B1D2E",
        sw: Number.isFinite(+s.sw) ? +s.sw : 2.3,
        puff: Number.isFinite(+s.puff) ? +s.puff : 2,
        off: Number.isFinite(+s.off) ? +s.off : 1.25,
        gap: Number.isFinite(+s.gap) ? +s.gap : 9,
        rot: Number.isFinite(+s.rot) ? +s.rot : 5,
        ko: Number.isFinite(+s.ko) ? +s.ko : 1.25,
      },
    },
  };
}

function bakeDash(d, gap, phase) {
  const match =
    /^M\s*(-?[\d.]+)\s+(-?[\d.]+)\s+L\s*(-?[\d.]+)\s+(-?[\d.]+)$/i.exec(
      d || "",
    );
  if (!match) return [`<path d="${esc(d || "")}"/>`];
  const [, x1, y1, x2, y2] = match.map(Number);
  const dx = x2 - x1,
    dy = y2 - y1,
    length = Math.hypot(dx, dy) || 1,
    unit = Math.min(1.4, Math.max(0.5, length / 18));
  const visible = Math.max(0.2, 1 - gap / 100),
    out = [];
  for (
    let cursor = (((phase % 2) + 2) % 2) * unit;
    cursor < length;
    cursor += unit * 2
  ) {
    const start = Math.max(0, cursor),
      end = Math.min(length, cursor + unit * 2 * visible);
    if (end <= start) continue;
    out.push(
      `<path d="M${(x1 + (dx * start) / length).toFixed(3)} ${(y1 + (dy * start) / length).toFixed(3)} L${(x1 + (dx * end) / length).toFixed(3)} ${(y1 + (dy * end) / length).toFixed(3)}"/>`,
    );
  }
  return out.length ? out : [`<path d="${esc(d)}"/>`];
}

function compose(params = {}, style = {}, options = {}) {
  const parts = params.parts || params.node || [];
  if (!Array.isArray(parts) || !parts.length) return EMPTY(options.size);
  const S = normStyle({ engine: { "hand-writing": style } }).engine[
    "hand-writing"
  ];
  const seed =
      Number(params.seed || 1) +
      hash(`${params.main || ""}${params.mod || ""}`),
    random = rng(seed);
  const tilt = (params.var?.tilt ?? (random() < 0.5 ? -1 : 1)) * S.rot;
  const gapPhase = params.var?.gapPhase ?? Math.floor(random() * 4);
  const lines = parts
    .map((p) => {
      const a = p[1] || {},
        d = a.d || "",
        large =
          d.length > 18 ||
          ["circle", "rect", "ellipse", "polygon"].includes(p[0]);
      const baked =
        large && S.gap > 0 ? bakeDash(d, S.gap, gapPhase) : [part(p)];
      return baked
        .map((svg) =>
          svg.replace(
            /^<path /,
            `<path fill="none" stroke="${S.ink}" stroke-width="${S.sw}" stroke-linecap="round" stroke-linejoin="round" `,
          ),
        )
        .join("");
    })
    .join("");
  const blobMode = params.blob || "auto",
    closed = parts.filter(
      ([tag, a = {}]) =>
        ["circle", "rect", "ellipse", "polygon"].includes(tag) ||
        (tag === "path" && /[zZ]\s*$/.test(a.d || "")),
    );
  const blobs =
    blobMode === "none"
      ? ""
      : blobMode === "circle" || !closed.length
        ? `<circle cx="12" cy="12" r="${(8 + S.puff * 0.6).toFixed(3)}"/>`
        : closed.map((p) => part(p)).join("");
  const anchor = ANCHORS[params.slot || params.anchor || "BR"] || ANCHORS.BR,
    ms = Number(params.ms || 0.5),
    mainTransform = `translate(${(anchor[0] > 12 ? -1 : 1) * (1.2 * ms)} ${(anchor[1] > 12 ? -1 : 1) * (1.2 * ms)}) scale(${(0.84 + (1 - ms) * 0.08).toFixed(3)})`;
  const blob = blobs
    ? `<g transform="${mainTransform}" fill="${S.acc}" stroke="${S.acc}" stroke-width="${S.sw + 2 * S.puff}" stroke-linejoin="round">${blobs}</g>`
    : "";
  const size = options.size || 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" width="${size}" height="${size}"><g transform="rotate(${tilt.toFixed(3)} 12 12)">${blob}<g>${lines}</g></g></svg>`;
}

const adapt = (item, style = {}) => ({
  ...item,
  slot: item.slot || "BR",
  parts: item.parts || [],
  style: normStyle(style).engine["hand-writing"],
});
const axes = () => [
  { id: "tilt", values: [-1, -0.5, 0.5, 1] },
  { id: "gapPhase", values: [0, 1, 2, 3] },
  { id: "gapPick", values: ["A", "B", "C"] },
];
const signature = (item) =>
  `hand-writing|${concept(item?.main)}|${concept(item?.mod, "mod")}|${item?.slot || "BR"}`;
const flags = (item) =>
  item?.parts?.length ? [] : [["warn", "Objek belum termuat"]];

/** Migrasi payload gaya.json coret v1 ke bentuk kanonik hand-writing. */
export function migrateLegacy(payload = {}) {
  const source = payload.style || payload.S || {};
  const icons = Array.isArray(payload.icons) ? payload.icons : [];
  return {
    ...payload,
    family: "hand-writing",
    version: 2,
    style: {
      acc: source.acc || source.accent || "#FDBF57",
      ink: source.ink || "#2B1D2E",
      sw: Number.isFinite(+source.sw) ? +source.sw : 2.3,
      puff: Number.isFinite(+source.puff) ? +source.puff : 2,
      off: Number.isFinite(+source.off) ? +source.off : 1.25,
      gap: Number.isFinite(+source.gap) ? +source.gap : 9,
      rot: Number.isFinite(+source.rot) ? +source.rot : 5,
      ko: Number.isFinite(+source.ko) ? +source.ko : 1.25,
    },
    icons: icons.map((icon, index) => ({
      ...icon,
      slot: icon.slot || icon.anchor || "BR",
      engine: {
        ...icon.engine,
        "hand-writing": {
          ms: Number.isFinite(+icon.ms) ? +icon.ms : 0.5,
          blob: ["auto", "circle", "none"].includes(icon.blob)
            ? icon.blob
            : "auto",
          seed: Number.isFinite(+icon.seed) ? +icon.seed : index + 1,
        },
      },
    })),
  };
}

export const handWriting = {
  id: "hand-writing",
  version: "2.0.0",
  label: "Hand-writing",
  canvas: 24,
  supports: {
    mod: true,
    deco: false,
    builtinMains: false,
    perItemColor: false,
    maxColors: 3,
  },
  defaults: {
    acc: "#FDBF57",
    ink: "#2B1D2E",
    sw: 2.3,
    puff: 2,
    off: 1.25,
    gap: 9,
    rot: 5,
    ko: 1.25,
  },
  normStyle,
  adapt,
  compose,
  axes,
  signature,
  flags,
};
