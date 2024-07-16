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
                ${['sgn', 'deg', 'rad', 'Ei', 'li', 'Li', 'Im', 'Re', 'arg', 'Arg', 'ord', 'ind', 'ker'].map(x => `{ input: "${x}", tag: "mo", output: "${x}", tex: "text{${x}}", ttype: UNARY, func: true },`).join(' ')}
                { input: "=<", tag: "mo", output: "=<", tex: "le", ttype: CONST },
                { input: "ng", tag: "mo", output: "ng", tex: "triangleleft", ttype: CONST },
            `)
            .replace(/(?<=input:"(sech|csch|Log)", {2}tag:"mo", output:".+?", tex:)null/g, '"text{$1}"')
            .replace('"harr"', '"<->"')
            .replace(/(?<={input:"=>",.+?tex:")Rightarrow/, 'implies')
            .replace(/(?<={input:"<=",.+?tex:")le/, 'impliedby')
            .replace(/(?<={input:"<=>".+?tex:")Leftrightarrow/, 'iff')
            .replace(/\{input:"-:",(.+?)tex:"div"(.+?)\}/, '{ input: "div",$1tex: "mid"$2 }, { input: "!div",$1tex: "nmid"$2 }'),
        );
    return Router().use(config.rootPath || '',
        Router()
            .use(express.json({ limit: '1tb' }))
            .use(express.static(join(process.cwd(), 'build')))
            .use(express.static(join(...config.modulePath ? [config.modulePath] : moduleDir, 'src', 'client', 'static')))
            .get('/asciimath.js', (_, res) => asciiMath && asciiMath.then(x => {
                res.setHeader('content-type', 'application/javascript; charset=utf-8');
                res.send(x);
            }))
            .get('/sw.js', (_, res) => {
                res.setHeader('content-type', 'application/javascript; charset=utf-8');
                res.send(getSW(config));
            })
            .use('/api', api(db))
            .use('/api/dashboard', dashboard(db, config.dashboard.password))
            .use((_, res, next) => config.html ? res.send(getHTML({ ...config, ...config.html })) : next()),
    );
};

export const getHTML = (config: HTMLConfig & BaseConfig) => `<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, maximum-scale=1.0">
        <link rel="stylesheet" href="${config.rootPath || ''}/baseStyle.css">
        ${config.parser ? `<link rel="stylesheet" href="${config.rootPath || ''}/parser.css">` : ''}
        ${
            config.excludeMath
                ? ''
                : `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"><script src="${config.rootPath || ''}/asciimath.js"></script>`
        }
        ${config.serviceWorker ? `<script>navigator.serviceWorker.register('${config.rootPath || ''}/sw.js');</script>` : ''}
        ${config.head || ''}
    </head>
    <body>
        <div id="root"></div>
        <script src="${config.rootPath || ''}/app.js"></script>
    </body>
</html>`;

const getSW = (config: Config) => `const CACHE_NAME = '${config.database.name}';
const INITIAL_CACHE = ${JSON.stringify([
    ...[
        '',
        'api/files',
        'app.js',
        'baseStyle.css',
        ...config.excludeMath ? [] : ['asciimath.js'],
        ...config.html?.parser ? ['parser.css'] : [],
    ].map(x => `${config.rootPath || ''}/${x}`),
    ...config.excludeMath ? [] : [
        'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css',
        ...['AMS-Regular', 'Caligraphic-Bold', 'Caligraphic-Regular', 'Fraktur-Bold', 'Fraktur-Regular', 'Main-Bold', 'Main-BoldItalic', 'Main-Italic', 'Main-Regular', 'Math-BoldItalic', 'Math-Italic', 'SansSerif-Bold', 'SansSerif-Italic', 'SansSerif-Regular', 'Script-Regular', 'Size1-Regular', 'Size2-Regular', 'Size3-Regular', 'Size4-Regular', 'Typewriter-Regular'].map(x => `https://cdn.jsdelivr.net/npm/katex/dist/fonts/KaTeX_${x}.woff2`),
    ],
    ...config.serviceWorker?.initialCache || [],
])};

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(INITIAL_CACHE))));
self.addEventListener('fetch', e => e.respondWith(caches.open(CACHE_NAME).then(async c => {
    try {
        const res = await fetch(e.request);
        if (e.request.method === 'GET') c.put(e.request, res.clone());
        return res;
    } catch {
        return (await c.match(e.request)) || c.match(INITIAL_CACHE[0]);
    }
})));`;

export type BaseConfig = {
    excludeMath?: boolean;
    rootPath?: string;
    serviceWorker?: { initialCache?: string[]; };
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