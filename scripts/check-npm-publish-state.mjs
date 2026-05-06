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
    ["view", `${name}@${version}`, "version", "dist-tags", "--json"],
    {
      encoding: "utf8"
    }
  );

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    return {
      error: output.trim(),
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
    return {
      distTags: {},
      published: false,
      version: undefined
    };
  }

  return {
    distTags: viewResult.value?.["dist-tags"] ?? {},
    published: true,
    version: viewResult.value?.version
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
    const hasUnexpectedLatestTag =
      packageInfo.publishInBeta &&
      distTag !== "latest" &&
      version.includes("-") &&
      latestVersion === version;

    let status = "pass";
    const expected = packageInfo.publishInBeta
      ? `published under ${distTag}`
      : "unpublished for Developer Preview";

    if (packageInfo.publishInBeta && !viewResult.published) {
      status = "missing";
    } else if (packageInfo.publishInBeta && taggedVersion !== version) {
      status = "wrong-dist-tag";
    } else if (hasUnexpectedLatestTag) {
      status = "unexpected-latest-tag";
    } else if (!packageInfo.publishInBeta && viewResult.published) {
      status = "unexpected-published";
    }

    entries.push({
      distTag,
      expected,
      name: packageInfo.name,
      publishInBeta: packageInfo.publishInBeta === true,
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

  return [
    `NPM publish state: ${state.status}`,
    `Version: ${state.version}`,
    `Dist-tag: ${state.distTag}`,
    ...rows
  ].join("\n");
};

export const main = async () => {
  const args = new Set(process.argv.slice(2));
  const repoRoot = process.cwd();
  const packageJson = await readJson(path.join(repoRoot, "package.json"));
  const manifest = await readJson(path.join(repoRoot, defaultManifestPath));
  const state = await buildNpmPublishState({
    distTag: manifest.distTag ?? "next",
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
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
