import "./runtimePrelude";
import "@react-native/js-polyfills/error-guard";
import "react-native/Libraries/Core/InitializeCore";
import { AppRegistry } from "react-native";

import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
