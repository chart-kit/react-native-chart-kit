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
  "docs/release/native-performance-benchmark.md",
  "docs/release/native-release-checks.md",
  "docs/release/native-release-results.md",
  "docs/release/native-runtime-qa.md",
  "docs/release/accessibility-qa.md",
  "docs/release/evidence/native-accessibility-qa.json",
  "docs/release/evidence/native-performance-benchmark.json",
  "docs/release/evidence/native-runtime-qa.json",
  "docs/release/evidence/owner-gates.json",
  ".github/workflows/native-release.yml",
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
  },
  {
    id: "native-workflow-evidence",
    file: "docs/release/known-issues.md",
    pattern: /green (native )?(release )?workflow (artifact|run)|green run/i,
    message: "Green native release workflow evidence is still missing."
  },
  {
    id: "skia-backend",
    file: "packages/skia-renderer/README.md",
    pattern:
      /native install verification and native renderer parity coverage are still pending/i,
    message:
      "Skia adapter and first LineChart hook exist, but native install and native renderer parity evidence are still missing."
  }
];

const releaseEvidenceManifests = [
  {
    id: "native-runtime-qa",
    file: "docs/release/evidence/native-runtime-qa.json",
    message:
      "Native runtime QA manifest is not complete for the required device matrix."
  },
  {
    id: "native-accessibility-qa",
    file: "docs/release/evidence/native-accessibility-qa.json",
    message: "Native VoiceOver/TalkBack evidence manifest is not complete."
  },
  {
    id: "native-performance",
    file: "docs/release/evidence/native-performance-benchmark.json",
    message: "Release-device native performance manifest is not complete."
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

  addCheck({
    detail: Array.isArray(manifest.missingEvidence)
      ? manifest.missingEvidence.join("; ")
      : "",
    evidence: manifestConfig.file,
    id: `blocker:${manifestConfig.id}`,
    message: manifestConfig.message,
    status: status === "complete" ? "pass" : "block"
  });
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
