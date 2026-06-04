import path from "node:path";

const textFromNode = (node) => {
  if (!node) {
    return "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  if (Array.isArray(node.children)) {
    return node.children.map(textFromNode).join("");
  }

  return "";
};

const visit = (node, callback) => {
  callback(node);

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => visit(child, callback));
  }
};

const getDocsEntryPath = (file) => {
  const rawPath = (file.path ?? file.history?.[0] ?? "").replaceAll("\\", "/");
  const docsMarker = "/docs/";
  const markerIndex = rawPath.lastIndexOf(docsMarker);

  if (markerIndex !== -1) {
    return rawPath.slice(markerIndex + docsMarker.length);
  }

  if (rawPath.startsWith("docs/")) {
    return rawPath.slice("docs/".length);
  }

  return undefined;
};

const docsRoutePrefix = "/docs/react-native";

const getDocsRoute = (docsPath) => {
  if (docsPath === "README.md") {
    return `${docsRoutePrefix}/`;
  }

  if (docsPath.endsWith("/README.md")) {
    return `${docsRoutePrefix}/${docsPath.slice(0, -"/README.md".length)}/`;
  }

  return `${docsRoutePrefix}/${docsPath.replace(/\.mdx?$/, "")}/`;
};

const rewriteMarkdownLinks = (tree, file) => {
  const entryPath = getDocsEntryPath(file);

  if (!entryPath) {
    return;
  }

  const entryDirectory = path.posix.dirname(entryPath);

  visit(tree, (node) => {
    if (node.type !== "link" || typeof node.url !== "string") {
      return;
    }

    if (
      node.url.startsWith("#") ||
      node.url.startsWith("//") ||
      /^[a-z][a-z\d+.-]*:/i.test(node.url)
    ) {
      return;
    }

    const [, target = "", suffix = ""] = node.url.match(/^([^?#]*)(.*)$/) ?? [];

    if (!/\.mdx?$/.test(target)) {
      return;
    }

    const docsPath = path.posix
      .normalize(path.posix.join(entryDirectory, target))
      .replace(/^\.\//, "");

    if (docsPath.startsWith("../")) {
      return;
    }

    node.url = `${getDocsRoute(docsPath)}${suffix}`;
  });
};

const escapeAttribute = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const encodeCodeAttribute = (value) => encodeURIComponent(String(value));

const playgroundDocs = new Set([
  "getting-started/installation.md",
  "charts/area.md",
  "charts/bar.md",
  "charts/contribution-heatmap.md",
  "charts/candlebar.md",
  "charts/combo.md",
  "charts/donut.md",
  "charts/line.md",
  "charts/pie.md",
  "charts/progress.md",
  "charts/radar.md"
]);

const chartComponentPattern =
  /<\s*(AreaChart|BarChart|CandlebarChart|CandlestickChart|ComboChart|ContributionGraph|DonutChart|LineChart|PieChart|ProgressChart|ProgressRing|RadarChart|StackedBarChart)\b/;

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getPreviewHtml = (id, title) => {
  const titleAttribute =
    typeof title === "string" && title.length > 0
      ? ` data-preview-title="${escapeAttribute(title)}"`
      : "";

  return `<chart-kit-preview data-preview-id="${escapeAttribute(
    id
  )}"${titleAttribute}><div class="chart-kit-preview-fallback">Loading chart preview</div></chart-kit-preview>`;
};

const getPlaygroundHtml = (id, code, title) => {
  const titleAttribute =
    typeof title === "string" && title.length > 0
      ? ` data-preview-title="${escapeAttribute(title)}"`
      : "";

  return `<chart-kit-playground data-preview-id="${escapeAttribute(
    id
  )}" data-code="${escapeAttribute(
    encodeCodeAttribute(code)
  )}"${titleAttribute}><div class="chart-kit-preview-fallback"><pre><code>${escapeHtml(
    code
  )}</code></pre></div></chart-kit-playground>`;
};

const isRenderableChartExample = (node, docsPath) =>
  playgroundDocs.has(docsPath) &&
  node?.type === "code" &&
  ["jsx", "tsx"].includes(node.lang) &&
  chartComponentPattern.test(node.value ?? "");

const getGeneratedPreviewId = (docsPath, title, index) => {
  const pathSlug = slugify(
    docsPath.replace(/\/README\.md$/, "").replace(/\.mdx?$/, "")
  );
  const titleSlug = slugify(title || "example");

  return `${pathSlug}-${titleSlug || "example"}-${index}`;
};

const transformPreviewDirectives = (tree, file) => {
  const docsPath = getDocsEntryPath(file);

  if (Array.isArray(tree.children)) {
    let currentHeading = file.data?.astro?.frontmatter?.title ?? "";
    let generatedPreviewIndex = 0;

    for (let index = 0; index < tree.children.length; index += 1) {
      const node = tree.children[index];

      if (node.type === "heading" && node.depth >= 2) {
        currentHeading = textFromNode(node).trim();
        continue;
      }

      if (
        isRenderableChartExample(node, docsPath) &&
        tree.children[index + 1]?.type !== "leafDirective"
      ) {
        generatedPreviewIndex += 1;
        node.type = "html";
        node.value = getPlaygroundHtml(
          getGeneratedPreviewId(
            docsPath,
            currentHeading,
            generatedPreviewIndex
          ),
          node.value,
          currentHeading
        );
        node.children = [];
        continue;
      }

      if (node.type !== "leafDirective" || node.name !== "chart-preview") {
        continue;
      }

      const id = node.attributes?.id;

      if (typeof id !== "string" || id.length === 0) {
        node.type = "html";
        node.value =
          '<div class="chart-kit-preview-fallback">Missing chart preview id</div>';
        node.children = [];
        continue;
      }

      const previousNode = tree.children[index - 1];

      if (
        previousNode?.type === "code" &&
        ["jsx", "tsx"].includes(previousNode.lang)
      ) {
        const title = node.attributes?.title;

        previousNode.type = "html";
        previousNode.value = getPlaygroundHtml(id, previousNode.value, title);
        previousNode.children = [];
        tree.children.splice(index, 1);
        index -= 1;
        continue;
      }

      node.type = "html";
      node.value = getPreviewHtml(id, node.attributes?.title);
      node.children = [];
    }
  }

  visit(tree, (node) => {
    if (node.type !== "leafDirective" || node.name !== "chart-preview") {
      return;
    }

    const id = node.attributes?.id;

    if (typeof id !== "string" || id.length === 0) {
      node.type = "html";
      node.value =
        '<div class="chart-kit-preview-fallback">Missing chart preview id</div>';
      node.children = [];
      return;
    }

    node.type = "html";
    node.value = getPreviewHtml(id, node.attributes?.title);
    node.children = [];
  });
};

export default function stripDuplicateTitle() {
  return (tree, file) => {
    const title =
      file.data?.astro?.frontmatter?.title ?? file.data?.frontmatter?.title;

    if (!title || !Array.isArray(tree.children)) {
      return;
    }

    const firstRenderableIndex = tree.children.findIndex(
      (node) => node.type !== "yaml"
    );
    const firstRenderable = tree.children[firstRenderableIndex];

    if (
      firstRenderable?.type === "heading" &&
      firstRenderable.depth === 1 &&
      textFromNode(firstRenderable).trim() === title
    ) {
      tree.children.splice(firstRenderableIndex, 1);
    }

    let hidden = false;

    tree.children = tree.children.filter((node) => {
      if (node.type === "html" && /site:hide:start/.test(node.value ?? "")) {
        hidden = true;
        return false;
      }

      if (node.type === "html" && /site:hide:end/.test(node.value ?? "")) {
        hidden = false;
        return false;
      }

      return !hidden;
    });

    rewriteMarkdownLinks(tree, file);
    transformPreviewDirectives(tree, file);
  };
}
