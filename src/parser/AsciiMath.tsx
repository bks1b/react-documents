import katex from 'katex';

const TEXT_SPACE = '15px';
const PIECEWISE_SPACE = '20px';
const BRACKET_SPACE = '6px';
const PADDING = '\\rule{0px}{18px}';
const OP_REGEX = /^[^a-z0-9\s()]+/i;

const alignLines = (arr: string[], alignedOps: string[]) => {
    const eqns = arr.map(str => {
        const operands = [];
        let lastEq = 0;
        let cDepth = 0;
        let rDepth = 0;
        for (let k = 0; k < str.length; k++) {
            switch (str[k]) {
                case '(':
                    rDepth++;
                    break;
                case ')':
                    rDepth--;
                    break;
                case '{':
                    cDepth++;
                    break;
                case '}':
                    cDepth--;
                    break;
                case '&':
                    if (!cDepth && !rDepth) {
                        operands.push([str.slice(lastEq, k), '']);
                        lastEq = k + 1;
                    }
                    break;
            }
            const startsWith = alignedOps
                .filter(x => str.slice(k).startsWith(x))
                .map(x => [x, str.slice(k + x.length).match(OP_REGEX)] as const);
            const op = startsWith.find(x => x[1]) || startsWith[0];
            if (op && !cDepth && !rDepth) {
                if (op[1]) k += op[0].length + op[1][0].length - 1;
                else if (!OP_REGEX.test(str.slice(k - 1, k))) {
                    operands.push([str.slice(lastEq, k), op[0]]);
                    k += op[0].length - 1;
                    lastEq = k + 1;
                }
            }
        }
        return [...operands, [str.slice(lastEq), '']];
    });
    const min = Math.min(...eqns.map(x => x[0].length)) - 1;
    return [eqns.map(x => x.reduce((a, b, i) => i === min ? [...a, b[0] + b[1]] : i < min ? [...a, ...b] : [...a.slice(0, -1), a.slice(-1)[0] + b[0] + b[1]]).map(x => compileExpr(x))), min + 2] as const;
};

const renderAlignment = (arr: string[][]) => arr.map(x => x.map(x => `\\displaystyle{${x}}`).join('&')).join('\\\\' + PADDING);

