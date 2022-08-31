import { Dir, Doc } from '../types';
import { Action, Actions, DirState, RequestFunction } from './types';
import { inverseTraverse, traverseSearch } from './util';

export default (requestDashboard: RequestFunction) => (oldState: DirState, { type, path, payload }: Action) => {
    const state: DirState = JSON.parse(JSON.stringify(oldState));
    if (type === Actions.INIT) {
        state.data = payload;
        return state;
    }
    if (type === Actions.RESET) return {};
    const [target, parent, index] = traverseSearch(state.data!, path!)!;
    switch (type) {
        case Actions.EDIT:
            (<Doc>target).text = payload;
            break;
        case Actions.RENAME:
            target.name = payload;
            target.path.splice(-1, 1, payload);
            break;
        case Actions.MOVE:
            parent.splice(index + payload, 0, ...parent.splice(index, 1));
            break;
        case Actions.NEW_DIR:
            (<Dir>target).folders.push({
                type: 'dir',
                name: payload,
                path: [...target.path, payload],
                open: false,
                files: [],
                folders: [],
            });
            break;
        case Actions.NEW_DOC:
            (<Dir>target).files.push({ type: 'doc', name: payload, path: [...target.path, payload], text: '' });
            break;
        case Actions.DELETE:
            parent.splice(index, 1);
            break;
        case Actions.MOVE_HERE:
            const toMove = traverseSearch(state.data!, state.pendingMove!)!;
            (<Dir>target)[<'folders'>('text' in toMove[0] ? 'files' : 'folders')].push(<Dir>toMove[0]);
            toMove[0].path = [...target.path, toMove[0].name];
            toMove[1].splice(toMove[2], 1);
            state.pendingMove = undefined;
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