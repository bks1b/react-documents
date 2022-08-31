import { Fragment, useContext } from 'react';
import { Dir } from '../../types';
import Folder from '../components/Folder';
import Link from '../components/Link';
import { MainContext, setTitle, traverseSearch } from '../util';

export default ({ dir }: { dir: Dir; }) => {
    const ctx = useContext(MainContext)!;
    setTitle(dir.name);
    dir.open = true;
    return <div className='padding'>
        <div className='h3'>{['Főoldal', ...dir.path].map((x, i) => <Fragment key={i}><a className='slash'>/</a><Link path={dir.path.slice(0, i)} text>{x}</Link></Fragment>)}</div>
        <div className='folderContainer'>
            <Folder data={traverseSearch(ctx.state.data!, dir.path)![0] as Dir} index={[0, 1]}/>
        </div>
    </div>;
};