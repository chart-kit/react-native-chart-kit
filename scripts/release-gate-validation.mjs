import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { validateAccessibilityMatrixArtifacts } from "./release-accessibility-artifacts.mjs";
import { validatePerformanceMatrixArtifacts } from "./release-performance-artifacts.mjs";
import { validateRuntimeMatrixArtifacts } from "./release-runtime-artifacts.mjs";
import { validateSkiaMatrixArtifacts } from "./release-skia-artifacts.mjs";

const repoRoot = process.cwd();

const validMatrixRowStatuses = new Set([
  "blocked",
  "fail",
  "not-applicable",
  "partial",
  "pass",
  "pending"
]);
const validReleaseEvidenceManifestStatuses = new Set([
  "archived",
  "blocked",
  "complete",
  "missing",
  "partial"
]);
const validOwnerGateStatuses = new Set(["approved", "not-started", "open"]);

export const readRepoFile = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

export const readRepoJson = async (relativePath) =>
  JSON.parse(await readRepoFile(relativePath));

export const pathExists = async (relativePath) => {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
};

const getIds = (items) =>
  new Set(
    Array.isArray(items)
      ? items
          .map((item) => (typeof item.id === "string" ? item.id : ""))
          .filter(Boolean)
      : []
  );

const extractQuotedStrings = (source) =>
  new Set([...source.matchAll(/"([^"]+)"/g)].map((match) => match[1]));

export const extractObjectIds = (source) =>
  new Set([...source.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]));

export const readShowcaseStoryIds = async () => {
  const storyIds = extractQuotedStrings(
    await readRepoFile("apps/expo-showcase/visual/stories.ts")
  );
  const storyDirectory = path.join(repoRoot, "apps/expo-showcase/src/stories");
  const storyFiles = (await readdir(storyDirectory)).filter((fileName) =>
    fileName.endsWith("Stories.tsx")
  );

  for (const storyFile of storyFiles) {
    const source = await readRepoFile(
      `apps/expo-showcase/src/stories/${storyFile}`
    );

    for (const storyId of extractObjectIds(source)) {
      storyIds.add(storyId);
    }
  }

  return storyIds;
};

export const readPerformanceStoryMetadata = async () => {
  const manifest = await readRepoJson(
    "apps/expo-showcase/src/stories/performanceStoryMetadata.json"
  );
  const stories = Array.isArray(manifest.stories) ? manifest.stories : [];

  return new Map(
    stories
      .filter((story) => typeof story.id === "string" && story.id.length > 0)
      .map((story) => [story.id, story])
  );
};

const isExternalEvidenceLink = (value) => /^https?:\/\//.test(value);

const getMatrixStatus = (rows = []) => {
  if (rows.length === 0) return "pending";
  if (rows.every((row) => row.status === "pass")) return "complete";
  if (rows.some((row) => row.status === "fail")) return "fail";
  if (rows.some((row) => row.status === "blocked")) return "blocked";
  if (rows.some((row) => ["partial", "pass"].includes(row.status))) {
    return "partial";
  }
  return "pending";
};

const validateMatrixPages = ({
  checkGroupIds,
  errors,
  matrix,
  showcasePageIds
}) => {
  if (!Array.isArray(matrix.pages)) return;

  for (const page of matrix.pages) {
    const missingGroups = (page.requiredCheckGroups ?? []).filter(
      (groupId) => !checkGroupIds.has(groupId)
    );

    if (missingGroups.length > 0) {
      errors.push(
        `${page.id} references unknown check groups: ${missingGroups.join(", ")}`
      );
    }

    if (
      page.showcasePageId &&
      showcasePageIds.size > 0 &&
      !showcasePageIds.has(page.showcasePageId)
    ) {
      errors.push(
        `${page.id} references unknown showcase page ${page.showcasePageId}`
      );
    }
  }
};

