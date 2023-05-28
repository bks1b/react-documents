import { join } from 'path';
import { config } from 'dotenv';
import express from 'express';
import { getRouter } from '../../src/server';

const PORT = 2000;
config();

const app = express();
app.listen(PORT, () => console.log('Listening on port', PORT));
app
    .get('/style.css', (_, res) => res.sendFile(join(process.cwd(), 'test', 'tabs', 'style.css')))
    .use(getRouter({
        dashboard: { password: 'pass' },
        database: {
            uri: process.env.MONGO_URI!,
            name: 'fs_test',
            rootName: 'Root',
        },
        html: {
            head: '<link rel="stylesheet" href="/style.css">',
            parser: true,
        },
        serviceWorker: { initialCache: ['/style.css'] },
    }));