import { useColorScheme } from 'react-native';

import type { DocColorScheme, DocTheme } from './theme';
import { mergeTheme, themeForScheme } from './theme';

export function useDocTheme(
    colorScheme: DocColorScheme = 'auto',
    override?: Partial<DocTheme>,
): DocTheme {
    const system = useColorScheme();
    const mode = colorScheme === 'auto' ? (system ?? 'light') : colorScheme;
    return mergeTheme(override, themeForScheme(mode));
}
