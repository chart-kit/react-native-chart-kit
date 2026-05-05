import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);

const readRepoFile = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const listSourceFiles = async (relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(childRelativePath)));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(childRelativePath);
    }
  }

  return files;
};

const rules = [
  {
    forbidden: [
      /from\s+["']react["']/,
      /from\s+["']react-native(?:\/[^"']*)?["']/,
      /from\s+["']react-native-svg["']/,
      /@chart-kit\/react-native/,
      /@chart-kit\/svg-renderer/,
      /@chart-kit\/skia-renderer/,
      /@chart-kit\/pro/,
      /from\s+["']@shopify\/react-native-skia["']/,
      /require\(["']@shopify\/react-native-skia["']\)/
    ],
    label: "Core package must stay renderer and React agnostic",
    paths: ["packages/core/src"]
  },
  {
    forbidden: [
      /@chart-kit\/pro/,
      /packages\/pro/,
      /from\s+["']@shopify\/react-native-skia["']/,
      /require\(["']@shopify\/react-native-skia["']\)/
    ],
    label: "Free runtime packages must not depend on Pro or Skia runtime code",
    paths: ["packages/react-native/src", "packages/svg-renderer/src", "src"]
  },
  {
    forbidden: [
      /from\s+["']@shopify\/react-native-skia["']/,
      /require\(["']@shopify\/react-native-skia["']\)/
    ],
    label: "Skia renderer must keep Skia as an injected optional peer",
    paths: ["packages/skia-renderer/src"]
  },
  {
    forbidden: [
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /licenseKey/,
      /remoteActivation/,
      /activationUrl/
    ],
    label: "Pro preview package must not contain license activation code yet",
    paths: ["packages/pro/src"]
  }
];

const violations = [];

for (const rule of rules) {
  for (const root of rule.paths) {
    const files = await listSourceFiles(root);

    for (const file of files) {
      const source = await readRepoFile(file);
      const matchingPattern = rule.forbidden.find((pattern) =>
        pattern.test(source)
      );

      if (matchingPattern) {
        violations.push({
          file,
          label: rule.label,
          pattern: matchingPattern.toString()
        });
      }
    }
  }
}

const rootPackageJson = JSON.parse(await readRepoFile("package.json"));
const reactNativePackageJson = JSON.parse(
  await readRepoFile("packages/react-native/package.json")
);
const skiaPackageJson = JSON.parse(
  await readRepoFile("packages/skia-renderer/package.json")
);
const proPackageJson = JSON.parse(
  await readRepoFile("packages/pro/package.json")
);

const assertNoDependency = ({ dependencyName, label, packageJson }) => {
  const dependency =
    packageJson.dependencies?.[dependencyName] ??
    packageJson.optionalDependencies?.[dependencyName] ??
    packageJson.devDependencies?.[dependencyName];

  if (dependency) {
    violations.push({
      file: `${packageJson.name} package.json`,
      label,
      pattern: dependencyName
    });
  }
};

assertNoDependency({
  dependencyName: "@shopify/react-native-skia",
  label: "Root package must not install Skia by default",
  packageJson: rootPackageJson
});

assertNoDependency({
  dependencyName: "@chart-kit/pro",
  label: "Free React Native package must not depend on Pro",
  packageJson: reactNativePackageJson
});

assertNoDependency({
  dependencyName: "@shopify/react-native-skia",
  label: "Free React Native package must not install Skia by default",
  packageJson: reactNativePackageJson
});

if (
  skiaPackageJson.peerDependencies?.["@shopify/react-native-skia"] ===
    undefined ||
  skiaPackageJson.peerDependenciesMeta?.["@shopify/react-native-skia"]
    ?.optional !== true
) {
  violations.push({
    file: "packages/skia-renderer/package.json",
    label: "Skia renderer must expose Skia as an optional peer dependency",
    pattern: "@shopify/react-native-skia"
  });
}

if (
  proPackageJson.dependencies &&
  Object.keys(proPackageJson.dependencies).length > 0
) {
  violations.push({
    file: "packages/pro/package.json",
    label: "Pro preview package should not add runtime dependencies before H4",
    pattern: "dependencies"
  });
}

if (violations.length > 0) {
  console.error("Package boundary check failed.");

  for (const violation of violations) {
    console.error(
      `- ${violation.label}: ${violation.file} matched ${violation.pattern}`
    );
  }

  process.exit(1);
}

console.log("Package boundary check passed.");
console.log("Core package is renderer agnostic.");
console.log("Free runtime packages do not import Pro or Skia runtime code.");
console.log("Skia remains an injected optional peer.");
console.log("Pro preview package has no activation code or runtime deps.");
