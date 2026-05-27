import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const publicDocs = [
  "README.md",
  "getting-started/**/*.md",
  "migration/**/*.md",
  "charts/**/*.md",
  "recipes/**/*.md",
  "troubleshooting.md"
];

const getRouteId = (entry: string) => {
  if (entry === "README.md") {
    return "docs";
  }

  if (entry.endsWith("/README.md")) {
    return `docs/${entry.slice(0, -"/README.md".length)}`;
  }

  return `docs/${entry.replace(/\.mdx?$/, "")}`;
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
