import { C2paProvider } from '@contentauth/react';
import { resolvers } from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.min.js?url';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const manifestResolvers = resolvers.createTypedResolvers(
  resolvers.editsAndActivity,
);
export type Resolvers = typeof manifestResolvers;

ReactDOM.render(
  <React.StrictMode>
    <C2paProvider
      config={{
        wasmSrc,
        workerSrc,
        manifestResolvers,
      }}
    >
      <App />
    </C2paProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
