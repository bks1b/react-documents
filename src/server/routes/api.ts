import { Router } from 'express';
import Database from '../Database';

export default (db: Database) => Router().get('/files', async (_, res) => res.json(await db.getFiles('main')));