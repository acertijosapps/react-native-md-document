import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Page, PAGE_PADDING } from '../pagination';
import type { Block } from '../parser/types';
import type { ActiveRange, DocTheme, Highlight } from '../render';
import { useFlipGesture } from './useFlipGesture';

export interface SpreadFlipperProps {
    blocks: Block[];
    pages: number[][];
    pageIndex: number;
    pageWidth: number;
    gap: number;
    height: number;
    theme: DocTheme;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    onFlip: (nextIndex: number) => void;
    maxScale?: number;
}

const SPREAD_STEP = 2;
const FLAP_ANGLE = 165;
const PERSPECTIVE = 1800;

function SpreadFlipper({
    blocks,
    pages,
    pageIndex,
    pageWidth,
    gap,
    height,
    theme,
    highlights,
    active,
    onWordPress,
    onFlip,
    maxScale = 3,
}: SpreadFlipperProps): React.JSX.Element {
    const width = pageWidth * 2 + gap;
    const rightX = pageWidth + gap;
    const hasPrev = pageIndex > 0;
    const hasNext = pageIndex + SPREAD_STEP < pages.length;

    const pageBlocksAt = useCallback(
        (index: number): Block[] | null => {
            if (index < 0 || index >= pages.length) {
                return null;
            }
            return pages[index]!.map((i) => blocks[i]).filter((b): b is Block => b !== undefined);
        },
        [pages, blocks],
    );

    const commit = useCallback(
        (direction: number) => {
            onFlip(pageIndex + direction * SPREAD_STEP);
        },
        [onFlip, pageIndex],
    );

    const { gesture, progress, scale, transX, transY } = useFlipGesture({
        width,
        height,
        flipDistance: pageWidth,
        hasNext,
        hasPrev,
        maxScale,
        resetKey: pageIndex,
        onCommit: commit,
    });

    const zoomStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: transX.value },
            { translateY: transY.value },
            { scale: scale.value },
        ],
    }));

    const leftFlapStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(progress.value, [0, 1], [0, FLAP_ANGLE], Extrapolation.CLAMP);
        return { transform: [{ perspective: PERSPECTIVE }, { rotateY: `${rotateY}deg` }] };
    });
    const rightFlapStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(progress.value, [-1, 0], [-FLAP_ANGLE, 0], Extrapolation.CLAMP);
        return { transform: [{ perspective: PERSPECTIVE }, { rotateY: `${rotateY}deg` }] };
    });

    const showPrevLeft = useAnimatedStyle(() => ({ opacity: progress.value > 0 ? 1 : 0 }));
    const showNextRight = useAnimatedStyle(() => ({ opacity: progress.value < 0 ? 1 : 0 }));
    const showNextLeft = useAnimatedStyle(() => ({ opacity: progress.value < -0.5 ? 1 : 0 }));
    const showPrevRight = useAnimatedStyle(() => ({ opacity: progress.value > 0.5 ? 1 : 0 }));

    const renderPage = (
        pageBlocks: Block[] | null,
        x: number,
        style: object | object[],
        interactive: boolean,
    ): React.JSX.Element | null =>
        pageBlocks ? (
            <Animated.View
                style={[styles.layer, { left: x, width: pageWidth, height }, style]}
                pointerEvents={interactive ? 'auto' : 'none'}
                accessibilityElementsHidden={!interactive}
                importantForAccessibility={interactive ? 'auto' : 'no-hide-descendants'}
            >
                <Page
                    blocks={pageBlocks}
                    theme={theme}
                    width={pageWidth}
                    height={height}
                    padding={PAGE_PADDING}
                    highlights={highlights}
                    active={active}
                    onWordPress={interactive ? onWordPress : undefined}
                    scrollable={interactive}
                />
            </Animated.View>
        ) : null;

    return (
        <GestureDetector gesture={gesture}>
            <View style={[styles.container, { width, height }]}>
                <Animated.View style={[styles.layer, { width, height }, zoomStyle]}>
                    {renderPage(pageBlocksAt(pageIndex - SPREAD_STEP), 0, showPrevLeft, false)}
                    {renderPage(
                        pageBlocksAt(pageIndex + SPREAD_STEP + 1),
                        rightX,
                        showNextRight,
                        false,
                    )}
                    {renderPage(
                        pageBlocksAt(pageIndex),
                        0,
                        [styles.flap, styles.flapLeft, leftFlapStyle],
                        true,
                    )}
                    {renderPage(pageBlocksAt(pageIndex + SPREAD_STEP), 0, showNextLeft, false)}
                    {renderPage(
                        pageBlocksAt(pageIndex + 1),
                        rightX,
                        [styles.flap, styles.flapRight, rightFlapStyle],
                        true,
                    )}
                    {renderPage(pageBlocksAt(pageIndex - 1), rightX, showPrevRight, false)}
                    <View
                        style={[
                            styles.spine,
                            { left: pageWidth + gap / 2 - StyleSheet.hairlineWidth / 2, height },
                            { backgroundColor: theme.colors.rule },
                        ]}
                        pointerEvents="none"
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
        top: 0,
    },
    flap: {
        backfaceVisibility: 'hidden',
    },
    flapLeft: {
        transformOrigin: 'right center',
    },
    flapRight: {
        transformOrigin: 'left center',
    },
    spine: {
        position: 'absolute',
        top: 0,
        width: StyleSheet.hairlineWidth,
    },
});

export default SpreadFlipper;
