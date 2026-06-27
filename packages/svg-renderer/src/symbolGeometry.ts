export const createSvgSymbolDiamondPath = ({
  size,
  x,
  y
}: {
  x: number;
  y: number;
  size: number;
}) => {
  const radius = size / 2;

  return [
    `M ${x} ${y - radius}`,
    `L ${x + radius} ${y}`,
    `L ${x} ${y + radius}`,
    `L ${x - radius} ${y}`,
    "Z"
  ].join(" ");
};
