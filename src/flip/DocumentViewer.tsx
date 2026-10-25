import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import {
    blockIndexForOffset,
    DUAL_PAGE_MIN_WIDTH,
    MeasureLayer,
    PAGE_PADDING,
    pageForBlock,
    pageIndexForOffset,
    pageStartOffset,
    resolveSpread,
    spreadStartIndex,
    topLevelBlockRanges,
    usePagination,
} from '../pagination';
import type { MDDocument } from '../parser/types';
import type { ActiveRange, ColorTokens, DocColorScheme, DocTheme, Highlight } from '../render';
import { useDocTheme } from '../render';
import type { DocumentSource, ReadUri } from '../source';
import { useDocumentSource } from '../source';
import PageFlipper from './PageFlipper';
import SpreadFlipper from './SpreadFlipper';

export interface DocumentViewerProps {
    document?: MDDocument;
    source?: DocumentSource;
    readUri?: ReadUri;
    theme?: Partial<DocTheme>;
    colorScheme?: DocColorScheme;
    colorTokens?: ColorTokens;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    onPageChange?: (
        pageIndex: number,
        pageCount: number,
        pageStartOffset: number,
        pagesPerView: number,
    ) => void;
    maxScale?: number;
    dualPage?: boolean;
    dualPageMinWidth?: number;
    spreadGap?: number;
    onLoadComplete?: (document: MDDocument) => void;
    onLoadError?: (error: Error) => void;
    renderLoading?: () => React.ReactNode;
    renderError?: (error: Error, retry: () => void) => React.ReactNode;
}

interface ViewerCoreProps {
    document: MDDocument;
    theme?: Partial<DocTheme>;
    colorScheme?: DocColorScheme;
    colorTokens?: ColorTokens;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    onPageChange?: DocumentViewerProps['onPageChange'];
    maxScale?: number;
    dualPage?: boolean;
    dualPageMinWidth?: number;
    spreadGap?: number;
}

