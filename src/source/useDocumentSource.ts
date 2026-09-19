import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { parse } from '../parser';
import type { MDDocument } from '../parser/types';
import type { DocumentSource } from './types';
import { normalizeSource, sourceSignature } from './types';

export type ReadUri = (uri: string, headers?: Record<string, string>) => Promise<string> | string;

export interface UseDocumentSourceOptions {
    readUri?: ReadUri;
    onLoadComplete?: (document: MDDocument) => void;
    onLoadError?: (error: Error) => void;
}

export interface DocumentSourceState {
    document: MDDocument | null;
    markdown: string | null;
    isLoading: boolean;
    error: Error | null;
    reload: () => void;
}

async function defaultReadUri(uri: string, headers?: Record<string, string>): Promise<string> {
    const response = await fetch(uri, headers ? { headers } : undefined);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} al cargar ${uri}`);
    }
    return response.text();
}

export function useDocumentSource(
    source: DocumentSource,
    options: UseDocumentSourceOptions = {},
): DocumentSourceState {
    const sig = sourceSignature(source);
    const resolved = normalizeSource(source);

    const sourceRef = useRef(source);
    const readRef = useRef(options.readUri);
    const onCompleteRef = useRef(options.onLoadComplete);
    const onErrorRef = useRef(options.onLoadError);
    useEffect(() => {
        sourceRef.current = source;
        readRef.current = options.readUri;
        onCompleteRef.current = options.onLoadComplete;
        onErrorRef.current = options.onLoadError;
    });

    const mdContent = resolved.kind === 'markdown' ? (resolved.markdown ?? '') : null;
    const inlineDoc = useMemo(() => (mdContent === null ? null : parse(mdContent)), [mdContent]);

    useEffect(() => {
        if (inlineDoc) {
            onCompleteRef.current?.(inlineDoc);
        }
    }, [inlineDoc]);

    const [nonce, setNonce] = useState(0);
    const reload = useCallback(() => setNonce((n) => n + 1), []);

    const [remote, setRemote] = useState<{
        document: MDDocument | null;
        markdown: string | null;
        isLoading: boolean;
        error: Error | null;
    }>({ document: null, markdown: null, isLoading: true, error: null });

    useEffect(() => {
        const current = normalizeSource(sourceRef.current);
        if (current.kind !== 'uri') {
            return;
        }
        let cancelled = false;
        setRemote({ document: null, markdown: null, isLoading: true, error: null });
        const read = readRef.current ?? defaultReadUri;
        Promise.resolve(read(current.uri!, current.headers))
            .then((markdown) => {
                if (cancelled) {
                    return;
                }
                const parsed = parse(markdown);
                setRemote({ document: parsed, markdown, isLoading: false, error: null });
                onCompleteRef.current?.(parsed);
            })
            .catch((err) => {
                if (cancelled) {
                    return;
                }
                const error = err instanceof Error ? err : new Error(String(err));
                setRemote({ document: null, markdown: null, isLoading: false, error });
                onErrorRef.current?.(error);
            });
        return () => {
            cancelled = true;
        };
    }, [sig, nonce]);

    if (resolved.kind === 'markdown') {
        return {
            document: inlineDoc,
            markdown: resolved.markdown ?? '',
            isLoading: false,
            error: null,
            reload,
        };
    }
    return { ...remote, reload };
}
