/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ResourceReference, ResourceStore } from '@contentauth/toolkit';
import { sha } from './lib/hash';
import { getResourceAsBlob } from './resources';
export interface BlobUrlData {
  url: string;
}

export type DisposableBlobUrl = BlobUrlData & {
  dispose: () => void;
};

export interface Thumbnail {
  blob?: Blob;
  contentType: string | undefined;
  hash?: () => Promise<string>;
  getUrl: () => DisposableBlobUrl;
}

/**
 * Creates a facade object with convenience methods over thumbnail data returned from the toolkit.
 *
 * @param resourceStore The resource store attached to the ResourceParent
 * @param resourceReference The reference to the resource that provides the thumbnail data
 */
export function createThumbnail(
  resourceStore: ResourceStore,
  resourceReference: ResourceReference,
): Thumbnail | null {
  if (!resourceStore || !resourceReference) {
    return null;
  }

  const blob = getResourceAsBlob(resourceStore, resourceReference);

  if (!blob) {
    return null;
  }

  return {
    blob,
    contentType: blob.type,

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
