import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Page, PAGE_PADDING } from '../pagination';
import type { Block } from '../parser/types';
import type { ActiveRange, DocTheme, Highlight } from '../render';
import { useFlipGesture } from './useFlipGesture';

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
    const hasPrev = pageIndex > 0;
    const hasNext = pageIndex < pages.length - 1;

    const pageBlocksAt = useCallback(
        (index: number): Block[] =>
            (pages[index] ?? []).map((i) => blocks[i]).filter((b): b is Block => b !== undefined),
        [pages, blocks],
    );

    const current = pageBlocksAt(pageIndex);
    const prev = hasPrev ? pageBlocksAt(pageIndex - 1) : null;
    const next = hasNext ? pageBlocksAt(pageIndex + 1) : null;

    const commit = useCallback(
        (direction: number) => {
            onFlip(pageIndex + direction);
        },
        [onFlip, pageIndex],
    );

    const { gesture, progress, scale, transX, transY } = useFlipGesture({
        width,
        height,
        flipDistance: width,
        hasNext,
        hasPrev,
        maxScale,
        resetKey: pageIndex,
        onCommit: commit,
    });

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
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                    >
                        <Page
                            blocks={next}
                            theme={theme}
                            width={width}
                            height={height}
                            padding={PAGE_PADDING}
                            highlights={highlights}
                            active={active}
                            scrollable={false}
                        />
                    </Animated.View>
                ) : null}
                {prev ? (
                    <Animated.View
                        style={[styles.layer, prevStyle]}
                        pointerEvents="none"
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                    >
                        <Page
                            blocks={prev}
                            theme={theme}
                            width={width}
                            height={height}
                            padding={PAGE_PADDING}
                            highlights={highlights}
                            active={active}
                            scrollable={false}
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
