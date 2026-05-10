import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { buildReleaseQaStatus } from "./list-release-qa-status.mjs";

const defaultOutputPath = "docs/release/native-qa-signoff-worksheet.md";
const defaultRepoRoot = process.cwd();

const parseArgs = (argv) => {
  const options = {
    outputPath: defaultOutputPath
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

    if (arg === "--check") {
      options.check = true;
    } else if (arg === "--matrix") {
      options.matrix = readValue();
    } else if (arg === "--output") {
      options.outputPath = readValue();
    } else if (arg === "--status") {
      options.status = readValue();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const formatCounts = (counts) =>
  Object.entries(counts)
    .map(([status, count]) => `${status}=${count}`)
    .join(", ");

const formatList = (items, emptyText) =>
  items.length > 0
    ? items.map((item) => `- ${item}`).join("\n")
    : `- ${emptyText}`;

const formatRow = (row) =>
  [
    `### ${row.id}`,
    "",
    `Target: ${row.target}`,
    "",
    `Status: ${row.status}`,
    "",
    row.launchUrl ? `Launch: \`${row.launchUrl}\`` : "Launch: None",
    "",
    "Capture Helpers:",
    "",
    formatList(
      row.captureCommands.map((command) => `\`${command}\``),
      "No capture command available"
    ),
    "",
    "Existing Evidence:",
    "",
    formatList(
      row.evidence.map((item) => `\`${item}\``),
      "No evidence recorded yet"
    ),
    "",
    "Engineering Checks:",
    "",
    formatList(row.checks, "No checks listed"),
    "",
    "Record Command (release engineering only):",
    "",
    `\`${row.command}\``
  ].join("\n");

const formatSection = (section) =>
  [
    `## ${section.label}`,
    "",
    `Matrix: \`${section.matrixPath}\``,
    "",
    `Status: ${section.status}`,
    "",
    `Counts: ${formatCounts(section.counts)}`,
    "",
    section.openRows.length === 0
      ? "No open rows."
      : section.openRows.map(formatRow).join("\n\n")
  ].join("\n");

export const generateNativeQaSignoffWorksheet = async ({
  matrixName,
  repoRoot = defaultRepoRoot,
  status
} = {}) => {
  const sections = await buildReleaseQaStatus({
    includeDetails: true,
    matrixName,
    repoRoot,
    status
  });
  const openRowCount = sections.reduce(
    (count, section) => count + section.openRows.length,
    0
  );

  return [
    "# Native QA Evidence Backlog",
    "",
    "<!-- prettier-ignore-start -->",
    "",
    "This file is an engineering-owned evidence backlog, not an owner checklist. The owner is not expected to run row-by-row QA, fill long reports, or produce the artifacts below.",
    "",
    "Owner review should stay lightweight: a short smoke-test statement, the surfaces checked, and any blocking issues. Release engineering or an agent can use the rows below when preparing a stable release candidate.",
    "",
    `Open rows: ${openRowCount}`,
    "",
    "Use `npm run release:qa:record` only for rows a release engineer or agent actually verified with evidence links, reviewer metadata, device/build metadata, and notes.",
    "",
    ...sections.map(formatSection),
    "",
    "<!-- prettier-ignore-end -->",
    ""
  ].join("\n");
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const markdown = await generateNativeQaSignoffWorksheet({
    matrixName: options.matrix,
    status: options.status
  });
  const outputPath = path.join(defaultRepoRoot, options.outputPath);

  if (options.check) {
    const current = await readFile(outputPath, "utf8");

    if (current !== markdown) {
      console.error(
        `${options.outputPath} is out of date. Run npm run release:qa:signoff.`
      );
      process.exit(1);
    }

    console.log(`${options.outputPath} is up to date.`);
    return;
  }

  await writeFile(outputPath, markdown, "utf8");
  console.log(`Wrote ${options.outputPath}.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
