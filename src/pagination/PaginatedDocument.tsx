import React, { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import type { MDDocument } from '../parser/types';
import type { ActiveRange, ColorTokens, DocColorScheme, DocTheme, Highlight } from '../render';
import { useDocTheme } from '../render';
import { PAGE_PADDING } from './constants';
import MeasureLayer from './MeasureLayer';
import Page from './Page';
import { usePagination } from './usePagination';

export interface PaginatedDocumentProps {
    document: MDDocument;
    pageIndex: number;
    theme?: Partial<DocTheme>;
    colorScheme?: DocColorScheme;
    colorTokens?: ColorTokens;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    onPagesChange?: (pageCount: number) => void;
}

function PaginatedDocument({
    document,
    pageIndex,
    theme,
    colorScheme,
    colorTokens,
    highlights,
    active,
    onWordPress,
    onPagesChange,
}: PaginatedDocumentProps): React.JSX.Element {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const resolvedTheme = useDocTheme(colorScheme, theme, colorTokens);
    const contentHeight = size.height - PAGE_PADDING * 2;
    const pagination = usePagination(document.blocks.length, contentHeight, document);

    const onPagesChangeRef = useRef(onPagesChange);
    useEffect(() => {
        onPagesChangeRef.current = onPagesChange;
    });

    const pageCount = pagination.pages.length;
    useEffect(() => {
        if (pagination.isMeasured) {
            onPagesChangeRef.current?.(pageCount);
        }
    }, [pageCount, pagination.isMeasured]);

    const handleContainerLayout = (event: LayoutChangeEvent): void => {
        const { width, height } = event.nativeEvent.layout;
        setSize((prev) =>
            prev.width === width && prev.height === height ? prev : { width, height },
        );
    };

    const hasSize = size.width > 0 && size.height > 0;
    const pageBlocks = (pagination.pages[pageIndex] ?? []).map((i) => document.blocks[i]!);

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
                <Page
                    blocks={pageBlocks}
                    theme={resolvedTheme}
                    width={size.width}
                    height={size.height}
                    padding={PAGE_PADDING}
                    highlights={highlights}
                    active={active}
                    onWordPress={onWordPress}
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

export default PaginatedDocument;
