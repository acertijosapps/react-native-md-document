export function paginate(heights: number[], pageHeight: number): number[][] {
    const pages: number[][] = [];
    let current: number[] = [];
    let used = 0;

    for (let i = 0; i < heights.length; i++) {
        const h = heights[i]!;
        if (current.length > 0 && used + h > pageHeight) {
            pages.push(current);
            current = [];
            used = 0;
        }
        current.push(i);
        used += h;
    }

    if (current.length > 0) {
        pages.push(current);
    }

    return pages;
}
