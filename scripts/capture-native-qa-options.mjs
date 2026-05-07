export const defaultAndroidPackage = "io.chartkit.showcase";

const validPlatforms = new Set(["android", "ios"]);

export const captureNativeQaUsage = `Usage:
  node scripts/capture-native-qa-screenshot.mjs --matrix <runtime|accessibility|performance> --row <row-id> --platform <ios|android> [options]

Options:
  --android-log-output <path>  Also clear/capture Android logcat to this repo-relative path.
  --android-log-lines <number> Number of trailing logcat lines to capture. Defaults to 400.
  --android-ui-output <path>   Also capture Android UIAutomator hierarchy XML.
  --device <id>             iOS simulator UDID or Android adb serial. Defaults to booted/default device.
  --dry-run                 Print launch and screenshot commands without executing them.
  --ios-log-output <path>    Also capture iOS simulator logs to this repo-relative path.
  --ios-log-last <duration>  iOS simulator log window. Defaults to 2m.
  --ios-log-predicate <pred> iOS simulator log predicate. Defaults to process == "ChartKitShowcase".
  --no-launch               Capture current screen without opening the row deep link first.
  --output <path>           Repo-relative screenshot path. Defaults to docs/release/artifacts/<row-id>-screenshot.png.
  --package <id>            Android package id. Defaults to io.chartkit.showcase.
  --wait-ms <number>        Delay between launch and capture. Defaults to 1500.
  --help                    Show this help.
`;

export const parseCaptureNativeQaArgs = (argv) => {
  const options = {
    androidPackage: defaultAndroidPackage,
    androidLogLines: 400,
    iosLogLast: "2m",
    iosLogPredicate: 'process == "ChartKitShowcase"',
    launch: true,
    waitMs: 1500
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

    if (arg === "--android-log-lines") {
      options.androidLogLines = Number(readValue());
    } else if (arg === "--android-log-output") {
      options.androidLogOutput = readValue();
    } else if (arg === "--android-ui-output") {
      options.androidUiOutput = readValue();
    } else if (arg === "--device") {
      options.device = readValue();
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--ios-log-last") {
      options.iosLogLast = readValue();
    } else if (arg === "--ios-log-output") {
      options.iosLogOutput = readValue();
    } else if (arg === "--ios-log-predicate") {
      options.iosLogPredicate = readValue();
    } else if (arg === "--matrix") {
      options.matrixName = readValue();
    } else if (arg === "--no-launch") {
      options.launch = false;
    } else if (arg === "--output") {
      options.output = readValue();
    } else if (arg === "--package") {
      options.androidPackage = readValue();
    } else if (arg === "--platform") {
      options.platform = readValue();
    } else if (arg === "--row") {
      options.rowId = readValue();
    } else if (arg === "--wait-ms") {
      options.waitMs = Number(readValue());
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.help) return options;
  if (!options.matrixName) throw new Error("--matrix is required");
  if (!options.rowId) throw new Error("--row is required");
  if (!validPlatforms.has(options.platform)) {
    throw new Error("--platform must be ios or android");
  }
  if (!Number.isFinite(options.waitMs) || options.waitMs < 0) {
    throw new Error("--wait-ms must be a non-negative number");
  }

  return options;
};
