import React, { Fragment, type ReactNode } from "react";

class StubGesture {
  activateAfterLongPress(_duration: number) {
    return this;
  }

  activeOffsetX(_range: [number, number]) {
    return this;
  }

  activeOffsetY(_range: [number, number]) {
    return this;
  }

  maxDistance(_distance: number) {
    return this;
  }

  maxDuration(_duration: number) {
    return this;
  }

  maxPointers(_count: number) {
    return this;
  }

  minDuration(_duration: number) {
    return this;
  }

  minPointers(_count: number) {
    return this;
  }

  numberOfPointers(_count: number) {
    return this;
  }

  onEnd(_handler: unknown) {
    return this;
  }

  onFinalize(_handler: unknown) {
    return this;
  }

  onStart(_handler: unknown) {
    return this;
  }

  onUpdate(_handler: unknown) {
    return this;
  }

  runOnJS(_enabled: boolean) {
    return this;
  }
}

const createGesture = () => new StubGesture();

export const Gesture = {
  LongPress: createGesture,
  Pan: createGesture,
  Race: (..._gestures: StubGesture[]) => createGesture(),
  Simultaneous: (..._gestures: StubGesture[]) => createGesture(),
  Tap: createGesture
};

export const GestureDetector = ({
  children
}: {
  children: ReactNode;
  gesture: StubGesture;
}) => <Fragment>{children}</Fragment>;

export type ComposedGesture = StubGesture;
export type GestureType = StubGesture;
