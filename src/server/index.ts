import { join } from 'path';
import express, { Router } from 'express';
import fetch from 'node-fetch';
import { stripIndent } from 'common-tags';
import api from './routes/api';
import dashboard from './routes/dashboard';
import Database, { DatabaseConfig } from './Database';

const moduleDir = __dirname.split(/[/\\]/).slice(0, -3);

export const getRouter = (config: Config) => {
    const db = new Database(config.database);
    const rootPath = config.rootPath ? '/' + config.rootPath.join('/') : '';
    const asciiMath = !config.excludeMath && fetch('https://raw.githubusercontent.com/asciimath/asciimathml/master/asciimath-based/ASCIIMathTeXImg.js')
        .then(d => d.text())
        .then(d => d
            .replace('//some greek symbols', `
                { input: "sgn", tag: "mo", output: "sgn", tex: "text{sgn}", ttype: UNARY, func: true },
                { input: "=<",  tag: "mo", output: "=<", tex: "le", ttype: CONST },
            `)
            .replace('"harr"', '"<->"')
            .replace(/(?<={input:"=>",.+?tex:")Rightarrow/, 'implies')
            .replace(/(?<={input:"<=",.+?tex:")le/, 'impliedby')
            .replace(/(?<={input:"<=>".+?tex:")Leftrightarrow/, 'iff'),
        );
    const html = stripIndent`
        <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="${rootPath}/baseStyle.css">
                ${config.parser ? `<link rel="stylesheet" href="${rootPath}/parser.css">` : ''}
                ${
                    config.excludeMath
                        ? ''
                        : `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"><script src="${rootPath}/asciimath.js"></script>`
                }
                ${config.head || ''}
            </head>
            <body>
                <div id="root"></div>
                <script src="${rootPath}/app.js"></script>
            </body>
        </html>
    `;
    return Router().use(rootPath,
        Router()
            .use(express.json())
            .use(express.static(join(process.cwd(), 'build')))
            .use(express.static(join(...config.modulePath ? [config.modulePath] : moduleDir, 'src', 'client', 'static')))
            .get('/asciimath.js', (_, res) => asciiMath && asciiMath.then(x => {
                res.setHeader('content-type', 'application/javascript; charset=utf-8');
                res.send(x);
            }))
            .use('/api', api(db))
            .use('/api/dashboard', dashboard(db, config.dashboard.password))
            .use((_, res) => res.send(html)),
    );
};

export type Config = {
    database: DatabaseConfig;
    dashboard: { password: string; };
    head?: string;
    rootPath?: string[];
    modulePath?: string;
    excludeMath?: boolean;
    parser?: boolean;
};