/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Action, C2paActionsAssertion } from '@contentauth/toolkit';
import debug from 'debug';
import compact from 'lodash/fp/compact';
import flow from 'lodash/fp/flow';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import get from 'lodash/get';
import mapKeys from 'lodash/mapKeys';
import merge from 'lodash/merge';
import * as locales from '../../i18n/index';
import { Downloader } from '../lib/downloader';
import { Manifest } from '../manifest';

const dbg = debug('c2pa:selector:editsAndActivity');

const translations = mapKeys(locales as Record<string, any>, (_, key) =>
  key.replace('_', '-'),
);

interface AdobeDictionaryAssertionData {
  url: string;
}

declare module '../assertions' {
  interface ExtendedAssertions {
    'adobe.dictionary': AdobeDictionaryAssertionData;
    'com.adobe.dictionary': AdobeDictionaryAssertionData;
  }
}

const DEFAULT_LOCALE = 'en-US';
const UNCATEGORIZED_ID = 'UNCATEGORIZED';

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

export type IconVariant = 'light' | 'dark';

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
 * Gets a list of translations for the requested locale. Any missing translations in other locales
 * will be filled in with entries from the DEFAULT_LOCALE.
 *
 * @param locale - BCP-47 locale code (e.g. `en-US`, `fr-FR`) to request localized strings, if available
 */
function getTranslationsForLocale(locale: string = DEFAULT_LOCALE) {
  const defaultSet = (translations[DEFAULT_LOCALE]?.selectors
    ?.editsAndActivity ?? {}) as Record<string, ActionDictionaryItem>;
  const requestedSet = (translations[locale]?.selectors?.editsAndActivity ??
    {}) as Record<string, ActionDictionaryItem>;

  if (locale === DEFAULT_LOCALE) {
    return defaultSet;
  }

  return merge({}, defaultSet, requestedSet);
}

/**
 * Gets a list of categorized actions, derived from the provided manifest's `c2pa.action` assertion
 * and a dictionary assertion, if available. If a dictionary is incuded, this function will initiate
 * an HTTP request to fetch the dictionary data.
 *
 * @param manifest - Manifest to derive data from
 * @param locale - BCP-47 locale code (e.g. `en-US`, `fr-FR`) to request localized strings, if available
 * @param iconVariant - Requests icon variant (e.g. `light`, `dark`), if available
 * @returns
 */
export async function selectEditsAndActivity(
  manifest: Manifest,
  locale: string = DEFAULT_LOCALE,
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

  return getC2paCategorizedActions(actionAssertion, locale);
}

async function getPhotoshopCategorizedActions(
  actions: Action[],
  dictionaryUrl: string,
  locale = DEFAULT_LOCALE,
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

interface AdobeAction extends Action {
  parameters: {
    name: never;
    'com.adobe.icon': string;
    description: string;
  };
}

function getIconFromActionParameters(
  actions: AdobeAction[],
): Record<string, string> {
  return actions.reduce((acc, { action, parameters }) => {
    if (!acc.hasOwnProperty(action)) {
      acc[action] = parameters?.['com.adobe.icon'];
    }
    return acc;
  }, {} as Record<string, string>);
}

function getC2paCategorizedActions(
  actionsAssertion: C2paActionsAssertion,
  locale: string = DEFAULT_LOCALE,
): TranslatedDictionaryCategory[] {
  console.log('actionsAssertion', actionsAssertion);
  const actions = actionsAssertion.data.actions;
  const translations = getTranslationsForLocale(locale);
  const overrides = actionsAssertion.data.metadata?.localizations ?? [];
  console.log('overrides', overrides);
  const icons = getIconFromActionParameters(actions as AdobeAction[]);
  const uniqueActionLabels = actions
    ?.map(({ action }) => action)
    .filter(
      (val, idx, self) =>
        translations.hasOwnProperty(val) && self.indexOf(val) === idx,
    ) // de-dupe && only keep valid c2pa actions
    .sort()
    .map((action) => ({
      id: action,
      icon: icons[action],
      ...translations[action],
    }));

  console.log('uniqueActionLabels', uniqueActionLabels);

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
