/* eslint-disable react-hooks/refs -- The preview stub stores responder state in refs and only reads it inside pointer event handlers. */
import * as React from "react";

import normalizeColor from "./normalizeColorsStub";

type AnyProps = Record<string, unknown>;
type ScrollHandle = {
  scrollTo: (options?: { animated?: boolean; x?: number; y?: number }) => void;
};
type TextInputHandle = {
  setNativeProps: (nativeProps: { text?: string; value?: string }) => void;
};
type ScrollDragState = {
  active: boolean;
  pointerId: number;
  scrollLeft: number;
  startX: number;
  startY: number;
};
type ResponderEvent = {
  currentTarget: EventTarget & Element;
  nativeEvent: {
    changedTouches: Array<{
      identifier: number;
      locationX: number;
      locationY: number;
      pageX: number;
      pageY: number;
    }>;
    locationX: number;
    locationY: number;
    pageX: number;
    pageY: number;
    target: EventTarget | null;
    timestamp: number;
    touches: Array<{
      identifier: number;
      locationX: number;
      locationY: number;
      pageX: number;
      pageY: number;
    }>;
  };
  preventDefault: () => void;
  stopPropagation: () => void;
  target: EventTarget | null;
  timeStamp: number;
};
type PanResponderGestureState = {
  dx: number;
  dy: number;
  moveX: number;
  moveY: number;
  numberActiveTouches: number;
  stateID: number;
  vx: number;
  vy: number;
  x0: number;
  y0: number;
};
type ResponderCallback = (event: ResponderEvent) => void;
type ResponderPredicate = (event: ResponderEvent) => boolean;
type PanResponderCallback = (
  event: ResponderEvent,
  gestureState: PanResponderGestureState
) => void;
type PanResponderPredicate = (
  event: ResponderEvent,
  gestureState: PanResponderGestureState
) => boolean;
type ActiveResponder =
  | {
      gestureState: PanResponderGestureState;
      kind: "pan";
      pointerId: number | undefined;
      startClientX: number;
      startClientY: number;
      startTime: number;
    }
  | {
      kind: "responder";
      pointerId: number | undefined;
    };
type PendingResponderPointer = {
  pointerId: number | undefined;
  startClientX: number;
  startClientY: number;
  startTime: number;
};
type MutableRef<T> = {
  current: T;
};
type PressableState = { focused: boolean; hovered: boolean; pressed: boolean };
type PointerEventsValue = "auto" | "box-none" | "box-only" | "none";
type ResponderDomEvent =
  | React.MouseEvent<Element>
  | React.PointerEvent<Element>
  | React.TouchEvent<Element>;
type StyleValue =
  | AnyProps
  | false
  | ((state: PressableState) => StyleValue)
  | null
  | string
  | number
  | undefined
  | Array<StyleValue>;

const responderProps = new Set([
  "bounces",
  "directionalLockEnabled",
  "ellipsizeMode",
  "keyboardShouldPersistTaps",
  "nestedScrollEnabled",
  "onMoveShouldSetPanResponder",
  "onMoveShouldSetPanResponderCapture",
  "onMoveShouldSetResponder",
  "onMoveShouldSetResponderCapture",
  "onPanResponderGrant",
  "onPanResponderMove",
  "onPanResponderRelease",
  "onPanResponderTerminate",
  "onResponderGrant",
  "onResponderMove",
  "onResponderRelease",
  "onResponderTerminate",
  "onResponderTerminationRequest",
  "onShouldBlockNativeResponder",
  "onStartShouldSetPanResponder",
  "onStartShouldSetPanResponderCapture",
  "onStartShouldSetResponder",
  "onStartShouldSetResponderCapture",
  "numberOfLines",
  "overScrollMode",
  "pagingEnabled",
  "scrollEnabled",
  "scrollEventThrottle",
  "showsHorizontalScrollIndicator",
  "showsVerticalScrollIndicator"
]);

