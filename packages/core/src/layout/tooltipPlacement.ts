import type {
  Rect,
  TooltipPlacement,
  TooltipPlacementOptions,
  TooltipPlacementResult
} from "./types";

const clamp = (value: number, min: number, max: number): number => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const fitsPrimaryAxis = (
  placement: TooltipPlacement,
  rect: Rect,
  bounds: Rect
): boolean => {
  if (placement === "top" || placement === "bottom") {
    return (
      rect.y >= bounds.y && rect.y + rect.height <= bounds.y + bounds.height
    );
  }

  return rect.x >= bounds.x && rect.x + rect.width <= bounds.x + bounds.width;
};

const place = (
  placement: TooltipPlacement,
  options: Required<Omit<TooltipPlacementOptions, "preferredPlacement">>
): Rect => {
  const { anchor, tooltip, gap, fingerRadius } = options;
  const offset = gap + fingerRadius;

  if (placement === "top") {
    return {
      x: anchor.x - tooltip.width / 2,
      y: anchor.y - tooltip.height - offset,
      width: tooltip.width,
      height: tooltip.height
    };
  }

  if (placement === "bottom") {
    return {
      x: anchor.x - tooltip.width / 2,
      y: anchor.y + offset,
      width: tooltip.width,
      height: tooltip.height
    };
  }

  if (placement === "left") {
    return {
      x: anchor.x - tooltip.width - offset,
      y: anchor.y - tooltip.height / 2,
      width: tooltip.width,
      height: tooltip.height
    };
  }

  return {
    x: anchor.x + offset,
    y: anchor.y - tooltip.height / 2,
    width: tooltip.width,
    height: tooltip.height
  };
};

export const placeTooltip = ({
  preferredPlacement = "top",
  gap = 8,
  fingerRadius = 0,
  ...options
}: TooltipPlacementOptions): TooltipPlacementResult => {
  const resolvedOptions = {
    ...options,
    gap,
    fingerRadius
  };
  const candidates: TooltipPlacement[] = [
    preferredPlacement,
    "top",
    "bottom",
    "right",
    "left"
  ];
  const placements = candidates.reduce<TooltipPlacement[]>(
    (unique, placement) => {
      if (!unique.includes(placement)) {
        unique.push(placement);
      }

      return unique;
    },
    []
  );

  const placement =
    placements.find((candidate) =>
      fitsPrimaryAxis(
        candidate,
        place(candidate, resolvedOptions),
        options.bounds
      )
    ) ?? preferredPlacement;
  const rect = place(placement, resolvedOptions);

  return {
    placement,
    rect: {
      ...rect,
      x: clamp(
        rect.x,
        options.bounds.x,
        options.bounds.x + options.bounds.width - rect.width
      ),
      y: clamp(
        rect.y,
        options.bounds.y,
        options.bounds.y + options.bounds.height - rect.height
      )
    }
  };
};
