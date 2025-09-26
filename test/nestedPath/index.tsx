import { createRoot } from 'react-dom/client';
import { Documents } from '../../src/client';
import { AsciiMath, Parser } from '../../src/parser';

const Renderer = (props: { name: string; text: string; }) => <>
    <div style={{ justifyContent: 'center' }} className='h1'>{props.name}</div>
    <Parser
        text={props.text}
        elements={{
            el1: { render: x => <p>0 {x}</p> },
            el2: { render: x => <p>1 {x}</p> },
        }}
        fallbacks={[['el1'], ['text']]}
        textOptions={{
            extended: str => {
                const math = str.match(/^@(.+?)@/);
                if (math) return [<AsciiMath inline text={math[1]}/>, math[0].length];
            },
        }}
    />
</>;

const root = document.getElementById('root')!;

createRoot(root).render(<Documents
    title='Test'
    Renderer={Renderer}
    rootPath={['docs']}
    padding
    singleBranch
    rootElement={root}
    button={<button onClick={() => location.href = '/'}>Home</button>}/>,
);