const compileAM = (x: string) => AMTparseAMtoTeX(
    x
        .replace(/(_\w+?)?(Sum|Delta|Int|Tran|Cont)/g, '{::}$&')
        .replace(/Tran|Lapl|Blapl|Four|Int|Der|Sum|Cont|Pow|cal(.)/g, (x, y) => `\\mathcal{${x === 'Cont' ? 'K' : y || x[0]}}`)
        .replace(/PP/g, '\\mathbb{P}')
        .replace(/(^|[^v])phi/g, '$1varphi')
        .replace(/vphi/g, 'phi')
        .replace(/eps([^i]|$)/g, 'varepsilon$1')
        .replace(/(^|\/)d([a-zA-Z])\^([a-zA-Z0-9])/g, '$1(d $2^$3)')
        .replace(/(^|[/\s])d(vec[a-zA-Z]|[a-zA-Z])(?![a-zA-Z])/g, '$1{:d $2:}')
        .replace(/([^\s]):=/g, '$1 :=')
        .replace(/!((?![ !(){}[\]]|div|$))/g, '!.$1')
        .replace(/Q(R|G)(.+?)( |$)/g, (_, t, x) => {
            const r = `ZZ//${x}ZZ`;
            return t === 'R' ? r : `(${r})^(xx)`;
        }),
)
    .replace(/(\{o\})?\{i\}(\{i\})?\\int(\{s\})?(_.+?)?/g, (_, closed, third, surface, sub) => `\\${closed ? 'o' : ''}${'i'.repeat(third ? 3 : 2)}nt${sub ? `${surface || closed ? '' : '\\limits'}${sub}` : ''}`)
    .replace(/\{b\}\\in\{o\}\{\{m\}_(.+?)\^\{(.)(?:(.+?)\{c\}\{o\})?/g, (_, a, b, c) => `${c ? '\\left(\\!\\!' : ''}{{\\binom${a}${b}${c ? c + '\\!\\!\\right)' : ''}`)
    .replace(/\{e\}\{v\}\{a\}\{l\}\{l\}/g, '\\left.')
    .replace(/\{e\}\{v\}\{a\}\{l\}/g, '{\\left.')
    .replace(/\\:=/g, ':=')
    .replace(/\{?\{\\mid\}_/g, '\\right\\vert_')
    .replace(/(\{\\mid\}|\{\\left\||\\right\|\}){2}/g, '\\|')
    .replace(/(\{h\}\{a\}|\{v\}\{a\}\{g\}\{y\})/g, x => `\\hspace{${TEXT_SPACE}}\\text{${x.replace(/[{}]/g, '')}}\\hspace{${TEXT_SPACE}}`)
    .replace(/\{e\}\{l\}\{l\}/g, '{\\ell}')
    .replace(/\{m\}\{l\}(.+?)\{m\}\{l\}/g, (_, x) => `\\substack{${x.replace(/\{b\}\{r\}/g, '\\\\')}}`)
    .replace(/\{\\left\(\\text\{mod\}/g, '\\quad$&\\ ')
    .replace(/([^(])\\text\{mod\}/g, '$1\\bmod')
    .replace(/#/g, '\\#')
    .replace(/!\./g, '\\not');

const compileExpr = (x: string) => {
    let lastSplit = 0;
    let str = '';
    for (let i = 0; i < x.length; i++) {
        if (x[i] === '$') {
            const j = [...x.slice(i + 1)].findIndex(x => x === '$') + i + 1;
            if (j !== i) {
                str += compileAM(x.slice(lastSplit, i)) + x.slice(i + 1, j);
                i = lastSplit = j + 1;
                continue;
            }
        }
    }
    return str + compileAM(x.slice(lastSplit, x.length));
};

const compile = (str: string) => {
    const pushRange = (a: number, b: number) => res.push(...lines.slice(a, b).map(x => compileExpr(x)));
    const res = [];
    const lines = str.split('\n').map(x => x.trimEnd()).filter(x => x);
    let lastGroup = 0;
    main: for (let i = 0; i < lines.length; i++) {
        if (lines[i].endsWith('{')) {
            pushRange(lastGroup, i);
            for (let j = i + 1; j < lines.length; j++) {
                if (!lines[j].startsWith('}')) continue;
                const range = lines.slice(i + 1, j);
                if (/^di\s*\{$/.test(lines[i])) {
                    res.push(`\\begin{array}{c|c|c}&\\mathcal{D}&\\mathcal{I}\\\\\\hline${renderAlignment(range.map((x, i) => {
                        const [der, int, pm] = x.split('@');
                        return [typeof pm === 'string' ? '\\pm' : '+-'[i % 2], compileExpr(der || ''), compileExpr(int || '')];
                    }))}\\end{array}`);
                } else {
                    const [, type, pos, op] = lines[i] === '{' ? [, 's', '', ''] : lines[i].match(/^(s?)\s*align\s*([lrc]+)?\s*(.*?)\s*\{$/) || [];
                    if (typeof op === 'string') {
                        const [aligned, len] = alignLines(range, (op || '=').split('$').filter(x => x).sort((a, b) => b.length - a.length));
                        if (pos && pos.length !== len) throw 'Invalid alignment length.';
                        const arr = `\\begin{array}{${pos || (type === 's' ? 'c'.repeat(len) : `r${'c'.repeat(Math.max(len - 2, 0))}l`)}}${renderAlignment(aligned)}\\end{array}`;
                        res.push(type === 's' ? `{\\left.${arr}\\right\\rbrace}\\hspace{${BRACKET_SPACE}}${compileExpr(lines[j].slice(1))}` : arr);
                    } else res.push(`${compileExpr(lines[i].slice(0, -1))}{\\left\\lbrace\\begin{array}{ccc}${renderAlignment(range.map(x => {
                        const [expr, cond] = x.split('@');
                        return [compileExpr(expr), `\\hspace{${PIECEWISE_SPACE}}\\text{${cond ? 'ha' : 'másképp'}}`, cond ? compileExpr(cond) : ''];
                    }))}\\end{array}\\right.}`);
                }
                i = j;
                lastGroup = j + 1;
                continue main;
            }
            throw 'Closing } expected.';
        }
    }
    pushRange(lastGroup, lines.length);
    return res.join('\\\\' + PADDING);
};

export const AsciiMath = (props: { text: string; inline?: boolean; }) => {
    try {
        const attrs = { dangerouslySetInnerHTML: { __html: katex.renderToString(props.inline ? compileExpr(props.text) : compile(props.text), { displayMode: true, strict: false }) } };
        return props.inline
            ? <span className='inlineMath' {...attrs}/>
            : <p {...attrs}/>;
    } catch (e) {
        return <>{e + ''}</>;
    }
};

declare function AMTparseAMtoTeX(str: string): string;