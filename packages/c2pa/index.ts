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
export { ManifestStore } from './src/manifestStore';
export { Manifest } from './src/manifest';
export { Ingredient } from './src/ingredient';
export { Source, C2paSourceType } from './src/source';
export { AssertionAccessor, ExtendedAssertions } from './src/assertions';
export { Thumbnail } from './src/thumbnail';

export { selectEditsAndActivity } from './src/selectors/selectEditsAndActivity';
export { selectProducer } from './src/selectors/selectProducer';
export { selectSocialAccounts } from './src/selectors/selectSocialAccounts';

export { createL2Manifest, L2Manifest } from './src/createL2Manifest';
