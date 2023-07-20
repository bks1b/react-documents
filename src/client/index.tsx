import { useEffect, useReducer, useState } from 'react';
import { Dir } from '../types';
import reducer from './reducer';
import { Actions, AuthType, Config, RequestFunction } from './types';
import { ConfigContext, MainContext, traverseSearch, traverse, inverseTraverse } from './util';
import Dashboard from './views/Dashboard';
import EditDoc from './views/EditDoc';
import Home from './views/Home';
import ViewDir from './views/ViewDir';
import ViewDoc from './views/ViewDoc';

const INCORRECT_PASS_TIMEOUT = 2000;

export const Documents = (config: Config) => {
    const getPath = () => window.location.pathname.split('/').slice((config.rootPath?.length || 0) + 1).filter(x => x).map(x => decodeURIComponent(x));
    const getPassword = () => localStorage.getItem('password');
    const request: RequestFunction = (path, body) => fetch(`${rootPath}/api/${path}`, {
        headers: { 'content-type': 'application/json' },
        method: body ? 'POST' : 'GET',
        body: body ? JSON.stringify(body) : null,
    }).then(d => d.json());
    const requestDashboard = <T,>(path: string, body?: any) => request<T>(`dashboard/${path}?auth=${encodeURIComponent(password!)}`, body);
    const initFiles = (d: Dir) => {
        const obj = traverse(d);
        dispatch({ type: Actions.INIT, payload: obj });
    };
    const resolvePath = (path: string[]) => `${rootPath}/${path.map(x => encodeURIComponent(x)).join('/')}`;
    const navigate = (newPath: string[]) => {
        window.history.pushState('', '', resolvePath(newPath));
        setPath(newPath);
    };
    const logout = () => {
        localStorage.removeItem('password');
        setPassword(null);
    };

    const rootPath = config.rootPath ? '/' + config.rootPath.join('/') : '';
    const [path, setPath] = useState(getPath());
    const [password, setPassword] = useState(getPassword());
    const [auth, setAuth] = useState<AuthType>(AuthType.LOADING);
    const [state, dispatch] = useReducer(reducer(requestDashboard), {});
    useEffect(() => {
        window.onpopstate = () => {
            setPath(getPath());
            setPassword(getPassword());
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
        if (password) {
            setAuth(AuthType.LOADING);
            dispatch({ type: Actions.RESET });
            let loaded = false;
            requestDashboard('auth').then(() => {
                loaded = true;
                setAuth(AuthType.ADMIN);
                requestDashboard<Dir>('files/get', { branch: 'dev' }).then(initFiles);
            });
            setTimeout(() => {
                if (!loaded) setAuth(AuthType.INCORRECT);
            }, INCORRECT_PASS_TIMEOUT);
        } else {
            setAuth(AuthType.USER);
            request<Dir>('files').then(initFiles);
        }
    }, [password]);

    if (path.length === 1) {
        if (path[0] === 'login') {
            const str = prompt('Jelszó');
            if (str) {
                localStorage.setItem('password', str);
                setPassword(str);
            }
            navigate([]);
            return <></>;
        }
        if (path[0] === 'logout') {
            logout();
            navigate([]);
            return <></>;
        }
    }
    if (!state.data || auth === AuthType.INCORRECT) return <></>;
    const doc = traverseSearch(state.data, path);
    if (!doc) {
        document.title = 'A dokumentum nem található | ' + config.title;
        return <div className='padding h2'>A dokumentum nem található.</div>;
    }
    return <MainContext.Provider value={{
        state,
        dispatch: async d => {
            if (auth === AuthType.ADMIN) {
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
        logout,
        resolvePath,
        navigate,
        request,
        requestDashboard,
    }}>
        <ConfigContext.Provider value={{
            title: config.title,
            heightOffset: config.heightOffset,
            rootPath,
            render: (name: string, text: string) => <div className='renderedContainer'>
                <div className={`rendered${config.padding ? ' padding' : ''}`}>
                    <config.Renderer {...{ name, text }}/>
                </div>
            </div>,
        }}>
            {
                !path.length
                    ? auth === AuthType.ADMIN ? <Dashboard/> : <Home/>
                    : doc[0].type === 'doc'
                        ? auth === AuthType.ADMIN ? <EditDoc key={doc[0].path.join('/')} doc={doc[0]}/> : <ViewDoc doc={doc[0]}/>
                        : <ViewDir dir={doc[0]}/>
            }
        </ConfigContext.Provider>
    </MainContext.Provider>;
};

export { default as Link } from './components/Link';