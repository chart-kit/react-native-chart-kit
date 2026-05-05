export type StockCandlePoint = {
  close: number;
  day: string;
  high: number;
  low: number;
  open: number;
  volume: number;
};

export const stockCandles: StockCandlePoint[] = [
  { day: "Jun 3", open: 186, high: 193, low: 184, close: 191, volume: 52 },
  { day: "Jun 4", open: 191, high: 195, low: 187, close: 189, volume: 61 },
  { day: "Jun 5", open: 189, high: 197, low: 188, close: 196, volume: 74 },
  { day: "Jun 6", open: 196, high: 199, low: 190, close: 192, volume: 68 },
  { day: "Jun 7", open: 192, high: 203, low: 191, close: 201, volume: 83 },
  { day: "Jun 10", open: 201, high: 207, low: 198, close: 205, volume: 77 },
  { day: "Jun 11", open: 205, high: 209, low: 199, close: 201, volume: 91 },
  { day: "Jun 12", open: 201, high: 211, low: 200, close: 209, volume: 96 }
];
