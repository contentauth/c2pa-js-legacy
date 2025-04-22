/**
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { pick, reduce } from 'lodash';
import type { Manifest } from '../manifest';

export const ENTRY_KEYS = [
  'cawg.ai_inference',
  'cawg.ai_generative_training',
  'c2pa.ai_inference',
  'c2pa.ai_generative_training',
] as const;
export const USE_VALUES = ['allowed', 'notAllowed', 'constrained'] as const;
export type UseValue = typeof USE_VALUES[number];
export const NOT_ALLOWED_VALUES: UseValue[] = ['notAllowed', 'constrained'];

export type EntryKey = typeof ENTRY_KEYS[number];

type EntryMap = Record<
  EntryKey,
  {
    use: UseValue;
    constraint_info?: string;
  }
>;

declare module '../assertions' {
  interface ExtendedAssertions {
    'cawg.training-mining': {
      entries: EntryMap;
    };
    'c2pa.training-mining': {
      entries: EntryMap;
    };
  }
}

export function selectDoNotTrain(manifest: Manifest): boolean {
  const entries =
    manifest.assertions?.get('cawg.training-mining')[0]?.data?.entries ??
    manifest.assertions?.get('c2pa.training-mining')[0]?.data?.entries ??
    ({} as EntryMap);
  const filteredEntries = pick(entries, ENTRY_KEYS);
  const disallowedActions = reduce<EntryMap, EntryKey[]>(
    filteredEntries,
    (acc, val, entry) => {
      if (NOT_ALLOWED_VALUES.includes(val.use)) {
        return [...acc, entry] as EntryKey[];
      }

      return acc;
    },
    [],
  );

  return disallowedActions.length !== 0;
}
