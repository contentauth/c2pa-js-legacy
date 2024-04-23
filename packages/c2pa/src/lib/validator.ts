/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import detectorWasm from '@contentauth/detector/pkg/detector_bg.wasm';
import debug from 'debug';
import { InvalidInputError } from './error';
import { SdkWorkerPool } from './poolWrapper';

const dbg = debug('c2pa:Validator');

/**
 * Handles validation of input before processing it for C2PA metadata
 *
 * @public
 */
export class Validator {
  static readonly VALID_MIME_TYPES = [
    'application/c2pa',
    'application/mp4',
    'application/pdf',
    'application/x-c2pa-manifest-store',
    'audio/mp4',
    'audio/mpeg',
    'audio/vnd.wave',
    'audio/wav',
    'audio/x-wav',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
    'image/x-adobe-dng',
    'image/x-sony-arw',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];

  static readonly DEFAULT_DETECTION_LENGTH = 65535;

  #pool: SdkWorkerPool;

  readonly #detectionLength: number;

  constructor(pool: SdkWorkerPool, detectionLength: number | undefined) {
    this.#pool = pool;
    this.#detectionLength =
      detectionLength ?? Validator.DEFAULT_DETECTION_LENGTH;
  }

  /**
   * Sanitizes mime type strings for proper file type checking
   *
   * @remarks
   * We need to do this since some Content-Types can coming in such as `image/jpeg; charset=utf-8`.
   *
   * @param type - The mime type of the asset
   */
  static sanitizeMimeType(type: string) {
    return type.split(';')[0];
  }

  /**
   * Checks if the asset has a mime type that is compatible with C2PA
   *
   * @param type - The mime type of the asset to check
   */
  static isValidMimeType(type: string) {
    return this.VALID_MIME_TYPES.includes(this.sanitizeMimeType(type));
  }

  /**
   * Scans an individual binary chunk for a C2PA metadata marker
   *
   * @param chunk - the chunk to check for the metadata marker
   */
  async scanChunk(chunk: ArrayBuffer) {
    const wasm = await detectorWasm();

    dbg('Scanning buffer for C2PA marker with length %d', chunk.byteLength);
    // TODO: Add support for transferable objects
    const result = await this.#pool.scanInput(wasm, chunk);
    dbg('Scanned buffer and got result', result);
    return result;
  }

  /**
   * Scans a buffer/Blob for a C2PA metadata marker
   *
   * @remarks
   * This will automatically handle both a `ArrayBuffer` or a `Blob` as input
   * and automatically decide if it should be passed as a transferable object or not.
   * It will then pass it to `scanChunk` for the actual processing.
   *
   * @param input - The buffer/blob to scan
   */
  async scanInput(input: ArrayBuffer | Blob) {
    let buffer: ArrayBuffer | null = null;

    if (input instanceof ArrayBuffer) {
      buffer = input;
    } else if (input instanceof Blob) {
      // Only send this as a transferable object if we are extracting an array
      // buffer from a blob, since we won't be re-using this buffer anywhere else
      const fullBuffer = await input.arrayBuffer();
      if (this.#detectionLength > 0) {
        buffer = fullBuffer.slice(0, this.#detectionLength);
      } else {
        buffer = fullBuffer;
      }
    }

    if (!buffer) {
      throw new InvalidInputError();
    }

    return this.scanChunk(buffer);
  }
}
