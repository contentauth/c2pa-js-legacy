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

function handleMessage(resolve: (value: unknown) => void, reject: (reason?: any) => void, workingRef: { working: boolean }) {
  return (e: MessageEvent<WorkerResponse>) => {
    if (e.data.type === 'success') {
      resolve(e.data.data);
    } else {
      reject(deserializeError(e.data.error));
    }
    workingRef.working = false;
  };
}

function handleError(reject: (reason?: any) => void, workingRef: { working: boolean }) {
  return (e: ErrorEvent) => {
    workingRef.working = false;
    reject(e);
  };
}

/**
 * Create a wrapper responsible for managing a single worker
 *
 * @param scriptUrl URL to worker script
 * @returns {WorkerManager}
 */
export function createWorkerManager(scriptUrl: string): WorkerManager {
  const worker = new Worker(scriptUrl);
  const workingRef = { working: false };

  const execute: WorkerManager['execute'] = async (request) => {
    const transferable = request instanceof ArrayBuffer ? [request] : [];
    worker.postMessage(request, transferable);
    workingRef.working = true;

    return new Promise((resolve, reject) => {
      worker.onmessage = handleMessage(resolve, reject, workingRef);
      worker.onerror = handleError(reject, workingRef);
    });
  };

  const isWorking: WorkerManager['isWorking'] = () => workingRef.working;

  const terminate: WorkerManager['terminate'] = () => {
    worker.terminate();
    workingRef.working = false;
  };

  return {
    execute,
    isWorking,
    terminate,
  };
}
