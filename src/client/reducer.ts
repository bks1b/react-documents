import { Dir, Doc } from '../types';
import { Action, Actions, DirState, RequestFunction } from './types';
import { inverseTraverse, traverseSearch } from './util';

const getChildren = (d: Dir) => [...d.folders, ...d.files];
const hasDuplicate = (d: Dir, n: string) => {
    if (getChildren(d).some(x => x.name === n)) {
        alert('Ilyen dokumentum már létezik.');
        return true;
    }
};
const updatePaths = (target: Dir, path: string[], length: number) => {
    getChildren(target).forEach(x => x.path.splice(0, length, ...path));
    target.folders.forEach(x => updatePaths(x, path, length));
};

export default (requestDashboard: RequestFunction) => (oldState: DirState, { type, path, payload }: Action) => {
    const state: DirState = JSON.parse(JSON.stringify(oldState));
    if (type === Actions.INIT) {
        state.data = payload;
        return state;
    }
    if (type === Actions.RESET) return {};
    const [target, parent, index] = traverseSearch(state.data!, path!)!;
    if ([Actions.NEW_DIR, Actions.NEW_DOC].includes(type) && hasDuplicate(<Dir>target, <string>payload)) return state;
    switch (type) {
        case Actions.EDIT:
            (<Doc>target).text = payload;
            break;
        case Actions.RENAME:
            if (target.name !== payload && hasDuplicate(<Dir>traverseSearch(state.data!, path!.slice(0, -1))![0], payload)) return state;
            target.name = payload;
            target.path.splice(-1, 1, payload);
            if (!('text' in target)) updatePaths(<Dir>target, target.path, target.path.length);
            break;
        case Actions.MOVE:
            parent.splice(index + payload, 0, ...parent.splice(index, 1));
            break;
        case Actions.NEW_DIR:
            (<Dir>target).folders.push({
                type: 'dir',
                name: payload,
                public: true,
                path: [...target.path, payload],
                open: false,
                files: [],
                folders: [],
            });
            break;
        case Actions.NEW_DOC:
            (<Dir>target).files.push({
                type: 'doc',
                name: payload,
                public: true,
                path: [...target.path, payload],
                text: '',
            });
            break;
        case Actions.DELETE:
            parent.splice(index, 1);
            break;
        case Actions.MOVE_HERE:
            const toMove = traverseSearch(state.data!, state.pendingMove!)!;
            const isFile = 'text' in toMove[0];
            if (!getChildren(<Dir>target).includes(toMove[0]) && hasDuplicate(<Dir>target, toMove[0].name)) return state;
            (<Dir>target)[<'folders'>(isFile ? 'files' : 'folders')].push(<Dir>toMove[0]);
            if (!isFile) updatePaths(<Dir>toMove[0], target.path, toMove[0].path.length - 1);
            toMove[0].path = [...target.path, toMove[0].name];
            toMove[1].splice(toMove[2], 1);
            state.pendingMove = undefined;
            break;
        case Actions.TOGGLE_PUBLIC:
            target.public = !target.public;
            break;
        default:
            if (type === Actions.OPEN) (<Dir>target).open = !(<Dir>target).open;
            if (type === Actions.MOVE_TO) state.pendingMove = target.path;
            if (type === Actions.CANCEL_MOVE) state.pendingMove = undefined;
            return state;
    }
    requestDashboard('files/set', inverseTraverse(state.data!)).then(d => d.error && alert(d.error));
    return state;
};