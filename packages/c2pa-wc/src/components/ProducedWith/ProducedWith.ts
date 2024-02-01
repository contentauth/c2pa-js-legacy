/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2ManifestStore } from 'c2pa';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ConfigurablePanelSection } from '../../mixins/configurablePanelSection';
import { baseSectionStyles, defaultStyles } from '../../styles';
import defaultStringMap from './ProducedWith.str.json';

import '../Icon';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-produced-with': ProducedWith;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-produced-with': any;
    }
  }
}

export interface ProducedWithConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: ProducedWithConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-produced-with')
export class ProducedWith extends ConfigurablePanelSection(LitElement, {
  dataSelector: (manifestStore) => manifestStore.claimGenerator,
  config: defaultConfig,
}) {
  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-produced-with-content {
          display: flex;
          align-items: center;
        }

        .section-produced-with-beta {
          margin-left: 24px;
          color: var(--cai-secondary-color);
        }
      `,
    ];
  }

  render() {
    return this.renderSection(html` <cai-panel-section
      helpText=${this._config.stringMap['produced-with.helpText']}
    >
      <div slot="header">${this._config.stringMap['produced-with.header']}</div>
      <div slot="content">
        <div class="section-produced-with-content">
          <cai-icon source="${this._data?.product}"></cai-icon>
          <span> ${this._data?.product} </span>
        </div>
        ${this.manifestStore?.isBeta
          ? html`<div class="section-produced-with-beta">
              ${this._config.stringMap['produced-with.beta']}
            </div>`
          : null}
      </div>
    </cai-panel-section>`);
  }
}
