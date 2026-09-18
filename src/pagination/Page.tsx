import React from 'react';
import { ScrollView, View } from 'react-native';

import type { Block } from '../parser/types';
import type { ActiveRange, DocTheme, Highlight } from '../render';
import { BlockList } from '../render';

export interface PageProps {
    blocks: Block[];
    theme: DocTheme;
    width: number;
    height: number;
    padding: number;
    highlights?: Highlight[];
    active?: ActiveRange | null;
    onWordPress?: (offset: number) => void;
    scrollable?: boolean;
}

function Page({
    blocks,
    theme,
    width,
    height,
    padding,
    highlights,
    active,
    onWordPress,
    scrollable = true,
}: PageProps): React.JSX.Element {
    const content = (
        <BlockList
            blocks={blocks}
            theme={theme}
            highlights={highlights}
            active={active}
            onWordPress={onWordPress}
        />
    );
    return (
        <View
            style={{
                width,
                height,
                backgroundColor: theme.colors.pageBackground,
                overflow: 'hidden',
            }}
        >
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={{ padding }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                >
                    {content}
                </ScrollView>
            ) : (
                <View style={{ padding }}>{content}</View>
            )}
        </View>
    );
}

export default Page;
