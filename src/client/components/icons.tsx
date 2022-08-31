const stroke = { stroke: 'black', strokeWidth: 2, fill: 'white' };

const rotate = (n: number) => ({
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transform: `rotate(${n * 90}deg)`,
}) as const;

const baseCross = (n: number, x: number, y: number) => <g>
    <line x1={x} y1={y} x2={n + x} y2={n + y} {...stroke}/>
    <line x1={n + x} y1={y} x2={x} y2={n + y} {...stroke}/>
</g>;

const baseArrow = (x: number, y: number, w: number, tipW: number, tipH: number, angle: number) => {
    const tip = { x1: w - x, y1: y, ...stroke };
    return <g style={rotate(angle)}>
        <line {...tip} x2={x} y2={y}/>
        {[-1, 1].map(s => <line key={s} {...tip} x2={w - x - tipW} y2={y + tipH * s}/>)}
    </g>;
};

const baseFolder = (children?: (...args: number[]) => JSX.Element) => {
    const w = 30;
    const h = 24;
    const startX = 13;
    const endX = 17;
    const endY = 6;
    return <svg className='icon' width={w + 2} height={h + 2}>
        <polygon points={`0,0 ${startX},0 ${endX},${endY} ${w},${endY} ${w},${h} 0,${h}`} {...stroke}/>
        {children?.(w, (h + endY) / 2)}
    </svg>;
};

export const Triangle = (props: { angle: number; fill?: boolean; }) => {
    const n = 20;
    return <svg className='icon' width={n + 2} height={n + 2} style={rotate(props.angle)}>
        <polygon points={`${n / 2},0 ${n},${n} 0,${n}`} style={props.fill ? { fill: 'black' } : stroke}/>
    </svg>;
};

export const FolderArrow = (props: { angle: number; }) => baseFolder((w, y) => baseArrow(8, y, w, 5, 4, props.angle));

export const Arrow = (props: { angle: number; }) => {
    const w = 20;0;
    const tipH = 5;
    return <svg className='icon' width={w + 2} height={2 * tipH + 2}>{baseArrow(0, tipH, w, 7, tipH, props.angle)}</svg>;
};

export const doc = (() => {
    const w = 25;
    const rows = 4;
    const gap = 6;
    const pad = 3;
    const h = (rows + 1) * gap;
    return <svg className='icon' width={w + 2} height={h + 2}>
        <polygon points={`0,0 ${w},0 ${w},${h} 0,${h}`} {...stroke}></polygon>
        {Array.from({ length: rows }, (_, i) => <line key={i} x1={pad} y1={(i + 1) * gap} x2={w - pad} y2={(i + 1) * gap} {...stroke}/>)}
    </svg>;
})();

export const folder = baseFolder();

export const folderCross = baseFolder((w, y) => {
    const n = 10;
    return baseCross(n, (w - n) / 2, y - n / 2);
});

export const cross = (() => {
    const n = 20;
    return <svg className='icon' width={n + 2} height={n + 2}>{baseCross(n, 0, 0)}</svg>;
})();

export const rename = (() => {
    const w = 30;
    const h = 15;
    const cursorW = 11;
    const cursorH = 25;
    const cursorX = 23;
    const topY = (cursorH - h) / 2;
    const bottomY = (cursorH + h) / 2;
    return <svg className='icon' width={w + 2} height={cursorH + 2}>
        <polygon points={`0,${topY} ${w},${topY} ${w},${bottomY} 0,${bottomY}`} {...stroke}/>
        {[0, cursorH].map(y => <line key={y} x1={cursorX - cursorW / 2} y1={y} x2={cursorX + cursorW / 2} y2={y} {...stroke}/>)}
        <line x1={cursorX} y1={0} x2={cursorX} y2={cursorH} {...stroke}/>
    </svg>;
})();