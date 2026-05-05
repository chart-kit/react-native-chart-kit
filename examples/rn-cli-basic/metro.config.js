/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "../..");

module.exports = {
  projectRoot,
  watchFolders: [repoRoot],
  resolver: {
    disableHierarchicalLookup: true,
    extraNodeModules: {
      "@chart-kit/core": path.resolve(repoRoot, "packages/core/src/index.ts"),
      "@chart-kit/react-native": path.resolve(
        repoRoot,
        "packages/react-native/src/index.ts"
      ),
      "@chart-kit/svg-renderer": path.resolve(
        repoRoot,
        "packages/svg-renderer/src/index.ts"
      ),
      "react-native-chart-kit": path.resolve(repoRoot, "src/index.ts")
    },
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(repoRoot, "node_modules")
    ]
  },
  transformer: {
    babelTransformerPath: require.resolve("metro-babel-transformer")
  }
};