const validateMatrixScenarios = ({
  errors,
  matrix,
  performanceStoryMetadata,
  showcaseStoryIds
}) => {
  if (!Array.isArray(matrix.scenarios)) return;

  for (const scenario of matrix.scenarios) {
    const storyMetadata = scenario.showcaseStoryId
      ? performanceStoryMetadata.get(scenario.showcaseStoryId)
      : undefined;

    if (
      scenario.showcaseStoryId &&
      showcaseStoryIds.size > 0 &&
      !showcaseStoryIds.has(scenario.showcaseStoryId)
    ) {
      errors.push(
        `${scenario.id} references unknown showcase story ${scenario.showcaseStoryId}`
      );
    }

    if (scenario.showcaseStoryId?.startsWith("v2-perf-")) {
      if (!storyMetadata) {
        errors.push(
          `${scenario.id} is missing performance story metadata for ${scenario.showcaseStoryId}`
        );
      }
      if (!scenario.expectedStoryMetrics) {
        errors.push(`${scenario.id} must define expectedStoryMetrics`);
      }
    }

    if (storyMetadata && scenario.expectedStoryMetrics) {
      if (storyMetadata.scenarioId !== scenario.id) {
        errors.push(
          `${scenario.id} story metadata scenarioId ${storyMetadata.scenarioId} does not match`
        );
      }

      for (const key of [
        "chartType",
        "seriesCount",
        "totalPoints",
        "visiblePoints"
      ]) {
        if (storyMetadata[key] !== scenario.expectedStoryMetrics[key]) {
          errors.push(
            `${scenario.id} expected ${key}=${scenario.expectedStoryMetrics[key]} but ${scenario.showcaseStoryId} metadata has ${storyMetadata[key]}`
          );
        }
      }
    }
  }
};

const validateMatrixRowEvidence = async ({ errors, row }) => {
  if (!["partial", "pass"].includes(row.status)) return;

  const evidence = Array.isArray(row.evidence) ? row.evidence : [];

  if (
    evidence.length === 0 ||
    evidence.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    errors.push(`${row.id} is ${row.status} without evidence links`);
    return;
  }

  for (const evidenceItem of evidence) {
    if (
      !isExternalEvidenceLink(evidenceItem) &&
      !(await pathExists(evidenceItem))
    ) {
      errors.push(`${row.id} references missing evidence ${evidenceItem}`);
    }
  }

  if (row.status === "pass") {
    const review = row.review ?? {};

    for (const field of [
      "reviewedBy",
      "reviewedAt",
      "device",
      "buildSurface"
    ]) {
      if (typeof review[field] !== "string" || review[field].length === 0) {
        errors.push(`${row.id} pass row is missing review.${field}`);
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt ?? "")) {
      errors.push(`${row.id} pass row review.reviewedAt must be YYYY-MM-DD`);
    }

    if (typeof row.notes !== "string" || row.notes.length === 0) {
      errors.push(`${row.id} pass row must include notes`);
    }
  }
};

