import { useContext, useState } from 'react';
import { Doc } from '../../types';
import Sidebar from '../components/Sidebar';
import { Actions } from '../types';
import { ConfigContext, MainContext, setTitle } from '../util';

const RENDER_TIMEOUT = 500;

export default ({ doc }: { doc: Doc; }) => {
    const { render, getButtons } = useContext(ConfigContext)!;
    const { dispatch } = useContext(MainContext)!;
    const [text, setText] = useState(doc.text);
    const [changed, setChanged] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    setTitle(doc.name);
    let lastChange = 0;
    return <Sidebar sidebarChildren={getButtons('dashboardra')} editHref>
        <div className='evenSplit'>
            <div className='topRight gap'>
                {changed && <button onClick={async () => {
                    if (await dispatch({ type: Actions.EDIT, path: doc.path, payload: text })) {
                        window.onbeforeunload = null;
                        setChanged(false);
                    }
                }}>Mentés</button>}
                <button onClick={() => setCollapsed(!collapsed)}>{collapsed ? 'Kibontás' : 'Elrejtés'}</button>
            </div>
            <textarea spellCheck={false} style={collapsed ? { borderBottom: 0 } : {}} onChange={e => {
                window.onbeforeunload = () => true;
                lastChange = Date.now();
                setTimeout(() => {
                    if (Date.now() - lastChange >= RENDER_TIMEOUT) {
                        setText((e.target as unknown as { value: string; }).value);
                        setChanged(true);
                    }
                }, RENDER_TIMEOUT);
            }} defaultValue={text} className='overflow'/>
            {collapsed ? '' : render(doc.name, text)}
        </div>
    </Sidebar>;
};
