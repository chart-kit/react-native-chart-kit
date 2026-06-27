type RuntimeConsole = Record<string, unknown>;
type RuntimeRoot = {
  console?: RuntimeConsole;
  global?: unknown;
};

declare const global: unknown;

const noop = () => undefined;

const consoleMethods = [
  "debug",
  "error",
  "info",
  "log",
  "trace",
  "warn"
] as const;

function getRuntimeRoots() {
  const roots: RuntimeRoot[] = [];
  const addRoot = (value: unknown) => {
    if (value && typeof value === "object") {
      const root = value as RuntimeRoot;
      if (!roots.includes(root)) {
        roots.push(root);
      }
    }
  };

  addRoot(globalThis);
  addRoot((globalThis as unknown as RuntimeRoot).global);

  try {
    if (typeof global !== "undefined") {
      addRoot(global);
    }
  } catch {
    // Some embedded runtimes expose only globalThis.
  }

  return roots;
}

export function ensureRuntimeConsole() {
  const roots = getRuntimeRoots();
  const runtimeConsole =
    roots
      .map((root) => root.console)
      .find((value) => value && typeof value === "object") ?? {};

  for (const root of roots) {
    root.console = runtimeConsole;
  }

  for (const method of consoleMethods) {
    if (typeof runtimeConsole[method] !== "function") {
      runtimeConsole[method] = noop;
    }
  }

  if (typeof runtimeConsole.assert !== "function") {
    runtimeConsole.assert = (condition?: unknown, ...messages: unknown[]) => {
      if (!condition) {
        (runtimeConsole.error as (...args: unknown[]) => void)(...messages);
      }
    };
  }

  return runtimeConsole;
}

ensureRuntimeConsole();