export const validateEvidenceMatrix = async (
  matrix,
  {
    performanceStoryMetadata = new Map(),
    showcasePageIds = new Set(),
    showcaseStoryIds = new Set()
  } = {}
) => {
  const errors = [];
  const pageIds = getIds(matrix.pages);
  const platformIds = getIds(matrix.platforms);
  const scenarioIds = getIds(matrix.scenarios);
  const assistiveTechIds = getIds(matrix.assistiveTech);
  const checkGroupIds = new Set(Object.keys(matrix.checkGroups ?? {}));
  const rowIds = new Set();

  if (!Array.isArray(matrix.rows) || matrix.rows.length === 0) {
    errors.push("matrix must define at least one row");
  }

  const derivedStatus = getMatrixStatus(matrix.rows ?? []);
  if (matrix.status && matrix.status !== derivedStatus) {
    errors.push(
      `matrix status ${matrix.status} does not match row-derived status ${derivedStatus}`
    );
  }

  validateMatrixPages({ checkGroupIds, errors, matrix, showcasePageIds });
  validateMatrixScenarios({
    errors,
    matrix,
    performanceStoryMetadata,
    showcaseStoryIds
  });

  for (const row of matrix.rows ?? []) {
    if (!row.id || typeof row.id !== "string") {
      errors.push("matrix row is missing a string id");
      continue;
    }

    if (rowIds.has(row.id)) errors.push(`${row.id} is duplicated`);
    rowIds.add(row.id);

    if (!validMatrixRowStatuses.has(row.status)) {
      errors.push(`${row.id} has invalid status ${row.status}`);
    }

    await validateMatrixRowEvidence({ errors, row });

    if (row.pageId && pageIds.size > 0 && !pageIds.has(row.pageId)) {
      errors.push(`${row.id} references unknown page ${row.pageId}`);
    }
    if (
      row.platform &&
      platformIds.size > 0 &&
      !platformIds.has(row.platform)
    ) {
      errors.push(`${row.id} references unknown platform ${row.platform}`);
    }
    if (
      row.scenarioId &&
      scenarioIds.size > 0 &&
      !scenarioIds.has(row.scenarioId)
    ) {
      errors.push(`${row.id} references unknown scenario ${row.scenarioId}`);
    }
    if (
      row.assistiveTechId &&
      assistiveTechIds.size > 0 &&
      !assistiveTechIds.has(row.assistiveTechId)
    ) {
      errors.push(
        `${row.id} references unknown assistive tech ${row.assistiveTechId}`
      );
    }
  }

  if (matrix.source === "docs/release/native-performance-benchmark.md") {
    errors.push(...(await validatePerformanceMatrixArtifacts(matrix)));
  }
  if (matrix.source === "docs/release/native-runtime-qa.md") {
    errors.push(...validateRuntimeMatrixArtifacts(matrix));
  }
  if (matrix.source === "docs/release/skia-renderer-qa.md") {
    errors.push(...(await validateSkiaMatrixArtifacts(matrix)));
  }
  if (matrix.source === "docs/release/accessibility-qa.md") {
    errors.push(...(await validateAccessibilityMatrixArtifacts(matrix)));
  }

  return errors;
};

const validateApprovedOwnerGate = ({ errors, gate }) => {
  if (!gate.approvedBy || typeof gate.approvedBy !== "string") {
    errors.push(`${gate.id} approved gate must record approvedBy`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gate.approvedAt ?? "")) {
    errors.push(`${gate.id} approved gate must record approvedAt`);
  }
  if (!Array.isArray(gate.decisions) || gate.decisions.length === 0) {
    errors.push(`${gate.id} approved gate must record decisions`);
  }
  if (
    Array.isArray(gate.pendingDecisions) &&
    gate.pendingDecisions.length > 0
  ) {
    errors.push(`${gate.id} approved gate must not list pendingDecisions`);
  }
};

export const validateOwnerGatesManifest = async (manifest) => {
  const errors = [];
  const gateIds = new Set();

  if (!Array.isArray(manifest.gates) || manifest.gates.length === 0) {
    errors.push("owner gate manifest must define at least one gate");
    return errors;
  }

  for (const gate of manifest.gates) {
    if (!gate.id || typeof gate.id !== "string") {
      errors.push("owner gate is missing a string id");
      continue;
    }

    if (gateIds.has(gate.id)) errors.push(`${gate.id} is duplicated`);
    gateIds.add(gate.id);

    const status = gate.status ?? "open";
    if (!validOwnerGateStatuses.has(status)) {
      errors.push(`${gate.id} has invalid status ${status}`);
    }
    if (!Array.isArray(gate.requiredFor) || gate.requiredFor.length === 0) {
      errors.push(`${gate.id} must list requiredFor gates`);
    }

    if (!Array.isArray(gate.evidence) || gate.evidence.length === 0) {
      errors.push(`${gate.id} must link evidence files`);
    } else {
      for (const evidenceFile of gate.evidence) {
        if (
          typeof evidenceFile !== "string" ||
          evidenceFile.length === 0 ||
          !(await pathExists(evidenceFile))
        ) {
          errors.push(`${gate.id} has missing evidence file ${evidenceFile}`);
        }
      }
    }

    if (status === "approved") {
      validateApprovedOwnerGate({ errors, gate });
    } else if (
      !Array.isArray(gate.pendingDecisions) ||
      gate.pendingDecisions.length === 0
    ) {
      errors.push(`${gate.id} open gate must list pendingDecisions`);
    }
  }

  return errors;
};

