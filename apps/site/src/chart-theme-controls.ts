import {
  applyChartThemePreset,
  chartThemeOptions,
  getCurrentChartThemePreset,
  isChartThemePreset
} from "./previews/chartTheme";

type ColorTheme = "dark" | "light";

const controlSelector = "[data-chart-theme-control]";
const docsThemeToggleSelector = "[data-docs-theme-toggle]";
const selectSelector = "[data-chart-theme-select]";
const starlightThemeStorageKey = "starlight-theme";
const themeColor = {
  dark: "#06070a",
  light: "#f7f8fb"
};

const isColorTheme = (value: string | null): value is ColorTheme =>
  value === "dark" || value === "light";

const getCurrentColorTheme = (): ColorTheme => {
  try {
    const stored = localStorage.getItem(starlightThemeStorageKey);

    if (isColorTheme(stored)) {
      return stored;
    }
  } catch {
    // Storage can be blocked in restricted browser contexts.
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
};

const syncStarlightThemeSelects = (theme: ColorTheme) => {
  document
    .querySelectorAll<HTMLSelectElement>("starlight-theme-select select")
    .forEach((select) => {
      if (select.value !== theme) {
        select.value = theme;
      }
    });
};

const syncDocsThemeToggles = (theme: ColorTheme) => {
  const nextTheme = theme === "dark" ? "light" : "dark";

  document
    .querySelectorAll<HTMLButtonElement>(docsThemeToggleSelector)
    .forEach((button) => {
      button.dataset.themeCurrent = theme;
      button.dataset.themeNext = nextTheme;
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.setAttribute("title", `Switch to ${nextTheme} mode`);
    });
};

const updateThemeColor = (theme: ColorTheme) => {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );

  if (meta) {
    meta.content = themeColor[theme];
  }
};

const applyColorTheme = (theme: ColorTheme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  try {
    localStorage.setItem(starlightThemeStorageKey, theme);
  } catch {
    // Persisting the preference is best-effort.
  }

  syncStarlightThemeSelects(theme);
  syncDocsThemeToggles(theme);
  updateThemeColor(theme);
  window.StarlightThemeProvider?.updatePickers(theme);
};

const syncChartThemeControls = () => {
  const theme = getCurrentChartThemePreset();

  document
    .querySelectorAll<HTMLSelectElement>(selectSelector)
    .forEach((select) => {
      if (select.value !== theme) {
        select.value = theme;
      }
    });
};

const createChartThemeControl = () => {
  const label = document.createElement("label");
  label.className = "chartkit-chart-theme-control";
  label.dataset.chartThemeControl = "true";

  const text = document.createElement("span");
  text.className = "chartkit-chart-theme-control__label";
  text.textContent = "Chart theme";

  const select = document.createElement("select");
  select.className = "chartkit-chart-theme-control__select";
  select.dataset.chartThemeSelect = "true";
  select.setAttribute("aria-label", "Chart theme");

  chartThemeOptions.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    select.append(item);
  });

  label.append(text, select);

  return label;
};

const createDocsThemeToggle = () => {
  const button = document.createElement("button");
  button.className = "chartkit-docs-theme-toggle";
  button.dataset.docsThemeToggle = "true";
  button.type = "button";
  button.innerHTML = `
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  `;

  return button;
};

const enhanceThemeSelectors = () => {
  document
    .querySelectorAll<HTMLElement>("starlight-theme-select")
    .forEach((themeSelect) => {
      const previousElement = themeSelect.previousElementSibling;

      if (!previousElement?.matches(controlSelector)) {
        themeSelect.before(createChartThemeControl());
      }

      if (themeSelect.dataset.chartkitIconToggle !== "true") {
        themeSelect.dataset.chartkitIconToggle = "true";
        themeSelect.append(createDocsThemeToggle());
      }
    });

  syncChartThemeControls();
  syncDocsThemeToggles(getCurrentColorTheme());
};

const handleChartThemeChange = (event: Event) => {
  const select = (event.target as Element | null)?.closest<HTMLSelectElement>(
    selectSelector
  );

  if (!select || !isChartThemePreset(select.value)) {
    return;
  }

  applyChartThemePreset(select.value);
  syncChartThemeControls();
};

const handleDocsThemeClick = (event: Event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
    docsThemeToggleSelector
  );

  if (!button) {
    return;
  }

  const nextTheme = getCurrentColorTheme() === "dark" ? "light" : "dark";
  applyColorTheme(nextTheme);
};

const bootChartThemeControls = () => {
  enhanceThemeSelectors();
  applyChartThemePreset(getCurrentChartThemePreset(), { dispatch: false });
  applyColorTheme(getCurrentColorTheme());

  if (!window.__chartkitChartThemeControlBound) {
    window.__chartkitChartThemeControlBound = true;
    document.addEventListener("change", handleChartThemeChange);
    document.addEventListener("click", handleDocsThemeClick);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootChartThemeControls, {
    once: true
  });
} else {
  bootChartThemeControls();
}

customElements.whenDefined("starlight-theme-select").then(() => {
  bootChartThemeControls();
});

document.addEventListener("astro:page-load", bootChartThemeControls);

declare global {
  interface Window {
    StarlightThemeProvider?: {
      updatePickers: (theme?: string) => void;
    };
    __chartkitChartThemeControlBound?: boolean;
  }
}

export {};
