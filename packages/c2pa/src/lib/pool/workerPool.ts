/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { createTask, Task } from './task';
import { createWorkerManager, WorkerManager } from './workerManager';

export interface WorkerPoolConfig {
  scriptSrc: string;
  maxWorkers: number;
}

interface WorkerPool {
  execute: (method: string, args: any[]) => Promise<any>;
  terminate: () => void;
}

/**
 * Create a configurable pool of workers capable of concurrent task execution
 *
 * @param {WorkerPoolConfig} config
 * @returns {WorkerPool}
 */
export function createWorkerPool(config: WorkerPoolConfig): WorkerPool {
  const workers: WorkerManager[] = [];
  const tasks: Task[] = [];
  /**
   * Retrieve an available worker. If none are available and the max is not reached,
   * a new one will be created and returned.
   *
   * @returns {WorkerManager | null} worker
   */
  const getWorker = () => {
    for (const worker of workers) {
      if (!worker.isWorking()) return worker;
    }
    if (workers.length < config.maxWorkers) {
      const newWorker = createWorkerManager(config.scriptSrc);
      workers.push(newWorker);
      return newWorker;
    }
    return null;
  };

  /**
   * Attempt to process the task queue by retrieving a worker, assigning it a task,
   * and resolving the task once complete.
   */
  const assignTask = async () => {
    const worker = getWorker();

    if (!worker) {
      return;
    }

    const task = tasks.pop();

    if (!task) {
      return;
    }

    try {
      const result = await worker.execute(task.request);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }
  };

  /**
   * Attempt to execute a method on the worker
   *
   * @param method Name of method to execute
   * @param args Arguments to be passed
   * @returns Promise that resolves once the method has finished executing
   */
  const execute: WorkerPool['execute'] = (method, args) => {
    return new Promise((resolve, reject) => {
      const task = createTask({
        request: {
          method,
          args,
        },
        resolve: (value) => {
          resolve(value);
          // Upon completion of this task, its worker is now free and the queue should be checked
          assignTask();
        },
        reject: (value) => {
          reject(value);
          assignTask();
        },
      });

      tasks.push(task);

      assignTask();
    });
  };

  const terminate: WorkerPool['terminate'] = () => {
    workers.forEach((worker) => worker.terminate());
  };

  return {
    execute,
    terminate,
  };
}
