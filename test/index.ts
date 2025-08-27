import { join } from 'path';
import webpack from 'webpack';
import { webpackConfig } from '../src/webpackConfig';

const name = process.argv[2];
webpack([{ watch: true, ...webpackConfig(join(process.cwd(), 'test', name, 'index.tsx'))[0] }], (err, stats) => {
    if (err) throw err;
    console.log(stats!.toString());
})?.run(() => require('./' + name));