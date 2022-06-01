import { resolve } from 'path';
import merge from 'lodash/merge';
import typescript from '@rollup/plugin-typescript';
import strip from '@rollup/plugin-strip';
import { terser } from 'rollup-plugin-terser';

const banner = `
/*!*************************************************************************
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. 
 **************************************************************************/
`;

const outputDir = resolve(__dirname, './dist');
const developmentMode = process.env.ROLLUP_WATCH === 'true';
const plugins = [typescript()];

const files = [
  {
    input: {
      'c2pa-react-hooks': 'index.ts',
    },
    output: {
      format: 'es',
    },
  },
];

export default files.reduce((acc, config) => {
  const suffix = config.output.format === 'es' ? 'esm.' : '';
  const baseConfig = merge({}, config, {
    external: ['react', 'c2pa'],
    output: {
      entryFileNames: `[name].${suffix}js`,
      dir: outputDir,
      banner,
    },
  });
  acc.push(
    merge({}, baseConfig, {
      output: {
        sourcemap: 'inline',
      },
      plugins,
    }),
  );
  if (!developmentMode) {
    acc.push(
      merge({}, baseConfig, {
        output: {
          entryFileNames: `[name].${suffix}min.js`,
        },
        plugins: [
          ...plugins,
          strip({
            functions: ['dbg'],
          }),
          terser(),
        ],
      }),
    );
  }
  return acc;
}, []);