const getPointerCoordinates = (
  event:
    | React.MouseEvent<Element>
    | React.PointerEvent<Element>
    | React.TouchEvent<Element>
) => {
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

const toNativeTouch = (touch: React.Touch, target: EventTarget & Element) => {
  const rect = target.getBoundingClientRect();

  return {
    identifier: touch.identifier,
    locationX: touch.clientX - rect.left,
    locationY: touch.clientY - rect.top,
    pageX: touch.pageX,
    pageY: touch.pageY
  };
};

const createResponderEvent = (
  event:
    | React.MouseEvent<Element>
    | React.PointerEvent<Element>
    | React.TouchEvent<Element>
): ResponderEvent => {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const { clientX, clientY } = getPointerCoordinates(event);
  const pageX = "pageX" in event ? event.pageX : clientX + window.scrollX;
  const pageY = "pageY" in event ? event.pageY : clientY + window.scrollY;
  const touches =
    "touches" in event
      ? Array.from(event.touches).map((touch) => toNativeTouch(touch, target))
      : [];
  const changedTouches =
    "changedTouches" in event
      ? Array.from(event.changedTouches).map((touch) =>
          toNativeTouch(touch, target)
        )
      : touches;

  return {
    currentTarget: target,
    nativeEvent: {
      changedTouches,
      locationX: clientX - rect.left,
      locationY: clientY - rect.top,
      pageX,
      pageY,
      target: event.target,
      timestamp: event.timeStamp,
      touches
    },
    preventDefault: () => event.preventDefault(),
    stopPropagation: () => event.stopPropagation(),
    target: event.target,
    timeStamp: event.timeStamp
  };
};

const createGestureState = ({
  clientX,
  clientY,
  stateID,
  startClientX,
  startClientY,
  startTime
}: {
  clientX: number;
  clientY: number;
  stateID: number;
  startClientX: number;
  startClientY: number;
  startTime: number;
}): PanResponderGestureState => {
  const elapsedSeconds = Math.max((Date.now() - startTime) / 1000, 0.016);
  const dx = clientX - startClientX;
  const dy = clientY - startClientY;

  return {
    dx,
    dy,
    moveX: clientX,
    moveY: clientY,
    numberActiveTouches: 1,
    stateID,
    vx: dx / elapsedSeconds,
    vy: dy / elapsedSeconds,
    x0: startClientX,
    y0: startClientY
  };
};

const getResponderPointerId = (event: ResponderDomEvent) => {
  if ("pointerId" in event) {
    return event.pointerId;
  }

  if ("touches" in event) {
    return event.touches[0]?.identifier ?? event.changedTouches[0]?.identifier;
  }

  return undefined;
};

const setResponderPointerCapture = (event: ResponderDomEvent) => {
  if ("pointerId" in event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
};

const releaseResponderPointerCapture = (event: ResponderDomEvent) => {
  if ("pointerId" in event) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }
};

const shouldUseResponder = (
  props: AnyProps,
  event: ResponderEvent,
  gestureState: PanResponderGestureState,
  phase: "move" | "start"
) => {
  const panPredicate =
    phase === "start"
      ? (props.onStartShouldSetPanResponder as PanResponderPredicate)
      : (props.onMoveShouldSetPanResponder as PanResponderPredicate);
  const panCapturePredicate =
    phase === "start"
      ? (props.onStartShouldSetPanResponderCapture as PanResponderPredicate)
      : (props.onMoveShouldSetPanResponderCapture as PanResponderPredicate);
  const responderPredicate =
    phase === "start"
      ? (props.onStartShouldSetResponder as ResponderPredicate)
      : (props.onMoveShouldSetResponder as ResponderPredicate);
  const responderCapturePredicate =
    phase === "start"
      ? (props.onStartShouldSetResponderCapture as ResponderPredicate)
      : (props.onMoveShouldSetResponderCapture as ResponderPredicate);

  if (panCapturePredicate?.(event, gestureState)) {
    return "pan";
  }

  if (responderCapturePredicate?.(event)) {
    return "responder";
  }

  if (panPredicate?.(event, gestureState)) {
    return "pan";
  }

  if (responderPredicate?.(event)) {
    return "responder";
  }

  return undefined;
};

const addResponderDomHandlers = (
  sourceProps: AnyProps,
  domProps: AnyProps,
  activeResponderRef: MutableRef<ActiveResponder | undefined>,
  pendingPointerRef: MutableRef<PendingResponderPointer | undefined>
) => {
  const hasResponderProps = Array.from(responderProps).some(
    (key) => sourceProps[key] !== undefined
  );

  if (!hasResponderProps) {
    return;
  }

  domProps.style = {
    ...(domProps.style as AnyProps),
    touchAction: "none",
    userSelect: "none"
  };

  const startResponder = (
    event: ResponderDomEvent,
    kind: "pan" | "responder",
    gestureState: PanResponderGestureState
  ) => {
    const pointerId = getResponderPointerId(event);
    const responderEvent = createResponderEvent(event);

    activeResponderRef.current =
      kind === "pan"
        ? {
            gestureState,
            kind,
            pointerId,
            startClientX: gestureState.x0,
            startClientY: gestureState.y0,
            startTime: Date.now()
          }
        : {
            kind,
            pointerId
          };

    setResponderPointerCapture(event);

    if (kind === "pan") {
      (sourceProps.onPanResponderGrant as PanResponderCallback | undefined)?.(
        responderEvent,
        gestureState
      );

      return;
    }

    (sourceProps.onResponderGrant as ResponderCallback | undefined)?.(
      responderEvent
    );
  };

  const finishResponder = (event: ResponderDomEvent, terminated = false) => {
    const activeResponder = activeResponderRef.current;
    const pointerId = getResponderPointerId(event);

    if (!activeResponder || activeResponder.pointerId !== pointerId) {
      return;
    }

    const responderEvent = createResponderEvent(event);
    activeResponderRef.current = undefined;
    releaseResponderPointerCapture(event);

    if (activeResponder.kind === "pan") {
      const callback = terminated
        ? sourceProps.onPanResponderTerminate
        : sourceProps.onPanResponderRelease;

      (callback as PanResponderCallback | undefined)?.(
        responderEvent,
        activeResponder.gestureState
      );

      return;
    }

    const callback = terminated
      ? sourceProps.onResponderTerminate
      : sourceProps.onResponderRelease;

    (callback as ResponderCallback | undefined)?.(responderEvent);
  };

  const handleStart = (event: ResponderDomEvent) => {
    if (activeResponderRef.current) {
      return;
    }

    const { clientX, clientY } = getPointerCoordinates(event);
    const pendingPointer = {
      pointerId: getResponderPointerId(event),
      startClientX: clientX,
      startClientY: clientY,
      startTime: Date.now()
    };
    pendingPointerRef.current = pendingPointer;

    const responderEvent = createResponderEvent(event);
    const gestureState = createGestureState({
      clientX,
      clientY,
      startClientX: pendingPointer.startClientX,
      startClientY: pendingPointer.startClientY,
      startTime: pendingPointer.startTime,
      stateID: pendingPointer.pointerId ?? 1
    });
    const responderKind = shouldUseResponder(
      sourceProps,
      responderEvent,
      gestureState,
      "start"
    );

    if (responderKind) {
      startResponder(event, responderKind, gestureState);
    }
  };

  const handleMove = (event: ResponderDomEvent) => {
    const activeResponder = activeResponderRef.current;
    const pointerId = getResponderPointerId(event);
    const { clientX, clientY } = getPointerCoordinates(event);

    if (!activeResponder) {
      if ("buttons" in event && event.buttons === 0) {
        pendingPointerRef.current = undefined;
        return;
      }

      const pendingPointer = pendingPointerRef.current;

      if (!pendingPointer || pendingPointer.pointerId !== pointerId) {
        return;
      }

      const responderEvent = createResponderEvent(event);
      const gestureState = createGestureState({
        clientX,
        clientY,
        startClientX: pendingPointer.startClientX,
        startClientY: pendingPointer.startClientY,
        startTime: pendingPointer.startTime,
        stateID: pendingPointer.pointerId ?? 1
      });
      const responderKind = shouldUseResponder(
        sourceProps,
        responderEvent,
        gestureState,
        "move"
      );

      if (responderKind) {
        startResponder(event, responderKind, gestureState);
      }

      return;
    }

    if (activeResponder.pointerId !== pointerId) {
      return;
    }

    const responderEvent = createResponderEvent(event);

    if (activeResponder.kind === "pan") {
      const gestureState = createGestureState({
        clientX,
        clientY,
        startClientX: activeResponder.startClientX,
        startClientY: activeResponder.startClientY,
        startTime: activeResponder.startTime,
        stateID: activeResponder.pointerId ?? 1
      });

      activeResponder.gestureState = gestureState;
      (sourceProps.onPanResponderMove as PanResponderCallback | undefined)?.(
        responderEvent,
        gestureState
      );

      return;
    }

    (sourceProps.onResponderMove as ResponderCallback | undefined)?.(
      responderEvent
    );
  };

  domProps.onMouseDown = (event: React.MouseEvent<Element>) => {
    (sourceProps.onMouseDown as React.MouseEventHandler<Element>)?.(event);
    handleStart(event);
  };

  domProps.onMouseMove = (event: React.MouseEvent<Element>) => {
    (sourceProps.onMouseMove as React.MouseEventHandler<Element>)?.(event);
    handleMove(event);
  };

  domProps.onMouseUp = (event: React.MouseEvent<Element>) => {
    (sourceProps.onMouseUp as React.MouseEventHandler<Element>)?.(event);
    finishResponder(event);

    if (pendingPointerRef.current?.pointerId === undefined) {
      pendingPointerRef.current = undefined;
    }
  };

  domProps.onPointerDown = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerDown as React.PointerEventHandler<Element>)?.(event);
    handleStart(event);
  };

  domProps.onPointerMove = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerMove as React.PointerEventHandler<Element>)?.(event);
    handleMove(event);
  };

  domProps.onPointerUp = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerUp as React.PointerEventHandler<Element>)?.(event);
    finishResponder(event);

    if (pendingPointerRef.current?.pointerId === event.pointerId) {
      pendingPointerRef.current = undefined;
    }
  };
  domProps.onPointerCancel = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerCancel as React.PointerEventHandler<Element>)?.(
      event
    );
    finishResponder(event, true);

    if (pendingPointerRef.current?.pointerId === event.pointerId) {
      pendingPointerRef.current = undefined;
    }
  };

  domProps.onTouchStart = (event: React.TouchEvent<Element>) => {
    (
      sourceProps.onTouchStart as ((event: ResponderEvent) => void) | undefined
    )?.(createResponderEvent(event));
    handleStart(event);
  };

  domProps.onTouchMove = (event: React.TouchEvent<Element>) => {
    (
      sourceProps.onTouchMove as ((event: ResponderEvent) => void) | undefined
    )?.(createResponderEvent(event));
    handleMove(event);
  };

  domProps.onTouchEnd = (event: React.TouchEvent<Element>) => {
    (sourceProps.onTouchEnd as ((event: ResponderEvent) => void) | undefined)?.(
      createResponderEvent(event)
    );
    finishResponder(event);

    if (pendingPointerRef.current?.pointerId === getResponderPointerId(event)) {
      pendingPointerRef.current = undefined;
    }
  };

  domProps.onTouchCancel = (event: React.TouchEvent<Element>) => {
    (
      sourceProps.onTouchCancel as ((event: ResponderEvent) => void) | undefined
    )?.(createResponderEvent(event));
    finishResponder(event, true);

    if (pendingPointerRef.current?.pointerId === getResponderPointerId(event)) {
      pendingPointerRef.current = undefined;
    }
  };
};

