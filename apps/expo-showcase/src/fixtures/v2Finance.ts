export type StockCandlePoint = {
  close: number;
  day: string;
  high: number;
  low: number;
  open: number;
  volume: number;
};

export const stockCandles: StockCandlePoint[] = [
  { day: "2026-06-03", open: 186, high: 193, low: 184, close: 191, volume: 52 },
  { day: "2026-06-04", open: 191, high: 195, low: 187, close: 189, volume: 61 },
  { day: "2026-06-05", open: 189, high: 197, low: 188, close: 196, volume: 74 },
  { day: "2026-06-08", open: 196, high: 199, low: 190, close: 192, volume: 68 },
  { day: "2026-06-09", open: 192, high: 203, low: 191, close: 201, volume: 83 },
  { day: "2026-06-10", open: 201, high: 207, low: 198, close: 205, volume: 77 },
  { day: "2026-06-11", open: 205, high: 209, low: 199, close: 201, volume: 91 },
  { day: "2026-06-12", open: 201, high: 211, low: 200, close: 209, volume: 96 }
];
