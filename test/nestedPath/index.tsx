import { createRoot } from 'react-dom/client';
import { Documents } from '../../src/client';
import { Parser } from '../../src/parser';

const Renderer = (props: { name: string; text: string; }) => <>
    <div style={{ justifyContent: 'center' }} className='h1'>{props.name}</div>
    <Parser text={props.text} elements={{
        el1: { render: x => <p>0 {x}</p> },
        el2: { render: x => <p>1 {x}</p> },
    }} fallbacks={[['el1'], ['text']]}/>
</>;

createRoot(document.getElementById('root')!).render(<Documents title='Test' Renderer={Renderer} rootPath={['docs']} padding/>);