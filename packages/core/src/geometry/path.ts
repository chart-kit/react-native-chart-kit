const DECIMAL_PLACES = 6;

export const formatPathNumber = (value: number): string => {
  const rounded = Number(value.toFixed(DECIMAL_PLACES));

  if (Object.is(rounded, -0)) {
    return "0";
  }

  return String(rounded);
};

export const pointCommand = (command: "M" | "L", x: number, y: number) => {
  return `${command} ${formatPathNumber(x)} ${formatPathNumber(y)}`;
};

export const cubicCommand = (
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  x: number,
  y: number
) => {
  return [
    "C",
    formatPathNumber(c1x),
    formatPathNumber(c1y),
    formatPathNumber(c2x),
    formatPathNumber(c2y),
    formatPathNumber(x),
    formatPathNumber(y)
  ].join(" ");
};

export const horizontalCommand = (x: number) => `H ${formatPathNumber(x)}`;

export const verticalCommand = (y: number) => `V ${formatPathNumber(y)}`;
