import type { GestureResponderEvent } from "react-native";

import type { ChartViewportBounds } from "./types";

export const isChartViewportEventInBounds = ({
  bounds,
  event
}: {
  bounds: ChartViewportBounds;
  event: GestureResponderEvent;
}) => {
  const { locationX, locationY } = event.nativeEvent;

  return (
    locationX >= bounds.x &&
    locationX <= bounds.x + bounds.width &&
    locationY >= bounds.y &&
    locationY <= bounds.y + bounds.height
  );
};
