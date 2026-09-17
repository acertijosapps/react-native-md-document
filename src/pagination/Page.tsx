import React from 'react';
import { View } from 'react-native';

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
}: PageProps): React.JSX.Element {
    return (
        <View
            style={{
                width,
                height,
                padding,
                backgroundColor: theme.colors.pageBackground,
                overflow: 'hidden',
            }}
        >
            <BlockList
                blocks={blocks}
                theme={theme}
                highlights={highlights}
                active={active}
                onWordPress={onWordPress}
            />
        </View>
    );
}

export default Page;