const addTouchDomHandlers = (sourceProps: AnyProps, domProps: AnyProps) => {
  const touchHandlerNames = [
    "onTouchCancel",
    "onTouchEnd",
    "onTouchMove",
    "onTouchStart"
  ] as const;

  for (const handlerName of touchHandlerNames) {
    const handler = sourceProps[handlerName] as
      | ((event: ResponderEvent) => void)
      | undefined;

    if (!handler) {
      continue;
    }

    const existingHandler = domProps[handlerName] as
      | React.TouchEventHandler<Element>
      | undefined;

    domProps[handlerName] = (event: React.TouchEvent<Element>) => {
      if (existingHandler) {
        existingHandler(event);
        return;
      }

      handler(createResponderEvent(event));
    };
  }
};

const flattenStyle = (style: StyleValue): AnyProps | undefined => {
  if (!style) {
    return undefined;
  }

  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle).filter(Boolean));
  }

  if (typeof style === "object") {
    return style;
  }

  return undefined;
};

const getCssPointerEvents = (pointerEvents: PointerEventsValue | undefined) => {
  if (pointerEvents === "none" || pointerEvents === "box-none") {
    return "none";
  }

  return pointerEvents === "box-only" || pointerEvents === "auto"
    ? "auto"
    : undefined;
};

