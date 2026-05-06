export const validNativeQaStatuses = new Set([
  "blocked",
  "fail",
  "not-applicable",
  "partial",
  "pass",
  "pending"
]);

export const nativeQaMatrixConfigs = {
  accessibility: {
    label: "Accessibility QA",
    completeSummary:
      "Native accessibility QA matrix is complete for required VoiceOver and TalkBack showcase pages.",
    manifestPath: "docs/release/evidence/native-accessibility-qa.json",
    path: "docs/release/evidence/native-accessibility-matrix.json"
  },
  performance: {
    label: "Native Performance",
    completeSummary:
      "Native performance matrix is complete for required iOS and Android release scenarios.",
    manifestPath: "docs/release/evidence/native-performance-benchmark.json",
    path: "docs/release/evidence/native-performance-matrix.json"
  },
  runtime: {
    label: "Runtime QA",
    completeSummary:
      "Native runtime QA matrix is complete for required iOS and Android showcase pages.",
    manifestPath: "docs/release/evidence/native-runtime-qa.json",
    path: "docs/release/evidence/native-runtime-matrix.json"
  },
  skia: {
    label: "Skia Renderer",
    completeSummary:
      "Skia renderer native install, renderer parity, and performance evidence matrix is complete.",
    manifestPath: "docs/release/evidence/skia-renderer-evidence.json",
    path: "docs/release/evidence/skia-renderer-matrix.json"
  }
};

export const getNativeQaMatrixConfig = (matrixName) => {
  const config = nativeQaMatrixConfigs[matrixName];

  if (!config) {
    throw new Error(
      `Unknown matrix "${matrixName}". Use one of: ${Object.keys(
        nativeQaMatrixConfigs
      ).join(", ")}.`
    );
  }

  return config;
};

export const getNativeQaMatrixStatus = (rows) => {
  if (rows.every((row) => row.status === "pass")) {
    return "complete";
  }

  if (rows.some((row) => row.status === "fail")) {
    return "fail";
  }

  if (rows.some((row) => row.status === "blocked")) {
    return "blocked";
  }

  if (rows.some((row) => ["partial", "pass"].includes(row.status))) {
    return "partial";
  }

  return "pending";
};

export const getNativeQaManifestStatus = (matrixStatus) => {
  if (matrixStatus === "complete") {
    return "complete";
  }

  if (matrixStatus === "blocked" || matrixStatus === "fail") {
    return "blocked";
  }

  return "partial";
};

export const getNativeQaMissingEvidence = (rows) =>
  rows
    .filter((row) => row.status !== "pass")
    .map(
      (row) =>
        `${row.id} is ${row.status}; evidence is required before this matrix can be complete.`
    );
