export const money = (value: number) => `$${Math.round(value)}k`;
export const percent = (value: number) => `${Math.round(value)}%`;
export const signedMoney = (value: number) =>
  value < 0 ? `-$${Math.abs(Math.round(value))}k` : `$${Math.round(value)}k`;

export const clampChartWidth = (width: number, max = 460) =>
  Math.max(280, Math.min(max, Math.round(width)));

export const monthRevenue = [
  { month: "Jan", revenue: 52, forecast: 236, retention: 62 },
  { month: "Feb", revenue: 86, forecast: 218, retention: 138 },
  { month: "Mar", revenue: 58, forecast: 201, retention: 74 },
  { month: "Apr", revenue: 134, forecast: 182, retention: 151 },
  { month: "May", revenue: 95, forecast: 164, retention: 89 },
  { month: "Jun", revenue: 176, forecast: 148, retention: 122 },
  { month: "Jul", revenue: 126, forecast: 132, retention: 55 },
  { month: "Aug", revenue: 218, forecast: 116, retention: 164 },
  { month: "Sep", revenue: 164, forecast: 101, retention: 96 },
  { month: "Oct", revenue: 252, forecast: 88, retention: 145 },
  { month: "Nov", revenue: 198, forecast: 73, retention: 78 },
  { month: "Dec", revenue: 286, forecast: 62, retention: 172 }
];

export const signups = [
  { month: "Jan", signups: 180, expansion: 60, organic: 28, paid: 62 },
  { month: "Feb", signups: 520, expansion: 210, organic: 74, paid: 34 },
  { month: "Mar", signups: 260, expansion: 120, organic: 39, paid: 88 },
  { month: "Apr", signups: 740, expansion: 330, organic: 96, paid: 41 },
  { month: "May", signups: 390, expansion: 170, organic: 54, paid: 103 },
  { month: "Jun", signups: 860, expansion: 410, organic: 118, paid: 58 }
];

export const profit = [
  { month: "Jan", profit: 38 },
  { month: "Feb", profit: -28 },
  { month: "Mar", profit: 64 },
  { month: "Apr", profit: -42 },
  { month: "May", profit: 81 },
  { month: "Jun", profit: -18 }
];

export const supportVolume = [
  { channel: "Chat", tickets: 95 },
  { channel: "Email", tickets: 37 },
  { channel: "Phone", tickets: 68 },
  { channel: "Social", tickets: 24 },
  { channel: "Community", tickets: 113 }
];

export const platformShare = [
  { month: "Jan", ios: 62, android: 25, web: 13 },
  { month: "Feb", ios: 38, android: 47, web: 15 },
  { month: "Mar", ios: 55, android: 21, web: 24 },
  { month: "Apr", ios: 29, android: 58, web: 13 },
  { month: "May", ios: 68, android: 19, web: 13 },
  { month: "Jun", ios: 44, android: 31, web: 25 }
];

export const acquisitionShare = [
  { channel: "Organic search", value: 42, color: "#00163f" },
  { channel: "Paid social", value: 24, color: "#2f5f9f" },
  { channel: "Referrals", value: 18, color: "#6f88aa" },
  { channel: "Partners", value: 10, color: "#46566f" },
  { channel: "Lifecycle", value: 6, color: "#9aa8bd" }
];

export const revenueMix = [
  { label: "Enterprise", value: 680, color: "#00163f" },
  { label: "Business", value: 420, color: "#2f5f9f" },
  { label: "Teams", value: 260, color: "#6f88aa" },
  { label: "Starter", value: 140, color: "#9aa8bd" }
];

export const progressRings = [
  { label: "Build signed", value: 0.76, color: "#00163f" },
  { label: "QA pass", value: 0, color: "#2f5f9f" },
  { label: "Rollout cap", value: 0.42, color: "#6f88aa" }
];

export const contributionEndDate = "2026-05-03";
export const contributionNumDays = 154;

export const contributionValues = Array.from(
  { length: contributionNumDays },
  (_, index) => {
    const end = new Date(`${contributionEndDate}T00:00:00.000Z`);
    const date = new Date(
      end.valueOf() - (contributionNumDays - 1 - index) * 24 * 60 * 60 * 1000
    );
    const weekday = date.getUTCDay();
    const cycle = (index * 7 + weekday * 3) % 17;
    const launchWeekBoost = index > 110 && index < 126 ? 8 : 0;
    const weekendDip = weekday === 0 || weekday === 6 ? -4 : 0;
    const count = Math.max(0, cycle + launchWeekBoost + weekendDip);

    return {
      date: date.toISOString().slice(0, 10),
      count
    };
  }
);

export const candlebarPrices = [
  { date: "09:30", open: 184, high: 196, low: 179, close: 191, volume: 42 },
  { date: "10:00", open: 191, high: 208, low: 188, close: 202, volume: 68 },
  { date: "10:30", open: 202, high: 206, low: 185, close: 189, volume: 74 },
  { date: "11:00", open: 189, high: 215, low: 186, close: 211, volume: 95 },
  { date: "11:30", open: 211, high: 226, low: 204, close: 219, volume: 88 },
  { date: "12:00", open: 219, high: 221, low: 198, close: 204, volume: 81 },
  { date: "12:30", open: 204, high: 232, low: 201, close: 228, volume: 118 },
  { date: "13:00", open: 228, high: 236, low: 214, close: 217, volume: 101 },
  { date: "13:30", open: 217, high: 244, low: 216, close: 239, volume: 132 },
  { date: "14:00", open: 239, high: 248, low: 226, close: 231, volume: 109 },
  { date: "14:30", open: 231, high: 252, low: 229, close: 247, volume: 124 },
  { date: "15:00", open: 247, high: 258, low: 236, close: 241, volume: 116 }
];

export const radarBenchmarks = [
  { metric: "Speed", current: 82, target: 92, industry: 68 },
  { metric: "Polish", current: 76, target: 88, industry: 61 },
  { metric: "A11y", current: 90, target: 94, industry: 72 },
  { metric: "Depth", current: 68, target: 84, industry: 55 },
  { metric: "Control", current: 86, target: 91, industry: 65 },
  { metric: "Export", current: 72, target: 86, industry: 58 }
];

export const comboRevenue = [
  { month: "Jan", revenue: 420, forecast: 480, margin: 128 },
  { month: "Feb", revenue: 560, forecast: 530, margin: 168 },
  { month: "Mar", revenue: 490, forecast: 610, margin: 151 },
  { month: "Apr", revenue: 720, forecast: 690, margin: 214 },
  { month: "May", revenue: 640, forecast: 760, margin: 193 },
  { month: "Jun", revenue: 880, forecast: 840, margin: 276 },
  { month: "Jul", revenue: 790, forecast: 920, margin: 244 },
  { month: "Aug", revenue: 1040, forecast: 980, margin: 331 }
];
