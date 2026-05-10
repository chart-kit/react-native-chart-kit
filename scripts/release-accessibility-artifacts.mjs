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

const baselineArtifactName = "accessibility-local-baseline";
const requiredBaselineTokens = [
  "Date:",
  "Commit:",
  "Build surface:",
  "local repository checks only",
  "npm run test:unit",
  "npm run showcase:typecheck",
  "npm run release:preview:gate",
  "Vitest reported",
  "chart summary/data-table helpers",
  "Expo showcase data-details coverage guard",
  "Not covered by this local baseline",
  "iOS VoiceOver",
  "Android TalkBack",
  "native focus order",
  "physical-device or simulator/emulator screen-reader evidence"
];

const missingTokens = (source, tokens) =>
  tokens.filter((token) => !source.includes(token));

const hasRowSpecificEvidence = (row, artifacts) =>
  artifacts.some(
    (artifact) => isExternalEvidenceLink(artifact) || artifact.includes(row.id)
  );

const getAssistiveTech = (matrix, row) =>
  matrix.assistiveTech?.find((item) => item.id === row.assistiveTechId);

const validateFinalScreenReaderEvidence = ({ artifacts, matrix, row }) => {
  const errors = [];

  if (row.status !== "pass") return errors;

  const tech = getAssistiveTech(matrix, row);
  const requiredTechName = tech?.label ?? row.assistiveTechId ?? "";
  const notes = row.notes ?? "";

  if (!hasRowSpecificEvidence(row, artifacts)) {
    errors.push(
      `${row.id} accessibility pass row must include row-specific screen-reader evidence`
    );
  }

  if (requiredTechName && !notes.includes(requiredTechName)) {
    errors.push(`${row.id} pass notes must mention ${requiredTechName}`);
  }

  if (!/\b(manual|screen-reader|screen reader)\b/i.test(notes)) {
    errors.push(`${row.id} pass notes must describe manual screen-reader QA`);
  }

  if (/\b(automated|local baseline|partial|still required)\b/i.test(notes)) {
    errors.push(`${row.id} pass notes describe incomplete accessibility QA`);
  }

  return errors;
};

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
      `${row.id} accessibility baseline artifact ${artifact} is missing required fields: ${missing.join(", ")}`
    );
  }

  if (row.status !== "partial") {
    errors.push(
      `${row.id} must not use the local accessibility baseline as final evidence`
    );
  }

  return errors;
};

export const validateAccessibilityMatrixArtifacts = async (
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

    errors.push(
      ...validateFinalScreenReaderEvidence({ artifacts, matrix, row })
    );

    for (const artifact of baselineArtifacts) {
      errors.push(
        ...(await validateLocalBaseline({ artifact, exists, readText, row }))
      );
    }
  }

  return errors;
};
