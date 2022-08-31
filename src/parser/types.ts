export type Args = Record<string, string>;
export type Bools = Record<string, boolean>;

export type ParserElement = {
    render: (x: string[], args: Args, bools: Bools) => JSX.Element;
    closingTag?: boolean;
};
export type Elements = Record<string, ParserElement>;

export type ParserOptions<T extends Elements> = {
    text: string;
    elements?: T;
    fallbacks?: [keyof T | 'table' | 'text' | 'script' | 'truthTable' | 'math', Args?, Bools?][];
    textOptions?: TextOptions;
}

export type TextOptions = {
    groupingChars?: string[];
    listChar?: string;
    extended?: (x: string) => [JSX.Element | string, number] | undefined;
};