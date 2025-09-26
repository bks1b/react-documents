import { Fragment } from 'react';
import { Link } from '../client';
import { TextOptions } from './types';

export const Text = (props: { text: string; table?: boolean; } & TextOptions) => {
    const arr = [];
    const [open, close] = props.groupingChars || '[]';
    const listChar = props.listChar || '**';
    const listLevel = props.text.match(/^\s+/)?.[0].length || 0;
    const isList = props.text.trim().startsWith(listChar);
    for (let i = isList ? listLevel + listChar.length : 0; i < props.text.length;) {
        const sub = props.text.slice(i);
        if (sub[0] === '\\' && sub[1]) {
            arr.push(sub[1]);
            i += 2;
            continue;
        }
        const ext = props.extended?.(sub);
        if (ext) {
            arr.push(<Fragment key={i}>{ext[0]}</Fragment>);
            i += ext[1];
            continue;
        }
        const bold = sub.match(/^\*(.+?)\*/);
        if (bold) {
            arr.push(<b key={i}>{bold[1]}</b>);
            i += bold[0].length;
            continue;
        }
        const hyperlink = sub.match(new RegExp(`^\\${open}(.*?[^\\\\])\\${close}\\${open}(.*?[^\\\\])\\${close}`));
        if (hyperlink) {
            arr.push(
                hyperlink[2].startsWith('/')
                    ? <Link path={hyperlink[2].split('/').slice(1)} underline text key={i}>{hyperlink[1]}</Link>
                    : <a href={hyperlink[2]} target={hyperlink[2].startsWith('#') ? '_self' : '_blank'} key={i}>{hyperlink[1]}</a>,
            );
            i += hyperlink[0].length;
            continue;
        }
        if (typeof arr.slice(-1)[0] === 'string') arr.splice(-1, 1, arr.slice(-1)[0] + sub[0]);
        else arr.push(sub[0]);
        i++;
    }
    return isList
        ? <ul style={{
            margin: 0,
            listStylePosition: props.table ? 'outside' : 'unset',
            paddingLeft: 15 + (props.table ? 10 : 20) * (listLevel + 1),
        }}><li>{arr}</li></ul>
        : <div style={{ margin: '2px 0' }}>{arr}</div>;
};