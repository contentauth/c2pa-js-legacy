import { WorkerRequest } from "./worker";

export interface Task {
  request: WorkerRequest;
  resolve: (value: unknown) => void;
  reject: (value: unknown) => void;
}

export function createTask(task: Task) {
  return task;
}
