/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../../assets/svg/color/info.svg';
import { defaultStyles } from '../../styles';

declare global {
  interface HTMLElementTagNameMap {
    'cai-indicator': Indicator;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-indicator': any;
    }
  }
}

type Variant = 'info-light' | 'info-dark' | 'warning' | 'error';

@customElement('cai-indicator')
export class Indicator extends LitElement {
  /**
   * Image source - if set to undefined/null it will show a broken image icon
   */
  @property({ type: String })
  variant: Variant = 'info-light';

  static get styles() {
    return [
      defaultStyles,
      css`
        :host {
          display: inline-block;
          width: var(--cai-indicator-size, 24px);
          height: var(--cai-indicator-size, 24px);
        }
        .icon {
          --cai-icon-width: var(--cai-indicator-size, 24px);
          --cai-icon-height: var(--cai-indicator-size, 24px);
        }
        .wrapper {
          position: relative;
        }
        .hidden-layer {
          position: absolute;
          left: calc(var(--cai-popover-icon-size, 24px) * -1);
          width: calc(var(--cai-popover-icon-width, 16px) + 10px);
          height: calc(var(--cai-popover-icon-size, 24px) * 3);
          top: calc(var(--cai-popover-icon-size, 24px) * -1);
        }
      `,
    ];
  }

  render() {
    return html`<div class="wrapper">
      <div class="hidden-layer"></div>
      <cai-icon-info class="icon" />
    </div>`;
  }
}
