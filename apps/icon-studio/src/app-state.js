// @ts-check
/**
 * State app Icon Studio: dokumen terbuka, dokumen aktif, seleksi per dokumen, dan rute.
 * Disimpan ke `icon-studio-v1` lewat `state/store.js`. Seleksi dan rute tidak disimpan.
 * Pindah persona tidak menghapus seleksi atau state dokumen (DESIGN-HANDOFF bagian 2).
 */
import { PRESET, createManifestDocument, createSetDocument, importManifest, normItem, offsetComposerSource, offsetSetFromComposer } from "./state/document.js";
import { createVocabulary, defaultExportOptions, validateManifest } from "./state/builder-ops.js";
import { ensureReviewFields } from "./state/review-ops.js";
import { ensureSetFields } from "./state/set-ops.js";
import { migrateFromLegacy } from "./state/migrations/001-from-legacy.js";
import { MIGRATION_ID as OFFSET_MIGRATION, migrateFromOffset } from "./state/migrations/002-from-offset.js";
import { hasState, loadState, saveState } from "./state/store.js";

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
  /* migrasi sekali dari IC 1.5.1 dan TIB 1.6.0 bila icon-studio-v1 belum ada */
  /** @type {string[]} */
  let migratedFrom = [];
  let loaded = loadState(options.storage);
  if (!hasState(options.storage)) {
    let legacy = null;
    try {
      legacy = migrateFromLegacy(options.storage || globalThis.localStorage, { lib: renderer.lib });
    } catch {
      legacy = null;
    }
    if (legacy) {
      loaded = legacy.state;
      migratedFrom = legacy.sources;
    }
  }
  /* migrasi sekali dari offset-composer 1.0.1, juga bila icon-studio-v1 sudah ada; dokumen ditambahkan */
  const migrations = [...loaded.migrations];
  /** @type {string[]} */
  const migrationWarnings = [];
  if (!migrations.includes(OFFSET_MIGRATION)) {
    let offset = null;
    try {
      offset = migrateFromOffset(options.storage || globalThis.localStorage, { lib: renderer.lib });
    } catch {
      offset = null;
    }
    migrations.push(OFFSET_MIGRATION);
    if (offset) {
      loaded.documents.push(...offset.documents);
      loaded.activeId = loaded.activeId || offset.documents[0].id;
      migratedFrom = [...migratedFrom, ...offset.sources];
      migrationWarnings.push(...offset.warnings);
    }
  }
  /** @type {any[]} */
  const documents = loaded.documents;
  let activeId = loaded.activeId;
  /** @type {Record<string, string | null>} */
  const selection = {};
  const listeners = new Set();

  /* set kosong selalu ada supaya Composer punya dokumen */
  if (!documents.some((d) => d.kind === "set")) {
    const doc = ensureReviewFields(ensureSetFields(createSetDocument({ name: "Set baru" })));
    documents.unshift(doc);
    activeId = activeId || doc.id;
  }

  /** Kosakata pustaka untuk validasi dan flag Builder. */
  const vocab = createVocabulary(renderer);
  /**
   * Lengkapi field dokumen Builder (pilihan ekspor, tampilan, hasil validasi).
   * @param {any} doc
   */
  const ensureManifestFields = (doc) => {
    doc.export = { ...defaultExportOptions(doc), ...(doc.export || {}) };
    doc.export.modes = { ...defaultExportOptions(doc).modes, ...(doc.export.modes || {}) };
    doc.view = { filter: "all", group: true, step: "check", ...(doc.view || {}) };
    doc.issues = Array.isArray(doc.issues) ? doc.issues : [];
    return ensureReviewFields(doc);
  };
  for (const doc of documents) {
    if (doc.kind === "set") ensureSetFields(doc);
    else ensureManifestFields(doc);
    ensureReviewFields(doc);
  }

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

  const save = () => saveState({ schemaVersion: 1, documents, activeId, migrations }, options.storage);
  /* dokumen Builder hasil migrasi divalidasi seperti boot TIB */
  for (const doc of documents) if (doc.kind === "manifest" && migratedFrom.length) doc.issues = validateManifest(doc, vocab);
  if (migratedFrom.length) save();
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
    vocab,
    /** Kunci lama yang dimigrasikan saat app ini dibuka (kosong bila tidak ada migrasi). */
    migratedFrom,
    /** Peringatan dari migrasi saat app ini dibuka (mis. gaya offset diseragamkan). */
    migrationWarnings,
    /** Validasi ulang dokumen Builder setelah objek atau pengubah diganti. @param {any} doc */
    revalidate(doc) {
      doc.issues = validateManifest(doc, vocab);
    },
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
     * @param {{sample?: boolean}} [opts]
     * @returns {Promise<{fatal?: string, doc?: any}>}
     */
    async importManifest(text, opts = {}) {
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
      const doc = ensureManifestFields(createManifestDocument(/** @type {any} */ (imp)));
      doc.isSample = !!opts.sample;
      /* validasi seperti runImport TIB: id dobel diberi akhiran, nama tak dikenal diberi saran */
      doc.issues = validateManifest(doc, vocab);
      documents.push(doc);
      activeId = doc.id;
      selection[doc.id] = imp.items[0] ? imp.items[0].uid : null;
      save();
      notify();
      return { doc };
    },
    /**
     * Impor set offset-composer 1.0.1 (`gaya.json` dari ZIP atau isi `offset-composer-v1`) menjadi dokumen set.
     * @param {string} text
     * @returns {Promise<{fatal?: string, doc?: any, warnings?: string[]} | null>} null bila teks bukan data offset-composer
     */
    async importOffsetSet(text) {
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return null;
      }
      const icons = offsetComposerSource(data)?.icons;
      if (!icons) return null;
      if (icons.some((/** @type {any} */ o) => String(o && o.key).startsWith("tb:"))) {
        await renderer.loadTabler();
        renderer.dropMissing("tb");
      }
      const res = offsetSetFromComposer(data, renderer.lib);
      if (!res || "fatal" in res) return res;
      const doc = ensureReviewFields(ensureSetFields(res.doc));
      documents.push(doc);
      activeId = doc.id;
      selection[doc.id] = doc.items[0] ? doc.items[0].id : null;
      save();
      notify();
      return { doc, warnings: res.warnings };
    },
    /** @param {string} id */
    close(id) {
      const i = documents.findIndex((d) => d.id === id);
      if (i < 0) return;
      documents.splice(i, 1);
      if (!documents.some((d) => d.kind === "set")) documents.unshift(ensureReviewFields(ensureSetFields(createSetDocument({ name: "Set baru" }))));
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
      for (const doc of documents) {
        for (const it of doc.items) {
          if (renderer.LIB_RE.test(String(it.main))) renderer.lib.ensure(it.main, "main");
          if (it.mod !== "none" && renderer.LIB_RE.test(String(it.mod))) renderer.lib.ensure(it.mod, "mod");
        }
        /* validasi ulang setelah pustaka termuat, seperti boot TIB */
        if (doc.kind === "manifest") doc.issues = validateManifest(doc, vocab);
      }
      notify();
    },
    save,
  };
}
