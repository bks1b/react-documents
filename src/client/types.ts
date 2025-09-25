import { FC, ReactNode } from 'react';
import { Dir } from '../types';

export enum Actions {
    INIT,
    RESET,
    OPEN,
    RENAME,
    MOVE,
    NEW_DOC,
    NEW_DIR,
    DELETE,
    MOVE_TO,
    CANCEL_MOVE,
    MOVE_HERE,
    EDIT,
    TOGGLE_PUBLIC,
}

export enum AuthType {
    LOADING,
    INCORRECT,
    USER,
    ADMIN,
}

export type Action = ({ path?: string[]; payload?: unknown; } & (
    { type: Actions.INIT; payload?: Dir; }
    | { type: Actions.RESET; }
    | { type: Actions.RENAME | Actions.NEW_DOC | Actions.NEW_DIR | Actions.EDIT; payload: string; }
    | { type: Actions.OPEN | Actions.DELETE | Actions.MOVE_TO | Actions.CANCEL_MOVE | Actions.MOVE_HERE; }
    | { type: Actions.MOVE; payload: -1 | 1; }
    | { type: Actions.TOGGLE_PUBLIC; }
));

export type DirState = { data?: Dir; pendingMove?: string[]; };

export type MainContextType = {
    resolvePath: (path: string[]) => string;
    navigate: (path: string[]) => void;
    dispatch: (x: Action) => Promise<boolean>;
    auth: (n: 0 | 1) => void;
    state: DirState;
} & Record<'request' | 'requestDashboard', RequestFunction>;

export type Config = {
    title: string;
    rootPath?: string[];
    heightOffset?: string;
    singleBranch?: boolean;
    button?: ReactNode;
    Renderer: FC<Record<'name' | 'text', string>>;
    padding?: boolean;
    rootElement: HTMLElement;
};

export type RequestFunction = <T>(path: string, body?: any) => Promise<T & { error?: string; }>;