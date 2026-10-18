// @ts-check
/** @module icon-sources */

export const MAIN_ALIAS = {
  face: "mood-smile",
  doc: "file",
  clock: "clock",
  bell: "bell",
  cart: "shopping-cart",
  box: "box",
  truck: "truck",
  door: "door",
  heart: "heart",
  ticket: "ticket",
  laptop: "laptop",
  chat: "message",
  home: "home",
  pot: "cooking-pot",
  book: "book",
  pin: "map-pin",
  user: "user",
  calendar: "calendar",
  phone: "phone",
  store: "store",
};

export const MOD_ALIAS = {
  bubble: "message",
  card: "credit-card",
  doc: "file",
  lock: "lock",
  mail: "mail",
  plus: "plus",
  check: "check",
  cross: "x",
  parcel: "package",
  pinm: "map-pin",
  pencil: "pencil",
  cone: "cone",
  clockm: "clock",
  star: "star",
  heartm: "heart",
  bulb: "bulb",
};

export const MOD_SYN = {
  pencil: ["edit", "pencil", "pen"],
  x: ["x", "off", "cancel"],
  check: ["check", "checked", "ok"],
  plus: ["plus", "add"],
  minus: ["minus"],
  "credit-card": ["credit-card", "card"],
  message: ["message", "message-circle", "chat"],
  clock: ["clock", "time", "timer"],
  search: ["search"],
  heart: ["heart", "love"],
  "map-pin": ["pin", "map-pin", "location"],
  settings: ["settings", "cog", "gear"],
  "share-2": ["share"],
  "message-circle": ["message", "chat"],
};

export function variantsOf(name, kind) {
  const base = name.replace(/-\d+$/, "");
  const variants = new Set([name, base]);
  if (kind === "mod") {
    const simple = base
      .split("-")
      .filter((word) => !["circle", "square", "badge"].includes(word))
      .join("-");
    variants.add(simple);
    for (const synonym of MOD_SYN[base] || MOD_SYN[simple] || []) {
      variants.add(synonym);
    }
  }
  return [...variants].filter(Boolean);
}

export function concept(key, kind = "main") {
  const name = String(key || "").replace(/^(lu|tb|hg|cu):/, "");
  const alias = (kind === "mod" ? MOD_ALIAS : MAIN_ALIAS)[name] || name;
  const variants = variantsOf(alias, kind);
  return variants.at(-1) || alias;
}

export {
  SOURCE_URLS,
  createIconSources,
  hgAttrs,
  kebab,
  libNameOf,
  luLabel,
} from "./library.js";
