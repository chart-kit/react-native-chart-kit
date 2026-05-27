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
  padding = 0,
  labelGap = 4,
  itemPaddingHorizontal = 0,
  itemPaddingVertical = 0
}: LegendLayoutOptions): LegendLayout => {
  const layoutItems: LegendLayoutItem[] = [];
  let cursorX = padding;
  let cursorY = padding;
  let rowHeight = 0;
  let width = padding;

  items.forEach((item) => {
    const markerSize = item.markerSize ?? 10;
    const contentWidth = markerSize + labelGap + item.labelWidth;
    const contentHeight = Math.max(markerSize, item.labelHeight);
    const itemWidth = contentWidth + itemPaddingHorizontal * 2;
    const itemHeight = contentHeight + itemPaddingVertical * 2;

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
      height: itemHeight,
      contentX: cursorX + itemPaddingHorizontal,
      contentY: cursorY + itemPaddingVertical,
      contentWidth,
      contentHeight
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
