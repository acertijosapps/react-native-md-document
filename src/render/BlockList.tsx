import React from 'react';
import {
    type LayoutChangeEvent,
    StyleSheet,
    Text,
    type TextStyle,
    View,
    type ViewStyle,
} from 'react-native';

import type { Block, BlockStyle, TableBlock } from '../parser/types';
import InlineText from './InlineText';
import {
    codeBlockStyle,
    codeTextStyle,
    type DocTheme,
    headingSize,
    resolveThemeColor,
} from './theme';
import type { ActiveRange, Highlight } from './types';

export interface RenderContext {
    theme: DocTheme;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
}

export interface BlockListProps extends RenderContext {
    blocks: Block[];
    onBlockLayout?: (index: number, height: number) => void;
}

function blockText(style: BlockStyle | undefined, theme: DocTheme): TextStyle {
    const out: TextStyle = {};
    if (!style) {
        return out;
    }
    if (style.align) {
        out.textAlign = style.align;
    }
    if (style.color) {
        out.color = resolveThemeColor(style.color, theme);
    }
    if (style.fontSize !== undefined) {
        out.fontSize = style.fontSize;
    }
    if (style.fontWeight) {
        out.fontWeight = '700';
    }
    if (style.fontStyle) {
        out.fontStyle = style.fontStyle;
    }
    if (style.textTransform) {
        out.textTransform = style.textTransform;
    }
    return out;
}

function blockBox(style: BlockStyle | undefined, theme: DocTheme): ViewStyle {
    const out: ViewStyle = {};
    if (!style) {
        return out;
    }
    if (style.background) {
        out.backgroundColor = resolveThemeColor(style.background, theme);
        out.padding = 8;
    }
    if (style.marginBottom !== undefined) {
        out.marginBottom = style.marginBottom;
    }
    if (style.marginTop !== undefined) {
        out.marginTop = style.marginTop;
    }
    if (style.paddingTop !== undefined) {
        out.paddingTop = style.paddingTop;
    }
    if (style.borderTopWidth !== undefined) {
        out.borderTopWidth = style.borderTopWidth;
        out.borderTopColor = resolveThemeColor(style.borderTopColor, theme) ?? theme.colors.rule;
    }
    return out;
}

function renderChildren(
    blocks: Block[],
    ctx: RenderContext,
    keyPrefix: string,
): React.JSX.Element[] {
    return blocks.map((block, i) => renderBlock(block, ctx, `${keyPrefix}.${i}`));
}

function renderTable(block: TableBlock, ctx: RenderContext, key: string): React.JSX.Element {
    const { theme } = ctx;
    const rows = block.header ? [block.header, ...block.rows] : block.rows;
    return (
        <View
            key={key}
            style={[
                { marginBottom: theme.blockSpacing },
                styles.table,
                { borderColor: theme.colors.rule },
            ]}
        >
            {rows.map((row, ri) => {
                const isHeader = block.header != null && ri === 0;
                return (
                    <View
                        key={`${key}.r${ri}`}
                        style={styles.tableRow}
                    >
                        {row.cells.map((cell, ci) => (
                            <View
                                key={`${key}.r${ri}.c${ci}`}
                                style={[
                                    styles.tableCell,
                                    { borderColor: theme.colors.rule },
                                    { flex: block.colWidths?.[ci] ?? 1 },
                                    cell.style?.background
                                        ? {
                                              backgroundColor: resolveThemeColor(
                                                  cell.style.background,
                                                  theme,
                                              ),
                                          }
                                        : null,
                                    isHeader
                                        ? { backgroundColor: theme.colors.codeBackground }
                                        : null,
                                ]}
                            >
                                {renderChildren(cell.children, ctx, `${key}.r${ri}.c${ci}`)}
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
}

function renderBlock(block: Block, ctx: RenderContext, key: string): React.JSX.Element {
    const { theme } = ctx;
    const spacing = { marginBottom: theme.blockSpacing };

    switch (block.type) {
        case 'heading':
            return (
                <View
                    key={key}
                    accessible
                    accessibilityRole="header"
                    style={[spacing, blockBox(block.style, theme)]}
                >
                    <InlineText
                        inlines={block.inlines}
                        theme={theme}
                        highlights={ctx.highlights}
                        active={ctx.active}
                        baseStyle={{
                            fontSize: headingSize(theme, block.level),
                            fontWeight: '700',
                            color: theme.colors.heading,
                            ...blockText(block.style, theme),
                        }}
                        onWordPress={ctx.onWordPress}
                    />
                </View>
            );

        case 'paragraph':
            return (
                <View
                    key={key}
                    style={[spacing, blockBox(block.style, theme)]}
                >
                    <InlineText
                        inlines={block.inlines}
                        theme={theme}
                        highlights={ctx.highlights}
                        active={ctx.active}
                        baseStyle={{
                            fontSize: theme.fontSizes.body,
                            ...blockText(block.style, theme),
                        }}
                        onWordPress={ctx.onWordPress}
                    />
                </View>
            );

        case 'container':
            return (
                <View
                    key={key}
                    style={blockBox(block.style, theme)}
                >
                    {renderChildren(block.children, ctx, key)}
                </View>
            );

        case 'code':
            return (
                <View
                    key={key}
                    style={[spacing, codeBlockStyle(theme)]}
                >
                    <Text style={codeTextStyle(theme)}>{block.text}</Text>
                </View>
            );

        case 'thematicBreak':
            return (
                <View
                    key={key}
                    style={[
                        spacing,
                        { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.rule },
                    ]}
                />
            );

        case 'blockquote':
            return (
                <View
                    key={key}
                    style={[
                        spacing,
                        {
                            borderLeftWidth: 3,
                            borderLeftColor: theme.colors.quoteBar,
                            paddingLeft: theme.indent,
                        },
                    ]}
                >
                    {renderChildren(block.children, ctx, key)}
                </View>
            );

        case 'list':
            return (
                <View
                    key={key}
                    style={spacing}
                >
                    {block.items.map((item, idx) => {
                        const marker = block.ordered ? `${(block.start ?? 1) + idx}.` : '•';
                        return (
                            <View
                                key={`${key}.${idx}`}
                                style={styles.listRow}
                            >
                                <Text
                                    style={{
                                        width: theme.indent + 6,
                                        color: theme.colors.text,
                                        fontSize: theme.fontSizes.body,
                                    }}
                                >
                                    {marker}
                                </Text>
                                <View style={styles.listBody}>
                                    {renderChildren(item.children, ctx, `${key}.${idx}`)}
                                </View>
                            </View>
                        );
                    })}
                </View>
            );

        case 'listItem':
            return <View key={key}>{renderChildren(block.children, ctx, key)}</View>;

        case 'table':
            return renderTable(block, ctx, key);

        default:
            return <View key={key} />;
    }
}

function BlockList({
    blocks,
    theme,
    highlights,
    active,
    onWordPress,
    onBlockLayout,
}: BlockListProps): React.JSX.Element {
    const ctx: RenderContext = { theme, highlights, active, onWordPress };

    if (!onBlockLayout) {
        return <>{renderChildren(blocks, ctx, 'b')}</>;
    }

    const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
        onBlockLayout(index, event.nativeEvent.layout.height);
    };

    return (
        <>
            {blocks.map((block, i) => (
                <View
                    key={`b.${i}`}
                    onLayout={handleLayout(i)}
                >
                    {renderBlock(block, ctx, `b.${i}`)}
                </View>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    listRow: {
        flexDirection: 'row',
    },
    listBody: {
        flex: 1,
    },
    table: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCell: {
        padding: 8,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});

export default BlockList;
