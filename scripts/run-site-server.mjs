import { spawn, spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const mode = process.argv[2] ?? "dev";
const forwardedArgs = process.argv.slice(3);
const allowedModes = new Set(["dev", "preview"]);

if (!allowedModes.has(mode)) {
  throw new Error(
    `Expected site server mode to be dev or preview, got ${mode}.`
  );
}

const sitePort = String(process.env.CHART_KIT_SITE_PORT ?? "4321");
const forwardedPort =
  readArgValue(forwardedArgs, "--port") ?? readArgValue(forwardedArgs, "-p");
const siteHost = String(
  readArgValue(forwardedArgs, "--host") ??
    readArgValue(forwardedArgs, "-h") ??
    process.env.CHART_KIT_SITE_HOST ??
    "127.0.0.1"
);
const siteViteCacheDir = String(
  process.env.CHART_KIT_SITE_VITE_CACHE_DIR ??
    path.join("node_modules", ".vite", "site-server")
);
const cleanupPorts = parsePortList(
  process.env.CHART_KIT_SITE_CLEAN_PORTS ?? "4321-4330"
);

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

function readArgValue(args, longName, shortName) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const names = [longName, shortName].filter(Boolean);

    for (const name of names) {
      if (arg === name) {
        return args[index + 1];
      }

      if (arg.startsWith(`${name}=`)) {
        return arg.slice(name.length + 1);
      }
    }
  }

  return undefined;
}

function stripArgs(args, namesToStrip) {
  const stripped = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const name = [...namesToStrip].find(
      (candidate) => arg === candidate || arg.startsWith(`${candidate}=`)
    );

    if (!name) {
      stripped.push(arg);
      continue;
    }

    if (arg === name) {
      index += 1;
    }
  }

  return stripped;
}

function parsePortList(value) {
  const ports = new Set();

  for (const part of value.split(",")) {
    const range = part.trim();

    if (!range) {
      continue;
    }

    if (range.includes("-")) {
      const [rawStart, rawEnd] = range.split("-");
      const start = Number(rawStart);
      const end = Number(rawEnd);

      if (Number.isInteger(start) && Number.isInteger(end)) {
        for (let port = start; port <= end; port += 1) {
          ports.add(String(port));
        }
      }

      continue;
    }

    const port = Number(range);

    if (Number.isInteger(port)) {
      ports.add(String(port));
    }
  }

  ports.add(sitePort);

  return [...ports];
}

function pidsForPort(port) {
  const result = spawnSync(
    "lsof",
    ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fp"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }
  );

  if (result.status !== 0) {
    return [];
  }

  return [
    ...new Set(
      result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("p"))
        .map((line) => Number(line.slice(1)))
        .filter((pid) => Number.isInteger(pid) && pid > 0)
    )
  ];
}

function commandForPid(pid) {
  const result = spawnSync("ps", ["-p", String(pid), "-o", "command="], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });

  return result.status === 0 ? result.stdout.trim() : "";
}

function isChartKitSiteProcess(command) {
  const normalizedCommand = command.replaceAll("\\", "/");
  const normalizedRoot = repoRoot.replaceAll("\\", "/");

  return (
    !command ||
    (normalizedCommand.includes(normalizedRoot) &&
      /\b(astro|vite|run-site-server\.mjs)\b/.test(normalizedCommand))
  );
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function stopExistingSiteServers() {
  const pidPorts = new Map();

  for (const port of cleanupPorts) {
    for (const pid of pidsForPort(port)) {
      if (pid === process.pid) {
        continue;
      }

      const ports = pidPorts.get(pid) ?? [];
      ports.push(port);
      pidPorts.set(pid, ports);
    }
  }

  const stoppedPids = [];

  for (const [pid, ports] of pidPorts) {
    const command = commandForPid(pid);

    if (!isChartKitSiteProcess(command)) {
      console.log(
        `Leaving PID ${pid} on port ${ports.join(",")} because it is not this site.`
      );
      continue;
    }

    try {
      process.kill(pid, "SIGTERM");
      stoppedPids.push(pid);
      console.log(
        `Stopped stale site server PID ${pid} on port ${ports.join(",")}.`
      );
    } catch (error) {
      console.warn(`Unable to stop PID ${pid}: ${error.message}`);
    }
  }

  if (stoppedPids.length === 0) {
    return;
  }

  await sleep(800);

  for (const pid of stoppedPids) {
    if (!isPidAlive(pid)) {
      continue;
    }

    try {
      process.kill(pid, "SIGKILL");
      console.log(`Force-stopped stale site server PID ${pid}.`);
    } catch {
      // The process may have exited between the liveness check and SIGKILL.
    }
  }
}

async function clearSiteViteCache() {
  const cacheDir = path.isAbsolute(siteViteCacheDir)
    ? siteViteCacheDir
    : path.join(repoRoot, "apps", "site", siteViteCacheDir);

  await rm(cacheDir, { force: true, recursive: true });
  console.log(`Cleared site Vite cache at ${cacheDir}.`);
}

const strippedArgs = stripArgs(
  forwardedArgs,
  new Set(["--host", "-h", "--port", "-p"])
).filter((arg) => arg !== "--force");
const astroArgs = [
  "--host",
  siteHost,
  "--port",
  sitePort,
  "--force",
  ...strippedArgs
];

await stopExistingSiteServers();
await clearSiteViteCache();

if (forwardedPort && String(forwardedPort) !== sitePort) {
  console.warn(
    `Ignoring requested --port ${forwardedPort}; set CHART_KIT_SITE_PORT=${forwardedPort} to intentionally move the single docs server.`
  );
}

console.log(`Starting site ${mode} server on http://${siteHost}:${sitePort}/`);

const child = spawn(
  "npm",
  ["--workspace", "@chart-kit/site", "run", mode, "--", ...astroArgs],
  {
    cwd: repoRoot,
    env: {
      ...process.env,
      CHART_KIT_SITE_VITE_CACHE_DIR: siteViteCacheDir
    },
    stdio: "inherit"
  }
);

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    const signalExitCodes = {
      SIGINT: 130,
      SIGTERM: 143
    };

    process.exit(signalExitCodes[signal] ?? 1);
    return;
  }

  process.exit(code ?? 0);
});
