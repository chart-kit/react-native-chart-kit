const noop = () => undefined;

const ensureConsole = () => {
  const roots = [];
  const addRoot = (value) => {
    if (value && typeof value === "object" && !roots.includes(value)) {
      roots.push(value);
    }
  };

  addRoot(globalThis);
  addRoot(globalThis.global);

  try {
    if (typeof global !== "undefined") {
      addRoot(global);
    }
  } catch {
    // Some embedded runtimes expose only globalThis.
  }

  const runtimeConsole =
    roots
      .map((root) => root.console)
      .find((value) => value && typeof value === "object") || {};

  for (const root of roots) {
    root.console = runtimeConsole;
  }

  for (const method of ["debug", "error", "info", "log", "trace", "warn"]) {
    if (typeof runtimeConsole[method] !== "function") {
      runtimeConsole[method] = noop;
    }
  }

  if (typeof runtimeConsole.assert !== "function") {
    runtimeConsole.assert = (condition, ...messages) => {
      if (!condition) {
        runtimeConsole.error(...messages);
      }
    };
  }
};

ensureConsole();
