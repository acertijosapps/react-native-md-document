import type { TextStyle, ViewStyle } from 'react-native';

export interface DocTheme {
    colors: {
        text: string;
        heading: string;
        link: string;
        code: string;
        codeBackground: string;
        quoteBar: string;
        rule: string;
        highlight: string;
        activeWord: string;
        pageBackground: string;
    };
    fontSizes: {
        body: number;
        code: number;
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
    };
    blockSpacing: number;
    indent: number;
    fontFamily?: string;
    monoFontFamily?: string;
}

export type DocColorScheme = 'light' | 'dark' | 'auto';

export const lightTheme: DocTheme = {
    colors: {
        text: '#1a1a1a',
        heading: '#0a0a0a',
        link: '#0b62d6',
        code: '#7b1fa2',
        codeBackground: '#f2f2f5',
        quoteBar: '#d0d0d8',
        rule: '#e0e0e6',
        highlight: '#fff2a8',
        activeWord: '#ffd54a',
        pageBackground: '#ffffff',
    },
    fontSizes: {
        body: 16,
        code: 14,
        h1: 28,
        h2: 24,
        h3: 20,
        h4: 18,
        h5: 16,
        h6: 15,
    },
    blockSpacing: 12,
    indent: 18,
};

export const darkTheme: DocTheme = {
    ...lightTheme,
    colors: {
        text: '#e6e6ea',
        heading: '#f5f5f7',
        link: '#6aa9ff',
        code: '#d7a8ff',
        codeBackground: '#1e1e24',
        quoteBar: '#3a3a44',
        rule: '#2c2c34',
        highlight: '#6d5a00',
        activeWord: '#a37f00',
        pageBackground: '#141418',
    },
};

export const defaultTheme = lightTheme;

export function themeForScheme(scheme: 'light' | 'dark'): DocTheme {
    return scheme === 'dark' ? darkTheme : lightTheme;
}

export function mergeTheme(override?: Partial<DocTheme>, base: DocTheme = lightTheme): DocTheme {
    if (!override) {
        return base;
    }
    return {
        ...base,
        ...override,
        colors: { ...base.colors, ...override.colors },
        fontSizes: { ...base.fontSizes, ...override.fontSizes },
    };
}

export function headingSize(theme: DocTheme, level: number): number {
    const key = `h${level}` as keyof DocTheme['fontSizes'];
    return theme.fontSizes[key] ?? theme.fontSizes.body;
}

export function codeBlockStyle(theme: DocTheme): ViewStyle {
    return {
        backgroundColor: theme.colors.codeBackground,
        borderRadius: 6,
        padding: 10,
    };
}

export function codeTextStyle(theme: DocTheme): TextStyle {
    return {
        fontFamily: theme.monoFontFamily,
        fontSize: theme.fontSizes.code,
        color: theme.colors.text,
    };
}
