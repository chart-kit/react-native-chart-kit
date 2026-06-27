import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const publicDocs = [
  "README.md",
  "getting-started/**/*.md",
  "migration/**/*.md",
  "charts/**/*.md",
  "troubleshooting.md"
];
const docsRoutePrefix = "docs/react-native";

const getRouteId = (entry: string) => {
  if (entry === "README.md") {
    return docsRoutePrefix;
  }

  if (entry.endsWith("/README.md")) {
    return `${docsRoutePrefix}/${entry.slice(0, -"/README.md".length)}`;
  }

  return `${docsRoutePrefix}/${entry.replace(/\.mdx?$/, "")}`;
};

export const collections = {
  docs: defineCollection({
    loader: glob({
      pattern: publicDocs,
      base: "../../docs",
      generateId: ({ entry }) => getRouteId(entry)
    }),
    schema: docsSchema()
  })
};
