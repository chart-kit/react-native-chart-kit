import path from "node:path";

const parseFirstNumber = (text, pattern) => {
  const match = text.match(pattern);
  return match ? Number(match[1].replaceAll(",", "")) : undefined;
};

export const parseGfxinfo = (text) => ({
  frameDeadlineMissed: parseFirstNumber(
    text,
    /Frame deadline missed:\s+([\d,]+)/
  ),
  jankyFrames: parseFirstNumber(text, /Janky frames:\s+([\d,]+)/),
  p50Ms: parseFirstNumber(text, /50th percentile:\s+([\d.]+)ms/),
  p90Ms: parseFirstNumber(text, /90th percentile:\s+([\d.]+)ms/),
  p95Ms: parseFirstNumber(text, /95th percentile:\s+([\d.]+)ms/),
  p99Ms: parseFirstNumber(text, /99th percentile:\s+([\d.]+)ms/),
  totalFrames: parseFirstNumber(text, /Total frames rendered:\s+([\d,]+)/)
});

export const parseMeminfo = (text) => ({
  nativeHeapPssKb: parseFirstNumber(text, /Native Heap\s+([\d,]+)/),
  totalPssKb: parseFirstNumber(text, /TOTAL PSS:\s+([\d,]+)/),
  totalRssKb: parseFirstNumber(text, /TOTAL RSS:\s+([\d,]+)/)
});

export const parseLaunchOutput = (text) => ({
  totalTimeMs: parseFirstNumber(text, /TotalTime:\s+([\d,]+)/),
  waitTimeMs: parseFirstNumber(text, /WaitTime:\s+([\d,]+)/)
});

const formatMetric = (value, suffix = "") =>
  Number.isFinite(value) ? `${value.toLocaleString("en-US")}${suffix}` : "n/a";

export const createAndroidPerformanceMarkdown = ({
  androidPackage,
  commandText,
  commands,
  commit,
  deviceInfo,
  gfxinfoSummary,
  launchSummary,
  launchOutput,
  meminfoBeforeSummary,
  meminfoSummary,
  packageVersion,
  row,
  screenshotPath
}) =>
  [
    `# ${row.id} Android Performance Sample`,
    "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    `Commit: \`${commit || "n/a"}\``,
    `Package version: \`${packageVersion || "n/a"}\``,
    "Platform: Android emulator",
    `Build: release APK, \`${androidPackage}\``,
    `Renderer: ${row.renderer ?? "svg"} through React Native SVG`,
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
    `- Model: ${deviceInfo.model || "n/a"}`,
    `- Android: ${deviceInfo.androidVersion || "n/a"}`,
    `- Screen: ${deviceInfo.screenSize || "n/a"}`,
    "",
    "Commands used:",
    "",
    "```sh",
    ...commands.map((item) => commandText(item.command, item.args)),
    "```",
    "",
    "Launch output:",
    "",
    "```text",
    launchOutput.trim() || "n/a",
    "```",
    "",
    "Launch timing:",
    "",
    "| Metric | Result |",
    "| --- | ---: |",
    `| TotalTime | ${formatMetric(launchSummary.totalTimeMs, " ms")} |`,
    `| WaitTime | ${formatMetric(launchSummary.waitTimeMs, " ms")} |`,
    "",
    "Frame timing:",
    "",
    "| Metric | Result |",
    "| --- | ---: |",
    `| Total frames rendered | ${formatMetric(gfxinfoSummary.totalFrames)} |`,
    `| Janky frames | ${formatMetric(gfxinfoSummary.jankyFrames)} |`,
    `| p50 frame time | ${formatMetric(gfxinfoSummary.p50Ms, " ms")} |`,
    `| p90 frame time | ${formatMetric(gfxinfoSummary.p90Ms, " ms")} |`,
    `| p95 frame time | ${formatMetric(gfxinfoSummary.p95Ms, " ms")} |`,
    `| p99 frame time | ${formatMetric(gfxinfoSummary.p99Ms, " ms")} |`,
    `| Frame deadline missed | ${formatMetric(gfxinfoSummary.frameDeadlineMissed)} |`,
    "",
    "Memory:",
    "",
    "| Metric | Before scenario | After scenario |",
    "| --- | ---: | ---: |",
    `| Total PSS | ${formatMetric(
      meminfoBeforeSummary.totalPssKb,
      " KB"
    )} | ${formatMetric(meminfoSummary.totalPssKb, " KB")} |`,
    `| Total RSS | ${formatMetric(
      meminfoBeforeSummary.totalRssKb,
      " KB"
    )} | ${formatMetric(meminfoSummary.totalRssKb, " KB")} |`,
    `| Native heap PSS | ${formatMetric(
      meminfoBeforeSummary.nativeHeapPssKb,
      " KB"
    )} | ${formatMetric(meminfoSummary.nativeHeapPssKb, " KB")} |`,
    "",
    "Artifact:",
    "",
    `- Screenshot: [${path.basename(screenshotPath)}](${path.basename(screenshotPath)})`,
    "",
    "Notes:",
    "",
    "- This is Android release-emulator evidence for one native performance matrix row.",
    "- It does not replace physical-device performance, iOS performance, Skia parity, or manual visible-correctness review.",
    ""
  ].join("\n");
