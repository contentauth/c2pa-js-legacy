/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import path from 'path';
import merge from 'deepmerge';
import fg from 'fast-glob';
import { createBasicConfig } from '@open-wc/building-rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';

const litSvg = require('./etc/rollup/plugins/lit-svg');

const developmentMode = process.env.ROLLUP_WATCH === 'true';
const basePath = path.resolve(__dirname);
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

const baseConfig = createBasicConfig({
  developmentMode,
  // we provide our own node-resolve plugin as the included version does not satisfy the commonjs' plugin version requirement
  nodeResolve: false,
});

export default merge(baseConfig, {
  input: fg.sync([
    './src/**/*.ts',
    './themes/**/*.css',
    './assets/svg/**/*.svg',
  ]),
  output: {
    format: 'es',
    dir: 'dist',
    banner,
    minifyInternalExports: false,
    entryFileNames: (chunk) => {
      if (chunk.isEntry) {
        const relPath = path.relative(basePath, chunk.facadeModuleId);
        const withoutPrefix = relPath
          .replace(/^src\//, '')
          .replace(/^assets\/svg\//, 'icons/');
        const { dir } = path.parse(withoutPrefix);
        return `${dir ? `${dir}/` : ``}[name].js`;
      }
      return `[name].js`;
    },
  },
  plugins: [
    litSvg(),
    json(),
    nodeResolve(),
    commonjs(),
    typescript(),
    postcss(),
  ],
});
