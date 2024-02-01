/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ConfigurablePanelSection } from '../../mixins/configurablePanelSection';
import { baseSectionStyles, defaultStyles } from '../../styles';
import defaultStringMap from './AIToolUsed.str.json';

import { GenerativeInfo } from 'c2pa';
import '../../../assets/svg/monochrome/generic-info.svg';
import '../Icon';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-ai-tool': AIToolUsed;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-ai-tool': any;
    }
  }
}

export interface AIToolUsedConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: AIToolUsedConfig = {
  stringMap: defaultStringMap,
};
export function selectGenerativeSoftwareAgents(
  generativeInfo: GenerativeInfo[],
) {
  const softwareAgents = [
    ...new Set(
      generativeInfo.map((assertion) => {
        return assertion?.softwareAgent;
      }),
    ),
  ];
  //if there are undefined software agents remove them from the array

  return softwareAgents.filter((element) => typeof element !== 'undefined');
}

@customElement('cai-ai-tool')
export class AIToolUsed extends ConfigurablePanelSection(LitElement, {
  dataSelector: (manifestStore) =>
    manifestStore?.generativeInfo
      ? selectGenerativeSoftwareAgents(manifestStore?.generativeInfo)
      : null,
  config: defaultConfig,
}) {
  static get styles() {
    return [defaultStyles, baseSectionStyles];
  }

  render() {
    return this.renderSection(html` <cai-panel-section
      helpText=${this._config.stringMap['produced-by.helpText']}
    >
      <div slot="header">${this._config.stringMap['ai-tool-used.header']}</div>
      <div slot="content">${this._data}</div>
    </cai-panel-section>`);
  }
}
