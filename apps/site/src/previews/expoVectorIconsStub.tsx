import { type StyleProp, View, type ViewStyle } from "react-native";

type IoniconProps = {
  color?: string;
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const Ionicons = ({
  color = "#096bff",
  size = 20,
  style: iconStyle
}: IoniconProps) => (
  <View
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={[
      {
        backgroundColor: color,
        borderRadius: Math.max(2, size * 0.22),
        height: size,
        opacity: 0.9,
        width: size
      },
      iconStyle
    ]}
  />
);

export default Ionicons;
