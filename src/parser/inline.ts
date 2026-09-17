import type { Inline, InlineStyle, ParseContext, TextToken } from './types';

interface Run {
    text: string;
    style: InlineStyle;
}

const DELIMS: { open: string; style: InlineStyle }[] = [
    { open: '**', style: { bold: true } },
    { open: '__', style: { bold: true } },
    { open: '~~', style: { strikethrough: true } },
    { open: '*', style: { italic: true } },
    { open: '_', style: { italic: true } },
];

function styleEq(a: InlineStyle, b: InlineStyle): boolean {
    return (
        !!a.bold === !!b.bold &&
        !!a.italic === !!b.italic &&
        !!a.strikethrough === !!b.strikethrough &&
        !!a.code === !!b.code &&
        a.link === b.link
    );
}

function matchCode(s: string, i: number): { content: string; end: number } | null {
    if (s[i] !== '`') {
        return null;
    }
    let n = 0;
    while (s[i + n] === '`') {
        n++;
    }
    const fence = '`'.repeat(n);
    const close = s.indexOf(fence, i + n);
    if (close < 0) {
        return null;
    }
    let content = s.slice(i + n, close);
    if (
        content.length > 1 &&
        content.startsWith(' ') &&
        content.endsWith(' ') &&
        content.trim() !== ''
    ) {
        content = content.slice(1, -1);
    }
    return { content, end: close + n };
}

function matchLink(s: string, i: number): { text: string; url: string; end: number } | null {
    if (s[i] !== '[') {
        return null;
    }
    const close = s.indexOf(']', i + 1);
    if (close < 0 || s[close + 1] !== '(') {
        return null;
    }
    const pclose = s.indexOf(')', close + 2);
    if (pclose < 0) {
        return null;
    }
    return {
        text: s.slice(i + 1, close),
        url: s.slice(close + 2, pclose),
        end: pclose + 1,
    };
}

function matchDelim(
    s: string,
    i: number,
): { inner: string; end: number; style: InlineStyle } | null {
    for (const d of DELIMS) {
        if (!s.startsWith(d.open, i)) {
            continue;
        }
        const from = i + d.open.length;
        const idx = s.indexOf(d.open, from);
        if (idx < 0) {
            continue;
        }
        const inner = s.slice(from, idx);
        if (inner.length === 0) {
            continue;
        }
        return { inner, end: idx + d.open.length, style: d.style };
    }
    return null;
}

function parseRuns(s: string, base: InlineStyle): Run[] {
    const runs: Run[] = [];
    let buf = '';
    let i = 0;
    const flush = (): void => {
        if (buf) {
            runs.push({ text: buf, style: { ...base } });
            buf = '';
        }
    };
    while (i < s.length) {
        if (s[i] === '\\' && i + 1 < s.length) {
            buf += s[i + 1];
            i += 2;
            continue;
        }
        const code = matchCode(s, i);
        if (code) {
            flush();
            runs.push({ text: code.content, style: { ...base, code: true } });
            i = code.end;
            continue;
        }
        const link = matchLink(s, i);
        if (link) {
            flush();
            for (const r of parseRuns(link.text, { ...base, link: link.url })) {
                runs.push(r);
            }
            i = link.end;
            continue;
        }
        const delim = matchDelim(s, i);
        if (delim) {
            flush();
            for (const r of parseRuns(delim.inner, { ...base, ...delim.style })) {
                runs.push(r);
            }
            i = delim.end;
            continue;
        }
        buf += s[i];
        i++;
    }
    flush();
    return runs;
}

function mergeRuns(runs: Run[]): Run[] {
    const out: Run[] = [];
    for (const r of runs) {
        const last = out[out.length - 1];
        if (last && styleEq(last.style, r.style)) {
            last.text += r.text;
        } else {
            out.push({ text: r.text, style: r.style });
        }
    }
    return out;
}

export function parseInline(raw: string, ctx: ParseContext): Inline[] {
    const runs = mergeRuns(parseRuns(raw, {}));
    const tokens: TextToken[] = [];
    for (const run of runs) {
        if (run.text.length === 0) {
            continue;
        }
        const start = ctx.cursor;
        ctx.parts.push(run.text);
        ctx.cursor += run.text.length;
        tokens.push({
            type: 'text',
            text: run.text,
            start,
            end: ctx.cursor,
            style: run.style,
        });
    }
    return tokens;
}
