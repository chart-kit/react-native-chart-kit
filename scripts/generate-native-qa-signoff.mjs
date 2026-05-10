import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const defaultOutputPath = "docs/release/native-qa-signoff-worksheet.md";
const defaultRepoRoot = process.cwd();

const markdown = [
  "# Native QA Signoff Worksheet",
  "",
  "Deprecated.",
  "",
  "There is no active signoff worksheet. Use [Smoke Test Checks](smoke-test-checks.md).",
  "",
  "Owner feedback can be casual conversation. Release engineering or agents are responsible for recording useful notes.",
  ""
].join("\n");

const parseArgs = (argv) => {
  const options = {
    outputPath: defaultOutputPath
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--check") {
      options.check = true;
    } else if (arg === "--output") {
      options.outputPath = readValue();
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
};

export const generateNativeQaSignoffWorksheet = () => markdown;

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const outputPath = path.join(defaultRepoRoot, options.outputPath);

  if (options.check) {
    const current = await readFile(outputPath, "utf8");

    if (current !== markdown) {
      console.error(
        `${options.outputPath} is out of date. Run node scripts/generate-native-qa-signoff.mjs.`
      );
      process.exit(1);
    }

    console.log(`${options.outputPath} is up to date.`);
    return;
  }

  await writeFile(outputPath, markdown, "utf8");
  console.log(`Wrote ${options.outputPath}.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
