# rollup-plugin-typecheck
A TypeScript type checker plugin for Rollup

## Installation

```sh
npm install --save-dev rollup-plugin-typecheck
```

or via yarn:

```sh
yarn add --dev rollup-plugin-typecheck
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import typecheck from 'rollup-plugin-typecheck';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'output',
    format: 'esm'
  },
  plugins: [
    typecheck({
        tsconfig: './relative/path/to/tsconfig.json',
        shouldExitOnError: true,
    })
  ]
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### tsconfig

Relative path to `tsconfig.json` file


### shouldExitOnError

If set to `true`, and TypeScript detects type error(s), then the rollup process will exit with code 1
