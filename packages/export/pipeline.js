// @ts-check
/** @module export */
import { dedupeAttrs } from "@icon-studio/core";
const OUTLINE_SHAPES = "path,line,polyline,polygon,rect,circle,ellipse";
const STROKE_ATTRS = [
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "vector-effect",
];
function inheritedAttr(el, name, fallback) {
  for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
    const value = node.getAttribute(name);
    if (value != null && value !== "inherit") return value;
  }
  return fallback;
}
const colorKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
function geometryForColor(element, color, viewBox) {
  const clone = element.cloneNode(true),
    originals = [...element.querySelectorAll(OUTLINE_SHAPES)],
    copies = [...clone.querySelectorAll(OUTLINE_SHAPES)];
  clone.removeAttribute("mask");
  clone
    .querySelectorAll("[mask]")
    .forEach((node) => node.removeAttribute("mask"));
  copies.forEach((copy, index) => {
    const original = originals[index],
      fill = inheritedAttr(original, "fill", "black"),
      stroke = inheritedAttr(original, "stroke", "none");
    const includeFill = colorKey(fill) === colorKey(color),
      includeStroke =
        colorKey(stroke) === colorKey(color) &&
        Number(inheritedAttr(original, "stroke-width", "1")) > 0;
    if (!includeFill && !includeStroke) {
      copy.remove();
      return;
    }
    copy.setAttribute("fill", includeFill ? color : "none");
    if (includeStroke) {
      copy.setAttribute("stroke", color);
      for (const name of STROKE_ATTRS.slice(1)) {
        const value = inheritedAttr(original, name, null);
        if (value != null) copy.setAttribute(name, value);
        else copy.removeAttribute(name);
      }
    } else STROKE_ATTRS.forEach((name) => copy.removeAttribute(name));
  });
  const content = [...clone.childNodes]
    .map((node) => new XMLSerializer().serializeToString(node))
    .join("");
  const mini = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`;
  return window.IconOutline.outlineSvgToMultiPolygon(mini, {
    fills: true,
    fill: color,
    precision: 4,
    curves: true,
  });
}
function cloneSingleShape(element, shapeIndex, color) {
  const clone = element.cloneNode(true),
    copies = [...clone.querySelectorAll(OUTLINE_SHAPES)];
  clone.removeAttribute("mask");
  clone
    .querySelectorAll("[mask]")
    .forEach((node) => node.removeAttribute("mask"));
  copies.forEach((copy, index) => {
    if (index !== shapeIndex) {
      copy.remove();
      return;
    }
    STROKE_ATTRS.forEach((name) => copy.removeAttribute(name));
    copy.setAttribute("fill", color);
  });
  return clone;
}
function geometryForShape(element, shapeIndex, color, viewBox) {
  const clone = cloneSingleShape(element, shapeIndex, color);
  const mini = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${new XMLSerializer().serializeToString(clone)}</svg>`;
  return window.IconOutline.outlineSvgToMultiPolygon(mini, {
    fills: true,
    fill: color,
    precision: 4,
    curves: true,
  });
}
function geometryArea(mp) {
  const ringArea = (ring) =>
    Math.abs(
      ring.reduce((sum, point, index) => {
        const next = ring[(index + 1) % ring.length];
        return sum + point[0] * next[1] - next[0] * point[1];
      }, 0) / 2,
    );
  return mp.reduce(
    (sum, polygon) =>
      sum +
      ringArea(polygon[0]) -
      polygon.slice(1).reduce((holes, ring) => holes + ringArea(ring), 0),
    0,
  );
}
function flattenSvgMasks(doc) {
  const svg = doc.documentElement,
    viewBox = svg.getAttribute("viewBox") || "0 0 48 48",
    masked = [...svg.querySelectorAll("[mask]")];
  for (const element of masked) {
    if (element.closest("defs")) continue;
    const ref = element.getAttribute("mask") || "",
      match = ref.match(/^url\(#([^)]+)\)$/),
      mask = match && svg.querySelector(`mask[id="${CSS.escape(match[1])}"]`);
    if (!mask) throw new Error(`Mask ${ref || "tanpa id"} tidak ditemukan.`);
    const cut = geometryForColor(mask, "#000", viewBox),
      shapes = [...element.querySelectorAll(OUTLINE_SHAPES)];
    const replacement = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    for (let index = 0; index < shapes.length; index++) {
      const color = inheritedAttr(shapes[index], "fill", "black");
      if (["none", "transparent", "#fff", "white"].includes(colorKey(color)))
        continue;
      const source = geometryForShape(element, index, color, viewBox),
        result = window.IconOutline.differenceMultiPolygons(source, cut);
      if (Math.abs(geometryArea(source) - geometryArea(result)) < 0.0001) {
        replacement.appendChild(cloneSingleShape(element, index, color));
        continue;
      }
      const d = window.IconOutline.multiPolygonToPathData(result, {
        precision: 4,
        curves: true,
      });
      if (!d) continue;
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", color);
      path.setAttribute("fill-rule", "evenodd");
      replacement.appendChild(path);
    }
    element.replaceWith(replacement);
  }
  svg.querySelectorAll("mask").forEach((mask) => mask.remove());
  svg.querySelectorAll("defs").forEach((defs) => {
    if (!defs.children.length) defs.remove();
  });
  if (svg.querySelector("[mask],mask"))
    throw new Error("Validasi gagal: output masih mengandung mask.");
}
export function outlineSvgFile(source) {
  if (
    !window.IconOutline ||
    typeof window.IconOutline.outlineSvg !== "function"
  )
    throw new Error("Mesin konversi outline tidak tersedia.");
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  if (doc.querySelector("parsererror"))
    throw new Error("SVG sumber tidak valid.");
  const svg = doc.documentElement,
    shapes = [...svg.querySelectorAll(OUTLINE_SHAPES)];
  for (const el of shapes) {
    if (!el.isConnected) continue;
    if (el.closest("defs")) continue;
    const stroke = inheritedAttr(el, "stroke", "none");
    const width = Number(inheritedAttr(el, "stroke-width", "1"));
    if (
      !stroke ||
      stroke === "none" ||
      stroke === "transparent" ||
      !(width > 0)
    )
      continue;
    if (inheritedAttr(el, "stroke-dasharray", "none") !== "none")
      throw new Error(
        "Stroke putus-putus belum didukung untuk konversi shape.",
      );
    const clone = el.cloneNode(true);
    clone.setAttribute("stroke", stroke);
    clone.setAttribute("stroke-width", String(width));
    clone.setAttribute(
      "stroke-linecap",
      inheritedAttr(el, "stroke-linecap", "butt"),
    );
    clone.setAttribute(
      "stroke-linejoin",
      inheritedAttr(el, "stroke-linejoin", "miter"),
    );
    clone.setAttribute(
      "stroke-miterlimit",
      inheritedAttr(el, "stroke-miterlimit", "4"),
    );
    clone.setAttribute("fill", "none");
    const mini = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox") || "0 0 48 48"}">${new XMLSerializer().serializeToString(clone)}</svg>`;
    const warnings = [];
    const converted = window.IconOutline.outlineSvg(mini, {
      fills: false,
      fill: stroke,
      precision: 4,
      curves: true,
      onWarning: (w) => warnings.push(w),
    });
    if (warnings.length)
      throw new Error(
        warnings[0].message || "Ada bentuk yang tidak dapat dikonversi.",
      );
    const outDoc = new DOMParser().parseFromString(converted, "image/svg+xml"),
      outlinePath = outDoc.querySelector("path");
    if (!outlinePath)
      throw new Error("Outline stroke tidak menghasilkan path.");
    const group = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("stroke", "none");
    const fill = inheritedAttr(el, "fill", "black");
    if (fill && fill !== "none" && fill !== "transparent") {
      const fillShape = el.cloneNode(true);
      STROKE_ATTRS.forEach((name) => fillShape.removeAttribute(name));
      fillShape.setAttribute("stroke", "none");
      fillShape.setAttribute("fill", fill);
      group.appendChild(fillShape);
    }
    const path = doc.importNode(outlinePath, true);
    path.setAttribute("fill", stroke);
    path.setAttribute("fill-rule", "evenodd");
    path.removeAttribute("stroke");
    group.appendChild(path);
    el.replaceWith(group);
  }
  flattenSvgMasks(doc);
  svg
    .querySelectorAll("*")
    .forEach((el) => STROKE_ATTRS.forEach((name) => el.removeAttribute(name)));
  STROKE_ATTRS.forEach((name) => svg.removeAttribute(name));
  const result =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    new XMLSerializer().serializeToString(svg);
  if (/\sstroke(?:-|=)/.test(result))
    throw new Error("Validasi gagal: output masih mengandung atribut stroke.");
  if (/<mask\b|\smask=/.test(result))
    throw new Error("Validasi gagal: output masih mengandung mask.");
  return dedupeAttrs(result);
}
export function directFillSvgFile(source) {
  const outlined = outlineSvgFile(source);
  const doc = new DOMParser().parseFromString(outlined, "image/svg+xml");
  if (doc.querySelector("parsererror"))
    throw new Error("SVG outline tidak valid.");
  const svg = doc.documentElement,
    viewBox = svg.getAttribute("viewBox") || "0 0 48 48";
  const colors = [];
  for (const shape of svg.querySelectorAll(OUTLINE_SHAPES)) {
    const fill = inheritedAttr(shape, "fill", "none"),
      key = colorKey(fill);
    if (key && key !== "none" && key !== "transparent") {
      const previous = colors.findIndex((color) => colorKey(color) === key);
      if (previous >= 0) colors.splice(previous, 1);
      colors.push(fill);
    }
  }
  const flat = document.implementation.createDocument(
    "http://www.w3.org/2000/svg",
    "svg",
    null,
  );
  const root = flat.documentElement;
  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  root.setAttribute("viewBox", viewBox);
  root.setAttribute("width", svg.getAttribute("width") || "480");
  root.setAttribute("height", svg.getAttribute("height") || "480");
  for (const color of colors) {
    const geometry = geometryForColor(svg, color, viewBox);
    const d = window.IconOutline.multiPolygonToPathData(geometry, {
      precision: 4,
      curves: true,
    });
    if (!d) continue;
    const path = flat.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", color);
    path.setAttribute("fill-rule", "nonzero");
    root.appendChild(path);
  }
  const result =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    new XMLSerializer().serializeToString(root);
  if (!root.children.length)
    throw new Error("Direct-fill tidak menghasilkan path.");
  if (/<mask\b|\smask=|\sstroke(?:-|=)|<g\b|\stransform=/.test(result))
    throw new Error("Validasi direct-fill gagal: struktur SVG belum rata.");
  const paths = [...root.children];
  if (
    paths.some(
      (path) =>
        path.localName !== "path" ||
        !path.getAttribute("d") ||
        !path.getAttribute("fill"),
    )
  )
    throw new Error(
      "Validasi Canva gagal: setiap warna harus berupa path fill langsung.",
    );
  const editableColors = [
    ...new Set(
      paths.map((path) => colorKey(path.getAttribute("fill"))).filter(Boolean),
    ),
  ];
  if (!editableColors.length || editableColors.length > 5)
    throw new Error(
      `Validasi Canva gagal: ditemukan ${editableColors.length} warna editable (batas 1–5).`,
    );
  if (/\sstyle=|<style\b|<use\b|<symbol\b|<clipPath\b/i.test(result))
    throw new Error(
      "Validasi Canva gagal: SVG masih memakai style atau referensi yang tidak langsung.",
    );
  return dedupeAttrs(result);
}