const validateCompletedEntryArtifacts = async ({ entry, errors, index }) => {
  if (entry.artifacts === undefined) return;

  if (!Array.isArray(entry.artifacts)) {
    errors.push(`completedEntries[${index}].artifacts must be an array`);
    return;
  }

  for (const artifact of entry.artifacts) {
    if (typeof artifact !== "string" || artifact.length === 0) {
      errors.push(
        `completedEntries[${index}].artifacts must contain non-empty strings`
      );
    } else if (
      !isExternalEvidenceLink(artifact) &&
      !(await pathExists(artifact))
    ) {
      errors.push(
        `completedEntries[${index}] references missing artifact ${artifact}`
      );
    }
  }
};

export const validateReleaseEvidenceManifest = async ({
  manifest,
  matrix,
  matrixFile
}) => {
  const errors = [];
  const status = manifest.status ?? "missing";
  const missingEvidence = Array.isArray(manifest.missingEvidence)
    ? manifest.missingEvidence
    : [];
  const completedEntries = Array.isArray(manifest.completedEntries)
    ? manifest.completedEntries
    : [];

  if (!validReleaseEvidenceManifestStatuses.has(status)) {
    errors.push(`manifest has invalid status ${status}`);
  }
  if (!manifest.summary || typeof manifest.summary !== "string") {
    errors.push("manifest must include a summary");
  }

  if (status === "archived") {
    if (!manifest.archiveNote || typeof manifest.archiveNote !== "string") {
      errors.push("archived manifest must include archiveNote");
    }

    for (const [index, entry] of completedEntries.entries()) {
      if (!entry.result || typeof entry.result !== "string") {
        errors.push(`completedEntries[${index}] must include result`);
      }
      await validateCompletedEntryArtifacts({ entry, errors, index });
    }

    return errors;
  }

  if (
    !Array.isArray(manifest.requiredFor) ||
    manifest.requiredFor.length === 0
  ) {
    errors.push("manifest must list requiredFor gates");
  }
  if (matrixFile && manifest.matrix !== matrixFile) {
    errors.push(`manifest matrix must be ${matrixFile}`);
  }

  if (status === "complete") {
    if (missingEvidence.length > 0) {
      errors.push("complete manifest must not list missingEvidence");
    }
    if (matrix && matrix.rows?.some((row) => row.status !== "pass")) {
      errors.push("complete matrix-backed manifest must have all rows passed");
    }
    if (!matrix && completedEntries.length === 0) {
      errors.push("complete manifest must include completedEntries");
    }
  } else if (
    matrix &&
    Array.isArray(matrix.rows) &&
    matrix.rows.every((row) => row.status === "pass")
  ) {
    errors.push(
      "matrix-backed manifest must be complete when all matrix rows pass"
    );
  } else if (missingEvidence.length === 0) {
    errors.push(`${status} manifest must list missingEvidence`);
  }

  for (const [index, entry] of completedEntries.entries()) {
    if (!entry.result || typeof entry.result !== "string") {
      errors.push(`completedEntries[${index}] must include result`);
    }
    await validateCompletedEntryArtifacts({ entry, errors, index });
  }

  return errors;
};
