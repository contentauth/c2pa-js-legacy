/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Downloader } from './lib/downloader';
import { InvalidMimeTypeError } from './lib/error';
import { Validator } from './lib/validator';
import {
  createThumbnailFromBlob,
  createThumbnailFromUrl,
  Thumbnail,
} from './thumbnail';

export type C2paSourceType = string | Blob | File | HTMLImageElement;

export interface SourceMetadata {
  /**
   * The filename of the original asset, if it exists/can be derived
   */
  filename?: string;
}

export interface Source {
  thumbnail: Thumbnail;
  metadata: SourceMetadata;
  type: string;
  blob: Blob | null;
  arrayBuffer: Blob['arrayBuffer'];
}

/**
 * Creates an object containing data for the image provided to the c2pa object.
 *
 * @param downloader Downloader instance used to inspect/download images from a URL
 * @param input Input provided to the c2pa object
 * @param metadata Any additional metadata for the referenced image
 */
export async function createSource(
  downloader: Downloader,
  input: C2paSourceType,
  metadata?: SourceMetadata,
): Promise<Source> {
  const { blob, metadata: inputMetadata } = await getDataFromInput(
    downloader,
    input,
    metadata ?? {},
  );

  if (!blob) {
    return {
      thumbnail: createThumbnailFromUrl(input as string),
      metadata: { ...inputMetadata, ...metadata },
      type: '',
      blob: null,
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  }

  if (!Validator.isValidMimeType(blob.type))
    throw new InvalidMimeTypeError(blob.type);

  return {
    thumbnail: createThumbnailFromBlob(blob, blob.type),
    metadata: { ...inputMetadata, ...metadata },
    type: blob.type,
    blob: blob,
    arrayBuffer: () => blob.arrayBuffer(),
  };
}

interface InputData {
  blob: Blob | null;
  metadata: SourceMetadata;
}

async function getDataFromInput(
  downloader: Downloader,
  input: C2paSourceType,
  metadata: SourceMetadata,
): Promise<InputData> {
  if (input instanceof Blob) {
    // Handle file/blob inputs
    const finalMetadata = {
      ...metadata,
      filename: input instanceof File ? input.name : undefined,
    };

    return {
      blob: input,
      metadata: finalMetadata,
    };
  } else {
    // handle string / HTMLImageElement inputs
    const url = typeof input === 'string' ? input : input.src;
    const blob = await downloader.inspect(url);

    let path = url;
    try {
      const { pathname } = new URL(url);
      path = pathname;
    } catch (err) {}
    const filename = path.split('/').pop() ?? '';

    return {
      blob,
      metadata: { ...metadata, filename },
    };
  }
}
