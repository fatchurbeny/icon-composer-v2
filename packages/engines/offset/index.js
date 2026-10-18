// @ts-check
/** @module engines/offset */
const EMPTY = (size = 48) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"></svg>`;
const KEEP = [
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "width",
  "height",
  "points",
  "x1",
  "y1",
  "x2",
  "y2",
];
const partString = ([tag, attrs = {}]) =>
  `<${tag}${KEEP.filter((key) => attrs[key] != null)
    .map((key) => ` ${key}="${String(attrs[key]).replaceAll('"', "&quot;")}"`)
    .join("")}/>`;
const closed = ([tag, attrs = {}]) =>
  attrs.d !== "M0 0h24v24H0z" &&
  (["circle", "rect", "ellipse", "polygon"].includes(tag) ||
    (tag === "path" && /[zZ]\s*$/.test(attrs.d || "")));
const normStyle = (style = {}) => {
  const e = style.engine?.offset || style;
  return {
    ...style,
    family: "offset",
    engine: {
      ...style.engine,
      offset: {
        mode: ["solid", "white", "line"].includes(e.mode) ? e.mode : "solid",
        acc: e.acc || "#B8405A",
        ink: e.ink || "#1A1A1A",
        dx: Number.isFinite(+e.dx) ? +e.dx : 4,
        dy: Number.isFinite(+e.dy) ? +e.dy : 4,
        sw: Number.isFinite(+e.sw) ? +e.sw : 2.6,
        size: 100.8,
        deco: e.deco || {},
      },
    },
  };
};
const adapt = (item, style = {}) => ({
  ...item,
  parts: item.parts || [],
  style: normStyle(style).engine.offset,
});
function compose(params = {}, style = {}, options = {}) {
  const raw = params.parts || params.node || [];
  if (!Array.isArray(raw) || !raw.length) return EMPTY(options.size);
  const S = normStyle({ engine: { offset: style } }).engine.offset;
  const parts = raw
    .map((p) => (Array.isArray(p) ? p : [p.tag, p.attrs]))
    .filter((p) => p[0]);
  const closedParts = parts.filter(closed),
    body = closedParts[0];
  const scale = S.size / 24,
    origin = (120 - S.size) / 2;
  const T = (x, y) =>
    `translate(${(origin + x).toFixed(3)} ${(origin + y).toFixed(3)}) scale(${scale.toFixed(4)})`;
  const all = parts.map(partString).join(""),
    bodies = closedParts.map(partString).join(""),
    details = closedParts
      .filter((p) => p !== body)
      .map(partString)
      .join("");
  let out = "";
  if (S.mode === "solid" && bodies)
    out += `<g transform="${T(S.dx, S.dy)}" fill="${S.acc}">${bodies}</g>`;
  if (S.mode === "white" && body)
    out += `<g transform="${T(S.dx, S.dy)}" fill="${S.acc}">${partString(body)}</g><g transform="${T(0, 0)}" fill="#FFFFFF">${partString(body)}</g>${details ? `<g transform="${T(S.dx * 0.6, S.dy * 0.6)}" fill="${S.acc}">${details}</g>` : ""}`;
  if (S.mode === "line" && body)
    out += `<g transform="${T(S.dx, S.dy)}" fill="${S.acc}">${partString(body)}</g>`;
  out += `<g transform="${T(0, 0)}" fill="none" stroke="${S.ink}" stroke-width="${(S.sw / scale).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${all}</g>`;
  if (options.deco !== false && S.deco.ground) {
    const y = origin + S.size + 2.4;
    out += `<path fill="none" stroke="${S.ink}" stroke-width="${S.sw}" stroke-linecap="round" d="M${origin - 2} ${y}H${origin + S.size + 2}"/>`;
  }
  const size = options.size || 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}">${out}</svg>`;
}
const axes = (item) => [
  {
    id: "tickPos",
    values: ["TR", "TL"],
    blockedBy: () => !item?.engine?.offset?.deco?.tick,
  },
  {
    id: "decoSet",
    values: [
      "tick",
      "tick+ground",
      "ground",
      "cloud+ground",
      "grass+ground",
      "tick+cloud",
    ],
  },
];
const signature = (item) =>
  `offset|${String(item?.main || "").replace(/^(lu|tb|hg|cu):/, "")}|-|-`;
const flags = (item) =>
  [
    !item?.parts?.some(closed)
      ? ["warn", "Tanpa bidang tertutup: isi warna offset tidak muncul"]
      : null,
    item?.mod && item.mod !== "none"
      ? ["info", "Pengubah tidak tersedia pada style ini"]
      : null,
  ].filter(Boolean);
export const offset = {
  id: "offset",
  version: "1.1.0",
  label: "Offset",
  canvas: 120,
  supports: {
    mod: false,
    deco: true,
    builtinMains: false,
    perItemColor: false,
    maxColors: 3,
  },
  defaults: {
    mode: "solid",
    acc: "#B8405A",
    ink: "#1A1A1A",
    dx: 4,
    dy: 4,
    sw: 2.6,
    size: 100.8,
  },
  normStyle,
  adapt,
  compose,
  axes,
  signature,
  flags,
};
