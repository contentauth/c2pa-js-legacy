/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import integrity from '@contentauth/toolkit/pkg/integrity.json';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import typescript from '@rollup/plugin-typescript';
import { wasm } from '@rollup/plugin-wasm';
import merge from 'lodash/merge';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
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
const plugins = [
  copy({
    targets: [
      {
        src: [
          resolve(
            __dirname,
            './node_modules/@contentauth/toolkit/pkg/**/*.wasm',
          ),
        ],
        dest: resolve(__dirname, './dist/assets/wasm'),
      },
    ],
    copyOnce: false,
    flatten: true,
  }),
  wasm({
    maxFileSize: 1024000,
  }),
  nodeResolve({
    browser: true,
  }),
  commonjs(),
  typescript(),
  json(),
  replace({
    'process.env.TOOLKIT_INTEGRITY': JSON.stringify(integrity),
  }),
];

const files = [
  {
    input: {
      c2pa: 'index.ts',
    },
    output: {
      format: 'es',
    },
  },
  {
    input: {
      'c2pa.worker': 'worker.ts',
    },
    output: {
      format: 'umd',
    },
  },
];

export default files.reduce((acc, config) => {
  const suffix = config.output.format === 'es' ? 'esm.' : '';
  const baseConfig = merge({}, config, {
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
