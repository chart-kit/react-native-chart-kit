import { SvgCircle, SvgLine, SvgPath, SvgRect } from "./primitives";
import { createSvgSymbolDiamondPath } from "./symbolGeometry";
import type { SvgSymbolProps } from "./types";

export const SvgSymbol = ({
  cornerRadius,
  fill,
  opacity,
  shape,
  size,
  stroke,
  strokeLinecap = "round",
  strokeWidth,
  testID,
  x,
  y
}: SvgSymbolProps) => {
  const paintProps = {
    ...(testID ? { testID } : {}),
    ...(fill ? { fill } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(stroke ? { stroke } : {}),
    ...(strokeWidth !== undefined ? { strokeWidth } : {})
  };
  const lineStroke = stroke ?? fill;

  if (shape === "line") {
    return (
      <SvgLine
        x1={x - size / 2}
        x2={x + size / 2}
        y1={y}
        y2={y}
        strokeLinecap={strokeLinecap}
        strokeWidth={strokeWidth ?? 2}
        {...(testID ? { testID } : {})}
        {...(lineStroke ? { stroke: lineStroke } : {})}
        {...(opacity !== undefined ? { opacity } : {})}
      />
    );
  }

  if (shape === "square") {
    return (
      <SvgRect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        rx={cornerRadius ?? Math.min(3, size * 0.225)}
        {...paintProps}
      />
    );
  }

  if (shape === "diamond") {
    return (
      <SvgPath d={createSvgSymbolDiamondPath({ x, y, size })} {...paintProps} />
    );
  }

  return <SvgCircle cx={x} cy={y} r={size / 2} {...paintProps} />;
};
