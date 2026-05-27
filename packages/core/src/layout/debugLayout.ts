import type {
  BuildLayoutDebugModelOptions,
  LayoutDebugModel,
  LayoutDebugRect
} from "./types";

const withKind = (
  rect: Omit<LayoutDebugRect, "kind">,
  kind: LayoutDebugRect["kind"]
): LayoutDebugRect => ({
  ...rect,
  kind
});

export const buildLayoutDebugModel = ({
  boxes,
  labels = [],
  legend,
  tooltip
}: BuildLayoutDebugModelOptions): LayoutDebugModel => {
  const rects: LayoutDebugRect[] = [
    withKind({ id: "outer", ...boxes.outer }, "outer"),
    withKind({ id: "plot", ...boxes.plot }, "plot")
  ];

  labels.forEach((label) => {
    rects.push(withKind(label, "label"));
  });

  legend?.items.forEach((item) => {
    rects.push(withKind(item, "legend"));
  });

  if (tooltip) {
    rects.push(withKind({ id: "tooltip", ...tooltip.rect }, "tooltip"));
  }

  return { rects };
};
