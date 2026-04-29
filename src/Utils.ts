import { ViewStyle } from "react-native";
import { NumberProp } from "react-native-svg";

export function getNumberProp(
  value: ViewStyle["borderRadius"] | undefined,
  fallback: NumberProp = 0
): NumberProp {
  return typeof value === "number" || typeof value === "string"
    ? value
    : fallback;
}

export function mapValue(
  x: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
