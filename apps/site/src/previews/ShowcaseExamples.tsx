import React, { useEffect, useMemo, useState } from "react";

import {
  ChartKitProvider,
  resolveCartesianChartThemeConfig
} from "react-native-chart-kit/v2";

import {
  getShowcasePageStoryGroups,
  publicChartMode,
  showcaseModes,
  stories,
  storyFeatureTags,
  type ShowcaseMode,
  type ShowcasePage,
  type ShowcaseStory
} from "../../../expo-showcase/src/storyRegistry";
import {
  showcaseCustomPresets,
  showcaseModeOptions,
  showcasePresetOptions,
  type ShowcasePresetId,
  type ShowcaseThemeMode
} from "../../../expo-showcase/src/showcaseTheme";
import { getShowcaseStoryCodeSnippet } from "./showcaseStorySources";

const allShowcaseModes: ShowcaseMode[] = [publicChartMode, ...showcaseModes];
const storiesById = new Map(stories.map((story) => [story.id, story]));

const getDocumentThemeMode = (): ShowcaseThemeMode => {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
};

const getInitialChartWidth = () => {
  if (typeof window === "undefined") {
    return 420;
  }

  return Math.max(280, Math.min(460, window.innerWidth - 64));
};

const getPageStories = (page: ShowcasePage) =>
  getShowcasePageStoryGroups(page).map((group) => ({
    ...group,
    stories: group.storyIds
      .map((storyId) => storiesById.get(storyId))
      .filter((story): story is ShowcaseStory => story !== undefined)
  }));

export const ShowcaseExamples = () => {
  const [modeId, setModeId] = useState<ShowcaseMode["id"]>(publicChartMode.id);
  const [pageId, setPageId] = useState(publicChartMode.pages[0]?.id ?? "");
  const [themeMode, setThemeMode] =
    useState<ShowcaseThemeMode>(getDocumentThemeMode);
  const [chartPreset, setChartPreset] = useState<ShowcasePresetId>("default");
  const [chartWidth, setChartWidth] = useState(420);
  const selectedMode =
    allShowcaseModes.find((mode) => mode.id === modeId) ?? publicChartMode;
  const selectedPage =
    selectedMode.pages.find((page) => page.id === pageId) ??
    selectedMode.pages[0];
  const pageGroups = getPageStories(selectedPage);
  const selectedTheme = useMemo(
    () =>
      resolveCartesianChartThemeConfig({
        mode: themeMode,
        preset: chartPreset,
        presets: showcaseCustomPresets
      }),
    [chartPreset, themeMode]
  );
  const storyCount = pageGroups.reduce(
    (count, group) => count + group.stories.length,
    0
  );

  useEffect(() => {
    const updateWidth = () => setChartWidth(getInitialChartWidth());

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const updateThemeMode = () => setThemeMode(getDocumentThemeMode());
    const themeObserver = new MutationObserver(updateThemeMode);

    themeObserver.observe(document.documentElement, {
      attributeFilter: ["data-theme"]
    });
    updateThemeMode();

    return () => themeObserver.disconnect();
  }, []);

  const onSelectMode = (nextModeId: ShowcaseMode["id"]) => {
    const nextMode =
      allShowcaseModes.find((mode) => mode.id === nextModeId) ??
      publicChartMode;

    setModeId(nextMode.id);
    setPageId(nextMode.pages[0]?.id ?? "");
  };

  return (
    <section className="showcase-examples">
      <div className="examples-toolbar" aria-label="Example filters">
        <label>
          <span>Mode</span>
          <select
            value={modeId}
            onChange={(event) =>
              onSelectMode(event.target.value as ShowcaseMode["id"])
            }
          >
            {allShowcaseModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Page</span>
          <select
            value={selectedPage.id}
            onChange={(event) => setPageId(event.target.value)}
          >
            {selectedMode.pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Theme</span>
          <select
            value={themeMode}
            onChange={(event) =>
              setThemeMode(event.target.value as ShowcaseThemeMode)
            }
          >
            {showcaseModeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Preset</span>
          <select
            value={chartPreset}
            onChange={(event) =>
              setChartPreset(event.target.value as ShowcasePresetId)
            }
          >
            {showcasePresetOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="examples-summary">
        <p>{selectedPage.description}</p>
        <span>
          {storyCount} examples from Expo showcase · themes from{" "}
          <code>apps/expo-showcase/src/showcaseTheme.ts</code>
        </span>
      </div>

      <ChartKitProvider
        mode={themeMode}
        preset={chartPreset}
        presets={showcaseCustomPresets}
      >
        <div
          className="examples-groups"
          style={
            {
              "--preview-background": selectedTheme.background,
              "--preview-border": selectedTheme.axis,
              "--preview-text": selectedTheme.text,
              "--preview-muted": selectedTheme.mutedText
            } as React.CSSProperties
          }
        >
          {pageGroups.map((group) => (
            <section className="examples-group" key={group.id}>
              {group.title ? (
                <header className="examples-group-header">
                  <h2>{group.title}</h2>
                  {group.description ? <p>{group.description}</p> : null}
                </header>
              ) : null}

              <div className="examples-list">
                {group.stories.map((story) => {
                  const StoryComponent = story.Component;
                  const tags = storyFeatureTags[story.id] ?? [];
                  const snippet = getShowcaseStoryCodeSnippet({
                    storyId: story.id,
                    title: story.title
                  });

                  return (
                    <article
                      className="example-card"
                      id={`example-${story.id}`}
                      key={story.id}
                    >
                      <div className="example-preview">
                        <div className="example-preview-inner">
                          <StoryComponent
                            width={chartWidth}
                            onScrubEnd={() => undefined}
                            onScrubStart={() => undefined}
                          />
                        </div>
                      </div>
                      <div className="example-source">
                        <div className="example-source-header">
                          <div>
                            <span>{story.id}</span>
                            <h3>{story.title}</h3>
                          </div>
                          {tags.length > 0 ? <p>{tags.join(" / ")}</p> : null}
                        </div>
                        <pre>
                          <code>{snippet}</code>
                        </pre>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </ChartKitProvider>
    </section>
  );
};
