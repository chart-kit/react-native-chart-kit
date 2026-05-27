export type RevenuePoint = {
  month: string;
  actual: number | null;
  forecast?: number | null;
};

export type PricePoint = {
  date: Date;
  price: number | null;
};

export type EquityComparisonPoint = {
  date: Date;
  msft: number;
  goog: number;
};

export type PortfolioRangePoint = {
  date: Date;
  portfolio: number;
  benchmark: number;
};

export type SubscriptionPoint = {
  month: string;
  revenue: number;
  netRetention: number;
};

export type PlanAttainmentPoint = {
  month: string;
  attainment: number;
};

export const basicRevenue: RevenuePoint[] = [
  { month: "Jan", actual: 18 },
  { month: "Feb", actual: 34 },
  { month: "Mar", actual: 29 },
  { month: "Apr", actual: 52 },
  { month: "May", actual: 46 },
  { month: "Jun", actual: 68 }
];

export const subscriptionMetrics: SubscriptionPoint[] = [
  { month: "Jan", revenue: 124, netRetention: 102 },
  { month: "Feb", revenue: 132, netRetention: 104 },
  { month: "Mar", revenue: 141, netRetention: 106 },
  { month: "Apr", revenue: 146, netRetention: 105 },
  { month: "May", revenue: 158, netRetention: 108 },
  { month: "Jun", revenue: 166, netRetention: 109 },
  { month: "Jul", revenue: 172, netRetention: 111 },
  { month: "Aug", revenue: 181, netRetention: 110 },
  { month: "Sep", revenue: 190, netRetention: 112 },
  { month: "Oct", revenue: 197, netRetention: 113 },
  { month: "Nov", revenue: 205, netRetention: 114 },
  { month: "Dec", revenue: 216, netRetention: 116 }
];

export const planAttainment: PlanAttainmentPoint[] = [
  { month: "Jan", attainment: 82 },
  { month: "Feb", attainment: 88 },
  { month: "Mar", attainment: 91 },
  { month: "Apr", attainment: 96 },
  { month: "May", attainment: 101 },
  { month: "Jun", attainment: 99 },
  { month: "Jul", attainment: 104 },
  { month: "Aug", attainment: 108 },
  { month: "Sep", attainment: 103 },
  { month: "Oct", attainment: 97 },
  { month: "Nov", attainment: 101 },
  { month: "Dec", attainment: 112 }
];

export const multiSeriesRevenue: RevenuePoint[] = [
  { month: "Jan", actual: 22, forecast: 18 },
  { month: "Feb", actual: 31, forecast: 28 },
  { month: "Mar", actual: 38, forecast: 36 },
  { month: "Apr", actual: 44, forecast: 42 },
  { month: "May", actual: 57, forecast: 51 },
  { month: "Jun", actual: 64, forecast: 59 }
];

export const revenueWithGaps: RevenuePoint[] = [
  { month: "Jan", actual: 18 },
  { month: "Feb", actual: null },
  { month: "Mar", actual: 33 },
  { month: "Apr", actual: 41 },
  { month: "May", actual: null },
  { month: "Jun", actual: 62 }
];

export const denseRevenue: RevenuePoint[] = [
  { month: "Week 1", actual: 12 },
  { month: "Week 2", actual: 18 },
  { month: "Week 3", actual: 17 },
  { month: "Week 4", actual: 24 },
  { month: "Week 5", actual: 31 },
  { month: "Week 6", actual: 29 },
  { month: "Week 7", actual: 35 },
  { month: "Week 8", actual: 43 },
  { month: "Week 9", actual: 39 },
  { month: "Week 10", actual: 47 },
  { month: "Week 11", actual: 52 },
  { month: "Week 12", actual: 58 }
];

export const longRangeRevenue: RevenuePoint[] = [
  { month: "January 2026", actual: 18 },
  { month: "February 2026", actual: 24 },
  { month: "March 2026", actual: 31 },
  { month: "April 2026", actual: 38 },
  { month: "May 2026", actual: 45 },
  { month: "June 2026", actual: 51 },
  { month: "July 2026", actual: 57 },
  { month: "August 2026", actual: 64 }
];

