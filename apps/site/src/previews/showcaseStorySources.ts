import barOverviewSource from "../../../expo-showcase/src/stories/barOverviewStories.tsx?raw";
import compatSource from "../../../expo-showcase/src/stories/compatStories.tsx?raw";
import contributionOverviewSource from "../../../expo-showcase/src/stories/contributionOverviewStories.tsx?raw";
import lineInteractionSource from "../../../expo-showcase/src/stories/lineInteractionStories.tsx?raw";
import lineOverviewSource from "../../../expo-showcase/src/stories/lineOverviewStories.tsx?raw";
import lineQaSource from "../../../expo-showcase/src/stories/lineQaStories.tsx?raw";
import lineViewportSource from "../../../expo-showcase/src/stories/lineViewportStories.tsx?raw";
import performanceSource from "../../../expo-showcase/src/stories/performanceStories.tsx?raw";
import pieOverviewSource from "../../../expo-showcase/src/stories/pieOverviewStories.tsx?raw";
import progressOverviewSource from "../../../expo-showcase/src/stories/progressOverviewStories.tsx?raw";

type StorySource = {
  source: string;
};

const storySources: StorySource[] = [
  { source: lineOverviewSource },
  { source: lineInteractionSource },
  { source: lineViewportSource },
  { source: lineQaSource },
  { source: barOverviewSource },
  { source: pieOverviewSource },
  { source: progressOverviewSource },
  { source: contributionOverviewSource },
  { source: performanceSource },
  { source: compatSource }
];

const declarationBoundary =
  /\n(?:const|export const|function|export function|type|export type|interface|export interface)\s+[A-Za-z_$]/g;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSnippet = (source: string) =>
  source
    .trim()
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^const /, "const ");

const extractDeclaration = (source: string, name: string) => {
  const startPattern = new RegExp(
    `(^|\\n)(?:export\\s+)?(?:const|function)\\s+${escapeRegExp(
      name
    )}(?:\\s*=|\\s*\\()`
  );
  const startMatch = startPattern.exec(source);

  if (!startMatch) {
    return undefined;
  }

  const startIndex = startMatch.index + (startMatch[1] ? 1 : 0);
  const tail = source.slice(startIndex);
  declarationBoundary.lastIndex = 1;
  const endMatch = declarationBoundary.exec(tail);
  const endIndex = endMatch ? endMatch.index : tail.length;

  return normalizeSnippet(tail.slice(0, endIndex));
};

const storyComponentPattern =
  /id:\s*"([^"]+)"[\s\S]*?Component:\s*([A-Za-z_$][\w$]*)/g;

const buildStoryComponentNames = () => {
  const namesByStoryId = new Map<string, string>();

  for (const { source } of storySources) {
    storyComponentPattern.lastIndex = 0;
    let match = storyComponentPattern.exec(source);

    while (match) {
      const [, storyId, componentName] = match;

      if (storyId && componentName && !namesByStoryId.has(storyId)) {
        namesByStoryId.set(storyId, componentName);
      }

      match = storyComponentPattern.exec(source);
    }
  }

  return namesByStoryId;
};

const buildStoryCodeSnippets = () => {
  const componentNames = buildStoryComponentNames();
  const snippets: Record<string, string> = {};

  for (const [storyId, componentName] of componentNames) {
    const declaration = storySources
      .map(({ source }) => extractDeclaration(source, componentName))
      .find((snippet): snippet is string => Boolean(snippet));

    if (declaration) {
      snippets[storyId] = declaration;
    }
  }

  return snippets;
};

export const showcaseStoryCodeSnippets = buildStoryCodeSnippets();

export const getShowcaseStoryCodeSnippet = ({
  storyId,
  title
}: {
  storyId: string;
  title: string;
}) =>
  showcaseStoryCodeSnippets[storyId] ??
  `// Source: apps/expo-showcase/src/stories\n// Story: ${storyId}\n<${title.replace(
    /\s+/g,
    ""
  )} width={360} />`;
