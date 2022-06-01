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
  icon: string;
  label: string;
  description: string;
  [key: string]: string;
}

const UNCATEGORIZED_ID = 'UNCATEGORIZED';

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

async function getCategorizedActions(
  manifest: BaseManifest<any>,
  locale = 'en-US',
  iconVariant: IconVariant = 'dark',
): Promise<TranslatedDictionaryCategory[] | null> {
  const dictionaryUrl = manifest.assertions.get('adobe.dictionary')?.url;
  const actions = manifest.assertions.get('c2pa.actions')?.actions;

  if (!dictionaryUrl || !actions) return null;

  const dictionary = await Downloader.cachedGetJson<AdobeDictionary>(
    dictionaryUrl,
  );

  const categories = processCategories(
    actions.map((action) =>
      translateActionName(
        dictionary,
        // TODO: This should be resolved once we reconcile dictionary definitions
        action.parameters.name ?? action.action,
        locale,
        iconVariant,
      ),
    ),
  );

  return categories;
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
    getSerializable: async (manifest) => getCategorizedActions(manifest),
  },
});

export type EditsAndActivityResolver = typeof editsAndActivity;
