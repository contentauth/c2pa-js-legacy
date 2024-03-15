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
  const res = await fetch(config.scriptSrc, {
    method: 'HEAD',
  });

  if (!res.ok) throw new InvalidWorkerSourceError(config.scriptSrc, res);

  // @TODO: check subresource integrity
  dbg(
    'Fetched worker from %s (%d bytes)',
    config.scriptSrc,
    res.headers.get('Content-Length'),
  );

  const workerPool = createWorkerPool(config);

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
      return workerPool.terminate();
    },
  };
}
