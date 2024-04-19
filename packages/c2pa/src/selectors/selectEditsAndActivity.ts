/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  ActionV1,
  ActionV2,
  C2paActionsAssertion,
  C2paActionsAssertionV2,
} from '@contentauth/toolkit';
import debug from 'debug';
import each from 'lodash/each';
import compact from 'lodash/fp/compact';
import flow from 'lodash/fp/flow';
import sortBy from 'lodash/fp/sortBy';
import uniqBy from 'lodash/fp/uniqBy';
import mapKeys from 'lodash/mapKeys';
import merge from 'lodash/merge';
import set from 'lodash/set';
import * as locales from '../../i18n/index';
import { Downloader } from '../lib/downloader';
import { icons } from '../lib/icon';
import { Manifest } from '../manifest';

const dbg = debug('c2pa:selector:editsAndActivity');

// Make sure we update the keys to conform to BCP 47 tags
const bcp47Mapping = mapKeys(locales as Record<string, any>, (_, key) =>
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
 * Gets a list of translations for the requested locale from the packaged translation maps.
 * Any missing translations in other locales will be filled in with entries from the DEFAULT_LOCALE.
 *
 * @param locale - BCP-47 locale code (e.g. `en-US`, `fr-FR`) to request localized strings, if available
 */
function getPackagedTranslationsForLocale(locale: string = DEFAULT_LOCALE) {
  const defaultSet = parseLocaleFile(bcp47Mapping[DEFAULT_LOCALE]);
  const requestedSet = parseLocaleFile(bcp47Mapping[locale]);
  if (locale === DEFAULT_LOCALE) {
    return defaultSet;
  }

  return merge({}, defaultSet, requestedSet);
}

interface ValueWithFallback {
  value: string;
  isFallback: boolean;
}

function parseLocaleFile(
  data: Record<string, string> | undefined,
  markAsFallback = false,
) {
  if (!data) {
    return {};
  }

  const map: Record<string, Record<string, ValueWithFallback>> = {};

  Object.entries(data).forEach(([key, value]) => {
    const stringParts = key.split('.');
    // Discard "selectors.editsAndActivity"
    const actionNameAndStringType = stringParts.slice(2);
    // Combine "c2pa" with the action name (e.g. "c2pa.placed")
    const actionName = actionNameAndStringType.slice(0, 2).join('.');
    // Get the type of string (e.g. "label", "description")
    const [type] = actionNameAndStringType.slice(-1);

    if (!map[actionName]) {
      map[actionName] = {
        [type]: {
          value,
          isFallback: markAsFallback,
        },
      };
    } else {
      map[actionName][type] = {
        value,
        isFallback: markAsFallback,
      };
    }
  });

  return map;
}

/**
 * Gets a list of categorized actions, derived from the provided manifest's `c2pa.action` assertion
 * and a dictionary assertion, if available. If a dictionary is incuded, this function will initiate
 * an HTTP request to fetch the dictionary data.
 *
 * @param manifest - Manifest to derive data from
 * @param locale - BCP-47 locale code (e.g. `en-US`, `fr-FR`) to request localized strings, if available
 * @param iconVariant - Requests icon variant (e.g. `light`, `dark`), if available
 * @returns List of translated action categories
 */
export async function selectEditsAndActivity(
  manifest: Manifest,
  locale: string = DEFAULT_LOCALE,
  iconVariant: IconVariant = 'dark',
): Promise<TranslatedDictionaryCategory[] | null> {
  const dictionaryAssertion =
    manifest.assertions.get('com.adobe.dictionary')[0] ??
    manifest.assertions.get('adobe.dictionary')[0];

  const [actionsV2] = manifest.assertions.get('c2pa.actions.v2');
  const [actionsV1] = manifest.assertions.get('c2pa.actions');

  const actionAssertion = actionsV2 ?? actionsV1;

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
  actions: ActionV1[] | ActionV2[],
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

interface AdobeCompatAction extends ActionV1 {
  action: string;
  parameters: {
    name: never;
    'com.adobe.icon': string;
    description: string;
  };
}

type OverrideLocalizationMap = Record<string, ValueWithFallback>;
type Override = Record<string, OverrideLocalizationMap>;

interface OverrideActionMap {
  actions: OverrideLocalizationMap[];
}

/**
 * Gets a list of action categories, derived from the provided manifest's `c2pa.action` assertion.
 * This will also handle translations by providing a locale. This works for standard C2PA action assertion
 * data only.
 *
 * @param actionsAssertion - Action assertion data
 * @param locale - BCP-47 locale code (e.g. `en-US`, `fr-FR`) to request localized strings, if available
 * @returns List of translated action categories
 */
export function getC2paCategorizedActions(
  actionsAssertion: C2paActionsAssertion | C2paActionsAssertionV2,
  locale: string = DEFAULT_LOCALE,
): TranslatedDictionaryCategory[] {
  const actions = actionsAssertion.data.actions as AdobeCompatAction[];
  const translations = getPackagedTranslationsForLocale(locale);
  const overrides = (actionsAssertion.data.metadata?.localizations ??
    []) as Override[];
  const overrideObj: OverrideActionMap = { actions: [] };
  // The spec has an array of objects, and each object can have multiple entries
  // of path keys to overrides, which is why we have to have a nested each.
  each(overrides, (override) => {
    each(override, (translationMap, path) => {
      if (translationMap[locale]) {
        set(overrideObj, path, {
          value: translationMap[locale],
          isFallback: false,
        });
      } else if (translationMap[DEFAULT_LOCALE]) {
        set(overrideObj, path, {
          value: translationMap[DEFAULT_LOCALE],
          isFallback: true,
        });
      }
    });
  });

  const translatedActions = actions.map((action, idx) => {
    const actionOverrides = overrideObj.actions[idx] ?? {};
    const actionTranslations = translations[action.action];

    const iconId: string = action.action;
    return {
      // Include original ID
      id: action.action,
      // Get icon from parameters if they exist
      icon:
        action.parameters?.['com.adobe.icon'] ??
        icons[iconId as keyof typeof icons],
      // Use override if available, if not, then fall back to translation
      label: selectPriorityValueWithFallback(
        actionOverrides?.action,
        actionTranslations?.label,
      ),
      // Use override if available, if not, then fall back to translation
      description:
        selectPriorityValueWithFallback(
          actionOverrides?.description,
          actionTranslations?.description,
        ) ?? action.parameters.description,
    } as TranslatedDictionaryCategory;
  });

  return processCategories(translatedActions);
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

export function registerLocaleForEditsAndActivities(
  bcp47: string,
  data: Record<string, string>,
) {
  bcp47Mapping[bcp47] = data;
}

/**
 * Implements the fallback logic for selecting between two values that may or may not be fallbacks -
 * e.g., a string for a requested locale that was not found in the map.
 *
 * This function will prioritize:
 * 1. value1 if it is defined and not a fallback
 * 2. value2 if it is defined and not a fallback
 * 3. value1 if it is defined
 * 4. value2 if it is defined
 */
function selectPriorityValueWithFallback(
  value1: ValueWithFallback,
  value2: ValueWithFallback,
): string | null {
  return [
    !value1?.isFallback ? value1?.value : null,
    !value2?.isFallback ? value2?.value : null,
    value1?.value ?? null,
    value2?.value ?? null,
  ].filter((val) => !!val)[0];
}
