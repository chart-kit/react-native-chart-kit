const sanitizePart = (part: string): string => {
  return part
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const createSvgTestId = (...parts: Array<string | number>): string => {
  return parts.map(String).map(sanitizePart).filter(Boolean).join(".");
};
