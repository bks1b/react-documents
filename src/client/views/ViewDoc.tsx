import { useContext } from 'react';
import { Doc } from '../../types';
import Link from '../components/Link';
import Sidebar from '../components/Sidebar';
import { ConfigContext, setTitle } from '../util';

export default ({ doc }: { doc: Doc; }) => {
    const { render } = useContext(ConfigContext)!;
    setTitle(doc.name);
    return <Sidebar sidebarChildren={
        <Link path={[]}>Vissza a főoldalra</Link>
    }>{render(doc.name, doc.text)}</Sidebar>;
};