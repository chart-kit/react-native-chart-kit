import type {
  LegendLayout,
  LegendLayoutItem,
  LegendLayoutOptions
} from "./types";

export const layoutLegend = ({
  items,
  position = "bottom",
  maxWidth,
  itemGap = 12,
  rowGap = 8,
  padding = 0
}: LegendLayoutOptions): LegendLayout => {
  const layoutItems: LegendLayoutItem[] = [];
  let cursorX = padding;
  let cursorY = padding;
  let rowHeight = 0;
  let width = padding;

  items.forEach((item) => {
    const markerSize = item.markerSize ?? 10;
    const itemWidth = markerSize + 4 + item.labelWidth;
    const itemHeight = Math.max(markerSize, item.labelHeight);

    if (cursorX > padding && cursorX + itemWidth > maxWidth - padding) {
      cursorX = padding;
      cursorY += rowHeight + rowGap;
      rowHeight = 0;
    }

    layoutItems.push({
      ...item,
      x: cursorX,
      y: cursorY,
      width: itemWidth,
      height: itemHeight
    });

    cursorX += itemWidth + itemGap;
    rowHeight = Math.max(rowHeight, itemHeight);
    width = Math.max(width, cursorX - itemGap + padding);
  });

  return {
    position,
    width: Math.min(maxWidth, width),
    height: items.length === 0 ? 0 : cursorY + rowHeight + padding,
    items: layoutItems
  };
};
