import React from 'react';
import { C2paProvider } from '../../';

const wrapper: React.FunctionComponent<{}> = ({ children }) => {
  return (
  <C2paProvider
  config={{
      wasmSrc: 'node_modules/c2pa/dist/assets/wasm/toolkit_bg.wasm',
      workerSrc: 'node_modules/c2pa/dist/c2pa.worker.js',
    }}
  >
    {children}
  </C2paProvider>
)};

export default wrapper;
