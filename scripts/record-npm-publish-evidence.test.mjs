import { describe, expect, it } from "vitest";

import { buildNpmPublishState } from "./check-npm-publish-state.mjs";
import { buildNpmPublishEvidence } from "./record-npm-publish-evidence.mjs";

const manifest = {
  distTag: "next",
  packages: [
    {
      name: "@chart-kit/core",
      publishInDeveloperPreview: true
    },
    {
      name: "@chart-kit/svg-renderer",
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
      name: "@chart-kit/skia-renderer",
      publishInDeveloperPreview: false
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

describe("npm publish evidence recorder", () => {
  it("builds complete evidence from a complete npm publish state", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "@chart-kit/core": {
          distTags: { latest: "7.0.0-next.1", next: "7.0.0-next.1" },
          versions: ["7.0.0-next.1"]
        },
        "@chart-kit/react-native": {
          distTags: { latest: "7.0.0-next.1", next: "7.0.0-next.1" },
          versions: ["7.0.0-next.1"]
        },
        "@chart-kit/svg-renderer": {
          distTags: { latest: "7.0.0-next.1", next: "7.0.0-next.1" },
          versions: ["7.0.0-next.1"]
        },
        "react-native-chart-kit": {
          distTags: { latest: "6.12.2", next: "7.0.0-next.1" },
          versions: ["6.12.2", "7.0.0-next.1"]
        }
      }),
      version: "7.0.0-next.1"
    });

    const evidence = buildNpmPublishEvidence({
      date: "2026-05-11",
      releaseUrl:
        "https://github.com/indiespirit/react-native-chart-kit/releases/tag/v7.0.0-next.1",
      runUrl:
        "https://github.com/indiespirit/react-native-chart-kit/actions/runs/123",
      state
    });

    expect(evidence.status).toBe("complete");
    expect(evidence.lastUpdated).toBe("2026-05-11");
    expect(evidence.completedEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          result:
            "Published react-native-chart-kit@7.0.0-next.1 to npm under the next dist-tag while preserving react-native-chart-kit@latest at 6.12.2."
        }),
        expect.objectContaining({
          result: "Created GitHub prerelease v7.0.0-next.1."
        })
      ])
    );
    expect(evidence.notes.join("\n")).toContain(
      "npm keeps latest=7.0.0-next.1 on @chart-kit/core"
    );
    expect(evidence.completedEntries[1].artifacts).toContain(
      "https://www.npmjs.com/package/@chart-kit/core/v/7.0.0-next.1"
    );
  });

  it("refuses to build evidence from partial publish state", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "react-native-chart-kit": {
          distTags: { latest: "6.12.2", next: "7.0.0-next.1" },
          versions: ["6.12.2", "7.0.0-next.1"]
        }
      }),
      version: "7.0.0-next.1"
    });

    expect(() =>
      buildNpmPublishEvidence({
        releaseUrl:
          "https://github.com/indiespirit/react-native-chart-kit/releases/tag/v7.0.0-next.1",
        runUrl:
          "https://github.com/indiespirit/react-native-chart-kit/actions/runs/123",
        state
      })
    ).toThrow(/publish state is partial/);
  });

  it("requires workflow and release URLs", async () => {
    const state = await buildNpmPublishState({
      distTag: "next",
      manifest,
      npmView: createNpmView({
        "@chart-kit/core": {},
        "@chart-kit/react-native": {},
        "@chart-kit/svg-renderer": {},
        "react-native-chart-kit": {
          distTags: { latest: "6.12.2", next: "7.0.0-next.1" },
          versions: ["6.12.2", "7.0.0-next.1"]
        }
      }),
      version: "7.0.0-next.1"
    });

    expect(() =>
      buildNpmPublishEvidence({
        releaseUrl: "https://github.com/indiespirit/react-native-chart-kit",
        state
      })
    ).toThrow(/--run-url is required/);
    expect(() =>
      buildNpmPublishEvidence({
        releaseUrl: "not-a-url",
        runUrl:
          "https://github.com/indiespirit/react-native-chart-kit/actions/runs/123",
        state
      })
    ).toThrow(/--release-url must be an http/);
  });
});
