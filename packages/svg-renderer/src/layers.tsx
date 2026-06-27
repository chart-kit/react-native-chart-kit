import { SvgGroup } from "./primitives";
import { getChartRenderLayerTestId } from "./layerOrder";
import type { SvgLayerProps } from "./types";

export const SvgLayer = ({
  children,
  name,
  testID,
  ...props
}: SvgLayerProps) => (
  <SvgGroup testID={testID ?? getChartRenderLayerTestId(name)} {...props}>
    {children}
  </SvgGroup>
);
