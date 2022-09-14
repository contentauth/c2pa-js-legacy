/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import debug from 'debug';
import { Worker } from '../../worker';
import workerpool from 'workerpool';
import { C2paConfig } from '../c2pa';
import { InvalidWorkerSourceError } from './error';

const dbg = debug('c2pa:workers');

type CreateWorkerPoolConfig = Pick<C2paConfig, 'workerSrc' | 'poolOptions'>;

export interface SdkWorkerPool extends Worker {
  dispose: () => void;
}

export async function createWorkerPool(
  config: CreateWorkerPoolConfig,
): Promise<SdkWorkerPool> {
  const res = await fetch(config.workerSrc);

  if (!res.ok) throw new InvalidWorkerSourceError(config.workerSrc, res);

  const src = await res.text();
  // @TODO: check subresource integrity
  dbg('Fetched worker from %s (%d bytes)', config.workerSrc, src.length);

  const workerBlob = new Blob([src], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);

  const workerPool = workerpool.pool(workerUrl, config.poolOptions);

  const pool: Worker = {
    compileWasm: async (...args) => workerPool.exec('compileWasm', args),
    getReport: async (...args) => workerPool.exec('getReport', args),
    getReportFromAssetAndManifestBuffer: async (...args) => workerPool.exec('getReportFromAssetAndManifestBuffer', args),
    scanInput: async (...args) => workerPool.exec('scanInput', args),
  };

  return {
    ...pool,
    dispose: () => {
      URL.revokeObjectURL(workerUrl);
      return workerPool.terminate();
    },
  };
}
