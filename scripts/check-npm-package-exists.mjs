#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 5_000;

export const npmViewPackage = ({ name, version }) => {
  const result = spawnSync(
    "npm",
    ["view", `${name}@${version}`, "version", "--json"],
    {
      encoding: "utf8",
      timeout: 30_000
    }
  );

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const error = output.trim();

    return {
      error,
      errorKind: /E404|404 Not Found/i.test(error)
        ? "not-found"
        : "registry-error",
      exists: false
    };
  }

  return {
    exists: true,
    value: {
      version: JSON.parse(result.stdout)
    }
  };
};

const sleep = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const toNonNegativeInteger = (value, fallback) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    return fallback;
  }

  return numberValue;
};

const getMissingResult = ({ name, result, version }) => {
  if (result.errorKind === "not-found" || !result.errorKind) {
    return {
      code: 1,
      message: `${name}@${version} is not published.`,
      status: "missing"
    };
  }

  return {
    code: 2,
    message: `Unable to read npm registry state for ${name}@${version}: ${result.error || result.errorKind}`,
    status: "registry-error"
  };
};

export const parseCliArgs = (argv) => {
  const positional = [];
  const options = {
    retries: DEFAULT_RETRIES,
    retryDelayMs: DEFAULT_RETRY_DELAY_MS
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--retries") {
      options.retries = toNonNegativeInteger(argv[index + 1], DEFAULT_RETRIES);
      index += 1;
      continue;
    }

    if (arg.startsWith("--retries=")) {
      options.retries = toNonNegativeInteger(
        arg.slice("--retries=".length),
        DEFAULT_RETRIES
      );
      continue;
    }

    if (arg === "--retry-delay-ms") {
      options.retryDelayMs = toNonNegativeInteger(
        argv[index + 1],
        DEFAULT_RETRY_DELAY_MS
      );
      index += 1;
      continue;
    }

    if (arg.startsWith("--retry-delay-ms=")) {
      options.retryDelayMs = toNonNegativeInteger(
        arg.slice("--retry-delay-ms=".length),
        DEFAULT_RETRY_DELAY_MS
      );
      continue;
    }

    positional.push(arg);
  }

  const [name, version] = positional;

  return {
    name,
    ...options,
    version
  };
};

export const getPackageExistsStatus = async ({
  name,
  npmView = npmViewPackage,
  onRetry,
  retries = DEFAULT_RETRIES,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  sleepFn = sleep,
  version
}) => {
  if (!name || !version) {
    return {
      code: 2,
      message:
        "Usage: node scripts/check-npm-package-exists.mjs <package-name> <version> [--retries n] [--retry-delay-ms ms]",
      status: "invalid-args"
    };
  }

  const maxRetries = toNonNegativeInteger(retries, DEFAULT_RETRIES);
  const delayMs = toNonNegativeInteger(retryDelayMs, DEFAULT_RETRY_DELAY_MS);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const result = await npmView({ name, version });

    if (result.exists) {
      return {
        code: 0,
        message: `${name}@${version} is published.`,
        status: "published"
      };
    }

    const missingResult = getMissingResult({ name, result, version });

    if (attempt === maxRetries) {
      return missingResult;
    }

    onRetry?.({
      attempt: attempt + 1,
      delayMs,
      maxRetries,
      result: missingResult
    });

    await sleepFn(delayMs);
  }

  return {
    code: 1,
    message: `${name}@${version} is not published.`,
    status: "missing"
  };
};

export const main = async () => {
  const { name, retries, retryDelayMs, version } = parseCliArgs(
    process.argv.slice(2)
  );
  const result = await getPackageExistsStatus({
    name,
    onRetry: ({ attempt, delayMs, maxRetries, result: retryResult }) => {
      console.log(
        `${retryResult.message} Retrying npm registry check ${attempt}/${maxRetries} in ${delayMs}ms.`
      );
    },
    retries,
    retryDelayMs,
    version
  });

  const output = result.code === 2 ? console.error : console.log;
  output(result.message);
  process.exit(result.code);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
