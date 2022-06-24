/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Manifest as ToolkitManifest } from '@contentauth/toolkit';
import { AssertionAccessor, createAssertionAccessor } from './assertions';
import { C2paConfig } from './c2pa';
import { createIngredient, Ingredient } from './ingredient';
import { ManifestMap } from './manifestStore';
import { DefaultResolvers, defaultResolvers } from './resolvers/defaults';
import { Disposable, Serializable, SerializableValue } from './lib/types';
import pProps from 'p-props';

export interface BaseManifest<T extends ManifestResolvers = {}> {
  assertions: AssertionAccessor;
  ingredients?: Ingredient<T>[];
  parent?: Manifest<T>;
  data: ToolkitManifest;
}

export type Manifest<T extends ManifestResolvers = {}> = BaseManifest<T> &
  Serializable<Promise<SerializableManifest<T>>> &
  ResolvedProperties<T & DefaultResolvers>;

interface SerializableBaseManifest {
  ingredients?: ReturnType<Ingredient['asSerializable']>['data'][];
  parent?: string;
  [key: string]: any;
}

export type SerializableManifestData<T extends ManifestResolvers = {}> =
  SerializableBaseManifest &
    ResolvedSerializableProperties<T & DefaultResolvers>;

export type SerializableManifest<T extends ManifestResolvers = {}> = Disposable<
  SerializableManifestData<T>
>;

/**
 * Creates a facade object with convenience methods over manifest data returned from the toolkit.
 *
 * @param config C2pa configuration object
 * @param manifestData Raw manifest data returned by the toolkit
 * @param manifests A map of previously-created manifest objects to be provided to ingredients. Must contain any manifest referenced by this manifest's ingredients.
 */
export function createManifest<T extends ManifestResolvers>(
  config: C2paConfig<T>,
  manifestData: ToolkitManifest,
  manifests: ManifestMap<T>,
): Manifest<T> {
  const ingredients = manifestData.ingredients.map((ingredientData) =>
    createIngredient(
      ingredientData,
      ingredientData.active_manifest
        ? manifests[ingredientData.active_manifest]
        : undefined,
    ),
  );

  const assertions = createAssertionAccessor(manifestData.assertions);

  // Forgive me, TypeScript. I'll take it from here.
  const finalResolvers = {
    ...defaultResolvers,
    ...config.manifestResolvers,
  } as ManifestResolvers;

  const manifest = {
    assertions,
    ingredients,

    // Set externally in manifestStore.ts
    // @TODO: is there a better way?
    parent: undefined,

    data: manifestData,

    async asSerializable(serializeConfig: any) {
      return createSerializableManifest(this, finalResolvers, serializeConfig);
    },
  } as Manifest<T>;

  applyResolvers(manifest, finalResolvers);

  return manifest;
}

async function createSerializableManifest<T extends ManifestResolvers>(
  manifest: Manifest<T>,
  resolvers: ManifestResolvers,
  config: any,
): Promise<SerializableManifest<T>> {
  const disposers: Disposable['dispose'][] = [];

  const serializableIngredients = manifest.ingredients?.map((ingredient) => {
    const { data, dispose } = ingredient.asSerializable();
    disposers.push(dispose);
    return data;
  });

  const serializableManifest = {
    ingredients: serializableIngredients ?? [],
    parent: manifest.parent?.label,
    ...(await pProps(resolvers, (resolver) =>
      isResolverObject(resolver)
        ? resolver.getSerializable(
            manifest,
            (disposerFn) => {
              disposers.push(disposerFn);
            },
            config,
          )
        : resolver(manifest),
    )),
  } as SerializableManifestData<T>;

  return {
    data: serializableManifest,
    dispose: () => disposers.forEach((disposer) => disposer()),
  };
}

type ManifestPropertyResolverFn<T = any> = (manifest: BaseManifest) => T;

type SerializableManifestPropertyResolverFn = (
  manifest: BaseManifest,
  onDispose: (disposer: Disposable['dispose']) => void,
  config: any,
) => Promise<SerializableValue> | SerializableValue;

interface ManifestPropertyResolverObject {
  get: ManifestPropertyResolverFn;
  getSerializable: SerializableManifestPropertyResolverFn;
}

export type ManifestResolver =
  | ManifestPropertyResolverFn<SerializableValue>
  | ManifestPropertyResolverObject;

export interface ManifestResolvers {
  [key: string]: ManifestResolver;
}

// Converts a map of resolver functions / objects into their return types
export type ResolvedProperties<T extends ManifestResolvers> = {
  [P in keyof T]: ResolvedProperty<T[P]>;
};

// Converts a map of resolver functions / objects into their serializable return types
export type ResolvedSerializableProperties<T extends ManifestResolvers> = {
  [P in keyof T]: Awaited<ResolvedProperty<T[P], 'getSerializable'>>;
};

type ResolvedProperty<
  T extends ManifestResolver,
  R extends keyof ManifestPropertyResolverObject = 'get',
> = T extends ManifestPropertyResolverFn
  ? ReturnType<T> // resolve the property by inferring its return type
  : T extends ManifestPropertyResolverObject // if this property is a resolver object:
  ? ReturnType<T[R]> // infer the return type of one of its functions ('get' by default)
  : never; // else, this property does not exist

/**
 * Applies provided resolver functions as additional properties on the manifest object.
 *
 * @param manifest Manifest to be modified
 * @param resolvers Map of resolvers to apply to the provided manifest
 */
function applyResolvers<T extends ManifestResolvers>(
  manifest: Manifest<any>,
  resolvers: T,
): void {
  Object.entries(resolvers).forEach(([key, resolver]) => {
    Object.defineProperty(manifest, key, {
      enumerable: true,
      get: () => {
        return isResolverObject(resolver)
          ? resolver.get(manifest)
          : resolver(manifest);
      },
    });
  });
}

function isResolverObject(
  resolver: ManifestResolver,
): resolver is ManifestPropertyResolverObject {
  return !(typeof resolver === 'function');
}
