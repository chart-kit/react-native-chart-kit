# Skia Renderer QA

Status on May 10, 2026: Skia remains unpublished and preview-only.

Active checks:

```sh
npm run skia:typecheck
npm run skia:parity
npm run skia:native:dry-run
```

Current evidence lives in [skia-renderer-evidence.json](evidence/skia-renderer-evidence.json). Older Skia matrix artifacts may remain in `docs/release/evidence/`, but they are no longer part of the active Developer Preview gate.

Do not publish `@chart-kit/skia-renderer` until the product/package boundary is approved for a stable release.
