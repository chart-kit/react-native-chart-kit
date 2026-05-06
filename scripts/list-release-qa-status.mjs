import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  getNativeQaMatrixConfig,
  nativeQaMatrixConfigs
} from "./native-qa-matrix-config.mjs";

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
  const params = new URLSearchParams();
  params.set("view", "charts");

  if (storyId) {
    params.set("story", storyId);
  } else if (pageId) {
    params.set("page", pageId);
  } else {
    return "";
  }

  return `chartkitshowcase://showcase?${params.toString()}`;
};

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

    sections.push({
      counts: getCounts(rows),
      label: config.label,
      matrix: name,
      matrixPath: config.path,
      openRows: openRows.map((row) => ({
        command: getRowCommand({ matrixName: name, row }),
        evidence: row.evidence ?? [],
        id: row.id,
        launchUrl: getLaunchUrl(matrix, row),
        status: row.status,
        target: getTarget(matrix, row)
      })),
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
      ...section.openRows.flatMap((row) => [
        `  - ${row.id} [${row.status}] ${row.target}`,
        row.launchUrl ? `    launch: ${row.launchUrl}` : "",
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
