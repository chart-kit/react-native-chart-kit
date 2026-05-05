import { access, readFile } from "node:fs/promises";
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
  "example:ios",
  "example:android",
  "example:expo",
  "docs:build",
  "surface:check",
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
    id: "h4-owner-approval",
    file: "docs/internal/completion-audit.md",
    pattern: /H4: open\./,
    message: "H4 Pro/free boundary approval is still open."
  },
  {
    id: "h5-owner-approval",
    file: "docs/internal/completion-audit.md",
    pattern: /H5: open\./,
    message: "H5 beta approval is still open."
  },
  {
    id: "h6-owner-approval",
    file: "docs/internal/completion-audit.md",
    pattern: /H6: not started\./,
    message: "H6 release-candidate approval is not started."
  },
  {
    id: "native-android-release",
    file: "docs/release/known-issues.md",
    pattern:
      /Android cannot run locally because the machine has no Java runtime/,
    message: "Android release-build evidence is still blocked locally by Java."
  },
  {
    id: "native-workflow-evidence",
    file: "docs/release/known-issues.md",
    pattern: /green (native )?(release )?workflow (artifact|run)|green run/i,
    message: "Green native release workflow evidence is still missing."
  },
  {
    id: "native-runtime-qa",
    file: "docs/release/native-runtime-qa.md",
    pattern: /native runtime evidence missing/i,
    message:
      "Native runtime QA protocol exists, but device evidence is missing."
  },
  {
    id: "native-accessibility-qa",
    file: "docs/release/accessibility-qa.md",
    pattern: /native screen-reader evidence missing/i,
    message: "Native VoiceOver/TalkBack evidence is missing."
  },
  {
    id: "native-performance",
    file: "docs/release/native-performance-benchmark.md",
    pattern: /release-device performance evidence missing/i,
    message: "Release-device native performance evidence is missing."
  },
  {
    id: "skia-backend",
    file: "packages/skia-renderer/README.md",
    pattern: /does not import `@shopify\/react-native-skia` yet/i,
    message: "Skia package is still a preview boundary, not a real renderer."
  }
];

const checks = [];

const addCheck = ({ detail = "", evidence = "", id, message, status }) => {
  checks.push({ detail, evidence, id, message, status });
};

const readRepoFile = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

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

const javaResult = spawnSync("java", ["-version"], {
  encoding: "utf8"
});

addCheck({
  detail: javaResult.status === 0 ? "" : (javaResult.stderr ?? "").trim(),
  evidence: "local java -version",
  id: "toolchain:java",
  message: "Java runtime is available for local Android release checks",
  status: javaResult.status === 0 ? "pass" : "block"
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
