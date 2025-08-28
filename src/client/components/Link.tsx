import { useContext } from 'react';
import { MainContext } from '../util';

export default (props: {
    path: string[];
    text?: boolean;
    children: string;
    underline?: boolean;
    onClick?: () => any;
}) => {
    const ctx = useContext(MainContext)!;
    let isTarget = false;
    return <div
        style={{ display: 'inline-block' }}
        onMouseDown={() => isTarget = true}
        onMouseOut={() => isTarget = false}
        onMouseUp={e => {
            if (!isTarget) return;
            isTarget = false;
            if (window.onbeforeunload && !confirm('Biztosan elhagyja az oldalt?')) return;
            window.onbeforeunload = null;
            props.onClick?.();
            if (e.button === 1) window.open(ctx.resolvePath(props.path));
            else if (e.button === 0) ctx.navigate(props.path);
        }}
    >{
            props.text
                ? <a className='hyperlink' style={{ textDecoration: props.underline ? 'underline' : 'none' }}>{props.children}</a>
                : <button>{props.children}</button>
        }</div>;
};