import { useCallback, useMemo, useRef, useState } from 'react';

import { paginate } from './paginate';

export interface Pagination {
    pages: number[][];
    isMeasured: boolean;
    onBlockLayout: (index: number, height: number) => void;
}

const NO_PAGES: number[][] = [];

export function usePagination(
    blockCount: number,
    pageHeight: number,
    resetKey?: unknown,
    pageWidth?: number,
): Pagination {
    const heightsRef = useRef<number[]>([]);
    const [heights, setHeights] = useState<number[] | null>(null);
    const [measuredFor, setMeasuredFor] = useState({ blockCount, pageWidth, resetKey });

    if (
        measuredFor.blockCount !== blockCount ||
        measuredFor.pageWidth !== pageWidth ||
        measuredFor.resetKey !== resetKey
    ) {
        heightsRef.current = [];
        setMeasuredFor({ blockCount, pageWidth, resetKey });
        setHeights(null);
    }

    const onBlockLayout = useCallback(
        (index: number, height: number) => {
            if (heightsRef.current[index] === height) {
                return;
            }
            heightsRef.current[index] = height;
            const measured = heightsRef.current.filter((h) => h !== undefined).length;
            if (blockCount > 0 && measured === blockCount) {
                setHeights([...heightsRef.current]);
            }
        },
        [blockCount],
    );

    const pages = useMemo(
        () => (heights && pageHeight > 0 ? paginate(heights, pageHeight) : NO_PAGES),
        [heights, pageHeight],
    );

    return { pages, isMeasured: heights !== null && pageHeight > 0, onBlockLayout };
}
