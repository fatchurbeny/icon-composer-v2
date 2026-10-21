// @ts-check
import { describe, expect, test } from "vitest";
import {
  STYLE_WORDS,
  buildZip,
  createTagIndex,
  metadataCsv,
  packColors,
  styleWord,
  svgColors,
  titleCase,
  trID,
} from "@icon-studio/export";

describe("@icon-studio/export", () => {
  test("STYLE_WORDS sama dengan judul legacy classic dan accent", () => {
    expect(styleWord("accent")).toEqual({
      en: "Accent Line",
      id: "garis aksen",
    });
    expect(styleWord("classic", "A")).toEqual({
      en: "Two Tone",
      id: "dua warna",
    });
    expect(styleWord("classic", "B")).toEqual({
      en: "Solid Two Tone",
      id: "solid dua warna",
    });
    expect(styleWord("classic", "C")).toEqual({ en: "Outline", id: "garis" });
    expect(styleWord("offset")).toBe(STYLE_WORDS.offset);
  });

  test("metadataCsv: BOM, CRLF, sel dikutip, header bisa tanpa kutip", () => {
    const rows = [{ a: 'kata "kutip"', b: null }];
    expect(metadataCsv(rows, ["a", "b"])).toBe(
      '﻿"a","b"\r\n"kata ""kutip""",""\r\n',
    );
    expect(metadataCsv(rows, ["a", "b"], { quoteHeader: false })).toBe(
      '﻿a,b\r\n"kata ""kutip""",""\r\n',
    );
  });

  test("buildZip menyisipkan file sesuai urutan", async () => {
    const added = [];
    class FakeZip {
      file(/** @type {string} */ name, /** @type {unknown} */ content) {
        added.push([name, content]);
      }
      async generateAsync(/** @type {{type: string}} */ opts) {
        return opts.type;
      }
    }
    const out = await buildZip(FakeZip, {
      "a/b.svg": "<svg/>",
      "metadata.csv": "x",
    });
    expect(out).toBe("blob");
    expect(added).toEqual([
      ["a/b.svg", "<svg/>"],
      ["metadata.csv", "x"],
    ]);
  });

  test("svgColors mengabaikan mask dan packColors menggabungkan warna", () => {
    const svg =
      '<mask><path fill="#000"/></mask><path fill="#abc" stroke="#FFF"/>';
    expect([...svgColors(svg)]).toEqual(["#ABC", "#FFF"]);
    expect([
      ...packColors(["#111", "#222"], (c) => `<path fill="${c}"/>`),
    ]).toEqual(["#111", "#222"]);
  });

  test("titleCase dan trID", () => {
    expect(titleCase("rocket of the day")).toBe("Rocket of the Day");
    expect(trID("check")).toBe("centang");
    expect(trID("kata-tak-dikenal")).toBeNull();
  });

  test("tag pustaka dimuat sekali dan merek dibuang", async () => {
    const calls = [];
    /** @type {any} */
    const fetch = async (/** @type {string} */ url) => {
      calls.push(url);
      if (url.includes("lucide-static"))
        return { ok: true, json: async () => ({ coffee: ["drink", "Cup"] }) };
      return {
        ok: true,
        json: async () => ({
          coffee: { category: "Food", tags: ["cafe", "logo"] },
          github: { category: "Brand", tags: ["git"] },
        }),
      };
    };
    const tags = createTagIndex({ fetch });
    await tags.loadTags();
    await tags.loadTags();
    expect(calls).toHaveLength(2);
    expect(tags.tagsOf("coffee")).toEqual(["coffee", "drink", "cup", "cafe"]);
    expect(tags.tagsOf("github")).toEqual(["github"]);
  });
});
