import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import pkg from './package.json' with { type: "json" };
import path from 'node:path';

const input = './src/index.ts';
const output = './lib';

export default [
    {
        input,
        plugins: [
          nodeResolve({
            preferBuiltins: false,
          }),
          commonjs(),
          esbuild({
            minify: false
          }),
        ],
        external: id => !(path.isAbsolute(id) || id.startsWith(".")),
        output: {
          dir: output,
          sourcemap: false,
          format: 'esm',
          entryFileNames: 'index.mjs',
          banner: `/*\n${'Rollup plugin TypeCheck'}\n
          Version: ${pkg.version}\n
          Published on ${new Date().toLocaleString()}\n*/`,
        }
      },
      // Generates index.d.ts type file for task vision browser
      {
        input: input,
        output: {
          dir: output,
          format: 'esm',
        },
        plugins: [
          dts({
            respectExternal: true
          })
        ]
      },  
]