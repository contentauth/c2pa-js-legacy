/**
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Manifest } from '../manifest';
import { ManifestStore } from '../manifestStore';

export function isHandmade(manifestStore: ManifestStore): boolean {
  const manifests = Object.values(manifestStore.manifests);
  return manifests.length > 0 && manifests.every(isHandmadeManifest);
}

export function isHandmadeManifest(manifest: Manifest): boolean {
  const actionsV2 = manifest.assertions
    .get('c2pa.actions.v2')
    .filter((assertion) => !!assertion);
  const actionsV1 = manifest.assertions
    .get('c2pa.actions')
    .filter((assertion) => !!assertion);

  if (actionsV1.length > 0) {
    return false;
  }

  const actionsHandmade =
    actionsV2.length > 0 &&
    actionsV2.every(({ data }) => {
      const handmadeTemplate = !!data.templates?.find(
        (template) =>
          template.action === '*' &&
          template.digitalSourceType ===
            'http://cv.iptc.org/newscodes/digitalsourcetype/humanEdits',
      );

      return data.allActionsIncluded && handmadeTemplate;
    });

  return actionsHandmade;
}
