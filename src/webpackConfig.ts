import { join } from 'path';
import { Configuration, DefinePlugin, RuleSetRule, WebpackPluginFunction } from 'webpack';

export const webpackConfig = (entry: string, extended?: { plugins?: WebpackPluginFunction[]; rules?: RuleSetRule[]; }): Configuration[] => [{
    mode: 'none',
    entry: { app: entry },
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
    plugins: [new DefinePlugin({ 'process.env': '({})' }), ...extended?.plugins || []],
}];