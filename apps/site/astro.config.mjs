import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import { chartKitMarkdownPatches } from "./src/lib/starlight-markdown-patches.mjs";

import tailwindcss from "@tailwindcss/vite";

const repositoryUrl = "https://github.com/indiespirit/react-native-chart-kit";
const packageSource = (packagePath) =>
  fileURLToPath(new URL(`../../packages/${packagePath}`, import.meta.url));
const nodeModuleSource = (packagePath) =>
  fileURLToPath(new URL(`../../node_modules/${packagePath}`, import.meta.url));
const localSource = (packagePath) =>
  fileURLToPath(new URL(packagePath, import.meta.url));
const reactNativeWebStub = localSource("./src/previews/reactNativeWebStub.tsx");
const reactNativeGestureHandlerStub = localSource(
  "./src/previews/reactNativeGestureHandlerStub.tsx"
);
const expoVectorIconsStub = localSource(
  "./src/previews/expoVectorIconsStub.tsx"
);
const svgTransformParserStub = localSource(
  "./src/previews/svgTransformParserStub.ts"
);

const chartKitPreviewWebAliases = () => ({
  name: "chart-kit-preview-web-aliases",
  enforce: "pre",
  resolveId(source, importer) {
    if (source === "react-native") {
      return reactNativeWebStub;
    }

    if (source === "react-native-gesture-handler") {
      return reactNativeGestureHandlerStub;
    }

    if (source === "@expo/vector-icons/Ionicons") {
      return expoVectorIconsStub;
    }

    if (source === "react-native-chart-kit") {
      return packageSource("react-native/src/index.ts");
    }

    if (
      importer?.includes(
        "react-native-svg/lib/module/lib/extract/extractTransform"
      ) &&
      (source === "./transform" || source === "./transformToRn")
    ) {
      return svgTransformParserStub;
    }
  }
});

export default defineConfig({
  devToolbar: {
    enabled: false
  },
  integrations: [
    react(),
    starlight({
      title: "React Native Chart Kit",
      description:
        "Composable React Native charts with SVG defaults, interaction primitives, and migration-friendly APIs.",
      components: {
        Head: "./src/components/Head.astro"
      },
      customCss: ["./src/styles/global.css", "./src/styles/starlight.css"],
      disable404Route: true,
      editLink: {
        baseUrl: `${repositoryUrl}/edit/master/docs/`
      },
      sidebar: [
        {
          label: "Start",
          items: [{ slug: "docs/getting-started/installation" }]
        },
        {
          label: "Charts",
          items: [
            { slug: "docs/charts/line" },
            { slug: "docs/charts/area" },
            { slug: "docs/charts/bar" },
            { slug: "docs/charts/pie" },
            { slug: "docs/charts/donut" },
            { slug: "docs/charts/progress" },
            { slug: "docs/charts/contribution-heatmap" }
          ]
        },
        {
          label: "Guides",
          items: [
            { slug: "docs/charts/themes" },
            { slug: "docs/charts/accessibility" },
            { slug: "docs/troubleshooting" },
            { slug: "docs/recipes" }
          ]
        },
        {
          label: "Migration",
          items: [
            { slug: "docs/migration/from-v1" },
            { slug: "docs/migration/prop-mapping" }
          ]
        }
      ],
      social: [{ icon: "github", label: "GitHub", href: repositoryUrl }],
      plugins: [chartKitMarkdownPatches()]
    })
  ],
  vite: {
    plugins: [chartKitPreviewWebAliases(), tailwindcss()],
    optimizeDeps: {
      exclude: [
        "@chart-kit/core",
        "@chart-kit/svg-renderer",
        "react-native",
        "react-native-chart-kit",
        "react-native-chart-kit/v2",
        "react-native-gesture-handler",
        "react-native-svg"
      ]
    },
    resolve: {
      alias: [
        {
          find: /^react-native-chart-kit$/,
          replacement: packageSource("react-native/src/index.ts")
        },
        {
          find: /^react-native-chart-kit\/v2$/,
          replacement: packageSource("react-native/src/index.ts")
        },
        {
          find: /^@chart-kit\/core$/,
          replacement: packageSource("core/src/index.ts")
        },
        {
          find: /^@chart-kit\/svg-renderer$/,
          replacement: packageSource("svg-renderer/src/index.ts")
        },
        {
          find: /^react-native$/,
          replacement: reactNativeWebStub
        },
        {
          find: /^react-native-svg$/,
          replacement: nodeModuleSource(
            "react-native-svg/lib/module/elements.web.js"
          )
        },
        {
          find: /^react-native-gesture-handler$/,
          replacement: reactNativeGestureHandlerStub
        },
        {
          find: /^@expo\/vector-icons\/Ionicons$/,
          replacement: expoVectorIconsStub
        },
        {
          find: /^@react-native\/normalize-colors$/,
          replacement: localSource("./src/previews/normalizeColorsStub.ts")
        },
        {
          find: /^@react-native\/assets-registry\/registry$/,
          replacement: localSource("./src/previews/assetsRegistryStub.ts")
        },
        {
          find: /react-native-svg\/lib\/module\/lib\/extract\/transform(?:\.js)?$/,
          replacement: svgTransformParserStub
        },
        {
          find: /react-native-svg\/lib\/module\/lib\/extract\/transformToRn(?:\.js)?$/,
          replacement: svgTransformParserStub
        }
      ],
      dedupe: ["react", "react-dom", "react-native-web", "react-native-svg"],
      extensions: [
        ".web.mjs",
        ".web.js",
        ".web.ts",
        ".web.tsx",
        ".mjs",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json"
      ]
    },
    server: {
      fs: {
        allow: ["../.."]
      }
    }
  }
});
