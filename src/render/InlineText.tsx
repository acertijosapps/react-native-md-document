import React from 'react';
import { Text, type TextStyle } from 'react-native';

import type { Inline, InlineStyle } from '../parser/types';
import type { DocTheme } from './theme';
import type { ActiveRange, Highlight } from './types';

export interface InlineTextProps {
    inlines: Inline[];
    theme: DocTheme;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    baseStyle?: TextStyle;
    onWordPress?: (offset: number) => void;
}

interface Piece {
    text: string;
    start: number;
    end: number;
    style: InlineStyle;
    isSpace: boolean;
}

function toPieces(inlines: Inline[]): Piece[] {
    const pieces: Piece[] = [];
    for (const tok of inlines) {
        let off = tok.start;
        for (const part of tok.text.split(/(\s+)/)) {
            if (part.length === 0) {
                continue;
            }
            pieces.push({
                text: part,
                start: off,
                end: off + part.length,
                style: tok.style,
                isSpace: /^\s+$/.test(part),
            });
            off += part.length;
        }
    }
    return pieces;
}

function styleFor(style: InlineStyle, theme: DocTheme): TextStyle {
    const out: TextStyle = {};
    if (style.bold) {
        out.fontWeight = '700';
    }
    if (style.italic) {
        out.fontStyle = 'italic';
    }
    if (style.strikethrough) {
        out.textDecorationLine = 'line-through';
    }
    if (style.link) {
        out.color = theme.colors.link;
        out.textDecorationLine = style.strikethrough ? 'underline line-through' : 'underline';
    }
    if (style.code) {
        out.fontFamily = theme.monoFontFamily;
        out.color = theme.colors.code;
    }
    if (style.color) {
        out.color = style.color;
    }
    if (style.fontSize !== undefined) {
        out.fontSize = style.fontSize;
    }
    return out;
}

function backgroundFor(
    piece: Piece,
    theme: DocTheme,
    highlights: Highlight[] | undefined,
    active: ActiveRange | null | undefined,
): string | undefined {
    if (active && piece.start < active.end && piece.end > active.start) {
        return theme.colors.activeWord;
    }
    if (highlights) {
        for (const h of highlights) {
            if (piece.start < h.end && piece.end > h.start) {
                return h.color ?? theme.colors.highlight;
            }
        }
    }
    return undefined;
}

function InlineText({
    inlines,
    theme,
    highlights,
    active,
    baseStyle,
    onWordPress,
}: InlineTextProps): React.JSX.Element {
    const pieces = toPieces(inlines);
    return (
        <Text style={[{ color: theme.colors.text, fontFamily: theme.fontFamily }, baseStyle]}>
            {pieces.map((piece, idx) => {
                const bg = backgroundFor(piece, theme, highlights, active);
                const style: TextStyle = { ...styleFor(piece.style, theme) };
                if (bg) {
                    style.backgroundColor = bg;
                }
                const handlePress =
                    onWordPress && !piece.isSpace ? () => onWordPress(piece.start) : undefined;
                return (
                    <Text
                        key={idx}
                        style={style}
                        suppressHighlighting
                        onPress={handlePress}
                    >
                        {piece.text}
                    </Text>
                );
            })}
        </Text>
    );
}

export default InlineText;
