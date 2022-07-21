/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import flow from 'lodash/fp/flow';
import compact from 'lodash/fp/compact';
import uniqBy from 'lodash/fp/uniqBy';
import sortBy from 'lodash/fp/sortBy';
import debug from 'debug';
import { Downloader } from '../lib/downloader';
import { createTypedResolvers } from './createTypedResolvers';
import { BaseManifest } from '../manifest';

const dbg = debug('c2pa:resolvers:editsAndActivity');
export interface AdobeDictionaryAssertion {
  url: string;
}
declare module '../assertions' {
  interface ExtendedAssertions {
    'adobe.dictionary': AdobeDictionaryAssertion;
    'com.adobe.dictionary': AdobeDictionaryAssertion;
  }
}

export interface TranslatedDictionaryCategory {
  id: string;
  icon?: string;
  label: string;
  description: string;
}

const UNCATEGORIZED_ID = 'UNCATEGORIZED';

interface ActionDictionaryItem {
  label: string;
  description: string;
}

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
      icon: category.icon?.replace('{variant}', iconVariant),
      label: category.labels[locale],
      description: category.descriptions[locale],
    };
  }
  return null;
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

function getC2paCategorizedActions(
  manifest: BaseManifest<any>,
): TranslatedDictionaryCategory[] | null {
  const actions = manifest.assertions.get('c2pa.actions')?.data.actions;

  if (!actions) {
    return null;
  }

  const uniqueActionLabels = actions
    ?.map(({ action }) => action)
    .filter(
      (val, idx, self) =>
        ACTION_DICTIONARY.hasOwnProperty(val) && self.indexOf(val) === idx,
    ) // de-dupe && only keep valid c2pa actions
    .sort()
    .map((action) => ({
      id: action,
      icon: undefined,
      ...ACTION_DICTIONARY[action],
    }));

  return uniqueActionLabels;
}

async function getPhotoshopCategorizedActions(
  manifest: BaseManifest<any>,
  locale = 'en-US',
  iconVariant: IconVariant = 'dark',
): Promise<TranslatedDictionaryCategory[] | null> {
  const dictionaryUrl = manifest.assertions.get('adobe.dictionary')?.data.url;
  const actions = manifest.assertions.get('c2pa.actions')?.data.actions;

  if (!dictionaryUrl || !actions) return null;

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

async function getCategorizedActions(manifest: BaseManifest<any>) {
  if (manifest.assertions.get('adobe.dictionary')) {
    return getPhotoshopCategorizedActions(manifest);
  }

  return getC2paCategorizedActions(manifest);
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

export const editsAndActivity = createTypedResolvers({
  editsAndActivity: {
    get: (manifest) => getCategorizedActions.bind(null, manifest),
    // @TODO how to handle parameterized calls?
    getSerializable: async (manifest) => getCategorizedActions(manifest) as any,
  },
});

export type EditsAndActivityResolver = typeof editsAndActivity;
