import { describe, expect, it } from "vitest";

import { buildNpmPublishState } from "./check-npm-publish-state.mjs";

const manifest = {
  distTag: "next",
  packages: [
    {
      name: "@chart-kit/core",
      publishInBeta: true
    },
    {
      name: "@chart-kit/react-native",
      publishInBeta: true
    },
    {
      name: "react-native-chart-kit",
      publishInBeta: true
    },
    {
      name: "@chart-kit/pro",
      publishInBeta: false
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
      version: value.version ?? version
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
        "@chart-kit/core": { distTags: { beta: "7.0.0-next.0" } },
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
          distTags: { latest: "7.0.0-next.0", next: "7.0.0-next.0" }
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
});
