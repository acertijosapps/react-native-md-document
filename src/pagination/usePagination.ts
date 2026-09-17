import { useCallback, useEffect, useRef, useState } from 'react';

import { paginate } from './paginate';

export interface Pagination {
    pages: number[][];
    isMeasured: boolean;
    onBlockLayout: (index: number, height: number) => void;
}

export function usePagination(blockCount: number, pageHeight: number): Pagination {
    const heightsRef = useRef<number[]>([]);
    const [pages, setPages] = useState<number[][]>([]);
    const [isMeasured, setIsMeasured] = useState(false);

    useEffect(() => {
        heightsRef.current = [];
        setPages([]);
        setIsMeasured(false);
    }, [blockCount, pageHeight]);

    const onBlockLayout = useCallback(
        (index: number, height: number) => {
            heightsRef.current[index] = height;
            const measured = heightsRef.current.filter((h) => h !== undefined).length;
            if (blockCount > 0 && measured === blockCount && pageHeight > 0) {
                setPages(paginate(heightsRef.current, pageHeight));
                setIsMeasured(true);
            }
        },
        [blockCount, pageHeight],
    );

    return { pages, isMeasured, onBlockLayout };
}
