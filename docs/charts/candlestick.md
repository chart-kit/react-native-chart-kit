# Candlestick Charts

CandlestickChart renders OHLC price rows on a shared categorical x-axis. This first CKV2-015 slice establishes renderer-agnostic candle geometry and a theme-aware SVG component.

```tsx
import { CandlestickChart } from "@chart-kit/react-native-v2";

<CandlestickChart
  data={candles}
  xKey="day"
  openKey="open"
  highKey="high"
  lowKey="low"
  closeKey="close"
  width={360}
  height={280}
  yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
  formatYLabel={(value) => `$${Math.round(value)}`}
/>;
```

Defaults:

- green candles represent close above open
- red candles represent close below open
- flat candles use muted theme text
- invalid OHLC rows are skipped
- y-domain is based on lows and highs, not open and close only

This foundation does not yet include volume bars, crosshair labels, range selector controls, or pinch zoom. Those remain in the next financial-chart slices.
