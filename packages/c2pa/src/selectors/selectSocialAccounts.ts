/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Author } from '@contentauth/toolkit/types';
import { Manifest } from '../manifest';

/**
 * Gets any social accounts associated with the producer of this manifest, derived from its
 * stds.schema-org.CreativeWork` assertion, if available
 *
 * @param manifest Manifest to derive data from
 */
export function selectSocialAccounts(manifest: Manifest): Author[] | null {
  const [cwAssertion] = manifest.assertions.get('stds.schema-org.CreativeWork');

  if (!cwAssertion) {
    return null;
  }

  const socialAccounts = cwAssertion.data.author?.filter((x) =>
    x.hasOwnProperty('@id'),
  );

  return socialAccounts;
}
