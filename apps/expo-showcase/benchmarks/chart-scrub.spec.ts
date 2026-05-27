import { expect, test } from "@playwright/test";

type ScrubBenchmarkResult = {
  frames: number;
  maxMs: number;
  medianMs: number;
  p95Ms: number;
};

const formatNumber = (value: number, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : "n/a";

test("line chart scrub frame timing", async ({ page }) => {
  await page.goto("/?story=v2-scrub&visual=1");
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });

  const frame = page.getByTestId("visual-frame");
  await expect(frame).toBeVisible();

  const box = await frame.boundingBox();
  expect(box).not.toBeNull();

  if (!box) {
    return;
  }

  await page.evaluate(() => {
    const globalWindow = window as typeof window & {
      __chartKitScrubFrameSamples?: number[];
      __stopChartKitScrubBenchmark?: () => void;
    };
    let lastFrame: number | undefined;
    let active = true;

    globalWindow.__chartKitScrubFrameSamples = [];
    globalWindow.__stopChartKitScrubBenchmark = () => {
      active = false;
    };

    const tick = (timestamp: number) => {
      if (lastFrame !== undefined) {
        globalWindow.__chartKitScrubFrameSamples?.push(timestamp - lastFrame);
      }

      lastFrame = timestamp;

      if (active) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });

  await page.mouse.move(box.x + 90, box.y + 210);
  await page.mouse.down();

  for (let step = 0; step <= 36; step++) {
    const ratio = step / 36;
    await page.mouse.move(box.x + 90 + 260 * ratio, box.y + 210);
    await page.waitForTimeout(16);
  }

  await page.mouse.up();
  await expect(page.getByText("Actual:")).toBeVisible();

  const result = await page.evaluate<ScrubBenchmarkResult>(() => {
    const globalWindow = window as typeof window & {
      __chartKitScrubFrameSamples?: number[];
      __stopChartKitScrubBenchmark?: () => void;
    };
    const samples = globalWindow.__chartKitScrubFrameSamples ?? [];
    const getPercentile = (values: number[], percentage: number) => {
      if (values.length === 0) {
        return Number.NaN;
      }

      const sorted = [...values].sort((a, b) => a - b);
      const index = Math.min(
        sorted.length - 1,
        Math.floor((percentage / 100) * sorted.length)
      );

      return sorted[index] ?? Number.NaN;
    };

    globalWindow.__stopChartKitScrubBenchmark?.();

    return {
      frames: samples.length,
      maxMs: Math.max(...samples),
      medianMs: getPercentile(samples, 50),
      p95Ms: getPercentile(samples, 95)
    };
  });

  console.log("Chart Kit benchmark: showcase interaction");
  console.log("scenario\tframes\tmedian frame ms\tp95 frame ms\tmax frame ms");
  console.log(
    [
      "line-scrub-v2-scrub",
      result.frames,
      formatNumber(result.medianMs),
      formatNumber(result.p95Ms),
      formatNumber(result.maxMs)
    ].join("\t")
  );

  expect(result.frames).toBeGreaterThan(20);
  expect(result.medianMs).toBeGreaterThan(0);
});
