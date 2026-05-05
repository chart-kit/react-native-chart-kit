# CKV2-015 Candlestick Foundation

Status: in progress

Implemented in this slice:

- renderer-agnostic candlestick geometry in core
- SVG CandlestickChart component
- OHLC row projection with high/low domain calculation
- up, down, and flat candle colors
- Expo showcase price-action story
- OHLC accessibility summary and data table helpers
- tap selection events
- theme-aware OHLC tooltip
- vertical inspection line and close-price badge
- opt-in volume overlay bars
- viewport windowing with source data indexes preserved
- unit coverage for candle body, wick, direction, and invalid-row handling

Still pending for the broader financial module:

- range selector integration
- scroll, pan, and pinch zoom
- Pro packaging and licensing decision
