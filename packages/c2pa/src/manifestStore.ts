/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  ManifestStore as ToolkitManifestStore,
  Manifest as ToolkitManifest,
} from '@contentauth/toolkit';
import { C2paConfig } from './c2pa';
import {
  createManifest,
  Manifest,
  ManifestResolvers,
  SerializableManifestData,
} from './manifest';
import { Disposable, Serializable } from './lib/types';
import pProps from 'p-props';
import debug from 'debug';

export interface ManifestStore<T extends ManifestResolvers = {}>
  extends Serializable<Promise<SerializableManifestStore<T>>> {
  manifests: ManifestMap<T>;
  activeManifest: Manifest<T>;
  data: ToolkitManifestStore;
}

export interface SerializableManifestStoreData<
  T extends ManifestResolvers = {},
> {
  manifests: { [key: string]: SerializableManifestData<T> };
  activeManifest: string;
}

type SerializableManifestStore<T extends ManifestResolvers> = Disposable<
  SerializableManifestStoreData<T>
>;

export interface ManifestMap<T extends ManifestResolvers = {}> {
  [key: string]: Manifest<T>;
}

const dbg = debug('c2pa:manifestStore');

/**
 * Creates a facade object with convenience methods over manifest store data returned from the toolkit.
 *
 * @param config C2pa configuration object
 * @param manifestStoreData Manifest store data returned by the toolkit
 */
export function createManifestStore<T extends ManifestResolvers>(
  config: C2paConfig<T>,
  manifestStoreData: ToolkitManifestStore,
): ManifestStore<T> {
  const manifests = createManifests(config, manifestStoreData);

  return {
    manifests,
    activeManifest: manifests[manifestStoreData.activeManifest],
    data: manifestStoreData,

    asSerializable: async (serializeConfig) => {
      const serializableManifests = await pProps(manifests, (manifest) =>
        (manifest as Manifest<T>).asSerializable(serializeConfig),
      );

      const serializableManifestData = Object.entries(
        serializableManifests,
      ).reduce((manifestData, [label, { data }]) => {
        manifestData[label] = data;
        return manifestData;
      }, {} as SerializableManifestStoreData<T>['manifests']);

      return {
        data: {
          manifests: serializableManifestData,
          activeManifest: manifestStoreData.activeManifest,
        },
        dispose: () =>
          Object.values(serializableManifests).forEach(({ dispose }) =>
            dispose(),
          ),
      };
    },
  };
}

/**
 * Ensures manifests are resolved in the correct order to build the "tree" of manifests and their ingredients.
 *
 * @param config
 * @param manifestStoreData
 * @returns
 */
function createManifests<T extends ManifestResolvers>(
  config: C2paConfig<T>,
  manifestStoreData: ToolkitManifestStore,
) {
  const {
    manifests: toolkitManifests,
    activeManifest: toolkitActiveManifestId,
  } = manifestStoreData;
  dbg('Received manifest store from toolkit', manifestStoreData);

  // Perform a post-order traversal of the manifest tree (leaves-to-root) to guarantee that a manifest's ingredient
  // manifests are already available when it is created.
  const stack = [toolkitManifests[toolkitActiveManifestId]];
  const postorderManifests: ToolkitManifest[] = [];

  while (stack.length) {
    const currentManifest = stack.pop()!;
    postorderManifests.unshift(currentManifest);

    currentManifest?.ingredients?.forEach(({ manifestId }) => {
      if (manifestId) {
        if (manifestStoreData.manifests[manifestId]) {
          stack.push(manifestStoreData.manifests[manifestId]);
        } else {
          dbg('No manifest found for id', manifestId);
        }
      }
    });
  }

  const orderedManifests = postorderManifests.reduce(
    (manifests, manifestData) => {
      dbg('Creating manifest with data', manifestData);

      const manifest = createManifest<T>(config, manifestData, manifests);
      manifests[manifestData.label] = manifest;
      return manifests;
    },
    {} as ManifestMap<T>,
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
