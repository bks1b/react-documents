import { useContext } from 'react';
import { ConfigContext, setTitle } from '../util';

export default () => {
    const { getButtons } = useContext(ConfigContext)!;
    setTitle('A dokumentum nem található');
    return <div className='padding'>
        {getButtons('főoldalra')}
        <div className='h2'>A dokumentum nem található.</div>
    </div>;
};