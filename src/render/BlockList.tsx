import React from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import type { Block, TableAlign, TableRow } from '../parser/types';
import InlineText from './InlineText';
import { codeBlockStyle, codeTextStyle, type DocTheme, headingSize } from './theme';
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

function renderChildren(
    blocks: Block[],
    ctx: RenderContext,
    keyPrefix: string,
): React.JSX.Element[] {
    return blocks.map((block, i) => renderBlock(block, ctx, `${keyPrefix}.${i}`));
}

function alignText(align: TableAlign): 'left' | 'center' | 'right' {
    return align ?? 'left';
}

function renderTableRow(
    row: TableRow,
    align: TableAlign[],
    ctx: RenderContext,
    key: string,
    isHeader: boolean,
): React.JSX.Element {
    const { theme } = ctx;
    return (
        <View
            key={key}
            style={styles.tableRow}
        >
            {row.cells.map((cell, ci) => (
                <View
                    key={`${key}.${ci}`}
                    style={[styles.tableCell, { borderColor: theme.colors.rule }]}
                >
                    <InlineText
                        inlines={cell.inlines}
                        theme={theme}
                        highlights={ctx.highlights}
                        active={ctx.active}
                        baseStyle={{
                            fontSize: theme.fontSizes.body,
                            fontWeight: isHeader ? '700' : '400',
                            textAlign: alignText(align[ci] ?? null),
                        }}
                        onWordPress={ctx.onWordPress}
                    />
                </View>
            ))}
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
                    style={spacing}
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
                        }}
                        onWordPress={ctx.onWordPress}
                    />
                </View>
            );

        case 'paragraph':
            return (
                <View
                    key={key}
                    style={spacing}
                >
                    <InlineText
                        inlines={block.inlines}
                        theme={theme}
                        highlights={ctx.highlights}
                        active={ctx.active}
                        baseStyle={{ fontSize: theme.fontSizes.body }}
                        onWordPress={ctx.onWordPress}
                    />
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
            return (
                <View
                    key={key}
                    style={[spacing, styles.table, { borderColor: theme.colors.rule }]}
                >
                    {renderTableRow(block.header, block.align, ctx, `${key}.h`, true)}
                    {block.rows.map((row, ri) =>
                        renderTableRow(row, block.align, ctx, `${key}.r${ri}`, false),
                    )}
                </View>
            );

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
        flex: 1,
        padding: 8,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});

export default BlockList;
