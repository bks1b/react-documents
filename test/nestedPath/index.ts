import { config } from 'dotenv';
import express from 'express';
import { getRouter } from '../../src/server';

const PORT = 2000;
config();

const app = express();
app.listen(PORT, () => console.log('Listening on port', PORT));
app.use(getRouter({
    dashboard: { password: 'pass' },
    database: {
        uri: process.env.MONGO_URI!,
        name: 'fs_test',
        rootName: 'Root',
    },
    rootPath: '/docs',
    html: {
        head: '<style>.renderedContainer { overflow: auto; }</style>',
        parser: true,
    },
}));