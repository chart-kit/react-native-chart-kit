import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = process.cwd();
const manifestPath = "docs/release/evidence/native-release-workflow.json";

const readJson = async (repoRoot, relativePath) =>
  JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));

const writeJson = async (repoRoot, relativePath, value) =>
  writeFile(
    path.join(repoRoot, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );

const getToday = () => new Date().toISOString().slice(0, 10);

const isExternalEvidenceLink = (value) => /^https?:\/\//.test(value);

const pathExists = async (repoRoot, relativePath) => {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
};

const parseArgs = (argv) => {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--android-artifact") {
      options.androidArtifact = readValue();
    } else if (arg === "--commit") {
      options.commit = readValue();
    } else if (arg === "--date") {
      options.date = readValue();
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--ios-artifact") {
      options.iosArtifact = readValue();
    } else if (arg === "--list") {
      options.list = true;
    } else if (arg === "--run-url") {
      options.runUrl = readValue();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

const assertRequired = (options) => {
  const missing = [
    ["--android-artifact", options.androidArtifact],
    ["--commit", options.commit],
    ["--ios-artifact", options.iosArtifact],
    ["--run-url", options.runUrl]
  ]
    .filter(([, value]) => !value)
    .map(([flag]) => flag);

  if (missing.length > 0) {
    throw new Error(`${missing.join(", ")} required to record workflow pass`);
  }
};

const assertArtifactEvidenceExists = async ({
  androidArtifact,
  iosArtifact,
  repoRoot
}) => {
  const missing = [];

  for (const artifact of [iosArtifact, androidArtifact]) {
    if (
      !isExternalEvidenceLink(artifact) &&
      !(await pathExists(repoRoot, artifact))
    ) {
      missing.push(artifact);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Artifact evidence must be an external URL or existing repo file: ${missing.join(
        ", "
      )}`
    );
  }
};

export const listNativeWorkflowEvidence = async ({
  repoRoot = defaultRepoRoot
} = {}) => {
  const manifest = await readJson(repoRoot, manifestPath);

  return {
    completedEntries: manifest.completedEntries ?? [],
    missingEvidence: manifest.missingEvidence ?? [],
    status: manifest.status ?? "missing",
    summary: manifest.summary
  };
};

export const recordNativeWorkflowEvidence = async ({
  androidArtifact,
  commit,
  date = getToday(),
  dryRun = false,
  iosArtifact,
  repoRoot = defaultRepoRoot,
  runUrl
}) => {
  const options = {
    androidArtifact,
    commit,
    iosArtifact,
    runUrl
  };
  assertRequired(options);
  await assertArtifactEvidenceExists({
    androidArtifact,
    iosArtifact,
    repoRoot
  });

  const manifest = await readJson(repoRoot, manifestPath);
  const localEntries = (manifest.completedEntries ?? []).filter(
    (entry) => entry.scope !== "native-release-workflow"
  );
  const workflowEntry = {
    artifacts: [iosArtifact, androidArtifact],
    commit,
    date,
    result: "workflow-pass",
    runUrl,
    scope: "native-release-workflow"
  };
  const nextManifest = {
    ...manifest,
    completedEntries: [...localEntries, workflowEntry],
    lastUpdated: date,
    missingEvidence: [],
    status: "complete",
    summary:
      "Native release workflow passed with archived iOS and Android release evidence artifacts."
  };

  if (!dryRun) {
    await writeJson(repoRoot, manifestPath, nextManifest);
  }

  return {
    dryRun,
    manifestPath,
    status: nextManifest.status,
    workflowEntry
  };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  if (options.list) {
    const evidence = await listNativeWorkflowEvidence();

    console.log(`status\t${evidence.status}`);
    console.log(`summary\t${evidence.summary ?? ""}`);
    console.log(
      `missing\t${
        evidence.missingEvidence.length > 0
          ? evidence.missingEvidence.join("; ")
          : "none"
      }`
    );
    for (const entry of evidence.completedEntries) {
      console.log(
        `entry\t${entry.date ?? ""}\t${entry.result ?? ""}\t${
          entry.commit ?? entry.platform ?? ""
        }`
      );
    }
    return;
  }

  const result = await recordNativeWorkflowEvidence(options);

  console.log(
    `${result.dryRun ? "Would update" : "Updated"} ${
      result.manifestPath
    } to ${result.status} for ${result.workflowEntry.commit}.`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