function ViewerCore({
    document,
    theme,
    colorScheme,
    colorTokens,
    highlights,
    active,
    onWordPress,
    onPageChange,
    maxScale,
    dualPage = true,
    dualPageMinWidth = DUAL_PAGE_MIN_WIDTH,
    spreadGap = 0,
}: ViewerCoreProps): React.JSX.Element {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [pageIndex, setPageIndex] = useState(0);
    const resolvedTheme = useDocTheme(colorScheme, theme, colorTokens);
    const { isSpread, pageWidth } = resolveSpread({
        width: size.width,
        height: size.height,
        enabled: dualPage,
        minWidth: dualPageMinWidth,
        gap: spreadGap,
    });
    const contentHeight = size.height - PAGE_PADDING * 2;
    const pagination = usePagination(document.blocks.length, contentHeight, document, pageWidth);

    const onPageChangeRef = useRef(onPageChange);
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    });

    const [documentVersion, setDocumentVersion] = useState(0);
    const [seenDocument, setSeenDocument] = useState(document);
    if (seenDocument !== document) {
        setSeenDocument(document);
        setDocumentVersion((v) => v + 1);
    }

    const anchorRef = useRef(0);
    const blockRanges = useMemo(() => topLevelBlockRanges(document.blocks), [document]);

    const [seenPages, setSeenPages] = useState(pagination.pages);
    if (seenPages !== pagination.pages) {
        setSeenPages(pagination.pages);
        if (pagination.isMeasured) {
            setPageIndex(pageIndexForOffset(pagination.pages, blockRanges, anchorRef.current));
        }
    }

    const pageCount = pagination.pages.length;
    const safeIndex = spreadStartIndex(Math.min(pageIndex, Math.max(0, pageCount - 1)), isSpread);
    const pagesPerView = isSpread ? 2 : 1;

    useEffect(() => {
        if (pagination.isMeasured) {
            const startOffset = pageStartOffset(pagination.pages, blockRanges, safeIndex);
            anchorRef.current = startOffset;
            onPageChangeRef.current?.(safeIndex, pageCount, startOffset, pagesPerView);
        }
    }, [safeIndex, pageCount, pagesPerView, pagination.isMeasured, pagination.pages, blockRanges]);

    useEffect(() => {
        setPageIndex(0);
        anchorRef.current = 0;
    }, [document]);

    const activeStart = active?.start ?? -1;
    useEffect(() => {
        if (!pagination.isMeasured || activeStart < 0) {
            return;
        }
        const bi = blockIndexForOffset(blockRanges, activeStart);
        if (bi < 0) {
            return;
        }
        const target = spreadStartIndex(pageForBlock(pagination.pages, bi), isSpread);
        if (target >= 0) {
            setPageIndex((prev) => (prev === target ? prev : target));
        }
    }, [activeStart, isSpread, pagination.isMeasured, pagination.pages, blockRanges]);

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
            {hasSize ? (
                <MeasureLayer
                    key={`${pageWidth}:${documentVersion}`}
                    blocks={document.blocks}
                    theme={resolvedTheme}
                    width={pageWidth}
                    padding={PAGE_PADDING}
                    onBlockLayout={pagination.onBlockLayout}
                />
            ) : null}
            {hasSize && pagination.isMeasured && isSpread ? (
                <SpreadFlipper
                    key={safeIndex}
                    blocks={document.blocks}
                    pages={pagination.pages}
                    pageIndex={safeIndex}
                    pageWidth={pageWidth}
                    gap={spreadGap}
                    height={size.height}
                    theme={resolvedTheme}
                    highlights={highlights}
                    active={active}
                    onWordPress={onWordPress}
                    onFlip={handleFlip}
                    maxScale={maxScale}
                />
            ) : null}
            {hasSize && pagination.isMeasured && !isSpread ? (
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

function SourcedDocumentViewer({
    source,
    readUri,
    onLoadComplete,
    onLoadError,
    renderLoading,
    renderError,
    theme,
    colorScheme,
    colorTokens,
    highlights,
    active,
    onWordPress,
    onPageChange,
    maxScale,
    dualPage,
    dualPageMinWidth,
    spreadGap,
}: DocumentViewerProps & { source: DocumentSource }): React.JSX.Element {
    const { document, isLoading, error, reload } = useDocumentSource(source, {
        readUri,
        onLoadComplete,
        onLoadError,
    });

    if (document) {
        return (
            <ViewerCore
                document={document}
                theme={theme}
                colorScheme={colorScheme}
                colorTokens={colorTokens}
                highlights={highlights}
                active={active}
                onWordPress={onWordPress}
                onPageChange={onPageChange}
                maxScale={maxScale}
                dualPage={dualPage}
                dualPageMinWidth={dualPageMinWidth}
                spreadGap={spreadGap}
            />
        );
    }
    if (error) {
        return <>{renderError ? renderError(error, reload) : null}</>;
    }
    if (isLoading) {
        return <>{renderLoading ? renderLoading() : null}</>;
    }
    return <>{null}</>;
}

function DocumentViewer(props: DocumentViewerProps): React.JSX.Element {
    if (props.source !== undefined) {
        return (
            <SourcedDocumentViewer
                {...props}
                source={props.source}
            />
        );
    }
    if (!props.document) {
        return <>{null}</>;
    }
    return (
        <ViewerCore
            document={props.document}
            theme={props.theme}
            colorScheme={props.colorScheme}
            colorTokens={props.colorTokens}
            highlights={props.highlights}
            active={props.active}
            onWordPress={props.onWordPress}
            onPageChange={props.onPageChange}
            maxScale={props.maxScale}
            dualPage={props.dualPage}
            dualPageMinWidth={props.dualPageMinWidth}
            spreadGap={props.spreadGap}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default DocumentViewer;
