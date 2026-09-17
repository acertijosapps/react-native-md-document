export type DocumentSource =
    | string
    | { markdown: string }
    | { uri: string; headers?: Record<string, string> };

export interface ResolvedSource {
    kind: 'markdown' | 'uri';
    markdown?: string;
    uri?: string;
    headers?: Record<string, string>;
}

export function isUri(value: string): boolean {
    return /^(https?|file|content|asset):/i.test(value) || value.startsWith('/');
}

export function normalizeSource(source: DocumentSource): ResolvedSource {
    if (typeof source === 'string') {
        return isUri(source)
            ? { kind: 'uri', uri: source }
            : { kind: 'markdown', markdown: source };
    }
    if ('markdown' in source) {
        return { kind: 'markdown', markdown: source.markdown };
    }
    return { kind: 'uri', uri: source.uri, headers: source.headers };
}

export function sourceSignature(source: DocumentSource): string {
    const resolved = normalizeSource(source);
    if (resolved.kind === 'markdown') {
        return `m:${resolved.markdown ?? ''}`;
    }
    return `u:${resolved.uri ?? ''}|${JSON.stringify(resolved.headers ?? {})}`;
}
