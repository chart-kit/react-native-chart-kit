import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  checkFileSizes,
  formatFileSizeReport
} from "./check-file-sizes.mjs";

const createFixtureRepo = async () => {
  const repoRoot = await mkdtemp(join(tmpdir(), "chartkit-file-size-"));
  await mkdir(join(repoRoot, "packages/core/src"), { recursive: true });
  await mkdir(join(repoRoot, "packages/core/dist"), { recursive: true });

  return repoRoot;
};

describe("file size checker", () => {
  it("reports files above the configured line budget", async () => {
    const repoRoot = await createFixtureRepo();

    await writeFile(
      join(repoRoot, "packages/core/src/large.ts"),
      Array.from({ length: 6 }, (_, index) => `line${index}`).join("\n"),
      "utf8"
    );
    await writeFile(
      join(repoRoot, "packages/core/src/small.ts"),
      "line1\nline2\n",
      "utf8"
    );
    await writeFile(
      join(repoRoot, "packages/core/dist/generated.ts"),
      Array.from({ length: 20 }, (_, index) => `line${index}`).join("\n"),
      "utf8"
    );

    const result = await checkFileSizes({ maxLines: 5, repoRoot });

    expect(result).toMatchObject({
      checked: 2,
      maxLines: 5,
      oversized: [{ lines: 6, path: "packages/core/src/large.ts" }]
    });
    expect(formatFileSizeReport(result)).toContain(
      "packages/core/src/large.ts: 6 lines"
    );
  });

  it("prints a pass message when all scanned files are within budget", async () => {
    const result = await checkFileSizes({
      repoRoot: process.cwd()
    });

    expect(result.oversized).toEqual([]);
    expect(formatFileSizeReport(result)).toContain("File size check passed");
  });
});
