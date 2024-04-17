/**
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { default as en_US } from '../../i18n/en-US.json';

const DEFAULT_LOCALE = 'en-US';

const locales: Record<string, Record<string, string>> = {
  'en-US': en_US,
};

export function registerLocale(locale: string, data: Record<string, string>) {
  locales[locale] = data;
}

export function getStringsForLocale(locale: string) {
  return Object.assign(locales[DEFAULT_LOCALE], locales[locale]);
}
