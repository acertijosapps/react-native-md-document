export interface InlineStyle {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    link?: string;
}

export interface TextToken {
    type: 'text';
    text: string;
    start: number;
    end: number;
    style: InlineStyle;
}

export type Inline = TextToken;

export interface HeadingBlock {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    inlines: Inline[];
}

export interface ParagraphBlock {
    type: 'paragraph';
    inlines: Inline[];
}

export interface BlockquoteBlock {
    type: 'blockquote';
    children: Block[];
}

export interface CodeBlock {
    type: 'code';
    text: string;
    lang?: string;
    start: number;
    end: number;
}

export interface ThematicBreak {
    type: 'thematicBreak';
}

export interface ListItemBlock {
    type: 'listItem';
    children: Block[];
}

export interface ListBlock {
    type: 'list';
    ordered: boolean;
    start?: number;
    items: ListItemBlock[];
}

export type TableAlign = 'left' | 'center' | 'right' | null;

export interface TableCell {
    inlines: Inline[];
}

export interface TableRow {
    cells: TableCell[];
}

export interface TableBlock {
    type: 'table';
    header: TableRow;
    rows: TableRow[];
    align: TableAlign[];
}

export type Block =
    | HeadingBlock
    | ParagraphBlock
    | BlockquoteBlock
    | CodeBlock
    | ThematicBreak
    | ListBlock
    | ListItemBlock
    | TableBlock;

export interface MDDocument {
    blocks: Block[];
    plainText: string;
    length: number;
}

export interface ParseContext {
    parts: string[];
    cursor: number;
}
