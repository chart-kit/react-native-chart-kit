import type { ShowcasePresetId, ShowcaseThemeMode } from "./showcaseTheme";

export type ShowcaseSearchParams = {
  get: (key: string) => string | null;
};

const presetIds = new Set<ShowcasePresetId>([
  "default",
  "analytics",
  "fintech",
  "health",
  "ios",
  "material",
  "minimal",
  "highContrast",
  "darkFintech",
  "studio"
]);

const decodeQueryValue = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
};

const getQueryString = (url: string) => {
  const queryStart = url.indexOf("?");

  if (queryStart === -1) {
    return "";
  }

  const fragmentStart = url.indexOf("#", queryStart);

  return url.slice(
    queryStart + 1,
    fragmentStart === -1 ? undefined : fragmentStart
  );
};

export const createShowcaseSearchParams = (
  queryString: string
): ShowcaseSearchParams => {
  const params = new Map<string, string>();
  const normalizedQuery = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  for (const pair of normalizedQuery.split("&")) {
    if (!pair) {
      continue;
    }

    const separatorIndex = pair.indexOf("=");
    const rawKey = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex);
    const rawValue =
      separatorIndex === -1 ? "" : pair.slice(separatorIndex + 1);
    const key = decodeQueryValue(rawKey);

    if (key) {
      params.set(key, decodeQueryValue(rawValue));
    }
  }

  return {
    get: (key: string) => params.get(key) ?? null
  };
};

export const getShowcaseSearchParamsFromUrl = (
  url: string | null | undefined
): ShowcaseSearchParams | null => {
  if (!url) {
    return null;
  }

  return createShowcaseSearchParams(getQueryString(url));
};

export const getThemeModeFromParams = (
  params: ShowcaseSearchParams | null | undefined
): ShowcaseThemeMode => (params?.get("theme") === "dark" ? "dark" : "light");

export const getPresetFromParams = (
  params: ShowcaseSearchParams | null | undefined
): ShowcasePresetId => {
  const preset = params?.get("preset");

  return presetIds.has(preset as ShowcasePresetId)
    ? (preset as ShowcasePresetId)
    : "default";
};
