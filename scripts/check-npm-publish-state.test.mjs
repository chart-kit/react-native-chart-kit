import { describe, expect, it } from "vitest";

import {
  buildNpmPublishState,
  readExpectedStatusArg
} from "./check-npm-publish-state.mjs";

const manifest = {
  distTag: "next",
  packages: [
    {
      name: "@chart-kit/core",
      publishInDeveloperPreview: true
    },
    {
      name: "@chart-kit/react-native",
      publishInDeveloperPreview: true
    },
    {
      name: "react-native-chart-kit",
      publishInDeveloperPreview: true
    },
    {
      name: "@chart-kit/pro",
      publishInDeveloperPreview: false
    }
  ]
};

const createNpmView = (publishedPackages) => async ({ name, version }) => {
  const value = publishedPackages[name];

  if (!value) {
    return {
      exists: false
    };
  }

  return {
    exists: true,
    value: {
      "dist-tags": value.distTags ?? { next: version },
      version: value.version ?? version,
      versions: value.versions ?? [value.version ?? version]
    }
  };
};

describe("npm publish state checker", () => {
  it("marks publish state complete when free packages are published and preview packages are not", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "@chart-kit/core": {},
        "@chart-kit/react-native": {},
        "react-native-chart-kit": {}
      }),
      version: "7.0.0-next.0"
    });

    expect(state.status).toBe("complete");
    expect(state.entries.map((entry) => [entry.name, entry.status])).toEqual([
      ["@chart-kit/core", "pass"],
      ["@chart-kit/react-native", "pass"],
      ["react-native-chart-kit", "pass"],
      ["@chart-kit/pro", "pass"]
    ]);
  });

  it("marks publish state partial when a publishable package is missing", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "react-native-chart-kit": {}
      }),
      version: "7.0.0-next.0"
    });

    expect(state.status).toBe("partial");
    expect(state.entries.map((entry) => [entry.name, entry.status])).toEqual([
      ["@chart-kit/core", "missing"],
      ["@chart-kit/react-native", "missing"],
      ["react-native-chart-kit", "pass"],
      ["@chart-kit/pro", "pass"]
    ]);
  });

  it("fails when a package has the wrong dist-tag or a preview package is published", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "@chart-kit/core": { distTags: { canary: "7.0.0-next.0" } },
        "@chart-kit/pro": {},
        "@chart-kit/react-native": {},
        "react-native-chart-kit": {}
      }),
      version: "7.0.0-next.0"
    });

    expect(state.status).toBe("failed");
    expect(state.entries.map((entry) => [entry.name, entry.status])).toEqual([
      ["@chart-kit/core", "wrong-dist-tag"],
      ["@chart-kit/react-native", "pass"],
      ["react-native-chart-kit", "pass"],
      ["@chart-kit/pro", "unexpected-published"]
    ]);
  });

  it("fails when a prerelease package is accidentally tagged latest", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "@chart-kit/core": {
          distTags: { latest: "7.0.0-next.0", next: "7.0.0-next.0" },
          versions: ["6.12.2", "7.0.0-next.0"]
        },
        "@chart-kit/react-native": {},
        "react-native-chart-kit": {
          distTags: { latest: "6.12.2", next: "7.0.0-next.0" }
        }
      }),
      version: "7.0.0-next.0"
    });

    expect(state.status).toBe("failed");
    expect(state.entries.map((entry) => [entry.name, entry.status])).toEqual([
      ["@chart-kit/core", "unexpected-latest-tag"],
      ["@chart-kit/react-native", "pass"],
      ["react-native-chart-kit", "pass"],
      ["@chart-kit/pro", "pass"]
    ]);
  });

  it("allows npm's forced latest tag when a scoped preview package has no stable version yet", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "@chart-kit/core": {
          distTags: { latest: "7.0.0-next.0", next: "7.0.0-next.0" },
          versions: ["7.0.0-next.0"]
        },
        "@chart-kit/react-native": {},
        "react-native-chart-kit": {
          distTags: { latest: "6.12.2", next: "7.0.0-next.0" },
          versions: ["6.12.2", "7.0.0-next.0"]
        }
      }),
      version: "7.0.0-next.0"
    });

    expect(state.status).toBe("complete");
    expect(state.entries.map((entry) => [entry.name, entry.status])).toEqual([
      ["@chart-kit/core", "pass"],
      ["@chart-kit/react-native", "pass"],
      ["react-native-chart-kit", "pass"],
      ["@chart-kit/pro", "pass"]
    ]);
    expect(state.entries[0].hasForcedPreviewLatestTag).toBe(true);
  });

  it("fails registry errors instead of treating them as unpublished packages", async () => {
    await expect(
      buildNpmPublishState({
        distTag: "next",
        manifest,
        npmView: async () => ({
          error: "EAI_AGAIN registry.npmjs.org",
          errorKind: "registry-error",
          exists: false
        }),
        version: "7.0.0-next.0"
      })
    ).rejects.toThrow(/Unable to read npm registry state/);
  });

  it("parses expected publish states for pre-publish and post-publish checks", () => {
    expect(readExpectedStatusArg(["--expect", "partial"])).toBe("partial");
    expect(readExpectedStatusArg(["--expect=complete"])).toBe("complete");
    expect(readExpectedStatusArg([])).toBeUndefined();
    expect(() => readExpectedStatusArg(["--expect", "unknown"])).toThrow(
      /Unsupported expected publish state/
    );
  });
});
