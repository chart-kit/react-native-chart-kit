import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateNativeQaChecklist } from "./generate-native-qa-checklists.mjs";

const repoRoot = process.cwd();

describe("native QA checklist generator", () => {
  it("generates a deprecation notice instead of matrix rows", () => {
    const markdown = generateNativeQaChecklist();

    expect(markdown).toContain("# Native QA Checklists");
    expect(markdown).toContain("Deprecated.");
    expect(markdown).toContain("Smoke Test Checks");
    expect(markdown).not.toContain("ios-line-charts");
  });

  it("keeps the committed checklist notice in sync", () => {
    expect(() =>
      execFileSync(
        process.execPath,
        [
          join(repoRoot, "scripts/generate-native-qa-checklists.mjs"),
          "--check"
        ],
        {
          cwd: repoRoot,
          encoding: "utf8"
        }
      )
    ).not.toThrow();
  });
});
