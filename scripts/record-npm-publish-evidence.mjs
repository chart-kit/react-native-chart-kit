import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildNpmPublishState,
  npmViewPackage,
  readDistTagArg
} from "./check-npm-publish-state.mjs";

const defaultRepoRoot = process.cwd();
const defaultManifestPath = "docs/release/evidence/package-manifest.json";
const defaultEvidencePath = "docs/release/evidence/npm-publish-evidence.json";

const readJson = async (repoRoot, relativePath) =>
  JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));

const writeJson = async (repoRoot, relativePath, value) =>
  writeFile(
    path.join(repoRoot, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );

const today = () => new Date().toISOString().slice(0, 10);

const readArgValue = (argList, flag) => {
  const inlineValue = argList.find((arg) => arg.startsWith(`${flag}=`));
  if (inlineValue) return inlineValue.slice(flag.length + 1);

  const index = argList.indexOf(flag);
  if (index === -1) return undefined;

  const value = argList[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
};

const assertUrl = (flag, value) => {
  if (!value) {
    throw new Error(`${flag} is required`);
  }

  if (!/^https?:\/\//.test(value)) {
    throw new Error(`${flag} must be an http(s) URL`);
  }
};

const packageUrl = ({ name, version }) =>
  `https://www.npmjs.com/package/${name}/v/${version}`;

const splitEntries = (state) => {
  const publishable = state.entries.filter(
    (entry) => entry.publishInDeveloperPreview
  );
  const previewOnly = state.entries.filter(
    (entry) => !entry.publishInDeveloperPreview
  );
  const root = publishable.find(
    (entry) => entry.name === "react-native-chart-kit"
  );
  const scoped = publishable.filter((entry) => entry !== root);

  return {
    previewOnly,
    publishable,
    root,
    scoped
  };
};

export const buildNpmPublishEvidence = ({
  date = today(),
  releaseUrl,
  runUrl,
  state
}) => {
  if (state.status !== "complete") {
    throw new Error(
      `Cannot record npm publish evidence while publish state is ${state.status}.`
    );
  }

  assertUrl("--run-url", runUrl);
  assertUrl("--release-url", releaseUrl);

  const { previewOnly, root, scoped } = splitEntries(state);
  const previewOnlyNames = previewOnly
    .map((entry) => `${entry.name}@${entry.version}`)
    .join(" and ");
  const scopedNames = scoped
    .map((entry) => `${entry.name}@${entry.version}`)
    .join(", ");
  const latestTagNotes = state.entries
    .filter((entry) => entry.hasForcedPreviewLatestTag)
    .map(
      (entry) =>
        `npm keeps latest=${entry.version} on ${entry.name} because it has no stable version yet. The strict publish-state checker allows this only for new packages without stable versions.`
    );

  return {
    schemaVersion: 1,
    lastUpdated: date,
    status: "complete",
    summary:
      "Developer Preview npm publish is complete for the free package set. The root compatibility package remains stable on latest and all publishable v2 packages are available under next.",
    requiredFor: ["H5", "H6"],
    completedEntries: [
      ...(root
        ? [
            {
              result: `Published ${root.name}@${root.version} to npm under the ${state.distTag} dist-tag while preserving ${root.name}@latest at ${root.latestVersion}.`,
              artifacts: [packageUrl(root), runUrl]
            }
          ]
        : []),
      {
        result:
          scoped.length > 0
            ? `Published ${scopedNames} under the ${state.distTag} dist-tag.`
            : `Published free package set under the ${state.distTag} dist-tag.`,
        artifacts: [...scoped.map(packageUrl), runUrl]
      },
      {
        result: `Verified Developer Preview publish state with npm run release:publish:status -- --strict --dist-tag ${state.distTag}.`,
        artifacts: [
          "scripts/check-npm-publish-state.mjs",
          "scripts/check-npm-publish-state.test.mjs"
        ]
      },
      {
        result: `Confirmed ${previewOnlyNames} remain unpublished for Developer Preview.`,
        artifacts: [runUrl, defaultManifestPath]
      },
      {
        result: `Created GitHub prerelease v${state.version}.`,
        artifacts: [releaseUrl]
      }
    ],
    notes: [
      ...latestTagNotes,
      "Existing react-native-chart-kit users are protected from accidental upgrades because react-native-chart-kit@latest remains on the stable v1 package line and the v2 Developer Preview is installed with the next dist-tag."
    ],
    missingEvidence: []
  };
};

export const recordNpmPublishEvidence = async ({
  date = today(),
  distTag,
  dryRun = false,
  evidencePath = defaultEvidencePath,
  manifestPath = defaultManifestPath,
  npmView = npmViewPackage,
  releaseUrl,
  repoRoot = defaultRepoRoot,
  runUrl
}) => {
  const packageJson = await readJson(repoRoot, "package.json");
  const manifest = await readJson(repoRoot, manifestPath);
  const state = await buildNpmPublishState({
    distTag: distTag ?? manifest.distTag ?? "next",
    manifest,
    npmView,
    version: packageJson.version
  });
  const evidence = buildNpmPublishEvidence({
    date,
    releaseUrl,
    runUrl,
    state
  });

  if (!dryRun) {
    await writeJson(repoRoot, evidencePath, evidence);
  }

  return {
    distTag: state.distTag,
    dryRun,
    evidencePath,
    packageCount: state.entries.length,
    status: evidence.status,
    version: state.version
  };
};

const main = async () => {
  const argList = process.argv.slice(2);
  const args = new Set(argList);
  const distTag = readDistTagArg(argList, "next");
  const result = await recordNpmPublishEvidence({
    date: readArgValue(argList, "--date"),
    distTag,
    dryRun: args.has("--dry-run"),
    releaseUrl: readArgValue(argList, "--release-url"),
    runUrl: readArgValue(argList, "--run-url")
  });

  console.log(
    `${result.dryRun ? "Would record" : "Recorded"} npm publish evidence for ${result.version} (${result.distTag}) in ${result.evidencePath}.`
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
