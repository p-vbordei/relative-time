type RTFUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

const UNIT_TABLE: ReadonlyArray<{ ms: number; name: RTFUnit }> = [
  { ms: 1000, name: "second" },
  { ms: 60_000, name: "minute" },
  { ms: 3_600_000, name: "hour" },
  { ms: 86_400_000, name: "day" },
  { ms: 604_800_000, name: "week" },
  { ms: 2_629_800_000, name: "month" }, // 30.44 days, matches Intl's expectations
  { ms: 31_557_600_000, name: "year" }, // 365.25 days
];

function pickUnit(absMs: number): { ms: number; name: RTFUnit } {
  let chosen = UNIT_TABLE[0]!;
  for (const u of UNIT_TABLE) {
    if (absMs >= u.ms) chosen = u;
    else break;
  }
  return chosen;
}

export interface FormatOptions {
  /** BCP 47 locale tag (e.g. `"en"`, `"ro"`, `"fr-CA"`). Default: runtime default. */
  locale?: string | string[];
  /** `"auto"` produces phrases like "yesterday"; `"always"` produces "1 day ago". Default `"auto"`. */
  numeric?: "auto" | "always";
  /** Default `"long"`. */
  style?: "long" | "short" | "narrow";
  /** Force a specific unit instead of auto-picking. */
  unit?: RTFUnit;
  /** If `|delta| < nowThresholdMs`, return `nowLabel`. Default: disabled. */
  nowThresholdMs?: number;
  /** Label used when within the "now" threshold. Default `"just now"`. */
  nowLabel?: string;
}

/**
 * Format a date as a relative phrase ("2 hours ago", "in 3 days").
 *
 * Built on `Intl.RelativeTimeFormat`, available in all modern Node/browsers.
 * Picks the most natural unit automatically; use `opts.unit` to override.
 *
 * @param target  The point in time to describe (Date or unix ms).
 * @param base    The reference point. Default: `Date.now()`.
 */
export function format(target: Date | number, base: Date | number = Date.now(), opts: FormatOptions = {}): string {
  const t = typeof target === "number" ? target : target.getTime();
  const b = typeof base === "number" ? base : base.getTime();
  const delta = t - b;
  const abs = Math.abs(delta);

  if (opts.nowThresholdMs !== undefined && abs < opts.nowThresholdMs) {
    return opts.nowLabel ?? "just now";
  }

  let u: { ms: number; name: RTFUnit };
  if (opts.unit) {
    const found = UNIT_TABLE.find((x) => x.name === opts.unit);
    if (!found) throw new Error(`unknown unit: ${opts.unit}`);
    u = found;
  } else {
    u = pickUnit(abs);
  }

  const rtf = new Intl.RelativeTimeFormat(opts.locale, {
    numeric: opts.numeric ?? "auto",
    style: opts.style ?? "long",
  });
  // Math.round in JS rounds half-to-positive-infinity, which gives surprising
  // results for negative deltas (e.g. -1.5h → -1 not -2). Round magnitude, then
  // re-apply sign so |x|.5 always rounds away from zero.
  const sign = delta < 0 ? -1 : 1;
  return rtf.format(sign * Math.round(Math.abs(delta) / u.ms), u.name);
}

/**
 * Like `format()` but returns the raw `{ value, unit }` pair without locale rendering.
 * Useful if you want to render yourself or feed another formatter.
 */
export function decompose(
  target: Date | number,
  base: Date | number = Date.now(),
  opts: Pick<FormatOptions, "unit"> = {},
): { value: number; unit: RTFUnit } {
  const t = typeof target === "number" ? target : target.getTime();
  const b = typeof base === "number" ? base : base.getTime();
  const delta = t - b;
  const u = opts.unit
    ? UNIT_TABLE.find((x) => x.name === opts.unit)!
    : pickUnit(Math.abs(delta));
  const sign = delta < 0 ? -1 : 1;
  return { value: sign * Math.round(Math.abs(delta) / u.ms), unit: u.name };
}
