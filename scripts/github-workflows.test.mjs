import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, ".github/workflows");

const readWorkflowSources = async () => {
  const files = (await readdir(workflowsDir))
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .sort();

  return Promise.all(
    files.map(async (file) => ({
      file,
      source: await readFile(path.join(workflowsDir, file), "utf8")
    }))
  );
};

describe("GitHub workflows", () => {
  it("uses lockfile-based npm installs for reproducible CI and release runs", async () => {
    const workflows = await readWorkflowSources();

    for (const { file, source } of workflows) {
      expect(source, `${file} should use setup-node npm cache`).toContain(
        "cache: npm"
      );
      expect(source, `${file} should install from package-lock.json`).toContain(
        "npm ci --ignore-scripts"
      );
      expect(
        source,
        `${file} should not mutate package-lock.json`
      ).not.toContain("npm install --ignore-scripts");
    }
  });
});
