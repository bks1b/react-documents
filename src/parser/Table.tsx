import { Text } from './Text';
import { Args, TextOptions } from './types';

const emojis = [['y', '✔️'], ['n', '❌']];
const alignment: Record<string, 'left' | 'right' | 'center'> = {
    l: 'left',
    r: 'right',
    c: 'center',
};

const split = (str: string) => {
    const arr = [''];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '\\' && str[i + 1] === '@') arr[arr.length - 1] += str[++i];
        else if (str[i] === '@') arr.push('');
        else arr[arr.length - 1] += str[i];
    }
    return arr.map(x => x.trim());
};

export const Table = ({ text, args, textOptions }: { text: string[]; args: Args; textOptions: TextOptions; }) => {
    const rows = text.map(x => split(x).map(x => x.split('\\br').map((x, i) => <Text key={i} text={x.replace(/\\@/g, '@')} {...textOptions} table extended={str => {
        const emoji = emojis.find(x => str.startsWith(`[${x[0]}]`));
        if (emoji) return [emoji[1], emoji[0].length + 2];
        return textOptions.extended?.(str);
    }}/>)));
    const maxRow = Array.from({ length: Math.max(...rows.map(x => x.length)) }, (_, i) => i);
    return <table className='parsedTable'>
        <tbody>{
            rows.map((x, i) => <tr key={i}>{
                maxRow.map(j => <td key={j} style={{
                    textAlign: alignment[[args.rows?.[i], args.cols?.[j]].find(x => x && x !== '-') || 'l'],
                    fontWeight: args.bRows?.split(',').includes(i + 1 + '') || args.bCols?.split(',').includes(j + 1 + '') ? 'bold' : 'normal',
                }}>{x[j]}</td>)
            }</tr>)
        }</tbody>
    </table>;
};