// @ts-check
/** @module core */

export const r2 = (value) => Math.round(value * 100) / 100;
export const r3 = (value) => Math.round(value * 1000) / 1000;

export function hash(value) {
  let result = 0x811c9dc5;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 0x01000193);
  }
  return result >>> 0;
}

export function rng(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const escapeAttribute = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

export function partStr(part, extra = "") {
  const overridden = new Set(
    [...extra.matchAll(/([\w:-]+)=/g)].map((match) => match[1]),
  );
  const attributes = Object.entries(part.attrs)
    .filter(([key]) => key !== "key" && !overridden.has(key))
    .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
    .join(" ");
  return `<${part.tag} ${attributes}${extra}/>`;
}

export function dedupeAttrs(svg) {
  return svg.replace(
    /<([\w:-]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g,
    (_match, tag, attributes, slash) => {
      const seen = new Map();
      for (const attribute of attributes.matchAll(/([\w:-]+)="([^"]*)"/g)) {
        seen.set(attribute[1], attribute[2]);
      }
      return `<${tag}${[...seen]
        .map(([key, value]) => ` ${key}="${value}"`)
        .join("")}${slash ? "/" : ""}>`;
    },
  );
}

export function bboxUnion(list) {
  return list.reduce((union, box) => {
    if (!union) return { ...box };
    const x = Math.min(union.x, box.x);
    const y = Math.min(union.y, box.y);
    return {
      x,
      y,
      w: Math.max(union.x + union.w, box.x + box.w) - x,
      h: Math.max(union.y + union.h, box.y + box.h) - y,
    };
  }, null);
}
