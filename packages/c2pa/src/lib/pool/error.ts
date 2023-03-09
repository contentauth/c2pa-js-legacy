/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

interface SerializedError {
  [key: string]: any;
}

// From https://github.com/josdejong/workerpool/blob/master/src/worker.js#L76-L83
export function serializeError(error: Record<string, any>): SerializedError {
  return Object.getOwnPropertyNames(error).reduce(function (product, name) {
    return Object.defineProperty(product, name, {
      value: error[name],
      enumerable: true,
    });
  }, {});
}

// From https://github.com/josdejong/workerpool/blob/master/src/WorkerHandler.js#L179-L193
export function deserializeError(serializedError: SerializedError): Error {
  var temp = new Error('');
  var props = Object.keys(serializedError);

  for (var i = 0; i < props.length; i++) {
    // @ts-ignore
    temp[props[i]] = serializedError[props[i]];
  }

  return temp;
}
