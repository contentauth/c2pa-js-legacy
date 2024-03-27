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
import { mapKeys, reduce, snakeCase } from 'lodash';
import { ensureCompatibility } from './lib/browser';
import { Downloader, DownloaderOptions } from './lib/downloader';
import { InvalidInputError } from './lib/error';
import { WorkerPoolConfig } from './lib/pool/workerPool';
import { SdkWorkerPool, createPoolWrapper } from './lib/poolWrapper';
import { fetchWasm } from './lib/wasm';
import { ManifestStore, createManifestStore } from './manifestStore';
import { C2paSourceType, Source, createSource } from './source';

const dbg = debug('c2pa');
const dbgTask = debug('c2pa:task');

export interface ToolkitTrustSettings {
  /**
   * A list of allowed trust anchors
   */
  trustAnchors?: string;
  trustConfig?: string;
  /**
   * A list of allowed end-entity certificates/hashes for trust checking
   */
  allowedList?: string;
}

export interface ToolkitVerifySettings {
  verifyAfterSign?: boolean;
  verifyTrust?: boolean;
  ocspFetch?: boolean;
  remoteManifestFetch?: boolean;
}

export interface ToolkitSettings {
  trust?: ToolkitTrustSettings;
  verify?: ToolkitVerifySettings;
}

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
  poolOptions?: Partial<WorkerPoolConfig>;

  /**
   * Options for the asset downloader
   */
  downloaderOptions?: Partial<DownloaderOptions>;

  /**
   * By default, the SDK will fetch cloud-stored (remote) manifests. Set this to false to disable this behavior.
   */
  fetchRemoteManifests?: boolean;

  settings?: ToolkitSettings;
}

export interface C2paReadOptions {
  settings?: ToolkitSettings;
}

/**
 * Main interface for reading c2pa data contained within an asset.
 */
export interface C2pa {
  /**
   * Processes image data from a `Blob` as input
   * @param blob - The binary data of the image
   */
  read(blob: Blob, options?: C2paReadOptions): Promise<C2paReadResult>;

  /**
   * Processes image data from a `File` as input. Useful for file uploads/drag-and-drop.
   * @param file - The binary data of the image
   */
  read(file: File, options?: C2paReadOptions): Promise<C2paReadResult>;

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
  read(url: string, options?: C2paReadOptions): Promise<C2paReadResult>;

  /**
   * Processes an image from an HTML image element (`<img />`).
   *
   * @remarks
   * This is useful if you want to process the image returned by a `document.querySelector` call
   *
   * @param element - DOM element of the image to process
   */
  read(
    element: HTMLImageElement,
    options?: C2paReadOptions,
  ): Promise<C2paReadResult>;

  /**
   * Process an image given a valid input. Supported types:
   * - Blob
   * - File
   * - Image URL
   * - HTML image element (`<img />`)
   *
   * @param input - Image to process
   */
  read(
    input: C2paSourceType,
    options?: C2paReadOptions,
  ): Promise<C2paReadResult>;

  /**
   * Convenience function to process multiple images at once
   *
   * @param inputs - Array of inputs to pass to `processImage`
   */
  readAll(
    inputs: C2paSourceType[],
    options?: C2paReadOptions,
  ): Promise<C2paReadResult[]>;

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

// Make sure we format the settings in a way that Rust expects them
function formatSettings(settings: ToolkitSettings | null | undefined) {
  if (!settings) {
    return undefined;
  }

  const formatted = reduce(
    settings,
    (acc, sectionVals, sectionName) => {
      return {
        ...acc,
        [snakeCase(sectionName)]: mapKeys(sectionVals, (_, val) =>
          snakeCase(val),
        ),
      };
    },
    {},
  );

  return JSON.stringify(formatted);
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

  const read: C2pa['read'] = async (input, opts) => {
    const jobId = ++jobCounter;

    dbgTask('[%s] Reading from input', jobId, input);

    const source = await createSource(downloader, input);
    const settings = formatSettings(opts?.settings ?? config.settings);

    dbgTask('[%s] Processing input', jobId, input, {
      settings: settings && JSON.parse(settings),
    });

    if (!source.blob) {
      return {
        manifestStore: null,
        source,
      };
    }

    const buffer = await source.arrayBuffer();

    try {
      const result = await pool.getReport(wasm, buffer, source.type, settings);

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
        config,
        settings,
      );

      return {
        manifestStore,
        source,
      };
    }
  };

  const readAll: C2pa['readAll'] = async (inputs, options) =>
    Promise.all(inputs.map((input) => read(input, options)));

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
  console.log('source', assetUrl);
  return url.toString();
}

/**
 * Regular expression list of error names that we can ignore and still display the asset
 * even though we can't inspect Content Credentials
 */
const ignoreErrors = [
  // No embedded or remote provenance found in the asset
  /^C2pa\(ProvenanceMissing\)$/,
  // Could not parse JUMBF data
  /^C2pa\(JumbfParseError\([^\)]+\)\)$/,
  // JUMBF or required box not found
  /^C2pa\(Jumbf(?:Box)?NotFound\)$/,
];

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
  config: C2paConfig,
  settings?: string,
): Promise<ManifestStore | null> | null {
  const fetchRemote = config.fetchRemoteManifests ?? true;

  if (error.name === 'Toolkit(RemoteManifestUrl)') {
    if (fetchRemote && error.url) {
      return fetchRemoteManifest(source, error.url, pool, wasm, settings);
    }
    return null;
  }

  if (ignoreErrors.some((re) => re.test(error.name))) {
    dbg('Missing or invalid provenance data found', { error: error.name });
    return null;
  }

  throw error;
}

async function fetchRemoteManifest(
  source: Source,
  manifestUrl: string,
  pool: SdkWorkerPool,
  wasm: WebAssembly.Module,
  settings?: string,
): Promise<ManifestStore | null> {
  try {
    const url = new URL(manifestUrl);
    dbg('Fetching remote manifest from', url);

    if (!source.blob) {
      dbg('No blob found on source, skipping remote manifest loading', source);
      throw new InvalidInputError();
    }

    const manifestBytes = await fetch(url.toString());
    const manifestBlob = await manifestBytes.blob();
    const manifestBuffer = await manifestBlob.arrayBuffer();
    const result = await pool.getReportFromAssetAndManifestBuffer(
      wasm,
      manifestBuffer,
      source.blob,
      settings,
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
