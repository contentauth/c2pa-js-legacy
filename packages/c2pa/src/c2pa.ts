/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import debug from 'debug';
import { Downloader, DownloaderOptions } from './lib/downloader';
import { WorkerPoolOptions } from 'workerpool';
import { ensureCompatibility } from './lib/browser';
import { fetchWasm } from './lib/wasm';
import { createWorkerPool } from './lib/workerPool';
import { createManifestStore, ManifestStore } from './manifestStore';
import { C2paSourceType, createSource, Source } from './source';

const dbg = debug('c2pa');
const dbgTask = debug('c2pa:task');

// @TODO: should wasmSrc/workerSrc be optional here w/ an error at runtime if not provided?
export interface C2paConfig {
  /**
   * The URL of the WebAssembly binary or a compiled WebAssembly module
   */
  wasmSrc: WebAssembly.Module | string;

  /**
   * The URL of the web worker JavaScript file
   */
  workerSrc: string;

  /**
   * Options for the web worker pool
   * @see {@link https://github.com/josdejong/workerpool#pool}
   */
  poolOptions?: Partial<WorkerPoolOptions>;

  /**
   * Options for the asset downloader
   */
  downloaderOptions?: Partial<DownloaderOptions>;
}

export interface C2pa {
  /**
   * Processes image data from a `Blob` as input
   * @param blob - The binary data of the image
   */
  read(blob: Blob): Promise<C2paReadResult>;

  /**
   * Processes image data from a `File` as input. Useful for file uploads/drag-and-drop.
   * @param file - The binary data of the image
   */
  read(file: File): Promise<C2paReadResult>;

  /**
   * Processes image data from a URL
   *
   * @remarks
   * Note: The file referenced by the URL must either be have the same
   * {@link https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy | origin}
   * as the site referencing this code, or it needs to have
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS | CORS} enabled on the resource.
   *
   * @param url - The URL of the image to process
   */
  read(url: string): Promise<C2paReadResult>;

  /**
   * Processes an image from an HTML image element (`<img />`).
   *
   * @remarks
   * This is useful if you want to process the image returned by a `document.querySelector` call
   *
   * @param element - DOM element of the image to process
   */
  read(element: HTMLImageElement): Promise<C2paReadResult>;
  read(input: C2paSourceType): Promise<C2paReadResult>;

  /**
   * Convenience function to process multiple images at once
   *
   * @param inputs Array of inputs to pass to `processImage`
   */
  readAll(inputs: C2paSourceType[]): Promise<C2paReadResult[]>;

  dispose: () => void;
}

export interface C2paReadResult {
  manifestStore: ManifestStore | null;
  source: Source;
}

/**
 * Creates a c2pa object that can be used to read c2pa metadata from an image.
 *
 * @param config Configuration options for the created c2pa object
 */
export async function createC2pa(config: C2paConfig): Promise<C2pa> {
  let jobCounter = 0;

  dbg('Creating c2pa with config', config);
  ensureCompatibility();

  const pool = await createWorkerPool(config);
  const downloader = new Downloader(pool, config.downloaderOptions);

  const wasm =
    config.wasmSrc instanceof WebAssembly.Module
      ? config.wasmSrc
      : await fetchWasm(pool, config.wasmSrc);

  const read: C2pa['read'] = async (input) => {
    const jobId = ++jobCounter;

    dbgTask('[%s] Reading from input', jobId, input);

    const source = await createSource(downloader, input);

    dbgTask('[%s] Processing input', jobId, input);

    if (!source.blob) {
      return {
        manifestStore: null,
        source,
      };
    }

    const buffer = await source.arrayBuffer();

    try {
      const result = await pool.getReport(wasm, buffer, source.type);

      dbgTask('[%s] Received worker result', jobId, result);

      return {
        manifestStore: createManifestStore(result),
        source,
      };
    } catch (err: any) {
      if (
        ['C2pa(ProvenanceMissing)', 'C2pa(JumbfNotFound)'].includes(err?.name)
      ) {
        return { manifestStore: null, source };
      } else {
        throw err;
      }
    }
  };

  const readAll: C2pa['readAll'] = async (inputs) =>
    Promise.all(inputs.map((input) => read(input)));

  return {
    read,
    readAll,
    dispose: () => pool.dispose(),
  };
}

/**
 * Generates a URL that pre-loads the `assetUrl` into the Content Authenticity Verify site
 * for deeper inspection by users.
 *
 * @param assetUrl The URL of the asset you want to view in Verify
 */
export function generateVerifyUrl(assetUrl: string) {
  const url = new URL('https://verify.contentauthenticity.org/inspect');
  url.searchParams.set('source', assetUrl);
  return url.toString();
}
