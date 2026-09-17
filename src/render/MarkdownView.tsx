import React from 'react';
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';

import type { MDDocument } from '../parser/types';
import BlockList from './BlockList';
import type { DocColorScheme, DocTheme } from './theme';
import type { ActiveRange, Highlight } from './types';
import { useDocTheme } from './useDocTheme';

export interface MarkdownViewProps {
    document: MDDocument;
    theme?: Partial<DocTheme>;
    colorScheme?: DocColorScheme;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    contentContainerStyle?: ViewStyle;
    onWordPress?: (offset: number) => void;
}

function MarkdownView({
    document,
    theme,
    colorScheme,
    highlights,
    active,
    contentContainerStyle,
    onWordPress,
}: MarkdownViewProps): React.JSX.Element {
    const resolvedTheme = useDocTheme(colorScheme, theme);
    return (
        <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>
            <BlockList
                blocks={document.blocks}
                theme={resolvedTheme}
                highlights={highlights}
                active={active}
                onWordPress={onWordPress}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
});

export default MarkdownView;
