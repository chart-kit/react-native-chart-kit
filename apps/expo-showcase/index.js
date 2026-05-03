import "react-native-gesture-handler";

import { registerRootComponent } from "expo";
import { createElement } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import App from "./App";

const gestureRootStyle = { flex: 1 };

const Root = () =>
  createElement(
    GestureHandlerRootView,
    { style: gestureRootStyle },
    createElement(App)
  );

registerRootComponent(Root);
