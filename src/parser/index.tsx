import { Fragment, JSX } from 'react';
import { Table } from './Table';
import { Text } from './Text';
import { AsciiMath } from './AsciiMath';
import { Args, Bools, Elements, ParserOptions } from './types';

const bools = [1, 0];
const getTruthCombinations = (n: number): number[][] => n > 1 ? getTruthCombinations(n - 1).flatMap(x => bools.map(b => [b, ...x])) : bools.map(x => [x]);

export const Parser = <T extends Elements>({ text, fallbacks, elements: extElements, textOptions }: ParserOptions<T>) => {
    const elements: Elements = {
        table: { render: (x, args) => <Table text={x} args={args} textOptions={textOptions || {}}/> },
        text: { render: x => <>{x.map((x, i) => <Text key={i} text={x} {...textOptions}/>)}</> },
        script: {
            render: x => {
                const res = eval(x.join('\n'));
                if (typeof res !== 'string') throw 'String expected as eval result.';
                return <Parser text={res} {...{ fallbacks, textOptions }} elements={extElements}/>;
            },
            closingTag: true,
        },
        truthTable: {
            render: (x, args) => {
                const vars = args.vars.split(',');
                const ops = x.filter(x => x).map(x => {
                    const a = x.split('@');
                    if (a.length !== 2) throw 'Operator name and function expected.';
                    return a;
                }); 
                const arr = getTruthCombinations(vars.length);
                return <Table text={[
                    [...vars, ...ops.map(x => x[0])].map(x => `\\@${x}\\@`).join('@'),
                    ...arr.map(a => [
                        ...a,
                        ...ops.map(x => +eval(`${a.map((v, i) => `const ${vars[i]} = ${v}`).join(';')};${x[1]}`)),
                    ].join('@')),
                ]} args={{ cols: 'c'.repeat(vars.length + ops.length) }} textOptions={textOptions || {}}/>;
            },
        },
        math: { render: x => <AsciiMath text={x.join('\n')}/> },
        ...extElements || {},
    };
    const parseUntil = (line: string, { excludeStart = false, closingTag = false } = {}) => {
        for (let j = i; j < lines.length + +!closingTag; j++) {
            if (j === lines.length || lines[j] === line) return lines.slice(i + +!!excludeStart, i = j);
        }
        throw 'Closing tag expected.';
    };
    const arr = [];
    const lines = text.split('\n').map(x => x.trimEnd());
    let offset = 1;
    let elementCount = 0;
    let i = 0;
    try {
        for (; i < lines.length; i++) {
            if (!lines[i]) continue;
            elementCount++;
            const header = lines[i].match(/^(#+) (.+)$/);
            if (header) {
                if (fallbacks) offset += 1 + (elementCount + offset) % fallbacks.length;
                const Tag = 'h' + Math.min(Math.max(1, header[1].length), 6) as keyof JSX.IntrinsicElements;
                arr.push(<Tag key={arr.length} className='parsedHeader'>{header[2]}</Tag>);
                continue;
            }
            const [, name, args] = lines[i]?.match(/^<(\S+)\s*(.+?)?>$/) || [];
            if (name) {
                if (!elements[name]) throw `Unknown element ${name}.`;
                const props: Args = {};
                const bools: Bools = {};
                if (args) for (const m of args.matchAll(/([\S]+?)="(.+?)"|(\S+?)=([\S]+)|([\S]+)/g)) {
                    if (m[1]) props[m[1]] = m[2];
                    else if (m[3]) props[m[3]] = m[4];
                    else bools[m[5]] = true;
                }
                offset++;
                arr.push(<Fragment key={arr.length}>{
                    elements[name].render(
                        parseUntil(
                            elements[name].closingTag ? `</${name}>` : '',
                            { excludeStart: true, closingTag: elements[name].closingTag },
                        ),
                        props,
                        bools,
                    )
                }</Fragment>);
                continue;
            }
            let el;
            if (fallbacks) {
                const fb = fallbacks[(elementCount + offset) % fallbacks.length];
                el = elements[fb[0] as string].render(parseUntil(''), fb[1] || {}, fb[2] || {});
            } else el = elements.text.render(parseUntil(''), {}, {});
            arr.push(<Fragment key={arr.length}>{el}</Fragment>);
        }
        return <>{arr}</>;
    } catch (e) {
        console.error(e);
        return <>
            <div className='h2'>Error</div>
            {e + ''}
        </>;
    }
};

export * from './types';
export { Table, Text, AsciiMath };