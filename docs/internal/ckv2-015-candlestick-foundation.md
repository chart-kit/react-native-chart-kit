# CKV2-015 Candlestick Foundation

Status: foundation complete for Developer Preview; H4 approved the Pro-candidate
boundary and keeps CandlestickChart labeled as Financial Preview.

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
- US equities full-day and early-close exchange presets
- emergency-closure feed adapter
- financial narrative helper
- unit coverage for candle body, wick, direction, and invalid-row handling

Still pending for the broader financial module:

- H6 Pro and Skia package plan approval before any stable paid-package claim
- final release-claim wording for financial charts
