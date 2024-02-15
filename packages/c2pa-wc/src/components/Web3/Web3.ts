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
import './Web3Pill';

var hidden = false;

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

export interface Web3Config {
  stringMap: Record<string, string>;
}

const defaultConfig: Web3Config = {
  stringMap: defaultStringMap,
};

function truncateAdress(address: string[]) {
  return `${address[0].slice(0, 6)}...${address[0].slice(-4)}`;
}

function handleClick(map: {}, address: string) {
  navigator.clipboard.writeText(address);
  hidden = false;
  setTimeout(() => {
    hidden = true;
  }, 800);
}
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
          gap: 7px;
          list-style: none;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        .web3-list-item {
          padding-left: 10px;
          display: flex;
          align-items: center;
        }

        .web3-pill {
          background-color: #e5e5e5;
          padding: 3px 5px 3px 5px;
          border-radius: 20px;
          border: none;
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
                <cai-web3-pill
                  key="solana"
                  address=${this._data?.solana}
                  hidden="false"
                >
                </cai-web3-pill>
              `
            : nothing}
          ${this._data?.ethereum
            ? html`
                <cai-web3-pill
                  key="ethereum"
                  address=${this._data?.ethereum}
                  hidden="false"
                >
                </cai-web3-pill>
              `
            : nothing}
        </ul>
      </div>
    </cai-panel-section>`);
  }
}