const toDomProps = (props: AnyProps = {}) => {
  const {
    accessibilityLabel,
    accessibilityRole,
    accessible: _accessible,
    collapsable: _collapsable,
    hitSlop: _hitSlop,
    nativeID,
    pointerEvents,
    pressRetentionOffset: _pressRetentionOffset,
    style,
    testID,
    onTouchCancel: _onTouchCancel,
    onTouchEnd: _onTouchEnd,
    onTouchMove: _onTouchMove,
    onTouchStart: _onTouchStart,
    ...rest
  } = props;
  const domProps: AnyProps = { ...rest };

  for (const key of responderProps) {
    delete domProps[key];
  }

  if (accessibilityLabel) {
    domProps["aria-label"] = accessibilityLabel;
  }

  if (accessibilityRole) {
    domProps.role = accessibilityRole === "image" ? "img" : accessibilityRole;
  }

  if (nativeID) {
    domProps.id = nativeID;
  }

  if (testID) {
    domProps["data-testid"] = testID;
  }

  const flatStyle = flattenStyle(style as StyleValue);
  const cssPointerEvents = getCssPointerEvents(
    pointerEvents as PointerEventsValue | undefined
  );
  domProps.style = {
    ...(flatStyle ?? {}),
    ...(cssPointerEvents ? { pointerEvents: cssPointerEvents } : {})
  };
  return domProps;
};

