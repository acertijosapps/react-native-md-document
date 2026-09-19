import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import {
    blockIndexForOffset,
    MeasureLayer,
    PAGE_PADDING,
    pageForBlock,
    pageStartOffset,
    topLevelBlockRanges,
    usePagination,
} from '../pagination';
import type { MDDocument } from '../parser/types';
import type { ActiveRange, ColorTokens, DocColorScheme, DocTheme, Highlight } from '../render';
import { useDocTheme } from '../render';
import PageFlipper from './PageFlipper';

export interface DocumentViewerProps {
    document: MDDocument;
    theme?: Partial<DocTheme>;
    colorScheme?: DocColorScheme;
    colorTokens?: ColorTokens;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    onPageChange?: (pageIndex: number, pageCount: number, pageStartOffset: number) => void;
    maxScale?: number;
}

function DocumentViewer({
    document,
    theme,
    colorScheme,
    colorTokens,
    highlights,
    active,
    onWordPress,
    onPageChange,
    maxScale,
}: DocumentViewerProps): React.JSX.Element {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [pageIndex, setPageIndex] = useState(0);
    const resolvedTheme = useDocTheme(colorScheme, theme, colorTokens);
    const contentHeight = size.height - PAGE_PADDING * 2;
    const pagination = usePagination(document.blocks.length, contentHeight, document);

    const onPageChangeRef = useRef(onPageChange);
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    });

    useEffect(() => {
        setPageIndex(0);
    }, [document]);

    const pageCount = pagination.pages.length;
    const safeIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));

    const blockRanges = useMemo(() => topLevelBlockRanges(document.blocks), [document]);

    useEffect(() => {
        if (pagination.isMeasured) {
            const startOffset = pageStartOffset(pagination.pages, blockRanges, safeIndex);
            onPageChangeRef.current?.(safeIndex, pageCount, startOffset);
        }
    }, [safeIndex, pageCount, pagination.isMeasured, pagination.pages, blockRanges]);

    const activeStart = active?.start ?? -1;
    useEffect(() => {
        if (!pagination.isMeasured || activeStart < 0) {
            return;
        }
        const bi = blockIndexForOffset(blockRanges, activeStart);
        if (bi < 0) {
            return;
        }
        const target = pageForBlock(pagination.pages, bi);
        if (target >= 0) {
            setPageIndex((prev) => (prev === target ? prev : target));
        }
    }, [activeStart, pagination.isMeasured, pagination.pages, blockRanges]);

    const handleContainerLayout = (event: LayoutChangeEvent): void => {
        const { width, height } = event.nativeEvent.layout;
        setSize((prev) =>
            prev.width === width && prev.height === height ? prev : { width, height },
        );
    };

    const handleFlip = useCallback((nextIndex: number) => {
        setPageIndex(nextIndex);
    }, []);

    const hasSize = size.width > 0 && size.height > 0;

    return (
        <View
            style={styles.container}
            onLayout={handleContainerLayout}
        >
            {hasSize && !pagination.isMeasured ? (
                <MeasureLayer
                    blocks={document.blocks}
                    theme={resolvedTheme}
                    width={size.width}
                    padding={PAGE_PADDING}
                    onBlockLayout={pagination.onBlockLayout}
                />
            ) : null}
            {hasSize && pagination.isMeasured ? (
                <PageFlipper
                    key={safeIndex}
                    blocks={document.blocks}
                    pages={pagination.pages}
                    pageIndex={safeIndex}
                    width={size.width}
                    height={size.height}
                    theme={resolvedTheme}
                    highlights={highlights}
                    active={active}
                    onWordPress={onWordPress}
                    onFlip={handleFlip}
                    maxScale={maxScale}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default DocumentViewer;
