/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { LitElement } from 'lit';
import { Configurable } from './configurable';
import { PanelSection, PanelSectionConfig } from './panelSection';

type Constructor<T = {}> = new (...args: any[]) => T;

interface ConfigurablePanelSectionConfig<DataType>
  extends PanelSectionConfig<DataType> {
  config: Record<string, any>;
}

export const ConfigurablePanelSection = <
  T extends Constructor<LitElement>,
  DataType,
>(
  superClass: T,
  config: ConfigurablePanelSectionConfig<DataType>,
) => Configurable(PanelSection(superClass, config), config.config);
