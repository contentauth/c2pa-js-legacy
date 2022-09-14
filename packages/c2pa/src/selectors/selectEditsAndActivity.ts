/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Action } from '@contentauth/toolkit';
import { Manifest } from '../manifest';
import debug from 'debug';
import flow from 'lodash/fp/flow';
import compact from 'lodash/fp/compact';
import uniqBy from 'lodash/fp/uniqBy';
import sortBy from 'lodash/fp/sortBy';
import { Downloader } from '../lib/downloader';

const dbg = debug('c2pa:selector:editsAndActivity');

interface AdobeDictionaryAssertionData {
  url: string;
}

declare module '../assertions' {
  interface ExtendedAssertions {
    'adobe.dictionary': AdobeDictionaryAssertionData;
    'com.adobe.dictionary': AdobeDictionaryAssertionData;
  }
}

const UNCATEGORIZED_ID = 'UNCATEGORIZED';

const ACTION_DICTIONARY: Record<string, ActionDictionaryItem> = {
  'c2pa.color_adjustments': {
    label: 'Color adjustments',
    description: 'Changed tone, saturation, etc.',
  },
  'c2pa.converted': {
    label: 'Converted asset',
    description: 'The format of the asset was changed',
  },
  'c2pa.created': {
    label: 'Secure creation',
    description: "The asset was first created, usually the asset's origin",
  },
  'c2pa.cropped': {
    label: 'Crop adjustments',
    description: 'Outer areas of the asset were removed',
  },
  'c2pa.drawing': {
    label: 'Paint tools',
    description: 'Edited with brushes or eraser tools',
  },
  'c2pa.edited': {
    label: 'Edited',
    description: 'Changes were made to the asset',
  },
  'c2pa.filtered': {
    label: 'Filter effects',
    description: 'Changed appearances with filters, layer styles, etc.',
  },
  'c2pa.opened': {
    label: 'File opened',
    description:
      'An existing file containing one or more assets was opened and used as the starting point for editing',
  },
  'c2pa.orientation': {
    label: 'Position adjustments',
    description: 'Changed position, orientation, or direction',
  },
  'c2pa.placed': {
    label: 'Imported assets',
    description: 'Added images, videos, etc.',
  },
  'c2pa.published': {
    label: 'Published image',
    description: 'Received and distributed image',
  },
  'c2pa.removed': {
    label: 'Asset removed',
    description: 'One or more assets were removed from the file',
  },
  'c2pa.repackaged': {
    label: 'Repackaged asset',
    description: 'Asset was repackaged without being processed',
  },
  'c2pa.resized': {
    label: 'Size adjustments',
    description: 'Changed asset dimensions',
  },
  'c2pa.transcoded': {
    label: 'Processed asset',
    description: 'Processed or compressed an asset to optimize for display',
  },
  'c2pa.unknown': {
    label: 'Other changes',
    description:
      'Made changes not yet categorized by Content Credentials (Beta)',
  },
};

interface ActionDictionaryItem {
  label: string;
  description: string;
}

export interface TranslatedDictionaryCategory {
  id: string;
  icon: string | null;
  label: string;
  description: string;
}

type IconVariant = 'light' | 'dark';

export interface AdobeDictionary {
  categories: {
    [categoryId: string]: AdobeDictionaryCategory;
  };
  actions: {
    [actionId: string]: AdobeDictionaryAction;
  };
}
export interface AdobeDictionaryCategory {
  icon: string;
  labels: {
    [locale: string]: string;
  };
  descriptions: {
    [locale: string]: string;
  };
}

export interface AdobeDictionaryAction {
  labels: {
    [isoLangCode: string]: string;
  };
  category: string;
}

export interface EditCategory {
  id: string;
  icon: string;
  label: string;
  description: string;
}

/**
 * Gets a list of categorized actions, derived from the provided manifest's `c2pa.action` assertion
 * and a dictionary assertion, if available. If a dictionary is incuded, this function will initiate
 * an HTTP request to fetch the dictionary data.
 *
 * @param manifest Manifest to derive data from
 * @param locale BCP-47 locale code (e.g. `en-US`, `fr-FR`) to request localized strings, if available
 * @param iconVariant Requests icon variant (e.g. `light`, `dark`), if available
 * @returns
 */
export async function selectEditsAndActivity(
  manifest: Manifest,
  locale: string = 'en-US',
  iconVariant: IconVariant = 'dark',
): Promise<TranslatedDictionaryCategory[] | null> {
  const dictionaryAssertion =
    manifest.assertions.get('com.adobe.dictionary')[0] ??
    manifest.assertions.get('adobe.dictionary')[0];

  const [actionAssertion] = manifest.assertions.get('c2pa.actions');

  if (!actionAssertion) {
    return null;
  }

  if (dictionaryAssertion) {
    return getPhotoshopCategorizedActions(
      actionAssertion.data.actions,
      dictionaryAssertion.data.url,
      locale,
      iconVariant,
    );
  }

  return getC2paCategorizedActions(actionAssertion.data.actions);
}

async function getPhotoshopCategorizedActions(
  actions: Action[],
  dictionaryUrl: string,
  locale = 'en-US',
  iconVariant: IconVariant = 'dark',
): Promise<TranslatedDictionaryCategory[]> {
  const dictionary = await Downloader.cachedGetJson<AdobeDictionary>(
    dictionaryUrl,
  );

  const categories = processCategories(
    actions.map((action) =>
      translateActionName(
        dictionary,
        // TODO: This should be resolved once we reconcile dictionary definitions
        action.parameters?.name ?? action.action,
        locale,
        iconVariant,
      ),
    ),
  );

  return categories;
}

function getC2paCategorizedActions(
  actions: Action[],
): TranslatedDictionaryCategory[] {
  const uniqueActionLabels = actions
    ?.map(({ action }) => action)
    .filter(
      (val, idx, self) =>
        ACTION_DICTIONARY.hasOwnProperty(val) && self.indexOf(val) === idx,
    ) // de-dupe && only keep valid c2pa actions
    .sort()
    .map((action) => ({
      id: action,
      icon: null,
      ...ACTION_DICTIONARY[action],
    }));

  return uniqueActionLabels;
}

/**
 * Pipeline to convert categories from the dictionary into a structure suitable for the
 * edits and activity web component. This also makes sure the categories are unique and sorted.
 */
const processCategories = flow(
  compact,
  uniqBy<EditCategory>((category) => category.id),
  sortBy((category) => category.label),
);

/**
 * Uses the dictionary to translate an action name into category information
 */
function translateActionName(
  dictionary: AdobeDictionary,
  actionId: string,
  locale: string,
  iconVariant: IconVariant,
): TranslatedDictionaryCategory | null {
  const categoryId = dictionary.actions[actionId]?.category ?? UNCATEGORIZED_ID;
  if (categoryId === UNCATEGORIZED_ID) {
    dbg('Could not find category for actionId', actionId);
  }
  const category = dictionary.categories[categoryId];
  if (category) {
    return {
      id: categoryId,
      icon: category.icon?.replace('{variant}', iconVariant) ?? null,
      label: category.labels[locale],
      description: category.descriptions[locale],
    };
  }
  return null;
}
