import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const banner = `
/*!*************************************************************************
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. 
 **************************************************************************/
`;

export default {
  input: 'src/index.ts',
  output: {
    dir: './dist',
    format: 'es',
    banner,
  },
  external: ['react', 'c2pa', 'styled-components'],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    postcss({ modules: true }),
    nodeResolve(),
    commonjs(),
  ],
};
