import { describe, it, expect } from "vitest";
import { format, decompose } from "../src/index.js";

const BASE = Date.UTC(2026, 4, 19, 12, 0, 0); // 2026-05-19 12:00 UTC

describe("format basic", () => {
  it("future: in 1 hour", () => {
    expect(format(BASE + 3_600_000, BASE, { locale: "en" })).toBe("in 1 hour");
  });
  it("past: 1 hour ago", () => {
    expect(format(BASE - 3_600_000, BASE, { locale: "en" })).toBe("1 hour ago");
  });
  it("future days", () => {
    expect(format(BASE + 3 * 86_400_000, BASE, { locale: "en" })).toBe("in 3 days");
  });
  it("auto picks the most natural unit", () => {
    expect(format(BASE - 5_000, BASE, { locale: "en" })).toBe("5 seconds ago");
    expect(format(BASE - 5 * 60_000, BASE, { locale: "en" })).toBe("5 minutes ago");
    expect(format(BASE - 5 * 3_600_000, BASE, { locale: "en" })).toBe("5 hours ago");
    expect(format(BASE - 5 * 86_400_000, BASE, { locale: "en" })).toBe("5 days ago");
  });
});

describe("numeric: auto vs always", () => {
  it("auto: 'yesterday' / 'tomorrow'", () => {
    expect(format(BASE - 86_400_000, BASE, { locale: "en", numeric: "auto" })).toBe("yesterday");
    expect(format(BASE + 86_400_000, BASE, { locale: "en", numeric: "auto" })).toBe("tomorrow");
  });
  it("always: '1 day ago'", () => {
    expect(format(BASE - 86_400_000, BASE, { locale: "en", numeric: "always" })).toBe("1 day ago");
  });
});

describe("style", () => {
  it("short", () => {
    expect(format(BASE - 86_400_000, BASE, { locale: "en", style: "short", numeric: "always" })).toContain("day");
  });
  it("narrow", () => {
    // narrow is locale-specific but should still return a string
    const out = format(BASE - 86_400_000, BASE, { locale: "en", style: "narrow", numeric: "always" });
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});

describe("unit override", () => {
  it("forces unit", () => {
    // 90 minutes ago, forced into hours
    expect(format(BASE - 90 * 60_000, BASE, { locale: "en", unit: "hour" })).toBe("2 hours ago");
  });
  it("rejects unknown unit", () => {
    // @ts-expect-error testing runtime check
    expect(() => format(BASE, BASE, { unit: "fortnight" })).toThrow();
  });
});

describe("nowThreshold", () => {
  it("returns label when within threshold", () => {
    expect(format(BASE - 100, BASE, { locale: "en", nowThresholdMs: 1000 })).toBe("just now");
  });
  it("custom label", () => {
    expect(format(BASE, BASE, { nowThresholdMs: 1000, nowLabel: "right now" })).toBe("right now");
  });
});

describe("non-English locale", () => {
  it("works in Romanian", () => {
    const out = format(BASE - 86_400_000, BASE, { locale: "ro", numeric: "always" });
    expect(out.toLowerCase()).toContain("zi");
  });
});

describe("Date and number inputs", () => {
  it("accepts Date objects", () => {
    expect(format(new Date(BASE + 3_600_000), new Date(BASE), { locale: "en" })).toBe("in 1 hour");
  });
});

describe("decompose", () => {
  it("returns value and unit", () => {
    expect(decompose(BASE - 3_600_000, BASE)).toEqual({ value: -1, unit: "hour" });
    expect(decompose(BASE + 7 * 86_400_000, BASE)).toEqual({ value: 1, unit: "week" });
  });
  it("respects forced unit", () => {
    expect(decompose(BASE - 90 * 60_000, BASE, { unit: "hour" })).toEqual({ value: -2, unit: "hour" });
  });
});
