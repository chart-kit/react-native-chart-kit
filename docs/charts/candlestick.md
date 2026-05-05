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
  volumeKey="volume"
  width={360}
  height={280}
  interaction="tap"
  rangeSelector={{ interactive: true, minVisiblePoints: 8 }}
  sessionGaps={{ exchange: "nyse", label: true }}
  tooltip={{ width: 154 }}
  viewport={{ visiblePoints: 20, initialIndex: "end" }}
  viewportInteraction={{ pan: true, pinchZoom: true, minVisiblePoints: 8 }}
  yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
  formatYLabel={(value) => `$${Math.round(value)}`}
/>;
```

Defaults:

- green candles represent close above open
- red candles represent close below open
- flat candles use muted theme text
- invalid OHLC rows are skipped
- pass `volumeKey` to render a subtle volume overlay behind the candles
- use `viewport` to render a focused window from a larger OHLC dataset
- use `scrollable`, `visiblePoints`, and `initialIndex="end"` for simple long OHLC histories
- enable `rangeSelector` for a compact interactive OHLC overview below the main chart
- enable `sessionGaps` to mark weekend or market-closure gaps when `xKey` contains `Date` values or parseable date strings
- use `sessionGaps.calendar="tradingDays"` with `holidays` or custom `tradingWeekdays` for exchange-calendar-aware closures
- use `sessionGaps.exchange="nyse"`, `"nasdaq"`, or `"usEquities"` for built-in US equities full-day holidays
- use `viewportInteraction` with `onViewportChange` for controlled pan and pinch-zoom windows
- tap selection can show a vertical inspection line, close-price badge, and theme-aware OHLC tooltip
- y-domain is based on lows and highs, not open and close only
- `getCandlestickChartDataTable()` returns exact OHLC rows for accessible detail panels and exports
- `getCandlestickChartAccessibilitySummary()` reports latest close, highest high, and lowest low

This foundation includes preview-grade range selection, controlled pan and pinch-zoom windows, and opt-in calendar-aware market-session gap markers. Built-in exchange presets cover regular US equities full-day holidays; early closes, emergency closures, and advanced financial narratives remain outside this preview.
