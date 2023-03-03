import { createBasicConfig } from '@open-wc/building-rollup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import merge from 'deepmerge';
import fg from 'fast-glob';
import path from 'path';
import postcss from 'rollup-plugin-postcss';
import { defineConfig } from 'vite';
import litSvg from './etc/rollup/plugins/lit-svg.cjs';

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

module.exports = defineConfig(({ mode }) => {
  const baseConfig = createBasicConfig({
    developmentMode: mode === 'development',
  });

  return {
    plugins: [litSvg()],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        formats: ['es'],
      },
      rollupOptions: merge(baseConfig, {
        input: fg.sync(['./src/**/*.ts', './assets/svg/**/*.svg']),
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
      }),
    },
  };
});
