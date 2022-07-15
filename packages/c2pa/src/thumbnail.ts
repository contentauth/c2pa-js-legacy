/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Thumbnail as ToolkitThumbnail } from '@contentauth/toolkit';
import { sha } from './lib/hash';
import { BlobUrl, createObjectUrlFromBlob } from './objectUrl';

export interface Thumbnail {
  blob?: Blob;
  contentType: string;
  hash?: () => Promise<string>;
  getUrl: () => BlobUrl;
}

/**
 * Creates a facade object with convenience methods over thumbnail data returned from the toolkit.
 *
 * @param thumbnailData Raw thumbnail data returned by the toolkit
 */
export function createThumbnail(
  thumbnailData: ToolkitThumbnail,
): Thumbnail | null {
  if (!thumbnailData) {
    return null;
  }

  const [type, data] = thumbnailData;

  const blob = new Blob([Uint8Array.from(data)], {
    type,
  });

  return {
    blob,
    contentType: type,

    hash: () => sha(blob),

    getUrl: () => createObjectUrlFromBlob(blob),
  };
}

export function createThumbnailFromBlob(
  blob: Blob,
  contentType: string,
): Thumbnail {
  return {
    blob,
    contentType,

    hash: () => sha(blob),

    getUrl: () => createObjectUrlFromBlob(blob),
  };
}

export function createThumbnailFromUrl(
  url: string,
  label: string,
  contentType: string,
): Thumbnail {
  return {
    contentType,
    getUrl: () => ({
      data: { url },
      dispose: () => {},
    }),
  };
}
