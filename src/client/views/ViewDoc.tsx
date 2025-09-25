import { useContext } from 'react';
import { Doc } from '../../types';
import Sidebar from '../components/Sidebar';
import { ConfigContext, setTitle } from '../util';

export default ({ doc }: { doc: Doc; }) => {
    const { render, getButtons } = useContext(ConfigContext)!;
    setTitle(doc.name);
    return <Sidebar sidebarChildren={getButtons('főoldalra')}>{render(doc.name, doc.text)}</Sidebar>;
};