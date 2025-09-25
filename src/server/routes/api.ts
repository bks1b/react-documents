import { Router } from 'express';
import Database from '../Database';
import { Dir } from '../../types';

export default (db: Database) => Router().get('/files/:branch', async (req, res) => res.json(filter(await db.getFiles(req.params.branch))));

const filter = (dir: Dir): Dir => ({
    ...dir,
    files: dir.files.filter(x => x.public),
    folders: dir.folders.filter(x => x.public).map(filter),
});