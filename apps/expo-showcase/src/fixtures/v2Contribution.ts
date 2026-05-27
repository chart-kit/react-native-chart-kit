export type ProductUsageDay = {
  date: string;
  count: number;
};

const end = new Date(2026, 4, 3);
const dayInMs = 24 * 60 * 60 * 1000;

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const productUsageEndDate = formatDate(end);
export const productUsageNumDays = 154;
export const quietUsageEndDate = formatDate(end);
export const quietUsageNumDays = 91;
export const quietProductUsage: ProductUsageDay[] = [];
export const productUsage: ProductUsageDay[] = Array.from(
  { length: productUsageNumDays },
  (_, index) => {
    const date = new Date(
      end.valueOf() - (productUsageNumDays - 1 - index) * dayInMs
    );
    const weekday = date.getDay();
    const cycle = (index * 7 + weekday * 3) % 17;
    const launchWeekBoost = index > 110 && index < 126 ? 8 : 0;
    const weekendDip = weekday === 0 || weekday === 6 ? -4 : 0;
    const count = Math.max(0, cycle + launchWeekBoost + weekendDip);

    return {
      date: formatDate(date),
      count
    };
  }
);
