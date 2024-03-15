/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2ManifestStore } from 'c2pa';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Configurable } from '../../mixins/configurable';
import { baseSectionStyles, defaultStyles } from '../../styles';
import defaultStringMap from './ProducedBy.str.json';

import { hasChanged } from '../../utils';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-produced-by': ProducedBy;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-produced-by': any;
    }
  }
}

interface ProducedByConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: ProducedByConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-produced-by')
export class ProducedBy extends Configurable(LitElement, defaultConfig) {
  static get styles() {
    return [defaultStyles, baseSectionStyles];
  }

  @property({
    type: Object,
    hasChanged,
  })
  data: string | undefined;

  render() {
    return html` <cai-panel-section
      helpText=${this._config.stringMap['produced-by.helpText']}
    >
      <div slot="header">${this._config.stringMap['produced-by.header']}</div>
      <div slot="content">${this.data}</div>
    </cai-panel-section>`;
  }
}
