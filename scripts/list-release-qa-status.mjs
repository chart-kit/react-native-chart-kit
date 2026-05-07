import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  getNativeQaMatrixConfig,
  nativeQaMatrixConfigs
} from "./native-qa-matrix-config.mjs";
import { createShowcaseLaunchUrl } from "./native-showcase-launch-url.mjs";

const defaultRepoRoot = process.cwd();
const matrixNames = Object.keys(nativeQaMatrixConfigs);
const openStatuses = new Set(["blocked", "fail", "partial", "pending"]);

const readRepoJson = async (repoRoot, relativePath) =>
  JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));

const parseArgs = (argv) => {
  const options = {};

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

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--details") {
      options.details = true;
    } else if (arg === "--limit") {
      const value = Number.parseInt(readValue(), 10);

      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--limit must be a positive integer");
      }

      options.limit = value;
    } else if (arg === "--matrix") {
      options.matrix = readValue();
    } else if (arg === "--status") {
      options.status = readValue();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const getCounts = (rows) =>
  rows.reduce((counts, row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, {});

const getTarget = (matrix, row) => {
  const platform = matrix.platforms?.find((item) => item.id === row.platform);
  const tech = matrix.assistiveTech?.find(
    (item) => item.id === row.assistiveTechId
  );
  const page = matrix.pages?.find((item) => item.id === row.pageId);
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);

  return [
    platform?.label ?? tech?.label ?? row.platform ?? row.assistiveTechId,
    page?.title ?? scenario?.label ?? row.pageId ?? row.scenarioId
  ]
    .filter(Boolean)
    .join(" / ");
};

const getLaunchUrl = (matrix, row) => {
  const page = matrix.pages?.find((item) => item.id === row.pageId);
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);
  const pageId = page?.showcasePageId;
  const storyId = scenario?.showcaseStoryId;

  return createShowcaseLaunchUrl({ pageId, storyId });
};

const getScenarioTargets = (matrix, row) => {
  const launchUrl = getLaunchUrl(matrix, row);
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);
  const targets = Array.isArray(scenario?.showcaseTargets)
    ? scenario.showcaseTargets
    : [];

  if (targets.length === 0) {
    return launchUrl
      ? [{ label: "default", launchUrl, requiresOverride: false }]
      : [];
  }

  return targets.map((target) => ({
    label: target.label ?? target.storyId ?? target.pageId ?? "target",
    launchUrl: createShowcaseLaunchUrl({
      pageId: target.pageId,
      storyId: target.storyId,
      viewId: target.viewId ?? "charts"
    }),
    requiresOverride: true
  }));
};

const getRowPlatform = (matrix, row) => {
  if (row.platform) return row.platform;

  const tech = matrix.assistiveTech?.find(
    (item) => item.id === row.assistiveTechId
  );

  return tech?.platform ?? "";
};

const getRowRequiredCheckGroups = (matrix, row) =>
  matrix.pages?.find((item) => item.id === row.pageId)?.requiredCheckGroups ??
  [];

const getRowExpectedStoryMetrics = (matrix, row) =>
  matrix.scenarios?.find((item) => item.id === row.scenarioId)
    ?.expectedStoryMetrics;

const formatExpectedStoryMetrics = (metrics) => {
  if (!metrics) return "";

  return [
    metrics.chartType && `chart ${metrics.chartType}`,
    Number.isFinite(metrics.totalPoints) &&
      `${metrics.totalPoints.toLocaleString("en-US")} total`,
    Number.isFinite(metrics.visiblePoints) &&
      `${metrics.visiblePoints.toLocaleString("en-US")} visible`,
    Number.isFinite(metrics.seriesCount) &&
      `${metrics.seriesCount.toLocaleString("en-US")} series`
  ]
    .filter(Boolean)
    .join("; ");
};

const getRowRequiredChecks = (matrix, row) => {
  const requiredCheckGroups = getRowRequiredCheckGroups(matrix, row);
  const groupChecks = requiredCheckGroups.flatMap((groupId) => {
    const checks = matrix.checkGroups?.[groupId] ?? [];

    return checks.map((check) => `${groupId}: ${check}`);
  });
  const scenario = matrix.scenarios?.find((item) => item.id === row.scenarioId);
  const scenarioChecks = [
    scenario?.requiredDataSize
      ? `scenario: data size ${scenario.requiredDataSize}`
      : "",
    scenario?.expectedStoryMetrics
      ? `scenario: expected story metrics ${formatExpectedStoryMetrics(
          scenario.expectedStoryMetrics
        )}`
      : "",
    scenario?.interaction
      ? `scenario: interaction ${scenario.interaction}`
      : "",
    scenario?.requiredEvidence
      ? `scenario: evidence ${scenario.requiredEvidence}`
      : ""
  ].filter(Boolean);
  const metricChecks = Array.isArray(matrix.metrics)
    ? matrix.metrics.map((metric) => `metric: ${metric}`)
    : [];

  return [...groupChecks, ...scenarioChecks, ...metricChecks];
};

