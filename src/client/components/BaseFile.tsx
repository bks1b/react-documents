import { Component } from 'react';
import { BaseFile } from '../../types';
import { Action, Actions, MainContextType } from '../types';
import { eqPath, MainContext } from '../util';
import { cross, crossedLock, FolderArrow, folderCross, lock, rename, Triangle } from './icons';

export default class<T extends BaseFile, U = {}> extends Component<{
    data: T;
    index: number[];
    dashboard?: boolean;
    editHref?: boolean;
} & U> {
    static contextType = MainContext;
    context!: MainContextType;

    dispatch<V extends Actions>(type: V, payload?: (Action & { type: V; })['payload']) {
        this.context.dispatch({ type, payload, path: this.props.data.path } as Action);
    }

    promptName(title: string, val: string, cb: (name: string) => any) {
        return () => {
            const name = prompt(title, val);
            if (name) cb(name);
        };
    }

    get isPendingMove() {
        return eqPath(this.props.data, this.context.state.pendingMove!);
    }

    get buttons() {
        return <>
            <div onClick={this.promptName(
                'Átnevezés',
                this.props.data.name,
                name => this.dispatch(Actions.RENAME, name),
            )}>{rename}</div>
            <div onClick={() => confirm(`Biztosan kitörli a ${this.props.data.name} ${'text' in this.props.data ? 'fájlt' : 'mappát'}?`) && this.dispatch(Actions.DELETE)}>{cross}</div>
            <div onClick={() => this.dispatch(Actions.TOGGLE_PUBLIC)}>{this.props.data.public ? lock : crossedLock}</div>
            {
                this.context.state.pendingMove
                    ? this.isPendingMove
                        ? <div onClick={() => this.dispatch(Actions.CANCEL_MOVE)}>{folderCross}</div>
                        : <></>
                    : <div onClick={() => this.dispatch(Actions.MOVE_TO)}><FolderArrow angle={0}/></div>
            }
            {this.props.index[0] > 0 && <div onClick={() => this.dispatch(Actions.MOVE, -1)}><Triangle angle={0}/></div>}
            {this.props.index[0] < this.props.index[1] - 1 && <div onClick={() => this.dispatch(Actions.MOVE, 1)}><Triangle angle={2}/></div>}
        </>;
    }
}