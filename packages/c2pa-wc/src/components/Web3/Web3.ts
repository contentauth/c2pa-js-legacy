/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2Web3 } from 'c2pa';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { Localizable } from '../../mixins/localizable';

import { hasChanged } from '../../utils';
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

@customElement('cai-web3')
export class Web3 extends Localizable(LitElement) {
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
      `,
    ];
  }

  @property({
    type: Object,
    hasChanged,
  })
  data: L2Web3 | undefined;

  render() {
    return html`<cai-panel-section>
      <div slot="header">${this.strings['web3.header']}</div>
      <div slot="content">
        <ul class="web3-list">
          ${this.data?.solana && this.data?.solana.length > 0
            ? html`
                <cai-web3-pill
                  key="solana"
                  address=${this.data?.solana}
                  hidden="false"
                  locale=${this.locale}
                >
                </cai-web3-pill>
              `
            : nothing}
          ${this.data?.ethereum && this.data?.ethereum.length > 0
            ? html`
                <cai-web3-pill
                  key="ethereum"
                  address=${this.data?.ethereum}
                  hidden="false"
                  locale=${this.locale}
                >
                </cai-web3-pill>
              `
            : nothing}
        </ul>
      </div>
    </cai-panel-section>`;
  }
}
