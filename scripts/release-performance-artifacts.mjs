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

const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString("en-US") : String(value);

const requiredBaseTokens = [
  "Date:",
  "Commit:",
  "Package version:",
  "Platform:",
  "Build:",
  "Renderer:",
  "Scenario:",
  "Showcase story:",
  "Deep link:",
  "Expected fixture:",
  "Device:",
  "Commands used:",
  "Artifact:",
  "Notes:",
  "Screenshot:"
];

const requiredAndroidTokens = [
  "adb shell am start -W",
  "adb shell dumpsys gfxinfo",
  "adb shell dumpsys meminfo",
  "Launch timing:",
  "Frame timing:",
  "Janky frames",
  "Memory:"
];

const requiredIosTokens = [
  "xcrun simctl openurl",
  "xcrun simctl io",
  "Launch timing:",
  "simctl openurl command elapsed",
  "Memory:",
  "RSS",
  "does not replace Instruments"
];

const hasScreenshotLink = (source) =>
  /Screenshot:\s*\[[^\]]+\.png\]\([^)]+\.png\)/.test(source);

const missingTokens = (source, tokens) =>
  tokens.filter((token) => !source.includes(token));

const validateFixture = ({ errors, row, scenario, source }) => {
  const metrics = scenario?.expectedStoryMetrics;
  if (!metrics) return;

  const expectedTokens = [
    `Chart type: ${metrics.chartType}`,
    `Total points: ${formatNumber(metrics.totalPoints)}`,
    `Visible points: ${formatNumber(metrics.visiblePoints)}`,
    `Series count: ${formatNumber(metrics.seriesCount)}`
  ];
  const missing = missingTokens(source, expectedTokens);

  if (missing.length > 0) {
    errors.push(
      `${row.id} performance artifact is missing fixture metrics: ${missing.join(", ")}`
    );
  }
};

const validatePerformanceArtifact = async ({
  artifact,
  exists,
  readText,
  row,
  scenario
}) => {
  const errors = [];

  if (isExternalEvidenceLink(artifact) || !artifact.endsWith(".md")) {
    return errors;
  }

  if (!(await exists(artifact))) {
    return errors;
  }

  const source = await readText(artifact);
  const requiredTokens =
    row.platform === "android"
      ? [...requiredBaseTokens, ...requiredAndroidTokens]
      : row.platform === "ios"
        ? [...requiredBaseTokens, ...requiredIosTokens]
        : requiredBaseTokens;
  const missing = missingTokens(source, requiredTokens);

  if (missing.length > 0) {
    errors.push(
      `${row.id} performance artifact ${artifact} is missing required fields: ${missing.join(", ")}`
    );
  }

  for (const value of [
    row.id,
    row.platform,
    row.renderer,
    scenario?.label,
    scenario?.showcaseStoryId
  ].filter(Boolean)) {
    if (!source.includes(value)) {
      errors.push(`${row.id} performance artifact ${artifact} omits ${value}`);
    }
  }

  if (!hasScreenshotLink(source)) {
    errors.push(
      `${row.id} performance artifact ${artifact} must link a PNG screenshot`
    );
  }

  if (row.status === "partial" && !source.includes("physical-device")) {
    errors.push(
      `${row.id} partial performance artifact must state the device caveat`
    );
  }

  validateFixture({ errors, row, scenario, source });

  return errors;
};

export const validatePerformanceMatrixArtifacts = async (
  matrix,
  { exists = localExists, readText = readLocalText } = {}
) => {
  const errors = [];
  const scenarios = new Map(
    (matrix.scenarios ?? []).map((scenario) => [scenario.id, scenario])
  );

  for (const row of matrix.rows ?? []) {
    if (!["partial", "pass"].includes(row.status)) continue;

    const artifacts = Array.isArray(row.evidence)
      ? row.evidence.filter((artifact) => typeof artifact === "string")
      : [];
    const localMarkdownArtifacts = artifacts.filter(
      (artifact) =>
        !isExternalEvidenceLink(artifact) && artifact.endsWith(".md")
    );

    if (localMarkdownArtifacts.length === 0) {
      errors.push(
        `${row.id} performance row must link a local markdown artifact`
      );
      continue;
    }

    const scenario = scenarios.get(row.scenarioId);

    for (const artifact of localMarkdownArtifacts) {
      errors.push(
        ...(await validatePerformanceArtifact({
          artifact,
          exists,
          readText,
          row,
          scenario
        }))
      );
    }
  }

  return errors;
};
