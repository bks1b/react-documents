import Sidebar from '../components/Sidebar';
import { setTitle } from '../util';

export default () => {
    setTitle('Főoldal');
    return <Sidebar/>;
};