export interface InlineStyle {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    link?: string;
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
}

export interface TextToken {
    type: 'text';
    text: string;
    start: number;
    end: number;
    style: InlineStyle;
}

export type Inline = TextToken;

export type BlockAlign = 'left' | 'center' | 'right' | 'justify';

export interface BlockStyle {
    align?: BlockAlign;
    color?: string;
    background?: string;
    fontSize?: number;
    fontWeight?: 'bold';
    fontStyle?: 'italic';
    textTransform?: 'uppercase' | 'lowercase' | 'none';
    marginBottom?: number;
}

export interface HeadingBlock {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    inlines: Inline[];
    style?: BlockStyle;
}

export interface ParagraphBlock {
    type: 'paragraph';
    inlines: Inline[];
    style?: BlockStyle;
}

export interface BlockquoteBlock {
    type: 'blockquote';
    children: Block[];
}

export interface ContainerBlock {
    type: 'container';
    children: Block[];
    style?: BlockStyle;
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
    children: Block[];
    style?: BlockStyle;
}

export interface TableRow {
    cells: TableCell[];
}

export interface TableBlock {
    type: 'table';
    header?: TableRow;
    rows: TableRow[];
    align: TableAlign[];
    colWidths?: (number | null)[];
    style?: BlockStyle;
}

export type Block =
    | HeadingBlock
    | ParagraphBlock
    | BlockquoteBlock
    | ContainerBlock
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
