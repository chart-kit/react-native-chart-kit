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
  maxDistance: number;
  pointerId: number;
  startTime: number;
  startX: number;
  startY: number;
  timers: number[];
};
type GestureDomEvent = React.MouseEvent<Element> | React.PointerEvent<Element>;

class StubGesture {
  activeOffsetXRange?: [number, number];
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
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return {
    translationX: state ? x - state.startX : 0,
    translationY: state ? y - state.startY : 0,
    x,
    y
  };
};

const getMovedPastActiveOffsetX = (
  gesture: StubGesture,
  translationX: number
) => {
  const range = gesture.activeOffsetXRange;

  return range ? translationX < range[0] || translationX > range[1] : true;
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
  "pointerId" in event ? event.pointerId : 1;

const setPointerCapture = (event: GestureDomEvent) => {
  if ("pointerId" in event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
};

const releasePointerCapture = (event: GestureDomEvent) => {
  if ("pointerId" in event) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }
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
  const clearState = React.useCallback(() => {
    const state = stateRef.current;

    if (!state) {
      return;
    }

    state.timers.forEach((timer) => window.clearTimeout(timer));
    stateRef.current = undefined;
  }, []);
  const child = React.Children.only(children);

  if (!React.isValidElement(child)) {
    return <>{children}</>;
  }
  const childElement = child as React.ReactElement<Record<string, unknown>>;
  const childProps = childElement.props as {
    onMouseDown?: React.MouseEventHandler<Element>;
    onMouseMove?: React.MouseEventHandler<Element>;
    onMouseUp?: React.MouseEventHandler<Element>;
    onPointerCancel?: React.PointerEventHandler<Element>;
    onPointerDown?: React.PointerEventHandler<Element>;
    onPointerMove?: React.PointerEventHandler<Element>;
    onPointerUp?: React.PointerEventHandler<Element>;
  };
  const handleCancel = (event: GestureDomEvent) => {
    const state = stateRef.current;

    if (state) {
      for (const activeGesture of state.active) {
        activeGesture.callbacks.finalize?.(getGesturePoint(event, state));
      }
    }

    clearState();
  };
  const handleDown = (event: GestureDomEvent) => {
    if (stateRef.current) {
      return;
    }

    const point = getGesturePoint(event);
    const state: GestureState = {
      active: new Set(),
      maxDistance: 0,
      pointerId: getPointerId(event),
      startTime: event.timeStamp,
      startX: point.x,
      startY: point.y,
      timers: []
    };
    stateRef.current = state;
    setPointerCapture(event);

    for (const item of gestures) {
      if (item.kind === "longPress") {
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
        getMovedPastActiveOffsetX(item, point.translationX)
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

  return React.cloneElement(childElement, {
    onMouseDown: (event: React.MouseEvent<Element>) => {
      childProps.onMouseDown?.(event);
      handleDown(event);
    },
    onMouseMove: (event: React.MouseEvent<Element>) => {
      childProps.onMouseMove?.(event);
      handleMove(event);
    },
    onMouseUp: (event: React.MouseEvent<Element>) => {
      childProps.onMouseUp?.(event);
      handleUp(event);
    },
    onPointerCancel: (event: React.PointerEvent<Element>) => {
      childProps.onPointerCancel?.(event);
      handleCancel(event);
    },
    onPointerDown: (event: React.PointerEvent<Element>) => {
      childProps.onPointerDown?.(event);
      handleDown(event);
    },
    onPointerMove: (event: React.PointerEvent<Element>) => {
      childProps.onPointerMove?.(event);
      handleMove(event);
    },
    onPointerUp: (event: React.PointerEvent<Element>) => {
      childProps.onPointerUp?.(event);
      handleUp(event);
    }
  });
};

export type ComposedGesture = StubGesture;
export type GestureType = StubGesture;
