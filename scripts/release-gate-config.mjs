export const requiredFiles = [
  "docs/internal/repo-audit.md",
  "docs/internal/current-api-inventory.md",
  "docs/internal/compatibility-matrix-draft.md",
  "docs/internal/completion-audit.md",
  "docs/internal/prompt-to-artifact-checklist.md",
  "docs/release/beta-checklist.md",
  "docs/release/deprecation-policy.md",
  "docs/release/h4-pro-scope.md",
  "docs/release/h4-owner-decision-memo.md",
  "docs/release/h5-beta-gate-evidence.md",
  "docs/release/h5-owner-decision-memo.md",
  "docs/release/h6-finalization-checklist.md",
  "docs/release/h6-owner-decision-memo.md",
  "docs/release/h6-rc-readiness-packet.md",
  "docs/release/h6-release-notes-draft.md",
  "docs/release/h6-semver-proposal.md",
  "docs/release/known-issues.md",
  "docs/release/native-workflow-runbook.md",
  "docs/release/smoke-test-checks.md",
  "docs/release/native-release-checks.md",
  "docs/release/native-release-results.md",
  "docs/release/rn-cli-example-qa.md",
  "docs/release/skia-renderer-qa.md",
  "docs/release/artifacts/owner-smoke-notes-2026-05-10.md",
  "docs/release/evidence/native-release-workflow.json",
  "docs/release/evidence/rn-cli-example-evidence.json",
  "docs/release/evidence/npm-publish-evidence.json",
  "docs/release/evidence/owner-gates.json",
  "docs/release/evidence/package-manifest.json",
  "docs/release/evidence/skia-renderer-evidence.json",
  ".github/workflows/publish.yml",
  ".github/workflows/native-release.yml",
  "scripts/release-gate-config.mjs",
  "scripts/release-gate-validation.mjs",
  "scripts/release-skia-artifacts.mjs",
  "scripts/run-skia-native-release-check.mjs",
  "scripts/record-native-workflow-evidence.mjs",
  "scripts/record-owner-gate-decision.mjs",
  "scripts/run-rn-cli-native-check.mjs",
  "packages/core/package.json",
  "packages/react-native/package.json",
  "packages/svg-renderer/package.json",
  "packages/skia-renderer/package.json",
  "packages/pro/package.json",
  "apps/expo-showcase/package.json",
  "apps/expo-showcase/src/storyRegistry.tsx",
  "apps/expo-showcase/src/stories/performanceStoryMetadata.json",
  "apps/expo-showcase/visual/stories.ts",
  "examples/rn-cli-basic/package.json"
];

export const requiredScripts = [
  "lint",
  "filesize:check",
  "typecheck",
  "test",
  "test:unit",
  "test:visual",
  "test:compat",
  "test:e2e",
  "benchmark",
  "boundaries:check",
  "example:ios",
  "example:android",
  "example:expo",
  "example:rn-cli:typecheck",
  "example:rn-cli:native:dry-run",
  "example:rn-cli:android",
  "example:rn-cli:ios",
  "docs:build",
  "surface:check",
  "security:audit",
  "skia:parity",
  "skia:native:dry-run",
  "skia:native:release",
  "native:release:dry-run",
  "native:release:android",
  "native:release:ios",
  "pack:check",
  "release:native-workflow:record",
  "release:owner:record",
  "release:publish:status",
  "release:preview:gate",
  "release:preview:gate:report",
  "release:gate",
  "release:gate:report"
];

export const releaseBlockers = [
  {
    id: "audit-not-complete",
    file: "docs/internal/completion-audit.md",
    pattern: /Status on .*: not complete\./,
    message: "Completion audit still says the v2/v2 Pro plan is not complete."
  },
  {
    id: "native-android-release",
    file: "docs/release/known-issues.md",
    pattern: /Android .*blocked locally by missing Android SDK/i,
    message:
      "Android release-build evidence is still blocked locally by Android SDK configuration."
  }
];

export const releaseEvidenceManifests = [
  {
    id: "developer-preview-publish",
    file: "docs/release/evidence/npm-publish-evidence.json"
  },
  {
    id: "native-workflow-evidence",
    file: "docs/release/evidence/native-release-workflow.json"
  },
  {
    id: "rn-cli-example",
    file: "docs/release/evidence/rn-cli-example-evidence.json"
  },
  {
    id: "skia-backend",
    file: "docs/release/evidence/skia-renderer-evidence.json"
  }
];

export const ownerGateMessages = {
  h4: "H4 Pro/free boundary approval is still open.",
  h5: "H5 Developer Preview approval is still open.",
  h6: "H6 release-candidate approval is not started."
};
