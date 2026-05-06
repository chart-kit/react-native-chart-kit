import { access, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const json = args.has("--json");

const requiredFiles = [
  "docs/internal/repo-audit.md",
  "docs/internal/current-api-inventory.md",
  "docs/internal/compatibility-matrix-draft.md",
  "docs/internal/completion-audit.md",
  "docs/release/beta-checklist.md",
  "docs/release/h4-pro-scope.md",
  "docs/release/h4-owner-decision-memo.md",
  "docs/release/h5-beta-gate-evidence.md",
  "docs/release/h5-owner-decision-memo.md",
  "docs/release/h6-owner-decision-memo.md",
  "docs/release/known-issues.md",
  "docs/release/native-workflow-runbook.md",
  "docs/release/native-qa-checklists.md",
  "docs/release/native-performance-benchmark.md",
  "docs/release/native-release-checks.md",
  "docs/release/native-release-results.md",
  "docs/release/native-runtime-qa.md",
  "docs/release/accessibility-qa.md",
  "docs/release/evidence/native-accessibility-matrix.json",
  "docs/release/evidence/native-accessibility-qa.json",
  "docs/release/evidence/native-performance-matrix.json",
  "docs/release/evidence/native-performance-benchmark.json",
  "docs/release/evidence/native-release-workflow.json",
  "docs/release/evidence/native-runtime-matrix.json",
  "docs/release/evidence/native-runtime-qa.json",
  "docs/release/evidence/npm-publish-evidence.json",
  "docs/release/evidence/owner-gates.json",
  "docs/release/evidence/package-manifest.json",
  "docs/release/evidence/skia-renderer-evidence.json",
  "docs/release/evidence/skia-renderer-matrix.json",
  ".github/workflows/publish.yml",
  ".github/workflows/native-release.yml",
  "scripts/generate-native-qa-checklists.mjs",
  "scripts/record-native-workflow-evidence.mjs",
  "scripts/record-owner-gate-decision.mjs",
  "scripts/record-native-qa-evidence.mjs",
  "packages/core/package.json",
  "packages/react-native/package.json",
  "packages/svg-renderer/package.json",
  "packages/skia-renderer/package.json",
  "packages/pro/package.json",
  "apps/expo-showcase/package.json",
  "apps/expo-showcase/src/storyRegistry.tsx",
  "apps/expo-showcase/visual/stories.ts",
  "examples/rn-cli-basic/package.json"
];

const requiredScripts = [
  "lint",
  "typecheck",
  "test",
  "test:unit",
  "test:visual",
  "test:compat",
  "test:e2e",
  "benchmark",
  "boundaries:check",
  "example:ios",
  "example:android",
  "example:expo",
  "docs:build",
  "surface:check",
  "skia:parity",
  "native:release:dry-run",
  "native:release:android",
  "native:release:ios",
  "pack:check",
  "release:native-workflow:record",
  "release:qa:checklists",
  "release:qa:checklists:check",
  "release:qa:record",
  "release:owner:record",
  "release:publish:status",
  "release:gate",
  "release:gate:report"
];

const releaseBlockers = [
  {
    id: "audit-not-complete",
    file: "docs/internal/completion-audit.md",
    pattern: /Status on .*: not complete\./,
    message: "Completion audit still says the v2/v2 Pro plan is not complete."
  },
  {
    id: "native-android-release",
    file: "docs/release/known-issues.md",
    pattern: /Android .*blocked locally by missing Android SDK/i,
    message:
      "Android release-build evidence is still blocked locally by Android SDK configuration."
  }
];

const releaseEvidenceManifests = [
  {
    id: "developer-preview-publish",
    file: "docs/release/evidence/npm-publish-evidence.json"
  },
  {
    id: "native-workflow-evidence",
    file: "docs/release/evidence/native-release-workflow.json"
  },
  {
    id: "skia-backend",
    file: "docs/release/evidence/skia-renderer-evidence.json",
    matrixFile: "docs/release/evidence/skia-renderer-matrix.json",
    matrixLabel: "Skia renderer evidence rows"
  },
  {
    id: "native-runtime-qa",
    file: "docs/release/evidence/native-runtime-qa.json",
    matrixFile: "docs/release/evidence/native-runtime-matrix.json"
  },
  {
    id: "native-accessibility-qa",
    file: "docs/release/evidence/native-accessibility-qa.json",
    matrixFile: "docs/release/evidence/native-accessibility-matrix.json",
    matrixLabel: "native accessibility matrix rows"
  },
  {
    id: "native-performance",
    file: "docs/release/evidence/native-performance-benchmark.json",
    matrixFile: "docs/release/evidence/native-performance-matrix.json",
    matrixLabel: "native performance matrix rows"
  }
];

const ownerGateMessages = {
  h4: "H4 Pro/free boundary approval is still open.",
  h5: "H5 Developer Preview approval is still open.",
  h6: "H6 release-candidate approval is not started."
};

const checks = [];

const addCheck = ({ detail = "", evidence = "", id, message, status }) => {
  checks.push({ detail, evidence, id, message, status });
};

const validMatrixRowStatuses = new Set([
  "blocked",
  "fail",
  "not-applicable",
  "partial",
  "pass",
  "pending"
]);
const validReleaseEvidenceManifestStatuses = new Set([
  "blocked",
  "complete",
  "missing",
  "partial"
]);
const validOwnerGateStatuses = new Set(["approved", "not-started", "open"]);

const readRepoFile = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const readRepoJson = async (relativePath) =>
  JSON.parse(await readRepoFile(relativePath));

const pathExists = async (relativePath) => {
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

const extractObjectIds = (source) =>
  new Set([...source.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]));

const isExternalEvidenceLink = (value) => /^https?:\/\//.test(value);

const getMatrixStatus = (rows = []) => {
  if (rows.length === 0) {
    return "pending";
  }

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

const validateEvidenceMatrix = async (
  matrix,
  { showcasePageIds = new Set(), showcaseStoryIds = new Set() } = {}
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

  if (Array.isArray(matrix.pages)) {
    for (const page of matrix.pages) {
      const missingGroups = (page.requiredCheckGroups ?? []).filter(
        (groupId) => !checkGroupIds.has(groupId)
      );

      if (missingGroups.length > 0) {
        errors.push(
          `${page.id} references unknown check groups: ${missingGroups.join(
            ", "
          )}`
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
  }

  if (Array.isArray(matrix.scenarios)) {
    for (const scenario of matrix.scenarios) {
      if (
        scenario.showcaseStoryId &&
        showcaseStoryIds.size > 0 &&
        !showcaseStoryIds.has(scenario.showcaseStoryId)
      ) {
        errors.push(
          `${scenario.id} references unknown showcase story ${scenario.showcaseStoryId}`
        );
      }
    }
  }

  for (const row of matrix.rows ?? []) {
    if (!row.id || typeof row.id !== "string") {
      errors.push("matrix row is missing a string id");
      continue;
    }

    if (rowIds.has(row.id)) {
      errors.push(`${row.id} is duplicated`);
    }
    rowIds.add(row.id);

    if (!validMatrixRowStatuses.has(row.status)) {
      errors.push(`${row.id} has invalid status ${row.status}`);
    }

    if (["partial", "pass"].includes(row.status)) {
      const evidence = Array.isArray(row.evidence) ? row.evidence : [];

      if (
        evidence.length === 0 ||
        evidence.some((item) => typeof item !== "string" || item.length === 0)
      ) {
        errors.push(`${row.id} is ${row.status} without evidence links`);
      } else {
        for (const evidenceItem of evidence) {
          if (
            !isExternalEvidenceLink(evidenceItem) &&
            !(await pathExists(evidenceItem))
          ) {
            errors.push(
              `${row.id} references missing evidence ${evidenceItem}`
            );
          }
        }
      }
    }

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

  return errors;
};

const validateOwnerGatesManifest = async (manifest) => {
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

    if (gateIds.has(gate.id)) {
      errors.push(`${gate.id} is duplicated`);
    }
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
    } else if (
      !Array.isArray(gate.pendingDecisions) ||
      gate.pendingDecisions.length === 0
    ) {
      errors.push(`${gate.id} open gate must list pendingDecisions`);
    }
  }

  return errors;
};

const validateReleaseEvidenceManifest = async ({
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

    if (entry.artifacts !== undefined) {
      if (!Array.isArray(entry.artifacts)) {
        errors.push(`completedEntries[${index}].artifacts must be an array`);
      } else {
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
      }
    }
  }

  return errors;
};

for (const file of requiredFiles) {
  addCheck({
    evidence: file,
    id: `file:${file}`,
    message: `${file} exists`,
    status: (await pathExists(file)) ? "pass" : "fail"
  });
}

const packageJson = JSON.parse(await readRepoFile("package.json"));
const scripts = packageJson.scripts ?? {};

for (const scriptName of requiredScripts) {
  addCheck({
    evidence: "package.json",
    id: `script:${scriptName}`,
    message: `npm run ${scriptName} is defined`,
    status: scripts[scriptName] ? "pass" : "fail"
  });
}

const qaChecklistResult = spawnSync(
  process.execPath,
  ["scripts/generate-native-qa-checklists.mjs", "--check"],
  {
    cwd: repoRoot,
    encoding: "utf8"
  }
);

addCheck({
  detail:
    qaChecklistResult.status === 0
      ? ""
      : [qaChecklistResult.stdout, qaChecklistResult.stderr]
          .filter(Boolean)
          .join("\n")
          .trim(),
  evidence:
    "docs/release/native-qa-checklists.md; scripts/generate-native-qa-checklists.mjs",
  id: "generated:native-qa-checklists",
  message: "Generated native QA checklist is in sync with evidence matrices",
  status: qaChecklistResult.status === 0 ? "pass" : "fail"
});

const nativeReleaseWorkflowSource = await readRepoFile(
  ".github/workflows/native-release.yml"
);
const nativeWorkflowArtifactChecks = [
  "actions/upload-artifact@v5",
  "native-release-android",
  "native-release-ios",
  "docs/release/artifacts/native-workflow/android-release.log",
  "docs/release/artifacts/native-workflow/ios-release.log"
].filter((needle) => !nativeReleaseWorkflowSource.includes(needle));

addCheck({
  detail:
    nativeWorkflowArtifactChecks.length > 0
      ? `Missing workflow evidence config: ${nativeWorkflowArtifactChecks.join(
          ", "
        )}`
      : "",
  evidence: ".github/workflows/native-release.yml",
  id: "workflow:native-release-artifacts",
  message: "Native release workflow archives Android and iOS evidence logs",
  status: nativeWorkflowArtifactChecks.length === 0 ? "pass" : "fail"
});

const publishWorkflowSource = await readRepoFile(".github/workflows/publish.yml");
const publishAuthEnvCount = (
  publishWorkflowSource.match(
    /NODE_AUTH_TOKEN:\s*\$\{\{\s*secrets\.NPM_TOKEN\s*\}\}/g
  ) ?? []
).length;
const publishWorkflowSafetyChecks = [
  "secrets.NPM_TOKEN",
  "NODE_AUTH_TOKEN",
  "NPM_TOKEN is not configured",
  "npm whoami",
  "npm access list packages @chart-kit --json",
  "scripts/list-release-packages.mjs --publishable",
  "npm run release:publish:status -- --strict",
  "npm publish \"${PUBLISH_TARGET}\" --ignore-scripts --access public --provenance --tag"
].filter((needle) => !publishWorkflowSource.includes(needle));

if (publishAuthEnvCount < 2) {
  publishWorkflowSafetyChecks.push(
    "NODE_AUTH_TOKEN must be set for npm auth preflight and npm publish"
  );
}

addCheck({
  detail:
    publishWorkflowSafetyChecks.length > 0
      ? `Missing publish workflow safety config: ${publishWorkflowSafetyChecks.join(
          ", "
        )}`
      : "",
  evidence: ".github/workflows/publish.yml",
  id: "workflow:publish-safety",
  message:
    "Publish workflow validates npm auth and uses the release package manifest",
  status: publishWorkflowSafetyChecks.length === 0 ? "pass" : "fail"
});

const showcasePageIds = extractObjectIds(
  await readRepoFile("apps/expo-showcase/src/storyRegistry.tsx")
);
const showcaseStoryIds = extractQuotedStrings(
  await readRepoFile("apps/expo-showcase/visual/stories.ts")
);

const candidateJavaHomes = [
  process.env.JAVA_HOME,
  "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home",
  "/usr/local/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
].filter(Boolean);

const resolveJavaStatus = () => {
  const javaResult = spawnSync("java", ["-version"], {
    encoding: "utf8"
  });

  if (javaResult.status === 0) {
    return { detail: "", status: "pass" };
  }

  for (const javaHome of candidateJavaHomes) {
    const javaCommand = path.join(javaHome, "bin", "java");

    if (!existsSync(javaCommand)) {
      continue;
    }

    const homeResult = spawnSync(javaCommand, ["-version"], {
      encoding: "utf8"
    });

    if (homeResult.status === 0) {
      return {
        detail: `Found JDK at ${javaHome}; export JAVA_HOME or let the native release script resolve it.`,
        status: "pass"
      };
    }
  }

  return {
    detail: (javaResult.stderr ?? "").trim(),
    status: "block"
  };
};

const javaStatus = resolveJavaStatus();

addCheck({
  detail: javaStatus.detail,
  evidence: "local java -version, JAVA_HOME, or Homebrew OpenJDK",
  id: "toolchain:java",
  message: "Java runtime is available for local Android release checks",
  status: javaStatus.status
});

const candidateAndroidSdkPaths = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(process.env.HOME ?? "", "Library", "Android", "sdk"),
  "/opt/homebrew/share/android-commandlinetools",
  "/usr/local/share/android-commandlinetools"
].filter(Boolean);
const androidSdkPath = candidateAndroidSdkPaths.find((candidate) =>
  existsSync(candidate)
);

addCheck({
  detail: androidSdkPath
    ? ""
    : "Set ANDROID_HOME or ANDROID_SDK_ROOT to a valid Android SDK path.",
  evidence: "ANDROID_HOME, ANDROID_SDK_ROOT, or ~/Library/Android/sdk",
  id: "toolchain:android-sdk",
  message: "Android SDK is available for local Android release checks",
  status: androidSdkPath ? "pass" : "block"
});

for (const blocker of releaseBlockers) {
  const source = await readRepoFile(blocker.file);
  const isBlocked = blocker.pattern.test(source);

  addCheck({
    evidence: blocker.file,
    id: `blocker:${blocker.id}`,
    message: blocker.message,
    status: isBlocked ? "block" : "pass"
  });
}

const ownerGatesManifest = await readRepoJson(
  "docs/release/evidence/owner-gates.json"
);
const ownerGateErrors = await validateOwnerGatesManifest(ownerGatesManifest);

addCheck({
  detail: ownerGateErrors.join("; "),
  evidence: "docs/release/evidence/owner-gates.json",
  id: "owner-gates:manifest",
  message: "Owner gate manifest is structurally valid",
  status: ownerGateErrors.length === 0 ? "pass" : "fail"
});

for (const gate of ownerGatesManifest.gates ?? []) {
  const normalizedStatus = gate.status ?? "open";

  addCheck({
    detail: Array.isArray(gate.pendingDecisions)
      ? gate.pendingDecisions.join("; ")
      : "",
    evidence: "docs/release/evidence/owner-gates.json",
    id: `blocker:${gate.id}-owner-approval`,
    message:
      ownerGateMessages[gate.id] ??
      `${gate.name ?? gate.id} owner approval is not complete.`,
    status: normalizedStatus === "approved" ? "pass" : "block"
  });
}

for (const manifestConfig of releaseEvidenceManifests) {
  const manifest = await readRepoJson(manifestConfig.file);
  const status = manifest.status ?? "missing";
  const missingEvidence = Array.isArray(manifest.missingEvidence)
    ? manifest.missingEvidence
    : [];
  const matrix =
    manifestConfig.matrixFile && (await pathExists(manifestConfig.matrixFile))
      ? await readRepoJson(manifestConfig.matrixFile)
      : undefined;
  const matrixErrors = matrix
    ? await validateEvidenceMatrix(matrix, {
        showcasePageIds,
        showcaseStoryIds
      })
    : [];
  const manifestErrors = await validateReleaseEvidenceManifest({
    manifest,
    matrix,
    matrixFile: manifestConfig.matrixFile
  });
  const incompleteMatrixRows = Array.isArray(matrix?.rows)
    ? matrix.rows.filter((row) => row.status !== "pass")
    : [];
  const detail = [
    ...missingEvidence,
    incompleteMatrixRows.length > 0
      ? `${incompleteMatrixRows.length} incomplete ${
          manifestConfig.matrixLabel ?? "native runtime matrix rows"
        }`
      : ""
  ]
    .filter(Boolean)
    .join("; ");

  addCheck({
    detail,
    evidence: [manifestConfig.file, manifestConfig.matrixFile]
      .filter(Boolean)
      .join("; "),
    id: `blocker:${manifestConfig.id}`,
    message:
      manifest.summary ??
      `${manifestConfig.id} evidence manifest is not complete.`,
    status: status === "complete" ? "pass" : "block"
  });

  addCheck({
    detail: manifestErrors.join("; "),
    evidence: manifestConfig.file,
    id: `manifest:${manifestConfig.id}`,
    message: `${manifestConfig.file} is internally consistent`,
    status: manifestErrors.length === 0 ? "pass" : "fail"
  });

  if (manifestConfig.matrixFile) {
    addCheck({
      detail: matrixErrors.join("; "),
      evidence: manifestConfig.matrixFile,
      id: `matrix:${manifestConfig.id}`,
      message: `${manifestConfig.matrixFile} is structurally valid`,
      status: matrix && matrixErrors.length === 0 ? "pass" : "fail"
    });
  }
}

const totals = checks.reduce(
  (acc, check) => {
    acc[check.status] = (acc[check.status] ?? 0) + 1;
    return acc;
  },
  { block: 0, fail: 0, pass: 0, warn: 0 }
);
const hasReleaseStoppingIssue = totals.fail > 0 || totals.block > 0;

if (json) {
  console.log(JSON.stringify({ checks, strict, totals }, null, 2));
} else {
  console.log("Release gate report");
  console.log(
    `pass=${totals.pass} warn=${totals.warn} block=${totals.block} fail=${totals.fail}`
  );

  checks
    .filter((check) => check.status !== "pass")
    .forEach((check) => {
      console.log(
        `[${check.status.toUpperCase()}] ${check.id}: ${check.message}`
      );
      if (check.detail) {
        console.log(`  ${check.detail}`);
      }
      console.log(`  evidence: ${check.evidence}`);
    });

  if (!hasReleaseStoppingIssue) {
    console.log("Release gate passed.");
  } else if (strict) {
    console.log("Release gate failed in strict mode.");
  } else {
    console.log("Release gate has blockers. Report mode exited successfully.");
  }
}

if (strict && hasReleaseStoppingIssue) {
  process.exitCode = 1;
}
