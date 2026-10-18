// @ts-check
/**
 * State app Icon Studio: dokumen terbuka, dokumen aktif, seleksi per dokumen, dan rute.
 * Disimpan ke `icon-studio-v1` lewat `state/store.js`. Seleksi dan rute tidak disimpan.
 * Pindah persona tidak menghapus seleksi atau state dokumen (DESIGN-HANDOFF bagian 2).
 */
import { PRESET, createManifestDocument, createSetDocument, importManifest, normItem } from "./state/document.js";
import { ensureSetFields } from "./state/set-ops.js";
import { loadState, saveState } from "./state/store.js";

export const PERSONAS = /** @type {const} */ (["composer", "builder", "tinjau", "kombinasi"]);

/**
 * @typedef {"composer" | "builder" | "tinjau" | "kombinasi"} Persona
 * @typedef {{persona: Persona, edit: string | null}} Route
 */

/**
 * Rute dari hash: `#/composer`, `#/composer/edit/<id>`, `#/builder`, `#/tinjau`, `#/kombinasi`.
 * @param {string} hash
 * @returns {Route}
 */
export function parseRoute(hash) {
  const [name, sub, id] = String(hash || "")
    .replace(/^#\/?/, "")
    .split("/")
    .map((part) => decodeURIComponent(part || ""));
  const persona = /** @type {Persona} */ (PERSONAS.includes(/** @type {any} */ (name)) ? name : "composer");
  return { persona, edit: persona === "composer" && sub === "edit" && id ? id : null };
}

/** @param {Route} route */
export const routeHash = (route) =>
  route.edit ? `#/composer/edit/${encodeURIComponent(route.edit)}` : `#/${route.persona}`;

/**
 * @param {{storage?: Storage, renderer: ReturnType<typeof import("./state/render.js").createRenderer>}} options
 */
export function createAppState(options) {
  const { renderer } = options;
  const loaded = loadState(options.storage);
  /** @type {any[]} */
  const documents = loaded.documents;
  let activeId = loaded.activeId;
  /** @type {Record<string, string | null>} */
  const selection = {};
  const listeners = new Set();

  /* set kosong selalu ada supaya Composer punya dokumen */
  if (!documents.some((d) => d.kind === "set")) {
    const doc = ensureSetFields(createSetDocument({ name: "Set baru" }));
    documents.unshift(doc);
    activeId = activeId || doc.id;
  }

  for (const doc of documents) if (doc.kind === "set") ensureSetFields(doc);

  /** Riwayat perubahan sesi per dokumen (panel Riwayat; bukan undo). */
  /** @type {Record<string, {label: string, at: number}[]>} */
  const history = {};

  /* ikon pustaka di dokumen tersimpan didaftarkan ulang ke registry */
  for (const doc of documents) {
    for (const it of doc.items) {
      if (doc.kind === "manifest") renderer.ensureManifestItem(it);
      else {
        if (renderer.LIB_RE.test(String(it.main))) renderer.lib.ensure(it.main, "main");
        if (renderer.LIB_RE.test(String(it.mod))) renderer.lib.ensure(it.mod, "mod");
      }
    }
  }

  const save = () => saveState({ schemaVersion: 1, documents, activeId }, options.storage);
  const notify = () => listeners.forEach((fn) => fn());

  /** @param {string | null} id */
  const byId = (id) => documents.find((d) => d.id === id) || null;

  /**
   * Dokumen yang dipakai persona. Composer dan Kombinasi bekerja pada set, Builder pada manifest,
   * Tinjau pada dokumen aktif apa pun.
   * @param {Persona} persona
   */
  function documentFor(persona) {
    const active = byId(activeId);
    if (persona === "tinjau") return active || documents[0] || null;
    const kind = persona === "builder" ? "manifest" : "set";
    if (active && active.kind === kind) return active;
    const list = documents.filter((d) => d.kind === kind);
    return list[list.length - 1] || null;
  }

  return {
    documents,
    selection,
    get activeId() {
      return activeId;
    },
    byId,
    documentFor,
    history,
    /**
     * Ubah dokumen lalu simpan dan render ulang. `label` dicatat di Riwayat sesi.
     * @param {string} docId
     * @param {(doc: any) => void} fn
     * @param {string} [label]
     */
    mutate(docId, fn, label) {
      const doc = byId(docId);
      if (!doc) return;
      fn(doc);
      if (label) (history[docId] = history[docId] || []).unshift({ label, at: Date.now() });
      save();
      notify();
    },
    /** @param {() => void} fn */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /**
     * @param {string} id
     * @param {{silent?: boolean}} [opts] silent: tanpa memberi tahu pendengar (dipakai saat render)
     */
    activate(id, opts = {}) {
      if (!byId(id) || activeId === id) return;
      activeId = id;
      save();
      if (!opts.silent) notify();
    },
    /**
     * @param {string} docId
     * @param {string | null} itemId
     */
    select(docId, itemId) {
      selection[docId] = itemId;
      notify();
    },
    /**
     * Impor manifest Builder. Pustaka Tabler/Hugeicons dimuat dulu bila dipakai.
     * @param {string} text
     * @returns {Promise<{fatal?: string, doc?: any}>}
     */
    async importManifest(text) {
      const imp = importManifest(text, renderer.lib);
      if ("fatal" in imp && imp.fatal) return { fatal: imp.fatal };
      if (imp.needTb) {
        await renderer.loadTabler();
        renderer.dropMissing("tb");
      }
      if (imp.needHg) {
        await renderer.loadHugeicons();
        renderer.dropMissing("hg");
      }
      imp.items.forEach(renderer.ensureManifestItem);
      const doc = createManifestDocument(/** @type {any} */ (imp));
      documents.push(doc);
      activeId = doc.id;
      selection[doc.id] = imp.items[0] ? imp.items[0].uid : null;
      save();
      notify();
      return { doc };
    },
    /** @param {string} id */
    close(id) {
      const i = documents.findIndex((d) => d.id === id);
      if (i < 0) return;
      documents.splice(i, 1);
      if (!documents.some((d) => d.kind === "set")) documents.unshift(ensureSetFields(createSetDocument({ name: "Set baru" })));
      if (activeId === id) activeId = documents[Math.max(0, i - 1)].id;
      delete selection[id];
      save();
      notify();
    },
    /**
     * Isi set kosong dengan set contoh Icon Composer (PRESET).
     * @param {string} docId
     */
    loadPreset(docId) {
      const doc = byId(docId);
      if (!doc || doc.kind !== "set" || doc.items.length) return;
      doc.items = PRESET.map((p) => normItem(p, renderer.lib, { customs: doc.customs }));
      if (doc.name === "Set baru") doc.name = "Set contoh";
      selection[doc.id] = doc.items[0].id;
      save();
      notify();
    },
    /**
     * Item contoh untuk pratinjau (kartu gaya), tidak masuk dokumen.
     * @param {any} o
     */
    sampleItem(o) {
      return normItem(o, renderer.lib, { uid: () => "contoh" });
    },
    /**
     * Muat Tabler/Hugeicons bila dokumen tersimpan memakainya, lalu daftarkan ulang ikonnya.
     * @returns {Promise<void>}
     */
    async warmLibraries() {
      const keys = documents.flatMap((d) => d.items.flatMap((it) => [String(it.main), String(it.mod)]));
      const jobs = [];
      if (keys.some((k) => k.startsWith("tb:"))) jobs.push(renderer.loadTabler().then(() => renderer.dropMissing("tb")));
      if (keys.some((k) => k.startsWith("hg:"))) jobs.push(renderer.loadHugeicons().then(() => renderer.dropMissing("hg")));
      if (!jobs.length) return;
      await Promise.all(jobs);
      for (const doc of documents)
        for (const it of doc.items) {
          if (renderer.LIB_RE.test(String(it.main))) renderer.lib.ensure(it.main, "main");
          if (it.mod !== "none" && renderer.LIB_RE.test(String(it.mod))) renderer.lib.ensure(it.mod, "mod");
        }
      notify();
    },
    save,
  };
}
