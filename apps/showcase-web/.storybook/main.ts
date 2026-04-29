import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-native-web-vite";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, "../../..");

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {
      modulesToTranspile: ["@chart-kit/react-native", "react-native-svg"]
    }
  },
  viteFinal: async (viteConfig) => {
    const existingAlias = viteConfig.resolve?.alias ?? [];
    const alias = Array.isArray(existingAlias)
      ? existingAlias
      : Object.entries(existingAlias).map(([find, replacement]) => ({
          find,
          replacement
        }));

    return {
      ...viteConfig,
      define: {
        ...viteConfig.define,
        __DEV__: true
      },
      resolve: {
        ...viteConfig.resolve,
        alias: [
          ...alias,
          {
            find: /^react-native$/,
            replacement: "react-native-web"
          },
          {
            find: /^@chart-kit\/react-native$/,
            replacement: path.resolve(repoRoot, "src/index.ts")
          }
        ]
      }
    };
  }
};

export default config;
