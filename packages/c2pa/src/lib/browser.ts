/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { IncompatibleBrowserError } from './error';

const WINDOW_FEATURES = [
  'ArrayBuffer',
  'File',
  'FileReader',
  'SubtleCrypto',
  'Uint8Array',
  'WebAssembly',
  'fetch',
];

/**
 * Checks if the current browser is compatible with the features needed for
 * this library.
 *
 * @return {boolean}
 */
export function isCompatible(): boolean {
  return WINDOW_FEATURES.every((x) => x in self);
}

/**
 * Throws an error if the current browser is incompatible with this library.
 */
export function ensureCompatibility(): void {
  if (!isCompatible()) {
    throw new IncompatibleBrowserError();
  }
}
