import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateNativeQaChecklist } from "./generate-native-qa-checklists.mjs";

const repoRoot = process.cwd();

describe("native QA checklist generator", () => {
  it("generates actionable checklist rows from all native evidence matrices", async () => {
    const markdown = await generateNativeQaChecklist({ repoRoot });

    expect(markdown).toContain("| Runtime QA | 16 | 0 | 9 | 7 | 0 | 0 | 0 |");
    expect(markdown).toContain(
      "| Accessibility QA | 16 | 0 | 0 | 16 | 0 | 0 | 0 |"
    );
    expect(markdown).toContain(
      "| Native Performance | 18 | 0 | 0 | 18 | 0 | 0 | 0 |"
    );
    expect(markdown).toContain("| Skia Renderer | 8 | 0 | 0 | 8 | 0 | 0 | 0 |");
    expect(markdown).toContain("`ios-line-charts`");
    expect(markdown).toContain(
      "chartkitshowcase://showcase?view=charts&page=line-area"
    );
    expect(markdown).toContain(
      "chartkitshowcase://showcase?view=charts&page=compat"
    );
    expect(markdown).toContain("`v2-perf-bar-500-selection`");
    expect(markdown).toContain("Expected Story Metrics");
    expect(markdown).toContain("bar; 500 total; 24 visible; 1 series");
    expect(markdown).toContain(
      "chartkitshowcase://showcase?view=charts&story=v2-perf-bar-500-selection"
    );
    expect(markdown).toContain("`android-talkback-compatibility`");
    expect(markdown).toContain("`ios-svg-standard-line-scrub`");
    expect(markdown).toContain("`ios-skia-native-install`");
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