const getCaptureCommand = ({
  includeLaunchUrl = false,
  launchUrl,
  matrixName,
  platform,
  row,
  suffix
}) => {
  if (!launchUrl || !platform) return "";

  const artifactBase = `docs/release/artifacts/${row.id}${suffix ? `-${suffix}` : ""}`;
  const quotedLaunchUrl = `"${launchUrl}"`;
  const command = [
    "npm run release:qa:capture --",
    `--matrix ${matrixName}`,
    `--row ${row.id}`,
    `--platform ${platform}`,
    `--output ${artifactBase}.png`,
    includeLaunchUrl ? `--launch-url ${quotedLaunchUrl}` : ""
  ];

  if (platform === "ios") {
    command.push(`--ios-log-output ${artifactBase}.log`);
  } else if (platform === "android") {
    command.push(`--android-log-output ${artifactBase}.log`);

    if (matrixName === "accessibility") {
      command.push(`--android-ui-output ${artifactBase}.xml`);
    }
  }

  return command.filter(Boolean).join(" ");
};

const toCaptureSuffix = (label, index) =>
  `${index + 1}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

const getRowCommand = ({ matrixName, row }) =>
  [
    "npm run release:qa:record --",
    `--matrix ${matrixName}`,
    `--row ${row.id}`,
    "--status pass",
    "--evidence <artifact>",
    '--reviewed-by "<name>"',
    '--device "<device / OS>"',
    '--build-surface "<release build surface>"',
    '--notes "<checks passed>"'
  ].join(" ");

export const buildReleaseQaStatus = async ({
  includeDetails = false,
  limit,
  matrixName,
  repoRoot = defaultRepoRoot,
  status
} = {}) => {
  const selectedMatrices = matrixName ? [matrixName] : matrixNames;
  const sections = [];

  for (const name of selectedMatrices) {
    const config = getNativeQaMatrixConfig(name);
    const matrix = await readRepoJson(repoRoot, config.path);
    const rows = matrix.rows ?? [];
    const openRows = rows.filter((row) =>
      status ? row.status === status : openStatuses.has(row.status)
    );
    const visibleOpenRows = Number.isInteger(limit)
      ? openRows.slice(0, limit)
      : openRows;

    sections.push({
      counts: getCounts(rows),
      label: config.label,
      matrix: name,
      matrixPath: config.path,
      openRowCount: openRows.length,
      openRows: visibleOpenRows.map((row) => {
        const launchTargets = getScenarioTargets(matrix, row);
        const launchUrl = launchTargets[0]?.launchUrl ?? "";
        const platform = getRowPlatform(matrix, row);
        const captureCommands = launchTargets
          .map((target, index) =>
            getCaptureCommand({
              launchUrl: target.launchUrl,
              matrixName: name,
              platform,
              row,
              includeLaunchUrl: target.requiresOverride,
              suffix:
                launchTargets.length > 1
                  ? toCaptureSuffix(target.label, index)
                  : ""
            })
          )
          .filter(Boolean);
        const expectedStoryMetrics = includeDetails
          ? getRowExpectedStoryMetrics(matrix, row)
          : undefined;

        return {
          captureCommand: captureCommands[0] ?? "",
          captureCommands,
          checks: includeDetails ? getRowRequiredChecks(matrix, row) : [],
          command: getRowCommand({ matrixName: name, row }),
          evidence: row.evidence ?? [],
          expectedStoryMetrics,
          id: row.id,
          launchUrl,
          launchTargets,
          status: row.status,
          target: getTarget(matrix, row)
        };
      }),
      status: matrix.status
    });
  }

  return sections;
};

const formatStatus = (sections) =>
  [
    "Release QA status",
    ...sections.flatMap((section) => [
      "",
      `${section.label} (${section.matrix}): ${section.status}`,
      `  counts: ${Object.entries(section.counts)
        .map(([status, count]) => `${status}=${count}`)
        .join(", ")}`,
      section.openRows.length < section.openRowCount
        ? `  showing: ${section.openRows.length} of ${section.openRowCount} open rows`
        : "",
      ...section.openRows.flatMap((row) => [
        `  - ${row.id} [${row.status}] ${row.target}`,
        row.launchUrl ? `    launch: ${row.launchUrl}` : "",
        ...row.captureCommands.map((command) => `    capture: ${command}`),
        row.expectedStoryMetrics
          ? `    expected: ${formatExpectedStoryMetrics(
              row.expectedStoryMetrics
            )}`
          : "",
        ...row.checks.map((check) => `    check: ${check}`),
        `    evidence: ${row.evidence.length > 0 ? row.evidence.join(", ") : "none"}`,
        `    record: ${row.command}`
      ])
    ])
  ]
    .filter((line) => line !== "")
    .join("\n");

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const sections = await buildReleaseQaStatus({
    includeDetails: options.details,
    limit: options.limit,
    matrixName: options.matrix,
    status: options.status
  });

  if (options.json) {
    console.log(JSON.stringify(sections, null, 2));
  } else {
    console.log(formatStatus(sections));
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
