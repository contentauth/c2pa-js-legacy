/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ResourceReference, ResourceStore } from '@contentauth/toolkit';

export function getResourceAsBlob(
  store: ResourceStore,
  reference: ResourceReference,
) {
  const { format: type, identifier } = reference;
  const data = store.resources?.[identifier];

  if (data) {
    return new Blob([Uint8Array.from(data)], {
      type,
    });
  }

  return null;
}
