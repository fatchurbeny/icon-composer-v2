// @ts-check
/**
 * State app Icon Studio: dokumen terbuka, dokumen aktif, seleksi per dokumen, dan rute.
 * Disimpan ke `icon-studio-v1` lewat `state/store.js`. Seleksi, rute, dan riwayat urungkan tidak disimpan.
 * Pindah persona tidak menghapus seleksi atau state dokumen (DESIGN-HANDOFF bagian 2).
 */
import { PRESET, createManifestDocument, createSetDocument, handWritingComposerSource, handWritingSetFromComposer, importManifest, normItem, offsetComposerSource, offsetSetFromComposer, stickerComposerSource, stickerSetFromComposer } from "./state/document.js";
import { createVocabulary, defaultExportOptions, validateManifest } from "./state/builder-ops.js";
import { ensureReviewFields } from "./state/review-ops.js";
import { ensureSetFields } from "./state/set-ops.js";
import { migrateFromLegacy } from "./state/migrations/001-from-legacy.js";
import { MIGRATION_ID as OFFSET_MIGRATION, migrateFromOffset } from "./state/migrations/002-from-offset.js";
import { MIGRATION_ID as HAND_WRITING_MIGRATION, migrateFromHandWriting } from "./state/migrations/003-from-hand-writing.js";
import { MIGRATION_ID as STICKER_MIGRATION, migrateFromSticker } from "./state/migrations/004-from-sticker.js";
import { PRESET_LIMIT, hasState, loadState, normColorPresets, normSwatchSource, saveState } from "./state/store.js";
import { UNDO_LIMIT, createUndo } from "./state/undo.js";

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
  /* migrasi sekali dari composer gaya lama (offset-composer 1.0.1, coret-composer 1.0.0 untuk gaya hand-writing,
     sticker-composer), berurutan menurut id, juga bila icon-studio-v1 sudah ada; dokumen ditambahkan */
  const migrations = [...loaded.migrations];
  /** @type {string[]} */
  const migrationWarnings = [];
  for (const [id, run] of /** @type {[string, typeof migrateFromOffset][]} */ ([
    [OFFSET_MIGRATION, migrateFromOffset],
    [HAND_WRITING_MIGRATION, migrateFromHandWriting],
    [STICKER_MIGRATION, migrateFromSticker],
  ])) {
    if (migrations.includes(id)) continue;
    let res = null;
    try {
      res = run(options.storage || globalThis.localStorage, { lib: renderer.lib });
    } catch {
      res = null;
    }
    migrations.push(id);
    if (res) {
      loaded.documents.push(...res.documents);
      loaded.activeId = loaded.activeId || res.documents[0].id;
      migratedFrom = [...migratedFrom, ...res.sources];
      migrationWarnings.push(...res.warnings);
    }
  }
  /** @type {any[]} */
  const documents = loaded.documents;
  let activeId = loaded.activeId;
  /* Preset saya dan sumber swatch: berlaku untuk semua set, di luar dokumen dan di luar urungkan */
  let colorPresets = normColorPresets(loaded.colorPresets);
  let swatchSource = normSwatchSource(loaded.swatchSource);
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

  /** Riwayat perubahan sesi per dokumen (panel Riwayat). */
  /** @type {Record<string, {label: string, at: number}[]>} */
  const history = {};
  /** @param {string} docId @param {string} label */
  const log = (docId, label) => (history[docId] = history[docId] || []).unshift({ label, at: Date.now() });

  /** Urungkan dan ulangi per dokumen, maks 10 langkah, hanya di memori. */
  const undo = createUndo({ limit: UNDO_LIMIT });

  /**
   * Daftarkan ulang ikon pustaka di item dokumen ke registry (Tabler/Hugeicons dan lainnya).
   * @param {any} doc
   */
  const ensureLibraries = (doc) => {
    for (const it of doc.items) {
      if (doc.kind === "manifest") renderer.ensureManifestItem(it);
      else {
        if (renderer.LIB_RE.test(String(it.main))) renderer.lib.ensure(it.main, "main");
        if (renderer.LIB_RE.test(String(it.mod))) renderer.lib.ensure(it.mod, "mod");
      }
    }
  };

  /* ikon pustaka di dokumen tersimpan didaftarkan ulang ke registry */
  for (const doc of documents) ensureLibraries(doc);

  const save = () => saveState({ schemaVersion: 1, documents, activeId, migrations, colorPresets, swatchSource }, options.storage);
  /* dokumen Builder hasil migrasi divalidasi seperti boot TIB */
  for (const doc of documents) if (doc.kind === "manifest" && migratedFrom.length) doc.issues = validateManifest(doc, vocab);
  if (migratedFrom.length) save();
  /* titik awal urungkan: isi dokumen saat app dibuka */
  for (const doc of documents) undo.sync(doc.id, doc);
  const notify = () => listeners.forEach((fn) => fn());

  /** @param {string | null} id */
  const byId = (id) => documents.find((d) => d.id === id) || null;

  /**
   * Setelah urungkan atau ulangi: daftarkan ulang pustaka, validasi ulang manifest, dan pertahankan
   * seleksi. Bila item terpilih hilang, seleksi pindah ke item pertama.
   * @param {any} doc
   */
  function afterRestore(doc) {
    ensureLibraries(doc);
    if (doc.kind === "manifest") doc.issues = validateManifest(doc, vocab);
    const idOf = (/** @type {any} */ it) => (doc.kind === "manifest" ? it.uid : it.id);
    if (!doc.items.some((/** @type {any} */ it) => idOf(it) === selection[doc.id])) selection[doc.id] = doc.items[0] ? idOf(doc.items[0]) : null;
  }

  /**
   * Urungkan atau ulangi satu langkah pada dokumen.
   * @param {string} docId
   * @param {"undo" | "redo"} dir
   * @returns {string | null} label langkah, null bila tidak ada
   */
  function step(docId, dir) {
    const doc = byId(docId);
    if (!doc) return null;
    const label = dir === "undo" ? undo.undo(docId, doc) : undo.redo(docId, doc);
    if (label == null) return null;
    afterRestore(doc);
    log(docId, `${dir === "undo" ? "Urungkan" : "Ulangi"}: ${label}`);
    save();
    notify();
    return label;
  }

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
     * Ubah dokumen lalu simpan dan render ulang. Dengan `label`, perubahan dicatat di Riwayat sesi dan
     * menjadi satu langkah urungkan (termasuk perubahan langsung sejak pencatatan terakhir, mis. seret).
     * Tanpa label, isi sekarang menjadi titik awal urungkan tanpa membuat langkah.
     * @param {string} docId
     * @param {(doc: any) => void} fn
     * @param {string} [label]
     */
    mutate(docId, fn, label) {
      const doc = byId(docId);
      if (!doc) return;
      fn(doc);
      if (label) {
        log(docId, label);
        undo.commit(docId, doc, label);
      } else undo.sync(docId, doc);
      save();
      notify();
    },
    /** Preset saya (hex `#RRGGBB`, urutan sesuai tampilan). */
    get colorPresets() {
      return colorPresets;
    },
    /** Sumber swatch di panel warna: palet bawaan atau Preset saya. */
    get swatchSource() {
      return swatchSource;
    },
    /**
     * Ganti Preset saya lalu simpan. Tidak masuk riwayat urungkan dokumen.
     * @param {unknown[]} list
     * @returns {boolean} false bila daftar dipotong karena melebihi batas
     */
    setColorPresets(list) {
      colorPresets = normColorPresets(list);
      save();
      notify();
      return Array.isArray(list) && list.length <= PRESET_LIMIT;
    },
    /** @param {unknown} source "bawaan" atau "preset" */
    setSwatchSource(source) {
      swatchSource = normSwatchSource(source);
      save();
      notify();
    },
    /** Urungkan satu langkah. @param {string} docId @returns {string | null} label langkah */
    undo: (docId) => step(docId, "undo"),
    /** Ulangi satu langkah. @param {string} docId @returns {string | null} label langkah */
    redo: (docId) => step(docId, "redo"),
    /** @param {string} docId */
    canUndo: (docId) => undo.canUndo(docId),
    /** @param {string} docId */
    canRedo: (docId) => undo.canRedo(docId),
    /** Label langkah urungkan dan ulangi berikutnya. @param {string} docId */
    undoLabels: (docId) => undo.peek(docId),
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
      undo.sync(doc.id, doc);
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
      undo.sync(doc.id, doc);
      activeId = doc.id;
      selection[doc.id] = doc.items[0] ? doc.items[0].id : null;
      save();
      notify();
      return { doc, warnings: res.warnings };
    },
    /**
     * Impor set coret-composer 1.0.0 (`gaya.json` dengan `family: "coret"` dari ZIP atau isi `coret-composer-v1`)
     * menjadi dokumen set bergaya Hand-writing.
     * @param {string} text
     * @returns {Promise<{fatal?: string, doc?: any, warnings?: string[]} | null>} null bila teks bukan data coret-composer
     */
    async importHandWritingSet(text) {
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return null;
      }
      const src = handWritingComposerSource(data);
      if (!src) return null;
      const keys = src.payload.icons.flatMap((/** @type {any} */ o) => [String(o && o.main), String(o && o.mod)]);
      if (keys.some((k) => k.startsWith("tb:"))) {
        await renderer.loadTabler();
        renderer.dropMissing("tb");
      }
      if (keys.some((k) => k.startsWith("hg:"))) {
        await renderer.loadHugeicons();
        renderer.dropMissing("hg");
      }
      const res = handWritingSetFromComposer(data, renderer.lib);
      if (!res || "fatal" in res) return res;
      const doc = ensureReviewFields(ensureSetFields(res.doc));
      documents.push(doc);
      undo.sync(doc.id, doc);
      activeId = doc.id;
      selection[doc.id] = doc.items[0] ? doc.items[0].id : null;
      save();
      notify();
      return { doc, warnings: res.warnings };
    },
    /**
     * Impor set sticker-composer (`gaya.json` dari ZIP atau isi `sticker-composer-v1`) menjadi dokumen set.
     * @param {string} text
     * @returns {Promise<{fatal?: string, doc?: any, warnings?: string[]} | null>} null bila teks bukan data sticker-composer
     */
    async importStickerSet(text) {
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return null;
      }
      const src = stickerComposerSource(data);
      if (!src) return null;
      if (src.icons.some((/** @type {any} */ o) => o && [o.main && o.main.k, o.mod && o.mod.k].some((k) => String(k).startsWith("tb:")))) {
        await renderer.loadTabler();
        renderer.dropMissing("tb");
      }
      const res = stickerSetFromComposer(data, renderer.lib);
      if (!res || "fatal" in res) return res;
      const doc = ensureReviewFields(ensureSetFields(res.doc));
      documents.push(doc);
      undo.sync(doc.id, doc);
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
      undo.reset(id);
      if (!documents.some((d) => d.kind === "set")) {
        const doc = ensureReviewFields(ensureSetFields(createSetDocument({ name: "Set baru" })));
        documents.unshift(doc);
        undo.sync(doc.id, doc);
      }
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
      /* set contoh menjadi titik awal baru: tidak bisa diurungkan kembali ke set kosong */
      undo.reset(doc.id);
      undo.sync(doc.id, doc);
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
