/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { useEffect, useState } from 'react';
import { Thumbnail } from 'c2pa';

export function useThumbnailUrl(thumbnail: Thumbnail | undefined) {
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [hash, setHash] = useState<string | undefined>();

  useEffect(() => {
    const computeHash = async () => {
      const thumbnailHash = await thumbnail?.hash?.();
      setHash(thumbnailHash);
    };

    computeHash();
  }, [thumbnail]);

  useEffect(() => {
    let disposeFn = () => {};
    if (thumbnail) {
      const { url, dispose } = thumbnail?.getUrl();
      setBlobUrl(url);
      disposeFn = dispose;
    }

    return disposeFn;
  }, [hash]);

  return blobUrl;
}
