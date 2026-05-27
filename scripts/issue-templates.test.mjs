import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = new URL("..", import.meta.url).pathname;
const templateDir = join(repoRoot, ".github/ISSUE_TEMPLATE");

const readTemplate = (name) => readFileSync(join(templateDir, name), "utf8");

const expectFields = (source, ids) => {
  for (const id of ids) {
    expect(source).toContain(`id: ${id}`);
  }
};

describe("GitHub issue templates", () => {
  it("requires actionable layout bug report fields", () => {
    const source = readTemplate("layout-bug.yml");

    expectFields(source, [
      "chart_type",
      "version",
      "platform",
      "renderer",
      "data_sample",
      "props",
      "screenshots",
      "expected",
      "actual"
    ]);
    expect(source).toContain("debugLayout screenshot");
  });

  it("requires actionable compatibility bug report fields", () => {
    const source = readTemplate("compatibility-bug.yml");

    expectFields(source, [
      "old_version",
      "new_version",
      "component",
      "legacy_props",
      "screenshots",
      "compatibility_tried"
    ]);
  });

  it("requires actionable performance bug report fields", () => {
    const source = readTemplate("performance-bug.yml");

    expectFields(source, [
      "version",
      "device",
      "platform",
      "renderer",
      "chart_type",
      "total_points",
      "visible_points",
      "interaction",
      "reproduction"
    ]);
    expect(source).toContain("npm run benchmark");
  });
});
