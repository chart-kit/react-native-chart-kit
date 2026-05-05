import {
  BarChart as CompatBarChart,
  LineChart as CompatLineChart,
  StackedBarChart as CompatStackedBarChart
} from "react-native-chart-kit";

import {
  fixtures as barFixtures,
  type BarChartFixture
} from "../fixtures/compatBar";
import {
  fixtures as lineFixtures,
  type LineChartFixture
} from "../fixtures/compatLine";
import {
  fixtures as stackedBarFixtures,
  type StackedBarChartFixture
} from "../fixtures/compatStackedBar";
import {
  ChartSection,
  EmptyState,
  type NativeStoryProps,
  type ShowcaseStory
} from "./storyPrimitives";

const hasLineData = (fixture: LineChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const hasBarData = (fixture: BarChartFixture) =>
  fixture.data.datasets.some((dataset) => dataset.data.length > 0);

const hasStackedBarData = (fixture: StackedBarChartFixture) =>
  fixture.data.data.some((group) => group.length > 0);

const resolveLegacyWidth = (
  availableWidth: number,
  fixture: Pick<
    LineChartFixture | BarChartFixture | StackedBarChartFixture,
    "width"
  >
) => Math.min(availableWidth, fixture.width);

const legacyChartStyle = (
  fixture: Pick<
    LineChartFixture | BarChartFixture | StackedBarChartFixture,
    "style"
  >
) => ({
  ...fixture.style,
  paddingRight: Math.min(fixture.style?.paddingRight ?? 28, 28),
  width: undefined
});

const CompatLineStory = ({
  fixture,
  title
}: {
  fixture: LineChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);

    return (
      <ChartSection title={title} kicker="Compat LineChart">
        {hasLineData(fixture) ? (
          <CompatLineChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={legacyChartStyle(fixture)}
            segments={fixture.segments}
            bezier={fixture.bezier}
            fromZero={fixture.fromZero}
            withDots={fixture.withDots}
            withInnerLines={fixture.withInnerLines}
            withOuterLines={fixture.withOuterLines}
            verticalLabelRotation={fixture.verticalLabelRotation}
            xLabelsOffset={fixture.xLabelsOffset}
            yAxisSuffix={fixture.yAxisSuffix}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero points."
            height={fixture.height}
          />
        )}
      </ChartSection>
    );
  };

  return Story;
};

const CompatBarStory = ({
  fixture,
  title
}: {
  fixture: BarChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);

    return (
      <ChartSection title={title} kicker="Compat BarChart">
        {hasBarData(fixture) ? (
          <CompatBarChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            style={legacyChartStyle(fixture)}
            fromZero={fixture.fromZero}
            flatColor={fixture.flatColor}
            horizontalLabelRotation={fixture.horizontalLabelRotation}
            segments={fixture.segments}
            showBarTops={fixture.showBarTops}
            showValuesOnTopOfBars={fixture.showValuesOnTopOfBars}
            verticalLabelRotation={fixture.verticalLabelRotation}
            withCustomBarColorFromData={fixture.withCustomBarColorFromData}
            withHorizontalLabels={fixture.withHorizontalLabels}
            withInnerLines={fixture.withInnerLines}
            withVerticalLabels={fixture.withVerticalLabels}
            yAxisLabel={fixture.yAxisLabel ?? ""}
            yAxisSuffix={fixture.yAxisSuffix ?? ""}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero bars."
            height={fixture.height}
          />
        )}
      </ChartSection>
    );
  };

  return Story;
};

const CompatStackedBarStory = ({
  fixture,
  title
}: {
  fixture: StackedBarChartFixture;
  title: string;
}) => {
  const Story = ({ width }: NativeStoryProps) => {
    const chartWidth = resolveLegacyWidth(width, fixture);

    return (
      <ChartSection title={title} kicker="Compat StackedBarChart">
        {hasStackedBarData(fixture) ? (
          <CompatStackedBarChart
            data={fixture.data}
            width={chartWidth}
            height={fixture.height}
            chartConfig={fixture.chartConfig}
            hideLegend={fixture.hideLegend}
            percentile={fixture.percentile}
            segments={fixture.segments}
            style={legacyChartStyle(fixture)}
            yAxisSuffix={fixture.yAxisSuffix}
          />
        ) : (
          <EmptyState
            copy="The compatibility fixture contains zero stacked bars."
            height={fixture.height}
          />
        )}
      </ChartSection>
    );
  };

  return Story;
};

export const compatLineStories: ShowcaseStory[] = [
  {
    id: "line-basic",
    title: "Basic",
    Component: CompatLineStory({ title: "Basic", fixture: lineFixtures.basic })
  },
  {
    id: "line-long-labels",
    title: "Long Labels",
    Component: CompatLineStory({
      title: "Long Labels",
      fixture: lineFixtures.longLabels
    })
  },
  {
    id: "line-dense-data",
    title: "Dense Data",
    Component: CompatLineStory({
      title: "Dense Data",
      fixture: lineFixtures.denseData
    })
  },
  {
    id: "line-negative-values",
    title: "Negative Values",
    Component: CompatLineStory({
      title: "Negative Values",
      fixture: lineFixtures.negativeValues
    })
  },
  {
    id: "line-empty-state",
    title: "Empty State",
    Component: CompatLineStory({
      title: "Empty State",
      fixture: lineFixtures.emptyState
    })
  },
  {
    id: "line-dark-mode",
    title: "Dark Mode",
    Component: CompatLineStory({
      title: "Dark Mode",
      fixture: lineFixtures.darkMode
    })
  },
  {
    id: "line-tiny-width",
    title: "Tiny Width",
    Component: CompatLineStory({
      title: "Tiny Width",
      fixture: lineFixtures.tinyWidth
    })
  }
];

export const compatBarStories: ShowcaseStory[] = [
  {
    id: "bar-basic",
    title: "Basic",
    Component: CompatBarStory({ title: "Basic", fixture: barFixtures.basic })
  },
  {
    id: "bar-long-labels",
    title: "Long Labels",
    Component: CompatBarStory({
      title: "Long Labels",
      fixture: barFixtures.longLabels
    })
  },
  {
    id: "bar-dense-data",
    title: "Dense Data",
    Component: CompatBarStory({
      title: "Dense Data",
      fixture: barFixtures.denseData
    })
  },
  {
    id: "bar-negative-values",
    title: "Negative Values",
    Component: CompatBarStory({
      title: "Negative Values",
      fixture: barFixtures.negativeValues
    })
  },
  {
    id: "bar-empty-state",
    title: "Empty State",
    Component: CompatBarStory({
      title: "Empty State",
      fixture: barFixtures.emptyState
    })
  },
  {
    id: "bar-dark-mode",
    title: "Dark Mode",
    Component: CompatBarStory({
      title: "Dark Mode",
      fixture: barFixtures.darkMode
    })
  },
  {
    id: "bar-tiny-width",
    title: "Tiny Width",
    Component: CompatBarStory({
      title: "Tiny Width",
      fixture: barFixtures.tinyWidth
    })
  }
];

export const compatStackedBarStories: ShowcaseStory[] = [
  {
    id: "stacked-bar-basic",
    title: "Stacked Basic",
    Component: CompatStackedBarStory({
      title: "Stacked Basic",
      fixture: stackedBarFixtures.basic
    })
  },
  {
    id: "stacked-bar-percentile",
    title: "Stacked Percentile",
    Component: CompatStackedBarStory({
      title: "Stacked Percentile",
      fixture: stackedBarFixtures.percentile
    })
  }
];
