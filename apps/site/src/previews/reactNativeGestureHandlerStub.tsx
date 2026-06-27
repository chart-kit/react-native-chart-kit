import React, { type ReactNode } from "react";

type GestureKind = "longPress" | "pan" | "race" | "simultaneous" | "tap";
type GestureEvent = {
  translationX: number;
  translationY: number;
  x: number;
  y: number;
};
type GestureCallback = (...args: any[]) => void;

type GestureState = {
  active: Set<StubGesture>;
  lastClientX: number;
  lastClientY: number;
  maxDistance: number;
  pointerId: number;
  target: Element;
  startTime: number;
  startX: number;
  startY: number;
  timers: number[];
};
type GestureDomEvent =
  | React.MouseEvent<Element>
  | React.PointerEvent<Element>
  | React.TouchEvent<Element>;

const getEventCoordinates = (event: GestureDomEvent) => {
  if ("touches" in event && event.touches.length > 0) {
    const touch = event.touches[0];

    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  if ("changedTouches" in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];

    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  return {
    clientX: "clientX" in event ? event.clientX : 0,
    clientY: "clientY" in event ? event.clientY : 0
  };
};

class StubGesture {
  activeOffsetXRange?: [number, number];
  activeOffsetYRange?: [number, number];
  callbacks: Partial<
    Record<"end" | "finalize" | "start" | "update", GestureCallback>
  > = {};
  gestures: StubGesture[];
  kind: GestureKind;
  longPressDelayMs = 0;
  maxDistanceValue = Number.POSITIVE_INFINITY;
  maxDurationMs = Number.POSITIVE_INFINITY;

  constructor(kind: GestureKind, gestures: StubGesture[] = []) {
    this.kind = kind;
    this.gestures = gestures;
  }

  activateAfterLongPress(_duration: number) {
    this.longPressDelayMs = _duration;
    return this;
  }

  activeOffsetX(_range: [number, number]) {
    this.activeOffsetXRange = _range;
    return this;
  }

  activeOffsetY(_range: [number, number]) {
    this.activeOffsetYRange = _range;
    return this;
  }

  maxDistance(_distance: number) {
    this.maxDistanceValue = _distance;
    return this;
  }

  maxDuration(_duration: number) {
    this.maxDurationMs = _duration;
    return this;
  }

  maxPointers(_count: number) {
    return this;
  }

  minDuration(_duration: number) {
    this.longPressDelayMs = _duration;
    return this;
  }

  minPointers(_count: number) {
    return this;
  }

  numberOfPointers(_count: number) {
    return this;
  }

  onEnd(_handler: unknown) {
    this.callbacks.end = _handler as GestureCallback;
    return this;
  }

  onFinalize(_handler: unknown) {
    this.callbacks.finalize = _handler as GestureCallback;
    return this;
  }

  onStart(_handler: unknown) {
    this.callbacks.start = _handler as GestureCallback;
    return this;
  }

  onUpdate(_handler: unknown) {
    this.callbacks.update = _handler as GestureCallback;
    return this;
  }

  runOnJS(_enabled: boolean) {
    return this;
  }
}

const createGesture = (kind: GestureKind) => () => new StubGesture(kind);

const flattenGestures = (gesture: StubGesture): StubGesture[] =>
  gesture.gestures.length > 0
    ? gesture.gestures.flatMap(flattenGestures)
    : [gesture];

const getGesturePoint = (
  event: GestureDomEvent,
  state?: GestureState
): GestureEvent => {
  const currentTarget = event.currentTarget;
  const target = currentTarget ?? state?.target;
  const coordinates = getEventCoordinates(event);
  const clientX = currentTarget
    ? coordinates.clientX
    : (state?.lastClientX ?? 0);
  const clientY = currentTarget
    ? coordinates.clientY
    : (state?.lastClientY ?? 0);
  const rect = target.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  return {
    translationX: state ? x - state.startX : 0,
    translationY: state ? y - state.startY : 0,
    x,
    y
  };
};

const getMovedPastActiveOffsetRange = (
  range: [number, number] | undefined,
  translation: number
) => (range ? translation < range[0] || translation > range[1] : undefined);

const getMovedPastActiveOffset = (
  gesture: StubGesture,
  point: GestureEvent
) => {
  const movedPastX = getMovedPastActiveOffsetRange(
    gesture.activeOffsetXRange,
    point.translationX
  );
  const movedPastY = getMovedPastActiveOffsetRange(
    gesture.activeOffsetYRange,
    point.translationY
  );

  if (movedPastX !== undefined || movedPastY !== undefined) {
    return Boolean(movedPastX || movedPastY);
  }

  return true;
};

const startGesture = (
  gesture: StubGesture,
  state: GestureState,
  event: GestureDomEvent
) => {
  if (state.active.has(gesture)) {
    return;
  }

  state.active.add(gesture);
  gesture.callbacks.start?.(getGesturePoint(event, state));
};

const getPointerId = (event: GestureDomEvent) =>
  "pointerId" in event
    ? event.pointerId
    : "touches" in event
      ? (event.touches[0]?.identifier ??
        event.changedTouches[0]?.identifier ??
        1)
      : 1;

const getIsMousePointer = (event: GestureDomEvent) =>
  "pointerType" in event ? event.pointerType === "mouse" : true;

const setPointerCapture = (event: GestureDomEvent) => {
  if ("pointerId" in event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
};

const releasePointerCapture = (event: GestureDomEvent) => {
  if ("pointerId" in event) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId) === false) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }
};

