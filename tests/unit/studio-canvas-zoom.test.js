// @ts-check
import { describe, expect, test } from "vitest";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  anchorScroll,
  clampZoom,
  stepZoom,
  zoomLabel,
} from "../../apps/icon-studio/src/canvas-zoom.js";

describe("Icon Studio zoom kanvas", () => {
  test("tangga zoom naik dan turun, dibatasi 10–800%", () => {
    expect(stepZoom(1, 1)).toBe(1.5);
    expect(stepZoom(1, -1)).toBe(0.67);
    expect(stepZoom(1.2, 1)).toBe(1.5);
    expect(stepZoom(1.2, -1)).toBe(1);
    expect(stepZoom(ZOOM_MAX, 1)).toBe(ZOOM_MAX);
    expect(stepZoom(ZOOM_MIN, -1)).toBe(ZOOM_MIN);
    expect(clampZoom(20)).toBe(ZOOM_MAX);
    expect(clampZoom(0.01)).toBe(ZOOM_MIN);
    expect(zoomLabel(1.649)).toBe("165%");
  });

  test("anchorScroll menjaga titik di bawah kursor tetap di tempat", () => {
    /* titik isi di x = (100 + 300 - 56) / 1 = 344; setelah zoom 2 harus tetap di kursor 300 */
    const s = anchorScroll(100, 300, 56, 1, 2);
    expect((s + 300 - 56) / 2).toBeCloseTo(344);
    expect(anchorScroll(0, 0, 0, 2, 0.5)).toBe(0);
  });
});
