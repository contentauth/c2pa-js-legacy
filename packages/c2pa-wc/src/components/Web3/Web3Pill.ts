/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { LitElement, css, html } from 'lit';
import { nothing } from 'lit-html';
import { customElement, property } from 'lit/decorators.js';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { Localizable } from '../../mixins/localizable';

const HIDE_DELAY = 800;

declare global {
  interface HTMLElementTagNameMap {
    'cai-web3-pill': Web3Pill;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-web3-pill': any;
    }
  }
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

@customElement('cai-web3-pill')
export class Web3Pill extends Localizable(LitElement) {
  @property({ type: String })
  key = '';

  @property({ type: String })
  address = '';

  @property({ type: Boolean })
  hidden: boolean;

  constructor() {
    super();
    this.hidden = false;
  }

  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .web3-list-item {
          padding-left: 10px;
          display: flex;
          align-items: center;
        }
        .web3-pill {
          background-color: var(--cai-background-pill, #e5e5e5);
          padding: 3px 5px 3px 5px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
        }
        .web3-copied {
          padding-left: 5px;
          color: #666666;
        }
      `,
    ];
  }

  render() {
    return html`
      <li class="web3-list-item">
        <cai-icon source="${this.key}"></cai-icon>
        <button
          class="web3-pill"
          @click=${this.handleClick.bind(this, this.address)}
        >
          ${truncateAddress(this.address)}
        </button>
        ${!this.hidden
          ? html`
              <div class="web3-copied">${this.strings['web3.copied']}</div>
            `
          : nothing}
      </li>
    `;
  }

  handleClick = (address: string) => {
    navigator.clipboard.writeText(address);
    this.hidden = false;
    setTimeout(() => {
      this.hidden = true;
    }, HIDE_DELAY);
  };
}
