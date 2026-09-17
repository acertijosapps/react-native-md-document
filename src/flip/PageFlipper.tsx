import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { Page, PAGE_PADDING } from '../pagination';
import type { Block } from '../parser/types';
import type { ActiveRange, DocTheme, Highlight } from '../render';

export interface PageFlipperProps {
    blocks: Block[];
    pages: number[][];
    pageIndex: number;
    width: number;
    height: number;
    theme: DocTheme;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    onFlip: (nextIndex: number) => void;
    maxScale?: number;
}

const FLIP_THRESHOLD = 0.5;
const VELOCITY_THRESHOLD = 800;
const FLIP_DURATION = 240;
const MIN_SCALE = 1;

function PageFlipper({
    blocks,
    pages,
    pageIndex,
    width,
    height,
    theme,
    highlights,
    active,
    onWordPress,
    onFlip,
    maxScale = 3,
}: PageFlipperProps): React.JSX.Element {
    const progress = useSharedValue(0);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const transX = useSharedValue(0);
    const transY = useSharedValue(0);
    const savedTransX = useSharedValue(0);
    const savedTransY = useSharedValue(0);

    const hasPrev = pageIndex > 0;
    const hasNext = pageIndex < pages.length - 1;

    const pageBlocksAt = useCallback(
        (index: number): Block[] => (pages[index] ?? []).map((i) => blocks[i]!),
        [pages, blocks],
    );

    const current = pageBlocksAt(pageIndex);
    const prev = hasPrev ? pageBlocksAt(pageIndex - 1) : null;
    const next = hasNext ? pageBlocksAt(pageIndex + 1) : null;

    const commit = useCallback(
        (delta: number) => {
            onFlip(pageIndex + delta);
        },
        [onFlip, pageIndex],
    );

    useEffect(() => {
        progress.value = 0;
        scale.value = 1;
        savedScale.value = 1;
        transX.value = 0;
        transY.value = 0;
        savedTransX.value = 0;
        savedTransY.value = 0;
    }, [pageIndex, progress, scale, savedScale, transX, transY, savedTransX, savedTransY]);

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
                let p = event.translationX / width;
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
                            runOnJS(commit)(1);
                        }
                    });
                } else if (dir > 0 && hasPrev) {
                    progress.value = withTiming(1, { duration: FLIP_DURATION }, (finished) => {
                        if (finished) {
                            runOnJS(commit)(-1);
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
        commit,
    ]);

    const topStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(
            progress.value,
            [-1, 0, 1],
            [-165, 0, 165],
            Extrapolation.CLAMP,
        );
        return {
            transform: [
                { translateX: transX.value },
                { translateY: transY.value },
                { perspective: 1200 },
                { rotateY: `${rotateY}deg` },
                { scale: scale.value },
            ],
        };
    });

    const nextStyle = useAnimatedStyle(() => ({ opacity: progress.value < 0 ? 1 : 0 }));
    const prevStyle = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0 }));

    return (
        <GestureDetector gesture={gesture}>
            <View style={[styles.container, { width, height }]}>
                {next ? (
                    <Animated.View
                        style={[styles.layer, nextStyle]}
                        pointerEvents="none"
                    >
                        <Page
                            blocks={next}
                            theme={theme}
                            width={width}
                            height={height}
                            padding={PAGE_PADDING}
                            highlights={highlights}
                            active={active}
                        />
                    </Animated.View>
                ) : null}
                {prev ? (
                    <Animated.View
                        style={[styles.layer, prevStyle]}
                        pointerEvents="none"
                    >
                        <Page
                            blocks={prev}
                            theme={theme}
                            width={width}
                            height={height}
                            padding={PAGE_PADDING}
                            highlights={highlights}
                            active={active}
                        />
                    </Animated.View>
                ) : null}
                <Animated.View style={[styles.layer, styles.top, topStyle]}>
                    <Page
                        blocks={current}
                        theme={theme}
                        width={width}
                        height={height}
                        padding={PAGE_PADDING}
                        highlights={highlights}
                        active={active}
                        onWordPress={onWordPress}
                    />
                </Animated.View>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    layer: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    top: {
        backfaceVisibility: 'hidden',
    },
});

export default PageFlipper;