const createPrimitive = (
  tag: string,
  defaultStyle?: AnyProps,
  displayName = tag
) => {
  const Primitive = React.forwardRef<HTMLElement, AnyProps>((props, ref) => {
    const activeResponderRef = React.useRef<ActiveResponder | undefined>(
      undefined
    );
    const pendingPointerRef = React.useRef<PendingResponderPointer | undefined>(
      undefined
    );
    const domProps = toDomProps(props);
    domProps.style = { ...defaultStyle, ...(domProps.style as AnyProps) };
    addResponderDomHandlers(
      props,
      domProps,
      activeResponderRef,
      pendingPointerRef
    );
    addTouchDomHandlers(props, domProps);

    return React.createElement(tag, { ...domProps, ref });
  });
  Primitive.displayName = displayName;
  return Primitive;
};

class AnimatedValue {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  addListener(listener: (value: { value: number }) => void) {
    listener({ value: this.value });

    return String(Date.now());
  }

  interpolate() {
    return this.value;
  }

  removeAllListeners() {
    return undefined;
  }

  removeListener() {
    return undefined;
  }

  setValue(value: number) {
    this.value = value;
  }
}

const createAnimatedComponent = <T,>(Component: T) => Component;

export const View = createPrimitive(
  "div",
  {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  },
  "View"
);

export const Text = createPrimitive(
  "span",
  {
    boxSizing: "border-box",
    display: "inline"
  },
  "Text"
);

export const TextInput = React.forwardRef<TextInputHandle, AnyProps>(
  ({ value, ...props }, ref) => {
    const elementRef = React.useRef<HTMLInputElement | null>(null);
    const domProps = toDomProps(props);

    React.useImperativeHandle(ref, () => ({
      setNativeProps: (nativeProps: { text?: string; value?: string }) => {
        if (elementRef.current) {
          elementRef.current.value =
            nativeProps.text ?? nativeProps.value ?? "";
        }
      }
    }));

    return React.createElement("input", {
      ...domProps,
      defaultValue: value as string | undefined,
      ref: elementRef,
      style: {
        border: 0,
        background: "transparent",
        ...(domProps.style as AnyProps)
      }
    });
  }
);
TextInput.displayName = "TextInput";

export const Pressable = React.forwardRef<HTMLElement, AnyProps>(
  ({ onPress, style, ...props }, ref) => {
    const resolvedStyle =
      typeof style === "function"
        ? style({ focused: false, hovered: false, pressed: false })
        : style;
    const domProps = toDomProps({ ...props, style: resolvedStyle });

    return React.createElement("button", {
      ...domProps,
      onClick: onPress as React.MouseEventHandler,
      ref,
      style: {
        appearance: "none",
        border: 0,
        cursor: "pointer",
        font: "inherit",
        ...(domProps.style as AnyProps)
      },
      type: "button"
    });
  }
);
Pressable.displayName = "Pressable";

