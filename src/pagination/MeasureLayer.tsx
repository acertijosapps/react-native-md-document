import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Block } from '../parser/types';
import type { DocTheme } from '../render';
import { BlockList } from '../render';

export interface MeasureLayerProps {
    blocks: Block[];
    theme: DocTheme;
    width: number;
    padding: number;
    onBlockLayout: (index: number, height: number) => void;
}

function MeasureLayer({
    blocks,
    theme,
    width,
    padding,
    onBlockLayout,
}: MeasureLayerProps): React.JSX.Element {
    return (
        <View
            style={[styles.layer, { width, padding }]}
            pointerEvents="none"
        >
            <BlockList
                blocks={blocks}
                theme={theme}
                onBlockLayout={onBlockLayout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    layer: {
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: 0,
        zIndex: -1,
    },
});

export default React.memo(MeasureLayer);
