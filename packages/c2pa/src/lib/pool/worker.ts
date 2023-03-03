import { serializeError } from "./error";

export interface WorkerRequest {
  method: string;
  args: unknown[];
}

export interface WorkerResponseSuccess {
  type: 'success';
  data: any;
}

export interface WorkerResponseError {
  type: 'error';
  error: any;
}

export type WorkerResponse = WorkerResponseSuccess | WorkerResponseError;

type WorkerMethods = Record<string, (...args: any[]) => any>;

export function setupWorker(methods: WorkerMethods) {
  onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const { args, method } = e.data;
    try {
      const res = await methods[method](...args);
      
      postMessage({
        type: 'success',
        data: res
      } as WorkerResponse);
    } catch(error: unknown) {
      postMessage({
        type: 'error',
        error: serializeError(error as Error)
      } as WorkerResponse);
    }
  }
}