export const ScrollView = React.forwardRef<ScrollHandle, AnyProps>(
  (
    { children, contentContainerStyle, horizontal, onScroll, style, ...props },
    ref
  ) => {
    const elementRef = React.useRef<HTMLDivElement | null>(null);
    const scrollDragRef = React.useRef<ScrollDragState | undefined>(undefined);
    const handleScroll = onScroll as
      | ((event: {
          nativeEvent: { contentOffset: { x: number; y: number } };
        }) => void)
      | undefined;
    const domProps = toDomProps({ ...props, style });

    React.useImperativeHandle(ref, () => ({
      scrollTo: ({ animated: _animated, x = 0, y = 0 } = {}) => {
        elementRef.current?.scrollTo({ left: x, top: y });
      }
    }));

    return React.createElement(
      "div",
      {
        ...domProps,
        onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => {
          (
            domProps.onPointerCancel as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(event);

          if (scrollDragRef.current?.pointerId === event.pointerId) {
            event.currentTarget.releasePointerCapture?.(event.pointerId);
            scrollDragRef.current = undefined;
          }
        },
        onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
          (
            domProps.onPointerDown as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(event);

          if (
            !horizontal ||
            event.button !== 0 ||
            event.defaultPrevented ||
            event.currentTarget.scrollWidth <= event.currentTarget.clientWidth
          ) {
            return;
          }

          scrollDragRef.current = {
            active: false,
            pointerId: event.pointerId,
            scrollLeft: event.currentTarget.scrollLeft,
            startX: event.clientX,
            startY: event.clientY
          };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        },
        onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
          (
            domProps.onPointerMove as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(event);

          const drag = scrollDragRef.current;

          if (!drag || drag.pointerId !== event.pointerId) {
            return;
          }

          const deltaX = event.clientX - drag.startX;
          const deltaY = event.clientY - drag.startY;
          const absoluteDeltaX = Math.abs(deltaX);
          const absoluteDeltaY = Math.abs(deltaY);

          if (!drag.active) {
            if (absoluteDeltaX < 3) {
              return;
            }

            if (absoluteDeltaY > absoluteDeltaX) {
              event.currentTarget.releasePointerCapture?.(event.pointerId);
              scrollDragRef.current = undefined;
              return;
            }
          }

          drag.active = true;
          event.currentTarget.scrollLeft = drag.scrollLeft - deltaX;
          event.preventDefault();
        },
        onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
          (
            domProps.onPointerUp as
              | React.PointerEventHandler<HTMLDivElement>
              | undefined
          )?.(event);

          if (scrollDragRef.current?.pointerId === event.pointerId) {
            event.currentTarget.releasePointerCapture?.(event.pointerId);
            scrollDragRef.current = undefined;
          }
        },
        onScroll: (event: React.UIEvent<HTMLDivElement>) => {
          handleScroll?.({
            nativeEvent: {
              contentOffset: {
                x: event.currentTarget.scrollLeft,
                y: event.currentTarget.scrollTop
              }
            }
          });
        },
        ref: elementRef,
        style: {
          ...(domProps.style as AnyProps),
          overflowX: horizontal ? "auto" : "hidden",
          overflowY: horizontal ? "hidden" : "auto"
        }
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            ...(flattenStyle(contentContainerStyle as StyleValue) ?? {})
          }
        },
        children as React.ReactNode
      )
    );
  }
);
ScrollView.displayName = "ScrollView";

export const Image = createPrimitive("img");

export const Animated = {
  Value: AnimatedValue,
  View,
  createAnimatedComponent,
  event:
    (mapping: unknown) =>
    (event: { nativeEvent?: { contentOffset?: { x?: number } } }) => {
      const xValue = Array.isArray(mapping)
        ? (
            mapping[0] as {
              nativeEvent?: { contentOffset?: { x?: AnimatedValue } };
            }
          )?.nativeEvent?.contentOffset?.x
        : undefined;

      if (xValue instanceof AnimatedValue) {
        xValue.setValue(event.nativeEvent?.contentOffset?.x ?? 0);
      }
    }
};

export const StyleSheet = {
  absoluteFillObject: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  create: <T extends Record<string, AnyProps>>(styles: T) => styles,
  flatten: flattenStyle,
  hairlineWidth: 1
};

export const Platform = {
  OS: "web",
  select: <T,>(options: Record<string, T>) => options.web ?? options.default
};

export const PanResponder = {
  create: (config: AnyProps) => ({ panHandlers: config })
};

export const PixelRatio = {
  get: () => 1,
  getPixelSizeForLayoutSize: (value: number) => Math.round(value)
};

export const Touchable = {
  Mixin: {
    touchableGetInitialState: () => ({}),
    touchableHandleResponderGrant: () => undefined,
    touchableHandleResponderMove: () => undefined,
    touchableHandleResponderRelease: () => undefined,
    touchableHandleResponderTerminate: () => undefined,
    touchableHandleResponderTerminationRequest: () => true,
    touchableHandleStartShouldSetResponder: () => false
  }
};

export const NativeModules = {};
export const UIManager = {};
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null
};

export const findNodeHandle = () => null;
export const processColor = normalizeColor;
export const useColorScheme = () => "light";
export const unstable_createElement = (tag: string, props: AnyProps) =>
  React.createElement(tag, toDomProps(props));