const gestureDetectorStyle: React.CSSProperties = {
  display: "block",
  position: "relative",
  touchAction: "none",
  userSelect: "none"
};

export const Gesture = {
  LongPress: createGesture("longPress"),
  Pan: createGesture("pan"),
  Race: (...gestures: StubGesture[]) => new StubGesture("race", gestures),
  Simultaneous: (...gestures: StubGesture[]) =>
    new StubGesture("simultaneous", gestures),
  Tap: createGesture("tap")
};

export const GestureDetector = ({
  children,
  gesture
}: {
  children: ReactNode;
  gesture: StubGesture;
}) => {
  const stateRef = React.useRef<GestureState | undefined>(undefined);
  const gestures = React.useMemo(() => flattenGestures(gesture), [gesture]);
  const usesPointerEvents =
    typeof window !== "undefined" && "PointerEvent" in window;
  const clearState = React.useCallback(() => {
    const state = stateRef.current;

    if (!state) {
      return;
    }

    state.timers.forEach((timer) => window.clearTimeout(timer));
    stateRef.current = undefined;
  }, []);
  const handleCancel = (event: GestureDomEvent) => {
    const state = stateRef.current;

    if (state) {
      for (const activeGesture of state.active) {
        activeGesture.callbacks.finalize?.(getGesturePoint(event, state));
      }
    }

    releasePointerCapture(event);
    clearState();
  };
  const handleDown = (event: GestureDomEvent) => {
    if (stateRef.current) {
      return;
    }

    const point = getGesturePoint(event);
    const coordinates = getEventCoordinates(event);
    const state: GestureState = {
      active: new Set(),
      lastClientX: coordinates.clientX,
      lastClientY: coordinates.clientY,
      maxDistance: 0,
      pointerId: getPointerId(event),
      startTime: event.timeStamp,
      startX: point.x,
      startY: point.y,
      target: event.currentTarget,
      timers: []
    };
    stateRef.current = state;
    setPointerCapture(event);

    const shouldActivateLongPressImmediately =
      !("touches" in event) && getIsMousePointer(event);

    for (const item of gestures) {
      if (item.kind === "longPress") {
        if (shouldActivateLongPressImmediately) {
          startGesture(item, state, event);
          continue;
        }

        const timer = window.setTimeout(() => {
          if (
            stateRef.current === state &&
            state.maxDistance <= item.maxDistanceValue
          ) {
            startGesture(item, state, event);
          }
        }, item.longPressDelayMs);
        state.timers.push(timer);
      }

      if (item.kind === "pan" && item.longPressDelayMs > 0) {
        if (shouldActivateLongPressImmediately) {
          startGesture(item, state, event);
          continue;
        }

        const timer = window.setTimeout(() => {
          if (stateRef.current === state) {
            startGesture(item, state, event);
          }
        }, item.longPressDelayMs);
        state.timers.push(timer);
      }
    }
  };
  const handleMove = (event: GestureDomEvent) => {
    const state = stateRef.current;
    const pointerId = getPointerId(event);

    if (!state || state.pointerId !== pointerId) {
      return;
    }

    const point = getGesturePoint(event, state);
    const coordinates = getEventCoordinates(event);
    state.lastClientX = coordinates.clientX;
    state.lastClientY = coordinates.clientY;
    state.maxDistance = Math.max(
      state.maxDistance,
      Math.hypot(point.translationX, point.translationY)
    );

    for (const item of gestures) {
      if (item.kind !== "pan") {
        continue;
      }

      if (
        !state.active.has(item) &&
        item.longPressDelayMs === 0 &&
        getMovedPastActiveOffset(item, point)
      ) {
        startGesture(item, state, event);
      }

      if (state.active.has(item)) {
        item.callbacks.update?.(point);
      }
    }
  };
  const handleUp = (event: GestureDomEvent) => {
    const state = stateRef.current;
    const pointerId = getPointerId(event);

    if (!state || state.pointerId !== pointerId) {
      return;
    }

    const point = getGesturePoint(event, state);
    state.maxDistance = Math.max(
      state.maxDistance,
      Math.hypot(point.translationX, point.translationY)
    );

    for (const item of gestures) {
      if (item.kind === "tap") {
        const success =
          state.maxDistance <= item.maxDistanceValue &&
          event.timeStamp - state.startTime <= item.maxDurationMs;
        item.callbacks.end?.(point, success);
        item.callbacks.finalize?.(point, success);
        continue;
      }

      if (state.active.has(item)) {
        item.callbacks.end?.(point);
        item.callbacks.finalize?.(point);
      }
    }

    releasePointerCapture(event);
    clearState();
  };

  return (
    <div
      onMouseDown={(event: React.MouseEvent<Element>) => {
        if (usesPointerEvents) {
          return;
        }

        handleDown(event);
      }}
      onMouseMove={(event: React.MouseEvent<Element>) => {
        if (usesPointerEvents) {
          return;
        }

        handleMove(event);
      }}
      onMouseUp={(event: React.MouseEvent<Element>) => {
        if (usesPointerEvents) {
          return;
        }

        handleUp(event);
      }}
      onPointerCancel={(event: React.PointerEvent<Element>) => {
        handleCancel(event);
      }}
      onPointerDown={(event: React.PointerEvent<Element>) => {
        handleDown(event);
      }}
      onPointerMove={(event: React.PointerEvent<Element>) => {
        handleMove(event);
      }}
      onPointerUp={(event: React.PointerEvent<Element>) => {
        handleUp(event);
      }}
      onTouchCancel={(event: React.TouchEvent<Element>) => {
        handleCancel(event);
      }}
      onTouchEnd={(event: React.TouchEvent<Element>) => {
        handleUp(event);
      }}
      onTouchMove={(event: React.TouchEvent<Element>) => {
        handleMove(event);
      }}
      onTouchStart={(event: React.TouchEvent<Element>) => {
        handleDown(event);
      }}
      style={gestureDetectorStyle}
    >
      {children}
    </div>
  );
};

export type ComposedGesture = StubGesture;
export type GestureType = StubGesture;
