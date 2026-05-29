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

const getDocsRoute = (docsPath) => {
  if (docsPath === "README.md") {
    return "/docs/";
  }

  if (docsPath.endsWith("/README.md")) {
    return `/docs/${docsPath.slice(0, -"/README.md".length)}/`;
  }

  return `/docs/${docsPath.replace(/\.mdx?$/, "")}/`;
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

const editablePreviewIds = new Set(["line-basic"]);

const encodeCodeAttribute = (value) => encodeURIComponent(String(value));

const getPreviewHtml = (id, title) => {
  const titleAttribute =
    typeof title === "string" && title.length > 0
      ? ` data-preview-title="${escapeAttribute(title)}"`
      : "";

  return `<chart-kit-preview data-preview-id="${escapeAttribute(
    id
  )}"${titleAttribute}><div class="chart-kit-preview-fallback">Loading chart preview</div></chart-kit-preview>`;
};

const transformPreviewDirectives = (tree) => {
  if (Array.isArray(tree.children)) {
    for (let index = 0; index < tree.children.length; index += 1) {
      const node = tree.children[index];

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
        editablePreviewIds.has(id) &&
        previousNode?.type === "code" &&
        ["jsx", "tsx"].includes(previousNode.lang)
      ) {
        const title = node.attributes?.title;
        const titleAttribute =
          typeof title === "string" && title.length > 0
            ? ` data-preview-title="${escapeAttribute(title)}"`
            : "";

        previousNode.type = "html";
        previousNode.value = `<chart-kit-playground data-preview-id="${escapeAttribute(
          id
        )}" data-code="${escapeAttribute(
          encodeCodeAttribute(previousNode.value)
        )}"${titleAttribute}><div class="chart-kit-preview-fallback">Loading chart playground</div></chart-kit-playground>`;
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
    transformPreviewDirectives(tree);
  };
}
