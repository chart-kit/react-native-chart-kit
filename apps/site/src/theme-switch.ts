type ThemeMode = "dark" | "light";

const storageKey = "starlight-theme";
const themeColor = {
  dark: "#06070a",
  light: "#f7f8fb"
};

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "dark" || value === "light";

const getStoredTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(storageKey);

    if (isThemeMode(stored)) {
      return stored;
    }
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
};

const getSwitches = () =>
  Array.from(document.querySelectorAll<HTMLElement>(".chartkit-theme-switch"));

const syncSwitches = (theme: ThemeMode) => {
  getSwitches().forEach((switchElement) => {
    switchElement
      .querySelectorAll<HTMLButtonElement>("[data-theme-value]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.themeValue === theme)
        );
      });
  });
};

const syncToggles = (theme: ThemeMode) => {
  const nextTheme = theme === "dark" ? "light" : "dark";

  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((button) => {
      button.dataset.themeCurrent = theme;
      button.dataset.themeNext = nextTheme;
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.setAttribute("title", `Switch to ${nextTheme} mode`);
    });
};

const syncSelects = (theme: ThemeMode) => {
  document
    .querySelectorAll<HTMLSelectElement>("starlight-theme-select select")
    .forEach((select) => {
      if (select.value !== theme) {
        select.value = theme;
      }
    });
};

const updateThemeColor = (theme: ThemeMode) => {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );

  if (meta) {
    meta.content = themeColor[theme];
  }
};

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Persisting the preference is best-effort.
  }

  updateThemeColor(theme);
  syncSelects(theme);
  syncSwitches(theme);
  syncToggles(theme);
  window.StarlightThemeProvider?.updatePickers(theme);
};

const handleSwitchClick = (event: Event) => {
  const toggle = (event.target as Element | null)?.closest<HTMLButtonElement>(
    "[data-theme-toggle]"
  );

  if (toggle) {
    const theme = getStoredTheme() === "dark" ? "light" : "dark";
    applyTheme(theme);
    return;
  }

  const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
    "[data-theme-value]"
  );
  const theme = button?.dataset.themeValue ?? null;

  if (isThemeMode(theme)) {
    applyTheme(theme);
  }
};

const createSwitch = () => {
  const switchElement = document.createElement("div");
  switchElement.className = "chartkit-theme-switch";
  switchElement.setAttribute("role", "group");
  switchElement.setAttribute("aria-label", "Color theme");
  switchElement.innerHTML = `
    <button type="button" data-theme-value="dark">Dark</button>
    <button type="button" data-theme-value="light">Light</button>
  `;

  return switchElement;
};

const enhanceStarlightSelects = () => {
  document
    .querySelectorAll<HTMLElement>("starlight-theme-select")
    .forEach((themeSelect) => {
      if (themeSelect.dataset.chartkitEnhanced === "true") {
        return;
      }

      themeSelect.dataset.chartkitEnhanced = "true";
      themeSelect.append(createSwitch());
    });
};

const bootThemeSwitches = () => {
  enhanceStarlightSelects();

  if (!window.__chartkitThemeSwitchBound) {
    window.__chartkitThemeSwitchBound = true;
    document.addEventListener("click", handleSwitchClick);
  }

  applyTheme(getStoredTheme());
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootThemeSwitches, {
    once: true
  });
} else {
  bootThemeSwitches();
}

customElements.whenDefined("starlight-theme-select").then(() => {
  enhanceStarlightSelects();
  applyTheme(getStoredTheme());
});

declare global {
  interface Window {
    StarlightThemeProvider?: {
      updatePickers: (theme?: string) => void;
    };
    __chartkitThemeSwitchBound?: boolean;
  }
}

export {};
