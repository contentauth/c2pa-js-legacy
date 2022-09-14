/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Author } from '@contentauth/toolkit';
import { Manifest } from '../manifest';

/**
 * Gets the producer of this manifest, derived from its `stds.schema-org.CreativeWork` assertion, if available
 *
 * @param manifest Manifest to derive data from
 */
export function selectProducer(manifest: Manifest): Author | null {
  const [cwAssertion] = manifest.assertions.get('stds.schema-org.CreativeWork');

  if (!cwAssertion) {
    return null;
  }

  const producer = cwAssertion.data.author?.find(
    (x) => !x.hasOwnProperty('@id'),
  );

  return producer ?? null;
}
