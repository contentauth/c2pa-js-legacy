/**
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { getStringsForLocale } from '../i18n';

export declare class LocalizableInterface {
  locale: string;

  protected strings: Record<string, string>;
}

type Constructor<T = {}> = new (...args: any[]) => T;

const DEFAULT_LOCALE = 'en-US';

export const Localizable = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class LocalizableMixin extends superClass {
    @property({
      type: String,
    })
    locale = DEFAULT_LOCALE;

    @state()
    protected strings: Record<string, string> = getStringsForLocale(
      this.locale,
    );

    willUpdate(changed: Map<string, any>) {
      super.willUpdate(changed);

      if (changed.has('locale')) {
        this.strings = getStringsForLocale(this.locale);
      }
    }
  }

  return LocalizableMixin as unknown as Constructor<LocalizableInterface> & T;
};
