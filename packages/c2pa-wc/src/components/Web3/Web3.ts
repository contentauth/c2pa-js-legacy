/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ConfigurablePanelSection } from '../../mixins/configurablePanelSection';
import { baseSectionStyles, defaultStyles } from '../../styles';
import defaultStringMap from './Web3.str.json';

import '../Icon';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-web3': Web3;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-web3': any;
    }
  }
}

export interface SocialMediaConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: SocialMediaConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-web3')
export class Web3 extends ConfigurablePanelSection(LitElement, {
  dataSelector: (manifestStore) => manifestStore?.web3,
  config: defaultConfig,
}) {
  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .web3-list {
          display: flex;
          flex-direction: column;
          gap: 1 px;
          list-style: none;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        .web3-list-item {
          padding-left: 10 px;
          display: flex;
          align-items: center;
        }
      `,
    ];
  }

  render() {
    return this.renderSection(html`<cai-panel-section>
      <div slot="header">${this._config.stringMap['web3.header']}</div>
      <div slot="content">
        <ul class="web3-list">
          ${this._data?.solana
            ? html`
                <li class="web3-list-item">
                  ${this._config.stringMap['web3.solana']}
                </li>
              `
            : nothing}
        </ul>
      </div>
    </cai-panel-section>`);
  }
}
