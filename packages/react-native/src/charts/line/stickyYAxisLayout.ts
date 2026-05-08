export const getStickyYAxisBackgroundHeight = ({
  fadeY,
  mainHeight
}: {
  fadeY: number;
  mainHeight: number;
}) => Math.min(mainHeight, fadeY + 4);

export const getStickyYAxisFadeOpacity = (scrollOffset: number) =>
  scrollOffset > 0.5 ? 1 : 0;
