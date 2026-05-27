/* eslint-disable react-hooks/refs -- The preview stub stores responder state in refs and only reads it inside pointer event handlers. */
import * as React from "react";

import normalizeColor from "./normalizeColorsStub";

type AnyProps = Record<string, unknown>;
type ScrollHandle = {
  scrollTo: (options?: { animated?: boolean; x?: number; y?: number }) => void;
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
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startTime: number;
    }
  | {
      kind: "responder";
      pointerId: number;
    };
type MutableRef<T> = {
  current: T;
};
type PressableState = { focused: boolean; hovered: boolean; pressed: boolean };
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
  const responderPredicate =
    phase === "start"
      ? (props.onStartShouldSetResponder as ResponderPredicate)
      : (props.onMoveShouldSetResponder as ResponderPredicate);

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
  activeResponderRef: MutableRef<ActiveResponder | undefined>
) => {
  const hasResponderProps = Array.from(responderProps).some(
    (key) => sourceProps[key] !== undefined
  );

  if (!hasResponderProps) {
    return;
  }

  const startResponder = (
    event: React.PointerEvent<Element>,
    kind: "pan" | "responder",
    gestureState: PanResponderGestureState
  ) => {
    const responderEvent = createResponderEvent(event);

    activeResponderRef.current =
      kind === "pan"
        ? {
            gestureState,
            kind,
            pointerId: event.pointerId,
            startClientX: gestureState.x0,
            startClientY: gestureState.y0,
            startTime: Date.now()
          }
        : {
            kind,
            pointerId: event.pointerId
          };

    event.currentTarget.setPointerCapture?.(event.pointerId);

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

  const finishResponder = (
    event: React.PointerEvent<Element>,
    terminated = false
  ) => {
    const activeResponder = activeResponderRef.current;

    if (!activeResponder || activeResponder.pointerId !== event.pointerId) {
      return;
    }

    const responderEvent = createResponderEvent(event);
    activeResponderRef.current = undefined;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

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

  domProps.onPointerDown = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerDown as React.PointerEventHandler<Element>)?.(event);

    if (activeResponderRef.current) {
      return;
    }

    const responderEvent = createResponderEvent(event);
    const gestureState = createGestureState({
      clientX: event.clientX,
      clientY: event.clientY,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTime: Date.now(),
      stateID: event.pointerId
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

  domProps.onPointerMove = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerMove as React.PointerEventHandler<Element>)?.(event);

    const activeResponder = activeResponderRef.current;

    if (!activeResponder) {
      const responderEvent = createResponderEvent(event);
      const gestureState = createGestureState({
        clientX: event.clientX,
        clientY: event.clientY,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startTime: Date.now(),
        stateID: event.pointerId
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

    if (activeResponder.pointerId !== event.pointerId) {
      return;
    }

    const responderEvent = createResponderEvent(event);

    if (activeResponder.kind === "pan") {
      const gestureState = createGestureState({
        clientX: event.clientX,
        clientY: event.clientY,
        startClientX: activeResponder.startClientX,
        startClientY: activeResponder.startClientY,
        startTime: activeResponder.startTime,
        stateID: activeResponder.pointerId
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

  domProps.onPointerUp = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerUp as React.PointerEventHandler<Element>)?.(event);
    finishResponder(event);
  };
  domProps.onPointerCancel = (event: React.PointerEvent<Element>) => {
    (sourceProps.onPointerCancel as React.PointerEventHandler<Element>)?.(
      event
    );
    finishResponder(event, true);
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

    domProps[handlerName] = (event: React.TouchEvent<Element>) => {
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

const toDomProps = (props: AnyProps = {}) => {
  const {
    accessibilityLabel,
    accessibilityRole,
    accessible: _accessible,
    collapsable: _collapsable,
    hitSlop: _hitSlop,
    nativeID,
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

  domProps.style = flattenStyle(style as StyleValue);
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
    const domProps = toDomProps(props);
    domProps.style = { ...defaultStyle, ...(domProps.style as AnyProps) };
    addResponderDomHandlers(props, domProps, activeResponderRef);
    addTouchDomHandlers(props, domProps);

    return React.createElement(tag, { ...domProps, ref });
  });
  Primitive.displayName = displayName;
  return Primitive;
};

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
    const handleScroll = onScroll as
      | ((event: {
          nativeEvent: { contentOffset: { x: number; y: number } };
        }) => void)
      | undefined;

    React.useImperativeHandle(ref, () => ({
      scrollTo: ({ animated: _animated, x = 0, y = 0 } = {}) => {
        elementRef.current?.scrollTo({ left: x, top: y });
      }
    }));

    return React.createElement(
      "div",
      {
        ...toDomProps({ ...props, style }),
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
          overflowX: horizontal ? "auto" : "hidden",
          overflowY: horizontal ? "hidden" : "auto",
          ...(flattenStyle(style as StyleValue) ?? {})
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
