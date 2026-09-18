import { useColorScheme } from 'react-native';

import type { DocColorScheme, DocTheme } from './theme';
import { mergeTheme, themeForScheme } from './theme';

export interface ColorTokens {
    light?: Record<string, string>;
    dark?: Record<string, string>;
}

export function useColorMode(colorScheme: DocColorScheme = 'auto'): 'light' | 'dark' {
    const system = useColorScheme();
    return colorScheme === 'auto' ? (system ?? 'light') : colorScheme;
}

export function useDocTheme(
    colorScheme: DocColorScheme = 'auto',
    override?: Partial<DocTheme>,
    colorTokens?: ColorTokens,
): DocTheme {
    const mode = useColorMode(colorScheme);
    const theme = mergeTheme(override, themeForScheme(mode));
    const tokens = mode === 'dark' ? colorTokens?.dark : colorTokens?.light;
    return tokens ? { ...theme, tokens } : theme;
}
