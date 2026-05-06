import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { validateAccessibilityMatrixArtifacts } from "./release-accessibility-artifacts.mjs";

const repoRoot = process.cwd();
const readRepoText = (relativePath) =>
  readFile(path.join(repoRoot, relativePath), "utf8");

const matrixWithBaseline = ({ status = "partial" } = {}) => ({
  assistiveTech: [
    {
      id: "ios-voiceover",
      label: "iOS VoiceOver",
      platform: "ios"
    }
  ],
  rows: [
    {
      assistiveTechId: "ios-voiceover",
      evidence: [
        "docs/release/artifacts/accessibility-local-baseline-2026-05-06.md"
      ],
      id: "ios-voiceover-line-charts",
      pageId: "line-charts",
      status
    }
  ]
});

const matrixWithPassRow = ({ evidence, notes } = {}) => ({
  assistiveTech: [
    {
      id: "ios-voiceover",
      label: "iOS VoiceOver",
      platform: "ios"
    }
  ],
  rows: [
    {
      assistiveTechId: "ios-voiceover",
      evidence:
        evidence ?? ["docs/release/artifacts/ios-voiceover-line-charts.md"],
      id: "ios-voiceover-line-charts",
      notes:
        notes ??
        "Manual iOS VoiceOver screen-reader QA passed for Line Charts.",
      pageId: "line-charts",
      status: "pass"
    }
  ]
});

const baselineArtifact = `# Accessibility Local Baseline Evidence

Date: 2026-05-06
Commit: \`abc1234\`
Build surface: local repository checks only

## Commands

npm run test:unit
npm run showcase:typecheck
npm run release:qa:checklists:check

## Results

- Vitest reported chart summary/data-table helpers and Expo showcase data-details coverage guard.

## Scope

Not covered by this local baseline:
- iOS VoiceOver
- Android TalkBack
- native focus order
- physical-device or simulator/emulator screen-reader evidence
`;

describe("accessibility artifact validation", () => {
  it("accepts checked-in accessibility baseline artifacts", async () => {
    const matrix = JSON.parse(
      await readRepoText(
        "docs/release/evidence/native-accessibility-matrix.json"
      )
    );

    await expect(validateAccessibilityMatrixArtifacts(matrix)).resolves.toEqual(
      []
    );
  });

  it("requires local baseline commands and native screen-reader caveats", async () => {
    const errors = await validateAccessibilityMatrixArtifacts(
      matrixWithBaseline(),
      {
        exists: async () => true,
        readText: async () =>
          baselineArtifact
            .replace("npm run showcase:typecheck\n", "")
            .replace("Android TalkBack\n", "")
      }
    );

    expect(errors.join("; ")).toContain("npm run showcase:typecheck");
    expect(errors.join("; ")).toContain("Android TalkBack");
  });

  it("does not allow the local baseline as final accessibility evidence", async () => {
    const errors = await validateAccessibilityMatrixArtifacts(
      matrixWithBaseline({ status: "pass" }),
      {
        exists: async () => true,
        readText: async () => baselineArtifact
      }
    );

    expect(errors.join("; ")).toContain(
      "must not use the local accessibility baseline as final evidence"
    );
  });

  it("requires row-specific screen-reader evidence for pass rows", async () => {
    const errors = await validateAccessibilityMatrixArtifacts(
      matrixWithPassRow({
        evidence: ["docs/release/artifacts/ios-voiceover-overview.md"]
      }),
      {
        exists: async () => true,
        readText: async () => ""
      }
    );

    expect(errors.join("; ")).toContain(
      "must include row-specific screen-reader evidence"
    );
  });

  it("requires final pass notes to name the assistive technology", async () => {
    const errors = await validateAccessibilityMatrixArtifacts(
      matrixWithPassRow({ notes: "Manual screen-reader QA passed." }),
      {
        exists: async () => true,
        readText: async () => ""
      }
    );

    expect(errors.join("; ")).toContain("pass notes must mention iOS VoiceOver");
  });

  it("rejects incomplete pass notes", async () => {
    const errors = await validateAccessibilityMatrixArtifacts(
      matrixWithPassRow({
        notes:
          "Manual iOS VoiceOver screen-reader QA partial; native review still required."
      }),
      {
        exists: async () => true,
        readText: async () => ""
      }
    );

    expect(errors.join("; ")).toContain(
      "pass notes describe incomplete accessibility QA"
    );
  });

  it("accepts row-specific manual screen-reader pass evidence", async () => {
    const errors = await validateAccessibilityMatrixArtifacts(
      matrixWithPassRow(),
      {
        exists: async () => true,
        readText: async () => ""
      }
    );

    expect(errors).toEqual([]);
  });
});
