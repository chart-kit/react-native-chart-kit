# Candlestick Charts

CandlestickChart renders OHLC price rows on a shared categorical x-axis. This CKV2-015 preview establishes renderer-agnostic candle geometry, a theme-aware SVG component, and tap inspection for OHLC values.

```tsx
import { CandlestickChart } from "@chart-kit/react-native";

<CandlestickChart
  data={candles}
  xKey="day"
  openKey="open"
  highKey="high"
  lowKey="low"
  closeKey="close"
  width={360}
  height={280}
  interaction="tap"
  tooltip={{ width: 154 }}
  yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
  formatYLabel={(value) => `$${Math.round(value)}`}
/>;
```

Defaults:

- green candles represent close above open
- red candles represent close below open
- flat candles use muted theme text
- invalid OHLC rows are skipped
- tap selection can show a vertical inspection line, close-price badge, and theme-aware OHLC tooltip
- y-domain is based on lows and highs, not open and close only
- `getCandlestickChartDataTable()` returns exact OHLC rows for accessible detail panels and exports
- `getCandlestickChartAccessibilitySummary()` reports latest close, highest high, and lowest low

This foundation does not yet include volume bars, range selector controls, market-session gaps, or pinch zoom. Those remain in the next financial-chart slices.
