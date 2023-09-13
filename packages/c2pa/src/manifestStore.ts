/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  Manifest as ToolkitManifest,
  ManifestStore as ToolkitManifestStore,
  ValidationStatus,
} from '@contentauth/toolkit';
import debug from 'debug';
import traverse from 'traverse';
import { Manifest, createManifest } from './manifest';

export interface ManifestStore {
  /**
   * Map of all manifests included in the manifest store
   */
  manifests: ManifestMap;

  /**
   * The active manifest in the manifest store
   */
  activeManifest: Manifest;

  /**
   * List of validation errors
   */
  validationStatus: ValidationStatus[];
}

export interface ManifestMap {
  [key: string]: Manifest;
}

type ManifestStackData = {
  data: ToolkitManifest;
  label: string;
};

const dbg = debug('c2pa:manifestStore');

const SERDE_ARBITRARY_PRECISION_KEY = '$serde_json::private::Number';

/**
 * Since the integration of #107 (specifically adding `arbitrary_precision`),
 * some JSON values may have a `SERDE_ARBITRARY_PRECISION_KEY` that signals
 * that the string value is really a number. We should either change this to a
 * number or BigInt so that we can work with this without downstream clients
 * having to deal with the implementation details.
 *
 * @param manifestStoreData
 */
function parseJsonTypeHints(
  manifestStoreData: ToolkitManifestStore,
): ToolkitManifestStore {
  return traverse(manifestStoreData).forEach(function (x) {
    if (
      typeof x === 'object' &&
      x.constructor === Object &&
      x.hasOwnProperty(SERDE_ARBITRARY_PRECISION_KEY)
    ) {
      const val = x[SERDE_ARBITRARY_PRECISION_KEY];
      if (val > Number.MAX_SAFE_INTEGER) {
        this.update(BigInt(val));
      } else {
        this.update(parseInt(val, 10));
      }
    }
  });
}

/**
 * Creates a facade object with convenience methods over manifest store data returned from the toolkit.
 *
 * @param config C2pa configuration object
 * @param manifestStoreData Manifest store data returned by the toolkit
 */
export function createManifestStore(
  manifestStoreData: ToolkitManifestStore,
): ManifestStore {
  const manifests = createManifests(parseJsonTypeHints(manifestStoreData));

  return {
    manifests,
    activeManifest: manifests[manifestStoreData.active_manifest],
    validationStatus: manifestStoreData?.validation_status ?? [],
  };
}

/**
 * Ensures manifests are resolved in the correct order to build the "tree" of manifests and their ingredients.
 *
 * @param manifestStoreData
 * @returns
 */
function createManifests(manifestStoreData: ToolkitManifestStore) {
  const {
    manifests: toolkitManifests,
    active_manifest: toolkitActiveManifestId,
  } = manifestStoreData;
  dbg('Received manifest store from toolkit', manifestStoreData);

  // Perform a post-order traversal of the manifest tree (leaves-to-root) to guarantee that a manifest's ingredient
  // manifests are already available when it is created.

  const stack: ManifestStackData[] = [
    {
      data: toolkitManifests[toolkitActiveManifestId],
      label: toolkitActiveManifestId,
    },
  ];
  const postorderManifests: ManifestStackData[] = [];

  while (stack.length) {
    const current = stack.pop()!;
    postorderManifests.unshift(current);

    const { data: currentManifest } = current;

    currentManifest?.ingredients?.forEach(({ active_manifest: manifestId }) => {
      if (manifestId) {
        if (manifestStoreData.manifests[manifestId]) {
          stack.push({
            data: manifestStoreData.manifests[manifestId],
            label: manifestId,
          });
        } else {
          dbg('No manifest found for id', manifestId);
        }
      }
    });
  }

  const orderedManifests = postorderManifests.reduce(
    (manifests, stackManifestData) => {
      const { data: manifestData, label } = stackManifestData;
      dbg('Creating manifest with data', manifestData);

      const manifest = createManifest(manifestData, manifests);
      manifests[label] = manifest;
      return manifests;
    },
    {} as ManifestMap,
  );

  const manifestStack = [orderedManifests[toolkitActiveManifestId]];

  // Perform an in-order traversal of the manifest tree to set 'parent' values of ingredient manifests
  while (manifestStack.length) {
    const currentManifest = manifestStack.pop()!;

    currentManifest.ingredients?.forEach(({ manifest }) => {
      if (manifest) {
        const selectedManifest = manifest;
        selectedManifest.parent = currentManifest;
        manifestStack.push(selectedManifest);
      }
    });
  }

  return orderedManifests;
}
