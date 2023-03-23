/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import debug from 'debug';
import { SdkWorkerPool } from './poolWrapper';

const dbg = debug('c2pa:wasm');

/**
 * Fetches the WASM binary from a supplied URL
 *
 * @param pool Worker pool to be used when compiling WASM
 * @param binaryUrl URL pointing to WASM binary
 */
export async function fetchWasm(
  pool: SdkWorkerPool,
  binaryUrl: string,
): Promise<WebAssembly.Module> {
  const integrity = TOOLKIT_INTEGRITY;
  const wasmIntegrity = integrity?.['toolkit_bg.wasm'];
  dbg('Fetching WASM binary from url %s', binaryUrl, {
    expectedIntegrity: wasmIntegrity,
  });

  const response = await fetch(binaryUrl, {
    integrity: wasmIntegrity,
  });
  const buffer = await response.arrayBuffer();

  dbg('Sending WASM binary buffer to worker for compilation', {
    size: buffer.byteLength,
  });

  const wasm = await pool.compileWasm(buffer);

  dbg('Compilation finished');

  return wasm;
}
