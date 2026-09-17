export interface Highlight {
    id: string;
    start: number;
    end: number;
    color?: string;
}

export interface ActiveRange {
    start: number;
    end: number;
}
