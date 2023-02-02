
// IMPORTS

import { build } from 'esbuild';
import inlineImportPlugin from 'esbuild-plugin-inline-import';

// CODE

build({
    entryPoints: ['./src/index.ts'],

    platform: 'node',
    bundle: true,
    minify: false,
    watch: false,
    logLevel: 'info',
    outfile: './src/index.js',

    plugins: [
        inlineImportPlugin()
    ]
});