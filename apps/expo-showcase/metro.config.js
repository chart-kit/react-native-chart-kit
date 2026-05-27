/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [repoRoot];
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(repoRoot, "node_modules")
];
config.resolver.extraNodeModules = {
  "@chart-kit/core": path.resolve(repoRoot, "packages/core/src/index.ts"),
  "react-native-chart-kit": path.resolve(repoRoot, "src/index.ts"),
  "@chart-kit/svg-renderer": path.resolve(
    repoRoot,
    "packages/svg-renderer/src/index.ts"
  ),
  "react-native-chart-kit/v2": path.resolve(
    repoRoot,
    "packages/react-native/src/index.ts"
  )
};

module.exports = config;
