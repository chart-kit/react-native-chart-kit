export const money = (value: number) => `$${Math.round(value)}k`;
export const percent = (value: number) => `${Math.round(value)}%`;
export const signedMoney = (value: number) =>
  value < 0 ? `-$${Math.abs(Math.round(value))}k` : `$${Math.round(value)}k`;

export const clampChartWidth = (width: number, max = 460) =>
  Math.max(280, Math.min(max, Math.round(width)));

export const monthRevenue = [
  { month: "Jan", revenue: 42, forecast: 45, retention: 91 },
  { month: "Feb", revenue: 56, forecast: 54, retention: 94 },
  { month: "Mar", revenue: 61, forecast: 63, retention: 96 },
  { month: "Apr", revenue: 75, forecast: 70, retention: 99 },
  { month: "May", revenue: 83, forecast: 82, retention: 101 },
  { month: "Jun", revenue: 96, forecast: 90, retention: 104 }
];

export const signups = [
  { month: "Jan", signups: 320, expansion: 98 },
  { month: "Feb", signups: 410, expansion: 120 },
  { month: "Mar", signups: 365, expansion: 134 },
  { month: "Apr", signups: 520, expansion: 172 },
  { month: "May", signups: 610, expansion: 198 },
  { month: "Jun", signups: 690, expansion: 230 }
];

export const profit = [
  { month: "Jan", profit: -18 },
  { month: "Feb", profit: -6 },
  { month: "Mar", profit: 12 },
  { month: "Apr", profit: 28 },
  { month: "May", profit: 43 },
  { month: "Jun", profit: 35 }
];

export const supportVolume = [
  { channel: "Email", tickets: 42 },
  { channel: "Chat", tickets: 88 },
  { channel: "Voice", tickets: 36 },
  { channel: "Soc", tickets: 62 }
];

export const platformShare = [
  { month: "Jan", ios: 44, android: 38, web: 18 },
  { month: "Feb", ios: 42, android: 40, web: 18 },
  { month: "Mar", ios: 45, android: 37, web: 18 },
  { month: "Apr", ios: 48, android: 34, web: 18 }
];

export const acquisitionShare = [
  { channel: "Organic", value: 44, color: "#00163f" },
  { channel: "Paid", value: 28, color: "#2f5f9f" },
  { channel: "Referral", value: 18, color: "#6f88aa" },
  { channel: "Partner", value: 10, color: "#46566f" }
];

export const revenueMix = [
  { label: "Core", value: 58, color: "#00163f" },
  { label: "Expansion", value: 27, color: "#2f5f9f" },
  { label: "Services", value: 15, color: "#6f88aa" }
];

export const progressRings = [
  { label: "Activation", value: 0.74, color: "#00163f" },
  { label: "Retention", value: 0.62, color: "#2f5f9f" },
  { label: "Expansion", value: 0.48, color: "#6f88aa" }
];

export const contributionValues = Array.from({ length: 84 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 0, 1 + index));
  const wave = Math.sin(index / 4) + Math.cos(index / 9);
  const count = Math.max(0, Math.round((wave + 1.6) * 4));

  return {
    date: date.toISOString().slice(0, 10),
    count
  };
});
