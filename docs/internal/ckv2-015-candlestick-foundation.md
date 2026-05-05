# CKV2-015 Candlestick Foundation

Status: foundation complete; H4 still needs to decide Pro packaging and licensing boundaries.

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
- controlled viewport pan and pinch-zoom gestures
- interactive range selector overview
- scrollable viewport mode with initial end positioning
- unit coverage for candle body, wick, direction, and invalid-row handling

Still pending for the broader financial module:

- Pro packaging and licensing decision
