import { useEffect, useReducer, useState } from 'react';
import { Dir } from '../types';
import reducer from './reducer';
import { ConfigContext, MainContext, traverseSearch, traverse, inverseTraverse } from './util';
import Link from './components/Link';
import { Actions, AuthType, Config, RequestFunction } from './types';

import Dashboard from './views/Dashboard';
import EditDoc from './views/EditDoc';
import Home from './views/Home';
import ViewDir from './views/ViewDir';
import ViewDoc from './views/ViewDoc';
import NotFound from './views/NotFound';

const INCORRECT_PASS_TIMEOUT = 2000;

export const Documents = (config: Config) => {
    const getPath = () => window.location.pathname.split('/').slice((config.rootPath?.length || 0) + 1).filter(x => x).map(x => decodeURIComponent(x));
    const getLoggedIn = () => !!+localStorage.getItem('loggedIn')!;
    const request: RequestFunction = (path, body) => fetch(`${rootPath}/api/${path}`, {
        headers: { 'content-type': 'application/json' },
        method: body ? 'POST' : 'GET',
        body: body ? JSON.stringify(body) : null,
    }).then(d => d.json());
    const requestDashboard = <T,>(path: string, body?: any) => request<T>(`dashboard/${path}?auth=${encodeURIComponent(localStorage.getItem('password')!)}`, body);
    const initFiles = (d: Dir) => {
        const obj = traverse(d);
        dispatch({ type: Actions.INIT, payload: obj });
    };
    const resolvePath = (path: string[]) => `${rootPath}/${path.map(x => encodeURIComponent(x)).join('/')}`;
    const navigate = (newPath: string[]) => {
        window.history.pushState('', '', resolvePath(newPath));
        setPath(newPath);
    };
    const auth = (n: 0 | 1) => {
        localStorage.setItem('loggedIn', n + '');
        setLoggedIn(!!n);
    };

    const rootPath = config.rootPath ? '/' + config.rootPath.join('/') : '';
    const [path, setPath] = useState(getPath());
    const [loggedIn, setLoggedIn] = useState(getLoggedIn());
    const [authType, setAuthType] = useState<AuthType>(AuthType.LOADING);
    const [state, dispatch] = useReducer(reducer(requestDashboard), {});
    useEffect(() => {
        window.onpopstate = () => {
            setPath(getPath());
            setLoggedIn(getLoggedIn());
        };
        new MutationObserver(() => {
            const split = document.querySelector('.split') as HTMLElement;
            if (split) (window.onresize = () => {
                config.rootElement.style.width = split.style.width = window.innerWidth + 'px';
                config.rootElement.style.height = split.style.height = window.innerHeight + 'px';
            })();
        }).observe(document.body, {
            childList: true, 
            subtree: true,
        });
    }, []);
    useEffect(() => {
        if (loggedIn) {
            setAuthType(AuthType.LOADING);
            dispatch({ type: Actions.RESET });
            let loaded = false;
            requestDashboard('auth').then(() => {
                loaded = true;
                setAuthType(AuthType.ADMIN);
                requestDashboard<Dir>('files/get', { branch: 'dev' }).then(initFiles);
            });
            setTimeout(() => {
                if (!loaded) setAuthType(AuthType.INCORRECT);
            }, INCORRECT_PASS_TIMEOUT);
        } else {
            setAuthType(AuthType.USER);
            request<Dir>('files/' + (config.singleBranch ? 'dev' : 'main')).then(initFiles);
        }
    }, [loggedIn]);

    if (path.length === 1) {
        if (path[0] === 'login') {
            const str = prompt('Jelszó');
            if (str) {
                localStorage.setItem('password', str);
                auth(1);
            }
            navigate([]);
            return <></>;
        }
        if (path[0] === 'logout') {
            auth(0);
            navigate([]);
            return <></>;
        }
    }
    if (!state.data || authType === AuthType.INCORRECT) return <></>;
    const doc = traverseSearch(state.data, path);
    return <MainContext.Provider value={{
        state,
        dispatch: async d => {
            if (authType === AuthType.ADMIN) {
                let curr;
                try {
                    curr = await requestDashboard<Dir & { _id?: string; }>('files/get', { branch: 'dev' });
                } catch {
                    alert('Szerver-oldali hiba történt.');
                    return false;
                }
                delete curr._id;
                if (JSON.stringify(curr) !== JSON.stringify(inverseTraverse(state.data!))) {
                    alert('Változás történt mióta megnyílt ez a lap.');
                    return false;
                }
            }
            dispatch(d);
            return true;
        },
        auth,
        resolvePath,
        navigate,
        request,
        requestDashboard,
    }}>
        <ConfigContext.Provider value={{
            title: config.title,
            heightOffset: config.heightOffset,
            rootPath,
            singleBranch: config.singleBranch,
            getButtons: (name, child) => <div className='gap'>
                {name ? <Link path={[]}>{'Vissza a ' + name}</Link> : ''}
                {child || ''}
                {config.button || ''}
            </div>,
            render: (name: string, text: string) => <div className='renderedContainer'>
                <div className={`rendered${config.padding ? ' padding' : ''}`}>
                    <config.Renderer {...{ name, text }}/>
                </div>
            </div>,
        }}>
            {
                !path.length
                    ? authType === AuthType.ADMIN ? <Dashboard/> : <Home/>
                    : doc
                        ? doc[0].type === 'doc'
                            ? authType === AuthType.ADMIN ? <EditDoc key={doc[0].path.join('/')} doc={doc[0]}/> : <ViewDoc doc={doc[0]}/>
                            : <ViewDir dir={doc[0]}/>
                        : <NotFound/>
            }
        </ConfigContext.Provider>
    </MainContext.Provider>;
};

export { default as Link } from './components/Link';