import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateNativeQaSignoffWorksheet } from "./generate-native-qa-signoff.mjs";

const repoRoot = process.cwd();

describe("native QA signoff worksheet generator", () => {
  it("expands open rows into reviewer checklists", async () => {
    const markdown = await generateNativeQaSignoffWorksheet({
      matrixName: "runtime",
      repoRoot,
      status: "partial"
    });

    expect(markdown).toContain("Open rows: 16");
    expect(markdown).toContain("### ios-line-charts");
    expect(markdown).toContain(
      "- [ ] line: scrub selection updates continuously and does not flicker"
    );
    expect(markdown).toContain("- [ ] Device / OS recorded");
    expect(markdown).toContain("npm run release:qa:record --");
  });

  it("keeps the committed worksheet in sync with open rows", () => {
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
