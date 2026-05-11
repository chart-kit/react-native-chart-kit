#!/usr/bin/env node

import process from "node:process";

import { npmViewPackage } from "./check-npm-publish-state.mjs";

export const getPackageExistsStatus = async ({
  name,
  npmView = npmViewPackage,
  version
}) => {
  if (!name || !version) {
    return {
      code: 2,
      message: "Usage: node scripts/check-npm-package-exists.mjs <package-name> <version>",
      status: "invalid-args"
    };
  }

  const result = await npmView({ name, version });

  if (result.exists) {
    return {
      code: 0,
      message: `${name}@${version} is published.`,
      status: "published"
    };
  }

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

export const main = async () => {
  const [name, version] = process.argv.slice(2);
  const result = await getPackageExistsStatus({ name, version });

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
