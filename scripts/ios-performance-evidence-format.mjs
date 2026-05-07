import path from "node:path";

export const parseIosProcessInfo = ({ executableName, psOutput }) => {
  const lines = psOutput.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d+)\s+(\d+)\s+(.+)$/);

    if (!match) continue;

    const [, pid, rssKb, command] = match;
    const basename = path.basename(command);

    if (
      basename === executableName ||
      command.includes(`/${executableName}.app/`)
    ) {
      return {
        command,
        pid: Number(pid),
        rssKb: Number(rssKb)
      };
    }
  }

  return {
    command: "",
    pid: undefined,
    rssKb: undefined
  };
};

const formatMetric = (value, suffix = "") =>
  Number.isFinite(value) ? `${value.toLocaleString("en-US")}${suffix}` : "n/a";

export const createIosPerformanceMarkdown = ({
  bundleId,
  commandText,
  commands,
  commit,
  deviceInfo,
  executableName,
  launchElapsedMs,
  packageVersion,
  processAfterLaunch,
  processAfterScenario,
  rendererLabel,
  row,
  screenshotPath
}) =>
  [
    `# ${row.id} iOS Performance Sample`,
    "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    `Commit: \`${commit || "n/a"}\``,
    `Package version: \`${packageVersion || "n/a"}\``,
    "Platform: iOS simulator",
    `Build: release app, \`${bundleId}\``,
    `Executable: \`${executableName}\``,
    `Renderer: ${rendererLabel ?? `${row.renderer ?? "svg"} through React Native SVG`}`,
    `Scenario: ${row.target}`,
    `Showcase story: \`${row.showcaseStoryId}\``,
    `Deep link: \`${row.launchUrl}\``,
    "",
    "Expected fixture:",
    "",
    `- Chart type: ${row.expectedStoryMetrics?.chartType ?? "n/a"}`,
    `- Total points: ${formatMetric(row.expectedStoryMetrics?.totalPoints)}`,
    `- Visible points: ${formatMetric(row.expectedStoryMetrics?.visiblePoints)}`,
    `- Series count: ${formatMetric(row.expectedStoryMetrics?.seriesCount)}`,
    "",
    "Device:",
    "",
    `- Target: ${deviceInfo.target}`,
    `- Booted devices: ${deviceInfo.bootedDevices || "n/a"}`,
    "",
    "Commands used:",
    "",
    "```sh",
    ...commands.map((item) => commandText(item.command, item.args)),
    "```",
    "",
    "Launch timing:",
    "",
    "| Metric | Result |",
    "| --- | ---: |",
    `| simctl openurl command elapsed | ${formatMetric(launchElapsedMs, " ms")} |`,
    "",
    "Memory:",
    "",
    "| Metric | After launch | After scenario wait |",
    "| --- | ---: | ---: |",
    `| PID | ${formatMetric(processAfterLaunch.pid)} | ${formatMetric(
      processAfterScenario.pid
    )} |`,
    `| RSS | ${formatMetric(processAfterLaunch.rssKb, " KB")} | ${formatMetric(
      processAfterScenario.rssKb,
      " KB"
    )} |`,
    "",
    "Artifact:",
    "",
    `- Screenshot: [${path.basename(screenshotPath)}](${path.basename(screenshotPath)})`,
    "",
    "Notes:",
    "",
    "- This is iOS release-simulator evidence for one native performance matrix row.",
    "- It captures launch command timing, process RSS, and a screenshot only.",
    "- It does not replace Instruments frame timing, physical-device performance, synthetic gesture coverage, Skia parity, or manual visible-correctness review.",
    ""
  ].join("\n");
