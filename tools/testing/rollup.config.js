import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: './esm/react-hooks-testing-library.ts',
    output: {
      dir: './src/esm-bundle',
      format: 'esm',
      sourcemap: true,
    },
    external: ['react'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './esm/tsconfig.json',
      }),
    ],
  },
];
