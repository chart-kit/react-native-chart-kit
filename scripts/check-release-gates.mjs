import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  ownerGateMessages,
  releaseBlockers,
  releaseEvidenceManifests,
  requiredFiles,
  requiredScripts
} from "./release-gate-config.mjs";
import {
  pathExists,
  readRepoFile,
  readRepoJson,
  validateOwnerGatesManifest,
  validateReleaseEvidenceManifest
} from "./release-gate-validation.mjs";

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const preview = args.has("--preview");
const json = args.has("--json");
const checks = [];

const addCheck = ({ detail = "", evidence = "", id, message, status }) => {
  checks.push({ detail, evidence, id, message, status });
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

const publishEvidence = await readRepoJson(
  "docs/release/evidence/npm-publish-evidence.json"
);
const sourceVersion = packageJson.version;
const publishEvidenceText = JSON.stringify(publishEvidence);

addCheck({
  detail: publishEvidenceText.includes(sourceVersion)
    ? ""
    : `package.json is ${sourceVersion}; publish evidence still records an earlier Developer Preview. This is expected for local release prep until the next publish succeeds and evidence is updated.`,
  evidence: "package.json; docs/release/evidence/npm-publish-evidence.json",
  id: "publish:source-version-evidence",
  message: "Current source version is reflected in Developer Preview publish evidence",
  status: publishEvidenceText.includes(sourceVersion) ? "pass" : "warn"
});

const nativeReleaseWorkflowSource = await readRepoFile(
  ".github/workflows/native-release.yml"
);
const nativeWorkflowArtifactChecks = [
  "actions/upload-artifact@v5",
  "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true",
  "native-release-android",
  "native-release-ios",
  "docs/release/artifacts/native-workflow/android-release.log",
  "docs/release/artifacts/native-workflow/ios-release.log"
].filter((needle) => !nativeReleaseWorkflowSource.includes(needle));

addCheck({
  detail:
    nativeWorkflowArtifactChecks.length > 0
      ? `Missing workflow evidence config: ${nativeWorkflowArtifactChecks.join(", ")}`
      : "",
  evidence: ".github/workflows/native-release.yml",
  id: "workflow:native-release-artifacts",
  message: "Native release workflow archives Android and iOS evidence logs",
  status: nativeWorkflowArtifactChecks.length === 0 ? "pass" : "fail"
});

const publishWorkflowSource = await readRepoFile(
  ".github/workflows/publish.yml"
);
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
  "HAS_UNPUBLISHED_PACKAGE=0",
  "continuing idempotent rerun",
  "npm run release:publish:status -- --strict",
  'gh release view "${TAG_NAME}"',
  "release already exists; skipping release creation.",
  'npm publish "${PUBLISH_TARGET}" --ignore-scripts --access public --provenance --tag'
].filter((needle) => !publishWorkflowSource.includes(needle));

if (publishAuthEnvCount < 2) {
  publishWorkflowSafetyChecks.push(
    "NODE_AUTH_TOKEN must be set for npm auth preflight and npm publish"
  );
}

addCheck({
  detail:
    publishWorkflowSafetyChecks.length > 0
      ? `Missing publish workflow safety config: ${publishWorkflowSafetyChecks.join(", ")}`
      : "",
  evidence: ".github/workflows/publish.yml",
  id: "workflow:publish-safety",
  message:
    "Publish workflow validates npm auth and uses the release package manifest",
  status: publishWorkflowSafetyChecks.length === 0 ? "pass" : "fail"
});

const candidateJavaHomes = [
  process.env.JAVA_HOME,
  "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
  "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home",
  "/usr/local/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
].filter(Boolean);

const resolveJavaStatus = () => {
  const javaResult = spawnSync("java", ["-version"], { encoding: "utf8" });

  if (javaResult.status === 0) {
    return { detail: "", status: "pass" };
  }

  for (const javaHome of candidateJavaHomes) {
    const javaCommand = path.join(javaHome, "bin", "java");
    if (!existsSync(javaCommand)) continue;

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

  return { detail: (javaResult.stderr ?? "").trim(), status: "block" };
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
  if (preview && gate.id === "h6") {
    continue;
  }

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
  const manifestErrors = await validateReleaseEvidenceManifest({
    manifest
  });
  const detail = missingEvidence.filter(Boolean).join("; ");

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
  console.log(JSON.stringify({ checks, preview, strict, totals }, null, 2));
} else {
  console.log(preview ? "Developer Preview gate report" : "Release gate report");
  console.log(
    `pass=${totals.pass} warn=${totals.warn} block=${totals.block} fail=${totals.fail}`
  );

  checks
    .filter((check) => check.status !== "pass")
    .forEach((check) => {
      console.log(
        `[${check.status.toUpperCase()}] ${check.id}: ${check.message}`
      );
      if (check.detail) console.log(`  ${check.detail}`);
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
