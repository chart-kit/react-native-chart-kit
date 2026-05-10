# Candlestick Charts

CandlestickChart renders OHLC price rows on a shared categorical x-axis. This CKV2-015 preview establishes renderer-agnostic candle geometry, a theme-aware SVG component, and tap inspection for OHLC values.

Status: CandlestickChart is a Financial Preview and Pro candidate under the H4-approved package scope. Keep it visible for API and product review, but do not position it as part of the final free Developer Preview.

```tsx
import {
  CandlestickChart,
  getCandlestickEmergencyClosureSessions
} from "@chart-kit/react-native/pro-preview";

const emergencyClosures = getCandlestickEmergencyClosureSessions([
  { date: "2026-11-26", reason: "Closed" }
]);

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
  sessionGaps={{
    earlyCloses: true,
    exchange: "nyse",
    label: true,
    specialSessions: emergencyClosures
  }}
  tooltip={{ width: 154 }}
  viewport={{ visiblePoints: 20, initialIndex: "end" }}
  viewportInteraction={{ pan: true, pinchZoom: true, minVisiblePoints: 8 }}
  yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
  formatYLabel={(value) => `$${Math.round(value)}`}
/>;
```

Long-press crosshair inspection can be tuned separately from normal pan and pinch gestures:

```tsx
<CandlestickChart
  data={candles}
  xKey="day"
  openKey="open"
  highKey="high"
  lowKey="low"
  closeKey="close"
  width={360}
  height={280}
  interaction={{
    activation: "longPress",
    longPressDelayMs: 720,
    longPressMoveTolerance: 12,
    mode: "crosshair"
  }}
  viewportInteraction={{ pan: true, pinchZoom: true }}
/>
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
- use `sessionGaps.earlyCloses={true}` with a supported exchange to mark built-in US equities early closes
- pass explicit dates to `sessionGaps.earlyCloses` when an app has its own shortened-session calendar
- use `sessionGaps.specialSessions` to mark one-off emergency closures on or between dated candles
- use `getCandlestickEmergencyClosureSessions()` to map an external closure feed into `specialSessions`
- use `viewportInteraction` with `onViewportChange` for controlled pan and pinch-zoom windows
- tap selection can show a vertical inspection line, close-price badge, and theme-aware OHLC tooltip
- crosshair inspection supports `longPressDelayMs` and `longPressMoveTolerance` so apps can reduce accidental activation when pan and pinch are also enabled
- y-domain is based on lows and highs, not open and close only
- `getCandlestickChartDataTable()` returns exact OHLC rows for accessible detail panels and exports
- `getCandlestickChartAccessibilitySummary()` reports latest close, highest high, and lowest low
- `getCandlestickChartFinancialNarrative()` adds close change, percentage change, trading range, and up/down/flat candle counts for app-level financial summaries

This foundation includes preview-grade range selection, controlled pan and pinch-zoom windows, opt-in calendar-aware market-session gap markers, early-close and emergency-closure session markers, and a financial narrative helper. Built-in exchange presets cover regular US equities full-day holidays and regular early-close dates based on the [NYSE published holiday calendar](https://www.nyse.com/markets/hours-calendars). Emergency closure feeds are supported through a pure adapter so apps can keep network and vendor-specific logic outside the chart renderer.
