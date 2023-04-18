/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { InvalidMimeTypeError, UrlFetchError } from './error';
import { Validator } from './validator';
import merge from 'lodash/merge';
import debug from 'debug';
import { SdkWorkerPool } from './poolWrapper';

const dbg = debug('c2pa:Downloader');
const cacheDbg = debug('c2pa:Downloader:Cache');

export interface DownloaderOptions {
  /**
   * The number of bytes at the start of the image to check for C2PA metadata
   * before downloading the whole image (defaults to 64k)
   */
  inspectSize: number;
}

export interface IFetchOptions {
  /**
   * The range byte to start from (defaults to 0)
   */
  rangeStart: number;
  /**
   * The range byte to end at (defaults to end of content)
   */
  rangeEnd: number | undefined;
  /**
   * Options passed to the browser's `fetch` method
   */
  fetchConfig: RequestInit;
}

/**
 * Handles downloading of any assets
 *
 * @public
 */
export class Downloader {
  #options: DownloaderOptions;

  #pool: SdkWorkerPool;

  #validator: Validator;

  static #responseCache = new Map<string, any>();

  static #defaultOptions: DownloaderOptions = {
    inspectSize: 0,
  };

  static #defaultFetchOptions: IFetchOptions = {
    rangeStart: 0,
    rangeEnd: undefined,
    fetchConfig: {},
  };

  constructor(pool: SdkWorkerPool, opts: Partial<DownloaderOptions> = {}) {
    this.#options = { ...Downloader.#defaultOptions, ...opts };
    this.#pool = pool;
    this.#validator = new Validator(this.#pool, this.#options.inspectSize);
  }

  /**
   * Wrapper around `fetch` to download an asset
   *
   * @remarks
   * This has convenience logic for range requests
   *
   * @param url - The URL to fetch
   * @param fetchOptions - Options for this particular request
   */
  static async download(
    url: string,
    fetchOptions: Partial<IFetchOptions> = {},
  ): Promise<Response> {
    dbg('Downloading', url);
    try {
      const defaultOpts = Downloader.#defaultFetchOptions;
      const opts = merge({}, defaultOpts, fetchOptions);
      // Only use range if it is specified. If not, it may lead to CORS issues due to not being whitelisted
      const useRange =
        opts.rangeStart !== defaultOpts.rangeStart ||
        opts.rangeEnd !== defaultOpts.rangeEnd;
      const range = [opts.rangeStart, opts.rangeEnd ?? ''].join('-');
      const rangeHeaders = useRange
        ? { headers: { range: `bytes=${range}` } }
        : null;
      const res = await fetch(url, merge({}, opts.fetchConfig, rangeHeaders));
      if (res.ok) {
        return res;
      } else {
        throw new UrlFetchError(url, res);
      }
    } catch (err) {
      throw new UrlFetchError(url, null, err as TypeError);
    }
  }

  /**
   * This allows us to inspect the image to see if the header contains C2PA data
   *
   * @remarks
   * We will request a download to the server requesting the first `inspectSize` bytes. From there:
   * - if the server responds with a payload less than the content-length, we will inspect that chunk and
   *   download the rest if the content-type matches and that chunk contains metadata
   * - if it responds with a payload equal to or greater than the content-length, we will inspect that the
   *   content type matches, scan the chunk, and return the data
   * - we'll return `null` if the content-type is invalid or if CAI data does not exist
   *
   * @param url - The URL to fetch
   */
  async inspect(url: string): Promise<Blob | null> {
    dbg('Inspecting', url);
    let res: Response | undefined;
    let contentType: string | null = null;
    const shouldInspect = this.#options.inspectSize > 0;

    if (shouldInspect) {
      try {
        res = await Downloader.download(url, {
          rangeEnd: this.#options.inspectSize,
        });
        contentType = res.headers.get('content-type');
        if (res.status === 206) {
          dbg(
            'Successfully downloaded first part of url (supports range requests)',
            url,
            res,
          );
        } else {
          dbg(
            'Successfully downloaded complete url (server does not support range requests)',
            url,
            res,
          );
        }
      } catch (err) {
        dbg(
          'Attempting to download with a range header failed, trying again without one',
          err,
        );
      }
    } else {
      dbg('inspectSize of 0 given, downloading entire file');
    }

    if (!res) {
      try {
        // We don't have an initial response due to not doing the initial range download
        // Do a HEAD request to determine if we should download the entire file based on content-type
        const headRes = await Downloader.download(url, {
          fetchConfig: {
            method: 'HEAD',
          },
        });
        contentType = headRes.headers.get('content-type');
        dbg('Performed HEAD request and got content-type', url, contentType);
      } catch (err) {
        dbg(
          'HEAD request to check for content-type failed, downloading entire file',
        );
      }
    }

    if (contentType && !Validator.isValidMimeType(contentType)) {
      dbg('Resource has invalid content type', contentType);
      throw new InvalidMimeTypeError(contentType);
    }

    if (!res) {
      res = await Downloader.download(url);
    }

    const blob = await res.blob();

    if (!shouldInspect) {
      dbg(`Skipping inspection due to disabling the config`);
      return blob;
    }

    const buffer = await blob.arrayBuffer();
    const { found } = await this.#validator.scanChunk(buffer);
    if (found) {
      dbg('C2PA metadata found for url', url);
    } else {
      dbg('No C2PA metadata found for url', url);
      return null;
    }

    // We don't get a full content-length back from the server when doing a range
    // request, so we need to guess based on the response. We should continue if
    // we get a 206 back from the server instead of a 200, and that equals the `inspectSize`.
    // In that case, changes are the second request will yield more data, unless the image
    // size is exactly the `inspectSize`, and we get no data back.
    const shouldContinue =
      res.status === 206 && buffer.byteLength === this.#options.inspectSize + 1;
    if (shouldContinue) {
      dbg('Continuing download at offset %d', this.#options.inspectSize);
      const tailRes = await Downloader.download(url, {
        // We need to start the range at the next byte
        rangeStart: this.#options.inspectSize + 1,
      });
      const tailBuffer = await tailRes.arrayBuffer();
      dbg(
        'Successfully downloaded rest of file (%d bytes)',
        tailBuffer.byteLength,
      );
      return new Blob([buffer, tailBuffer], { type: blob.type });
    }

    return blob;
  }

  /**
   * Fetches a JSON payload and caches it, using the requested URL as the key
   *
   * @param url - The URL to fetch and cache
   */
  static async cachedGetJson<T = any>(url: string): Promise<T> {
    if (!this.#responseCache.get(url)) {
      cacheDbg('No cache found for %s', url);
      const res = await Downloader.download(url, {
        fetchConfig: {
          credentials: 'omit',
          headers: {
            Accept: 'application/json',
          },
        },
      });
      const data = await res.json();
      cacheDbg('Saving data for %s', url, data);
      this.#responseCache.set(url, data);
    }

    cacheDbg('Returning cached data for %s', url);
    return this.#responseCache.get(url);
  }
}
