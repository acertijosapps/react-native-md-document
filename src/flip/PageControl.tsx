import React from 'react';
import { type AccessibilityActionEvent, StyleSheet, View } from 'react-native';

import { PAGE_PADDING } from '../pagination';
import type { ViewerAccessibilityLabels } from './a11y';
import { stepPageIndex, visiblePageRange } from './a11y';

export interface PageControlProps {
    pageIndex: number;
    pageCount: number;
    pagesPerView: number;
    labels: ViewerAccessibilityLabels;
    onFlip: (nextIndex: number) => void;
}

const CONTROL_HEIGHT = 44;

function PageControl({
    pageIndex,
    pageCount,
    pagesPerView,
    labels,
    onFlip,
}: PageControlProps): React.JSX.Element {
    const { first, last } = visiblePageRange(pageIndex, pagesPerView, pageCount);
    const hasPrev = pageIndex > 0;
    const hasNext = pageIndex + pagesPerView < pageCount;

    const handleAction = (event: AccessibilityActionEvent): void => {
        const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1;
        const next = stepPageIndex(pageIndex, direction, pagesPerView, pageCount);
        if (next !== pageIndex) {
            onFlip(next);
        }
    };

    return (
        <View
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={labels.control}
            accessibilityValue={{ text: labels.pages(first, last, pageCount) }}
            accessibilityState={{ disabled: !hasPrev && !hasNext }}
            accessibilityActions={[
                { name: 'increment', label: labels.nextPage },
                { name: 'decrement', label: labels.previousPage },
            ]}
            onAccessibilityAction={handleAction}
            pointerEvents="none"
            style={styles.control}
        />
    );
}

const styles = StyleSheet.create({
    control: {
        position: 'absolute',
        top: 0,
        left: PAGE_PADDING,
        right: PAGE_PADDING,
        height: CONTROL_HEIGHT,
    },
});

export default PageControl;
