# React Documents

A React application for displaying and managing a file system stored in MongoDB.

## Installation

I don't intend on publishing this package on npm since I made it for my own usage, but it can be installed from GitHub via npm: `npm i bks1b/react-documents`

## Interface

### Client-side

`/dist/src/client` exports the client-side component (as a named export, `Documents`) which takes the following props:
```ts
{
    title: string;
    rootPath?: string[];
    padding?: boolean;
    Renderer: FC<Record<'name' | 'text', string>>;
}
```

### Server-side

`/dist/src/server` contains the Express router. It has a single named export, `getRouter`, which is a function which takes the following configuration and returns an Express router:
```ts
{
    database: Record<'uri' | 'name' | 'rootName', string>;
    dashboard: { password: string; };
    head?: string;
    rootPath?: string[];
    modulePath?: string;
    excludeMath?: boolean;
    parser?: boolean;
}
```

### Parser

`/dist/src/parser` contains an optional, customizable parser for processing and rendering text.

### Webpack config

`/dist/src/webpackConfig` exports the "recommended" webpack configuration. It has a single named export, `webpackConfig`, which is a function which takes the main client-side file's path as an argument.