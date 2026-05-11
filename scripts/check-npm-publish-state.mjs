import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const defaultManifestPath = "docs/release/evidence/package-manifest.json";

export const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, "utf8"));

export const npmViewPackage = ({ name, version }) => {
  const result = spawnSync(
    "npm",
    ["view", `${name}@${version}`, "version", "dist-tags", "versions", "--json"],
    {
      encoding: "utf8",
      timeout: 30_000
    }
  );

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const error = output.trim();

    return {
      error,
      errorKind: /E404|404 Not Found/i.test(error)
        ? "not-found"
        : "registry-error",
      exists: false
    };
  }

  return {
    exists: true,
    value: JSON.parse(result.stdout)
  };
};

const normalizeNpmView = (viewResult) => {
  if (!viewResult.exists) {
    if (viewResult.errorKind && viewResult.errorKind !== "not-found") {
      throw new Error(
        `Unable to read npm registry state: ${viewResult.error || viewResult.errorKind}`
      );
    }

    return {
      distTags: {},
      published: false,
      version: undefined,
      versions: []
    };
  }

  return {
    distTags: viewResult.value?.["dist-tags"] ?? {},
    published: true,
    version: viewResult.value?.version,
    versions: viewResult.value?.versions ?? []
  };
};

export const buildNpmPublishState = async ({
  distTag,
  manifest,
  npmView = npmViewPackage,
  version
}) => {
  const packages = manifest.packages ?? [];

  if (!Array.isArray(packages) || packages.length === 0) {
    throw new Error("Package manifest must define at least one package.");
  }

  const entries = [];

  for (const packageInfo of packages) {
    if (!packageInfo.name) {
      throw new Error("Package manifest entries must include name.");
    }

    const viewResult = normalizeNpmView(
      await npmView({ name: packageInfo.name, version })
    );
    const taggedVersion = viewResult.distTags[distTag];
    const latestVersion = viewResult.distTags.latest;
    const hasStableVersion = viewResult.versions.some(
      (publishedVersion) => !publishedVersion.includes("-")
    );
    const publishInDeveloperPreview =
      packageInfo.publishInDeveloperPreview === true;
    const hasUnexpectedLatestTag =
      publishInDeveloperPreview &&
      distTag !== "latest" &&
      version.includes("-") &&
      latestVersion === version &&
      hasStableVersion;
    const hasForcedPreviewLatestTag =
      publishInDeveloperPreview &&
      distTag !== "latest" &&
      version.includes("-") &&
      latestVersion === version &&
      !hasStableVersion;

    let status = "pass";
    const expected = publishInDeveloperPreview
      ? `published under ${distTag}`
      : "unpublished for Developer Preview";

    if (publishInDeveloperPreview && !viewResult.published) {
      status = "missing";
    } else if (publishInDeveloperPreview && taggedVersion !== version) {
      status = "wrong-dist-tag";
    } else if (hasUnexpectedLatestTag) {
      status = "unexpected-latest-tag";
    } else if (!publishInDeveloperPreview && viewResult.published) {
      status = "unexpected-published";
    }

    entries.push({
      distTag,
      expected,
      hasForcedPreviewLatestTag,
      hasStableVersion,
      name: packageInfo.name,
      publishInDeveloperPreview,
      published: viewResult.published,
      status,
      taggedVersion,
      latestVersion,
      version,
      visibleVersion: viewResult.version
    });
  }

  const failures = entries.filter((entry) => entry.status !== "pass");
  const missingPublishable = failures.filter((entry) =>
    ["missing", "wrong-dist-tag"].includes(entry.status)
  );
  const unexpectedPublished = failures.filter(
    (entry) => entry.status === "unexpected-published"
  );

  return {
    distTag,
    entries,
    status:
      failures.length === 0
        ? "complete"
        : unexpectedPublished.length > 0
          ? "failed"
          : missingPublishable.length > 0
            ? "partial"
            : "failed",
    version
  };
};

const formatState = (state) => {
  const rows = state.entries.map((entry) => {
    const tagText = entry.taggedVersion
      ? `${entry.distTag}=${entry.taggedVersion}`
      : `${entry.distTag}=<missing>`;
    const latestText = entry.latestVersion
      ? `, latest=${entry.latestVersion}`
      : "";
    const publishedText = entry.published ? "published" : "not published";

    return `- ${entry.name}@${entry.version}: ${entry.status} (${publishedText}, ${tagText}${latestText}; expected ${entry.expected})`;
  });

  const forcedLatestRows = state.entries
    .filter((entry) => entry.hasForcedPreviewLatestTag)
    .map(
      (entry) =>
        `- ${entry.name}: npm keeps latest=${entry.version} because no stable version has been published yet.`
    );

  return [
    `NPM publish state: ${state.status}`,
    `Version: ${state.version}`,
    `Dist-tag: ${state.distTag}`,
    ...rows,
    ...(forcedLatestRows.length > 0
      ? ["Preview latest-tag notes:", ...forcedLatestRows]
      : [])
  ].join("\n");
};

const readArgValue = (argList, flag) => {
  const inlineValue = argList.find((arg) => arg.startsWith(`${flag}=`));
  if (inlineValue) {
    return inlineValue.slice(flag.length + 1);
  }

  const index = argList.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return argList[index + 1];
};

export const readExpectedStatusArg = (argList) => {
  const expectedStatus = readArgValue(argList, "--expect");
  const validStatuses = new Set(["complete", "partial", "failed"]);

  if (expectedStatus && !validStatuses.has(expectedStatus)) {
    throw new Error(
      `Unsupported expected publish state "${expectedStatus}". Use complete, partial, or failed.`
    );
  }

  return expectedStatus;
};

export const readDistTagArg = (argList, fallback) => {
  const distTag = readArgValue(argList, "--dist-tag") ?? fallback;
  const validDistTags = new Set(["next", "latest"]);

  if (!validDistTags.has(distTag)) {
    throw new Error(
      `Unsupported npm dist-tag "${distTag}". Use next or latest.`
    );
  }

  return distTag;
};

export const main = async () => {
  const argList = process.argv.slice(2);
  const args = new Set(argList);
  const repoRoot = process.cwd();
  const packageJson = await readJson(path.join(repoRoot, "package.json"));
  const manifest = await readJson(path.join(repoRoot, defaultManifestPath));
  const expectedStatus = readExpectedStatusArg(argList);
  const distTag = readDistTagArg(argList, manifest.distTag ?? "next");

  const state = await buildNpmPublishState({
    distTag,
    manifest,
    version: packageJson.version
  });

  if (args.has("--json")) {
    console.log(JSON.stringify(state, null, 2));
  } else {
    console.log(formatState(state));
  }

  if (args.has("--strict") && state.status !== "complete") {
    process.exit(1);
  }

  if (expectedStatus && state.status !== expectedStatus) {
    console.error(
      `Expected npm publish state ${expectedStatus}, received ${state.status}.`
    );
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
