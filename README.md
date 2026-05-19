# relative-time

Format dates as relative phrases — *"2 hours ago"*, *"in 3 days"*, *"yesterday"* — with smart unit selection. Wraps `Intl.RelativeTimeFormat`, so all locales work out of the box.

```ts
import { format, decompose } from "relative-time";

format(Date.now() - 60_000)                       // "1 minute ago"
format(Date.now() + 3_600_000)                    // "in 1 hour"
format(Date.now() - 86_400_000)                   // "yesterday"   (numeric: "auto", default)
format(Date.now() - 86_400_000, undefined, {
  numeric: "always"
})                                                // "1 day ago"
format(Date.now() - 100, undefined, {
  nowThresholdMs: 1000
})                                                // "just now"

format(now - 86_400_000, undefined, { locale: "ro" })  // "ieri"
```

## Install

```sh
npm install relative-time
```

## API

### `format(target, base?, opts?): string`

| Argument | Type | Default |
|---|---|---|
| `target` | `Date \| number` | — |
| `base` | `Date \| number` | `Date.now()` |

Options:

| Field | Type | Default | Meaning |
|---|---|---|---|
| `locale` | `string \| string[]` | runtime default | Any BCP 47 locale tag |
| `numeric` | `"auto" \| "always"` | `"auto"` | `"auto"` allows phrases like "yesterday" |
| `style` | `"long" \| "short" \| "narrow"` | `"long"` | |
| `unit` | `"second"\|"minute"\|"hour"\|"day"\|"week"\|"month"\|"year"` | auto | Force a specific unit |
| `nowThresholdMs` | `number` | — | Return `nowLabel` if `|delta|` is below this |
| `nowLabel` | `string` | `"just now"` | |

### `decompose(target, base?, opts?): { value, unit }`

Same logic but returns the chosen unit and numeric value without locale rendering, so you can build your own UI on top.

## Why this and not `Intl.RelativeTimeFormat` directly?

`Intl.RelativeTimeFormat` doesn't pick the unit for you — that's the boring part you'd have to write every time. This package handles it (using boundaries that match human intuition) and adds the small ergonomics around it: `"just now"` thresholding, `decompose`, sensible defaults.

## License

Apache-2.0 © Vlad Bordei
