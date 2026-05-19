# relative-time

[![ci](https://github.com/p-vbordei/relative-time/actions/workflows/ci.yml/badge.svg)](https://github.com/p-vbordei/relative-time/actions/workflows/ci.yml)

[![npm](https://img.shields.io/npm/v/%40p-vbordei%2Frelative-time.svg)](https://www.npmjs.com/package/@p-vbordei/relative-time)
[![downloads](https://img.shields.io/npm/dm/%40p-vbordei%2Frelative-time.svg)](https://www.npmjs.com/package/@p-vbordei/relative-time)
[![bundle](https://img.shields.io/bundlejs/size/%40p-vbordei%2Frelative-time)](https://bundlejs.com/?q=%40p-vbordei%2Frelative-time)

> Format dates as relative phrases — *"2 hours ago"*, *"in 3 days"*, *"yesterday"* — with smart unit selection. Wraps `Intl.RelativeTimeFormat`, so all locales work out of the box.

```ts
import { format } from "@p-vbordei/relative-time";

format(Date.now() - 60_000);                       // "1 minute ago"
format(Date.now() + 3_600_000);                    // "in 1 hour"
format(Date.now() - 86_400_000);                   // "yesterday"   (numeric: "auto")
format(Date.now() - 100, undefined, {
  nowThresholdMs: 1000,
});                                                // "just now"

format(Date.now() - 86_400_000, undefined, { locale: "ro" });   // "ieri"
format(Date.now() - 86_400_000, undefined, { locale: "fr" });   // "hier"
```

## Install

```sh
npm install @p-vbordei/relative-time
```

Works with Node 20+, browsers, Bun, Deno. ESM + CJS.

## Why

`Intl.RelativeTimeFormat` is built into every modern JS runtime — but it doesn't pick the unit for you. *That's* the boring part you'd have to write every time. `relative-time` is that helper: auto-picks the unit using human-friendly boundaries, exposes a `decompose()` for when you want to render yourself, and adds a "just now" threshold for live UIs.

## Recipes

### Live "last updated" indicator

```ts
import { format } from "@p-vbordei/relative-time";

function tick() {
  el.textContent = format(record.updatedAt);
}
setInterval(tick, 30_000);  // refresh every 30s
tick();
```

### Localized chat timestamps

```ts
import { format } from "@p-vbordei/relative-time";

function timestamp(message: Message, userLocale: string) {
  return format(message.createdAt, undefined, {
    locale: userLocale,
    numeric: "auto",         // "yesterday" instead of "1 day ago"
    nowThresholdMs: 60_000,  // "just now" for last minute
  });
}
```

### Build your own UI with decompose

```tsx
import { decompose } from "@p-vbordei/relative-time";

const { value, unit } = decompose(eventDate);
return (
  <div>
    <span className="value">{Math.abs(value)}</span>
    <span className="unit">{unit}{Math.abs(value) !== 1 ? "s" : ""}</span>
    <span className="direction">{value < 0 ? "ago" : "from now"}</span>
  </div>
);
```

### Force a specific unit

```ts
import { format } from "@p-vbordei/relative-time";

// "1.5 hours ago" rounded into hours
format(Date.now() - 90 * 60_000, undefined, { unit: "hour" });
// "2 hours ago"
```

## API

### `format(target, base?, opts?): string`

| Argument | Type | Default |
|---|---|---|
| `target` | `Date \| number` | — — the point in time to describe |
| `base` | `Date \| number` | `Date.now()` — the reference point |

Options:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `locale` | `string \| string[]` | runtime default | Any BCP 47 locale tag |
| `numeric` | `"auto" \| "always"` | `"auto"` | `"auto"` allows phrases like "yesterday" |
| `style` | `"long" \| "short" \| "narrow"` | `"long"` | |
| `unit` | `"second" \| "minute" \| "hour" \| "day" \| "week" \| "month" \| "year"` | auto | Force a specific unit |
| `nowThresholdMs` | `number` | — | Return `nowLabel` if `|delta|` is below this |
| `nowLabel` | `string` | `"just now"` | |

### `decompose(target, base?, opts?): { value, unit }`

Same logic but returns the chosen unit and numeric value without locale rendering, so you can build your own UI on top.

## Unit boundaries

Unit selection uses these thresholds (where `abs` is `|target - base|` in ms):

| If `abs >=` | Unit |
|---|---|
| 1000 | second |
| 60_000 | minute |
| 3_600_000 | hour |
| 86_400_000 | day |
| 604_800_000 | week |
| 2_629_800_000 | month (30.44 days) |
| 31_557_600_000 | year (365.25 days) |

So `59s` → "59 seconds", `60s` → "1 minute". Use `nowThresholdMs` to override behavior near zero.

## Caveats

- **Month/year boundaries are approximations.** Months use 30.44 days, years 365.25.
- **`numeric: "auto"`** is locale-specific. English gives "yesterday/today/tomorrow"; some locales don't have analogous shortcuts.
- **Single-unit output only.** For multi-component duration display ("5 days, 3 hours"), use [human-duration](https://github.com/p-vbordei/human-duration) on the delta instead.

## License

Apache-2.0 © Vlad Bordei
