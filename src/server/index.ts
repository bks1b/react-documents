import { join } from 'path';
import express, { Router } from 'express';
import fetch from 'node-fetch';
import api from './routes/api';
import dashboard from './routes/dashboard';
import Database, { DatabaseConfig } from './Database';

const moduleDir = __dirname.split(/[/\\]/).slice(0, -3);

export const getRouter = (config: Config) => {
    const db = new Database(config.database);
    const asciiMath = !config.excludeMath && fetch('https://raw.githubusercontent.com/asciimath/asciimathml/master/asciimath-based/ASCIIMathTeXImg.js')
        .then(d => d.text())
        .then(d => d
            .replace('//some greek symbols', `
                ${['sgn', 'deg', 'Ei', 'li', 'Li', 'Im', 'Re', 'arg', 'Arg'].map(x => `{ input: "${x}", tag: "mo", output: "${x}", tex: "text{${x}}", ttype: UNARY, func: true },`).join('')}
                { input: "=<", tag: "mo", output: "=<", tex: "le", ttype: CONST },
            `)
            .replace(/(?<=input:"(sech|csch|Log)", {2}tag:"mo", output:".+?", tex:)null/g, '"text{$1}"')
            .replace('"harr"', '"<->"')
            .replace(/(?<={input:"=>",.+?tex:")Rightarrow/, 'implies')
            .replace(/(?<={input:"<=",.+?tex:")le/, 'impliedby')
            .replace(/(?<={input:"<=>".+?tex:")Leftrightarrow/, 'iff'),
        );
    return Router().use(config.rootPath || '',
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
            .use((_, res, next) => config.html ? res.send(getHTML({ rootPath: config.rootPath, excludeMath: config.excludeMath, ...config.html })) : next()),
    );
};

export const getHTML = (config: HTMLConfig & BaseConfig) => `<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${config.rootPath || ''}/baseStyle.css">
        ${config.parser ? `<link rel="stylesheet" href="${config.rootPath || ''}/parser.css">` : ''}
        ${
            config.excludeMath
                ? ''
                : `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"><script src="${config.rootPath || ''}/asciimath.js"></script>`
        }
        ${config.head || ''}
    </head>
    <body>
        <div id="root"></div>
        <script src="${config.rootPath || ''}/app.js"></script>
    </body>
</html>`;

export type BaseConfig = {
    excludeMath?: boolean;
    rootPath?: string;
};
export type HTMLConfig = {
    parser?: boolean;
    head?: string;
    html?: HTMLConfig;
};
export type Config = {
    database: DatabaseConfig;
    dashboard: { password: string; };
    modulePath?: string;
    html?: HTMLConfig;
} & BaseConfig;