import { Dir } from '../../types';
import { Actions } from '../types';
import { doc, folder, FolderArrow, Triangle } from './icons';
import BaseFile from './BaseFile';
import File from './File';

export default class Folder extends BaseFile<Dir, { root?: boolean; }> {
    render() {
        const inherited = { dashboard: this.props.dashboard, editHref: this.props.editHref };
        const children = <>
            {this.props.data.folders.map((x, i, a) => <Folder key={x.path.join('/')} data={x} index={[i, a.length]} {...inherited}/>)}
            {this.props.data.files.map((x, i, a) => <File key={x.path.join('/')} data={x} index={[i, a.length]} {...inherited}/>)}
        </>;
        return this.props.dashboard || !this.props.root
            ? <>
                <div className='file'>
                    <div onClick={() => !this.props.root && this.dispatch(Actions.OPEN)} className='h3'>
                        {
                            this.props.root
                                ? ''
                                : <Triangle angle={this.props.data.open ? 2 : 1} fill/>
                        }
                        <a className='fileName' style={{ marginLeft: '3px' }}>{this.props.data.name}</a>
                    </div>
                    {
                        this.props.dashboard && <div className='buttons'>
                            {!this.props.root && this.buttons}
                            <div onClick={this.promptName(
                                'Név',
                                '',
                                name => this.dispatch(Actions.NEW_DOC, name),
                            )}>{doc}</div>
                            <div onClick={this.promptName(
                                'Név',
                                '',
                                name => this.dispatch(Actions.NEW_DIR, name),
                            )}>{folder}</div>
                            {
                                this.context.state.pendingMove && !this.isPendingMove
                                    ? <div onClick={() => this.dispatch(Actions.MOVE_HERE)}><FolderArrow angle={1}/></div>
                                    : <></>
                            }
                        </div>
                    }
                </div>
                <div className={`folder${this.props.data.open ? '' : ' hidden'}`}>{children}</div>
            </>
            : children;
    }
}