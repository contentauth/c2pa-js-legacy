/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ToolkitError } from '@contentauth/toolkit';
import debug from 'debug';
import { WorkerPoolOptions } from 'workerpool';
import { ensureCompatibility } from './lib/browser';
import { Downloader, DownloaderOptions } from './lib/downloader';
import { createPoolWrapper, SdkWorkerPool } from './lib/poolWrapper';
import { fetchWasm } from './lib/wasm';
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

  /**
   * By default, the SDK will fetch cloud-stored (remote) manifests. Set this to false to disable this behavior.
   */
  fetchRemoteManifests?: boolean;
}

/**
 * Main interface for reading c2pa data contained within an asset.
 */
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

  /**
   * Process an image given a valid input. Supported types:
   * - Blob
   * - File
   * - Image URL
   * - HTML image element (`<img />`)
   *
   * @param input - Image to process
   */
  read(input: C2paSourceType): Promise<C2paReadResult>;

  /**
   * Convenience function to process multiple images at once
   *
   * @param inputs - Array of inputs to pass to `processImage`
   */
  readAll(inputs: C2paSourceType[]): Promise<C2paReadResult[]>;

  /**
   * Disposer function to clean up the underlying worker pool and any other disposable resources
   */
  dispose: () => void;
}

export interface C2paReadResult {
  /**
   * Manifest store containing all c2pa metadata associated with the image
   */
  manifestStore: ManifestStore | null;

  /**
   * Source asset provided to `c2pa.read()`
   */
  source: Source;
}

/**
 * Creates a c2pa object that can be used to read c2pa metadata from an image.
 *
 * @param config - Configuration options for the created c2pa object
 */
export async function createC2pa(config: C2paConfig): Promise<C2pa> {
  let jobCounter = 0;

  dbg('Creating c2pa with config', config);
  ensureCompatibility();

  const pool = await createPoolWrapper({
    scriptSrc: config.workerSrc,
    maxWorkers: navigator.hardwareConcurrency || 4,
  });

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
      const manifestStore = await handleErrors(
        source,
        err,
        pool,
        wasm,
        config.fetchRemoteManifests,
      );

      return {
        manifestStore,
        source,
      };
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
 * @param assetUrl - The URL of the asset you want to view in Verify
 */
export function generateVerifyUrl(assetUrl: string) {
  const url = new URL('https://verify.contentauthenticity.org/inspect');
  url.searchParams.set('source', assetUrl);
  return url.toString();
}

/**
 * Handles errors from the toolkit and fetches/processes remote manifests, if applicable.
 *
 * @param source - Source object representing the asset
 * @param error - Error from toolkit
 * @param pool - Worker pool to use when processing remote manifests (triggered by Toolkit(RemoteManifestUrl) error)
 * @param wasm - WASM module to use when processing remote manifests
 * @param fetchRemote - Controls remote-fetching behavior
 * @returns A manifestStore, if applicable, null otherwise or a re-thrown error.
 */
function handleErrors(
  source: Source,
  error: ToolkitError,
  pool: SdkWorkerPool,
  wasm: WebAssembly.Module,
  fetchRemote = true,
): Promise<ManifestStore | null> | null {
  switch (error.name) {
    case 'Toolkit(RemoteManifestUrl)':
      if (fetchRemote && error.url) {
        return fetchRemoteManifest(source, error.url, pool, wasm);
      }
      break;
    case 'C2pa(ProvenanceMissing)':
    case 'C2pa(JumbfNotFound)':
      dbg('No provenance data found');
      break;
    default:
      throw error;
  }

  return null;
}

async function fetchRemoteManifest(
  source: Source,
  manifestUrl: string,
  pool: SdkWorkerPool,
  wasm: WebAssembly.Module,
): Promise<ManifestStore | null> {
  try {
    const url = new URL(manifestUrl);
    dbg('Fetching remote manifest from', url);

    const manifestBytes = await fetch(url.toString());
    const manifestBlob = await manifestBytes.blob();
    const manifestBuffer = await manifestBlob.arrayBuffer();
    const sourceBuffer = await source.arrayBuffer();
    const result = await pool.getReportFromAssetAndManifestBuffer(
      wasm,
      manifestBuffer,
      sourceBuffer,
    );

    return createManifestStore(result);
  } catch (err) {
    if (err instanceof TypeError) {
      dbg('Invalid URL given, skipping remote manifest loading', manifestUrl);
      return null;
    }

    dbg('Error loading remote manifest from', manifestUrl, err);
    throw err;
  }
}
