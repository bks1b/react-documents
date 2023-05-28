import { Router } from 'express';
import Database from '../Database';

export default (db: Database, pass: string) => Router()
    .use((req, _, next) => req.query.auth === pass && next())
    .get('/auth', (_, res) => res.json({}))
    .post('/files/get', async (req, res) => res.json(await db.getFiles(req.body.branch)))
    .post('/files/set', (req, res) => db
        .setFiles('dev', req.body)
        .then(() => res.json({}))
        .catch(e => res.json({ error: e + '' })),
    )
    .post('/mergeBranches', async (req, res) => db.setFiles(req.body.to, await db.getFiles(req.body.from)).then(() => res.json({})));