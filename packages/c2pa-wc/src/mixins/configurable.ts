/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import merge from 'lodash/merge';
import { hasChanged } from '../utils';

export declare class ConfigurableInterface<
  ConfigType extends Record<string, any>,
> {
  config: Partial<ConfigType>;

  protected _config: ConfigType;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export const Configurable = <
  T extends Constructor<LitElement>,
  ConfigType extends Record<string, any>,
>(
  superClass: T,
  defaultConfig: ConfigType,
) => {
  class ConfigurableMixin extends superClass {
    @property({
      attribute: false,
      hasChanged,
    })
    config: Partial<ConfigType> = {};

    @state()
    protected _config: ConfigType = defaultConfig;

    willUpdate(changed: Map<string, any>) {
      super.willUpdate(changed);
      if (changed.has('config')) {
        this._config = merge({}, defaultConfig, this.config);
      }
    }
  }

  // @TODO: fix casting issue
  return ConfigurableMixin as unknown as Constructor<
    ConfigurableInterface<ConfigType>
  > &
    T;
};
