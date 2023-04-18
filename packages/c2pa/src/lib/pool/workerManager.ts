/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { deserializeError } from './error';
import { WorkerRequest, WorkerResponse } from './worker';

export interface WorkerManager {
  execute: (request: WorkerRequest) => Promise<unknown>;
  isWorking: () => boolean;
  terminate: () => void;
}

/**
 * Create a wrapper responsible for managing a single worker
 *
 * @param scriptUrl URL to worker script
 * @returns {WorkerManager}
 */
export function createWorkerManager(scriptUrl: string): WorkerManager {
  const worker = new Worker(scriptUrl);
  let working = false;

  const execute: WorkerManager['execute'] = async (request) => {
    worker.postMessage(request);
    working = true;

    return new Promise((resolve, reject) => {
      worker.onmessage = function (e: MessageEvent<WorkerResponse>) {
        if (e.data.type === 'success') {
          resolve(e.data.data);
        } else {
          reject(deserializeError(e.data.error));
        }
        working = false;
      };

      worker.onerror = function (e) {
        working = false;
        reject(e);
      };
    });
  };

  const isWorking: WorkerManager['isWorking'] = () => working;

  const terminate: WorkerManager['terminate'] = () => worker.terminate();

  return {
    execute,
    isWorking,
    terminate,
  };
}
