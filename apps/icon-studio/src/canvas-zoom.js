// @ts-check
/**
 * Zoom dan geser kanvas ala editor Affinity untuk semua persona.
 * - Ctrl/⌘ + roda atau pinch trackpad: zoom di titik kursor.
 * - Roda biasa: gulir; Shift + roda: gulir mendatar (bawaan browser).
 * - Spasi + seret, tool "Geser tampilan", atau tombol tengah: geser kanvas.
 * - Tool "Perbesar": klik untuk zoom in, Alt + klik untuk zoom out.
 * - ⌘/Ctrl + = atau +: zoom in, ⌘/Ctrl + -: zoom out, ⌘/Ctrl + 0: sesuaikan layar, ⌘/Ctrl + 1: 100%.
 * Zoom memakai CSS `zoom` pada `.studio-zoom`, sehingga tata letak, scrollbar, dan koordinat pointer
 * (getBoundingClientRect) tetap konsisten untuk seret lapisan di Composer · Edit.
 */

export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 8;
/** Tangga zoom untuk tombol dan pintasan (seperti Affinity). */
export const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.67, 1, 1.5, 2, 3, 4, 6, 8];

/** @param {number} z */
export const clampZoom = (z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 1000) / 1000));

/**
 * Zoom berikutnya di tangga zoom.
 * @param {number} z
 * @param {1 | -1} dir
 */
export function stepZoom(z, dir) {
  if (dir > 0) return ZOOM_STEPS.find((s) => s > z + 0.001) ?? ZOOM_MAX;
  return [...ZOOM_STEPS].reverse().find((s) => s < z - 0.001) ?? ZOOM_MIN;
}

/**
 * Posisi gulir baru supaya titik di bawah kursor tetap di tempat setelah zoom.
 * @param {number} scroll posisi gulir sekarang
 * @param {number} cursor jarak kursor dari tepi area gulir (px)
 * @param {number} pad padding area gulir sebelum isi (px, tidak ikut zoom)
 * @param {number} z0 zoom lama
 * @param {number} z1 zoom baru
 */
export function anchorScroll(scroll, cursor, pad, z0, z1) {
  const content = (scroll + cursor - pad) / z0;
  return Math.max(0, content * z1 + pad - cursor);
}

/** @param {number} z */
export const zoomLabel = (z) => `${Math.round(z * 100)}%`;

/**
 * @param {{root: HTMLElement, keyOf: () => string, onChange?: (z: number) => void}} options
 */
