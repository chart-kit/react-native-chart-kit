import React from "react";
import { createRoot, type Root } from "react-dom/client";

import { ChartPlayground } from "./ChartPlayground";
import { ChartPreview } from "./ChartPreview";

const roots = new WeakMap<Element, Root>();

const mountPreview = (element: Element) => {
  const id = element.getAttribute("data-preview-id");

  if (!id || roots.has(element)) {
    return;
  }

  const root = createRoot(element);
  roots.set(element, root);
  root.render(<ChartPreview id={id} />);
};

const mountPlayground = (element: Element) => {
  const id = element.getAttribute("data-preview-id");
  const code = element.getAttribute("data-code");

  if (!id || !code || roots.has(element)) {
    return;
  }

  const root = createRoot(element);
  roots.set(element, root);
  root.render(<ChartPlayground code={code} id={id} />);
};

class ChartKitPreviewElement extends HTMLElement {
  connectedCallback() {
    mountPreview(this);
  }
}

class ChartKitPlaygroundElement extends HTMLElement {
  connectedCallback() {
    mountPlayground(this);
  }
}

const scan = () => {
  const previews = Array.from(document.querySelectorAll("chart-kit-preview"));
  const playgrounds = Array.from(
    document.querySelectorAll("chart-kit-playground")
  );

  previews.forEach(mountPreview);
  playgrounds.forEach(mountPlayground);
};

if (!customElements.get("chart-kit-preview")) {
  customElements.define("chart-kit-preview", ChartKitPreviewElement);
}

if (!customElements.get("chart-kit-playground")) {
  customElements.define("chart-kit-playground", ChartKitPlaygroundElement);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scan, { once: true });
} else {
  scan();
}
