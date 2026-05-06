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
  "docs/release/h5-beta-gate-evidence.md",
  "docs/release/h5-owner-decision-memo.md",
  "docs/release/known-issues.md",
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
  "docs/release/evidence/owner-gates.json",
  "docs/release/evidence/package-manifest.json",
  "docs/release/evidence/skia-renderer-evidence.json",
  ".github/workflows/native-release.yml",
  "scripts/generate-native-qa-checklists.mjs",
  "packages/core/package.json",
  "packages/react-native/package.json",
  "packages/svg-renderer/package.json",
  "packages/skia-renderer/package.json",
  "packages/pro/package.json",
  "apps/expo-showcase/package.json",
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
  "release:qa:checklists",
  "release:qa:checklists:check",
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
    id: "native-workflow-evidence",
    file: "docs/release/evidence/native-release-workflow.json"
  },
  {
    id: "skia-backend",
    file: "docs/release/evidence/skia-renderer-evidence.json"
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
  h5: "H5 beta approval is still open.",
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
  "pass",
  "pending"
]);

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

const validateEvidenceMatrix = (matrix) => {
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

    if (row.status === "pass") {
      const evidence = Array.isArray(row.evidence) ? row.evidence : [];

      if (
        evidence.length === 0 ||
        evidence.some((item) => typeof item !== "string" || item.length === 0)
      ) {
        errors.push(`${row.id} is passed without evidence links`);
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
  const matrixErrors = matrix ? validateEvidenceMatrix(matrix) : [];
  const pendingMatrixRows = Array.isArray(matrix?.rows)
    ? matrix.rows.filter((row) => row.status !== "pass")
    : [];
  const detail = [
    ...missingEvidence,
    pendingMatrixRows.length > 0
      ? `${pendingMatrixRows.length} pending ${
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
