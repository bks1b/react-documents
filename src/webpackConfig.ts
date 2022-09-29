import { join } from 'path';
import { Configuration, DefinePlugin, RuleSetRule } from 'webpack';

export const webpackConfig = (entry: string, extended?: { rules?: RuleSetRule[]; entries?: Record<string, string>; }): Configuration[] => [{
    mode: 'none',
    entry: { app: entry, ...extended?.entries || {} },
    target: 'web',
    resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    module: {
        rules: [{
            loader: 'ts-loader',
            test: /\.tsx?$/,
            options: { allowTsInNodeModules: true },
        }, ...extended?.rules || []],
    },
    output: {
        filename: '[name].js',
        path: join(process.cwd(), 'build'),
    },
    plugins: [new DefinePlugin({ 'process.env': '({})' })],
}];