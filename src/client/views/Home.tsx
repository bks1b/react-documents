import { useContext } from 'react';
import Link from '../components/Link';
import Sidebar from '../components/Sidebar';
import { ConfigContext, MainContext, setTitle } from '../util';

export default () => {
    const { auth } = useContext(MainContext)!;
    const { getButtons } = useContext(ConfigContext)!;
    setTitle('Főoldal');
    return <Sidebar sidebarChildren={
        getButtons('', localStorage.getItem('password') && <Link path={[]} onClick={() => auth(1)}>Bejelentkezés</Link>)
    }/>;
};