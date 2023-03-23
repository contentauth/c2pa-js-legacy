/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import debug from 'debug';
import { Worker } from '../../worker';
import { InvalidWorkerSourceError } from './error';
import { createWorkerPool, WorkerPoolConfig } from './pool/workerPool';

const dbg = debug('c2pa:workers');

export interface SdkWorkerPool extends Worker {
  dispose: () => void;
}

export async function createPoolWrapper(
  config: WorkerPoolConfig,
): Promise<SdkWorkerPool> {
  const res = await fetch(config.scriptSrc);

  if (!res.ok) throw new InvalidWorkerSourceError(config.scriptSrc, res);

  const src = await res.text();
  // @TODO: check subresource integrity
  dbg('Fetched worker from %s (%d bytes)', config.scriptSrc, src.length);

  const workerBlob = new Blob([src], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);

  const workerPool = createWorkerPool({
    ...config,
    scriptSrc: workerUrl,
  });

  const pool: Worker = {
    compileWasm: async (...args) => workerPool.execute('compileWasm', args),
    getReport: async (...args) => workerPool.execute('getReport', args),
    getReportFromAssetAndManifestBuffer: async (...args) =>
      workerPool.execute('getReportFromAssetAndManifestBuffer', args),
    scanInput: async (...args) => workerPool.execute('scanInput', args),
  };

  return {
    ...pool,
    dispose: () => {
      URL.revokeObjectURL(workerUrl);
      return workerPool.terminate();
    },
  };
}
