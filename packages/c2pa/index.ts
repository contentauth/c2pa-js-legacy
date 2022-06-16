/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

export {
  createC2pa,
  generateVerifyUrl,
  C2paReadResult,
  C2paConfig,
  C2pa,
} from './src/c2pa';
export {
  ManifestStore,
  SerializableManifestStoreData,
} from './src/manifestStore';
export {
  Manifest,
  SerializableManifestData,
  ManifestResolvers,
} from './src/manifest';
export { Ingredient, SerializableIngredientData } from './src/ingredient';
export { Source, C2paSourceType } from './src/source';
export { AssertionAccessor, ExtendedAssertions } from './src/assertions';
export { Thumbnail } from './src/thumbnail';

export type {
  GetManifestType,
  GetIngredientType,
  Serializable,
  Disposable,
} from './src/lib/types';

import * as resolvers from './src/resolvers';
export { resolvers };
