import chartKitDocsRemark from "./remark-strip-duplicate-title.mjs";

export const chartKitMarkdownPatches = () => ({
  name: "chart-kit-markdown-patches",
  hooks: {
    "config:setup"({ addIntegration }) {
      addIntegration({
        name: "chart-kit-docs-remark",
        hooks: {
          "astro:config:setup"({ config, updateConfig }) {
            updateConfig({
              markdown: {
                ...config.markdown,
                remarkPlugins: [
                  ...(config.markdown.remarkPlugins ?? []),
                  chartKitDocsRemark
                ]
              }
            });
          }
        }
      });
    }
  }
});
