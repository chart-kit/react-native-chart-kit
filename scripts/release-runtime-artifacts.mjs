const isExternalEvidenceLink = (value) => /^https?:\/\//.test(value);

const isRuntimeSmokeArtifact = (artifact) =>
  /(^|\/)(ios|android)-runtime-(smoke|[a-z-]+)\.(png|log|md|mov|mp4)$/.test(
    artifact
  );

const hasRowSpecificEvidence = (row, artifacts) =>
  artifacts.some(
    (artifact) => isExternalEvidenceLink(artifact) || artifact.includes(row.id)
  );

export const validateRuntimeMatrixArtifacts = (matrix) => {
  const errors = [];

  for (const row of matrix.rows ?? []) {
    if (row.status !== "pass") continue;

    const artifacts = Array.isArray(row.evidence)
      ? row.evidence.filter((artifact) => typeof artifact === "string")
      : [];

    if (!hasRowSpecificEvidence(row, artifacts)) {
      errors.push(
        `${row.id} runtime pass row must include row-specific evidence`
      );
    }

    for (const artifact of artifacts.filter(isRuntimeSmokeArtifact)) {
      errors.push(
        `${row.id} must not use release smoke artifact ${artifact} as final runtime evidence`
      );
    }

    if (/\b(smoke|launch-only|partial)\b/i.test(row.notes ?? "")) {
      errors.push(`${row.id} runtime pass row notes describe incomplete QA`);
    }
  }

  return errors;
};
