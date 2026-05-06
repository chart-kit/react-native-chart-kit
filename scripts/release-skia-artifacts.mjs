import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();

const localExists = async (relativePath) => {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
};

const readLocalText = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const isExternalEvidenceLink = (value) => /^https?:\/\//.test(value);

const baselineArtifactName = "skia-local-baseline";
const nativeInstallArtifactName = "skia-native-install";
const rendererBuildArtifactName = "skia-renderer-build";
const requiredBaselineTokens = [
  "Date:",
  "Commit:",
  "Build surface:",
  "local repository checks only",
  "npm run skia:typecheck",
  "npm run skia:parity",
  "npm run boundaries:check",
  "npm run pack:check",
  "Vitest reported",
  "renderer-contract",
  "package boundary",
  "optional peer",
  "Not covered by this local baseline",
  "iOS or Android install",
  "native release-build rendering",
  "native SVG-vs-Skia performance comparison"
];
const requiredNativeInstallTokens = [
  "Date:",
  "Commit:",
  "Build surface: temporary native QA workspace",
  "@shopify/react-native-skia@",
  "Release build successful: yes",
  "This install evidence does not by itself prove renderer parity screenshots",
  "Performance comparison rows still require SVG-vs-Skia timing and memory data"
];
const requiredRendererBuildTokens = [
  ...requiredNativeInstallTokens,
  "Showcase renderer mode: skia",
  "node scripts/prepare-skia-showcase-renderer-preview.mjs",
  "npm --workspace @chart-kit/expo-showcase run typecheck",
  "Showcase renderer mode stayed `skia`",
  "Showcase Skia renderer injected: yes"
];

const missingTokens = (source, tokens) =>
  tokens.filter((token) => !source.includes(token));

const validateLocalBaseline = async ({ artifact, exists, readText, row }) => {
  const errors = [];

  if (isExternalEvidenceLink(artifact) || !artifact.endsWith(".md")) {
    return errors;
  }

  if (!(await exists(artifact))) {
    return errors;
  }

  if (!artifact.includes(baselineArtifactName)) {
    return errors;
  }

  const source = await readText(artifact);
  const missing = missingTokens(source, requiredBaselineTokens);

  if (missing.length > 0) {
    errors.push(
      `${row.id} Skia baseline artifact ${artifact} is missing required fields: ${missing.join(", ")}`
    );
  }

  if (row.status !== "partial") {
    errors.push(
      `${row.id} must not use the local Skia baseline as final evidence`
    );
  }

  return errors;
};

const validateNativeInstallArtifact = async ({
  artifact,
  exists,
  readText,
  row
}) => {
  const errors = [];

  if (isExternalEvidenceLink(artifact) || !artifact.endsWith(".md")) {
    return errors;
  }

  if (!(await exists(artifact))) {
    return errors;
  }

  if (!artifact.includes(nativeInstallArtifactName)) {
    return errors;
  }

  const source = await readText(artifact);
  const platformTokens =
    row.platform === "ios"
      ? ["Platform target: ios", "Skia CocoaPods target autolinked: yes"]
      : ["Platform target: android", "Skia Gradle project configured: yes"];
  const missing = missingTokens(source, [
    ...requiredNativeInstallTokens,
    ...platformTokens
  ]);

  if (missing.length > 0) {
    errors.push(
      `${row.id} Skia native install artifact ${artifact} is missing required fields: ${missing.join(", ")}`
    );
  }

  return errors;
};

const validateRendererBuildArtifact = async ({
  artifact,
  exists,
  readText,
  row
}) => {
  const errors = [];

  if (isExternalEvidenceLink(artifact) || !artifact.endsWith(".md")) {
    return errors;
  }

  if (!(await exists(artifact))) {
    return errors;
  }

  if (!artifact.includes(rendererBuildArtifactName)) {
    return errors;
  }

  const source = await readText(artifact);
  const platformTokens =
    row.platform === "ios"
      ? ["Platform target: ios", "Skia CocoaPods target autolinked: yes"]
      : ["Platform target: android", "Skia Gradle project configured: yes"];
  const missing = missingTokens(source, [
    ...requiredRendererBuildTokens,
    ...platformTokens
  ]);

  if (missing.length > 0) {
    errors.push(
      `${row.id} Skia renderer-build artifact ${artifact} is missing required fields: ${missing.join(", ")}`
    );
  }

  return errors;
};

export const validateSkiaMatrixArtifacts = async (
  matrix,
  { exists = localExists, readText = readLocalText } = {}
) => {
  const errors = [];

  for (const row of matrix.rows ?? []) {
    if (!["partial", "pass"].includes(row.status)) continue;

    const artifacts = Array.isArray(row.evidence)
      ? row.evidence.filter((artifact) => typeof artifact === "string")
      : [];
    const baselineArtifacts = artifacts.filter((artifact) =>
      artifact.includes(baselineArtifactName)
    );
    const rendererBuildArtifacts = artifacts.filter((artifact) =>
      artifact.includes(rendererBuildArtifactName)
    );

    if (
      row.status === "pass" &&
      rendererBuildArtifacts.length > 0 &&
      rendererBuildArtifacts.length === artifacts.length
    ) {
      errors.push(
        `${row.id} must not use Skia renderer-build evidence as final parity or performance evidence`
      );
    }

    for (const artifact of baselineArtifacts) {
      errors.push(
        ...(await validateLocalBaseline({ artifact, exists, readText, row }))
      );
    }

    for (const artifact of artifacts) {
      errors.push(
        ...(await validateNativeInstallArtifact({
          artifact,
          exists,
          readText,
          row
        }))
      );
      errors.push(
        ...(await validateRendererBuildArtifact({
          artifact,
          exists,
          readText,
          row
        }))
      );
    }
  }

  return errors;
};
