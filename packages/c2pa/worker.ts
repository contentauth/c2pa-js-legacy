/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import workerpool from 'workerpool';
import {
  default as initDetector,
  scan_array_buffer,
} from '@contentauth/detector';
import {
  default as initToolkit,
  getManifestStoreFromArrayBuffer,
  getManifestStoreFromManifestAndAsset,
  ManifestStore,
} from '@contentauth/toolkit';

export interface IScanResult {
  found: boolean;
  offset?: number;
}

const worker = {
  async compileWasm(buffer: ArrayBuffer): Promise<WebAssembly.Module> {
    return WebAssembly.compile(buffer);
  },
  async getReport(
    wasm: WebAssembly.Module,
    buffer: ArrayBuffer,
    type: string,
  ): Promise<ManifestStore> {
    await initToolkit(wasm);
    return getManifestStoreFromArrayBuffer(buffer, type);
  },
  async getReportFromAssetAndManifestBuffer(
    wasm: WebAssembly.Module,
    manifestBuffer: ArrayBuffer,
    assetBuffer: ArrayBuffer,
  ) {
    await initToolkit(wasm);
    return getManifestStoreFromManifestAndAsset(manifestBuffer, assetBuffer);
  },
  async scanInput(
    wasm: WebAssembly.Module,
    buffer: ArrayBuffer,
  ): Promise<IScanResult> {
    await initDetector(wasm);
    try {
      const offset = await scan_array_buffer(buffer);
      return { found: true, offset };
    } catch (err) {
      return { found: false };
    }
  },
};

export type Worker = typeof worker;

workerpool.worker(worker);
