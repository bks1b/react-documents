import { useContext } from 'react';
import Link from '../components/Link';
import Sidebar from '../components/Sidebar';
import { MainContext, setTitle } from '../util';

export default () => {
    const ctx = useContext(MainContext)!;
    setTitle('Főoldal');
    return <Sidebar sidebarChildren={localStorage.getItem('password') ? <Link path={[]} onClick={() => ctx.auth(1)}>Bejelentkezés</Link> : null}/>;
};