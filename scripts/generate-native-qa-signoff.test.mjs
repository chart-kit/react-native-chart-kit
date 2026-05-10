import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateNativeQaSignoffWorksheet } from "./generate-native-qa-signoff.mjs";

const repoRoot = process.cwd();

describe("native QA signoff worksheet generator", () => {
  it("generates a deprecation notice instead of signoff rows", () => {
    const markdown = generateNativeQaSignoffWorksheet();

    expect(markdown).toContain("# Native QA Signoff Worksheet");
    expect(markdown).toContain("Deprecated.");
    expect(markdown).toContain("Smoke Test Checks");
    expect(markdown).not.toContain("Open rows:");
    expect(markdown).not.toContain("Reviewer Signoff:");
  });

  it("keeps the committed worksheet notice in sync", () => {
    expect(() =>
      execFileSync(
        process.execPath,
        [join(repoRoot, "scripts/generate-native-qa-signoff.mjs"), "--check"],
        {
          cwd: repoRoot,
          encoding: "utf8"
        }
      )
    ).not.toThrow();
  });
});
