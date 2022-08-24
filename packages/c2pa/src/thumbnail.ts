/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Thumbnail as ToolkitThumbnail } from '@contentauth/toolkit/types';
import { sha } from './lib/hash';
import { Disposable } from './lib/types';
export interface BlobUrlData {
  url: string;
}

type DisposableBlobUrl = Disposable<BlobUrlData>;

export interface Thumbnail {
  blob?: Blob;
  contentType: string | undefined;
  hash?: () => Promise<string>;
  getUrl: () => DisposableBlobUrl;
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

export function createThumbnailFromUrl(url: string): Thumbnail {
  return {
    contentType: undefined,
    getUrl: () => ({
      url,
      dispose: () => {},
    }),
  };
}

function createObjectUrlFromBlob(blob: Blob): DisposableBlobUrl {
  const url = URL.createObjectURL(blob);

  return {
    url,
    dispose: () => URL.revokeObjectURL(url),
  };
}
