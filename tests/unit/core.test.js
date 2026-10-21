// @ts-check
import { describe, expect, test } from "vitest";
import { dedupeAttrs, hash, partStr, rng } from "@icon-studio/core";
import { concept } from "@icon-studio/icon-sources";
import {
  accent,
  classic,
  handWriting,
  migrateLegacy,
  offset,
} from "@icon-studio/engines";

describe("paket bersama Fase 2", () => {
  test("rng dan hash deterministik", () => {
    expect(hash("ikon")).toBe(hash("ikon"));
    expect([rng(42)(), rng(42)()]).toEqual([rng(42)(), rng(42)()]);
  });

  test("partStr menimpa atribut lama dan dedupeAttrs mempertahankan nilai terakhir", () => {
    expect(
      partStr(
        { tag: "path", attrs: { fill: "red", d: "M0 0" } },
        ' fill="blue"',
      ),
    ).toBe('<path d="M0 0" fill="blue"/>');
    expect(dedupeAttrs('<path fill="red" fill="blue"/>')).toBe(
      '<path fill="blue"/>',
    );
  });

  test("concept menyatukan sumber dan sinonim", () => {
    expect(concept("lu:circle-check", "mod")).toBe("ok");
    expect(concept("tb:mood-smile-2")).toBe("mood-smile");
  });

  test("registry memuat classic dan accent sesuai kontrak", () => {
    expect(classic.version).toBe("1.4.5");
    expect(accent.supports.maxColors).toBeLessThanOrEqual(5);
    expect(
      classic.signature({
        main: "lu:user",
        mod: "tb:circle-check",
        slot: "BR",
      }),
    ).toBe("classic|user|ok|BR");
  });

  test("offset menormalkan kanvas dan menonaktifkan pengubah", () => {
    const item = {
      main: "lu:circle",
      mod: "lu:plus",
      node: [["circle", { cx: 12, cy: 12, r: 8 }]],
    };
    const svg = offset.compose(
      offset.adapt(item, offset.defaults),
      offset.defaults,
      { idp: "o1" },
    );
    expect(svg).toContain('viewBox="0 0 48 48"');
    expect(offset.signature(item)).toBe("offset|circle|-|-");
    expect(offset.flags(item)).toContainEqual([
      "info",
      "Pengubah tidak tersedia pada style ini",
    ]);
  });

  test("hand-writing deterministik dan memanggang dash menjadi geometri", () => {
    const item = {
      main: "lu:pen",
      mod: "lu:check",
      slot: "BR",
      seed: 7,
      parts: [["path", { d: "M2.000 2.000 L22.000 2.000" }]],
    };
    const a = handWriting.compose(item, handWriting.defaults, { idp: "hw1" });
    const b = handWriting.compose(item, handWriting.defaults, { idp: "hw1" });
    expect(a).toBe(b);
    expect(a).not.toContain("stroke-dasharray");
    expect(a).not.toContain("pathLength");
    expect(a).toMatch(/<path d="M/);
    expect(handWriting.version).toBe("2.0.0");
  });

  test("migrasi payload coret memakai family hand-writing dan seed kanonik", () => {
    const migrated = migrateLegacy({
      family: "coret",
      style: { gap: 12 },
      icons: [{ main: "lu:pen", anchor: "TL", seed: 42 }],
    });
    expect(migrated.family).toBe("hand-writing");
    expect(migrated.version).toBe(2);
    expect(migrated.icons[0].slot).toBe("TL");
    expect(migrated.icons[0].engine["hand-writing"].seed).toBe(42);
  });
});
