import { createContext, ReactNode, useContext, useEffect } from 'react';
import { BaseFile, Dir, Doc } from '../types';
import { MainContextType } from './types';

export const MainContext = createContext<MainContextType | null>(null);
export const ConfigContext = createContext<{ title: string; rootPath: string; render: (name: string, text: string) => ReactNode; } | null>(null);

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const setTitle = (str = '') => {
    const { title } = useContext(ConfigContext)!;
    useEffect(() => {
        document.title = `${str ? str + ' | ' : ''}${title}${window.location.pathname.split('/')[1] === 'dashboard' ? ' Dashboard' : ''}`;
    });
};

export const eqPath = (obj: BaseFile, path: string[]) => obj.path.length === path.length && obj.path.every((x, i) => x === path[i]);

export const traverseSearch = (dir: Dir, path: string[]): [Dir | Doc, (Dir | Doc)[], number] | undefined => {
    if (eqPath(dir, path)) return [dir, [], 0];
    const i = dir.files.findIndex(x => eqPath(x, path));
    if (i > -1) return [dir.files[i], dir.files, i];
    for (let j = 0; j < dir.folders.length; j++) {
        if (eqPath(dir.folders[j], path)) return [dir.folders[j], dir.folders, j];
        const res = traverseSearch(dir.folders[j], path);
        if (res) return res;
    }
};

export const traverse = (dir: Dir, path: string[] = []): Dir => ({
    type: 'dir',
    name: dir.name,
    open: !path.length,
    path,
    folders: dir.folders.map(x => traverse(x, [...path, x.name])),
    files: dir.files.map(x => ({
        ...x,
        type: 'doc',
        path: [...path, x.name],
    })),
});
export const inverseTraverse = (dir: Dir): Dir => ({
    name: dir.name,
    files: dir.files.map(x => ({ name: x.name, text: x.text })),
    folders: dir.folders.map(x => inverseTraverse(x)),
}) as Dir;