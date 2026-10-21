// @ts-check
import { describe, expect, test } from "vitest";
import { createClassicData } from "@icon-studio/engines/classic";
import {
  DEFAULT_CANVA_META,
  DEFAULT_REVIEW,
  ensureReviewFields,
  fileNames,
  includedOf,
  slug,
} from "../../apps/icon-studio/src/state/review-ops.js";

const data = createClassicData();

describe("Icon Studio review-ops", () => {
  test("slug mengikuti IC: huruf kecil, tanpa aksen, spasi jadi tanda hubung", () => {
    expect(slug("Layanan Obrolan!")).toBe("layanan-obrolan");
    expect(slug("Café crème")).toBe("cafe-creme");
    expect(slug("")).toBe("ikon");
  });

  test("fileNames memberi akhiran untuk nama sama", () => {
    const items = [
      { name: "Kopi", main: "face", mod: "none" },
      { name: "Kopi", main: "face", mod: "none" },
      { name: "Teh", main: "face", mod: "none" },
    ];
    expect(fileNames(items, data).map((f) => f.file)).toEqual([
      "kopi.svg",
      "kopi-2.svg",
      "teh.svg",
    ]);
  });

  test("ensureReviewFields mengisi bawaan dan includedOf menghormati ikon yang dikeluarkan", () => {
    const doc = ensureReviewFields({
      items: [{ id: "a" }, { id: "b" }],
      review: { off: { b: true } },
    });
    expect(doc.meta.canva).toEqual(DEFAULT_CANVA_META);
    expect(doc.review).toEqual({ ...DEFAULT_REVIEW, off: { b: true } });
    expect(includedOf(doc).map((it) => it.id)).toEqual(["a"]);
  });

  test("ikon yang dikeluarkan tidak terbagi antardokumen baru", () => {
    const a = ensureReviewFields({ items: [] });
    a.review.off.x = true;
    const b = ensureReviewFields({ items: [] });
    expect(b.review.off).toEqual({});
    expect(DEFAULT_REVIEW.off).toEqual({});
  });
});