export const sixMonthRevenue: RevenuePoint[] = [
  { month: "Jan 26", actual: 18 },
  { month: "Feb 26", actual: 25 },
  { month: "Mar 26", actual: 33 },
  { month: "Apr 26", actual: 41 },
  { month: "May 26", actual: 52 },
  { month: "Jun 26", actual: 61 }
];

export const priceHistory: PricePoint[] = [
  { date: new Date(2026, 0, 1), price: 121 },
  { date: new Date(2026, 0, 3), price: 126 },
  { date: new Date(2026, 0, 8), price: 119 },
  { date: new Date(2026, 0, 15), price: 134 },
  { date: new Date(2026, 0, 24), price: 142 },
  { date: new Date(2026, 1, 1), price: 138 }
];

const tradingDayOffsets = [
  0, 1, 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 20, 21, 22, 23, 26, 27, 28, 29,
  30, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 47, 48, 49, 50, 51, 54, 55, 56,
  57, 58, 61, 62, 63, 64, 65, 68, 69, 70, 71, 72
];

const stockPrices = [
  182, 184, 181, 187, 191, 189, 194, 198, 195, 199, 204, 207, 205, 211, 216,
  219, 217, 224, 228, 226, 231, 235, 238, 234, 241, 246, 249, 252, 250, 257,
  263, 261, 268, 272, 276, 273, 281, 286, 290, 287, 294, 301, 306, 302, 311,
  316, 321, 319, 327, 334, 338, 343
];

export const scrollablePriceHistory: PricePoint[] = stockPrices.map(
  (price, index) => ({
    date: new Date(2025, 10, 3 + tradingDayOffsets[index]!),
    price
  })
);

const msftPrices = [
  414, 418, 416, 421, 426, 424, 430, 433, 428, 435, 439, 444, 441, 447, 452,
  456, 453, 459, 464, 461, 468, 472, 476, 471, 479, 485, 489, 493, 490, 497,
  503, 500, 507, 512, 516, 513, 521, 527, 532, 528, 536, 541, 547, 543, 552,
  558, 563, 560, 568, 574, 579, 584
];

const googPrices = [
  168, 170, 169, 172, 176, 174, 178, 181, 179, 183, 186, 188, 187, 191, 194,
  197, 195, 199, 203, 201, 205, 208, 211, 209, 214, 218, 220, 224, 222, 227,
  231, 230, 235, 238, 242, 240, 245, 249, 253, 251, 256, 260, 265, 263, 268,
  272, 276, 274, 280, 285, 289, 293
];

export const msftVsGoogHistory: EquityComparisonPoint[] = msftPrices.map(
  (msft, index) => ({
    date: new Date(2025, 10, 3 + tradingDayOffsets[index]!),
    goog: googPrices[index]!,
    msft
  })
);

const portfolioValues = [
  512, 529, 501, 548, 536, 572, 524, 561, 589, 552, 606, 581, 545, 627, 594,
  650, 612, 638, 681, 619, 696, 662, 721, 675, 742, 701, 768, 724, 791, 735,
  815, 762, 842, 780, 870, 811, 894, 829, 925, 858, 908, 872, 948, 891, 982,
  924, 961, 907, 1008, 944, 1036, 972
];

const benchmarkValues = [
  468, 472, 466, 481, 477, 489, 474, 486, 496, 488, 503, 498, 486, 510, 502,
  519, 508, 516, 529, 512, 536, 526, 543, 532, 552, 541, 561, 548, 569, 553,
  578, 563, 587, 571, 598, 584, 606, 589, 617, 602, 611, 604, 624, 609, 637,
  621, 632, 616, 646, 629, 657, 641
];

export const portfolioRangeHistory: PortfolioRangePoint[] = portfolioValues.map(
  (portfolio, index) => ({
    benchmark: benchmarkValues[index]!,
    date: new Date(2025, 10, 3 + tradingDayOffsets[index]!),
    portfolio
  })
);
