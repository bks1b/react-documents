import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Documents } from '../../src/client';
import { Parser, Text } from '../../src/Parser';

const Renderer = (props: { name: string; text: string; }) => {
    const [tab, setTab] = useState(0);
    return <>
        <div className='tabs'>
            {[0, 1].map(x => <div key={x} onClick={() => setTab(x)} className={tab === x ? 'selectedTab' : ''}>
                <h1 style={{ margin: '0px', fontWeight: '400' }}>Tab {x + 1}</h1>
            </div>)}
        </div>
        <div className='tabContent'>
            <div style={{ justifyContent: 'center' }} className='h2'>{props.name} (tab {tab + 1}/2)</div>
            <Parser text={props.text} elements={{
                test: { render: () => { throw 'Test error'; } },
                test2: { render: x => <>{x.map(x => <Text text={x}/>)}</> },
            }}/>
        </div>
    </>;
};

createRoot(document.getElementById('root')!).render(<Documents title='Test' Renderer={Renderer}/>);