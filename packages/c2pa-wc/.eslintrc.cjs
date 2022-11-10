module.exports = {
  extends: ['./node_modules/@contentauth/config/eslint/default.cjs'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
  },
};
