import { Doc } from '../../types';
import Link from './Link';
import BaseFile from './BaseFile';

export default class extends BaseFile<Doc> {
    render() {
        return <div className='file'>
            <div className='fileName h3'>
                <Link path={this.props.data.path} text>{this.props.data.name}</Link>
            </div>
            {this.props.dashboard && <div className='buttons'>{this.buttons}</div>}
        </div>;
    }
}