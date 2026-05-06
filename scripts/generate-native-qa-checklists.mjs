import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = process.cwd();
const outputPath = "docs/release/native-qa-checklists.md";
const matrixPaths = {
  accessibility: "docs/release/evidence/native-accessibility-matrix.json",
  performance: "docs/release/evidence/native-performance-matrix.json",
  runtime: "docs/release/evidence/native-runtime-matrix.json",
  skia: "docs/release/evidence/skia-renderer-matrix.json"
};

const statusOrder = ["pass", "pending", "blocked", "fail", "not-applicable"];

const readRepoJson = async (repoRoot, relativePath) =>
  JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));

const toIdMap = (items = []) => new Map(items.map((item) => [item.id, item]));

const escapeTableValue = (value) =>
  String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");

const formatEvidence = (evidence = []) =>
  evidence.length > 0
    ? evidence.map((item) => `\`${item}\``).join(", ")
    : "None";

const countRowsByStatus = (rows = []) => {
  const counts = Object.fromEntries(statusOrder.map((status) => [status, 0]));

  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return counts;
};

const formatStatusSummary = (label, matrix) => {
  const counts = countRowsByStatus(matrix.rows);
  const total = matrix.rows?.length ?? 0;

  return `| ${label} | ${total} | ${counts.pass} | ${counts.pending} | ${counts.blocked} | ${counts.fail} | ${counts["not-applicable"]} |`;
};

const formatCheckGroups = (checkGroups = {}) =>
  Object.entries(checkGroups)
    .map(([groupId, checks]) =>
      [
        `### \`${groupId}\``,
        "",
        ...checks.map((check) => `- [ ] ${check}`)
      ].join("\n")
    )
    .join("\n\n");

const getPageGroups = (page) =>
  (page?.requiredCheckGroups ?? [])
    .map((groupId) => `\`${groupId}\``)
    .join(", ");

