/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { WorkerRequest } from './worker';

export interface Task {
  request: WorkerRequest;
  resolve: (value: unknown) => void;
  reject: (value: unknown) => void;
}

export function createTask(task: Task) {
  return task;
}
