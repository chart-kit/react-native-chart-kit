import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateNativeQaChecklist } from "./generate-native-qa-checklists.mjs";

const repoRoot = process.cwd();

describe("native QA checklist generator", () => {
  it("generates actionable checklist rows from all native evidence matrices", async () => {
    const markdown = await generateNativeQaChecklist({ repoRoot });

    expect(markdown).toContain("| Runtime QA | 16 | 0 | 16 | 0 | 0 | 0 |");
    expect(markdown).toContain(
      "| Accessibility QA | 16 | 0 | 16 | 0 | 0 | 0 |"
    );
    expect(markdown).toContain(
      "| Native Performance | 18 | 0 | 18 | 0 | 0 | 0 |"
    );
    expect(markdown).toContain("`ios-line-charts`");
    expect(markdown).toContain("`android-talkback-compatibility`");
    expect(markdown).toContain("`ios-svg-standard-line-scrub`");
    expect(markdown).toContain("### Deferred Rows");
  });

  it("keeps the committed checklist in sync with the matrices", () => {
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