const formatRuntimeRows = (matrix) => {
  const platforms = toIdMap(matrix.platforms);
  const pages = toIdMap(matrix.pages);
  const lines = [
    "| Row | Target | Build Surface | Showcase Page | Check Groups | Status | Evidence |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const row of matrix.rows) {
    const platform = platforms.get(row.platform);
    const page = pages.get(row.pageId);
    lines.push(
      [
        `\`${row.id}\``,
        `${platform?.label ?? row.platform} / ${page?.title ?? row.pageId}`,
        platform?.requiredBuildSurface ?? "",
        page?.showcasePageId ? `\`${page.showcasePageId}\`` : "",
        getPageGroups(page),
        row.status,
        formatEvidence(row.evidence)
      ]
        .map(escapeTableValue)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }

  return lines.join("\n");
};

const formatAccessibilityRows = (matrix) => {
  const assistiveTech = toIdMap(matrix.assistiveTech);
  const pages = toIdMap(matrix.pages);
  const lines = [
    "| Row | Target | Build Surface | Showcase Page | Check Groups | Status | Evidence |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const row of matrix.rows) {
    const tech = assistiveTech.get(row.assistiveTechId);
    const page = pages.get(row.pageId);
    lines.push(
      [
        `\`${row.id}\``,
        `${tech?.label ?? row.assistiveTechId} / ${page?.title ?? row.pageId}`,
        tech?.requiredBuildSurface ?? "",
        page?.showcasePageId ? `\`${page.showcasePageId}\`` : "",
        getPageGroups(page),
        row.status,
        formatEvidence(row.evidence)
      ]
        .map(escapeTableValue)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }

  return lines.join("\n");
};

const formatPerformanceRows = (matrix) => {
  const platforms = toIdMap(matrix.platforms);
  const scenarios = toIdMap(matrix.scenarios);
  const lines = [
    "| Row | Target | Scenario | Data Size | Interaction | Status | Evidence |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  for (const row of matrix.rows) {
    const platform = platforms.get(row.platform);
    const scenario = scenarios.get(row.scenarioId);
    lines.push(
      [
        `\`${row.id}\``,
        `${platform?.label ?? row.platform} / ${row.renderer}`,
        scenario?.label ?? row.scenarioId,
        scenario?.requiredDataSize ?? "",
        scenario?.interaction ?? "",
        row.status,
        formatEvidence(row.evidence)
      ]
        .map(escapeTableValue)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }

  return lines.join("\n");
};

const formatSkiaRows = (matrix) => {
  const platforms = toIdMap(matrix.platforms);
  const scenarios = toIdMap(matrix.scenarios);
  const lines = [
    "| Row | Target | Build Surface | Required Evidence | Status | Evidence |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const row of matrix.rows) {
    const platform = platforms.get(row.platform);
    const scenario = scenarios.get(row.scenarioId);
    lines.push(
      [
        `\`${row.id}\``,
        `${platform?.label ?? row.platform} / ${scenario?.label ?? row.scenarioId}`,
        platform?.requiredBuildSurface ?? "",
        scenario?.requiredEvidence ?? "",
        row.status,
        formatEvidence(row.evidence)
      ]
        .map(escapeTableValue)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |")
    );
  }

  return lines.join("\n");
};

export const generateNativeQaChecklist = async ({
  repoRoot = defaultRepoRoot
} = {}) => {
  const [runtime, accessibility, performance, skia] = await Promise.all([
    readRepoJson(repoRoot, matrixPaths.runtime),
    readRepoJson(repoRoot, matrixPaths.accessibility),
    readRepoJson(repoRoot, matrixPaths.performance),
    readRepoJson(repoRoot, matrixPaths.skia)
  ]);
  const latestUpdated = [runtime, accessibility, performance, skia]
    .map((matrix) => matrix.lastUpdated)
    .sort()
    .at(-1);

  return [
    "# Native QA Checklists",
    "",
    "<!-- prettier-ignore-start -->",
    "",
    `Generated from native and Skia evidence matrices last updated ${latestUpdated}. Regenerate with \`npm run release:qa:checklists\`. Record row evidence with \`npm run release:qa:record -- --matrix runtime --row ios-line-charts --status pass --evidence docs/release/artifacts/example.md\` or \`--matrix skia\` for Skia rows. Do not mark a row as \`pass\` without evidence links in the source matrix.`,
    "",
    "## Matrix Summary",
    "",
    "| Matrix | Rows | Pass | Pending | Blocked | Fail | Not Applicable |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    formatStatusSummary("Runtime QA", runtime),
    formatStatusSummary("Accessibility QA", accessibility),
    formatStatusSummary("Native Performance", performance),
    formatStatusSummary("Skia Renderer", skia),
    "",
    "## Runtime QA",
    "",
    `Source: [${runtime.source}](${path.relative("docs/release", runtime.source)}) and [${matrixPaths.runtime}](evidence/native-runtime-matrix.json).`,
    "",
    "### Runtime Check Groups",
    "",
    formatCheckGroups(runtime.checkGroups),
    "",
    "### Runtime Rows",
    "",
    formatRuntimeRows(runtime),
    "",
    "## Accessibility QA",
    "",
    `Source: [${accessibility.source}](${path.relative(
      "docs/release",
      accessibility.source
    )}) and [${matrixPaths.accessibility}](evidence/native-accessibility-matrix.json).`,
    "",
    "### Accessibility Check Groups",
    "",
    formatCheckGroups(accessibility.checkGroups),
    "",
    "### Accessibility Rows",
    "",
    formatAccessibilityRows(accessibility),
    "",
    "## Native Performance",
    "",
    `Source: [${performance.source}](${path.relative(
      "docs/release",
      performance.source
    )}) and [${matrixPaths.performance}](evidence/native-performance-matrix.json).`,
    "",
    "### Metrics To Capture",
    "",
    ...performance.metrics.map((metric) => `- [ ] ${metric}`),
    "",
    "### Performance Rows",
    "",
    formatPerformanceRows(performance),
    "",
    "### Deferred Rows",
    "",
    ...(performance.deferredRows ?? []).map(
      (row) =>
        `- \`${row.renderer}\`: ${row.status}. ${row.reason ?? "No reason recorded."}`
    ),
    "",
    "## Skia Renderer",
    "",
    `Source: [${skia.source}](${path.relative("docs/release", skia.source)}) and [${matrixPaths.skia}](evidence/skia-renderer-matrix.json).`,
    "",
    "### Skia Rows",
    "",
    formatSkiaRows(skia),
    "",
    "<!-- prettier-ignore-end -->",
    ""
  ].join("\n");
};

const main = async () => {
  const args = new Set(process.argv.slice(2));
  const markdown = await generateNativeQaChecklist();
  const absoluteOutputPath = path.join(defaultRepoRoot, outputPath);

  if (args.has("--check")) {
    const current = await readFile(absoluteOutputPath, "utf8");

    if (current !== markdown) {
      console.error(
        `${outputPath} is out of date. Run npm run release:qa:checklists.`
      );
      process.exit(1);
    }

    console.log(`${outputPath} is up to date.`);
    return;
  }

  await writeFile(absoluteOutputPath, markdown, "utf8");
  console.log(`Wrote ${outputPath}.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
