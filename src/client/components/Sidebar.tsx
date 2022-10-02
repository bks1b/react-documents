import { ReactNode, useContext, useEffect, useState } from 'react';
import { ConfigContext, isMobile, MainContext } from '../util';
import Folder from './Folder';

export default (props: {
    dashboard?: boolean;
    editHref?: boolean;
    children?: false | ReactNode;
    sidebarChildren?: ReactNode;
}) => {
    const ctx = useContext(MainContext)!;
    const { heightOffset } = useContext(ConfigContext)!;
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(props.dashboard || !props.children || !isMobile), [props.dashboard, !!props.children]);
    return <>
        {
            props.children && <div className='toggleSidebar' onClick={() => setOpen(!open)}>
                <div></div>
                <div></div>
                <div></div>
            </div>
        }
        <div className='split' style={{ height: heightOffset ? `calc(100% - ${heightOffset})` : '100%' }}>
            <div className={`padding overflow ${props.children ? 'sidebar' : 'content'}${open ? '' : ' hidden'}`}>
                {props.sidebarChildren ? <div className='sidebarChildren'>{props.sidebarChildren}</div> : <></>}
                <div className='folderContainer'>
                    <Folder data={ctx.state.data!} root index={[0, 1]} dashboard={props.dashboard} editHref={props.editHref}/>
                </div>
            </div>
            {props.children && <div className='content'>{props.children}</div>}
        </div>
    </>;
};