export function createCanvasZoom(options) {
  /** zoom per tampilan (dokumen + persona) */
  const zooms = new Map();
  let tool = "select";
  let spaceDown = false;
  let hover = false;
  let suppressClick = false;
  let keysBound = false;

  const canvasEl = () => /** @type {HTMLElement | null} */ (options.root.querySelector(".ic-canvas"));
  const layerEl = () => /** @type {HTMLElement | null} */ (options.root.querySelector(".studio-zoom"));
  const get = () => zooms.get(options.keyOf()) || 1;
  /** @type {ResizeObserver | null} */
  let resizer = null;

  /**
   * Lapisan isi diberi ukuran tetap seluas area kanvas (tanpa zoom), supaya zoom memperbesar isi
   * seperti dokumen, bukan menyusun ulang lebarnya. Saat diperbesar, isi meluber dan bisa digulir.
   */
  function sizeLayer() {
    const canvas = canvasEl(),
      layer = layerEl();
    if (!canvas || !layer) return;
    const cs = getComputedStyle(canvas);
    const w = canvas.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const h = canvas.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    layer.style.width = `${Math.max(0, w)}px`;
    layer.style.minHeight = `${Math.max(0, h)}px`;
  }

  /**
   * Kotak isi sebenarnya di layar: gabungan elemen daun yang tidak selebar lapisan.
   * @param {HTMLElement} layer
   */
  function contentRect(layer) {
    const base = layer.getBoundingClientRect();
    let l = Infinity,
      t = Infinity,
      r = -Infinity,
      b = -Infinity;
    const els = layer.querySelectorAll("*");
    for (let i = 0; i < els.length && i < 4000; i++) {
      const el = els[i];
      /* hanya elemen daun (teks, gambar, SVG utuh); wadah grid selebar tata letak diabaikan */
      const svg = el.closest("svg");
      if (svg && svg !== el) continue;
      if (!svg && el.tagName !== "IMG" && el.children.length) continue;
      const rc = el.getBoundingClientRect();
      if (!rc.width || !rc.height || rc.width >= base.width - 1) continue;
      l = Math.min(l, rc.left);
      t = Math.min(t, rc.top);
      r = Math.max(r, rc.right);
      b = Math.max(b, rc.bottom);
    }
    return l === Infinity ? null : { left: l, top: t, width: r - l, height: b - t };
  }

  function paintTool() {
    const canvas = canvasEl();
    if (canvas) canvas.dataset.tool = spaceDown ? "hand" : tool;
  }

  function paintLabels() {
    const z = get();
    options.root.querySelectorAll('[data-role="zoom-label"]').forEach((el) => (el.textContent = zoomLabel(z)));
  }

  /**
   * @param {number} z1
   * @param {{x: number, y: number} | null} [at] titik layar (clientX/Y); null = tengah kanvas
   */
  function set(z1, at = null) {
    const canvas = canvasEl(),
      layer = layerEl();
    const z0 = get();
    z1 = clampZoom(z1);
    zooms.set(options.keyOf(), z1);
    if (!canvas || !layer) return;
    const rect = canvas.getBoundingClientRect();
    const cs = getComputedStyle(canvas);
    const cx = at ? at.x - rect.left : rect.width / 2,
      cy = at ? at.y - rect.top : rect.height / 2;
    const left = anchorScroll(canvas.scrollLeft, cx, parseFloat(cs.paddingLeft) || 0, z0, z1);
    const top = anchorScroll(canvas.scrollTop, cy, parseFloat(cs.paddingTop) || 0, z0, z1);
    layer.style.zoom = String(z1);
    layer.style.setProperty("--ic-zoom", String(z1));
    canvas.scrollLeft = left;
    canvas.scrollTop = top;
    paintLabels();
    if (options.onChange) options.onChange(z1);
  }

  /** Sesuaikan isi kanvas ke layar (⌘ 0). */
  function fit() {
    const canvas = canvasEl(),
      layer = layerEl();
    if (!canvas || !layer) return;
    const box = contentRect(layer);
    if (!box) return set(1);
    const z = get();
    const cs = getComputedStyle(canvas);
    const padL = parseFloat(cs.paddingLeft) || 0,
      padT = parseFloat(cs.paddingTop) || 0;
    const availW = canvas.clientWidth - padL - (parseFloat(cs.paddingRight) || 0);
    const availH = canvas.clientHeight - padT - (parseFloat(cs.paddingBottom) || 0);
    set(Math.min(availW / (box.width / z), availH / (box.height / z)));
    /* gulir supaya isi mulai di pojok kiri atas area kanvas */
    const after = contentRect(layer);
    const rect = canvas.getBoundingClientRect();
    if (after) {
      canvas.scrollLeft += after.left - rect.left - padL;
      canvas.scrollTop += after.top - rect.top - padT;
    }
  }

  /** @param {string} t nama tool rail */
  function setTool(t) {
    tool = t;
    paintTool();
  }

  /** @param {EventTarget | null} target */
  const typing = (target) => {
    const el = /** @type {HTMLElement | null} */ (target);
    return !!el && !!el.closest && !!el.closest("input, textarea, [contenteditable=true]");
  };

  function bindKeys() {
    if (keysBound) return;
    keysBound = true;
    document.addEventListener("keydown", (e) => {
      if (typing(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "=" || e.key === "+")) return e.preventDefault(), set(stepZoom(get(), 1));
      if (mod && (e.key === "-" || e.key === "_")) return e.preventDefault(), set(stepZoom(get(), -1));
      if (mod && e.key === "0") return e.preventDefault(), fit();
      if (mod && e.key === "1") return e.preventDefault(), set(1);
      if (e.code === "Space" && hover && !e.repeat) {
        e.preventDefault();
        spaceDown = true;
        paintTool();
      } else if (e.code === "Space" && hover) e.preventDefault();
    });
    document.addEventListener("keyup", (e) => {
      if (e.code === "Space" && spaceDown) {
        spaceDown = false;
        paintTool();
      }
    });
  }

  /** Pasang ulang setelah setiap render kerangka. */
  function attach() {
    bindKeys();
    const canvas = canvasEl(),
      layer = layerEl();
    paintLabels();
    if (!canvas || !layer) return;
    layer.style.zoom = String(get());
    layer.style.setProperty("--ic-zoom", String(get()));
    sizeLayer();
    if (resizer) resizer.disconnect();
    resizer = new ResizeObserver(() => sizeLayer());
    resizer.observe(canvas);
    paintTool();
    canvas.addEventListener("pointerenter", () => (hover = true));
    canvas.addEventListener("pointerleave", () => (hover = false));
    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        const unit = e.deltaMode === 1 ? 0.05 : e.deltaMode === 2 ? 1 : 0.0025;
        set(get() * Math.exp(-e.deltaY * unit), { x: e.clientX, y: e.clientY });
      },
      { passive: false },
    );
    /** @type {{x: number, y: number, left: number, top: number, id: number, moved: boolean} | null} */
    let pan = null;
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        const panning = spaceDown || tool === "hand" || e.button === 1;
        if (!panning) return;
        e.preventDefault();
        e.stopPropagation();
        pan = { x: e.clientX, y: e.clientY, left: canvas.scrollLeft, top: canvas.scrollTop, id: e.pointerId, moved: false };
        canvas.setPointerCapture(e.pointerId);
        canvas.dataset.panning = "true";
      },
      true,
    );
    canvas.addEventListener("pointermove", (e) => {
      if (!pan || e.pointerId !== pan.id) return;
      pan.moved = pan.moved || Math.hypot(e.clientX - pan.x, e.clientY - pan.y) > 2;
      canvas.scrollLeft = pan.left - (e.clientX - pan.x);
      canvas.scrollTop = pan.top - (e.clientY - pan.y);
    });
    const endPan = (/** @type {PointerEvent} */ e) => {
      if (!pan || e.pointerId !== pan.id) return;
      suppressClick = true;
      pan = null;
      delete canvas.dataset.panning;
    };
    canvas.addEventListener("pointerup", endPan);
    canvas.addEventListener("pointercancel", endPan);
    canvas.addEventListener(
      "click",
      (e) => {
        if (suppressClick) {
          suppressClick = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (tool !== "zoom" || spaceDown) return;
        e.preventDefault();
        e.stopPropagation();
        set(stepZoom(get(), e.altKey ? -1 : 1), { x: e.clientX, y: e.clientY });
      },
      true,
    );
    canvas.addEventListener("auxclick", (e) => e.button === 1 && e.preventDefault());
  }

  return { get, set, fit, setTool, attach, zoomIn: () => set(stepZoom(get(), 1)), zoomOut: () => set(stepZoom(get(), -1)), reset: () => set(1) };
}
