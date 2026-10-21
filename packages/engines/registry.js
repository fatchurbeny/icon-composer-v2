// @ts-check
/** @module engines/registry */
const engines = new Map();

export function register(engine) {
  if (!engine?.id || typeof engine.compose !== "function") {
    throw new TypeError("Mesin harus memiliki id dan compose().");
  }
  engines.set(engine.id, Object.freeze(engine));
  return engine;
}

export function get(id) {
  const engine = engines.get(migrateFamily(id));
  if (!engine) throw new Error(`Mesin tidak dikenal: ${id}`);
  return engine;
}

export function list() {
  return [...engines.values()];
}

export function migrateFamily(id) {
  if (id === "coret") return "hand-writing";
  if (id === "X" || id == null) return "accent";
  if (id === "A" || id === "B") return "classic";
  return id;
}

export function normStyle(style = {}) {
  const family = migrateFamily(style.family);
  const engine = get(family);
  return { ...style, ...engine.normStyle(style), family };
}
