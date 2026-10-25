import { useLayoutEffect, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { runOnJS, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export interface FlipGestureOptions {
    width: number;
    height: number;
    flipDistance: number;
    hasNext: boolean;
    hasPrev: boolean;
    maxScale: number;
    resetKey: number;
    onCommit: (direction: number) => void;
}

export interface FlipGesture {
    gesture: ReturnType<typeof Gesture.Simultaneous>;
    progress: SharedValue<number>;
    scale: SharedValue<number>;
    transX: SharedValue<number>;
    transY: SharedValue<number>;
}

const FLIP_THRESHOLD = 0.5;
const VELOCITY_THRESHOLD = 800;
const FLIP_DURATION = 240;
const MIN_SCALE = 1;

export function useFlipGesture({
    width,
    height,
    flipDistance,
    hasNext,
    hasPrev,
    maxScale,
    resetKey,
    onCommit,
}: FlipGestureOptions): FlipGesture {
    const progress = useSharedValue(0);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const transX = useSharedValue(0);
    const transY = useSharedValue(0);
    const savedTransX = useSharedValue(0);
    const savedTransY = useSharedValue(0);

    useLayoutEffect(() => {
        progress.value = 0;
        scale.value = 1;
        savedScale.value = 1;
        transX.value = 0;
        transY.value = 0;
        savedTransX.value = 0;
        savedTransY.value = 0;
    }, [resetKey, progress, scale, savedScale, transX, transY, savedTransX, savedTransY]);

    const gesture = useMemo(() => {
        const pinch = Gesture.Pinch()
            .onUpdate((event) => {
                const nextScale = savedScale.value * event.scale;
                scale.value = Math.min(maxScale, Math.max(MIN_SCALE, nextScale));
            })
            .onEnd(() => {
                if (scale.value <= MIN_SCALE) {
                    scale.value = withTiming(MIN_SCALE);
                    savedScale.value = MIN_SCALE;
                    transX.value = withTiming(0);
                    transY.value = withTiming(0);
                    savedTransX.value = 0;
                    savedTransY.value = 0;
                    return;
                }
                savedScale.value = scale.value;
                const maxX = (width * (scale.value - 1)) / 2;
                const maxY = (height * (scale.value - 1)) / 2;
                const clampedX = Math.min(maxX, Math.max(-maxX, transX.value));
                const clampedY = Math.min(maxY, Math.max(-maxY, transY.value));
                transX.value = withTiming(clampedX);
                transY.value = withTiming(clampedY);
                savedTransX.value = clampedX;
                savedTransY.value = clampedY;
            });

        const pan = Gesture.Pan()
            .activeOffsetX([-12, 12])
            .activeOffsetY([-12, 12])
            .onUpdate((event) => {
                if (scale.value > MIN_SCALE) {
                    const maxX = (width * (scale.value - 1)) / 2;
                    const maxY = (height * (scale.value - 1)) / 2;
                    transX.value = Math.min(
                        maxX,
                        Math.max(-maxX, savedTransX.value + event.translationX),
                    );
                    transY.value = Math.min(
                        maxY,
                        Math.max(-maxY, savedTransY.value + event.translationY),
                    );
                    return;
                }
                let p = event.translationX / flipDistance;
                if (p < 0 && !hasNext) {
                    p = 0;
                }
                if (p > 0 && !hasPrev) {
                    p = 0;
                }
                progress.value = Math.max(-1, Math.min(1, p));
            })
            .onEnd((event) => {
                if (scale.value > MIN_SCALE) {
                    savedTransX.value = transX.value;
                    savedTransY.value = transY.value;
                    return;
                }
                const p = progress.value;
                const fast = Math.abs(event.velocityX) > VELOCITY_THRESHOLD;
                let dir = 0;
                if (Math.abs(p) > FLIP_THRESHOLD) {
                    dir = p < 0 ? -1 : 1;
                } else if (fast) {
                    dir = event.velocityX < 0 ? -1 : 1;
                }
                if (dir < 0 && hasNext) {
                    progress.value = withTiming(-1, { duration: FLIP_DURATION }, (finished) => {
                        if (finished) {
                            runOnJS(onCommit)(1);
                        }
                    });
                } else if (dir > 0 && hasPrev) {
                    progress.value = withTiming(1, { duration: FLIP_DURATION }, (finished) => {
                        if (finished) {
                            runOnJS(onCommit)(-1);
                        }
                    });
                } else {
                    progress.value = withSpring(0, { damping: 20, stiffness: 220 });
                }
            });

        return Gesture.Simultaneous(pinch, pan);
    }, [
        width,
        height,
        flipDistance,
        maxScale,
        hasNext,
        hasPrev,
        progress,
        scale,
        savedScale,
        transX,
        transY,
        savedTransX,
        savedTransY,
        onCommit,
    ]);

    return { gesture, progress, scale, transX, transY };
}
