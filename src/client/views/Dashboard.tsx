import { useContext, useState } from 'react';
import Link from '../components/Link';
import Sidebar from '../components/Sidebar';
import { Arrow } from '../components/icons';
import { MainContext, setTitle } from '../util';

const branches = [
    ['dev', 'Dev'],
    ['main', 'Felhasználói'],
];

export default () => {
    const ctx = useContext(MainContext)!;
    const [branchI, setBranch] = useState(0);
    const branch = branches[branchI];
    const otherBranch = branches[1 - branchI];
    setTitle();
    return <Sidebar dashboard sidebarChildren={
        <>
            <Link path={[]} onClick={() => ctx.logout()}>Kijelentkezés</Link>
            <br/>
            <label className='button'>Branch: <select onChange={e => setBranch(e.target.selectedIndex)} defaultValue={0}>
                {branches.map((x, i) => <option key={i}>{x[1]}</option>)}
            </select></label>
            <div className='buttons'>
                <div onClick={async () => {
                    const a = document.createElement('a');
                    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(await ctx.requestDashboard('files/get', { branch: branch[0] })));
                    a.download = branch[0] + '.json';
                    a.click();
                }}><Arrow angle={1}/></div>
                <div onClick={async () => {
                    if (!confirm(`Biztosan feltölti a ${branch[1]} branchet a ${otherBranch[1]} branch helyett?`)) return;
                    await ctx.requestDashboard('mergeBranches', { from: branch[0], to: otherBranch[0] });
                    if (branchI) window.location.reload();
                }}><Arrow angle={3}/></div>
            </div>
        </>
    }/>;
};