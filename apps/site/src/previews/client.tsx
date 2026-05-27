import React from "react";
import { createRoot, type Root } from "react-dom/client";

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

class ChartKitPreviewElement extends HTMLElement {
  connectedCallback() {
    mountPreview(this);
  }
}

const scan = () => {
  const previews = Array.from(document.querySelectorAll("chart-kit-preview"));

  previews.forEach(mountPreview);
};

if (!customElements.get("chart-kit-preview")) {
  customElements.define("chart-kit-preview", ChartKitPreviewElement);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scan, { once: true });
} else {
  scan();
}
