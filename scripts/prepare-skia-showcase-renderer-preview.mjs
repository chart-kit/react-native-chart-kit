import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const repoRoot = process.cwd();

const usage = `Usage:
  node scripts/prepare-skia-showcase-renderer-preview.mjs [options]

Options:
  --app-dir <path>   Expo showcase app directory. Defaults to apps/expo-showcase.
  --help             Show this help.
`;

export const parseSkiaShowcasePreviewArgs = (argv) => {
  const options = {
    appDir: "apps/expo-showcase"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--app-dir") {
      options.appDir = readValue();
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

export const buildSkiaRendererPreviewSource = () => `import { Platform } from "react-native";
import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Line,
  LinearGradient,
  Path,
  Rect,
  RoundedRect,
  Text,
  matchFont,
  rect,
  vec
} from "@shopify/react-native-skia";
import {
  createSkiaRenderer,
  type SkiaFontLike
} from "@chart-kit/skia-renderer";

const fontFamily = Platform.select({
  android: "sans-serif",
  default: "serif",
  ios: "Helvetica"
});
const font = matchFont({ fontFamily, fontSize: 12 }) as unknown as SkiaFontLike;

export const skiaPreviewRenderer = createSkiaRenderer({
  capabilities: {
    maxSurfaceWidth: 8192,
    viewportWindowing: false
  },
  font,
  skia: {
    Canvas,
    Circle,
    DashPathEffect,
    Group,
    Line,
    LinearGradient,
    Path,
    Rect,
    RoundedRect,
    Text,
    rect,
    vec
  }
});
`;

export const injectSkiaRendererIntoAppSource = (source) => {
  let nextSource = source;

  if (!nextSource.includes("./src/skiaPreviewRenderer")) {
    nextSource = nextSource.replace(
      'import { styles } from "./src/appStyles";',
      [
        'import { styles } from "./src/appStyles";',
        'import { skiaPreviewRenderer } from "./src/skiaPreviewRenderer";'
      ].join("\n")
    );
  }

  if (!nextSource.includes("renderer={skiaPreviewRenderer}")) {
    nextSource = nextSource.replaceAll(
      "<ChartKitProvider\n            mode=",
      "<ChartKitProvider\n            renderer={skiaPreviewRenderer}\n            mode="
    );
  }

  return nextSource;
};

export const injectSkiaRendererIntoMetroSource = (source) => {
  if (source.includes('"@chart-kit/skia-renderer"')) {
    return source;
  }

  return source.replace(
    '  "@chart-kit/react-native/pro-preview": path.resolve(\n    repoRoot,\n    "packages/react-native/src/proPreview.ts"\n  ),',
    [
      '  "@chart-kit/react-native/pro-preview": path.resolve(',
      "    repoRoot,",
      '    "packages/react-native/src/proPreview.ts"',
      "  ),",
      '  "@chart-kit/skia-renderer": path.resolve(',
      "    repoRoot,",
      '    "packages/skia-renderer/src/index.ts"',
      "  ),"
    ].join("\n")
  );
};

export const prepareSkiaShowcaseRendererPreview = async ({ appDir }) => {
  const resolvedAppDir = path.resolve(repoRoot, appDir);
  const appPath = path.join(resolvedAppDir, "App.tsx");
  const metroPath = path.join(resolvedAppDir, "metro.config.js");
  const rendererPath = path.join(
    resolvedAppDir,
    "src/skiaPreviewRenderer.ts"
  );
  const appSource = await readFile(appPath, "utf8");
  const metroSource = await readFile(metroPath, "utf8");

  await writeFile(rendererPath, buildSkiaRendererPreviewSource(), "utf8");
  await writeFile(appPath, injectSkiaRendererIntoAppSource(appSource), "utf8");
  await writeFile(
    metroPath,
    injectSkiaRendererIntoMetroSource(metroSource),
    "utf8"
  );

  return {
    appPath,
    metroPath,
    rendererPath
  };
};

const main = async () => {
  const options = parseSkiaShowcasePreviewArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(usage);
    return;
  }

  await prepareSkiaShowcaseRendererPreview(options);
  process.stdout.write("Skia showcase renderer preview injected: yes\n");
};

const isCli = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isCli) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
